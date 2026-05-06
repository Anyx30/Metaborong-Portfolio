// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

import { EditPostForm } from './edit-post-form'
import { ApiError, api } from '@/lib/api-client'
import type { Post } from '@/lib/blog-schema'

const routerPush = vi.fn()
const routerRefresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: routerPush, refresh: routerRefresh }),
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('@/lib/api-client', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api-client')>('@/lib/api-client')
  return {
    ...actual,
    api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  }
})

// The Tiptap-backed EditorShell is exercised in components/admin/editor/
// editor-shell.test.tsx; the form-level tests stay focused on form
// validation, save flow, status changes, and the delete modal. The mock
// returns a minimal placeholder so happy-dom doesn't spin up a full
// ProseMirror runtime per form test.
vi.mock('@/components/admin/editor/editor-shell', () => ({
  EditorShell: () => null,
}))

const apiPatch = api.patch as unknown as ReturnType<typeof vi.fn>
const apiPost  = api.post  as unknown as ReturnType<typeof vi.fn>

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    slug: 'sample-post',
    title: 'Sample post',
    excerpt: 'Lede.',
    status: 'draft',
    content_json: [
      { id: 'h1', type: 'heading',   data: { text: 'Section', level: 2 } },
      { id: 'p1', type: 'paragraph', data: { text: 'Body text.' } },
    ],
    content_schema_version: 1,
    cover_image_id: null,
    og_image_id: null,
    tags: ['web3'],
    author_name: 'Arnab Ray',
    author_url: null,
    meta_title: null,
    meta_description: null,
    canonical_url: null,
    geo_variants: {},
    ai_readiness_score: null,
    ai_readiness_band: null,
    ai_readiness_report: null,
    ai_readiness_checked_at: null,
    published_at: null,
    created_at: '2026-04-12T08:00:00.000Z',
    updated_at: '2026-04-12T08:00:00.000Z',
    ...overrides,
  }
}

