import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'
import { randomUUID } from 'node:crypto'

// Mock points (the same pattern as the M2 posts route tests).
//
//   server-only      — throws outside the Next runtime; shim it.
//   @/db/client      — proxy db getter so each test starts with a fresh
//                       isolated mongodb-memory-server-backed Db.
//   @vercel/blob     — `put` returns a deterministic public URL; `del` is
//                       a no-op spy. The route NEVER hits real Vercel Blob.
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

import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { createTestDb, type TestDbHandle } from '@/db/test-utils'
import {
  CSRF_COOKIE,
  CSRF_HEADER,
  SESSION_COOKIE,
  createSession,
} from '@/lib/auth'
import type { ImageDoc } from '@/db/schema'

let testHandle: TestDbHandle

beforeAll(() => {
  process.env.AUTH_SECRET = 'a'.repeat(48)
})

beforeEach(async () => {
  testHandle = await createTestDb()
  vi.resetModules()
})

async function loadRoute() {
  return await import('@/app/api/admin/images/route')
}

async function authedCookies() {
  const res = NextResponse.json({ ok: true })
  await createSession(res, { email: 'admin@example.com' })
  return {
    session: res.cookies.get(SESSION_COOKIE)!.value,
    csrf:    'a'.repeat(64),
  }
}

function authedCookieHeader(c: { session: string; csrf: string }, withCsrf = true): Record<string, string> {
  const headers: Record<string, string> = {
    cookie: `${SESSION_COOKIE}=${c.session}; ${CSRF_COOKIE}=${c.csrf}`,
  }
  if (withCsrf) headers[CSRF_HEADER] = c.csrf
  return headers
}

async function makeJpeg(width = 64, height = 32): Promise<Buffer> {
  return await sharp({
    create: { width, height, channels: 3, background: { r: 200, g: 50, b: 50 } },
  }).jpeg({ quality: 80 }).toBuffer()
}

async function makePng(width = 50, height = 50): Promise<Buffer> {
  return await sharp({
    create: { width, height, channels: 3, background: { r: 0, g: 100, b: 200 } },
  }).png().toBuffer()
}

// Minimal valid GIF89a — sharp can't always synthesize GIF, but we just
// need 12 bytes the magic-byte sniff will reject.
function makeGif(): Buffer {
  return Buffer.from([
    0x47, 0x49, 0x46, 0x38, 0x39, 0x61,
    0x01, 0x00, 0x01, 0x00, 0x80, 0x00,
    0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff,
    0x21, 0xf9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00,
    0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00,
    0x02, 0x02, 0x4c, 0x01, 0x00, 0x3b,
  ])
}

function uploadRequest(c: { session: string; csrf: string } | null, fd: FormData): NextRequest {
  const headers: Record<string, string> = {}
  if (c) Object.assign(headers, authedCookieHeader(c, true))
  return new NextRequest('http://localhost/api/admin/images', {
    method: 'POST',
    headers,
    body:   fd,
  })
}

// ── POST /api/admin/images ───────────────────────────────────────────────────

