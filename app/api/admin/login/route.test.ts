import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'

// SUT imports `import { db } from '../../../../db/client'`. The
// mongodb-memory-server-backed test DB is resolved per-test (each test
// starts with a fresh handle so rate-limit counters don't leak between
// describes).
vi.mock('server-only', () => ({}))

// We mock '@/db/client' here, then re-bind it to the per-test handle in
// beforeEach. Vitest 4 resolves the alias to the same module ID as the
// SUT's relative import, so this single mock is authoritative.
vi.mock('@/db/client', () => {
  return {
    get db() { return testHandle.db },
  }
})

import { NextRequest } from 'next/server'
import { createTestDb, type TestDbHandle } from '@/db/test-utils'
import { hashPassword, CSRF_COOKIE, SESSION_COOKIE } from '@/lib/auth'

let testHandle: TestDbHandle

beforeAll(async () => {
  process.env.AUTH_SECRET = 'a'.repeat(48)
  process.env.ADMIN_EMAIL = 'admin@example.com'
  process.env.ADMIN_PASSWORD_HASH = await hashPassword('hunter2')
})

beforeEach(async () => {
  // Fresh in-memory DB per test so rate-limit counters don't leak.
  testHandle = await createTestDb()
  vi.resetModules()
})

async function loadRoute() {
  // After resetModules, re-import the route handler so it picks up the
  // freshly-mocked db client.
  return await import('@/app/api/admin/login/route')
}

function makeRequest(body: unknown, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest('http://localhost:3000/api/admin/login', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': '203.0.113.7',
      ...headers,
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

describe('POST /api/admin/login — happy path', () => {
  it('returns 200 with { ok: true } and sets both cookies', async () => {
    const { POST } = await loadRoute()
    const res = await POST(makeRequest({ email: 'admin@example.com', password: 'hunter2' }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
    expect(res.cookies.get(SESSION_COOKIE)?.value).toBeTruthy()
    expect(res.cookies.get(CSRF_COOKIE)?.value).toMatch(/^[0-9a-f]{64}$/)
  })

  it('email match is case-insensitive', async () => {
    const { POST } = await loadRoute()
    const res = await POST(makeRequest({ email: 'Admin@Example.COM', password: 'hunter2' }))
    expect(res.status).toBe(200)
  })
})

describe('POST /api/admin/login — bad credentials', () => {
  it('bad password → 401 with §2.2 envelope and no cookies set', async () => {
    const { POST } = await loadRoute()
    const res = await POST(makeRequest({ email: 'admin@example.com', password: 'wrong' }))
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body).toMatchObject({ code: 'UNAUTHORIZED' })
    expect(body.error).toBeTruthy()
    expect(res.cookies.get(SESSION_COOKIE)).toBeUndefined()
    expect(res.cookies.get(CSRF_COOKIE)).toBeUndefined()
  })

  it('bad email → same 401 envelope (uniform error, no timing oracle)', async () => {
    const { POST } = await loadRoute()
    const res = await POST(makeRequest({ email: 'someone-else@example.com', password: 'hunter2' }))
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body).toMatchObject({ code: 'UNAUTHORIZED' })
    // The error message must NOT distinguish bad-email from bad-password.
    expect(body.error).toBe('invalid email or password')
  })
})

describe('POST /api/admin/login — validation', () => {
  it('empty body → 422 with VALIDATION_FAILED and a field path', async () => {
    const { POST } = await loadRoute()
    const res = await POST(makeRequest({}))
    expect(res.status).toBe(422)
    const body = await res.json()
    expect(body).toMatchObject({ code: 'VALIDATION_FAILED' })
    expect(body.field).toBeTruthy()
  })

  it('malformed JSON → 422', async () => {
    const { POST } = await loadRoute()
    const res = await POST(makeRequest('{not json'))
    expect(res.status).toBe(422)
    expect((await res.json()).code).toBe('VALIDATION_FAILED')
  })

  it('missing password → 422 with field=password', async () => {
    const { POST } = await loadRoute()
    const res = await POST(makeRequest({ email: 'a@b.co' }))
    expect(res.status).toBe(422)
    const body = await res.json()
    expect(body.code).toBe('VALIDATION_FAILED')
    expect(body.field).toBe('password')
  })
})

describe('POST /api/admin/login — rate limit (5 attempts / 15 min / IP)', () => {
  it('6th attempt returns 429 with RATE_LIMITED + Retry-After header', async () => {
    const { POST } = await loadRoute()
    // Five bad-password attempts to fill the bucket.
    for (let i = 0; i < 5; i++) {
      const r = await POST(makeRequest({ email: 'admin@example.com', password: 'wrong' }))
      expect(r.status).toBe(401)
    }
    // Sixth attempt is rate-limited regardless of credentials.
    const sixth = await POST(makeRequest({ email: 'admin@example.com', password: 'hunter2' }))
    expect(sixth.status).toBe(429)
    const retryAfter = sixth.headers.get('retry-after')
    expect(retryAfter).toBeTruthy()
    expect(Number(retryAfter)).toBeGreaterThan(0)
    const body = await sixth.json()
    expect(body).toMatchObject({ code: 'RATE_LIMITED' })
  })

  it('successful login on a previously-rate-limited IP wipes the counter', async () => {
    const { POST } = await loadRoute()
    // Four bad attempts (still under the limit).
    for (let i = 0; i < 4; i++) {
      await POST(makeRequest({ email: 'admin@example.com', password: 'wrong' }))
    }
    // Fifth attempt is good — succeeds AND clears the counter.
    const ok = await POST(makeRequest({ email: 'admin@example.com', password: 'hunter2' }))
    expect(ok.status).toBe(200)
    // A new round of 5 bad attempts should still all be 401, not 429,
    // because the counter was wiped.
    for (let i = 0; i < 5; i++) {
      const r = await POST(makeRequest({ email: 'admin@example.com', password: 'wrong' }))
      expect(r.status).toBe(401)
    }
  })

  it('rate limit is per-IP — a different IP is unaffected', async () => {
    const { POST } = await loadRoute()
    for (let i = 0; i < 5; i++) {
      await POST(makeRequest({ email: 'admin@example.com', password: 'wrong' }))
    }
    // First IP is now blocked.
    const blocked = await POST(makeRequest({ email: 'admin@example.com', password: 'hunter2' }))
    expect(blocked.status).toBe(429)
    // A second IP is independent.
    const free = await POST(
      makeRequest({ email: 'admin@example.com', password: 'hunter2' }, { 'x-forwarded-for': '198.51.100.42' }),
    )
    expect(free.status).toBe(200)
  })
})
