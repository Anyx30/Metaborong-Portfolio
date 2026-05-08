import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

vi.mock('server-only', () => ({}))

// All tests in this file mock fetch directly. No real network calls; the
// curl-probe response captured live from VerseOdin on 2026-05-08 is the
// `verseOdinFixture` text below — it round-trips through the JSON-RPC
// envelope exactly the way production does.

const verseOdinInner = {
  url: 'https://www.metaborong.com/',
  overallScore: 41,
  pageScore: 54,
  domainScore: 0,
  domainReputationBonus: 0,
  metadata: {
    title: 'METABORONG',
    description: 'WE ARCHITECT SCALABLE WEB3 ECOSYSTEMS',
    analyzedAt: '2026-05-08T07:44:02Z',
  },
  checks: [
    {
      id: 'robots-txt',
      label: 'Robots.txt',
      status: 'fail',
      score: 0,
      scope: 'domain',
      details: 'No robots.txt file found',
      recommendation: 'Create a robots.txt file with AI crawler directives',
    },
    {
      id: 'meta-tags',
      label: 'Metadata Quality',
      status: 'pass',
      score: 85,
      scope: 'page',
      details: 'Title ✓, Description',
      recommendation: 'Metadata provides excellent context for AI',
    },
  ],
}

function envelopeFor(inner: unknown) {
  return {
    jsonrpc: '2.0',
    id: 1,
    result: { content: [{ type: 'text', text: JSON.stringify(inner) }] },
  }
}

const ENV_KEYS = [
  'AI_READINESS_MCP_URL',
  'AI_READINESS_MCP_AUTH_TOKEN',
  'AI_READINESS_MCP_TOOL_NAME',
] as const

type EnvSnapshot = Record<string, string | undefined>

function snapshotEnv(): EnvSnapshot {
  const out: EnvSnapshot = {}
  for (const k of ENV_KEYS) out[k] = process.env[k]
  return out
}

function restoreEnv(snap: EnvSnapshot) {
  for (const k of ENV_KEYS) {
    if (snap[k] === undefined) delete process.env[k]
    else process.env[k] = snap[k]
  }
}

function setEnv() {
  process.env.AI_READINESS_MCP_URL = 'https://verseodin.test/api/mcp'
  process.env.AI_READINESS_MCP_AUTH_TOKEN = 'vso_test_token'
  process.env.AI_READINESS_MCP_TOOL_NAME = 'ai_readiness_scan'
}

let envSnap: EnvSnapshot
let fetchSpy: ReturnType<typeof vi.fn>

beforeEach(() => {
  envSnap = snapshotEnv()
  fetchSpy = vi.fn()
  vi.stubGlobal('fetch', fetchSpy)
  vi.resetModules()
})

afterEach(() => {
  restoreEnv(envSnap)
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

async function loadClient() {
  return await import('@/lib/ai-readiness/client')
}

// ── happy path ───────────────────────────────────────────────────────────────

describe('scanUrl — happy path', () => {
  it('parses the JSON-RPC envelope and inner JSON, returning the report', async () => {
    setEnv()
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify(envelopeFor(verseOdinInner)), { status: 200 }),
    )
    const { scanUrl } = await loadClient()
    const out = await scanUrl('https://www.metaborong.com/blog/x/')
    expect(out.overallScore).toBe(41)
    expect(out.metadata.analyzedAt).toBe('2026-05-08T07:44:02Z')
    expect(out.checks).toHaveLength(2)
  })

  it('sends the JSON-RPC envelope with the correct headers', async () => {
    setEnv()
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify(envelopeFor(verseOdinInner)), { status: 200 }),
    )
    const { scanUrl } = await loadClient()
    await scanUrl('https://www.metaborong.com/blog/x/')
    expect(fetchSpy).toHaveBeenCalledTimes(1)
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://verseodin.test/api/mcp')
    const headers = init.headers as Record<string, string>
    expect(headers['Content-Type']).toBe('application/json')
    expect(headers['Authorization']).toBe('Bearer vso_test_token')
    const body = JSON.parse(init.body as string)
    expect(body.jsonrpc).toBe('2.0')
    expect(body.method).toBe('tools/call')
    expect(body.params.name).toBe('ai_readiness_scan')
    expect(body.params.arguments.url).toBe('https://www.metaborong.com/blog/x/')
  })
})

// ── disabled mode ────────────────────────────────────────────────────────────

