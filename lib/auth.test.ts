import { describe, it, expect, beforeAll, vi } from 'vitest'

// `lib/auth.ts` has `import 'server-only'`, which throws in non-RSC
// contexts. Vitest is one such context, so stub the module before the
// real import.
vi.mock('server-only', () => ({}))

// A 32-byte secret is required by lib/auth.ts before any helper that
// signs/verifies a JWT is called. Set it before importing the SUT.
beforeAll(() => {
  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) {
    process.env.AUTH_SECRET = 'a'.repeat(48)
  }
})

import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import {
  hashPassword,
  verifyPassword,
  createSession,
  verifySession,
  clearSession,
  issueCsrfToken,
  verifyCsrf,
  requireCsrf,
  CSRF_COOKIE,
  CSRF_HEADER,
  SESSION_COOKIE,
} from '@/lib/auth'

const SECRET = () => new TextEncoder().encode(process.env.AUTH_SECRET as string)

function getSetCookie(res: NextResponse, name: string): string | undefined {
  // NextResponse exposes individual cookies via res.cookies.get(name) which
  // returns the value the route handler set. For flag assertions we read
  // raw Set-Cookie headers via res.headers.getSetCookie().
  return res.cookies.get(name)?.value
}

function getSetCookieRaw(res: NextResponse, name: string): string | undefined {
  const all = res.headers.getSetCookie?.() ?? []
  return all.find((c) => c.startsWith(`${name}=`))
}

describe('lib/auth — passwords', () => {
  it('hashPassword + verifyPassword round-trip', async () => {
    const hash = await hashPassword('hunter2')
    expect(hash).toMatch(/^\$2[aby]?\$12\$/)
    expect(await verifyPassword('hunter2', hash)).toBe(true)
    expect(await verifyPassword('hunter3', hash)).toBe(false)
  })

  it('verifyPassword returns false for empty hash without throwing', async () => {
    expect(await verifyPassword('hunter2', '')).toBe(false)
    expect(await verifyPassword('hunter2', 'not-a-real-hash')).toBe(false)
  })
})

describe('lib/auth — sessions', () => {
  it('createSession → verifySession round-trip returns the same identity', async () => {
    const res = NextResponse.json({ ok: true })
    await createSession(res, { email: 'admin@example.com' })

    const token = getSetCookie(res, SESSION_COOKIE)
    expect(token).toBeTruthy()

    const identity = await verifySession(token)
    expect(identity).toEqual({ email: 'admin@example.com' })
  })

  it('verifySession returns null for an undefined token', async () => {
    expect(await verifySession(undefined)).toBeNull()
    expect(await verifySession('')).toBeNull()
    expect(await verifySession('not-a-jwt')).toBeNull()
  })

  it('verifySession rejects a tampered token (one-byte payload mutation)', async () => {
    const res = NextResponse.json({ ok: true })
    await createSession(res, { email: 'admin@example.com' })
    const token = getSetCookie(res, SESSION_COOKIE)!

    // JWT format: header.payload.signature. Flip one byte in the payload
    // segment so the signature no longer verifies.
    const [header, payload, sig] = token.split('.')
    const corruptedPayload = payload.slice(0, -1) + (payload.endsWith('A') ? 'B' : 'A')
    const tampered = [header, corruptedPayload, sig].join('.')

    expect(await verifySession(tampered)).toBeNull()
  })

  it('verifySession rejects an expired token', async () => {
    // Mint a token with exp in the past, signed with the same key.
    const past = Math.floor(Date.now() / 1000) - 60
    const expired = await new SignJWT({ email: 'admin@example.com' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(past - 60)
      .setExpirationTime(past)
      .setSubject('admin@example.com')
      .sign(SECRET())

    expect(await verifySession(expired)).toBeNull()
  })

  it('clearSession sets max-age=0 on both cookies', () => {
    const res = NextResponse.json({ ok: true })
    clearSession(res)
    const sessionRaw = getSetCookieRaw(res, SESSION_COOKIE)
    const csrfRaw = getSetCookieRaw(res, CSRF_COOKIE)
    expect(sessionRaw).toMatch(/Max-Age=0/i)
    expect(csrfRaw).toMatch(/Max-Age=0/i)
    // Session cookie remains HttpOnly even when clearing.
    expect(sessionRaw).toMatch(/HttpOnly/i)
    // CSRF cookie remains NOT HttpOnly even when clearing.
    expect(csrfRaw).not.toMatch(/HttpOnly/i)
  })
})

describe('lib/auth — CSRF', () => {
  it('issueCsrfToken sets a NOT-HttpOnly, SameSite=Lax cookie with a 32-byte hex value', () => {
    const res = NextResponse.json({ ok: true })
    const token = issueCsrfToken(res)
    expect(token).toMatch(/^[0-9a-f]{64}$/)
    expect(getSetCookie(res, CSRF_COOKIE)).toBe(token)

    const raw = getSetCookieRaw(res, CSRF_COOKIE)!
    expect(raw).not.toMatch(/HttpOnly/i)
    expect(raw).toMatch(/SameSite=Lax/i)
  })

  it('issueCsrfToken returns a fresh token on every call', () => {
    const r1 = NextResponse.json({})
    const r2 = NextResponse.json({})
    const t1 = issueCsrfToken(r1)
    const t2 = issueCsrfToken(r2)
    expect(t1).not.toBe(t2)
  })

  it('verifyCsrf passes when cookie matches header', () => {
    const token = 'a'.repeat(64)
    const req = new NextRequest('http://localhost/x', {
      method: 'POST',
      headers: {
        cookie: `${CSRF_COOKIE}=${token}`,
        [CSRF_HEADER]: token,
      },
    })
    expect(verifyCsrf(req)).toBe(true)
  })

  it('verifyCsrf fails on mismatch', () => {
    const req = new NextRequest('http://localhost/x', {
      method: 'POST',
      headers: {
        cookie: `${CSRF_COOKIE}=aaaa`,
        [CSRF_HEADER]: 'bbbb',
      },
    })
    expect(verifyCsrf(req)).toBe(false)
  })

  it('verifyCsrf fails when cookie is absent', () => {
    const req = new NextRequest('http://localhost/x', {
      method: 'POST',
      headers: { [CSRF_HEADER]: 'bbbb' },
    })
    expect(verifyCsrf(req)).toBe(false)
  })

  it('verifyCsrf fails when header is absent', () => {
    const req = new NextRequest('http://localhost/x', {
      method: 'POST',
      headers: { cookie: `${CSRF_COOKIE}=aaaa` },
    })
    expect(verifyCsrf(req)).toBe(false)
  })

  it('requireCsrf returns 403 NextResponse on mismatch with §2.2 envelope', async () => {
    const req = new NextRequest('http://localhost/x', {
      method: 'POST',
      headers: { cookie: `${CSRF_COOKIE}=aaaa`, [CSRF_HEADER]: 'bbbb' },
    })
    const result = requireCsrf(req)
    expect(result).toBeInstanceOf(NextResponse)
    const body = await result!.json()
    expect(result!.status).toBe(403)
    expect(body).toMatchObject({ code: 'CSRF_FAILED' })
    expect(body.error).toBeTruthy()
  })

  it('requireCsrf returns null when CSRF passes', () => {
    const token = 'a'.repeat(64)
    const req = new NextRequest('http://localhost/x', {
      method: 'POST',
      headers: { cookie: `${CSRF_COOKIE}=${token}`, [CSRF_HEADER]: token },
    })
    expect(requireCsrf(req)).toBeNull()
  })
})