describe('POST /api/admin/images', () => {
  it('returns 403 when CSRF header is missing', async () => {
    const c = await authedCookies()
    const fd = new FormData()
    fd.append('file', new Blob([new Uint8Array(await makeJpeg())], { type: 'image/jpeg' }), 'a.jpg')
    const headers: Record<string, string> = {
      cookie: `${SESSION_COOKIE}=${c.session}; ${CSRF_COOKIE}=${c.csrf}`,
    }
    const req = new NextRequest('http://localhost/api/admin/images', {
      method: 'POST', headers, body: fd,
    })
    const { POST } = await loadRoute()
    const res = await POST(req)
    expect(res.status).toBe(403)
    expect((await res.json()).code).toBe('CSRF_FAILED')
  })

  it('returns 401 without a session', async () => {
    const csrf = 'a'.repeat(64)
    const fd = new FormData()
    fd.append('file', new Blob([new Uint8Array(await makeJpeg())], { type: 'image/jpeg' }), 'a.jpg')
    const headers: Record<string, string> = {
      cookie: `${CSRF_COOKIE}=${csrf}`,
      [CSRF_HEADER]: csrf,
    }
    const req = new NextRequest('http://localhost/api/admin/images', {
      method: 'POST', headers, body: fd,
    })
    const { POST } = await loadRoute()
    const res = await POST(req)
    expect(res.status).toBe(401)
    expect((await res.json()).code).toBe('UNAUTHORIZED')
  })

  it('rejects a GIF disguised as JPEG (Content-Type lies) with 415 UPLOAD_BAD_TYPE', async () => {
    const c = await authedCookies()
    const fd = new FormData()
    fd.append('file', new Blob([new Uint8Array(makeGif())], { type: 'image/jpeg' }), 'fake.jpg')
    const { POST } = await loadRoute()
    const res = await POST(uploadRequest(c, fd))
    expect(res.status).toBe(415)
    const body = await res.json()
    expect(body.code).toBe('UPLOAD_BAD_TYPE')
    expect(body.error).toMatch(/JPG\/PNG\/WebP/)
  })

  // M8-core hardening — exhaustive negative coverage. Every non-allowlisted
  // format must collapse to 415 even when the Content-Type lies.
  it.each([
    ['TIFF little-endian', Buffer.from([0x49, 0x49, 0x2a, 0x00, ...new Array(40).fill(0)])],
    ['BMP',                Buffer.from([0x42, 0x4d, ...new Array(40).fill(0)])],
    [
      'SVG',
      Buffer.from(
        '<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>',
        'utf8',
      ),
    ],
  ])('rejects a %s payload with 415 UPLOAD_BAD_TYPE', async (_name, payload) => {
    const c = await authedCookies()
    const fd = new FormData()
    fd.append('file', new Blob([new Uint8Array(payload)], { type: 'image/jpeg' }), 'fake.jpg')
    const { POST } = await loadRoute()
    const res = await POST(uploadRequest(c, fd))
    expect(res.status).toBe(415)
    expect((await res.json()).code).toBe('UPLOAD_BAD_TYPE')
  })

  it('rejects a 9 MB payload with 413 UPLOAD_TOO_LARGE', async () => {
    const c = await authedCookies()
    const fd = new FormData()
    const big = Buffer.alloc(9 * 1024 * 1024, 0x77)
    fd.append('file', new Blob([new Uint8Array(big)], { type: 'image/jpeg' }), 'big.jpg')
    const { POST } = await loadRoute()
    const res = await POST(uploadRequest(c, fd))
    expect(res.status).toBe(413)
    expect((await res.json()).code).toBe('UPLOAD_TOO_LARGE')
  })

  it('rejects a missing `file` field with 422', async () => {
    const c = await authedCookies()
    const fd = new FormData()
    fd.append('not_file', 'whatever')
    const { POST } = await loadRoute()
    const res = await POST(uploadRequest(c, fd))
    expect(res.status).toBe(422)
    const body = await res.json()
    expect(body.code).toBe('VALIDATION_FAILED')
    expect(body.field).toBe('file')
  })

  it('uploads a valid JPEG, transcodes to WebP, persists the row, and returns 201', async () => {
    const c = await authedCookies()
    const jpeg = await makeJpeg(128, 64)
    const fd = new FormData()
    fd.append('file', new Blob([new Uint8Array(jpeg)], { type: 'image/jpeg' }), 'photo.jpg')

    const { POST } = await loadRoute()
    const res = await POST(uploadRequest(c, fd))
    expect(res.status).toBe(201)

    const body = await res.json()
    expect(body.image.id).toMatch(/^[0-9a-f-]{36}$/i)
    expect(body.image.blob_url).toMatch(/\.public\.blob\.vercel-storage\.com\/images\/[0-9a-f-]+\.webp$/)
    expect(body.image.width).toBe(128)
    expect(body.image.height).toBe(64)
    expect(body.image.alt).toBe('')
    expect(body.image.focal_x).toBe(0.5)
    expect(body.image.focal_y).toBe(0.5)
    expect(body.image.filename).toBe('photo.jpg')
    expect(body.image.created_at).toMatch(/Z$/)

    // @vercel/blob.put was called with a server-generated path and image/webp.
    const blob = await import('@vercel/blob')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const putMock = blob.put as unknown as { mock: { calls: any[][] } }
    expect(putMock.mock.calls.length).toBe(1)
    const [pathArg, , optsArg] = putMock.mock.calls[0]
    expect(pathArg).toMatch(/^images\/[0-9a-f-]+\.webp$/)
    expect(optsArg.contentType).toBe('image/webp')
    expect(optsArg.access).toBe('public')
    expect(optsArg.addRandomSuffix).toBe(false)

    // DB row really persisted with the URL we returned.
    const rows = await testHandle.db.collection<ImageDoc>('images').find({}).toArray()
    expect(rows.length).toBe(1)
    expect(rows[0].blob_url).toBe(body.image.blob_url)
  })

  it('transcodes a PNG input to a WebP buffer (no EXIF on output)', async () => {
    const c = await authedCookies()
    const png = await makePng(80, 40)
    const fd = new FormData()
    fd.append('file', new Blob([new Uint8Array(png)], { type: 'image/png' }), 'graphic.png')

    const { POST } = await loadRoute()
    const res = await POST(uploadRequest(c, fd))
    expect(res.status).toBe(201)

    // The buffer that was uploaded to Vercel Blob should be a real WebP.
    const blob = await import('@vercel/blob')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const putMock = blob.put as unknown as { mock: { calls: any[][] } }
    const lastCall = putMock.mock.calls[putMock.mock.calls.length - 1]
    const uploadedBuffer = lastCall[1] as Buffer
    const meta = await sharp(uploadedBuffer).metadata()
    expect(meta.format).toBe('webp')
    expect(meta.width).toBe(80)
    expect(meta.height).toBe(40)
    // sharp drops EXIF by default; ensure the round-tripped output has none.
    expect(meta.exif).toBeUndefined()
  })

  it('does not round-trip the user-supplied filename into the blob path', async () => {
    const c = await authedCookies()
    const fd = new FormData()
    fd.append('file', new Blob([new Uint8Array(await makeJpeg())], { type: 'image/jpeg' }), '../etc/passwd.jpg')
    const { POST } = await loadRoute()
    const res = await POST(uploadRequest(c, fd))
    expect(res.status).toBe(201)

    const body = await res.json()
    // The blob URL path must be `images/<uuid>.webp` only — no path traversal.
    expect(body.image.blob_url).not.toMatch(/passwd|etc/)
    // We DO store the sanitised original name for display.
    expect(body.image.filename).toBe('passwd.jpg')
  })
})

