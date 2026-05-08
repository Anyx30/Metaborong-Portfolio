// /llms.txt route tests — llmstxt.org-format index.
//
// Mirrors the rss.xml test setup: pg-mem-backed db swapped in via vi.mock,
// route module re-imported per test so revalidate / module-level state
// stays isolated.

import { describe, expect, it, beforeEach, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@/db/client', () => ({
  get db() { return testHandle.db },
  schema: undefined as unknown,
}))

import { createTestDb, type TestDbHandle } from '@/db/test-utils'
import { posts as postsTable } from '@/db/schema'

let testHandle: TestDbHandle

beforeEach(() => {
  testHandle = createTestDb()
  vi.resetModules()
})

async function loadRoute() {
  return await import('@/app/llms.txt/route')
}

interface InsertOpts {
  slug: string
  title: string
  publishedAt: Date
  excerpt?: string | null
  meta_description?: string | null
  content_json?: unknown[]
}

async function insertPublished(opts: InsertOpts) {
  await testHandle.db.insert(postsTable).values({
    slug:             opts.slug,
    title:            opts.title,
    status:           'published',
    author_name:      'admin',
    excerpt:          opts.excerpt ?? null,
    meta_description: opts.meta_description ?? null,
    content_json:     (opts.content_json ?? []) as never,
    published_at:     opts.publishedAt,
    updated_at:       opts.publishedAt,
  })
}

describe('GET /llms.txt', () => {
  it('returns text/plain; charset=utf-8 with the right Cache-Control', async () => {
    const { GET } = await loadRoute()
    const res = await GET()
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('text/plain; charset=utf-8')
    expect(res.headers.get('cache-control')).toBe(
      'public, max-age=0, s-maxage=300, stale-while-revalidate=86400',
    )
  })

  it('emits the llmstxt.org header (# title + > description + ## Posts)', async () => {
    const { GET } = await loadRoute()
    const text = await (await GET()).text()
    expect(text).toContain('# Metaborong')
    expect(text).toMatch(/\n> Metaborong is a Web3 development company and AI agent studio/)
    expect(text).toContain('\n## Posts\n')
  })

  it('emits a "no posts yet" line when the catalog is empty (not a 404)', async () => {
    const { GET } = await loadRoute()
    const res = await GET()
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('## Posts')
    expect(text).toContain('- No posts yet.')
  })

  it('emits one bullet per published post with [title](url): tldr', async () => {
    await insertPublished({
      slug: 'first',
      title: 'First post',
      excerpt: 'A short tldr.',
      publishedAt: new Date('2026-04-01T10:00:00Z'),
    })
    await insertPublished({
      slug: 'second',
      title: 'Second post',
      excerpt: 'Another summary.',
      publishedAt: new Date('2026-04-02T10:00:00Z'),
    })
    await insertPublished({
      slug: 'third',
      title: 'Third post',
      excerpt: 'Third summary.',
      publishedAt: new Date('2026-04-03T10:00:00Z'),
    })

    const { GET } = await loadRoute()
    const text = await (await GET()).text()
    expect(text).toContain(
      '- [First post](https://www.metaborong.com/blog/first/): A short tldr.',
    )
    expect(text).toContain(
      '- [Second post](https://www.metaborong.com/blog/second/): Another summary.',
    )
    expect(text).toContain(
      '- [Third post](https://www.metaborong.com/blog/third/): Third summary.',
    )
    const bulletCount = (text.match(/^- \[/gm) ?? []).length
    expect(bulletCount).toBe(3)
  })

  it('orders bullets by published_at DESC (newest first)', async () => {
    await insertPublished({ slug: 'older',  title: 'Older',  publishedAt: new Date('2026-04-01T00:00:00Z'), excerpt: 'o' })
    await insertPublished({ slug: 'newer',  title: 'Newer',  publishedAt: new Date('2026-04-15T00:00:00Z'), excerpt: 'n' })
    await insertPublished({ slug: 'middle', title: 'Middle', publishedAt: new Date('2026-04-08T00:00:00Z'), excerpt: 'm' })

    const { GET } = await loadRoute()
    const text = await (await GET()).text()
    const newerIdx  = text.indexOf('[Newer]')
    const middleIdx = text.indexOf('[Middle]')
    const olderIdx  = text.indexOf('[Older]')
    expect(newerIdx).toBeGreaterThanOrEqual(0)
    expect(middleIdx).toBeGreaterThan(newerIdx)
    expect(olderIdx).toBeGreaterThan(middleIdx)
  })

  it('omits draft posts entirely', async () => {
    await testHandle.db.insert(postsTable).values({
      slug:        'still-cooking',
      title:       'Cooking',
      status:      'draft',
      author_name: 'admin',
    })
    const { GET } = await loadRoute()
    const text = await (await GET()).text()
    expect(text).not.toContain('[Cooking]')
    expect(text).toContain('- No posts yet.')
  })

  it('falls back to derived snippet when excerpt is null', async () => {
    await insertPublished({
      slug: 'derived',
      title: 'Derived tldr',
      excerpt: null,
      content_json: [
        {
          id: 'p1',
          type: 'paragraph',
          role: 'intro',
          data: { text: 'Reactive scaling is the muscle our agents grow first.' },
        },
      ],
      publishedAt: new Date('2026-04-11T00:00:00Z'),
    })
    const { GET } = await loadRoute()
    const text = await (await GET()).text()
    expect(text).toMatch(
      /- \[Derived tldr\]\(https:\/\/www\.metaborong\.com\/blog\/derived\/\): Reactive scaling[^\n]+/,
    )
  })

  it('falls back to title when neither excerpt nor body has text', async () => {
    await insertPublished({
      slug: 'bare',
      title: 'Bare post',
      publishedAt: new Date('2026-04-12T00:00:00Z'),
    })
    const { GET } = await loadRoute()
    const text = await (await GET()).text()
    expect(text).toContain(
      '- [Bare post](https://www.metaborong.com/blog/bare/): Bare post',
    )
  })

  it('escapes [, ], (, ) in titles so the markdown link stays valid', async () => {
    await insertPublished({
      slug: 'tricky',
      title: 'Bears [in] a (forest)',
      excerpt: 'tldr',
      publishedAt: new Date('2026-04-13T00:00:00Z'),
    })
    const { GET } = await loadRoute()
    const text = await (await GET()).text()
    expect(text).toContain(
      '- [Bears \\[in\\] a \\(forest\\)](https://www.metaborong.com/blog/tricky/): tldr',
    )
  })

  it('truncates absurdly long tldrs to ~140 chars and adds an ellipsis', async () => {
    const longExcerpt = 'word '.repeat(200).trim()
    await insertPublished({
      slug: 'long',
      title: 'Long',
      excerpt: longExcerpt,
      publishedAt: new Date('2026-04-14T00:00:00Z'),
    })
    const { GET } = await loadRoute()
    const text = await (await GET()).text()
    const match = text.match(/^- \[Long\]\([^)]+\): (.+)$/m)
    expect(match).not.toBeNull()
    const tldr = match![1]
    expect(tldr.length).toBeLessThanOrEqual(141) // ~140 + ellipsis
    expect(tldr.endsWith('…')).toBe(true)
  })
})
