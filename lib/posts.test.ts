import { describe, it, expect } from 'vitest'
import { createTestDb } from '@/db/test-utils'
import { posts } from '@/db/schema'
import {
  getPostBySlug,
  getDraftPostById,
  listPublishedPosts,
  listAllPostsForAdmin,
  rowToPost,
  rowToSummary,
  slugifyTitle,
} from '@/lib/posts'

// Helper: insert a post and return the row.
type InsertOpts = {
  slug: string
  title: string
  status?: 'draft' | 'published'
  tags?: string[]
  publishedAt?: Date | null
  geoVariants?: Record<string, unknown>
  excerpt?: string
}
async function insertPost(db: ReturnType<typeof createTestDb>['db'], opts: InsertOpts) {
  const r = await db.insert(posts).values({
    slug: opts.slug,
    title: opts.title,
    status: opts.status ?? 'draft',
    tags: opts.tags ?? [],
    author_name: 'admin',
    excerpt: opts.excerpt ?? null,
    published_at: opts.publishedAt ?? null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    geo_variants: (opts.geoVariants ?? {}) as any,
  }).returning()
  return r[0]
}

describe('slugifyTitle', () => {
  it('lowercases, replaces spaces with hyphens, drops punctuation', () => {
    expect(slugifyTitle('Hello, World!')).toBe('hello-world')
    expect(slugifyTitle('  Web3 / DeFi protocols  ')).toBe('web3-defi-protocols')
  })

  it('falls back to "untitled" when input is empty after normalisation', () => {
    expect(slugifyTitle('!!!')).toBe('untitled')
    expect(slugifyTitle('')).toBe('untitled')
  })

  it('caps at 80 chars', () => {
    const big = 'word '.repeat(50)
    expect(slugifyTitle(big).length).toBeLessThanOrEqual(80)
  })

  it('matches the postSchema slug regex', () => {
    const re = /^[a-z0-9]+(-[a-z0-9]+)*$/
    expect(re.test(slugifyTitle('My Cool Post'))).toBe(true)
    expect(re.test(slugifyTitle('Already-Slugged'))).toBe(true)
  })
})

describe('rowToPost / rowToSummary', () => {
  it('emits ISO strings for timestamps', async () => {
    const { db } = createTestDb()
    const row = await insertPost(db, {
      slug: 'a', title: 'A', publishedAt: new Date('2026-01-01T00:00:00Z'), status: 'published',
    })
    const post = rowToPost(row)
    expect(typeof post.created_at).toBe('string')
    expect(post.created_at.endsWith('Z')).toBe(true)
    expect(post.published_at).toBe('2026-01-01T00:00:00.000Z')
  })

  it('summary marks has_geo_variants from the column', async () => {
    const { db } = createTestDb()
    const a = await insertPost(db, { slug: 'a', title: 'A' })
    const b = await insertPost(db, { slug: 'b', title: 'B', geoVariants: { US: { title: 'x' } } })
    expect(rowToSummary(a).has_geo_variants).toBe(false)
    expect(rowToSummary(b).has_geo_variants).toBe(true)
  })
})

describe('getPostBySlug', () => {
  it('returns a published post', async () => {
    const { db } = createTestDb()
    await insertPost(db, { slug: 'hello', title: 'Hello', status: 'published', publishedAt: new Date() })
    const post = await getPostBySlug('hello', 'OTHER', db)
    expect(post?.slug).toBe('hello')
    expect(post?.title).toBe('Hello')
  })

  it('returns null for a draft post (never exposes drafts publicly)', async () => {
    const { db } = createTestDb()
    await insertPost(db, { slug: 'draft', title: 'Draft', status: 'draft' })
    expect(await getPostBySlug('draft', 'OTHER', db)).toBeNull()
  })

  it('returns null for a missing slug', async () => {
    const { db } = createTestDb()
    expect(await getPostBySlug('nope', 'OTHER', db)).toBeNull()
  })

  it('merges US variant when region=US and variant exists', async () => {
    const { db } = createTestDb()
    await insertPost(db, {
      slug: 'geo', title: 'Base', status: 'published', publishedAt: new Date(),
      geoVariants: { US: { title: 'US title', excerpt: 'US excerpt' } },
    })
    const post = await getPostBySlug('geo', 'US', db)
    expect(post?.title).toBe('US title')
    expect(post?.excerpt).toBe('US excerpt')
  })

  it('falls back to base when region=OTHER even if US variant exists', async () => {
    const { db } = createTestDb()
    await insertPost(db, {
      slug: 'geo', title: 'Base', status: 'published', publishedAt: new Date(),
      geoVariants: { US: { title: 'US title' } },
    })
    const post = await getPostBySlug('geo', 'OTHER', db)
    expect(post?.title).toBe('Base')
  })
})

