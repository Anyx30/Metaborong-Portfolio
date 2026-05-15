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
// surfaces the inputs the form tests care about — `activeVariant`,
// `variants`, and the `onSetBlockOverride` callback — through a couple of
// hidden test buttons so a few variant-specific cases can drive the
// callback without booting Tiptap.
vi.mock('@/components/admin/editor/editor-shell', () => ({
  EditorShell: ({
    activeVariant,
    variants,
    onSetBlockOverride,
  }: {
    activeVariant?: string
    variants?: unknown
    onSetBlockOverride?: (blockId: string, kind: 'text' | 'alt', value: string) => void
  }) => (
    <div
      data-testid="mock-editor-shell"
      data-active-variant={activeVariant ?? ''}
      data-variants={JSON.stringify(variants ?? {})}
    >
      <button
        type="button"
        data-testid="mock-set-block-override"
        onClick={() => onSetBlockOverride?.('h1', 'text', 'US heading override')}
      />
      <button
        type="button"
        data-testid="mock-clear-block-override"
        onClick={() => onSetBlockOverride?.('h1', 'text', '')}
      />
    </div>
  ),
}))

// The AI readiness button + drawer are exercised in their own colocated
// component tests. The form-level tests only care that the button renders
// (so its onOpen wiring is in scope) and that the drawer's open prop
// flips on the soft-prompt's "Score" CTA — both surfaceable through a
// minimal render mock.
vi.mock('@/components/admin/editor/ai-readiness-button', () => ({
  AiReadinessButton: ({ onOpen }: { onOpen: () => void }) => (
    <button type="button" data-testid="mock-ai-readiness-button" onClick={onOpen}>
      AI readiness
    </button>
  ),
}))
vi.mock('@/components/admin/editor/ai-readiness-drawer', () => ({
  AiReadinessDrawer: ({
    open, initialReport,
  }: {
    open: boolean
    initialReport: unknown
  }) =>
    open ? (
      <div
        data-testid="mock-ai-readiness-drawer"
        data-initial-report={initialReport === null ? 'null' : 'present'}
      />
    ) : null,
}))

