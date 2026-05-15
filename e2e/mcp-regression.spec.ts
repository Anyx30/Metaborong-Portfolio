import { expect, request, test, type APIRequestContext } from '@playwright/test'

/**
 * MCP Tester regression spec.
 *
 * Full-stack JSON-RPC probes against the running Next.js dev server
 * (Playwright's webServer config boots `pnpm dev`). The spec runs in
 * two modes:
 *
 *   1. ALWAYS — bearer-less probes, parse-error probe, GET 405.
 *      These exercise the envelope layer without ever needing a token,
 *      so they catch a regression in /api/mcp's auth gate even on a
 *      machine that hasn't been wired with MCP_ADMIN_TOKEN.
 *
 *   2. GATED on E2E_MCP_TOKEN — full tools/call round-trips
 *      (initialize, tools/list, cms_create_draft, cms_get_post,
 *      cms_create_draft slug conflict). Skipped cleanly on machines
 *      without the env var so the suite stays green in CI without a
 *      configured token.
 *
 * Note on the auth gate:
 *   /api/mcp is wired by reading process.env.MCP_ADMIN_TOKEN at
 *   request time. If the dev server was launched WITHOUT
 *   MCP_ADMIN_TOKEN set, all requests come back as 503 MCP_DISABLED —
 *   the bearer-less probes below assert that shape too.
 */

const MCP_TOKEN = process.env.E2E_MCP_TOKEN
const hasToken = Boolean(MCP_TOKEN)

async function rpc(api: APIRequestContext, body: unknown, opts: { token?: string | null; rawBody?: string } = {}) {
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (opts.token !== null) {
    const t = opts.token ?? MCP_TOKEN
    if (t) headers.authorization = `Bearer ${t}`
  }
  // Playwright's APIRequestContext.post() JSON-encodes a `data` string when
  // content-type is application/json — which would round-trip our
  // "malformed JSON" probe into valid JSON. To send a raw byte stream we
  // pass a Buffer (untouched by Playwright) when rawBody is supplied.
  const postOpts: Parameters<APIRequestContext['post']>[1] = opts.rawBody !== undefined
    ? { headers, data: Buffer.from(opts.rawBody, 'utf8') }
    : { headers, data: JSON.stringify(body) }
  const res = await api.post('/api/mcp', postOpts)
  const json = await res.json().catch(() => null)
  return { res, json }
}

// ── unauth probes (always run) ───────────────────────────────────────────────

test.describe('/api/mcp — bearer gate (always-on probes)', () => {
  let api: APIRequestContext
  test.beforeAll(async () => {
    api = await request.newContext({ baseURL: 'http://localhost:3000' })
  })
  test.afterAll(async () => { await api.dispose() })

  test('bearer-less initialize → 401 or 503 with the JSON-RPC error envelope', async () => {
    // Two acceptable outcomes:
    //   - 401 UNAUTHORIZED if the dev server has MCP_ADMIN_TOKEN set
    //   - 503 MCP_DISABLED  if the dev server has it unset
    // Either way, the envelope shape must be JSON-RPC 2.0.
    const { res, json } = await rpc(api, { jsonrpc: '2.0', id: 1, method: 'initialize' }, { token: null })
    expect([401, 503]).toContain(res.status())
    expect(json.jsonrpc).toBe('2.0')
    expect(json.id).toBe(1)
    expect(json.error).toBeTruthy()
    expect(['UNAUTHORIZED', 'MCP_DISABLED']).toContain(json.error.data?.code)
  })

  test('malformed JSON body → JSON-RPC parse error (code=-32700, id=null)', async () => {
    const { json } = await rpc(api, null, { token: null, rawBody: '{not-json' })
    expect(json.jsonrpc).toBe('2.0')
    expect(json.id).toBeNull()
    expect(json.error.code).toBe(-32700)
  })

  test('GET /api/mcp → 405 with the JSON-RPC error envelope', async () => {
    const res = await api.get('/api/mcp')
    expect(res.status()).toBe(405)
    const json = await res.json()
    expect(json.error?.data?.code).toBe('METHOD_NOT_ALLOWED')
  })

  test('wrong-bearer initialize → 401 (skipped if no E2E_MCP_TOKEN to compare against)', async () => {
    // Even without the real token, sending a token at all (with a wrong
    // value) should land at 401 — UNLESS the dev server has the env
    // unset, in which case 503 fires first. Both are valid.
    const { res, json } = await rpc(api, { jsonrpc: '2.0', id: 1, method: 'initialize' }, { token: 'definitely-not-the-real-token' })
    expect([401, 503]).toContain(res.status())
    expect(['UNAUTHORIZED', 'MCP_DISABLED']).toContain(json.error.data?.code)
  })
})

