// Tester pass — Bucket F (concurrent writes + races).
//
// Two parallel cms_create_draft calls with the SAME slug must produce
// exactly one Mongo row: the unique index on posts.slug enforces the
// race-safety at the driver level (E11000 on duplicate), and the
// createPost() helper translates that into SLUG_CONFLICT for the loser.
//
// The dispatch §3 Bucket F asked us to "verify the MCP error envelope
// carries data.code='SLUG_TAKEN'". BE shipped the existing 'SLUG_CONFLICT'
// vocabulary instead (matches lib/blog-schema.ts errorCodeSchema, which
// is used everywhere else in /api/admin/**). This file pins the actually-
// shipped code; the discrepancy with the dispatch wording is logged in
// the report as a LOW finding under "naming parity".
//
// For two parallel cms_patch_post calls on the same id, v1 is last-
// write-wins — no optimistic concurrency. We verify both succeed and
// that whichever wrote last is the surviving state.

import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import { createTestDb, type TestDbHandle } from '@/db/test-utils'
import { buildToolRegistry, type CreateDraftInput, type PatchPostInput } from '@/lib/mcp/tools'
import { randomUUID } from 'node:crypto'
import type { PostDoc } from '@/db/schema'

let testHandle: TestDbHandle

beforeAll(() => {
  process.env.MCP_ADMIN_TOKEN = 'race-token-' + 'z'.repeat(32)
})

beforeEach(async () => {
  testHandle = await createTestDb()
})

function registry() {
  return buildToolRegistry({ dbHandle: testHandle.db })
}

describe('Bucket F — concurrent writes', () => {
  it('two parallel cms_create_draft with the same slug — exactly one wins', async () => {
    const tool = registry().cms_create_draft
    const input: CreateDraftInput = { title: 'Race', slug: 'race', markdown: '' }

    // Two settled-promise tracks so we can inspect both outcomes.
    const results = await Promise.allSettled([
      tool.handler(input),
      tool.handler(input),
    ])

    const fulfilled = results.filter((r) => r.status === 'fulfilled')
    const rejected  = results.filter((r) => r.status === 'rejected')

    // Exactly one winner, exactly one loser.
    expect(fulfilled.length).toBe(1)
    expect(rejected.length).toBe(1)

    // The loser carries the actually-shipped 'SLUG_CONFLICT' code.
    const loser = rejected[0] as PromiseRejectedResult
    expect(loser.reason).toMatchObject({ appCode: 'SLUG_CONFLICT', field: 'slug' })

    // Mongo has exactly one row for this slug.
    const count = await testHandle.db.collection<PostDoc>('posts').countDocuments({ slug: 'race' })
    expect(count).toBe(1)
  })

  it('two parallel cms_patch_post on the same id both succeed (last-write-wins, v1 acceptable)', async () => {
    // Seed a post.
    const seedId = randomUUID()
    const seed: PostDoc = {
      _id:                       seedId,
      slug:                      'lww',
      title:                     'original',
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
    }
    await testHandle.db.collection<PostDoc>('posts').insertOne(seed)

    const tool = registry().cms_patch_post
    const a: PatchPostInput = { id: seedId, fields: { title: 'from-A' } }
    const b: PatchPostInput = { id: seedId, fields: { title: 'from-B' } }

    const settled = await Promise.allSettled([
      tool.handler(a),
      tool.handler(b),
    ])
    expect(settled.every((r) => r.status === 'fulfilled')).toBe(true)

    // Both writes landed; the surviving title is whichever ran second.
    // We don't pin which one — Mongo's findOneAndUpdate ordering is
    // implementation-defined under concurrent writes — just that the
    // final state is one of the two and that it's NOT the seed.
    const row = await testHandle.db.collection<PostDoc>('posts').findOne({ _id: seedId })
    expect(row?.title === 'from-A' || row?.title === 'from-B').toBe(true)
  })
})
