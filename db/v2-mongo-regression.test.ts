// v2-mongo Tester regression probes.
//
// The dispatch (cms/v2-mongo-test, 2026-05-14) calls out two seams that
// the existing route-handler test suites don't naturally exercise:
//
//   Bucket A — schema + index behaviour (uniqueness, TTL, _id shape).
//   Bucket F — ensureIndexes idempotency under repeat calls on the same Db.
//
// Both run against mongodb-memory-server via createTestDb(), matching the
// production index spec one-for-one. If a future BE refactor drops a TTL
// or re-shapes _id from string-UUID back to ObjectId, these probes catch
// it before it ships.
//
// Co-located with db/test-utils.ts per the dispatch §4 directive.

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { randomUUID } from 'node:crypto'

vi.mock('server-only', () => ({}))

import { createTestDb, type TestDbHandle } from './test-utils'
import { ensureIndexes } from './collections'
import type {
  PostDoc,
  ImageDoc,
  LoginAttemptDoc,
  AiReadinessAttemptDoc,
} from './schema'

let handle: TestDbHandle

beforeEach(async () => {
  handle = await createTestDb()
})

// UUID v4 regex — same shape route handlers' UUID_RE accepts.
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

// ── Bucket A.1 — unique slug constraint ──────────────────────────────────────

describe('Bucket A · posts.slug unique constraint', () => {
  function makePost(overrides: Partial<PostDoc> & Pick<PostDoc, 'slug'>): PostDoc {
    const now = new Date()
    const { slug, ...rest } = overrides
    return {
      _id:                       randomUUID(),
      slug,
      title:                     'Sample',
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
      ...rest,
    }
  }

  it('rejects a duplicate slug with E11000 (sequential insert)', async () => {
    const posts = handle.db.collection<PostDoc>('posts')
    await posts.insertOne(makePost({ slug: 'taken' }))
    let err: unknown
    try {
      await posts.insertOne(makePost({ slug: 'taken' }))
    } catch (e) {
      err = e
    }
    expect(err).toBeDefined()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((err as any).code).toBe(11000)
  })

  // Bucket D.1 — concurrent slug race must collapse to exactly one winner.
  it('Bucket D · two concurrent inserts on the same slug → exactly one wins', async () => {
    const posts = handle.db.collection<PostDoc>('posts')
    const results = await Promise.allSettled([
      posts.insertOne(makePost({ slug: 'race' })),
      posts.insertOne(makePost({ slug: 'race' })),
    ])
    const ok     = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected')
    expect(ok).toBe(1)
    expect(failed).toHaveLength(1)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reason = (failed[0] as PromiseRejectedResult).reason as any
    expect(reason?.code).toBe(11000)
    // Exactly one row materialised.
    expect(await posts.countDocuments({ slug: 'race' })).toBe(1)
  })
})

// ── Bucket A.2 — compound (status, published_at desc) is present ─────────────

describe('Bucket A · posts compound index for listing', () => {
  it('posts collection lists the (status, published_at desc) index', async () => {
    const indexes = await handle.db.collection('posts').indexes()
    const byName = indexes.find((i) => i.name === 'posts_status_published_at')
    expect(byName).toBeDefined()
    expect(byName!.key).toEqual({ status: 1, published_at: -1 })
  })

  it('posts.slug unique index is named posts_slug_unique and is unique', async () => {
    const indexes = await handle.db.collection('posts').indexes()
    const slugIdx = indexes.find((i) => i.name === 'posts_slug_unique')
    expect(slugIdx).toBeDefined()
    expect(slugIdx!.unique).toBe(true)
    expect(slugIdx!.key).toEqual({ slug: 1 })
  })

  it('posts.tags multikey index exists for tag-filter listing', async () => {
    const indexes = await handle.db.collection('posts').indexes()
    expect(indexes.find((i) => i.name === 'posts_tags')).toBeDefined()
  })
})

// ── Bucket A.3 — TTL indexes with expected windows ───────────────────────────

describe('Bucket A · TTL indexes', () => {
  it('login_attempts has TTL=3600s on attempted_at', async () => {
    const indexes = await handle.db.collection('login_attempts').indexes()
    const ttl = indexes.find((i) => i.name === 'login_attempts_ttl')
    expect(ttl).toBeDefined()
    expect(ttl!.expireAfterSeconds).toBe(3600)
    expect(ttl!.key).toEqual({ attempted_at: 1 })
  })

  it('login_attempts has (ip, attempted_at desc) for the rate-limit query', async () => {
    const indexes = await handle.db.collection('login_attempts').indexes()
    const idx = indexes.find((i) => i.name === 'login_attempts_ip_attempted_at')
    expect(idx).toBeDefined()
    expect(idx!.key).toEqual({ ip: 1, attempted_at: -1 })
  })

  it('ai_readiness_attempts has TTL=7200s on attempted_at', async () => {
    const indexes = await handle.db.collection('ai_readiness_attempts').indexes()
    const ttl = indexes.find((i) => i.name === 'ai_readiness_attempts_ttl')
    expect(ttl).toBeDefined()
    expect(ttl!.expireAfterSeconds).toBe(7200)
    expect(ttl!.key).toEqual({ attempted_at: 1 })
  })

  it('ai_readiness_attempts has (admin_email, attempted_at desc) for the rate query', async () => {
    const indexes = await handle.db.collection('ai_readiness_attempts').indexes()
    const idx = indexes.find((i) => i.name === 'ai_readiness_attempts_admin_attempted_at')
    expect(idx).toBeDefined()
    expect(idx!.key).toEqual({ admin_email: 1, attempted_at: -1 })
  })
})

