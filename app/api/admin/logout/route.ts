// POST /api/admin/logout
//
// Body: empty
// 2xx: { ok: true }
// Non-2xx: §2.2 error envelope
//
// Edge cases owned by this handler:
//   - 403 CSRF_FAILED if the X-CSRF-Token header doesn't match mb_csrf cookie
//   - Always clears both cookies; even if there was no session, idempotent.
//
// We deliberately do NOT 401 here when no session exists — calling logout
// without a session is harmless. We only fail on CSRF mismatch, which would
// indicate a CSRF attempt against an authenticated user.

import { NextRequest, NextResponse } from 'next/server'
import { clearSession, requireCsrf } from '../../../../lib/auth'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const csrfFail = requireCsrf(req)
  if (csrfFail) return csrfFail

  const res = NextResponse.json({ ok: true })
  clearSession(res)
  return res
}
