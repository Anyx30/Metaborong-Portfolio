import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@/db/client', () => ({
  get db() { return testHandle.db },
  schema: undefined as unknown,
}))

import { NextRequest, NextResponse } from 'next/server'
import { createTestDb, type TestDbHandle } from '@/db/test-utils'
import {
  CSRF_COOKIE,
  CSRF_HEADER,
  SESSION_COOKIE,
  createSession,
} from '@/lib/auth'
import { images as imagesTable } from '@/db/schema'

let testHandle: TestDbHandle

beforeAll(() => {
  process.env.AUTH_SECRET = 'a'.repeat(48)
})

beforeEach(() => {
  testHandle = createTestDb()
  vi.resetModules()
})

async function loadRoute() {
  return await import('@/app/api/admin/images/[id]/route')
}

async function authedCookies() {
  const res = NextResponse.json({ ok: true })
  await createSession(res, { email: 'admin@example.com' })
  return {
    session: res.cookies.get(SESSION_COOKIE)!.value,
    csrf:    'a'.repeat(64),
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

async function seedImage() {
  const r = await testHandle.db.insert(imagesTable).values({
    blob_url: 'https://abc.public.blob.vercel-storage.com/images/x.webp',
    width:    100,
    height:   100,
    filename: 'orig.jpg',
  }).returning()
  return r[0]
}

const ctx = (id: string) => ({ params: Promise.resolve({ id }) })

describe('PATCH /api/admin/images/[id]', () => {
  it('returns 403 without CSRF', async () => {
    const c = await authedCookies()
    const row = await seedImage()
    const { PATCH } = await loadRoute()
    const res = await PATCH(
      new NextRequest('http://localhost/x', {
        method:  'PATCH',
        headers: authHeaders(c, false),
        body:    JSON.stringify({ alt: 'a cat on a mat' }),
      }),
      ctx(row.id),
    )
    expect(res.status).toBe(403)
    expect((await res.json()).code).toBe('CSRF_FAILED')
  })

  it('returns 401 without a session', async () => {
    const csrf = 'a'.repeat(64)
    const { PATCH } = await loadRoute()
    const res = await PATCH(
      new NextRequest('http://localhost/x', {
        method:  'PATCH',
        headers: { cookie: `${CSRF_COOKIE}=${csrf}`, [CSRF_HEADER]: csrf, 'content-type': 'application/json' },
        body:    JSON.stringify({ alt: 'a' }),
      }),
      ctx('00000000-0000-4000-a000-000000000001'),
    )
    expect(res.status).toBe(401)
  })

  it('returns 404 for a non-uuid id', async () => {
    const c = await authedCookies()
    const { PATCH } = await loadRoute()
    const res = await PATCH(
      new NextRequest('http://localhost/x', {
        method:  'PATCH',
        headers: authHeaders(c),
        body:    JSON.stringify({ alt: 'a' }),
      }),
      ctx('not-a-uuid'),
    )
    expect(res.status).toBe(404)
    expect((await res.json()).code).toBe('NOT_FOUND')
  })

  it('returns 404 when no image exists', async () => {
    const c = await authedCookies()
    const { PATCH } = await loadRoute()
    const res = await PATCH(
      new NextRequest('http://localhost/x', {
        method:  'PATCH',
        headers: authHeaders(c),
        body:    JSON.stringify({ alt: 'a' }),
      }),
      ctx('00000000-0000-4000-a000-000000000001'),
    )
    expect(res.status).toBe(404)
  })

  it('updates alt and focal coordinates', async () => {
    const c = await authedCookies()
    const row = await seedImage()
    const { PATCH } = await loadRoute()
    const res = await PATCH(
      new NextRequest('http://localhost/x', {
        method:  'PATCH',
        headers: authHeaders(c),
        body:    JSON.stringify({ alt: 'A red square', focal_x: 0.25, focal_y: 0.75 }),
      }),
      ctx(row.id),
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.image.id).toBe(row.id)
    expect(body.image.alt).toBe('A red square')
    expect(body.image.focal_x).toBeCloseTo(0.25, 5)
    expect(body.image.focal_y).toBeCloseTo(0.75, 5)
    // Filename / url / dimensions are NOT touched.
    expect(body.image.blob_url).toBe(row.blob_url)
    expect(body.image.filename).toBe(row.filename)
  })

  it('returns 422 for focal_x > 1', async () => {
    const c = await authedCookies()
    const row = await seedImage()
    const { PATCH } = await loadRoute()
    const res = await PATCH(
      new NextRequest('http://localhost/x', {
        method:  'PATCH',
        headers: authHeaders(c),
        body:    JSON.stringify({ focal_x: 1.5 }),
      }),
      ctx(row.id),
    )
    expect(res.status).toBe(422)
    const body = await res.json()
    expect(body.code).toBe('VALIDATION_FAILED')
    expect(body.field).toBe('focal_x')
  })

  it('returns 422 for negative focal_y', async () => {
    const c = await authedCookies()
    const row = await seedImage()
    const { PATCH } = await loadRoute()
    const res = await PATCH(
      new NextRequest('http://localhost/x', {
        method:  'PATCH',
        headers: authHeaders(c),
        body:    JSON.stringify({ focal_y: -0.1 }),
      }),
      ctx(row.id),
    )
    expect(res.status).toBe(422)
    expect((await res.json()).field).toBe('focal_y')
  })

  it('returns 422 for unknown body fields (strict)', async () => {
    const c = await authedCookies()
    const row = await seedImage()
    const { PATCH } = await loadRoute()
    const res = await PATCH(
      new NextRequest('http://localhost/x', {
        method:  'PATCH',
        headers: authHeaders(c),
        body:    JSON.stringify({ blob_url: 'https://evil/' }),
      }),
      ctx(row.id),
    )
    expect(res.status).toBe(422)
    expect((await res.json()).code).toBe('VALIDATION_FAILED')
  })

  it('returns 422 for malformed JSON', async () => {
    const c = await authedCookies()
    const row = await seedImage()
    const { PATCH } = await loadRoute()
    const res = await PATCH(
      new NextRequest('http://localhost/x', {
        method:  'PATCH',
        headers: authHeaders(c),
        body:    '{not-json',
      }),
      ctx(row.id),
    )
    expect(res.status).toBe(422)
    expect((await res.json()).code).toBe('VALIDATION_FAILED')
  })

  it('allows alt-only update without changing focal coords', async () => {
    const c = await authedCookies()
    const row = await seedImage()
    const { PATCH } = await loadRoute()
    const res = await PATCH(
      new NextRequest('http://localhost/x', {
        method:  'PATCH',
        headers: authHeaders(c),
        body:    JSON.stringify({ alt: 'just alt' }),
      }),
      ctx(row.id),
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.image.alt).toBe('just alt')
    expect(body.image.focal_x).toBe(0.5)
    expect(body.image.focal_y).toBe(0.5)
  })

  it('allows an empty body and returns the existing row unchanged', async () => {
    const c = await authedCookies()
    const row = await seedImage()
    const { PATCH } = await loadRoute()
    const res = await PATCH(
      new NextRequest('http://localhost/x', {
        method:  'PATCH',
        headers: authHeaders(c),
        body:    JSON.stringify({}),
      }),
      ctx(row.id),
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.image.id).toBe(row.id)
    expect(body.image.alt).toBe(row.alt)
  })

  it('accepts focal_x at the boundary value 0', async () => {
    const c = await authedCookies()
    const row = await seedImage()
    const { PATCH } = await loadRoute()
    const res = await PATCH(
      new NextRequest('http://localhost/x', {
        method:  'PATCH',
        headers: authHeaders(c),
        body:    JSON.stringify({ focal_x: 0 }),
      }),
      ctx(row.id),
    )
    expect(res.status).toBe(200)
    expect((await res.json()).image.focal_x).toBe(0)
  })

  it('accepts focal_y at the boundary value 1', async () => {
    const c = await authedCookies()
    const row = await seedImage()
    const { PATCH } = await loadRoute()
    const res = await PATCH(
      new NextRequest('http://localhost/x', {
        method:  'PATCH',
        headers: authHeaders(c),
        body:    JSON.stringify({ focal_y: 1 }),
      }),
      ctx(row.id),
    )
    expect(res.status).toBe(200)
    expect((await res.json()).image.focal_y).toBe(1)
  })
})
