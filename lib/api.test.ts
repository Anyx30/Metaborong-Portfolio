// Tests for lib/api.ts — errorResponse() envelope shape and clientIp()
// trust-boundary behavior under Vercel + non-Vercel signatures.
//
// The clientIp() spoofing tests are M8-core hardening: they prove the
// function ignores attacker-supplied leading XFF segments when running
// behind Vercel's edge.

import { describe, it, expect, vi } from 'vitest'

// 'server-only' throws outside the Next runtime; shim to a no-op so the
// module loads under Vitest. Same pattern used by lib/auth.test.ts.
vi.mock('server-only', () => ({}))

const { errorResponse, clientIp } = await import('./api')

function reqWith(headers: Record<string, string>): Request {
  return new Request('https://example.test/api/admin/login', {
    method: 'POST',
    headers,
  })
}

describe('errorResponse', () => {
  it('emits a §2.2 envelope with code and message', async () => {
    const res = errorResponse(401, 'UNAUTHORIZED', 'sign in required')
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body).toEqual({ error: 'sign in required', code: 'UNAUTHORIZED' })
  })

  it('attaches a field path when provided', async () => {
    const res = errorResponse(422, 'VALIDATION_FAILED', 'too long', { field: 'title' })
    const body = await res.json()
    expect(body).toEqual({ error: 'too long', code: 'VALIDATION_FAILED', field: 'title' })
  })

  it('writes Retry-After when retryAfterSeconds is supplied', () => {
    const res = errorResponse(429, 'RATE_LIMITED', 'slow down', { retryAfterSeconds: 900 })
    expect(res.headers.get('Retry-After')).toBe('900')
  })

  it('clamps Retry-After to at least 1 second', () => {
    const res = errorResponse(429, 'RATE_LIMITED', 'slow down', { retryAfterSeconds: 0 })
    expect(res.headers.get('Retry-After')).toBe('1')
  })
})

describe('clientIp — trust boundary', () => {
  describe('on Vercel (x-vercel-id present)', () => {
    it('ignores attacker-spoofed leading XFF segments and returns the real-client position', () => {
      // Attacker tries `X-Forwarded-For: 1.1.1.1, 2.2.2.2` from their browser.
      // Vercel appends its observed peer (3.3.3.3) on ingest. The rightmost
      // segment (3.3.3.3) is Vercel's own infrastructure hop; the rightmost-
      // but-one (2.2.2.2) is what Vercel's edge saw on the socket — i.e.
      // the actual sender (the attacker themselves). Critically NOT 1.1.1.1,
      // which the attacker handed us.
      const req = reqWith({
        'x-forwarded-for': '1.1.1.1, 2.2.2.2, 3.3.3.3',
        'x-vercel-id':     'iad1::abc123',
      })
      expect(clientIp(req)).toBe('2.2.2.2')
    })

    it('rate-limit consequence: spoofed leading segment cannot evade the per-IP bucket', () => {
      // Two requests from the same attacker, each spoofing a DIFFERENT leading
      // XFF entry, must collide in the same bucket because Vercel-set entries
      // are identical for both.
      const a = reqWith({
        'x-forwarded-for': '9.9.9.9, 10.10.10.10, 50.50.50.50',
        'x-vercel-id':     'iad1::a',
      })
      const b = reqWith({
        'x-forwarded-for': '8.8.8.8, 10.10.10.10, 50.50.50.50',
        'x-vercel-id':     'iad1::b',
      })
      expect(clientIp(a)).toBe(clientIp(b))
    })

    it('returns the single segment when XFF has only one entry', () => {
      const req = reqWith({
        'x-forwarded-for': '203.0.113.7',
        'x-vercel-id':     'iad1::abc',
      })
      expect(clientIp(req)).toBe('203.0.113.7')
    })

    it('also recognizes x-vercel-forwarded-for as a Vercel signature', () => {
      const req = reqWith({
        'x-forwarded-for':         '1.1.1.1, 2.2.2.2, 3.3.3.3',
        'x-vercel-forwarded-for':  '2.2.2.2, 3.3.3.3',
      })
      expect(clientIp(req)).toBe('2.2.2.2')
    })

    it('falls back to x-real-ip when XFF is empty after parsing', () => {
      const req = reqWith({
        'x-forwarded-for': ' , , ',
        'x-vercel-id':     'iad1::abc',
        'x-real-ip':       '198.51.100.4',
      })
      expect(clientIp(req)).toBe('198.51.100.4')
    })
  })

  describe('off Vercel (no Vercel signature)', () => {
    it('uses the standard order — first XFF segment', () => {
      // Local dev / integration tests have no trust anchor on XFF, but
      // they also do not have a hostile intermediary, so the documented
      // legacy behavior is preserved.
      const req = reqWith({ 'x-forwarded-for': '10.0.0.5, 10.0.0.6' })
      expect(clientIp(req)).toBe('10.0.0.5')
    })

    it('falls back to x-real-ip when XFF is missing', () => {
      const req = reqWith({ 'x-real-ip': '127.0.0.1' })
      expect(clientIp(req)).toBe('127.0.0.1')
    })

    it('returns "unknown" when no source is available', () => {
      const req = reqWith({})
      expect(clientIp(req)).toBe('unknown')
    })

    it('strips surrounding whitespace from XFF segments', () => {
      const req = reqWith({ 'x-forwarded-for': '   192.0.2.1   , 192.0.2.2' })
      expect(clientIp(req)).toBe('192.0.2.1')
    })
  })
})
