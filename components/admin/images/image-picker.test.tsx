// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

import { ImagePicker } from './image-picker'
import { ApiError, api } from '@/lib/api-client'
import type { Image as ImageRow } from '@/lib/blog-schema'

// next/image renders a real <img> in jsdom-style envs by default; our mock
// keeps things deterministic for assertions.
vi.mock('next/image', () => ({
  default: ({ src, alt, ...rest }: { src: string; alt: string } & Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img src={src} alt={alt} {...(rest as Record<string, unknown>)} />
  ),
}))

vi.mock('@/lib/api-client', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api-client')>('@/lib/api-client')
  return {
    ...actual,
    api: {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      postMultipart: vi.fn(),
    },
  }
})

const apiGet = api.get as unknown as ReturnType<typeof vi.fn>
const apiPatch = api.patch as unknown as ReturnType<typeof vi.fn>
const apiPostMultipart = api.postMultipart as unknown as ReturnType<typeof vi.fn>

function makeImage(overrides: Partial<ImageRow> = {}): ImageRow {
  return {
    id:         '11111111-1111-1111-1111-111111111111',
    blob_url:   'https://abc.public.blob.vercel-storage.com/images/seed.webp',
    width:      640,
    height:     480,
    alt:        '',
    focal_x:    0.5,
    focal_y:    0.5,
    filename:   'seed.jpg',
    created_at: '2026-05-01T00:00:00.000Z',
    ...overrides,
  }
}

function makeFile(name: string, type: string, sizeBytes: number): File {
  // jsdom's File doesn't honor sizeBytes via the byte-array; but the code
  // checks `file.size` which is computed from the bits passed in. Build
  // the right number of bytes for the size assertion to work.
  const bits = new Uint8Array(sizeBytes)
  return new File([bits], name, { type })
}