const apiPatch  = api.patch  as unknown as ReturnType<typeof vi.fn>
const apiPost   = api.post   as unknown as ReturnType<typeof vi.fn>
const apiDelete = api.delete as unknown as ReturnType<typeof vi.fn>

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
    apiDelete.mockReset()
  })
  afterEach(() => cleanup())

  it('renders all primary fields with the initial post values', () => {
    render(<EditPostForm initialPost={makePost()} />)
    expect(screen.getByLabelText(/^title$/i)).toHaveValue('Sample post')
    expect(screen.getByLabelText(/^slug$/i)).toHaveValue('sample-post')
    expect(screen.getByLabelText(/^excerpt$/i)).toHaveValue('Lede.')
    expect(screen.getByLabelText(/^tags$/i)).toHaveValue('web3')
    expect(screen.getByLabelText(/^author name$/i)).toHaveValue('Arnab Ray')
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

  it('SaveState lifecycle: idle → saving → saved (lingers ≥2s) → idle', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      // Resolve the PATCH only when we say so, so we can observe the
      // 'saving' state in the DOM.
      let resolvePatch!: (value: { post: Post }) => void
      apiPatch.mockImplementationOnce(
        () => new Promise((res) => { resolvePatch = res }),
      )

      render(<EditPostForm initialPost={makePost()} />)
      fireEvent.change(screen.getByLabelText(/^title$/i), { target: { value: 'Renamed' } })

      // Idle + dirty → indicator says "Unsaved changes".
      expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument()

      // Clicking Save kicks runSave() — state becomes 'saving' before
      // the PATCH resolves. The "Saving…" text appears both in the
      // role="status" SaveIndicator and as the disabled button label;
      // assert via getAllByText which the test merely requires to be
      // non-empty.
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /saving|^save$/i }))
      })
      expect(screen.getAllByText(/saving…/i).length).toBeGreaterThan(0)

      // Resolve the PATCH; the indicator transitions to 'saved'.
      await act(async () => {
        resolvePatch({ post: makePost({ title: 'Renamed' }) })
        await Promise.resolve()
      })
      expect(screen.getAllByText(/saved\s+just now|saved\s+\d/i).length).toBeGreaterThan(0)

      // 'saved' state lingers for 2s — a 1s tick must not flip it back yet.
      await act(async () => { vi.advanceTimersByTime(1000) })
      expect(screen.getAllByText(/saved\s+just now|saved\s+\d/i).length).toBeGreaterThan(0)

      // After ≥2s total, the indicator fades back to idle ("Up to date"
      // since the form fields now match the saved post).
      await act(async () => { vi.advanceTimersByTime(1500) })
      expect(screen.queryByText(/saved\s+just now|saved\s+\d/i)).toBeNull()
      expect(screen.getByText(/up to date/i)).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it('SaveState: only one "Saving…" indicator appears per real save (no flicker on rapid keystrokes)', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      apiPatch.mockResolvedValue({ post: makePost({ title: 'Renamed five' }) })

      render(<EditPostForm initialPost={makePost()} />)

      // Five rapid keystrokes within the 2s autosave debounce window —
      // none of them should surface a 'saving' indicator.
      for (const value of ['R', 'Re', 'Ren', 'Rena', 'Renam']) {
        fireEvent.change(screen.getByLabelText(/^title$/i), { target: { value } })
        await act(async () => { vi.advanceTimersByTime(200) })
        expect(screen.queryAllByText(/saving…/i)).toHaveLength(0)
      }

      // After 2s of quiet, autosave fires once; observe a single 'saving'.
      await act(async () => { vi.advanceTimersByTime(2100) })
      // The PATCH resolves on the next tick of the microtask queue.
      await act(async () => { await Promise.resolve() })
      expect(apiPatch).toHaveBeenCalledTimes(1)
      // The 'saved' indicator is visible after the resolved save.
      expect(screen.getAllByText(/saved\s+just now|saved\s+\d/i).length).toBeGreaterThan(0)
    } finally {
      vi.useRealTimers()
    }
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

  // ── M9-C variant authoring ────────────────────────────────────────────────

  it('variant tab choice persists to localStorage under mb.editor.variant.<id> and re-hydrates on remount', () => {
    const post = makePost({ id: '11111111-1111-1111-1111-111111111111' })
    const key = `mb.editor.variant.${post.id}`
    window.localStorage.removeItem(key)

    const { unmount } = render(<EditPostForm initialPost={post} />)
    expect(window.localStorage.getItem(key)).toBe('OTHER')

    fireEvent.click(screen.getByRole('tab', { name: /^US$/ }))
    expect(window.localStorage.getItem(key)).toBe('US')
    expect(screen.getByRole('tab', { name: /^US$/ })).toHaveAttribute('aria-selected', 'true')

    unmount()
    cleanup()

    // Fresh remount picks the persisted tab back up.
    render(<EditPostForm initialPost={post} />)
    expect(screen.getByRole('tab', { name: /^US$/ })).toHaveAttribute('aria-selected', 'true')
    // The Title input on the US tab is now the variant overlay (initially empty
    // because base post carries no US variant in this fixture).
    expect((screen.getByLabelText(/^title$/i) as HTMLInputElement).value).toBe('')
  })

  it('variant autosave preserves the existing other-region variant when editing one region', async () => {
    // Post arrives with an EU variant already set; user edits the US tab.
    // The PATCH body must carry geo_variants with BOTH US (the new edit)
    // and EU (the existing payload) — never clobber the other region.
    const post = makePost({
      geo_variants: { EU: { title: 'EU title' } },
    })
    apiPatch.mockResolvedValueOnce({
      post: makePost({
        geo_variants: {
          US: { title: 'US title' },
          EU: { title: 'EU title' },
        },
      }),
    })
    render(<EditPostForm initialPost={post} />)

    fireEvent.click(screen.getByRole('tab', { name: /^US$/ }))
    fireEvent.change(screen.getByLabelText(/^title$/i), { target: { value: 'US title' } })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
    })

    expect(apiPatch).toHaveBeenCalledTimes(1)
    const [, body] = apiPatch.mock.calls[0]
    expect(body.geo_variants).toEqual({
      US: { title: 'US title' },
      EU: { title: 'EU title' },
    })
  })

  it('"Reset to base" deletes the variant override key — PATCH body omits it for that field', async () => {
    const post = makePost({
      geo_variants: { US: { title: 'US title', excerpt: 'US excerpt' } },
    })
    apiPatch.mockResolvedValueOnce({
      post: makePost({
        geo_variants: { US: { excerpt: 'US excerpt' } },
      }),
    })
    render(<EditPostForm initialPost={post} />)

    fireEvent.click(screen.getByRole('tab', { name: /^US$/ }))
    // The override chip is visible because the variant carries a non-empty title.
    expect(screen.getByTestId('override-chip-f-title')).toBeInTheDocument()

    // Click Reset to base for the title field.
    fireEvent.click(screen.getByTestId('reset-override-f-title'))
    // Chip clears immediately.
    expect(screen.queryByTestId('override-chip-f-title')).toBeNull()

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
    })
    expect(apiPatch).toHaveBeenCalledTimes(1)
    const [, body] = apiPatch.mock.calls[0]
    // Title override is gone; excerpt override remains.
    expect(body.geo_variants).toEqual({ US: { excerpt: 'US excerpt' } })
    expect(body.geo_variants.US.title).toBeUndefined()
  })

  it('block override write/clear: PATCH carries block_overrides[id] and removes it on clear', async () => {
    const post = makePost({ geo_variants: {} })
    // Two saves: after writing the override, then after clearing it.
    apiPatch
      .mockResolvedValueOnce({
        post: makePost({
          geo_variants: { US: { block_overrides: { h1: { text: 'US heading override' } } } },
        }),
      })
      .mockResolvedValueOnce({ post: makePost({ geo_variants: {} }) })
    render(<EditPostForm initialPost={post} />)

    fireEvent.click(screen.getByRole('tab', { name: /^US$/ }))

    // Mock callback writes a block override into geo_variants.
    fireEvent.click(screen.getByTestId('mock-set-block-override'))
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
    })
    expect(apiPatch.mock.calls[0][1].geo_variants).toEqual({
      US: { block_overrides: { h1: { text: 'US heading override' } } },
    })

    // Mock callback clears it (empty string). The form must drop the
    // block id, the block_overrides key, and (since nothing else is set)
    // the region key.
    fireEvent.click(screen.getByTestId('mock-clear-block-override'))
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
    })
    expect(apiPatch.mock.calls[1][1].geo_variants).toEqual({})
  })

  it('PATCH drops orphan block_overrides whose blockId is no longer in content_json', async () => {
    // Seed: the post arrives with a US block override against `orphan-id`,
    // but content_json carries only `h1` and `p1` — `orphan-id` is dead.
    const post = makePost({
      geo_variants: {
        US: {
          title: 'US title',
          block_overrides: { 'orphan-id': { text: 'gone' } },
        },
      },
    })
    // The shared id collides with the M9-C variant tab persistence test —
    // wipe the localStorage key so this test starts on the Base tab.
    window.localStorage.removeItem(`mb.editor.variant.${post.id}`)
    apiPatch.mockResolvedValueOnce({
      post: makePost({ geo_variants: { US: { title: 'US title' } } }),
    })
    render(<EditPostForm initialPost={post} />)

    // Touch a base field so dirty=true and the explicit Save can fire.
    fireEvent.change(screen.getByLabelText(/^title$/i), { target: { value: 'Renamed' } })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
    })

    expect(apiPatch).toHaveBeenCalledTimes(1)
    const [, body] = apiPatch.mock.calls[0]
    // The override map's only entry pointed at a dead blockId; after GC the
    // map is empty, so block_overrides is dropped from the US payload.
    expect(body.geo_variants.US.block_overrides).toBeUndefined()
    expect(body.geo_variants.US.title).toBe('US title')
  })

  // ── M7 AI readiness soft-prompt on publish ────────────────────────────────

  it('soft-prompt appears after publish when ai_readiness_checked_at is null', async () => {
    apiPost.mockResolvedValueOnce({
      post: makePost({
        status: 'published',
        published_at: new Date().toISOString(),
        ai_readiness_checked_at: null,
      }),
    })
    render(<EditPostForm initialPost={makePost()} />)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^publish$/i }))
    })
    expect(screen.getByTestId('ai-readiness-soft-prompt')).toBeInTheDocument()
  })

  it('soft-prompt appears after publish when ai_readiness_checked_at is older than 24h', async () => {
    const oneDayAgo = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString()
    apiPost.mockResolvedValueOnce({
      post: makePost({
        status: 'published',
        published_at: new Date().toISOString(),
        ai_readiness_score: 50,
        ai_readiness_band: 'weak',
        ai_readiness_checked_at: oneDayAgo,
      }),
    })
    render(<EditPostForm initialPost={makePost()} />)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^publish$/i }))
    })
    expect(screen.getByTestId('ai-readiness-soft-prompt')).toBeInTheDocument()
  })

  it('soft-prompt does NOT appear after publish when ai_readiness_checked_at is fresh (< 24h)', async () => {
    const recently = new Date(Date.now() - 60 * 60 * 1000).toISOString() // 1h ago
    apiPost.mockResolvedValueOnce({
      post: makePost({
        status: 'published',
        published_at: new Date().toISOString(),
        ai_readiness_score: 80,
        ai_readiness_band: 'strong',
        ai_readiness_checked_at: recently,
      }),
    })
    render(<EditPostForm initialPost={makePost()} />)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^publish$/i }))
    })
    expect(screen.queryByTestId('ai-readiness-soft-prompt')).toBeNull()
  })

  it('soft-prompt "Score" CTA opens the drawer with initialReport=null (force fresh scan)', async () => {
    apiPost.mockResolvedValueOnce({
      post: makePost({
        status: 'published',
        published_at: new Date().toISOString(),
        ai_readiness_checked_at: null,
      }),
    })
    render(<EditPostForm initialPost={makePost()} />)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^publish$/i }))
    })
    fireEvent.click(screen.getByTestId('ai-readiness-soft-prompt-score'))
    const drawer = screen.getByTestId('mock-ai-readiness-drawer')
    expect(drawer).toBeInTheDocument()
    expect(drawer).toHaveAttribute('data-initial-report', 'null')
    expect(screen.queryByTestId('ai-readiness-soft-prompt')).toBeNull()
  })

  it('Delete: removes mb.editor.variant.<id> from localStorage on successful DELETE', async () => {
    const post = makePost({ slug: 'going-away' })
    const key = `mb.editor.variant.${post.id}`
    window.localStorage.setItem(key, 'US')
    apiDelete.mockResolvedValueOnce({ ok: true })

    render(<EditPostForm initialPost={post} />)
    fireEvent.click(screen.getByRole('button', { name: /^delete$/i }))
    const dialog = screen.getByRole('dialog')
    fireEvent.change(within(dialog).getByLabelText(/type the slug/i), { target: { value: 'going-away' } })

    await act(async () => {
      fireEvent.click(within(dialog).getByRole('button', { name: /^delete$/i }))
    })

    expect(apiDelete).toHaveBeenCalledWith(`/api/admin/posts/${post.id}`)
    // Key is wiped after the DELETE resolves so the next post that lands on
    // this id (extremely unlikely uuid collision but still) doesn't inherit
    // the prior author's tab choice — and the storage line item is freed.
    expect(window.localStorage.getItem(key)).toBeNull()
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
