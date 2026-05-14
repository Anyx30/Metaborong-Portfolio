import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'
import { randomUUID } from 'node:crypto'

// SUT bootstraps `db` from `@/db/client`. Mock that to a per-test
// mongodb-memory-server-backed handle so each test starts with a clean
// DB. The proxy `get db()` is re-evaluated on every access, picking up
// `testHandle` after each beforeEach reassignment.
vi.mock('server-only', () => ({}))
vi.mock('@/db/client', () => ({
  get db() { return testHandle.db },
}))

import { NextRequest, NextResponse } from 'next/server'
import { createTestDb, type TestDbHandle } from '@/db/test-utils'
import {
  CSRF_COOKIE,
  CSRF_HEADER,
  SESSION_COOKIE,
  createSession,
} from '@/lib/auth'
import type { PostDoc } from '@/db/schema'

let testHandle: TestDbHandle

beforeAll(() => {
  process.env.AUTH_SECRET = 'a'.repeat(48)
})

beforeEach(async () => {
  testHandle = await createTestDb()
  vi.resetModules()
})

async function loadRoute() {
  return await import('@/app/api/admin/posts/route')
}

async function bakedAuthCookies(): Promise<{ session: string; csrf: string }> {
  const res = NextResponse.json({ ok: true })
  await createSession(res, { email: 'admin@example.com' })
  const csrf = 'a'.repeat(64)
  return { session: res.cookies.get(SESSION_COOKIE)!.value, csrf }
}

