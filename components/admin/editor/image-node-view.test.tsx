// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

import { ImageNodeView } from './node-views'
import type { Image as ImageRow } from '@/lib/blog-schema'

// Mocks. We don't need a full Tiptap runtime — just stub the wrapper so
// the NodeView renders, and stand in for the picker so we can simulate
// user selecting an image without driving the modal.

vi.mock('@tiptap/react', () => ({
  NodeViewWrapper: ({ children, ...rest }: { children: React.ReactNode } & Record<string, unknown>) => (
    <div {...(rest as Record<string, unknown>)}>{children}</div>
  ),
  NodeViewContent: () => null,
}))

vi.mock('next/image', () => ({
  default: ({ src, alt, ...rest }: { src: string; alt: string } & Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img src={src} alt={alt} {...(rest as Record<string, unknown>)} />
  ),
}))

let pickerOnSelectRef: ((img: ImageRow) => void) | null = null
vi.mock('@/components/admin/images/image-picker', () => ({
  ImagePicker: ({ open, onSelect }: { open: boolean; onSelect: (img: ImageRow) => void }) => {
    pickerOnSelectRef = onSelect
    return open ? <div data-testid="picker-mock-open" /> : null
  },
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

import { api, ApiError } from '@/lib/api-client'
const apiPatch = api.patch as unknown as ReturnType<typeof vi.fn>

function makeImage(overrides: Partial<ImageRow> = {}): ImageRow {
  return {
    id:         '11111111-1111-1111-1111-111111111111',
    blob_url:   'https://abc.public.blob.vercel-storage.com/images/seed.webp',
    width:      640,
    height:     480,
    alt:        'A picture',
    focal_x:    0.5,
    focal_y:    0.5,
    filename:   'seed.jpg',
    created_at: '2026-05-01T00:00:00.000Z',
    ...overrides,
  }
}

function renderNode(props: { imageId?: string; alt?: string; caption?: string } = {}) {
  const updateAttributes = vi.fn()
  const node = {
    attrs: {
      id: 'block-1',
      role: null,
      imageId: props.imageId ?? '',
      alt: props.alt ?? '',
      caption: props.caption ?? '',
    },
  } as never
  render(
    <ImageNodeView
      node={node}
      updateAttributes={updateAttributes}
      selected={false}
      // The remaining NodeViewProps fields aren't read by ImageNodeView.
      editor={{} as never}
      decorations={[] as never}
      getPos={() => 0}
      deleteNode={() => {}}
      view={{} as never}
      innerDecorations={[] as never}
      HTMLAttributes={{}}
      extension={{} as never}
    />,
  )
  return { updateAttributes }
}

describe('<ImageNodeView /> — M4 picker swap', () => {
  beforeEach(() => {
    apiPatch.mockReset()
    pickerOnSelectRef = null
  })
  afterEach(() => cleanup())

  it('renders "Choose image" when imageId is empty', () => {
    renderNode()
    expect(screen.getByRole('button', { name: /choose image/i })).toBeInTheDocument()
    expect(screen.queryByTestId('picker-mock-open')).not.toBeInTheDocument()
  })

  it('opens the picker on click and updates imageId attr on select', async () => {
    const { updateAttributes } = renderNode()
    fireEvent.click(screen.getByRole('button', { name: /choose image/i }))
    expect(screen.getByTestId('picker-mock-open')).toBeInTheDocument()
    const incoming = makeImage({ id: 'fresh-id', alt: 'Forest' })
    act(() => {
      pickerOnSelectRef!(incoming)
    })
    expect(updateAttributes).toHaveBeenCalledWith(
      expect.objectContaining({ imageId: 'fresh-id', alt: 'Forest' }),
    )
  })

  it('does NOT overwrite a non-empty alt when picking a new image', async () => {
    const { updateAttributes } = renderNode({ alt: 'Author-supplied alt' })
    fireEvent.click(screen.getByRole('button', { name: /choose image/i }))
    act(() => {
      pickerOnSelectRef!(makeImage({ id: 'fresh-id', alt: 'Generic alt' }))
    })
    expect(updateAttributes).toHaveBeenCalledWith({ imageId: 'fresh-id' })
  })

  it('alt input is aria-required and shows the inline error when empty', () => {
    renderNode()
    const altInput = screen.getByLabelText(/alt text/i)
    expect(altInput).toHaveAttribute('aria-required', 'true')
    expect(screen.getByRole('alert').textContent).toMatch(/alt text required/i)
  })

  it('imageId set + image row resolves: shows preview + Replace button + filename', async () => {
    apiPatch.mockResolvedValueOnce({ image: makeImage({ id: 'live-id', filename: 'live.png' }) })
    renderNode({ imageId: 'live-id', alt: 'A picture' })
    await waitFor(() => expect(screen.getByText(/live\.png/i)).toBeInTheDocument())
    expect(screen.getByRole('button', { name: /replace/i })).toBeInTheDocument()
    expect(screen.queryByText(/alt text required/i)).not.toBeInTheDocument()
  })

  it('stale imageId (404) renders the friendly broken-image fallback with Replace', async () => {
    apiPatch.mockRejectedValueOnce(new ApiError({ status: 404, code: 'NOT_FOUND', error: 'image not found' }))
    renderNode({ imageId: 'gone-id', alt: 'something' })
    await waitFor(() => expect(screen.getByText(/deleted or is unavailable/i)).toBeInTheDocument())
    expect(screen.getByRole('button', { name: /replace/i })).toBeInTheDocument()
  })

  it('typing into the alt input calls updateAttributes', () => {
    apiPatch.mockResolvedValue({ image: makeImage() })
    const { updateAttributes } = renderNode({ imageId: '', alt: '' })
    fireEvent.change(screen.getByLabelText(/alt text/i), { target: { value: 'Mountains at dusk' } })
    expect(updateAttributes).toHaveBeenCalledWith({ alt: 'Mountains at dusk' })
  })
})
