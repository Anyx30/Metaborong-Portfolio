import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest'

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
import { posts as postsTable, ai_readiness_attempts } from '@/db/schema'

// In-test override for what scanUrl returns / throws. Each test sets the
// next behavior; the mock below dispatches into it.
let scanResult: { mode: 'ok'; report: unknown } | { mode: 'throw'; err: unknown } | null = null
vi.mock('@/lib/ai-readiness/client', async () => {
  const actual = await vi.importActual<typeof import('@/lib/ai-readiness/client')>(
    '@/lib/ai-readiness/client',
  )
  return {
    ...actual,
    scanUrl: vi.fn(async () => {
      if (!scanResult) throw new Error('scanResult not set')
      if (scanResult.mode === 'throw') throw scanResult.err
      return scanResult.report
    }),
    isDisabled: vi.fn(() => disabledFlag),
  }
})

let testHandle: TestDbHandle
let disabledFlag = false

beforeAll(() => {
  process.env.AUTH_SECRET = 'a'.repeat(48)
})

beforeEach(() => {
  testHandle = createTestDb()
  disabledFlag = false
  scanResult = null
  vi.clearAllMocks()
})

afterEach(() => {
  vi.useRealTimers()
})

async function loadRoute() {
  vi.resetModules()
  return await import('@/app/api/admin/posts/[id]/ai-readiness/route')
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

async function seedPost(opts: { status?: 'draft' | 'published'; published?: boolean; score?: number; band?: string; report?: unknown; hash?: string; checkedAt?: Date | null } = {}) {
  const r = await testHandle.db.insert(postsTable).values({
    slug: 'sample-post',
    title: 'Sample',
    author_name: 'admin',
    status: opts.status ?? 'published',
    published_at: opts.published === false ? null : new Date('2026-05-01T00:00:00Z'),
    canonical_url: null,
    ai_readiness_score: opts.score ?? null,
    ai_readiness_band: opts.band ?? null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ai_readiness_report: (opts.report ?? null) as any,
    ai_readiness_content_hash: opts.hash ?? null,
    ai_readiness_checked_at: opts.checkedAt ?? null,
  }).returning()
  return r[0]
}

const ctx = (id: string) => ({ params: Promise.resolve({ id }) })

const sampleReport = {
  overallScore: 85,
  pageScore: 90,
  domainScore: 70,
  domainReputationBonus: 0,
  metadata: { title: 'T', description: 'D', analyzedAt: '2026-05-08T07:44:02Z' },
  checks: [
    { id: 'meta-tags', label: 'Metadata Quality', status: 'pass', score: 85, scope: 'page', details: 'ok', recommendation: 'great' },
  ],
}

// ── POST ─────────────────────────────────────────────────────────────────────

describe('POST /api/admin/posts/[id]/ai-readiness', () => {
  it('401 without a session', async () => {
    const csrf = 'a'.repeat(64)
    const { POST } = await loadRoute()
    const res = await POST(
      new NextRequest('http://localhost/x', {
        method: 'POST',
        headers: { cookie: `${CSRF_COOKIE}=${csrf}`, [CSRF_HEADER]: csrf },
      }),
      ctx('00000000-0000-4000-a000-000000000001'),
    )
    expect(res.status).toBe(401)
  })

  it('403 without CSRF', async () => {
    const c = await authedCookies()
    const { POST } = await loadRoute()
    const res = await POST(
      new NextRequest('http://localhost/x', {
        method: 'POST',
        headers: authHeaders(c, false),
      }),
      ctx('00000000-0000-4000-a000-000000000001'),
    )
    expect(res.status).toBe(403)
  })

  it('503 MCP_DISABLED when env is unset (before any DB read)', async () => {
    disabledFlag = true
    const c = await authedCookies()
    const { POST } = await loadRoute()
    const res = await POST(
      new NextRequest('http://localhost/x', {
        method: 'POST', headers: authHeaders(c),
      }),
      ctx('00000000-0000-4000-a000-000000000001'),
    )
    expect(res.status).toBe(503)
    const body = await res.json()
    expect(body.code).toBe('MCP_DISABLED')
    expect(body.error).not.toMatch(/AI_READINESS_/i) // never name env vars
  })

  it('404 NOT_FOUND on non-uuid id', async () => {
    const c = await authedCookies()
    const { POST } = await loadRoute()
    const res = await POST(
      new NextRequest('http://localhost/x', { method: 'POST', headers: authHeaders(c) }),
      ctx('not-a-uuid'),
    )
    expect(res.status).toBe(404)
  })

  it('404 when the post does not exist', async () => {
    const c = await authedCookies()
    const { POST } = await loadRoute()
    const res = await POST(
      new NextRequest('http://localhost/x', { method: 'POST', headers: authHeaders(c) }),
      ctx('00000000-0000-4000-a000-000000000099'),
    )
    expect(res.status).toBe(404)
    expect((await res.json()).code).toBe('NOT_FOUND')
  })

  it('409 POST_NOT_PUBLISHED when the post is a draft', async () => {
    const c = await authedCookies()
    const row = await seedPost({ status: 'draft', published: false })
    const { POST } = await loadRoute()
    const res = await POST(
      new NextRequest('http://localhost/x', { method: 'POST', headers: authHeaders(c) }),
      ctx(row.id),
    )
    expect(res.status).toBe(409)
    const body = await res.json()
    expect(body.code).toBe('POST_NOT_PUBLISHED')
    expect(body.error).toMatch(/v1\.5/)
  })

  it('runs a fresh scan, persists the row, returns cached:false', async () => {
    const c = await authedCookies()
    const row = await seedPost()
    scanResult = { mode: 'ok', report: sampleReport }
    const { POST } = await loadRoute()
    const res = await POST(
      new NextRequest('http://localhost/x', { method: 'POST', headers: authHeaders(c) }),
      ctx(row.id),
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.score).toBe(85)
    expect(body.band).toBe('strong')
    expect(body.cached).toBe(false)
    expect(typeof body.scannedAt).toBe('string')

    // Persisted: score, band, hash, checkedAt all populated.
    const stored = await testHandle.db.select().from(postsTable)
    expect(stored[0].ai_readiness_score).toBe(85)
    expect(stored[0].ai_readiness_band).toBe('strong')
    expect(stored[0].ai_readiness_content_hash).toBeTruthy()
    expect(stored[0].ai_readiness_checked_at).toBeTruthy()
  })

  it('content-hash cache hit: returns cached:true without invoking scanUrl', async () => {
    const c = await authedCookies()
    const { createHash } = await import('node:crypto')
    const row = await seedPost()
    // Compute the same hash the route will compute.
    const canonical = `https://www.metaborong.com/blog/${row.slug}/`
    const hash = createHash('sha256')
      .update(`${canonical}|${(row.updated_at as Date).toISOString()}`)
      .digest('hex')
    // Seed a cache hit: same hash, fresh checkedAt.
    await testHandle.db.update(postsTable).set({
      ai_readiness_score: 73,
      ai_readiness_band: 'adequate',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ai_readiness_report: { ...sampleReport, overallScore: 73 } as any,
      ai_readiness_content_hash: hash,
      ai_readiness_checked_at: new Date(),
    })

    // Make scanUrl explode if reached — proves we returned from cache.
    scanResult = { mode: 'throw', err: new Error('should-not-be-called') }

    const { POST } = await loadRoute()
    const res = await POST(
      new NextRequest('http://localhost/x', { method: 'POST', headers: authHeaders(c) }),
      ctx(row.id),
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.cached).toBe(true)
    expect(body.score).toBe(73)
    expect(body.band).toBe('adequate')
  })

  it('rate-limits the 31st request in the same hour with Retry-After', async () => {
    const c = await authedCookies()
    const row = await seedPost()
    // Pre-seed 30 attempts in the last hour for this admin.
    const now = new Date()
    for (let i = 0; i < 30; i++) {
      await testHandle.db.insert(ai_readiness_attempts).values({
        admin_email: 'admin@example.com',
        attempted_at: new Date(now.getTime() - i * 1000),
      })
    }
    scanResult = { mode: 'ok', report: sampleReport }
    const { POST } = await loadRoute()
    const res = await POST(
      new NextRequest('http://localhost/x', { method: 'POST', headers: authHeaders(c) }),
      ctx(row.id),
    )
    expect(res.status).toBe(429)
    expect(res.headers.get('Retry-After')).toBeTruthy()
    expect((await res.json()).code).toBe('RATE_LIMITED')
  })

  it('upstream timeout maps to 504 MCP_UPSTREAM_ERROR', async () => {
    const c = await authedCookies()
    const row = await seedPost()
    const { McpTimeoutError } = await import('@/lib/ai-readiness/client')
    scanResult = { mode: 'throw', err: new McpTimeoutError() }
    const { POST } = await loadRoute()
    const res = await POST(
      new NextRequest('http://localhost/x', { method: 'POST', headers: authHeaders(c) }),
      ctx(row.id),
    )
    expect(res.status).toBe(504)
    expect((await res.json()).code).toBe('MCP_UPSTREAM_ERROR')
  })

  it('upstream auth fail surfaces as 503 MCP_DISABLED (no token state leakage)', async () => {
    const c = await authedCookies()
    const row = await seedPost()
    const { McpAuthError } = await import('@/lib/ai-readiness/client')
    scanResult = { mode: 'throw', err: new McpAuthError(401) }
    const { POST } = await loadRoute()
    const res = await POST(
      new NextRequest('http://localhost/x', { method: 'POST', headers: authHeaders(c) }),
      ctx(row.id),
    )
    expect(res.status).toBe(503)
    expect((await res.json()).code).toBe('MCP_DISABLED')
  })

  it('upstream 5xx maps to 502 MCP_UPSTREAM_ERROR', async () => {
    const c = await authedCookies()
    const row = await seedPost()
    const { McpUpstreamError } = await import('@/lib/ai-readiness/client')
    scanResult = { mode: 'throw', err: new McpUpstreamError(500) }
    const { POST } = await loadRoute()
    const res = await POST(
      new NextRequest('http://localhost/x', { method: 'POST', headers: authHeaders(c) }),
      ctx(row.id),
    )
    expect(res.status).toBe(502)
    expect((await res.json()).code).toBe('MCP_UPSTREAM_ERROR')
  })

  it('malformed payload maps to 502 MCP_UPSTREAM_ERROR', async () => {
    const c = await authedCookies()
    const row = await seedPost()
    const { McpInvalidPayloadError } = await import('@/lib/ai-readiness/client')
    scanResult = { mode: 'throw', err: new McpInvalidPayloadError('Zod fail') }
    const { POST } = await loadRoute()
    const res = await POST(
      new NextRequest('http://localhost/x', { method: 'POST', headers: authHeaders(c) }),
      ctx(row.id),
    )
    expect(res.status).toBe(502)
  })
})

// ── GET ──────────────────────────────────────────────────────────────────────

describe('GET /api/admin/posts/[id]/ai-readiness', () => {
  it('401 without a session', async () => {
    const { GET } = await loadRoute()
    const res = await GET(
      new NextRequest('http://localhost/x'),
      ctx('00000000-0000-4000-a000-000000000001'),
    )
    expect(res.status).toBe(401)
  })

  it('404 NOT_SCORED when the post has never been scanned', async () => {
    const c = await authedCookies()
    const row = await seedPost()
    const { GET } = await loadRoute()
    const res = await GET(
      new NextRequest('http://localhost/x', { headers: authHeaders(c, false) }),
      ctx(row.id),
    )
    expect(res.status).toBe(404)
    expect((await res.json()).code).toBe('NOT_SCORED')
  })

  it('404 NOT_FOUND when the post does not exist', async () => {
    const c = await authedCookies()
    const { GET } = await loadRoute()
    const res = await GET(
      new NextRequest('http://localhost/x', { headers: authHeaders(c, false) }),
      ctx('00000000-0000-4000-a000-000000000099'),
    )
    expect(res.status).toBe(404)
    expect((await res.json()).code).toBe('NOT_FOUND')
  })

  it('200 with the stored score / band / report / scannedAt', async () => {
    const c = await authedCookies()
    const checkedAt = new Date('2026-05-07T12:00:00Z')
    const row = await seedPost({
      score: 73,
      band: 'adequate',
      report: { ...sampleReport, overallScore: 73 },
      hash: 'deadbeef',
      checkedAt,
    })
    const { GET } = await loadRoute()
    const res = await GET(
      new NextRequest('http://localhost/x', { headers: authHeaders(c, false) }),
      ctx(row.id),
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.score).toBe(73)
    expect(body.band).toBe('adequate')
    expect(body.scannedAt).toBe(checkedAt.toISOString())
    expect(body.report.overallScore).toBe(73)
  })
})
