// Sitemap tests — exercise the SUT against a pg-mem-backed posts table.
//
// listPublishedPosts() is the only data source, so we mock @/db/client and
// seed posts directly via the Drizzle handle. Pagination is verified with
// > PAGE_SIZE posts so the cursor-walk in app/sitemap.ts is actually
// exercised (PAGE_SIZE = 50 in the SUT).

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

async function loadSitemap() {
  return (await import('@/app/sitemap')).default
}

async function insertPublished(slug: string, title: string, updatedAt: Date) {
  await testHandle.db.insert(postsTable).values({
    slug,
    title,
    status: 'published',
    author_name: 'admin',
    published_at: new Date(updatedAt.getTime() - 1000),
    updated_at: updatedAt,
    created_at: updatedAt,
  })
}

describe('app/sitemap.ts', () => {
  it('emits the homepage and /blog/ entries with no posts', async () => {
    const sitemap = await loadSitemap()
    const out = await sitemap()
    const urls = out.map((e) => e.url)
    expect(urls).toContain('https://www.metaborong.com/')
    expect(urls).toContain('https://www.metaborong.com/blog/')
    expect(urls).toHaveLength(2)
  })

  it('includes every published post with lastModified = updated_at', async () => {
    const t1 = new Date('2026-04-01T10:00:00Z')
    const t2 = new Date('2026-04-15T10:00:00Z')
    await insertPublished('foo', 'Foo', t1)
    await insertPublished('bar', 'Bar', t2)

    const sitemap = await loadSitemap()
    const out = await sitemap()
    const map = new Map(out.map((e) => [e.url, e]))
    const foo = map.get('https://www.metaborong.com/blog/foo/')
    const bar = map.get('https://www.metaborong.com/blog/bar/')
    expect(foo).toBeDefined()
    expect(bar).toBeDefined()
    expect((foo!.lastModified as Date).toISOString()).toBe(t1.toISOString())
    expect((bar!.lastModified as Date).toISOString()).toBe(t2.toISOString())
  })

  it('excludes draft posts', async () => {
    await testHandle.db.insert(postsTable).values({
      slug: 'still-cooking',
      title: 'Cooking',
      status: 'draft',
      author_name: 'admin',
    })
    const sitemap = await loadSitemap()
    const out = await sitemap()
    const urls = out.map((e) => e.url)
    expect(urls).not.toContain('https://www.metaborong.com/blog/still-cooking/')
  })

  it('walks pagination — emits all posts beyond a single page', async () => {
    // PAGE_SIZE in app/sitemap.ts is 50; insert 60 to force a second page.
    for (let i = 0; i < 60; i++) {
      const slug = `post-${String(i).padStart(3, '0')}`
      await insertPublished(slug, `Post ${i}`, new Date(2026, 3, 1, 0, i))
    }
    const sitemap = await loadSitemap()
    const out = await sitemap()
    // 2 fixed entries + 60 posts.
    expect(out).toHaveLength(62)
    for (let i = 0; i < 60; i++) {
      const slug = `post-${String(i).padStart(3, '0')}`
      expect(out.some((e) => e.url === `https://www.metaborong.com/blog/${slug}/`))
        .toBe(true)
    }
  })
})
