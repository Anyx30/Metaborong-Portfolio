// Server-only auth helpers for the admin surface.
//
// Note on the API surface: the Frontend stub that previously lived here
// exposed `getAdminSession()` / `AdminSession`. Those names are preserved
// here so FE callers do not break. The full BE surface adds:
//   - hashPassword / verifyPassword (bcryptjs, cost 12)
//   - createSession / verifySession / clearSession (jose-signed JWT in
//     mb_admin_session, HttpOnly + Secure + SameSite=Lax, 30-day TTL)
//   - issueCsrfToken / verifyCsrf / requireCsrf (double-submit cookie;
//     mb_csrf is NOT HttpOnly so client JS can read it and echo as
//     X-CSRF-Token)
//   - requireAdmin (returns identity or 401 NextResponse with the §2.2 envelope)

import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { errorResponse } from './api'

export const SESSION_COOKIE = 'mb_admin_session'
export const CSRF_COOKIE    = 'mb_csrf'
export const CSRF_HEADER    = 'X-CSRF-Token'

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30 // 30 days
const BCRYPT_COST         = 12

// ── env access ────────────────────────────────────────────────────────────────

function authSecret(): Uint8Array {
  const raw = process.env.AUTH_SECRET
  if (!raw || raw.length < 32) {
    throw new Error('AUTH_SECRET is not configured (must be at least 32 chars)')
  }
  return new TextEncoder().encode(raw)
}

// ── password ──────────────────────────────────────────────────────────────────

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_COST)
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  if (!hash) return false
  try {
    return await bcrypt.compare(plain, hash)
  } catch {
    return false
  }
}

// ── session ───────────────────────────────────────────────────────────────────

export interface AdminSession {
  email: string
}

// Backwards-compat alias kept so other call sites stay clean.
export type AdminIdentity = AdminSession

type SessionClaims = AdminSession & {
  iat: number
  exp: number
}

export async function createSession(res: NextResponse, identity: AdminSession): Promise<void> {
  const now = Math.floor(Date.now() / 1000)
  const jwt = await new SignJWT({ email: identity.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + SESSION_TTL_SECONDS)
    .setSubject(identity.email)
    .sign(authSecret())

  res.cookies.set(SESSION_COOKIE, jwt, {
    path:     '/',
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   SESSION_TTL_SECONDS,
  })
}

export async function verifySession(token: string | undefined): Promise<AdminSession | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify<SessionClaims>(token, authSecret(), {
      algorithms: ['HS256'],
    })
    if (typeof payload.email !== 'string' || !payload.email) return null
    return { email: payload.email }
  } catch {
    return null
  }
}

export function clearSession(res: NextResponse): void {
  res.cookies.set(SESSION_COOKIE, '', {
    path:     '/',
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   0,
  })
  res.cookies.set(CSRF_COOKIE, '', {
    path:     '/',
    httpOnly: false,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   0,
  })
}

/**
 * Read and validate the admin session from the request's cookie jar.
 *
 * - With no argument: uses next/headers cookies() (server components, server
 *   actions, default for app/admin/layout.tsx).
 * - With a NextRequest: reads from req.cookies (route handlers).
 *
 * Returns null on missing or invalid session — never throws.
 */
export async function getAdminSession(req?: NextRequest): Promise<AdminSession | null> {
  const token = req
    ? req.cookies.get(SESSION_COOKIE)?.value
    : (await cookies()).get(SESSION_COOKIE)?.value
  return verifySession(token)
}

/**
 * Common pattern for admin route handlers:
 *
 *   const guard = await requireAdmin(req)
 *   if (guard instanceof NextResponse) return guard
 *   const identity = guard
 */
export async function requireAdmin(req: NextRequest): Promise<AdminSession | NextResponse> {
  const identity = await getAdminSession(req)
  if (!identity) {
    return errorResponse(401, 'UNAUTHORIZED', 'authentication required')
  }
  return identity
}

// ── CSRF ──────────────────────────────────────────────────────────────────────

function randomHex(byteLen: number): string {
  const bytes = new Uint8Array(byteLen)
  crypto.getRandomValues(bytes)
  let out = ''
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, '0')
  }
  return out
}

export function issueCsrfToken(res: NextResponse): string {
  const token = randomHex(32)
  res.cookies.set(CSRF_COOKIE, token, {
    path:     '/',
    httpOnly: false, // client JS must read this and echo as X-CSRF-Token
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   SESSION_TTL_SECONDS,
  })
  return token
}

function timingSafeStringEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

export function verifyCsrf(req: NextRequest): boolean {
  const cookieToken = req.cookies.get(CSRF_COOKIE)?.value
  const headerToken = req.headers.get(CSRF_HEADER)
  if (!cookieToken || !headerToken) return false
  return timingSafeStringEquals(cookieToken, headerToken)
}

/**
 * Use this in every NON-GET admin handler EXCEPT login (which has its own
 * carve-out for the first hit, since no mb_csrf cookie exists yet).
 */
export function requireCsrf(req: NextRequest): NextResponse | null {
  if (verifyCsrf(req)) return null
  return errorResponse(403, 'CSRF_FAILED', 'CSRF validation failed')
}
