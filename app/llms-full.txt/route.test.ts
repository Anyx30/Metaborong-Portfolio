// /llms-full.txt route tests — full markdown bundle for LLM crawlers.

import { describe, expect, it, beforeEach, vi } from 'vitest'
import { randomUUID } from 'node:crypto'

vi.mock('server-only', () => ({}))
vi.mock('@/db/client', () => ({
  get db() { return testHandle.db },
}))

import { createTestDb, type TestDbHandle } from '@/db/test-utils'
import type { PostDoc } from '@/db/schema'
import type { Block } from '@/lib/blog-schema'

let testHandle: TestDbHandle

beforeEach(async () => {
  testHandle = await createTestDb()
  vi.resetModules()
})

async function loadRoute() {
  return await import('@/app/llms-full.txt/route')
}

interface InsertOpts {
  slug: string
  title: string
  publishedAt: Date
  authorName?: string
  content_json?: unknown[]
}

function makePost(opts: Partial<PostDoc> & Pick<PostDoc, 'slug' | 'title'>): PostDoc {
  const now = new Date()
  return {
    _id:                       randomUUID(),
    excerpt:                   null,
    status:                    'draft',
    content_json:              [],
    content_schema_version:    1,
    cover_image_id:            null,
    og_image_id:               null,
    tags:                      [],
    author_name:               'admin',
    author_url:                null,
    meta_title:                null,
    meta_description:          null,
    canonical_url:             null,
    geo_variants:              {},
    ai_readiness_score:        null,
    ai_readiness_band:         null,
    ai_readiness_report:       null,
    ai_readiness_content_hash: null,
    ai_readiness_checked_at:   null,
    published_at:              null,
    created_at:                now,
    updated_at:                now,
    ...opts,
  }
}

async function insertPublished(opts: InsertOpts) {
  await testHandle.db.collection<PostDoc>('posts').insertOne(makePost({
    slug:         opts.slug,
    title:        opts.title,
    status:       'published',
    author_name:  opts.authorName ?? 'admin',
    content_json: (opts.content_json ?? []) as Block[],
    published_at: opts.publishedAt,
    updated_at:   opts.publishedAt,
  }))
}

