// Shared helpers for /api/admin/** route handlers.
//
// errorResponse() is the ONE way to emit a non-2xx body from any admin route.
// It guarantees the §2.2 error envelope shape: { error, code, field? }, with
// optional Retry-After / cache headers.
//
// Never include stack traces, env-var names, or upstream MCP URLs in the
// `error` field — those are server-side log material only.

import 'server-only'
import { NextResponse } from 'next/server'
import type { ErrorCode, ApiError } from './blog-schema'

export function errorResponse(
  status: number,
  code: ErrorCode,
  message: string,
  opts?: { field?: string; retryAfterSeconds?: number },
): NextResponse {
  const body: ApiError = { error: message, code }
  if (opts?.field) body.field = opts.field

  const headers: Record<string, string> = {}
  if (opts?.retryAfterSeconds != null) {
    headers['Retry-After'] = String(Math.max(1, Math.ceil(opts.retryAfterSeconds)))
  }

  return NextResponse.json(body, { status, headers })
}

/**
 * Detects whether the request was routed through Vercel's edge. Vercel
 * stamps every function invocation with `x-vercel-id` (and typically also
 * `x-vercel-forwarded-for`), so the presence of either is our signal that
 * the immediate proxy in front of this function is Vercel infrastructure
 * and any XFF segments it added are reliable.
 */
function isOnVercel(req: Request): boolean {
  return req.headers.get('x-vercel-id') !== null
    || req.headers.get('x-vercel-forwarded-for') !== null
}

/**
 * Pulls the caller's IP for rate-limiting.
 *
 * ── Trust boundary ───────────────────────────────────────────────────────
 * x-forwarded-for is an append-only chain: each hop adds the IP it saw on
 * the connecting socket to the END of the list. The leftmost segment was
 * supplied by the original peer and is ATTACKER-CONTROLLED unless we can
 * vouch for every hop in front of us. An attacker who can set
 * `X-Forwarded-For: 1.2.3.4` on their own request would otherwise land
 * each failed login in a different rate-limit bucket and bypass the
 * 5-attempts-per-IP cap entirely.
 *
 * We deploy on Vercel. When a request hits a Vercel function, Vercel's
 * edge appends the actual connecting peer's IP to XFF and stamps the
 * request with `x-vercel-id`. With multiple segments under that signal,
 * the rightmost-but-one segment is the IP Vercel's immediate upstream
 * saw — which on a normal browser request is the real client. The
 * rightmost segment is Vercel's own internal infra hop.
 *
 * Off Vercel (local dev, integration tests), there is no trust anchor on
 * XFF, so we fall back to the documented standard order:
 *   1. first (leftmost) XFF segment
 *   2. x-real-ip
 *   3. request.ip   (NextRequest under edge runtime)
 *
 * The 'unknown' fallback is intentional: a shared bucket still applies
 * pressure better than a no-op limiter.
 * ─────────────────────────────────────────────────────────────────────────
 */
export function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for')

  if (xff && isOnVercel(req)) {
    const segments = xff.split(',').map(s => s.trim()).filter(Boolean)
    if (segments.length >= 2) {
      // Rightmost-but-one: real client as Vercel's edge saw it on the
      // socket — attacker-supplied leading entries are skipped.
      return segments[segments.length - 2]
    }
    if (segments.length === 1) {
      // Single segment came from Vercel itself — safe to use.
      return segments[0]
    }
    // empty after parsing — fall through to other sources
  }

  // Off-Vercel / no XFF: standard order. The attacker-spoof concern
  // does not apply locally (no untrusted intermediary).
  if (xff) {
    const first = xff.split(',')[0]?.trim()
    if (first) return first
  }
  const real = req.headers.get('x-real-ip')?.trim()
  if (real) return real
  // request.ip is non-standard; available on NextRequest in edge runtime.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fromReq = (req as any).ip
  if (typeof fromReq === 'string' && fromReq.trim()) return fromReq.trim()
  return 'unknown'
}