function authedHeaders(creds: { session: string; csrf: string }, withCsrfHeader = true): Record<string, string> {
  const headers: Record<string, string> = {
    cookie: `${SESSION_COOKIE}=${creds.session}; ${CSRF_COOKIE}=${creds.csrf}`,
  }
  if (withCsrfHeader) headers[CSRF_HEADER] = creds.csrf
  return headers
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

// ── GET /api/admin/posts ─────────────────────────────────────────────────────

describe('GET /api/admin/posts', () => {
  it('returns 401 without a session', async () => {
    const { GET } = await loadRoute()
    const res = await GET(new NextRequest('http://localhost/api/admin/posts'))
    expect(res.status).toBe(401)
    expect((await res.json()).code).toBe('UNAUTHORIZED')
  })

  it('returns the empty list for a fresh DB', async () => {
    const creds = await bakedAuthCookies()
    const { GET } = await loadRoute()
    const res = await GET(new NextRequest('http://localhost/api/admin/posts', {
      headers: authedHeaders(creds, false),
    }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ posts: [] })
  })

  it('lists drafts and published with no filter', async () => {
    const creds = await bakedAuthCookies()
    await testHandle.db.collection<PostDoc>('posts').insertMany([
      makePost({ slug: 'a', title: 'A', status: 'draft' }),
      makePost({ slug: 'b', title: 'B', status: 'published', published_at: new Date() }),
    ])
    const { GET } = await loadRoute()
    const res = await GET(new NextRequest('http://localhost/api/admin/posts', {
      headers: authedHeaders(creds, false),
    }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.posts).toHaveLength(2)
  })

  it('respects ?status=draft filter', async () => {
    const creds = await bakedAuthCookies()
    await testHandle.db.collection<PostDoc>('posts').insertMany([
      makePost({ slug: 'a', title: 'A', status: 'draft' }),
      makePost({ slug: 'b', title: 'B', status: 'published', published_at: new Date() }),
    ])
    const { GET } = await loadRoute()
    const res = await GET(new NextRequest('http://localhost/api/admin/posts?status=draft', {
      headers: authedHeaders(creds, false),
    }))
    const body = await res.json()
    expect(body.posts).toHaveLength(1)
    expect(body.posts[0].slug).toBe('a')
  })

  it('returns 422 for an invalid ?status value', async () => {
    const creds = await bakedAuthCookies()
    const { GET } = await loadRoute()
    const res = await GET(new NextRequest('http://localhost/api/admin/posts?status=archived', {
      headers: authedHeaders(creds, false),
    }))
    expect(res.status).toBe(422)
    expect((await res.json()).code).toBe('VALIDATION_FAILED')
  })
})

// ── POST /api/admin/posts ────────────────────────────────────────────────────

describe('POST /api/admin/posts', () => {
  it('returns 403 when CSRF header is missing', async () => {
    const creds = await bakedAuthCookies()
    const { POST } = await loadRoute()
    const res = await POST(new NextRequest('http://localhost/api/admin/posts', {
      method: 'POST',
      headers: { ...authedHeaders(creds, false), 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'Hello' }),
    }))
    expect(res.status).toBe(403)
    expect((await res.json()).code).toBe('CSRF_FAILED')
  })

  it('returns 401 without a session', async () => {
    const { POST } = await loadRoute()
    const csrf = 'a'.repeat(64)
    const res = await POST(new NextRequest('http://localhost/api/admin/posts', {
      method: 'POST',
      headers: { cookie: `${CSRF_COOKIE}=${csrf}`, [CSRF_HEADER]: csrf, 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'Hello' }),
    }))
    expect(res.status).toBe(401)
  })

  it('creates a draft post with auto-generated slug from title', async () => {
    const creds = await bakedAuthCookies()
    const { POST } = await loadRoute()
    const res = await POST(new NextRequest('http://localhost/api/admin/posts', {
      method: 'POST',
      headers: { ...authedHeaders(creds), 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'My Cool Post!' }),
    }))
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.post.title).toBe('My Cool Post!')
    expect(body.post.slug).toBe('my-cool-post')
    expect(body.post.status).toBe('draft')
    expect(body.post.published_at).toBeNull()
  })

  it('accepts an explicit slug override', async () => {
    const creds = await bakedAuthCookies()
    const { POST } = await loadRoute()
    const res = await POST(new NextRequest('http://localhost/api/admin/posts', {
      method: 'POST',
      headers: { ...authedHeaders(creds), 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'Whatever', slug: 'custom-slug' }),
    }))
    expect(res.status).toBe(201)
    expect((await res.json()).post.slug).toBe('custom-slug')
  })

  it('returns 422 SLUG_CONFLICT on duplicate slug', async () => {
    const creds = await bakedAuthCookies()
    await testHandle.db.collection<PostDoc>('posts').insertOne(
      makePost({ slug: 'taken', title: 'Taken' }),
    )
    const { POST } = await loadRoute()
    const res = await POST(new NextRequest('http://localhost/api/admin/posts', {
      method: 'POST',
      headers: { ...authedHeaders(creds), 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'New', slug: 'taken' }),
    }))
    expect(res.status).toBe(422)
    const body = await res.json()
    expect(body.code).toBe('SLUG_CONFLICT')
    expect(body.field).toBe('slug')
  })

  it('returns 422 on missing title', async () => {
    const creds = await bakedAuthCookies()
    const { POST } = await loadRoute()
    const res = await POST(new NextRequest('http://localhost/api/admin/posts', {
      method: 'POST',
      headers: { ...authedHeaders(creds), 'content-type': 'application/json' },
      body: JSON.stringify({}),
    }))
    expect(res.status).toBe(422)
    const body = await res.json()
    expect(body.code).toBe('VALIDATION_FAILED')
    expect(body.field).toBe('title')
  })

  it('returns 422 on unknown body field (strict schema)', async () => {
    const creds = await bakedAuthCookies()
    const { POST } = await loadRoute()
    const res = await POST(new NextRequest('http://localhost/api/admin/posts', {
      method: 'POST',
      headers: { ...authedHeaders(creds), 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'OK', status: 'published' }),
    }))
    expect(res.status).toBe(422)
  })

  it('returns 422 on malformed JSON body', async () => {
    const creds = await bakedAuthCookies()
    const { POST } = await loadRoute()
    const res = await POST(new NextRequest('http://localhost/api/admin/posts', {
      method: 'POST',
      headers: { ...authedHeaders(creds), 'content-type': 'application/json' },
      body: '{not-json',
    }))
    expect(res.status).toBe(422)
  })
})