// ── Bucket A.4 — images keyset pagination index ──────────────────────────────

describe('Bucket A · images compound (created_at desc, _id desc) index', () => {
  it('images collection lists images_created_at_id with the expected shape', async () => {
    const indexes = await handle.db.collection('images').indexes()
    const idx = indexes.find((i) => i.name === 'images_created_at_id')
    expect(idx).toBeDefined()
    expect(idx!.key).toEqual({ created_at: -1, _id: -1 })
  })
})

// ── Bucket A.5 — _id is a UUID string (not ObjectId) on every insert path ────

describe('Bucket A · _id is a UUID v4 string everywhere we insert', () => {
  it('posts insert via the lib seed shape produces a UUID v4 _id', async () => {
    const _id = randomUUID()
    await handle.db.collection<PostDoc>('posts').insertOne({
      _id,
      slug:                      'uuid-shape',
      title:                     'X',
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
      created_at:                new Date(),
      updated_at:                new Date(),
    })
    const row = await handle.db.collection<PostDoc>('posts').findOne({ slug: 'uuid-shape' })
    expect(row).toBeDefined()
    expect(typeof row!._id).toBe('string')
    expect(UUID_V4.test(row!._id)).toBe(true)
  })

  it('images insert produces a UUID v4 _id', async () => {
    const _id = randomUUID()
    await handle.db.collection<ImageDoc>('images').insertOne({
      _id,
      blob_url:   'https://example.com/x.webp',
      width:      10,
      height:     10,
      alt:        'a',
      focal_x:    0.5,
      focal_y:    0.5,
      filename:   'x.webp',
      created_at: new Date(),
    })
    const row = await handle.db.collection<ImageDoc>('images').findOne({ _id })
    expect(typeof row!._id).toBe('string')
    expect(UUID_V4.test(row!._id)).toBe(true)
  })

  it('login_attempts insert produces a UUID v4 _id', async () => {
    const _id = randomUUID()
    await handle.db.collection<LoginAttemptDoc>('login_attempts').insertOne({
      _id,
      ip:           '203.0.113.1',
      attempted_at: new Date(),
    })
    const row = await handle.db.collection<LoginAttemptDoc>('login_attempts').findOne({ _id })
    expect(typeof row!._id).toBe('string')
    expect(UUID_V4.test(row!._id)).toBe(true)
  })

  it('ai_readiness_attempts insert produces a UUID v4 _id', async () => {
    const _id = randomUUID()
    await handle.db.collection<AiReadinessAttemptDoc>('ai_readiness_attempts').insertOne({
      _id,
      admin_email:  'admin@example.com',
      attempted_at: new Date(),
    })
    const row = await handle.db.collection<AiReadinessAttemptDoc>('ai_readiness_attempts').findOne({ _id })
    expect(typeof row!._id).toBe('string')
    expect(UUID_V4.test(row!._id)).toBe(true)
  })
})

// ── Bucket F — ensureIndexes idempotency ─────────────────────────────────────

describe('Bucket F · ensureIndexes is idempotent across repeat calls', () => {
  it('calling ensureIndexes three times in a row throws no error', async () => {
    // First call already ran inside createTestDb(); the next two should be
    // no-ops per Mongo's createIndex idempotence contract.
    await expect(ensureIndexes(handle.db)).resolves.toBeUndefined()
    await expect(ensureIndexes(handle.db)).resolves.toBeUndefined()
    await expect(ensureIndexes(handle.db)).resolves.toBeUndefined()
  })

  it('repeat calls do not create duplicate indexes on any collection', async () => {
    await ensureIndexes(handle.db)
    await ensureIndexes(handle.db)
    await ensureIndexes(handle.db)

    const collections: Array<{ name: string; expectedNames: string[] }> = [
      {
        name: 'posts',
        expectedNames: [
          '_id_',
          'posts_slug_unique',
          'posts_status_published_at',
          'posts_tags',
        ],
      },
      {
        name: 'images',
        expectedNames: ['_id_', 'images_created_at_id'],
      },
      {
        name: 'login_attempts',
        expectedNames: ['_id_', 'login_attempts_ip_attempted_at', 'login_attempts_ttl'],
      },
      {
        name: 'ai_readiness_attempts',
        expectedNames: [
          '_id_',
          'ai_readiness_attempts_admin_attempted_at',
          'ai_readiness_attempts_ttl',
        ],
      },
    ]

    for (const c of collections) {
      const indexes = await handle.db.collection(c.name).indexes()
      const names = indexes.map((i) => i.name).sort()
      expect(names).toEqual([...c.expectedNames].sort())
    }
  })
})
