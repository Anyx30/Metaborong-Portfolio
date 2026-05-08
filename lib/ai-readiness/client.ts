// Thin server-only adapter around the VerseOdin MCP server. The MCP URL,
// bearer token, and tool name are environment-only — never logged, never
// surfaced in error messages, never exposed to the browser. The route
// handler at app/api/admin/posts/[id]/ai-readiness proxies all calls.
//
// Wire protocol: JSON-RPC 2.0 over plain HTTP POST. The server returns
// an envelope shaped like:
//   { jsonrpc: '2.0', id: 1, result: { content: [ { type: 'text', text: '<JSON>' } ] } }
// where `text` is a stringified JSON of the actual report. We unwrap
// twice (envelope → text → report) and Zod-validate the inner shape.
//
// Failure taxonomy (one class per recoverable / surfaceable case) so the
// route handler can map upstream conditions to the right HTTP status and
// §2.2 error code without sniffing string contents:
//
//   McpDisabledError       any of the 3 env vars is unset → 503 MCP_DISABLED
//   McpTimeoutError        AbortController fired (10s)    → 504 MCP_UPSTREAM_ERROR
//   McpAuthError           upstream 401/403               → 503 MCP_DISABLED
//   McpUpstreamError       upstream non-2xx              → 502 MCP_UPSTREAM_ERROR
//   McpInvalidPayloadError parse / Zod fail             → 502 MCP_UPSTREAM_ERROR

import 'server-only'
import { aiReadinessReportSchema, type AiReadinessReport } from '../blog-schema'

const TIMEOUT_MS = 10_000

// ── error taxonomy ───────────────────────────────────────────────────────────

export class McpDisabledError extends Error {
  constructor() {
    super('AI Readiness MCP is disabled')
    this.name = 'McpDisabledError'
  }
}

export class McpTimeoutError extends Error {
  constructor() {
    super('AI Readiness MCP request timed out')
    this.name = 'McpTimeoutError'
  }
}

export class McpAuthError extends Error {
  readonly status: number
  constructor(status: number) {
    super(`AI Readiness MCP rejected the request with ${status}`)
    this.name = 'McpAuthError'
    this.status = status
  }
}

export class McpUpstreamError extends Error {
  readonly status: number
  constructor(status: number) {
    super(`AI Readiness MCP returned ${status}`)
    this.name = 'McpUpstreamError'
    this.status = status
  }
}

export class McpInvalidPayloadError extends Error {
  readonly cause?: unknown
  constructor(message: string, cause?: unknown) {
    super(`AI Readiness MCP returned an invalid payload: ${message}`)
    this.name = 'McpInvalidPayloadError'
    this.cause = cause
  }
}

// ── env access ───────────────────────────────────────────────────────────────

interface McpEnv {
  url: string
  token: string
  toolName: string
}

function readEnv(): McpEnv | null {
  // Read presence + non-empty in one shot. Trim defensively because dotenv
  // happily preserves trailing whitespace, which would silently break the
  // bearer header in CI.
  const url = process.env.AI_READINESS_MCP_URL?.trim()
  const token = process.env.AI_READINESS_MCP_AUTH_TOKEN?.trim()
  const toolName = process.env.AI_READINESS_MCP_TOOL_NAME?.trim()
  if (!url || !token || !toolName) return null
  return { url, token, toolName }
}

export function isDisabled(): boolean {
  return readEnv() === null
}

// ── public surface ───────────────────────────────────────────────────────────

/**
 * Run the VerseOdin scan against `url` and return the validated report.
 *
 * The 10s timeout is non-negotiable per PRD §5.10: the route handler must
 * fail fast so a stalled MCP server can't hold the admin's editor tab
 * loading indefinitely.
 */
export async function scanUrl(url: string): Promise<AiReadinessReport> {
  const env = readEnv()
  if (!env) throw new McpDisabledError()

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  let res: Response
  try {
    res = await fetch(env.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.token}`,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: env.toolName,
          arguments: { url },
        },
      }),
      signal: controller.signal,
      // Per Next 15+ defaults, fetch is cached unless we opt out. Scoring
      // is request-by-request — caching here would silently make every
      // admin's first-of-day scan return whatever the build cached.
      cache: 'no-store',
    })
  } catch (err) {
    clearTimeout(timer)
    if (err instanceof Error && err.name === 'AbortError') {
      throw new McpTimeoutError()
    }
    // Network-level failures (DNS, ECONNREFUSED, TLS) — same surface as
    // an upstream error since the route maps both to MCP_UPSTREAM_ERROR.
    throw new McpUpstreamError(0)
  } finally {
    clearTimeout(timer)
  }

  if (res.status === 401 || res.status === 403) {
    // Token is wrong or revoked. Surface as auth so the route returns
    // 503 + MCP_DISABLED (the FE treats that as "service misconfigured —
    // contact admin", per PRD §5.10 failure handling).
    throw new McpAuthError(res.status)
  }
  if (!res.ok) {
    throw new McpUpstreamError(res.status)
  }

  let envelope: unknown
  try {
    envelope = await res.json()
  } catch (err) {
    throw new McpInvalidPayloadError('response is not valid JSON', err)
  }

  // JSON-RPC envelope: { jsonrpc, id, result: { content: [{ type:'text', text:<JSON> }] } }
  // or { jsonrpc, id, error: { code, message } }. Defensive extraction —
  // a stricter schema would reject forward-compatible additions like
  // `meta` we don't yet care about.
  if (!envelope || typeof envelope !== 'object') {
    throw new McpInvalidPayloadError('response is not an object')
  }
  const env2 = envelope as {
    error?: { code?: number; message?: string }
    result?: { content?: Array<{ type?: string; text?: string }> }
  }
  if (env2.error) {
    throw new McpUpstreamError(0)
  }
  const text = env2.result?.content?.[0]?.text
  if (typeof text !== 'string' || !text) {
    throw new McpInvalidPayloadError('JSON-RPC result.content[0].text is missing')
  }

  let inner: unknown
  try {
    inner = JSON.parse(text)
  } catch (err) {
    throw new McpInvalidPayloadError('inner result text is not valid JSON', err)
  }

  const parsed = aiReadinessReportSchema.safeParse(inner)
  if (!parsed.success) {
    throw new McpInvalidPayloadError('inner report failed schema validation', parsed.error)
  }
  return parsed.data
}

// ── derived band (PRD §5.10 cutoffs) ─────────────────────────────────────────
// ≥80 strong, ≥60 adequate, else weak. Centralised so the route handler
// and any future reporting surface agree on the cut-points.

import type { AiReadinessBand } from '../blog-schema'

export function bandFor(score: number): AiReadinessBand {
  if (score >= 80) return 'strong'
  if (score >= 60) return 'adequate'
  return 'weak'
}
