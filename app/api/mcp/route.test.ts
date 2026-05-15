import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'

// Same mock pattern as the admin route tests — substitute @/db/client
// with the per-test mongodb-memory-server handle. @vercel/blob is also
// stubbed because cms_upload_image tests reach into the image pipeline.
vi.mock('server-only', () => ({}))
vi.mock('@/db/client', () => ({
  get db() { return testHandle.db },
}))
vi.mock('@vercel/blob', () => ({
  put: vi.fn(async (pathname: string) => ({
    url:                `https://abc123.public.blob.vercel-storage.com/${pathname}`,
    pathname,
    contentType:        'image/webp',
    contentDisposition: 'inline',
  })),
  del: vi.fn(async () => {}),
}))

import { NextRequest } from 'next/server'
import { createTestDb, type TestDbHandle } from '@/db/test-utils'

let testHandle: TestDbHandle

const TEST_TOKEN = 'mcp-test-token-' + 'x'.repeat(32)

beforeAll(() => {
  process.env.MCP_ADMIN_TOKEN = TEST_TOKEN
})

beforeEach(async () => {
  testHandle = await createTestDb()
  vi.resetModules()
})

async function loadRoute() {
  return await import('@/app/api/mcp/route')
}

function rpcReq(body: unknown, opts: { token?: string | null } = {}): NextRequest {
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (opts.token !== null) {
    headers.authorization = `Bearer ${opts.token ?? TEST_TOKEN}`
  }
  return new NextRequest('http://localhost/api/mcp', {
    method: 'POST',
    headers,
    body:   JSON.stringify(body),
  })
}

async function rpcCall(body: unknown, opts: { token?: string | null } = {}) {
  const { POST } = await loadRoute()
  const res = await POST(rpcReq(body, opts))
  return { res, body: await res.json() }
}

describe('/api/mcp — envelope + auth', () => {
  it('returns 401 UNAUTHORIZED when bearer header is missing', async () => {
    const { res, body } = await rpcCall(
      { jsonrpc: '2.0', id: 1, method: 'initialize' },
      { token: null },
    )
    expect(res.status).toBe(401)
    expect(body.error).toBeDefined()
    expect(body.error.data.code).toBe('UNAUTHORIZED')
    expect(body.id).toBe(1)
  })

  it('returns 401 UNAUTHORIZED on a wrong token', async () => {
    const { res, body } = await rpcCall(
      { jsonrpc: '2.0', id: 'x', method: 'initialize' },
      { token: 'wrong-token' },
    )
    expect(res.status).toBe(401)
    expect(body.error.data.code).toBe('UNAUTHORIZED')
    expect(body.id).toBe('x')
  })

  it('returns 503 MCP_DISABLED when MCP_ADMIN_TOKEN is unset', async () => {
    const saved = process.env.MCP_ADMIN_TOKEN
    delete process.env.MCP_ADMIN_TOKEN
    try {
      const { res, body } = await rpcCall({ jsonrpc: '2.0', id: 1, method: 'initialize' })
      expect(res.status).toBe(503)
      expect(body.error.data.code).toBe('MCP_DISABLED')
    } finally {
      process.env.MCP_ADMIN_TOKEN = saved
    }
  })

  it('rejects malformed JSON with a JSON-RPC parse error (id=null)', async () => {
    const { POST } = await loadRoute()
    const res = await POST(new NextRequest('http://localhost/api/mcp', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${TEST_TOKEN}` },
      body: '{not-json',
    }))
    const body = await res.json()
    expect(body.error.code).toBe(-32700)
    expect(body.id).toBeNull()
  })

  it('rejects a JSON body that is not a valid JSON-RPC envelope', async () => {
    const { body } = await rpcCall({ id: 1, method: 'initialize' /* missing jsonrpc */ })
    expect(body.error.code).toBe(-32600)
    expect(body.id).toBe(1)
  })

  it('returns -32601 for an unknown method', async () => {
    const { body } = await rpcCall({ jsonrpc: '2.0', id: 1, method: 'totally/unknown' })
    expect(body.error.code).toBe(-32601)
    expect(body.error.message).toMatch(/Method not found/)
  })

  it('GET is not supported and returns a 405 JSON-RPC error', async () => {
    const { GET } = await loadRoute()
    const res = GET()
    expect(res.status).toBe(405)
    expect((await res.json()).error.data.code).toBe('METHOD_NOT_ALLOWED')
  })
})

describe('/api/mcp — initialize + tools/list', () => {
  it('initialize returns the protocol version + server info', async () => {
    const { res, body } = await rpcCall({ jsonrpc: '2.0', id: 1, method: 'initialize' })
    expect(res.status).toBe(200)
    expect(body.result.protocolVersion).toBe('2025-03-26')
    expect(body.result.serverInfo.name).toBe('metaborong-cms')
    expect(body.result.capabilities.tools).toBeDefined()
    expect(body.id).toBe(1)
  })

  it('tools/list returns all 5 registered tools', async () => {
    const { body } = await rpcCall({ jsonrpc: '2.0', id: 2, method: 'tools/list' })
    const names = body.result.tools.map((t: { name: string }) => t.name).sort()
    expect(names).toEqual([
      'cms_create_draft',
      'cms_get_post',
      'cms_list_posts',
      'cms_patch_post',
      'cms_upload_image',
    ])
  })
})

describe('/api/mcp — tools/call dispatch', () => {
  it('returns -32602 INVALID_PARAMS when params shape is wrong', async () => {
    const { body } = await rpcCall({
      jsonrpc: '2.0', id: 1, method: 'tools/call',
      params: { wrongShape: true },
    })
    expect(body.error.code).toBe(-32602)
  })

  it('returns -32601 when the tool name is unknown', async () => {
    const { body } = await rpcCall({
      jsonrpc: '2.0', id: 1, method: 'tools/call',
      params: { name: 'cms_nonexistent', arguments: {} },
    })
    expect(body.error.code).toBe(-32601)
  })

  it('returns VALIDATION_FAILED with field path when tool input is invalid', async () => {
    const { body } = await rpcCall({
      jsonrpc: '2.0', id: 1, method: 'tools/call',
      params: { name: 'cms_create_draft', arguments: { /* missing title */ markdown: 'body' } },
    })
    expect(body.error.data.code).toBe('VALIDATION_FAILED')
    expect(body.error.data.field).toBe('title')
  })

  it('cms_create_draft round-trip persists a draft and returns id+slug', async () => {
    const { body } = await rpcCall({
      jsonrpc: '2.0', id: 1, method: 'tools/call',
      params: {
        name: 'cms_create_draft',
        arguments: {
          title:    'My MCP Draft',
          markdown: '## Heading\n\nSome body text.',
        },
      },
    })
    expect(body.result.payload.slug).toBe('my-mcp-draft')
    expect(body.result.payload.id).toMatch(/^[0-9a-f-]{36}$/i)
    expect(body.result.content[0].type).toBe('json')
    expect(body.result.content[0].json.slug).toBe('my-mcp-draft')

    // Post really landed in Mongo as a draft.
    const row = await testHandle.db.collection('posts').findOne({ slug: 'my-mcp-draft' })
    expect(row).toBeTruthy()
    expect(row?.status).toBe('draft')
  })
})
