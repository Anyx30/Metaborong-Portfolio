import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@/db/client', () => ({
  get db() { return testHandle.db },
  schema: undefined as unknown,
}))
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import { NextRequest, NextResponse } from 'next/server'
import { createTestDb, type TestDbHandle } from '@/db/test-utils'
import {
  CSRF_COOKIE,
  CSRF_HEADER,
  SESSION_COOKIE,
  createSession,
} from '@/lib/auth'
import { posts as postsTable } from '@/db/schema'

let testHandle: TestDbHandle

beforeAll(() => {
  process.env.AUTH_SECRET = 'a'.repeat(48)
})

beforeEach(() => {
  testHandle = createTestDb()
  vi.resetModules()
})

async function loadRoute() {
  return await import('@/app/api/admin/posts/[id]/route')
}

async function authedCookies() {
  const res = NextResponse.json({ ok: true })
  await createSession(res, { email: 'admin@example.com' })
  return {
    session: res.cookies.get(SESSION_COOKIE)!.value,
    csrf: 'a'.repeat(64),
  }
}

function authHeaders(c: { session: string; csrf: string }, withCsrf = true): Record<string, string> {
  const headers: Record<string, string> = {
    cookie: `${SESSION_COOKIE}=${c.session}; ${CSRF_COOKIE}=${c.csrf}`,
    'content-type': 'application/json',
  }
  if (withCsrf) headers[CSRF_HEADER] = c.csrf
  return headers
}

async function seedPost(opts: { slug?: string; status?: 'draft' | 'published'; published?: boolean } = {}) {
  const r = await testHandle.db.insert(postsTable).values({
    slug: opts.slug ?? 's',
    title: 'T',
    author_name: 'admin',
    status: opts.status ?? 'draft',
    published_at: opts.published ? new Date() : null,
  }).returning()
  return r[0]
}

const ctx = (id: string) => ({ params: Promise.resolve({ id }) })

// ── GET /api/admin/posts/[id] ────────────────────────────────────────────────

describe('GET /api/admin/posts/[id]', () => {
  it('401 without a session', async () => {
    const { GET } = await loadRoute()
    const res = await GET(new NextRequest('http://localhost/x'), ctx('00000000-0000-4000-a000-000000000001'))
    expect(res.status).toBe(401)
  })

  it('404 on a non-uuid id', async () => {
    const c = await authedCookies()
    const { GET } = await loadRoute()
    const res = await GET(
      new NextRequest('http://localhost/x', { headers: authHeaders(c, false) }),
      ctx('not-a-uuid'),
    )
    expect(res.status).toBe(404)
    expect((await res.json()).code).toBe('NOT_FOUND')
  })

  it('404 when no post exists for that id', async () => {
    const c = await authedCookies()
    const { GET } = await loadRoute()
    const res = await GET(
      new NextRequest('http://localhost/x', { headers: authHeaders(c, false) }),
      ctx('00000000-0000-4000-a000-000000000001'),
    )
    expect(res.status).toBe(404)
  })

  it('200 with the post for a valid id (drafts visible to admin)', async () => {
    const c = await authedCookies()
    const row = await seedPost({ status: 'draft' })
    const { GET } = await loadRoute()
    const res = await GET(
      new NextRequest('http://localhost/x', { headers: authHeaders(c, false) }),
      ctx(row.id),
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.post.id).toBe(row.id)
    expect(body.post.status).toBe('draft')
  })
})

// ── PATCH /api/admin/posts/[id] ──────────────────────────────────────────────