describe('listPublishedPosts', () => {
  it('orders by published_at DESC', async () => {
    const { db } = createTestDb()
    await insertPost(db, {
      slug: 'old', title: 'Old', status: 'published',
      publishedAt: new Date('2024-01-01'),
    })
    await insertPost(db, {
      slug: 'new', title: 'New', status: 'published',
      publishedAt: new Date('2026-01-01'),
    })
    await insertPost(db, {
      slug: 'mid', title: 'Mid', status: 'published',
      publishedAt: new Date('2025-01-01'),
    })
    const { posts: list } = await listPublishedPosts({}, db)
    expect(list.map((p) => p.slug)).toEqual(['new', 'mid', 'old'])
  })

  it('excludes drafts', async () => {
    const { db } = createTestDb()
    await insertPost(db, {
      slug: 'pub', title: 'Pub', status: 'published', publishedAt: new Date(),
    })
    await insertPost(db, { slug: 'draft', title: 'Draft', status: 'draft' })
    const { posts: list, total } = await listPublishedPosts({}, db)
    expect(total).toBe(1)
    expect(list[0].slug).toBe('pub')
  })

  it('respects tag filter', async () => {
    const { db } = createTestDb()
    await insertPost(db, {
      slug: 'web3', title: 'A', status: 'published', publishedAt: new Date(),
      tags: ['web3'],
    })
    await insertPost(db, {
      slug: 'ai',   title: 'B', status: 'published', publishedAt: new Date(),
      tags: ['ai'],
    })
    await insertPost(db, {
      slug: 'both', title: 'C', status: 'published', publishedAt: new Date(),
      tags: ['web3', 'ai'],
    })
    const { posts: list } = await listPublishedPosts({ tag: 'web3' }, db)
    expect(list.map((p) => p.slug).sort()).toEqual(['both', 'web3'])
  })

  it('paginates with hasMore set correctly', async () => {
    const { db } = createTestDb()
    for (let i = 0; i < 7; i++) {
      await insertPost(db, {
        slug: `p${i}`, title: `P${i}`, status: 'published',
        publishedAt: new Date(2026, 0, i + 1),
      })
    }
    const page1 = await listPublishedPosts({ page: 1, perPage: 3 }, db)
    expect(page1.posts.length).toBe(3)
    expect(page1.total).toBe(7)
    expect(page1.hasMore).toBe(true)

    const page3 = await listPublishedPosts({ page: 3, perPage: 3 }, db)
    expect(page3.posts.length).toBe(1)
    expect(page3.hasMore).toBe(false)
  })
})

describe('getDraftPostById', () => {
  it('returns drafts (admin caller is responsible for auth)', async () => {
    const { db } = createTestDb()
    const row = await insertPost(db, { slug: 'd', title: 'D', status: 'draft' })
    const post = await getDraftPostById(row.id, db)
    expect(post?.id).toBe(row.id)
    expect(post?.status).toBe('draft')
  })

  it('returns null for a missing id', async () => {
    const { db } = createTestDb()
    expect(await getDraftPostById('00000000-0000-4000-a000-000000000000', db)).toBeNull()
  })
})

describe('listAllPostsForAdmin', () => {
  it('lists every post when status="all"', async () => {
    const { db } = createTestDb()
    await insertPost(db, { slug: 'a', title: 'A', status: 'draft' })
    await insertPost(db, { slug: 'b', title: 'B', status: 'published', publishedAt: new Date() })
    const all = await listAllPostsForAdmin('all', db)
    expect(all.length).toBe(2)
  })

  it('filters by status', async () => {
    const { db } = createTestDb()
    await insertPost(db, { slug: 'a', title: 'A', status: 'draft' })
    await insertPost(db, { slug: 'b', title: 'B', status: 'published', publishedAt: new Date() })
    const drafts    = await listAllPostsForAdmin('draft', db)
    const published = await listAllPostsForAdmin('published', db)
    expect(drafts.map((p) => p.slug)).toEqual(['a'])
    expect(published.map((p) => p.slug)).toEqual(['b'])
  })

  it('orders by updated_at DESC', async () => {
    const { db } = createTestDb()
    const a = await insertPost(db, { slug: 'a', title: 'A' })
    // Slight delay to ensure distinct updated_at values
    await new Promise((r) => setTimeout(r, 5))
    const b = await insertPost(db, { slug: 'b', title: 'B' })
    expect(a.updated_at.getTime()).toBeLessThanOrEqual(b.updated_at.getTime())
    const list = await listAllPostsForAdmin('all', db)
    expect(list[0].slug).toBe('b')
    expect(list[1].slug).toBe('a')
  })
})