// ── GET /api/admin/images ────────────────────────────────────────────────────

describe('GET /api/admin/images', () => {
  it('returns 401 without a session', async () => {
    const { GET } = await loadRoute()
    const res = await GET(new NextRequest('http://localhost/api/admin/images'))
    expect(res.status).toBe(401)
    expect((await res.json()).code).toBe('UNAUTHORIZED')
  })

  it('returns an empty page on a fresh DB', async () => {
    const c = await authedCookies()
    const { GET } = await loadRoute()
    const res = await GET(new NextRequest('http://localhost/api/admin/images', {
      headers: authedCookieHeader(c, false),
    }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ images: [], nextCursor: null })
  })

  it('paginates 30 images into a 24/6 split using nextCursor', async () => {
    const c = await authedCookies()
    const baseTs = Date.parse('2026-05-01T00:00:00.000Z')
    const docs: ImageDoc[] = Array.from({ length: 30 }, (_, i) => ({
      _id:        randomUUID(),
      blob_url:   `https://abc123.public.blob.vercel-storage.com/images/img-${i}.webp`,
      width:      10,
      height:     10,
      alt:        '',
      focal_x:    0.5,
      focal_y:    0.5,
      filename:   `f-${i}.jpg`,
      created_at: new Date(baseTs + i * 1000),
    }))
    await testHandle.db.collection<ImageDoc>('images').insertMany(docs)

    const { GET } = await loadRoute()

    const first = await GET(new NextRequest('http://localhost/api/admin/images', {
      headers: authedCookieHeader(c, false),
    }))
    expect(first.status).toBe(200)
    const firstBody = await first.json()
    expect(firstBody.images).toHaveLength(24)
    expect(firstBody.nextCursor).toBeTruthy()

    const url = `http://localhost/api/admin/images?cursor=${encodeURIComponent(firstBody.nextCursor)}`
    const second = await GET(new NextRequest(url, {
      headers: authedCookieHeader(c, false),
    }))
    const secondBody = await second.json()
    expect(secondBody.images).toHaveLength(6)
    expect(secondBody.nextCursor).toBeNull()

    // Pages are disjoint and cover all 30 rows.
    const ids = new Set([...firstBody.images, ...secondBody.images].map((i: { id: string }) => i.id))
    expect(ids.size).toBe(30)

    // Newest-first ordering: first page leads with the latest timestamp.
    expect(firstBody.images[0].filename).toBe('f-29.jpg')
  })

  it('treats a malformed cursor as no cursor (returns the first page)', async () => {
    const c = await authedCookies()
    await testHandle.db.collection<ImageDoc>('images').insertOne({
      _id: randomUUID(),
      blob_url: 'https://abc.public.blob.vercel-storage.com/images/x.webp',
      width: 1, height: 1, alt: '', focal_x: 0.5, focal_y: 0.5,
      filename: 'x.jpg', created_at: new Date(),
    })
    const { GET } = await loadRoute()
    const res = await GET(new NextRequest('http://localhost/api/admin/images?cursor=!!!', {
      headers: authedCookieHeader(c, false),
    }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.images).toHaveLength(1)
  })
})