describe('GET /llms-full.txt', () => {
  it('returns text/plain; charset=utf-8 with the right Cache-Control', async () => {
    const { GET } = await loadRoute()
    const res = await GET()
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('text/plain; charset=utf-8')
    expect(res.headers.get('cache-control')).toBe(
      'public, max-age=0, s-maxage=300, stale-while-revalidate=86400',
    )
  })

  it('emits header only when the catalog is empty', async () => {
    const { GET } = await loadRoute()
    const text = await (await GET()).text()
    expect(text).toContain('# Metaborong')
    expect(text).toMatch(/> Metaborong is a Web3 development company/)
    expect(text).toContain('## Posts')
    expect(text).not.toContain('### ')
    expect(text).not.toContain('---')
  })

  it('emits a single post block for a one-post catalog', async () => {
    await insertPublished({
      slug: 'only-post',
      title: 'Only post',
      authorName: 'Arnab Ray',
      publishedAt: new Date('2026-04-01T10:00:00Z'),
      content_json: [
        { id: 'p1', type: 'paragraph', data: { text: 'Hello world body.' } },
      ],
    })
    const { GET } = await loadRoute()
    const text = await (await GET()).text()
    expect(text).toContain('### Only post')
    expect(text).toContain('URL: https://www.metaborong.com/blog/only-post/')
    expect(text).toContain('Published: 2026-04-01')
    expect(text).toContain('Author: Arnab Ray')
    expect(text).toContain('Hello world body.')
    // Single-post catalog has no separator.
    expect(text).not.toContain('---')
  })

  it('separates 3 post blocks with ---', async () => {
    await insertPublished({
      slug: 'a', title: 'A',
      publishedAt: new Date('2026-04-01T10:00:00Z'),
      content_json: [{ id: 'p', type: 'paragraph', data: { text: 'Body A.' } }],
    })
    await insertPublished({
      slug: 'b', title: 'B',
      publishedAt: new Date('2026-04-02T10:00:00Z'),
      content_json: [{ id: 'p', type: 'paragraph', data: { text: 'Body B.' } }],
    })
    await insertPublished({
      slug: 'c', title: 'C',
      publishedAt: new Date('2026-04-03T10:00:00Z'),
      content_json: [{ id: 'p', type: 'paragraph', data: { text: 'Body C.' } }],
    })
    const { GET } = await loadRoute()
    const text = await (await GET()).text()
    const headings = (text.match(/^### /gm) ?? []).length
    const separators = (text.match(/^---$/gm) ?? []).length
    expect(headings).toBe(3)
    // Separators only between adjacent posts → N - 1 for N posts.
    expect(separators).toBe(2)
  })

  it('orders post blocks by published_at DESC (newest first)', async () => {
    await insertPublished({ slug: 'older',  title: 'Older',  publishedAt: new Date('2026-04-01T00:00:00Z'), content_json: [] })
    await insertPublished({ slug: 'newer',  title: 'Newer',  publishedAt: new Date('2026-04-15T00:00:00Z'), content_json: [] })
    await insertPublished({ slug: 'middle', title: 'Middle', publishedAt: new Date('2026-04-08T00:00:00Z'), content_json: [] })
    const { GET } = await loadRoute()
    const text = await (await GET()).text()
    const newerIdx  = text.indexOf('### Newer')
    const middleIdx = text.indexOf('### Middle')
    const olderIdx  = text.indexOf('### Older')
    expect(newerIdx).toBeGreaterThanOrEqual(0)
    expect(middleIdx).toBeGreaterThan(newerIdx)
    expect(olderIdx).toBeGreaterThan(middleIdx)
  })

  it('omits draft posts entirely', async () => {
    await testHandle.db.collection<PostDoc>('posts').insertOne(makePost({
      slug: 'still-cooking', title: 'Cooking',
      status: 'draft',
    }))
    const { GET } = await loadRoute()
    const text = await (await GET()).text()
    expect(text).not.toContain('### Cooking')
  })

  it('renders body markdown via blocksToMarkdown for the full block set', async () => {
    await insertPublished({
      slug: 'multiblock',
      title: 'Multi',
      publishedAt: new Date('2026-04-04T10:00:00Z'),
      content_json: [
        { id: 'h', type: 'heading', data: { text: 'Section A', level: 2 } },
        { id: 'p', type: 'paragraph', data: { text: 'Body paragraph.' } },
        { id: 'l', type: 'list', data: { ordered: false, items: ['one', 'two'] } },
      ],
    })
    const { GET } = await loadRoute()
    const text = await (await GET()).text()
    expect(text).toContain('## Section A')
    expect(text).toContain('Body paragraph.')
    expect(text).toContain('- one')
    expect(text).toContain('- two')
  })

  it('emits a 5 MB warning when the bundle would exceed the threshold', async () => {
    // Build a paragraph with a ~6 MB body so the assembled bundle clears
    // the 5 MB warn threshold without anyone needing to seed dozens of
    // posts. blocksToMarkdown emits the paragraph text verbatim.
    const big = 'lorem '.repeat(1_200_000) // ~7.2 MB
    await insertPublished({
      slug: 'huge',
      title: 'Huge',
      publishedAt: new Date('2026-04-05T10:00:00Z'),
      content_json: [
        { id: 'p1', type: 'paragraph', data: { text: big } },
      ],
    })
    const { GET } = await loadRoute()
    const text = await (await GET()).text()
    expect(text).toContain('post catalog exceeds 5 MB')
    expect(text).toContain('/blog/<slug>/raw.md')
    // Warning sits before "## Posts" so a top-down reader sees it first.
    expect(text.indexOf('post catalog exceeds 5 MB')).toBeLessThan(
      text.indexOf('## Posts'),
    )
  }, 20_000)

  it('does NOT emit the 5 MB warning for a small catalog', async () => {
    await insertPublished({
      slug: 'small', title: 'Small',
      publishedAt: new Date('2026-04-06T10:00:00Z'),
      content_json: [
        { id: 'p', type: 'paragraph', data: { text: 'Tiny body.' } },
      ],
    })
    const { GET } = await loadRoute()
    const text = await (await GET()).text()
    expect(text).not.toContain('post catalog exceeds 5 MB')
  })
})
