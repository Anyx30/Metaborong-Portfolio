import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'
import { randomUUID } from 'node:crypto'

vi.mock('server-only', () => ({}))
vi.mock('@/db/client', () => ({
  get db() { return testHandle.db },
}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

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

async function authedCookies() {
  const res = NextResponse.json({ ok: true })
  await createSession(res, { email: 'admin@example.com' })
  return { session: res.cookies.get(SESSION_COOKIE)!.value, csrf: 'a'.repeat(64) }
}

function authHeaders(c: { session: string; csrf: string }, withCsrf = true): Record<string, string> {
  const headers: Record<string, string> = {
    cookie: `${SESSION_COOKIE}=${c.session}; ${CSRF_COOKIE}=${c.csrf}`,
  }
  if (withCsrf) headers[CSRF_HEADER] = c.csrf
  return headers
}

const ctx = (id: string) => ({ params: Promise.resolve({ id }) })

async function seedPost(opts: { slug?: string; status?: 'draft' | 'published'; publishedAt?: Date | null } = {}): Promise<PostDoc> {
  const now = new Date()
  const doc: PostDoc = {
    _id:                       randomUUID(),
    slug:                      opts.slug ?? 's',
    title:                     'T',
    excerpt:                   null,
    status:                    opts.status ?? 'draft',
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
    published_at:              opts.publishedAt ?? null,
    created_at:                now,
    updated_at:                now,
  }
  await testHandle.db.collection<PostDoc>('posts').insertOne(doc)
  return doc
}

async function loadPublish() {
  return await import('@/app/api/admin/posts/[id]/publish/route')
}
async function loadUnpublish() {
  return await import('@/app/api/admin/posts/[id]/unpublish/route')
}

// ── publish ──────────────────────────────────────────────────────────────────

describe('POST /api/admin/posts/[id]/publish', () => {
  it('403 without CSRF', async () => {
    const c = await authedCookies()
    const row = await seedPost()
    const { POST } = await loadPublish()
    const res = await POST(
      new NextRequest('http://localhost/x', { method: 'POST', headers: authHeaders(c, false) }),
      ctx(row._id),
    )
    expect(res.status).toBe(403)
  })

  it('401 without session', async () => {
    const csrf = 'a'.repeat(64)
    const { POST } = await loadPublish()
    const res = await POST(
      new NextRequest('http://localhost/x', {
        method: 'POST', headers: { cookie: `${CSRF_COOKIE}=${csrf}`, [CSRF_HEADER]: csrf },
      }),
      ctx('00000000-0000-4000-a000-000000000001'),
    )
    expect(res.status).toBe(401)
  })

  it('404 on missing id', async () => {
    const c = await authedCookies()
    const { POST } = await loadPublish()
    const res = await POST(
      new NextRequest('http://localhost/x', { method: 'POST', headers: authHeaders(c) }),
      ctx('00000000-0000-4000-a000-000000000001'),
    )
    expect(res.status).toBe(404)
  })

  it('first publish sets status=published and stamps published_at', async () => {
    const c = await authedCookies()
    const row = await seedPost({ status: 'draft', publishedAt: null })
    const { POST } = await loadPublish()
    const res = await POST(
      new NextRequest('http://localhost/x', { method: 'POST', headers: authHeaders(c) }),
      ctx(row._id),
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.post.status).toBe('published')
    expect(body.post.published_at).toBeTruthy()
    expect(typeof body.post.published_at).toBe('string')
  })

  it('republish keeps the original published_at (idempotent timestamp)', async () => {
    const c = await authedCookies()
    const original = new Date('2026-01-01T00:00:00Z')
    const row = await seedPost({ status: 'published', publishedAt: original })
    const { POST } = await loadPublish()
    const res = await POST(
      new NextRequest('http://localhost/x', { method: 'POST', headers: authHeaders(c) }),
      ctx(row._id),
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.post.published_at).toBe('2026-01-01T00:00:00.000Z')
  })

  it('calls revalidatePath for /blog and /blog/[slug]', async () => {
    const { revalidatePath } = await import('next/cache')
    const c = await authedCookies()
    const row = await seedPost({ slug: 'hi' })
    const { POST } = await loadPublish()
    await POST(
      new NextRequest('http://localhost/x', { method: 'POST', headers: authHeaders(c) }),
      ctx(row._id),
    )
    const calls = (revalidatePath as unknown as ReturnType<typeof vi.fn>).mock.calls
    expect(calls.some(([p]) => p === '/blog')).toBe(true)
    expect(calls.some(([p]) => p === '/blog/hi')).toBe(true)
  })
})

// ── unpublish ────────────────────────────────────────────────────────────────

describe('POST /api/admin/posts/[id]/unpublish', () => {
  it('403 without CSRF', async () => {
    const c = await authedCookies()
    const row = await seedPost({ status: 'published', publishedAt: new Date() })
    const { POST } = await loadUnpublish()
    const res = await POST(
      new NextRequest('http://localhost/x', { method: 'POST', headers: authHeaders(c, false) }),
      ctx(row._id),
    )
    expect(res.status).toBe(403)
  })

  it('404 on missing id', async () => {
    const c = await authedCookies()
    const { POST } = await loadUnpublish()
    const res = await POST(
      new NextRequest('http://localhost/x', { method: 'POST', headers: authHeaders(c) }),
      ctx('00000000-0000-4000-a000-000000000001'),
    )
    expect(res.status).toBe(404)
  })

  it('flips status to draft and PRESERVES published_at', async () => {
    const c = await authedCookies()
    const original = new Date('2026-02-02T12:00:00Z')
    const row = await seedPost({ status: 'published', publishedAt: original })
    const { POST } = await loadUnpublish()
    const res = await POST(
      new NextRequest('http://localhost/x', { method: 'POST', headers: authHeaders(c) }),
      ctx(row._id),
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.post.status).toBe('draft')
    // published_at MUST survive an unpublish so re-publish can restore it
    expect(body.post.published_at).toBe('2026-02-02T12:00:00.000Z')
  })

  it('revalidates /blog and the slug page', async () => {
    const { revalidatePath } = await import('next/cache')
    const c = await authedCookies()
    const row = await seedPost({ slug: 'gone', status: 'published', publishedAt: new Date() })
    const { POST } = await loadUnpublish()
    await POST(
      new NextRequest('http://localhost/x', { method: 'POST', headers: authHeaders(c) }),
      ctx(row._id),
    )
    const calls = (revalidatePath as unknown as ReturnType<typeof vi.fn>).mock.calls
    expect(calls.some(([p]) => p === '/blog')).toBe(true)
    expect(calls.some(([p]) => p === '/blog/gone')).toBe(true)
  })
})
