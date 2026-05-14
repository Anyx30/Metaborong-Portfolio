// raw.md route tests — verify a published post returns markdown and a
// missing/draft slug returns 404. Exercises the full getPostBySlug →
// blocksToMarkdown → text/markdown pipeline.

import { describe, expect, it, beforeEach, vi } from 'vitest'
import { randomUUID } from 'node:crypto'

vi.mock('server-only', () => ({}))
vi.mock('@/db/client', () => ({
  get db() { return testHandle.db },
}))
vi.mock('next/headers', () => ({
  headers: async () => new Headers(),
}))

import { NextRequest } from 'next/server'
import { createTestDb, type TestDbHandle } from '@/db/test-utils'
import type { PostDoc } from '@/db/schema'
import type { Block } from '@/lib/blog-schema'

let testHandle: TestDbHandle

beforeEach(async () => {
  testHandle = await createTestDb()
  vi.resetModules()
})

async function loadRoute() {
  return await import('@/app/blog/[slug]/raw.md/route')
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

describe('GET /blog/[slug]/raw.md', () => {
  it('returns 200 text/markdown for a published post', async () => {
    const blocks: Block[] = [
      { id: '1', type: 'heading',   data: { text: 'Section', level: 2 } },
      { id: '2', type: 'paragraph', data: { text: 'A thing.' } },
    ]
    await testHandle.db.collection<PostDoc>('posts').insertOne(makePost({
      slug: 'hello-world',
      title: 'Hello world',
      status: 'published',
      author_name: 'Arnab Ray',
      excerpt: 'A brief intro.',
      tags: ['tag1', 'tag2'],
      content_json: blocks,
      published_at: new Date('2026-04-12T08:00:00Z'),
    }))

    const { GET } = await loadRoute()
    const res = await GET(
      new NextRequest('http://localhost/blog/hello-world/raw.md'),
      { params: Promise.resolve({ slug: 'hello-world' }) },
    )
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('text/markdown; charset=utf-8')
    const text = await res.text()
    expect(text).toContain('# Hello world')
    expect(text).toContain('A brief intro.')
    expect(text).toContain('## Section')
    expect(text).toContain('A thing.')
    expect(text).toContain('Author: Arnab Ray')
    expect(text).toContain('Tags: tag1, tag2')
    expect(text).toContain('Canonical: https://www.metaborong.com/blog/hello-world/')
  })

  it('returns 404 text/plain for a missing post', async () => {
    const { GET } = await loadRoute()
    const res = await GET(
      new NextRequest('http://localhost/blog/nope/raw.md'),
      { params: Promise.resolve({ slug: 'nope' }) },
    )
    expect(res.status).toBe(404)
    expect(res.headers.get('content-type')).toBe('text/plain; charset=utf-8')
  })

  it('returns 404 for a draft post (published-only readers)', async () => {
    await testHandle.db.collection<PostDoc>('posts').insertOne(makePost({
      slug: 'still-cooking',
      title: 'Cooking',
      status: 'draft',
    }))
    const { GET } = await loadRoute()
    const res = await GET(
      new NextRequest('http://localhost/blog/still-cooking/raw.md'),
      { params: Promise.resolve({ slug: 'still-cooking' }) },
    )
    expect(res.status).toBe(404)
  })
})
