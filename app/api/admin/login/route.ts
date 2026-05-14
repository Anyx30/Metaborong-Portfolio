// POST /api/admin/login
//
// Body: { email, password }
// 2xx: { ok: true } + Set-Cookie (mb_admin_session, mb_csrf)
// Non-2xx: §2.2 error envelope
//
// Edge cases owned by this handler:
//   - 422 VALIDATION_FAILED on bad JSON / missing field
//   - 401 UNAUTHORIZED on bad email or bad password (uniform message; never
//     leak which one was wrong)
//   - 429 RATE_LIMITED with Retry-After when the same IP exceeds 5 failed
//     attempts in 15 minutes
//
// CSRF carve-out: this is the FIRST handshake, so no mb_csrf cookie has been
// issued yet. The CSRF cookie is issued in this response. Subsequent non-GET
// admin routes verify CSRF via lib/auth.requireCsrf().

import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { db } from '../../../../db/client'
import type { LoginAttemptDoc } from '../../../../db/schema'
import {
  createSession,
  issueCsrfToken,
  verifyPassword,
} from '../../../../lib/auth'
import { errorResponse, clientIp } from '../../../../lib/api'
import { loginBodySchema } from '../../../../lib/blog-schema'

export const runtime = 'nodejs' // bcryptjs needs Node, not edge

const RATE_WINDOW_SECONDS = 15 * 60
const RATE_MAX_ATTEMPTS   = 5

function loginAttempts() {
  return db.collection<LoginAttemptDoc>('login_attempts')
}

async function countRecentFailures(ip: string): Promise<number> {
  // The rate-limit window holds at most RATE_MAX_ATTEMPTS rows per IP — a
  // successful login wipes them, the limit gate refuses further work past
  // the cap, and the TTL index in db/collections.ts (3600s) keeps
  // stragglers bounded. Counting a small bounded set with countDocuments
  // is cheap and avoids reading rows we won't use.
  const since = new Date(Date.now() - RATE_WINDOW_SECONDS * 1000)
  return loginAttempts().countDocuments({
    ip,
    attempted_at: { $gte: since },
  })
}

async function recordFailure(ip: string): Promise<void> {
  await loginAttempts().insertOne({
    _id: randomUUID(),
    ip,
    attempted_at: new Date(),
  })
}

async function clearFailuresForIp(ip: string): Promise<void> {
  // Clean up the recent failures so a successful login zeroes the counter for
  // this IP. Older rows beyond the TTL window are auto-pruned by Mongo's
  // TTL monitor (db/collections.ts).
  await loginAttempts().deleteMany({ ip })
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req)

  // Rate-limit BEFORE doing any password work so a flood can't burn CPU.
  const failures = await countRecentFailures(ip)
  if (failures >= RATE_MAX_ATTEMPTS) {
    return errorResponse(
      429,
      'RATE_LIMITED',
      'too many login attempts; try again later',
      { retryAfterSeconds: RATE_WINDOW_SECONDS },
    )
  }

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return errorResponse(422, 'VALIDATION_FAILED', 'request body must be valid JSON')
  }

  const parsed = loginBodySchema.safeParse(raw)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    const field = issue?.path?.join('.') || undefined
    return errorResponse(422, 'VALIDATION_FAILED', issue?.message ?? 'invalid request body', { field })
  }
  const { email, password } = parsed.data

  const adminEmail = process.env.ADMIN_EMAIL?.trim()
  const adminHash  = process.env.ADMIN_PASSWORD_HASH?.trim()
  if (!adminEmail || !adminHash) {
    // Configuration error. Don't leak which env var is missing.
    return errorResponse(500, 'INTERNAL', 'admin login is not configured')
  }

  const emailMatches    = email.toLowerCase() === adminEmail.toLowerCase()
  // Always run the bcrypt compare to keep timing roughly constant whether
  // the email matched or not. If email doesn't match, the result is discarded.
  const passwordMatches = await verifyPassword(password, adminHash)

  if (!emailMatches || !passwordMatches) {
    await recordFailure(ip)
    return errorResponse(401, 'UNAUTHORIZED', 'invalid email or password')
  }

  await clearFailuresForIp(ip)

  const res = NextResponse.json({ ok: true })
  await createSession(res, { email: adminEmail })
  issueCsrfToken(res)
  return res
}
