// /blog/rss.xml route tests — well-formed XML, special chars escaped,
// items ordered by published_at DESC, capped at 50.

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
  return await import('@/app/blog/rss.xml/route')
}

async function insertPublished(opts: {
  slug: string
  title: string
  publishedAt: Date
  tags?: string[]
}) {
  await testHandle.db.insert(postsTable).values({
    slug: opts.slug,
    title: opts.title,
    status: 'published',
    author_name: 'admin',
    tags: opts.tags ?? [],
    published_at: opts.publishedAt,
    updated_at: opts.publishedAt,
  })
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
    await testHandle.db.insert(postsTable).values({
      slug: 'still-cooking',
      title: 'Cooking',
      status: 'draft',
      author_name: 'admin',
    })
    const { GET } = await loadRoute()
    const xml = await (await GET()).text()
    expect(xml).not.toContain('<title>Cooking</title>')
  })
})