// ── creds-gated round-trips ──────────────────────────────────────────────────

test.describe('/api/mcp — tools/call round-trips', () => {
  test.skip(!hasToken, 'set E2E_MCP_TOKEN to run live tool round-trips')

  let api: APIRequestContext
  test.beforeAll(async () => {
    api = await request.newContext({ baseURL: 'http://localhost:3000' })
  })
  test.afterAll(async () => { await api.dispose() })

  const RUN_TAG = `e2e-mcp-${Date.now().toString(36)}`

  test('initialize → returns protocolVersion 2025-03-26 and serverInfo', async () => {
    const { res, json } = await rpc(api, { jsonrpc: '2.0', id: 1, method: 'initialize' })
    expect(res.status()).toBe(200)
    expect(json.result.protocolVersion).toBe('2025-03-26')
    expect(json.result.serverInfo.name).toBe('metaborong-cms')
  })

  test('tools/list → exposes exactly 5 cms_* tools, none mentioning publish/delete', async () => {
    const { json } = await rpc(api, { jsonrpc: '2.0', id: 2, method: 'tools/list' })
    const names = (json.result.tools as Array<{ name: string }>).map((t) => t.name).sort()
    expect(names).toEqual([
      'cms_create_draft',
      'cms_get_post',
      'cms_list_posts',
      'cms_patch_post',
      'cms_upload_image',
    ])
  })

  test('cms_create_draft round-trip persists a draft we can then cms_get_post', async () => {
    const title = `MCP regression ${RUN_TAG}`
    const { json: createJson } = await rpc(api, {
      jsonrpc: '2.0', id: 10, method: 'tools/call',
      params: {
        name: 'cms_create_draft',
        arguments: {
          title,
          markdown: `## Heading for ${RUN_TAG}\n\nFirst paragraph.\n\n> [!tip] watch the seams`,
        },
      },
    })
    expect(createJson.result?.payload?.id).toBeTruthy()
    expect(createJson.result?.payload?.slug).toContain('mcp-regression')

    const { json: getJson } = await rpc(api, {
      jsonrpc: '2.0', id: 11, method: 'tools/call',
      params: { name: 'cms_get_post', arguments: { id: createJson.result.payload.id } },
    })
    expect(getJson.result.payload.post.title).toBe(title)
    expect(getJson.result.payload.post.status).toBe('draft')
    expect(getJson.result.payload.post.content_json.length).toBeGreaterThanOrEqual(3)
  })

  test('cms_create_draft with an already-used slug → SLUG_CONFLICT', async () => {
    // Re-using the same slug from the previous test would conflict; but
    // since each spec run is fresh, instead seed our own slug here.
    const slug = `dup-${RUN_TAG}`
    await rpc(api, {
      jsonrpc: '2.0', id: 20, method: 'tools/call',
      params: { name: 'cms_create_draft', arguments: { title: 'A', slug, markdown: '' } },
    })
    const { json } = await rpc(api, {
      jsonrpc: '2.0', id: 21, method: 'tools/call',
      params: { name: 'cms_create_draft', arguments: { title: 'B', slug, markdown: '' } },
    })
    expect(json.error?.data?.code).toBe('SLUG_CONFLICT')
    expect(json.error?.data?.field).toBe('slug')
  })

  test('cms_get_post on a non-existent id → NOT_FOUND', async () => {
    const { json } = await rpc(api, {
      jsonrpc: '2.0', id: 30, method: 'tools/call',
      params: { name: 'cms_get_post', arguments: { id: '00000000-0000-4000-a000-000000000001' } },
    })
    expect(json.error?.data?.code).toBe('NOT_FOUND')
  })
})