describe('<ImagePicker />', () => {
  beforeEach(() => {
    apiGet.mockReset()
    apiPatch.mockReset()
    apiPostMultipart.mockReset()
  })
  afterEach(() => cleanup())

  it('does not render when open=false', () => {
    apiGet.mockResolvedValue({ images: [], nextCursor: null })
    const { container } = render(
      <ImagePicker open={false} mode="cover" onClose={() => {}} onSelect={() => {}} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the dialog with mode-specific title and tabs', async () => {
    apiGet.mockResolvedValue({ images: [], nextCursor: null })
    render(<ImagePicker open mode="og" onClose={() => {}} onSelect={() => {}} />)
    expect(await screen.findByRole('dialog')).toHaveAttribute('aria-modal', 'true')
    expect(screen.getByRole('heading', { name: /choose social/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /library/i })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: /upload/i })).toHaveAttribute('aria-selected', 'false')
  })

  it('Library tab fetches and renders the grid; Select emits onSelect', async () => {
    const img = makeImage({ filename: 'cat.jpg' })
    apiGet.mockResolvedValueOnce({ images: [img], nextCursor: null })
    const onSelect = vi.fn()
    const onClose = vi.fn()
    render(<ImagePicker open mode="cover" onClose={onClose} onSelect={onSelect} />)

    expect(await screen.findByText('cat.jpg')).toBeInTheDocument()
    expect(apiGet).toHaveBeenCalledWith('/api/admin/images')

    fireEvent.click(screen.getByRole('button', { name: /^select$/i }))
    expect(onSelect).toHaveBeenCalledWith(img)
    expect(onClose).toHaveBeenCalled()
  })

  it('shows the empty-library state when no images exist', async () => {
    apiGet.mockResolvedValue({ images: [], nextCursor: null })
    render(<ImagePicker open mode="cover" onClose={() => {}} onSelect={() => {}} />)
    expect(await screen.findByText(/no images yet/i)).toBeInTheDocument()
  })

  it('switches to the Upload tab', async () => {
    apiGet.mockResolvedValue({ images: [], nextCursor: null })
    render(<ImagePicker open mode="inline" onClose={() => {}} onSelect={() => {}} />)
    fireEvent.click(screen.getByRole('tab', { name: /upload/i }))
    expect(screen.getByText(/drag & drop/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /choose file/i })).toBeInTheDocument()
  })

  it('upload happy path: posts multipart, prepends to library, alt-required gate enables Use, PATCHes alt, emits onSelect', async () => {
    apiGet.mockResolvedValue({ images: [], nextCursor: null })
    const fresh = makeImage({ id: 'new-id', filename: 'new.png', alt: '' })
    const patched = makeImage({ id: 'new-id', filename: 'new.png', alt: 'A new image' })
    apiPostMultipart.mockResolvedValue({ image: fresh })
    apiPatch.mockResolvedValue({ image: patched })

    const onSelect = vi.fn()
    const onClose = vi.fn()
    render(<ImagePicker open mode="cover" onClose={onClose} onSelect={onSelect} />)
    fireEvent.click(screen.getByRole('tab', { name: /upload/i }))

    const file = makeFile('new.png', 'image/png', 1024)
    const fileInput = screen.getByRole('button', { name: /choose file/i }).parentElement!
      .querySelector('input[type="file"]') as HTMLInputElement
    Object.defineProperty(fileInput, 'files', { value: [file] })
    fireEvent.change(fileInput)

    await waitFor(() => expect(apiPostMultipart).toHaveBeenCalled())
    const useBtn = await screen.findByRole('button', { name: /^use$/i })
    expect(useBtn).toBeDisabled() // alt empty

    const altInput = screen.getByLabelText(/alt text/i)
    expect(altInput).toHaveAttribute('aria-required', 'true')
    fireEvent.change(altInput, { target: { value: 'A new image' } })
    expect(useBtn).not.toBeDisabled()

    fireEvent.click(useBtn)
    await waitFor(() => expect(apiPatch).toHaveBeenCalledWith('/api/admin/images/new-id', { alt: 'A new image' }))
    expect(onSelect).toHaveBeenCalledWith(patched)
    expect(onClose).toHaveBeenCalled()
  })

  it('upload 415 error: shows plain-language message; file stays selected so Retry works', async () => {
    apiGet.mockResolvedValue({ images: [], nextCursor: null })
    apiPostMultipart.mockRejectedValueOnce(
      new ApiError({ status: 415, code: 'UPLOAD_BAD_TYPE', error: 'Only JPG/PNG/WebP allowed.' }),
    )
    render(<ImagePicker open mode="cover" onClose={() => {}} onSelect={() => {}} />)
    fireEvent.click(screen.getByRole('tab', { name: /upload/i }))

    const file = makeFile('bad.jpg', 'image/jpeg', 1024)
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    Object.defineProperty(fileInput, 'files', { value: [file] })
    fireEvent.change(fileInput)

    await waitFor(() => expect(screen.getByRole('alert').textContent).toMatch(/only jpg|jpg\/png\/webp/i))
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('upload 413 error: surfaces the plain-language size message', async () => {
    apiGet.mockResolvedValue({ images: [], nextCursor: null })
    render(<ImagePicker open mode="cover" onClose={() => {}} onSelect={() => {}} />)
    fireEvent.click(screen.getByRole('tab', { name: /upload/i }))

    // Client-side gate triggers first — 9 MB file is rejected before the
    // multipart POST. (The post is an unused mock to confirm it isn't called.)
    apiPostMultipart.mockResolvedValue({ image: makeImage() })
    const tooBig = makeFile('big.png', 'image/png', 9 * 1024 * 1024)
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    Object.defineProperty(fileInput, 'files', { value: [tooBig] })
    fireEvent.change(fileInput)

    await waitFor(() => expect(screen.getByRole('alert').textContent).toMatch(/under 8mb/i))
    expect(apiPostMultipart).not.toHaveBeenCalled()
  })

  it('drag-drop: hover sets data-drag-active=true; drop kicks off upload', async () => {
    apiGet.mockResolvedValue({ images: [], nextCursor: null })
    apiPostMultipart.mockResolvedValue({ image: makeImage({ id: 'dropped' }) })
    render(<ImagePicker open mode="cover" onClose={() => {}} onSelect={() => {}} />)
    fireEvent.click(screen.getByRole('tab', { name: /upload/i }))

    const dropzone = screen.getByTestId('image-picker-dropzone')
    fireEvent.dragOver(dropzone)
    expect(dropzone).toHaveAttribute('data-drag-active', 'true')
    fireEvent.dragLeave(dropzone, { relatedTarget: document.body })
    expect(dropzone).toHaveAttribute('data-drag-active', 'false')

    const file = makeFile('d.png', 'image/png', 256)
    fireEvent.drop(dropzone, { dataTransfer: { files: [file] } })
    await waitFor(() => expect(apiPostMultipart).toHaveBeenCalled())
  })

  it('paste-from-clipboard: image data item triggers upload', async () => {
    apiGet.mockResolvedValue({ images: [], nextCursor: null })
    apiPostMultipart.mockResolvedValue({ image: makeImage({ id: 'pasted' }) })
    render(<ImagePicker open mode="cover" onClose={() => {}} onSelect={() => {}} />)
    fireEvent.click(screen.getByRole('tab', { name: /upload/i }))

    const file = makeFile('clip.png', 'image/png', 256)
    const items = [{
      kind: 'file' as const,
      type: 'image/png',
      getAsFile: () => file,
    }]
    const event = new Event('paste', { bubbles: true, cancelable: true }) as ClipboardEvent & { clipboardData: DataTransfer }
    Object.defineProperty(event, 'clipboardData', {
      value: {
        items,
        getData: () => '',
      },
    })
    document.dispatchEvent(event)

    await waitFor(() => expect(apiPostMultipart).toHaveBeenCalled())
  })

  it('Esc closes the dialog', async () => {
    apiGet.mockResolvedValue({ images: [], nextCursor: null })
    const onClose = vi.fn()
    render(<ImagePicker open mode="cover" onClose={onClose} onSelect={() => {}} />)
    await screen.findByRole('dialog')
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })
    expect(onClose).toHaveBeenCalled()
  })

  it('Load more uses the cursor from the previous response', async () => {
    apiGet.mockResolvedValueOnce({ images: [makeImage({ id: 'a' })], nextCursor: 'cur-1' })
    apiGet.mockResolvedValueOnce({ images: [makeImage({ id: 'b' })], nextCursor: null })
    render(<ImagePicker open mode="cover" onClose={() => {}} onSelect={() => {}} />)
    const more = await screen.findByRole('button', { name: /load more/i })
    fireEvent.click(more)
    await waitFor(() => expect(apiGet).toHaveBeenCalledWith('/api/admin/images?cursor=cur-1'))
  })
})
