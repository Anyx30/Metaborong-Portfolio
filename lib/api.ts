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
 * Pulls the caller's IP for rate-limiting. Order matches the spec:
 *   1. x-forwarded-for first segment
 *   2. x-real-ip
 *   3. request.ip (Vercel edge runtime; undefined under Node runtime)
 * Whitespace stripped. Returns 'unknown' if nothing was provided so a
 * shared bucket still applies — better than letting the limiter no-op.
 */
export function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for')
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
