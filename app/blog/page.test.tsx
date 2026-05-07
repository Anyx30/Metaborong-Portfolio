// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Mock the data layer so the page renders without a live DB. The test
// only cares about the static header chrome (RSS + LLMs.txt links).
vi.mock('@/lib/posts', () => ({
  listPublishedPosts: vi.fn(async () => ({
    posts: [],
    total: 0,
    hasMore: false,
  })),
}))

import BlogIndexPage from './page'

async function renderPage() {
  // BlogIndexPage is an async Server Component — await its invocation
  // to materialize the JSX tree before handing it to RTL.
  const jsx = await BlogIndexPage({ searchParams: Promise.resolve({}) })
  return render(jsx)
}

describe('/blog listing — header chrome (M9-GEO)', () => {
  afterEach(() => cleanup())

  it('renders the LLMs.txt link beside the RSS link', async () => {
    await renderPage()

    const rssLink = screen.getByRole('link', { name: /subscribe to the rss feed/i })
    expect(rssLink).toBeInTheDocument()
    expect(rssLink).toHaveAttribute('href', '/blog/rss.xml')

    const llmsLink = screen.getByRole('link', { name: /llm-readable index/i })
    expect(llmsLink).toBeInTheDocument()
    expect(llmsLink).toHaveAttribute('href', '/llms.txt')

    // Both links must share the same parent so the LLMs.txt hint sits
    // alongside RSS in the header rather than drifting elsewhere.
    expect(llmsLink.parentElement).toBe(rssLink.parentElement)
  })
})
