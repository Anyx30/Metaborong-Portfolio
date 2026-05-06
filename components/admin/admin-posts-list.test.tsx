// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

import { AdminPostsList } from './admin-posts-list'
import { ApiError, NetworkError, api } from '@/lib/api-client'
import type { PostSummary } from '@/lib/blog-schema'

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

const apiDelete = api.delete as unknown as ReturnType<typeof vi.fn>

function makeSummary(overrides: Partial<PostSummary> = {}): PostSummary {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    slug: 'sample-post',
    title: 'Sample post',
    status: 'draft',
    tags: ['web3'],
    updated_at: new Date(Date.now() - 5 * 60_000).toISOString(),
    published_at: null,
    ai_readiness_score: null,
    ai_readiness_band: null,
    has_geo_variants: false,
    ...overrides,
  }
}

describe('<AdminPostsList />', () => {
  beforeEach(() => {
    routerPush.mockReset()
    routerRefresh.mockReset()
    apiDelete.mockReset()
  })
  afterEach(() => cleanup())

  it('renders one row per post with title, slug, and status pill', () => {
    const posts = [
      makeSummary({ id: 'p1', title: 'First',  slug: 'first',  status: 'draft' }),
      makeSummary({ id: 'p2', title: 'Second', slug: 'second', status: 'published' }),
    ]
    render(<AdminPostsList initialPosts={posts} status="all" fetchError={null} />)

    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
    expect(screen.getByText('/first')).toBeInTheDocument()
    expect(screen.getByText('/second')).toBeInTheDocument()
    expect(screen.getAllByRole('status').some((el) => el.textContent === 'draft')).toBe(true)
    expect(screen.getAllByRole('status').some((el) => el.textContent === 'published')).toBe(true)
  })

  it('clicking a status tab pushes the URL with ?status=… (or no param for "all")', () => {
    render(<AdminPostsList initialPosts={[makeSummary()]} status="all" fetchError={null} />)

    fireEvent.click(screen.getByRole('tab', { name: /draft/i }))
    expect(routerPush).toHaveBeenCalledWith('/admin?status=draft')

    routerPush.mockClear()
    fireEvent.click(screen.getByRole('tab', { name: /^all$/i }))
    expect(routerPush).toHaveBeenCalledWith('/admin')
  })

  it('renders the empty state when no posts are passed (with tab-specific copy)', () => {
    const { rerender } = render(<AdminPostsList initialPosts={[]} status="all" fetchError={null} />)
    expect(screen.getByText(/no posts yet/i)).toBeInTheDocument()
    expect(screen.getByText(/create your first post/i)).toBeInTheDocument()

    rerender(<AdminPostsList initialPosts={[]} status="draft" fetchError={null} />)
    expect(screen.getByText(/no drafts/i)).toBeInTheDocument()

    rerender(<AdminPostsList initialPosts={[]} status="published" fetchError={null} />)
    expect(screen.getByText(/no published posts/i)).toBeInTheDocument()
  })

  it('renders the fetch-error region when fetchError is set', () => {
    render(<AdminPostsList initialPosts={[]} status="all" fetchError="connection refused" />)
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent(/could not load posts/i)
    expect(alert).toHaveTextContent(/connection refused/i)
  })

  it('Delete button opens the confirmation modal; the confirm button stays disabled until the slug is typed', async () => {
    const post = makeSummary({ id: 'p1', slug: 'foo-bar' })
    render(<AdminPostsList initialPosts={[post]} status="all" fetchError={null} />)

    fireEvent.click(screen.getByRole('button', { name: /delete sample post/i }))
    const dialog = screen.getByRole('dialog')
    const confirmBtn = within(dialog).getByRole('button', { name: /^delete$/i })
    expect(confirmBtn).toBeDisabled()

    const input = within(dialog).getByLabelText(/type the slug/i)
    fireEvent.change(input, { target: { value: 'wrong' } })
    expect(confirmBtn).toBeDisabled()

    fireEvent.change(input, { target: { value: 'foo-bar' } })
    expect(confirmBtn).toBeEnabled()
  })

  it('Confirming delete calls DELETE /api/admin/posts/<id>, optimistically removes the row, refreshes the route', async () => {
    const post = makeSummary({ id: 'p1', slug: 'foo-bar', title: 'Going away' })
    apiDelete.mockResolvedValueOnce({ ok: true })

    render(<AdminPostsList initialPosts={[post]} status="all" fetchError={null} />)
    fireEvent.click(screen.getByRole('button', { name: /delete going away/i }))

    const dialog = screen.getByRole('dialog')
    fireEvent.change(within(dialog).getByLabelText(/type the slug/i), { target: { value: 'foo-bar' } })

    await act(async () => {
      fireEvent.click(within(dialog).getByRole('button', { name: /^delete$/i }))
    })

    expect(apiDelete).toHaveBeenCalledWith('/api/admin/posts/p1')
    expect(routerRefresh).toHaveBeenCalled()
    expect(screen.queryByText('Going away')).not.toBeInTheDocument()
  })

  it('Delete failure surfaces an inline alert (NetworkError) — no optimistic removal', async () => {
    const post = makeSummary({ id: 'p1', slug: 'foo-bar', title: 'Stay put' })
    apiDelete.mockRejectedValueOnce(new NetworkError(new Error('boom')))

    render(<AdminPostsList initialPosts={[post]} status="all" fetchError={null} />)
    fireEvent.click(screen.getByRole('button', { name: /delete stay put/i }))

    const dialog = screen.getByRole('dialog')
    fireEvent.change(within(dialog).getByLabelText(/type the slug/i), { target: { value: 'foo-bar' } })

    await act(async () => {
      fireEvent.click(within(dialog).getByRole('button', { name: /^delete$/i }))
    })

    expect(screen.getByRole('alert')).toHaveTextContent(/network error, try again/i)
  })

  it('ApiError surfaces the API\'s `error` field', async () => {
    const post = makeSummary({ id: 'p1', slug: 'foo-bar' })
    apiDelete.mockRejectedValueOnce(
      new ApiError({ status: 403, code: 'CSRF_FAILED', error: 'CSRF validation failed' }),
    )

    render(<AdminPostsList initialPosts={[post]} status="all" fetchError={null} />)
    fireEvent.click(screen.getByRole('button', { name: /delete sample post/i }))

    const dialog = screen.getByRole('dialog')
    fireEvent.change(within(dialog).getByLabelText(/type the slug/i), { target: { value: 'foo-bar' } })

    await act(async () => {
      fireEvent.click(within(dialog).getByRole('button', { name: /^delete$/i }))
    })

    expect(screen.getByRole('alert')).toHaveTextContent(/csrf validation failed/i)
  })
})
