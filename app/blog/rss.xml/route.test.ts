// /blog/rss.xml route tests — well-formed XML, special chars escaped,
// items ordered by published_at DESC, capped at 50.

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
  return await import('@/app/blog/rss.xml/route')
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

async function insertPublished(opts: {
  slug: string
  title: string
  publishedAt: Date
  tags?: string[]
  excerpt?: string | null
  content_json?: unknown[]
}) {
  await testHandle.db.collection<PostDoc>('posts').insertOne(makePost({
    slug: opts.slug,
    title: opts.title,
    status: 'published',
    tags: opts.tags ?? [],
    excerpt: opts.excerpt ?? null,
    content_json: (opts.content_json ?? []) as Block[],
    published_at: opts.publishedAt,
    updated_at: opts.publishedAt,
  }))
}

describe('GET /blog/rss.xml', () => {
  it('returns application/rss+xml with a well-formed channel header', async () => {
    const { GET } = await loadRoute()
    const res = await GET()
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('application/rss+xml; charset=utf-8')
    const xml = await res.text()
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(xml).toContain('<rss version="2.0"')
    expect(xml).toContain('<channel>')
    expect(xml).toContain('</rss>')
    expect(xml).toContain('<atom:link href="https://www.metaborong.com/blog/rss.xml" rel="self"')
  })

  it('emits one <item> per published post with title, link, guid, pubDate', async () => {
    await insertPublished({
      slug: 'first',
      title: 'First post',
      publishedAt: new Date('2026-04-01T10:00:00Z'),
    })
    await insertPublished({
      slug: 'second',
      title: 'Second post',
      publishedAt: new Date('2026-04-02T10:00:00Z'),
    })

    const { GET } = await loadRoute()
    const res = await GET()
    const xml = await res.text()
    expect(xml).toContain('<title>First post</title>')
    expect(xml).toContain('<title>Second post</title>')
    expect(xml).toContain('<link>https://www.metaborong.com/blog/first/</link>')
    expect(xml).toContain('<link>https://www.metaborong.com/blog/second/</link>')
    expect(xml).toContain('<guid isPermaLink="true">https://www.metaborong.com/blog/first/</guid>')
    expect(xml).toMatch(/<pubDate>.+GMT<\/pubDate>/)
  })

  it('orders items by published_at DESC (newest first)', async () => {
    await insertPublished({ slug: 'older',  title: 'Older',  publishedAt: new Date('2026-04-01T00:00:00Z') })
    await insertPublished({ slug: 'newer',  title: 'Newer',  publishedAt: new Date('2026-04-15T00:00:00Z') })
    await insertPublished({ slug: 'middle', title: 'Middle', publishedAt: new Date('2026-04-08T00:00:00Z') })

    const { GET } = await loadRoute()
    const xml = await (await GET()).text()
    const newerIdx  = xml.indexOf('<title>Newer</title>')
    const middleIdx = xml.indexOf('<title>Middle</title>')
    const olderIdx  = xml.indexOf('<title>Older</title>')
    expect(newerIdx).toBeGreaterThanOrEqual(0)
    expect(middleIdx).toBeGreaterThan(newerIdx)
    expect(olderIdx).toBeGreaterThan(middleIdx)
  })

  it('escapes <, >, &, ", \' in titles and tags', async () => {
    await insertPublished({
      slug: 'tricky',
      title: 'Bears & "lions" <html> \'sneak\'',
      publishedAt: new Date('2026-04-01T10:00:00Z'),
      tags: ['a&b', 'c<d'],
    })
    const { GET } = await loadRoute()
    const xml = await (await GET()).text()
    expect(xml).toContain('Bears &amp; &quot;lions&quot; &lt;html&gt; &apos;sneak&apos;')
    expect(xml).toContain('<category>a&amp;b</category>')
    expect(xml).toContain('<category>c&lt;d</category>')
    expect(xml).not.toContain('Bears & "lions"')
  })

  it('caps at 50 items', async () => {
    // Insert 60 posts to exceed the 50-item cap (perPage in the route).
    for (let i = 0; i < 60; i++) {
      await insertPublished({
        slug: `post-${String(i).padStart(3, '0')}`,
        title: `Post ${i}`,
        publishedAt: new Date(2026, 3, 1, 0, i),
      })
    }
    const { GET } = await loadRoute()
    const xml = await (await GET()).text()
    const itemCount = (xml.match(/<item>/g) ?? []).length
    expect(itemCount).toBe(50)
  })

  it('omits draft posts entirely', async () => {
    await testHandle.db.collection<PostDoc>('posts').insertOne(makePost({
      slug: 'still-cooking',
      title: 'Cooking',
      status: 'draft',
    }))
    const { GET } = await loadRoute()
    const xml = await (await GET()).text()
    expect(xml).not.toContain('<title>Cooking</title>')
  })

  // M8-core hardening — fixes the M5-core carryover gap where items
  // shipped without <description>. Every item must now carry one.
  it('emits <description> using post.excerpt when set', async () => {
    await insertPublished({
      slug: 'has-excerpt',
      title: 'Excerpted post',
      excerpt: 'A short, editor-written summary.',
      publishedAt: new Date('2026-04-10T00:00:00Z'),
    })
    const { GET } = await loadRoute()
    const xml = await (await GET()).text()
    expect(xml).toContain('<description>A short, editor-written summary.</description>')
  })

  it('falls back to a derived snippet when excerpt is null', async () => {
    await insertPublished({
      slug: 'derived',
      title: 'No excerpt',
      excerpt: null,
      content_json: [
        {
          id: 'p1',
          type: 'paragraph',
          role: 'intro',
          data: {
            text:
              'Reactive scaling is the muscle our agents grow first; observability is the nervous system that lets us correct them.',
          },
        },
      ],
      publishedAt: new Date('2026-04-11T00:00:00Z'),
    })
    const { GET } = await loadRoute()
    const xml = await (await GET()).text()
    // The description tag must exist with non-empty content.
    expect(xml).toMatch(/<description>Reactive scaling[^<]*<\/description>/)
  })

  it('every item ships with a <description> element', async () => {
    await insertPublished({
      slug: 'a',
      title: 'A',
      excerpt: 'Aaaa',
      publishedAt: new Date('2026-04-12T00:00:00Z'),
    })
    await insertPublished({
      slug: 'b',
      title: 'B',
      excerpt: null,
      content_json: [
        { id: 'p', type: 'paragraph', data: { text: 'Body of B.' } },
      ],
      publishedAt: new Date('2026-04-13T00:00:00Z'),
    })
    await insertPublished({
      // No content, no excerpt — falls back to title (worst case still
      // a non-empty description element, never a missing one).
      slug: 'c',
      title: 'C',
      publishedAt: new Date('2026-04-14T00:00:00Z'),
    })

    const { GET } = await loadRoute()
    const xml = await (await GET()).text()
    const itemCount        = (xml.match(/<item>/g) ?? []).length
    const descriptionCount = (xml.match(/<description>/g) ?? []).length
    // -1 because <channel><description> also matches.
    expect(itemCount).toBeGreaterThanOrEqual(3)
    expect(descriptionCount - 1).toBe(itemCount)
  })
})