describe('<EditPostForm />', () => {
  beforeEach(() => {
    routerPush.mockReset()
    routerRefresh.mockReset()
    apiPatch.mockReset()
    apiPost.mockReset()
  })
  afterEach(() => cleanup())

  it('renders all primary fields with the initial post values', () => {
    render(<EditPostForm initialPost={makePost()} />)
    expect(screen.getByLabelText(/^title$/i)).toHaveValue('Sample post')
    expect(screen.getByLabelText(/^slug$/i)).toHaveValue('sample-post')
    expect(screen.getByLabelText(/^excerpt$/i)).toHaveValue('Lede.')
    expect(screen.getByLabelText(/^tags$/i)).toHaveValue('web3')
    expect(screen.getByLabelText(/author name/i)).toHaveValue('Arnab Ray')
  })

  it('flags an empty title with an inline error and disables Save', () => {
    render(<EditPostForm initialPost={makePost()} />)
    const titleInput = screen.getByLabelText(/^title$/i)
    fireEvent.change(titleInput, { target: { value: '   ' } })
    const errors = screen.getAllByRole('alert')
    expect(errors.some((el) => /title/i.test(el.textContent ?? ''))).toBe(true)
    expect(screen.getByRole('button', { name: /^save$/i })).toBeDisabled()
  })

  it('rejects slug values that violate the regex (e.g. uppercase, spaces)', () => {
    render(<EditPostForm initialPost={makePost()} />)
    const slugInput = screen.getByLabelText(/^slug$/i)
    fireEvent.change(slugInput, { target: { value: 'Bad Slug' } })
    const errors = screen.getAllByRole('alert')
    expect(
      errors.some((el) => /lowercase alphanumeric|hyphen/i.test(el.textContent ?? '')),
    ).toBe(true)
  })

  it('locks the slug field once status is published (immutable post-publish)', () => {
    render(<EditPostForm initialPost={makePost({ status: 'published', published_at: new Date().toISOString() })} />)
    const slugInput = screen.getByLabelText(/^slug$/i) as HTMLInputElement
    expect(slugInput).toBeDisabled()
  })

  it('rejects content that fails the Block schema at form validation time (e.g. heading level 1)', () => {
    // Simulates the editor emitting an invalid Block[] — the form-level
    // Zod safeParse must catch it and disable Save before any network round-trip.
    render(
      <EditPostForm
        initialPost={makePost({
          content_json: [
            // @ts-expect-error — deliberately invalid level for the test
            { id: 'h0', type: 'heading', data: { text: 'Banned', level: 1 } },
          ],
        })}
      />,
    )
    const errors = screen.getAllByRole('alert')
    expect(errors.some((el) => /block|level/i.test(el.textContent ?? ''))).toBe(true)
    expect(screen.getByRole('button', { name: /^save$/i })).toBeDisabled()
  })

  it('explicit Save: PATCH /api/admin/posts/<id> with only changed fields, save indicator transitions saving → saved', async () => {
    apiPatch.mockResolvedValueOnce({
      post: makePost({ title: 'Renamed' }),
    })
    render(<EditPostForm initialPost={makePost()} />)
    fireEvent.change(screen.getByLabelText(/^title$/i), { target: { value: 'Renamed' } })

    const saveBtn = screen.getByRole('button', { name: /^save$/i })
    expect(saveBtn).toBeEnabled()

    await act(async () => {
      fireEvent.click(saveBtn)
    })

    expect(apiPatch).toHaveBeenCalledTimes(1)
    const [path, body] = apiPatch.mock.calls[0]
    expect(path).toBe('/api/admin/posts/11111111-1111-1111-1111-111111111111')
    expect(body).toMatchObject({ title: 'Renamed' })

    expect(screen.getAllByText(/saved\s+just now|saved\s+\d/i).length).toBeGreaterThan(0)
  })

  it('Save error surfaces an inline retry — clicking Retry re-invokes PATCH', async () => {
    apiPatch
      .mockRejectedValueOnce(new ApiError({ status: 500, code: 'INTERNAL', error: 'Database hiccup' }))
      .mockResolvedValueOnce({ post: makePost({ title: 'Renamed' }) })

    render(<EditPostForm initialPost={makePost()} />)
    fireEvent.change(screen.getByLabelText(/^title$/i), { target: { value: 'Renamed' } })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
    })

    const errorAlerts = screen.getAllByRole('alert')
    expect(errorAlerts.some((el) => /database hiccup/i.test(el.textContent ?? ''))).toBe(true)

    const retry = screen.getByRole('button', { name: /retry/i })
    await act(async () => { fireEvent.click(retry) })

    expect(apiPatch).toHaveBeenCalledTimes(2)
    expect(screen.getAllByText(/saved\s+just now|saved\s+\d/i).length).toBeGreaterThan(0)
  })

  it('Publish: optimistically flips status to "published"; calls POST /api/admin/posts/<id>/publish', async () => {
    apiPost.mockResolvedValueOnce({ post: makePost({ status: 'published', published_at: new Date().toISOString() }) })
    render(<EditPostForm initialPost={makePost()} />)
    expect(screen.getByRole('status', { name: /status: draft/i })).toBeInTheDocument()

    const publish = screen.getByRole('button', { name: /^publish$/i })
    await act(async () => { fireEvent.click(publish) })

    expect(apiPost).toHaveBeenCalledWith('/api/admin/posts/11111111-1111-1111-1111-111111111111/publish')
    expect(screen.getByRole('status', { name: /status: published/i })).toBeInTheDocument()
  })

  it('Publish failure rolls back the optimistic status flip', async () => {
    apiPost.mockRejectedValueOnce(new ApiError({ status: 422, code: 'VALIDATION_FAILED', error: 'cannot publish without an excerpt', field: 'excerpt' }))
    render(<EditPostForm initialPost={makePost()} />)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^publish$/i }))
    })
    expect(screen.getByRole('status', { name: /status: draft/i })).toBeInTheDocument()
    const errs = screen.getAllByRole('alert')
    expect(errs.some((el) => /cannot publish without an excerpt/i.test(el.textContent ?? ''))).toBe(true)
  })

  it('Delete modal: typing the slug enables the destructive action; Esc cancels', () => {
    render(<EditPostForm initialPost={makePost({ slug: 'going-away' })} />)
    fireEvent.click(screen.getByRole('button', { name: /^delete$/i }))

    const dialog = screen.getByRole('dialog')
    const confirm = within(dialog).getByRole('button', { name: /^delete$/i })
    expect(confirm).toBeDisabled()

    fireEvent.change(within(dialog).getByLabelText(/type the slug/i), { target: { value: 'going-away' } })
    expect(confirm).toBeEnabled()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
