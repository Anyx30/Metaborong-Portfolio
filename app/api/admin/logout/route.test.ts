import { describe, it, expect, beforeAll, vi } from 'vitest'

// SUT does not touch the database, so we still mock '@/db/client' to be a
// no-op — Vitest module resolution would otherwise complain when the
// proxy tries to read POSTGRES_URL during route load.
vi.mock('server-only', () => ({}))
vi.mock('@/db/client', () => ({ db: {}, schema: undefined }))

import { NextRequest, NextResponse } from 'next/server'
import {
  CSRF_COOKIE,
  CSRF_HEADER,
  SESSION_COOKIE,
  createSession,
  issueCsrfToken,
} from '@/lib/auth'
import { POST } from '@/app/api/admin/logout/route'

beforeAll(() => {
  process.env.AUTH_SECRET = 'a'.repeat(48)
})

async function bakedCookies(): Promise<{ session: string; csrf: string }> {
  // Build a fresh response with both cookies set, then read them back so we
  // can replay them onto subsequent requests as a real browser would.
  const res = NextResponse.json({ ok: true })
  await createSession(res, { email: 'admin@example.com' })
  issueCsrfToken(res)
  return {
    session: res.cookies.get(SESSION_COOKIE)!.value,
    csrf:    res.cookies.get(CSRF_COOKIE)!.value,
  }
}

function makeRequest(opts: {
  session?: string
  csrfCookie?: string
  csrfHeader?: string
}): NextRequest {
  const cookieParts: string[] = []
  if (opts.session)    cookieParts.push(`${SESSION_COOKIE}=${opts.session}`)
  if (opts.csrfCookie) cookieParts.push(`${CSRF_COOKIE}=${opts.csrfCookie}`)

  const headers: Record<string, string> = {}
  if (cookieParts.length)  headers.cookie = cookieParts.join('; ')
  if (opts.csrfHeader)     headers[CSRF_HEADER] = opts.csrfHeader

  return new NextRequest('http://localhost:3000/api/admin/logout', {
    method: 'POST',
    headers,
  })
}

describe('POST /api/admin/logout', () => {
  it('happy logout — 200, cookies cleared (Max-Age=0)', async () => {
    const { session, csrf } = await bakedCookies()
    const res = await POST(makeRequest({ session, csrfCookie: csrf, csrfHeader: csrf }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
    const setCookies = res.headers.getSetCookie?.() ?? []
    expect(setCookies.find((c) => c.startsWith(`${SESSION_COOKIE}=`))).toMatch(/Max-Age=0/i)
    expect(setCookies.find((c) => c.startsWith(`${CSRF_COOKIE}=`))).toMatch(/Max-Age=0/i)
  })

  it('missing CSRF header → 403 with code=CSRF_FAILED, no cookies cleared', async () => {
    const { session, csrf } = await bakedCookies()
    const res = await POST(makeRequest({ session, csrfCookie: csrf /* no header */ }))
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body).toMatchObject({ code: 'CSRF_FAILED' })
    expect(body.error).toBeTruthy()
    // 403 short-circuits before clearSession runs, so no Set-Cookie is emitted.
    const setCookies = res.headers.getSetCookie?.() ?? []
    expect(setCookies.length).toBe(0)
  })

  it('mismatched CSRF (cookie != header) → 403', async () => {
    const { session, csrf } = await bakedCookies()
    const res = await POST(makeRequest({
      session,
      csrfCookie: csrf,
      csrfHeader: 'a-different-token',
    }))
    expect(res.status).toBe(403)
    expect((await res.json()).code).toBe('CSRF_FAILED')
  })

  it('missing CSRF cookie → 403', async () => {
    const { session } = await bakedCookies()
    const res = await POST(makeRequest({
      session,
      csrfHeader: 'whatever',
      // no csrfCookie
    }))
    expect(res.status).toBe(403)
  })

  it('no session — still 200 (idempotent per BE handoff §5)', async () => {
    // CSRF is required even without a session. Build a CSRF pair on the fly.
    const csrf = 'a'.repeat(64)
    const res = await POST(makeRequest({
      csrfCookie: csrf,
      csrfHeader: csrf,
    }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
  })
})
