// Sitemap tests — exercise the SUT against a mongodb-memory-server-backed
// posts collection.
//
// listPublishedPosts() is the only data source, so we mock @/db/client and
// seed posts directly via the Db handle. Pagination is verified with
// > PAGE_SIZE posts so the cursor-walk in app/sitemap.ts is actually
// exercised (PAGE_SIZE = 50 in the SUT).

import { describe, expect, it, beforeEach, vi } from 'vitest'
import { randomUUID } from 'node:crypto'

vi.mock('server-only', () => ({}))
vi.mock('@/db/client', () => ({
  get db() { return testHandle.db },
}))

import { createTestDb, type TestDbHandle } from '@/db/test-utils'
import type { PostDoc } from '@/db/schema'

let testHandle: TestDbHandle

beforeEach(async () => {
  testHandle = await createTestDb()
  vi.resetModules()
})

async function loadSitemap() {
  return (await import('@/app/sitemap')).default
}

function makePost(overrides: Partial<PostDoc> & Pick<PostDoc, 'slug' | 'title'>): PostDoc {
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
    ...overrides,
  }
}

async function insertPublished(slug: string, title: string, updatedAt: Date) {
  await testHandle.db.collection<PostDoc>('posts').insertOne(makePost({
    slug,
    title,
    status: 'published',
    published_at: new Date(updatedAt.getTime() - 1000),
    updated_at: updatedAt,
    created_at: updatedAt,
  }))
}

// Static-route count: homepage + /blog/ + /services/ overview + 3 pillar
// hubs + 16 v1 published leaves. Sourced from services-data.ts.
const STATIC_ROUTE_COUNT = 22

describe('app/sitemap.ts', () => {
  it('emits homepage, /blog/, /services/ overview, pillar hubs and v1 leaves with no posts', async () => {
    const sitemap = await loadSitemap()
    const out = await sitemap()
    const urls = out.map((e) => e.url)
    expect(urls).toContain('https://www.metaborong.com/')
    expect(urls).toContain('https://www.metaborong.com/blog/')
    expect(urls).toContain('https://www.metaborong.com/services/')
    expect(urls).toContain('https://www.metaborong.com/services/ai/')
    expect(urls).toContain('https://www.metaborong.com/services/web3/')
    expect(urls).toContain('https://www.metaborong.com/services/product-studio/')
    expect(urls).toContain(
      'https://www.metaborong.com/services/web3/decentralized-identity-did-integration/',
    )
    // Coming-soon leaves must be excluded.
    expect(urls).not.toContain(
      'https://www.metaborong.com/services/ai/ai-adoption-roadmap/',
    )
    expect(urls).not.toContain(
      'https://www.metaborong.com/services/product-studio/frontend-engineering/',
    )
    expect(urls).toHaveLength(STATIC_ROUTE_COUNT)
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
    await testHandle.db.collection<PostDoc>('posts').insertOne(makePost({
      slug: 'still-cooking',
      title: 'Cooking',
      status: 'draft',
    }))
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
    expect(out).toHaveLength(STATIC_ROUTE_COUNT + 60)
    for (let i = 0; i < 60; i++) {
      const slug = `post-${String(i).padStart(3, '0')}`
      expect(out.some((e) => e.url === `https://www.metaborong.com/blog/${slug}/`))
        .toBe(true)
    }
  })
})
