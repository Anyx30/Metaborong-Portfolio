// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

import { PreviewPane } from './preview-pane'
import type { Block, Post } from '@/lib/blog-schema'

// Stub the actual PostView so we can read the props it received from the
// preview pane and assert merge + region-resolved fields cleanly.
vi.mock('@/components/blog/post-view', () => ({
  PostView: ({ post, draftBanner }: { post: Post; draftBanner?: boolean }) => (
    <div
      data-testid="mock-post-view"
      data-title={post.title}
      data-excerpt={post.excerpt ?? ''}
      data-block-count={post.content_json.length}
      data-draft-banner={draftBanner ? '1' : '0'}
    />
  ),
}))

function basePost(overrides: Partial<Post> = {}): Post {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    slug: 'sample',
    title: 'Base title',
    excerpt: 'Base excerpt',
    status: 'draft',
    content_json: [],
    content_schema_version: 1,
    cover_image_id: null,
    og_image_id: null,
    tags: [],
    author_name: 'Tester',
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

describe('<PreviewPane />', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
    cleanup()
  })

  it('renders <PostView /> from the current editor state with the draft banner toggled on', () => {
    const blocks: Block[] = [
      { id: 'p1', type: 'paragraph', data: { text: 'Hello.' } },
    ]
    render(<PreviewPane basePost={basePost()} liveBlocks={blocks} />)
    // Settle initial debounce.
    act(() => { vi.advanceTimersByTime(150) })
    const view = screen.getByTestId('mock-post-view')
    expect(view).toHaveAttribute('data-block-count', '1')
    expect(view).toHaveAttribute('data-draft-banner', '1')
  })

  it('region selector switches Base → US → EU', () => {
    const post = basePost({
      geo_variants: {
        US: { title: 'US title' },
        EU: { title: 'EU title' },
      },
    })
    render(<PreviewPane basePost={post} liveBlocks={[]} />)
    act(() => { vi.advanceTimersByTime(150) })
    const select = screen.getByLabelText(/preview region/i) as HTMLSelectElement

    expect(screen.getByTestId('mock-post-view')).toHaveAttribute('data-title', 'Base title')

    fireEvent.change(select, { target: { value: 'US' } })
    act(() => { vi.advanceTimersByTime(150) })
    expect(screen.getByTestId('mock-post-view')).toHaveAttribute('data-title', 'US title')

    fireEvent.change(select, { target: { value: 'EU' } })
    act(() => { vi.advanceTimersByTime(150) })
    expect(screen.getByTestId('mock-post-view')).toHaveAttribute('data-title', 'EU title')

    fireEvent.change(select, { target: { value: 'OTHER' } })
    act(() => { vi.advanceTimersByTime(150) })
    expect(screen.getByTestId('mock-post-view')).toHaveAttribute('data-title', 'Base title')
  })

  it('debounces edits — 5 rapid block changes coalesce into one re-render after 150ms', () => {
    const initialBlocks: Block[] = []
    const { rerender } = render(<PreviewPane basePost={basePost()} liveBlocks={initialBlocks} />)
    // Settle initial debounce so we have a clean starting tick.
    act(() => { vi.advanceTimersByTime(150) })
    const startTick = Number(screen.getByTestId('preview-pane').getAttribute('data-render-tick'))

    // Five rapid edits each restarting the debounce timer; each spaced
    // <150ms apart so only the trailing edit survives the window.
    for (let i = 1; i <= 5; i++) {
      const next: Block[] = Array.from({ length: i }, (_, j) => ({
        id: `p${j}`, type: 'paragraph', data: { text: `t${j}` },
      }))
      rerender(<PreviewPane basePost={basePost()} liveBlocks={next} />)
      act(() => { vi.advanceTimersByTime(30) })
    }
    // Mid-burst the timer hasn't fired yet — still showing the prior commit.
    expect(screen.getByTestId('mock-post-view')).toHaveAttribute('data-block-count', '0')
    // Crossing the trailing 150ms commits exactly once with the latest value.
    act(() => { vi.advanceTimersByTime(150) })
    expect(screen.getByTestId('mock-post-view')).toHaveAttribute('data-block-count', '5')
    const finalTick = Number(screen.getByTestId('preview-pane').getAttribute('data-render-tick'))
    expect(finalTick - startTick).toBe(1)
  })

  it('overlay edits to title/excerpt apply to the previewed post on top of the base', () => {
    render(
      <PreviewPane
        basePost={basePost()}
        liveBlocks={[]}
        liveOverlay={{ title: 'Live title', excerpt: 'Live excerpt' }}
      />,
    )
    act(() => { vi.advanceTimersByTime(150) })
    const view = screen.getByTestId('mock-post-view')
    expect(view).toHaveAttribute('data-title', 'Live title')
    expect(view).toHaveAttribute('data-excerpt', 'Live excerpt')
  })
})
