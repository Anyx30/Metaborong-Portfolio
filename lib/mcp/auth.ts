// Bearer-token authentication for /api/mcp.
//
// One env var (MCP_ADMIN_TOKEN). Missing → server returns 503
// MCP_DISABLED via the JSON-RPC envelope. Header parse failure or
// constant-time mismatch → 401 UNAUTHORIZED.
//
// The token is compared in constant time so an attacker can't probe
// character-by-character via wall-clock timing.

import 'server-only'

export type McpAuthResult =
  | { ok: true }
  | { ok: false; reason: 'disabled' | 'unauthorized'; message: string }

export const MCP_ADMIN_TOKEN_ENV = 'MCP_ADMIN_TOKEN'

function getToken(): string | null {
  const raw = process.env[MCP_ADMIN_TOKEN_ENV]
  if (!raw) return null
  const trimmed = raw.trim()
  return trimmed.length > 0 ? trimmed : null
}

/**
 * Check that the request carries an Authorization: Bearer <token> header
 * whose value matches MCP_ADMIN_TOKEN. Returns a discriminated union so
 * the route can emit:
 *
 *   - 503 MCP_DISABLED      env var unset
 *   - 401 UNAUTHORIZED      missing / malformed header, or wrong token
 *   - 200 / business logic  ok
 */
export function checkBearer(headerValue: string | null): McpAuthResult {
  const token = getToken()
  if (!token) {
    return {
      ok:     false,
      reason: 'disabled',
      message: 'MCP server is not configured.',
    }
  }

  const auth = (headerValue ?? '').trim()
  const match = auth.match(/^Bearer\s+(.+)$/i)
  if (!match) {
    return {
      ok:     false,
      reason: 'unauthorized',
      message: 'missing bearer token',
    }
  }

  if (!timingSafeStringEquals(match[1].trim(), token)) {
    return {
      ok:     false,
      reason: 'unauthorized',
      message: 'invalid bearer token',
    }
  }
  return { ok: true }
}

/**
 * Constant-time string comparison. Compares pad-equal byte arrays so the
 * length never short-circuits — an attacker can still learn the length
 * by sending differently-sized candidates and noticing the failure mode,
 * but they can't extract bytes via timing. (We mint MCP_ADMIN_TOKEN as a
 * fixed 32-byte base64 string, so length-leak doesn't matter.)
 */
function timingSafeStringEquals(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, 'utf8')
  const bBuf = Buffer.from(b, 'utf8')
  const len = Math.max(aBuf.length, bBuf.length)
  let diff = aBuf.length ^ bBuf.length
  for (let i = 0; i < len; i++) {
    const x = i < aBuf.length ? aBuf[i] : 0
    const y = i < bBuf.length ? bBuf[i] : 0
    diff |= x ^ y
  }
  return diff === 0
}
