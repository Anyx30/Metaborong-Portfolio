// Tester pass — Buckets A, C, D, G against /api/mcp.
//
//   A. JSON-RPC envelope conformance — wrong jsonrpc version, missing
//      method, content-wrapper shape, parse-error id=null, etc.
//   C. tools/list contract — exactly 5 tools, no publish/delete/unpublish
//      surfaced.
//   D. Per-tool nits — patch with status field, get unknown id, list
//      pagination contract, image bad type via base64.
//   G. Error envelope parity — every error path returns the JSON-RPC
//      shape with data.code present; no MongoServerError / E11000 /
//      stack trace / env-var name leakage.
//
// We use the SAME mock pattern as BE's own route.test.ts: a per-test
// mongodb-memory-server instance + stubbed @vercel/blob.

import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@/db/client', () => ({
  get db() { return testHandle.db },
}))
vi.mock('@vercel/blob', () => ({
  put: vi.fn(async (pathname: string) => ({
    url:                `https://abc.public.blob.vercel-storage.com/${pathname}`,
    pathname,
    contentType:        'image/webp',
    contentDisposition: 'inline',
  })),
  del: vi.fn(async () => {}),
}))

import { NextRequest } from 'next/server'
import { createTestDb, type TestDbHandle } from '@/db/test-utils'
import type { PostDoc } from '@/db/schema'

let testHandle: TestDbHandle
const TEST_TOKEN = 'tester-token-' + 'y'.repeat(32)

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

function rpcReq(body: unknown, opts: { token?: string | null; rawBody?: string } = {}): NextRequest {
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (opts.token !== null) headers.authorization = `Bearer ${opts.token ?? TEST_TOKEN}`
  return new NextRequest('http://localhost/api/mcp', {
    method: 'POST',
    headers,
    body:   opts.rawBody ?? JSON.stringify(body),
  })
}

async function call(body: unknown, opts: { token?: string | null; rawBody?: string } = {}) {
  const { POST } = await loadRoute()
  const res = await POST(rpcReq(body, opts))
  return { res, body: await res.json() }
}

async function callTool(name: string, args: unknown, id: number | string = 1) {
  return call({
    jsonrpc: '2.0', id, method: 'tools/call',
    params:  { name, arguments: args },
  })
}

// ─── Bucket A — JSON-RPC envelope conformance ────────────────────────────────

describe('Bucket A — JSON-RPC envelope conformance', () => {
  it('parse-error returns id=null and code=-32700 (per JSON-RPC §5.1)', async () => {
    const { res, body } = await call(null, { rawBody: '{not-json' })
    expect(res.status).toBe(200)
    expect(body.id).toBeNull()
    expect(body.error.code).toBe(-32700)
  })

  it('missing jsonrpc field is INVALID_REQUEST (-32600) with id preserved', async () => {
    const { body } = await call({ id: 7, method: 'initialize' })
    expect(body.id).toBe(7)
    expect(body.error.code).toBe(-32600)
  })

  it('wrong jsonrpc version "1.0" is INVALID_REQUEST', async () => {
    const { body } = await call({ jsonrpc: '1.0', id: 1, method: 'initialize' })
    expect(body.error.code).toBe(-32600)
  })

  it('missing method field is INVALID_REQUEST', async () => {
    const { body } = await call({ jsonrpc: '2.0', id: 1 })
    expect(body.error.code).toBe(-32600)
  })

  it('method-not-found echoes the requested id', async () => {
    const { body } = await call({ jsonrpc: '2.0', id: 'echo-me', method: 'no.such.thing' })
    expect(body.error.code).toBe(-32601)
    expect(body.id).toBe('echo-me')
  })

  it('successful tools/call wraps the result in content:[{type:"json",json}] AND surfaces payload at top level', async () => {
    const { body } = await callTool('cms_create_draft', {
      title: 'Wrapper Probe', markdown: '',
    })
    expect(Array.isArray(body.result.content)).toBe(true)
    expect(body.result.content[0].type).toBe('json')
    expect(body.result.content[0].json).toEqual(body.result.payload)
    expect(body.result.payload.slug).toBe('wrapper-probe')
  })

  it('initialize protocolVersion matches the dispatch §3 pin (2025-03-26)', async () => {
    const { body } = await call({ jsonrpc: '2.0', id: 1, method: 'initialize' })
    expect(body.result.protocolVersion).toBe('2025-03-26')
    expect(body.result.serverInfo.name).toBe('metaborong-cms')
    expect(body.result.serverInfo.version).toMatch(/^\d+\.\d+\.\d+$/)
  })
})

// ─── Bucket C — tools/list contract ──────────────────────────────────────────