describe('disabled mode', () => {
  it('isDisabled() is true when any of the 3 env vars is missing', async () => {
    setEnv()
    delete process.env.AI_READINESS_MCP_AUTH_TOKEN
    const { isDisabled } = await loadClient()
    expect(isDisabled()).toBe(true)
  })

  it('isDisabled() is false when all 3 env vars are set', async () => {
    setEnv()
    const { isDisabled } = await loadClient()
    expect(isDisabled()).toBe(false)
  })

  it('scanUrl throws McpDisabledError when env is unset', async () => {
    delete process.env.AI_READINESS_MCP_URL
    delete process.env.AI_READINESS_MCP_AUTH_TOKEN
    delete process.env.AI_READINESS_MCP_TOOL_NAME
    const { scanUrl, McpDisabledError } = await loadClient()
    await expect(scanUrl('https://x/')).rejects.toBeInstanceOf(McpDisabledError)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('treats whitespace-only env values as missing', async () => {
    process.env.AI_READINESS_MCP_URL = '   '
    process.env.AI_READINESS_MCP_AUTH_TOKEN = 'vso_x'
    process.env.AI_READINESS_MCP_TOOL_NAME = 'ai_readiness_scan'
    const { isDisabled } = await loadClient()
    expect(isDisabled()).toBe(true)
  })
})

// ── error taxonomy ───────────────────────────────────────────────────────────

describe('scanUrl — error taxonomy', () => {
  it('throws McpAuthError on 401', async () => {
    setEnv()
    fetchSpy.mockResolvedValue(new Response('', { status: 401 }))
    const { scanUrl, McpAuthError } = await loadClient()
    await expect(scanUrl('https://x/')).rejects.toBeInstanceOf(McpAuthError)
  })

  it('throws McpAuthError on 403', async () => {
    setEnv()
    fetchSpy.mockResolvedValue(new Response('', { status: 403 }))
    const { scanUrl, McpAuthError } = await loadClient()
    await expect(scanUrl('https://x/')).rejects.toBeInstanceOf(McpAuthError)
  })

  it('throws McpUpstreamError on 500', async () => {
    setEnv()
    fetchSpy.mockResolvedValue(new Response('boom', { status: 500 }))
    const { scanUrl, McpUpstreamError } = await loadClient()
    await expect(scanUrl('https://x/')).rejects.toBeInstanceOf(McpUpstreamError)
  })

  it('throws McpUpstreamError on a 502 (gateway upstream)', async () => {
    setEnv()
    fetchSpy.mockResolvedValue(new Response('', { status: 502 }))
    const { scanUrl, McpUpstreamError } = await loadClient()
    await expect(scanUrl('https://x/')).rejects.toBeInstanceOf(McpUpstreamError)
  })

  it('throws McpInvalidPayloadError on non-JSON body', async () => {
    setEnv()
    fetchSpy.mockResolvedValue(new Response('not json', { status: 200 }))
    const { scanUrl, McpInvalidPayloadError } = await loadClient()
    await expect(scanUrl('https://x/')).rejects.toBeInstanceOf(McpInvalidPayloadError)
  })

  it('throws McpInvalidPayloadError when the JSON-RPC envelope has no result.content[0].text', async () => {
    setEnv()
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ jsonrpc: '2.0', id: 1, result: { content: [] } }), { status: 200 }),
    )
    const { scanUrl, McpInvalidPayloadError } = await loadClient()
    await expect(scanUrl('https://x/')).rejects.toBeInstanceOf(McpInvalidPayloadError)
  })

  it('throws McpUpstreamError when the JSON-RPC envelope carries a top-level error', async () => {
    setEnv()
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ jsonrpc: '2.0', id: 1, error: { code: -32000, message: 'boom' } }), { status: 200 }),
    )
    const { scanUrl, McpUpstreamError } = await loadClient()
    await expect(scanUrl('https://x/')).rejects.toBeInstanceOf(McpUpstreamError)
  })

  it('throws McpInvalidPayloadError when the inner text is not valid JSON', async () => {
    setEnv()
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          result: { content: [{ type: 'text', text: '{ bad json' }] },
        }),
        { status: 200 },
      ),
    )
    const { scanUrl, McpInvalidPayloadError } = await loadClient()
    await expect(scanUrl('https://x/')).rejects.toBeInstanceOf(McpInvalidPayloadError)
  })

  it('throws McpInvalidPayloadError on Zod-level shape failure (missing overallScore)', async () => {
    setEnv()
    const inner = { ...verseOdinInner } as Record<string, unknown>
    delete inner.overallScore
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify(envelopeFor(inner)), { status: 200 }),
    )
    const { scanUrl, McpInvalidPayloadError } = await loadClient()
    await expect(scanUrl('https://x/')).rejects.toBeInstanceOf(McpInvalidPayloadError)
  })

  it('throws McpTimeoutError on AbortError (10s cap)', async () => {
    setEnv()
    // Fetch implementations differ on what they throw when aborted; both
    // shapes route through the AbortError name guard in the client.
    const abortErr = Object.assign(new Error('aborted'), { name: 'AbortError' })
    fetchSpy.mockRejectedValue(abortErr)
    const { scanUrl, McpTimeoutError } = await loadClient()
    await expect(scanUrl('https://x/')).rejects.toBeInstanceOf(McpTimeoutError)
  })

  it('throws McpUpstreamError on a generic network error (DNS/ECONNREFUSED)', async () => {
    setEnv()
    fetchSpy.mockRejectedValue(new TypeError('fetch failed'))
    const { scanUrl, McpUpstreamError } = await loadClient()
    await expect(scanUrl('https://x/')).rejects.toBeInstanceOf(McpUpstreamError)
  })

  it('never includes the bearer token in error messages', async () => {
    setEnv()
    fetchSpy.mockResolvedValue(new Response('', { status: 401 }))
    const { scanUrl } = await loadClient()
    try {
      await scanUrl('https://x/')
    } catch (e) {
      expect(String(e)).not.toContain('vso_test_token')
    }
  })
})

// ── bandFor ──────────────────────────────────────────────────────────────────

describe('bandFor', () => {
  it('returns strong for score >= 80', async () => {
    const { bandFor } = await loadClient()
    expect(bandFor(80)).toBe('strong')
    expect(bandFor(100)).toBe('strong')
  })

  it('returns adequate for 60..79', async () => {
    const { bandFor } = await loadClient()
    expect(bandFor(60)).toBe('adequate')
    expect(bandFor(79)).toBe('adequate')
  })

  it('returns weak for < 60', async () => {
    const { bandFor } = await loadClient()
    expect(bandFor(0)).toBe('weak')
    expect(bandFor(59)).toBe('weak')
  })
})