describe('PATCH /api/admin/posts/[id]', () => {
  it('403 without CSRF header', async () => {
    const c = await authedCookies()
    const row = await seedPost()
    const { PATCH } = await loadRoute()
    const res = await PATCH(
      new NextRequest('http://localhost/x', {
        method: 'PATCH',
        headers: authHeaders(c, false),
        body: JSON.stringify({ title: 'New' }),
      }),
      ctx(row.id),
    )
    expect(res.status).toBe(403)
  })

  it('401 without session even with valid CSRF', async () => {
    const csrf = 'a'.repeat(64)
    const { PATCH } = await loadRoute()
    const res = await PATCH(
      new NextRequest('http://localhost/x', {
        method: 'PATCH',
        headers: { cookie: `${CSRF_COOKIE}=${csrf}`, [CSRF_HEADER]: csrf, 'content-type': 'application/json' },
        body: JSON.stringify({ title: 'New' }),
      }),
      ctx('00000000-0000-4000-a000-000000000001'),
    )
    expect(res.status).toBe(401)
  })

  it('updates a draft post', async () => {
    const c = await authedCookies()
    const row = await seedPost()
    const { PATCH } = await loadRoute()
    const res = await PATCH(
      new NextRequest('http://localhost/x', {
        method: 'PATCH', headers: authHeaders(c),
        body: JSON.stringify({ title: 'Updated', tags: ['web3'] }),
      }),
      ctx(row.id),
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.post.title).toBe('Updated')
    expect(body.post.tags).toEqual(['web3'])
  })

  it('rejects unknown fields (strict body schema)', async () => {
    const c = await authedCookies()
    const row = await seedPost()
    const { PATCH } = await loadRoute()
    const res = await PATCH(
      new NextRequest('http://localhost/x', {
        method: 'PATCH', headers: authHeaders(c),
        body: JSON.stringify({ status: 'published' }),
      }),
      ctx(row.id),
    )
    expect(res.status).toBe(422)
    expect((await res.json()).code).toBe('VALIDATION_FAILED')
  })

  it('rejects slug change once post is published (slug-immutable)', async () => {
    const c = await authedCookies()
    const row = await seedPost({ slug: 'fixed', status: 'published', published: true })
    const { PATCH } = await loadRoute()
    const res = await PATCH(
      new NextRequest('http://localhost/x', {
        method: 'PATCH', headers: authHeaders(c),
        body: JSON.stringify({ slug: 'changed' }),
      }),
      ctx(row.id),
    )
    expect(res.status).toBe(422)
    const body = await res.json()
    expect(body.code).toBe('VALIDATION_FAILED')
    expect(body.field).toBe('slug')
    expect(body.error).toMatch(/immutable/i)
  })

  it('allows slug change for a never-published post', async () => {
    const c = await authedCookies()
    const row = await seedPost({ slug: 'old', status: 'draft' })
    const { PATCH } = await loadRoute()
    const res = await PATCH(
      new NextRequest('http://localhost/x', {
        method: 'PATCH', headers: authHeaders(c),
        body: JSON.stringify({ slug: 'new' }),
      }),
      ctx(row.id),
    )
    expect(res.status).toBe(200)
    expect((await res.json()).post.slug).toBe('new')
  })

  it('returns 422 SLUG_CONFLICT on duplicate slug', async () => {
    const c = await authedCookies()
    await seedPost({ slug: 'taken' })
    const target = await seedPost({ slug: 'mine' })
    const { PATCH } = await loadRoute()
    const res = await PATCH(
      new NextRequest('http://localhost/x', {
        method: 'PATCH', headers: authHeaders(c),
        body: JSON.stringify({ slug: 'taken' }),
      }),
      ctx(target.id),
    )
    expect(res.status).toBe(422)
    expect((await res.json()).code).toBe('SLUG_CONFLICT')
  })

  it('404 on missing id', async () => {
    const c = await authedCookies()
    const { PATCH } = await loadRoute()
    const res = await PATCH(
      new NextRequest('http://localhost/x', {
        method: 'PATCH', headers: authHeaders(c),
        body: JSON.stringify({ title: 'X' }),
      }),
      ctx('00000000-0000-4000-a000-000000000001'),
    )
    expect(res.status).toBe(404)
  })
})

// ── DELETE /api/admin/posts/[id] ─────────────────────────────────────────────

describe('DELETE /api/admin/posts/[id]', () => {
  it('403 without CSRF', async () => {
    const c = await authedCookies()
    const row = await seedPost()
    const { DELETE } = await loadRoute()
    const res = await DELETE(
      new NextRequest('http://localhost/x', { method: 'DELETE', headers: authHeaders(c, false) }),
      ctx(row.id),
    )
    expect(res.status).toBe(403)
  })

  it('404 on missing id', async () => {
    const c = await authedCookies()
    const { DELETE } = await loadRoute()
    const res = await DELETE(
      new NextRequest('http://localhost/x', { method: 'DELETE', headers: authHeaders(c) }),
      ctx('00000000-0000-4000-a000-000000000001'),
    )
    expect(res.status).toBe(404)
  })

  it('deletes the post and returns { ok: true }', async () => {
    const c = await authedCookies()
    const row = await seedPost()
    const { DELETE } = await loadRoute()
    const res = await DELETE(
      new NextRequest('http://localhost/x', { method: 'DELETE', headers: authHeaders(c) }),
      ctx(row.id),
    )
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
    // Row really gone
    const remaining = await testHandle.db.select().from(postsTable)
    expect(remaining.length).toBe(0)
  })
})