describe('Bucket C — tools/list contract', () => {
  it('lists exactly the 5 CMS authoring tools — no extras', async () => {
    const { body } = await call({ jsonrpc: '2.0', id: 1, method: 'tools/list' })
    const names = body.result.tools.map((t: { name: string }) => t.name).sort()
    expect(names).toEqual([
      'cms_create_draft',
      'cms_get_post',
      'cms_list_posts',
      'cms_patch_post',
      'cms_upload_image',
    ])
  })

  it('every tool surfaces a non-empty description and an inputSchema object', async () => {
    const { body } = await call({ jsonrpc: '2.0', id: 1, method: 'tools/list' })
    for (const t of body.result.tools as Array<{ name: string; description?: string; inputSchema?: { type?: string } }>) {
      expect(t.description, `${t.name} description`).toBeTruthy()
      expect(t.inputSchema, `${t.name} inputSchema`).toBeDefined()
      expect(t.inputSchema?.type, `${t.name} inputSchema.type`).toBe('object')
    }
  })

  it('NO tool exposes "publish", "delete", or "unpublish" in its name or description', async () => {
    const { body } = await call({ jsonrpc: '2.0', id: 1, method: 'tools/list' })
    const forbidden = ['publish', 'delete', 'unpublish']
    for (const t of body.result.tools as Array<{ name: string; description: string }>) {
      expect(t.name.toLowerCase(), `${t.name} name`).not.toMatch(/(publish|delete|unpublish)/)
      // Description CAN mention these words in cautionary context — e.g.
      // cms_patch_post documents that you can't patch publish state.
      // Pin the cautionary form: description with one of these substrings
      // MUST also include the words "only" or "Cannot" or "is" so it's
      // clearly negation, not a feature claim.
      const lower = t.description.toLowerCase()
      for (const word of forbidden) {
        if (lower.includes(word)) {
          expect(lower, `${t.name}.description: "${word}" must be cautionary, not action-promising`).toMatch(/(only|cannot|can't|is admin)/)
        }
      }
    }
  })
})

// ─── Bucket D — per-tool nits ────────────────────────────────────────────────

describe('Bucket D — per-tool nits', () => {
  it('cms_patch_post REJECTS an unknown field "status" via the strict() schema', async () => {
    const { body } = await callTool('cms_patch_post', {
      id: '11111111-1111-4111-a111-111111111111',
      fields: { status: 'published' },
    })
    expect(body.error.data.code).toBe('VALIDATION_FAILED')
  })

  it('cms_get_post on an unknown id → NOT_FOUND', async () => {
    const { body } = await callTool('cms_get_post', {
      id: '99999999-9999-4999-a999-999999999999',
    })
    expect(body.error.data.code).toBe('NOT_FOUND')
  })

  it('cms_list_posts paginates with limit + offset and reports the right total', async () => {
    const coll = testHandle.db.collection<PostDoc>('posts')
    const now = new Date()
    const docs: PostDoc[] = Array.from({ length: 5 }, (_, i) => ({
      _id:                       `00000000-0000-4000-a000-00000000000${i}`,
      slug:                      `pager-${i}`,
      title:                     `Pager ${i}`,
      excerpt:                   null,
      status:                    'draft',
      content_json:              [],
      content_schema_version:    1,
      cover_image_id:            null,
      og_image_id:               null,
      tags:                      [],
      author_name:               'admin',
      author_url:                null,
      meta_title:                null,
      meta_description:          null,
      canonical_url:             null,
      geo_variants:              {},
      ai_readiness_score:        null,
      ai_readiness_band:         null,
      ai_readiness_report:       null,
      ai_readiness_content_hash: null,
      ai_readiness_checked_at:   null,
      published_at:              null,
      created_at:                new Date(now.getTime() + i * 1000),
      updated_at:                new Date(now.getTime() + i * 1000),
    }))
    await coll.insertMany(docs)

    const page1 = (await callTool('cms_list_posts', { limit: 2, offset: 0 })).body.result.payload
    const page2 = (await callTool('cms_list_posts', { limit: 2, offset: 2 })).body.result.payload
    const page3 = (await callTool('cms_list_posts', { limit: 2, offset: 4 })).body.result.payload

    expect(page1.total).toBe(5)
    expect(page1.posts.length).toBe(2)
    expect(page2.posts.length).toBe(2)
    expect(page3.posts.length).toBe(1)

    // Three pages disjoint and complete.
    const slugs = new Set<string>([...page1.posts, ...page2.posts, ...page3.posts].map((p: { slug: string }) => p.slug))
    expect(slugs.size).toBe(5)
  })

  it('cms_upload_image rejects a wrong-format payload with UPLOAD_BAD_TYPE', async () => {
    const fakeJpeg = Buffer.from('not even close to a real jpeg').toString('base64')
    const { body } = await callTool('cms_upload_image', {
      source:   { base64: fakeJpeg, content_type: 'image/jpeg' },
      alt:      'never reaches DB',
      filename: 'fake.jpg',
    })
    expect(body.error.data.code).toBe('UPLOAD_BAD_TYPE')

    // No DB write should have happened.
    const count = await testHandle.db.collection('images').countDocuments({})
    expect(count).toBe(0)
  })
})

// ─── Bucket G — error envelope parity ───────────────────────────────────────

describe('Bucket G — error envelope parity', () => {
  it('every error returns { jsonrpc:"2.0", id, error:{code,message,data?} }', async () => {
    const probes = [
      { body: { jsonrpc: '2.0', id: 1, method: 'no.such' },                                expected: -32601 },
      { body: { jsonrpc: '2.0', id: 2, method: 'tools/call', params: { wrongShape: 1 } }, expected: -32602 },
      { body: { jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'unknown', arguments: {} } }, expected: -32601 },
    ]
    for (const p of probes) {
      const { body } = await call(p.body)
      expect(body.jsonrpc).toBe('2.0')
      expect(body.id).toBe(p.body.id)
      expect(body.error.code).toBe(p.expected)
      expect(typeof body.error.message).toBe('string')
    }
  })

  it('VALIDATION_FAILED carries error.data.field with the offending dotted path', async () => {
    const { body } = await callTool('cms_create_draft', { /* missing title */ markdown: 'body' })
    expect(body.error.data.code).toBe('VALIDATION_FAILED')
    expect(body.error.data.field).toBe('title')
  })

  it('SLUG_CONFLICT carries error.data.field="slug"', async () => {
    // Seed an existing post, then attempt to create with the same slug.
    await testHandle.db.collection<PostDoc>('posts').insertOne({
      _id:                       '22222222-2222-4222-a222-222222222222',
      slug:                      'taken',
      title:                     'Taken',
      excerpt:                   null,
      status:                    'draft',
      content_json:              [],
      content_schema_version:    1,
      cover_image_id:            null,
      og_image_id:               null,
      tags:                      [],
      author_name:               'admin',
      author_url:                null,
      meta_title:                null,
      meta_description:          null,
      canonical_url:             null,
      geo_variants:              {},
      ai_readiness_score:        null,
      ai_readiness_band:         null,
      ai_readiness_report:       null,
      ai_readiness_content_hash: null,
      ai_readiness_checked_at:   null,
      published_at:              null,
      created_at:                new Date(),
      updated_at:                new Date(),
    })
    const { body } = await callTool('cms_create_draft', { title: 'New', slug: 'taken', markdown: '' })
    expect(body.error.data.code).toBe('SLUG_CONFLICT')
    expect(body.error.data.field).toBe('slug')
  })

  it('NEVER leaks MongoServerError / E11000 / stack-trace / env-var names', async () => {
    // The big paranoia sweep: send a handful of error-inducing requests
    // and walk every textual field of the response for the forbidden
    // substrings. If any appear, the route is leaking implementation
    // detail to AI authors.
    const seedDoc: PostDoc = {
      _id:                       '33333333-3333-4333-a333-333333333333',
      slug:                      'leakproof',
      title:                     'Leakproof',
      excerpt:                   null,
      status:                    'draft',
      content_json:              [],
      content_schema_version:    1,
      cover_image_id:            null,
      og_image_id:               null,
      tags:                      [],
      author_name:               'admin',
      author_url:                null,
      meta_title:                null,
      meta_description:          null,
      canonical_url:             null,
      geo_variants:              {},
      ai_readiness_score:        null,
      ai_readiness_band:         null,
      ai_readiness_report:       null,
      ai_readiness_content_hash: null,
      ai_readiness_checked_at:   null,
      published_at:              null,
      created_at:                new Date(),
      updated_at:                new Date(),
    }
    await testHandle.db.collection<PostDoc>('posts').insertOne(seedDoc)

    const probes: Array<{ body: unknown }> = [
      // Slug conflict (Mongo E11000 path)
      { body: { jsonrpc: '2.0', id: 1, method: 'tools/call', params: {
        name: 'cms_create_draft', arguments: { title: 'X', slug: 'leakproof', markdown: '' },
      } } },
      // Bad bearer (we briefly drop the token here)
      { body: { jsonrpc: '2.0', id: 2, method: 'initialize' } },
      // Bad tool args
      { body: { jsonrpc: '2.0', id: 3, method: 'tools/call', params: {
        name: 'cms_create_draft', arguments: { title: '' },
      } } },
      // Get unknown id
      { body: { jsonrpc: '2.0', id: 4, method: 'tools/call', params: {
        name: 'cms_get_post', arguments: { id: '11111111-1111-4111-a111-111111111111' },
      } } },
    ]

    const forbidden = [
      /MongoServerError/i,
      /E11000/,
      /at .+\.[jt]s:\d+:\d+/,                         // stack-trace frame
      /MCP_ADMIN_TOKEN/,
      /MONGODB_URI/,
      /AUTH_SECRET/,
      /BLOB_READ_WRITE_TOKEN/,
      /verseodin\.com/i,
      new RegExp(TEST_TOKEN),                          // never echo the bearer
    ]

    for (let i = 0; i < probes.length; i++) {
      const opts = i === 1 ? { token: 'wrong-bearer-here' } : {}
      const { body } = await call(probes[i].body, opts)
      const flat = JSON.stringify(body)
      for (const re of forbidden) {
        expect(flat, `probe ${i}: response leaks ${re}`).not.toMatch(re)
      }
    }
  })
})
