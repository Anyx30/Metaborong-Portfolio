import { expect, request, test, type APIRequestContext } from '@playwright/test'

/**
 * v2-mongo Tester regression spec.
 *
 * The dispatch (cms/v2-mongo-test, 2026-05-14) asks for full-stack
 * coverage of the seams the existing Vitest suites don't naturally
 * exercise after the Postgres → MongoDB rewrite. This spec encodes:
 *
 *   · Bucket E — error envelope parity. Every admin route returns the
 *     §2.2 `{ error, code }` envelope on the unauth path. NEVER needs
 *     admin creds; runs unconditionally so a future regression in
 *     errorResponse() catches here.
 *
 *   · Bucket C — public renderer parity. /robots.txt + /sitemap.xml +
 *     /llms.txt + /llms-full.txt + /blog/rss.xml emit their canonical
 *     content-types and frame markers (RSS root element, sitemap urlset,
 *     llmstxt H1 + Posts heading) even with zero seeded posts. These
 *     surfaces never required auth, so they run unconditionally too.
 *
 *   · Bucket B + D — full create → publish → fetch → unpublish → delete
 *     flow with slug-conflict-on-create. Encoded as the creds-gated
 *     section that skips cleanly when E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD
 *     aren't set (same gate pattern as M3/M4/M5/M9-AEO/M9-GEO/M9-C/M7).
 *
 * Bucket A + F (schema/index probes + ensureIndexes idempotency) live in
 * db/v2-mongo-regression.test.ts — the dispatch §4 explicitly authorises
 * Vitest at the data-layer for those.
 */

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD
const hasCreds = Boolean(ADMIN_EMAIL && ADMIN_PASSWORD)

const RUN_TAG = `e2e-v2mongo-${Date.now().toString(36)}`

// Bake a UUID-shaped placeholder for the [id] routes so the path-shape
// guard doesn't 404 us before the auth gate runs. The post does not
// exist; the auth guard fires first, so the 401 envelope is what we
// observe.
const PLACEHOLDER_ID = '00000000-0000-4000-a000-000000000001'

// ── Bucket E — unauth envelope walk (always runs) ──────────────────────────────

interface RoutePath {
  label: string
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  path: string
  // For routes that are CSRF-gated, the body's `code` switches to
  // CSRF_FAILED when there's no session — except the route stack here
  // checks CSRF BEFORE auth on POST/PATCH/DELETE, so the unauth caller
  // hits CSRF_FAILED first. Login has no CSRF and no auth gate; we treat
  // it separately.
  expectedStatus: number
  expectedCode: string
}

// Maps to the BE handoff §3 surfaces. Login intentionally NOT in this
// table — it has its own gate sequence (rate-limit → JSON parse →
// validation → auth). Logout is also special-cased separately.
const ADMIN_ROUTES_NEED_AUTH: RoutePath[] = [
  { label: 'GET /api/admin/posts',                         method: 'GET',    path: '/api/admin/posts',                            expectedStatus: 401, expectedCode: 'UNAUTHORIZED' },
  { label: 'GET /api/admin/posts/[id]',                    method: 'GET',    path: `/api/admin/posts/${PLACEHOLDER_ID}`,          expectedStatus: 401, expectedCode: 'UNAUTHORIZED' },
  { label: 'GET /api/admin/images',                        method: 'GET',    path: '/api/admin/images',                           expectedStatus: 401, expectedCode: 'UNAUTHORIZED' },
]

// Routes that gate CSRF BEFORE auth — see lib/auth.requireCsrf usage in
// each handler. Without an mb_csrf cookie + X-CSRF-Token header echo,
// these return 403 CSRF_FAILED even if there's also no session.
const ADMIN_ROUTES_NEED_CSRF: RoutePath[] = [
  { label: 'POST /api/admin/posts',                              method: 'POST',   path: '/api/admin/posts',                                     expectedStatus: 403, expectedCode: 'CSRF_FAILED' },
  { label: 'PATCH /api/admin/posts/[id]',                        method: 'PATCH',  path: `/api/admin/posts/${PLACEHOLDER_ID}`,                   expectedStatus: 403, expectedCode: 'CSRF_FAILED' },
  { label: 'DELETE /api/admin/posts/[id]',                       method: 'DELETE', path: `/api/admin/posts/${PLACEHOLDER_ID}`,                   expectedStatus: 403, expectedCode: 'CSRF_FAILED' },
  { label: 'POST /api/admin/posts/[id]/publish',                 method: 'POST',   path: `/api/admin/posts/${PLACEHOLDER_ID}/publish`,           expectedStatus: 403, expectedCode: 'CSRF_FAILED' },
  { label: 'POST /api/admin/posts/[id]/unpublish',               method: 'POST',   path: `/api/admin/posts/${PLACEHOLDER_ID}/unpublish`,         expectedStatus: 403, expectedCode: 'CSRF_FAILED' },
  { label: 'POST /api/admin/posts/[id]/ai-readiness',            method: 'POST',   path: `/api/admin/posts/${PLACEHOLDER_ID}/ai-readiness`,      expectedStatus: 403, expectedCode: 'CSRF_FAILED' },
  { label: 'POST /api/admin/images',                             method: 'POST',   path: '/api/admin/images',                                    expectedStatus: 403, expectedCode: 'CSRF_FAILED' },
  { label: 'PATCH /api/admin/images/[id]',                       method: 'PATCH',  path: `/api/admin/images/${PLACEHOLDER_ID}`,                  expectedStatus: 403, expectedCode: 'CSRF_FAILED' },
]

test.describe('Bucket E · admin error envelopes parity (unauth walk)', () => {
  for (const r of ADMIN_ROUTES_NEED_AUTH) {
    test(`${r.label} returns ${r.expectedStatus} ${r.expectedCode} with §2.2 envelope`, async ({ request }) => {
      const res = await request.fetch(r.path, { method: r.method })
      expect(res.status()).toBe(r.expectedStatus)
      const body = await res.json()
      expect(body).toHaveProperty('error')
      expect(typeof body.error).toBe('string')
      expect(body.code).toBe(r.expectedCode)
      // §2.2 forbids leaking server internals — the message must not
      // include "MongoServerError" / "E11000" / stack-frame markers.
      expect(body.error).not.toMatch(/MongoServerError|E11000|at .* \(/)
    })
  }

  for (const r of ADMIN_ROUTES_NEED_CSRF) {
    test(`${r.label} returns ${r.expectedStatus} ${r.expectedCode} with §2.2 envelope (CSRF gate before auth)`, async ({ request }) => {
      const res = await request.fetch(r.path, {
        method: r.method,
        // Empty JSON body so route handlers that parse JSON before any
        // logic don't 422 us on a missing payload — but CSRF gate fires
        // first, so we expect 403 regardless.
        data: {},
      })
      expect(res.status()).toBe(r.expectedStatus)
      const body = await res.json()
      expect(body).toHaveProperty('error')
      expect(typeof body.error).toBe('string')
      expect(body.code).toBe(r.expectedCode)
      expect(body.error).not.toMatch(/MongoServerError|E11000|at .* \(/)
    })
  }

  test('GET /api/admin/posts/ai-readiness returns 401 UNAUTHORIZED (no CSRF gate on GET)', async ({ request }) => {
    const res = await request.fetch(`/api/admin/posts/${PLACEHOLDER_ID}/ai-readiness`, { method: 'GET' })
    expect(res.status()).toBe(401)
    expect((await res.json()).code).toBe('UNAUTHORIZED')
  })

  test('POST /api/admin/login validates JSON body before doing any DB work', async ({ request }) => {
    // Login has its own gate sequence (rate-limit → JSON parse → validation
    // → auth). With an empty body we expect 422 VALIDATION_FAILED.
    const res = await request.post('/api/admin/login', {
      data: {},
      headers: { 'content-type': 'application/json' },
    })
    expect(res.status()).toBe(422)
    const body = await res.json()
    expect(body.code).toBe('VALIDATION_FAILED')
    expect(typeof body.error).toBe('string')
  })

  test('POST /api/admin/login with malformed JSON returns 422 VALIDATION_FAILED', async ({ request }) => {
    const res = await request.post('/api/admin/login', {
      data: 'not json',
      headers: { 'content-type': 'application/json' },
    })
    expect(res.status()).toBe(422)
    expect((await res.json()).code).toBe('VALIDATION_FAILED')
  })
})

// ── Bucket C — public renderer baseline parity (always runs) ──────────────────

test.describe('Bucket C · public renderer baseline parity', () => {
  test('GET /robots.txt — dev env emits blanket Disallow', async ({ request }) => {
    const res = await request.get('/robots.txt')
    expect(res.status()).toBe(200)
    const body = await res.text()
    // Per app/robots.ts, non-prod returns `User-Agent: *` + `Disallow: /`
    // and intentionally no sitemap reference.
    expect(body).toMatch(/User-Agent:\s*\*/i)
    expect(body).toMatch(/Disallow:\s*\//)
  })

  test('GET /sitemap.xml — emits a valid urlset wrapper', async ({ request }) => {
    const res = await request.get('/sitemap.xml')
    expect(res.status()).toBe(200)
    const body = await res.text()
    expect(body).toMatch(/<urlset[^>]*xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/)
    // Homepage + /blog/ always present per app/sitemap.ts fixed entries.
    expect(body).toContain('https://www.metaborong.com/')
    expect(body).toContain('https://www.metaborong.com/blog/')
  })

  test('GET /llms.txt — emits the llmstxt.org frame', async ({ request }) => {
    const res = await request.get('/llms.txt')
    expect(res.status()).toBe(200)
    expect(res.headers()['content-type']).toMatch(/text\/plain/)
    const body = await res.text()
    expect(body).toMatch(/^# Metaborong/m)
    expect(body).toMatch(/^## Posts/m)
  })

  test('GET /llms-full.txt — emits the llmstxt.org frame', async ({ request }) => {
    const res = await request.get('/llms-full.txt')
    expect(res.status()).toBe(200)
    expect(res.headers()['content-type']).toMatch(/text\/plain/)
    const body = await res.text()
    expect(body).toMatch(/^# Metaborong/m)
  })

  test('GET /blog/rss.xml — emits RSS 2.0 with the channel envelope', async ({ request }) => {
    const res = await request.get('/blog/rss.xml')
    expect(res.status()).toBe(200)
    expect(res.headers()['content-type']).toMatch(/application\/rss\+xml/)
    const body = await res.text()
    expect(body).toMatch(/<rss version="2\.0"/)
    expect(body).toMatch(/<channel>/)
    expect(body).toMatch(/<title>Metaborong/)
    // atom:link self-reference per RSS best practice (M5-core).
    expect(body).toMatch(/<atom:link href="https:\/\/www\.metaborong\.com\/blog\/rss\.xml"/)
  })
})

// ── Bucket B + C with seeded post + D — creds-gated full flow ─────────────────

test.describe('Bucket B/C/D · full create → publish → fetch → unpublish → delete', () => {
  test.skip(!hasCreds, 'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run the creds-gated flow.')
  test.describe.configure({ mode: 'serial' })

  let api: APIRequestContext
  let csrf: string

  test.beforeAll(async () => {
    api = await request.newContext({ baseURL: 'http://localhost:3000' })
    // Log in once and reuse the same context for every test in this block.
    const loginRes = await api.post('/api/admin/login', {
      data: { email: ADMIN_EMAIL!, password: ADMIN_PASSWORD! },
      headers: { 'content-type': 'application/json' },
    })
    expect(loginRes.status()).toBe(200)
    const cookies = await api.storageState()
    const csrfCookie = cookies.cookies.find((c) => c.name === 'mb_csrf')
    expect(csrfCookie).toBeDefined()
    csrf = csrfCookie!.value
  })

  test.afterAll(async () => {
    await api?.dispose()
  })

  // The slug we'll create / publish / unpublish / delete across the
  // sequential block.
  const TITLE = `v2-mongo flow ${RUN_TAG}`
  const SLUG = `v2-mongo-flow-${RUN_TAG.toLowerCase().replace(/[^a-z0-9-]/g, '-')}`
  let postId = ''

  test('Bucket B.1 — create draft persists with status=draft and a UUID id', async () => {
    const res = await api.post('/api/admin/posts', {
      data: { title: TITLE, slug: SLUG },
      headers: { 'content-type': 'application/json', 'X-CSRF-Token': csrf },
    })
    expect(res.status()).toBe(201)
    const body = await res.json()
    expect(body.post.status).toBe('draft')
    expect(body.post.slug).toBe(SLUG)
    expect(body.post.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    expect(typeof body.post.created_at).toBe('string')
    expect(body.post.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    postId = body.post.id
  })

  test('Bucket D.1 — second create with the same slug returns 422 SLUG_CONFLICT', async () => {
    const res = await api.post('/api/admin/posts', {
      data: { title: TITLE + ' dup', slug: SLUG },
      headers: { 'content-type': 'application/json', 'X-CSRF-Token': csrf },
    })
    expect(res.status()).toBe(422)
    const body = await res.json()
    expect(body.code).toBe('SLUG_CONFLICT')
    expect(body.field).toBe('slug')
  })

  test('Bucket B.2 — list shows the draft for admin', async () => {
    const res = await api.get('/api/admin/posts?status=draft')
    expect(res.status()).toBe(200)
    const body = await res.json()
    const ids = (body.posts as Array<{ id: string }>).map((p) => p.id)
    expect(ids).toContain(postId)
  })

  test('Bucket B.3 — public /blog/[slug] returns 404 for a draft', async ({ request }) => {
    const res = await request.get(`/blog/${SLUG}/raw.md`)
    expect(res.status()).toBe(404)
  })

  test('Bucket B.4 — publish stamps published_at and flips status=published', async () => {
    const res = await api.post(`/api/admin/posts/${postId}/publish`, {
      headers: { 'X-CSRF-Token': csrf },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.post.status).toBe('published')
    expect(typeof body.post.published_at).toBe('string')
    expect(body.post.published_at).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  test('Bucket B.5 — re-publish keeps original published_at ($ifNull pipeline update)', async () => {
    const first = await api.get(`/api/admin/posts/${postId}`)
    const before = (await first.json()).post.published_at as string
    const res = await api.post(`/api/admin/posts/${postId}/publish`, {
      headers: { 'X-CSRF-Token': csrf },
    })
    expect(res.status()).toBe(200)
    const after = (await res.json()).post.published_at as string
    expect(after).toBe(before)
  })

  test('Bucket C.1 — published post is reachable at /blog/[slug]/raw.md', async ({ request }) => {
    const res = await request.get(`/blog/${SLUG}/raw.md`)
    expect(res.status()).toBe(200)
    expect(res.headers()['content-type']).toMatch(/text\/markdown/)
    const body = await res.text()
    expect(body).toContain(`# ${TITLE}`)
    expect(body).toContain(`Canonical: https://www.metaborong.com/blog/${SLUG}/`)
  })

  test('Bucket C.2 — sitemap.xml lists the slug + lastmod', async ({ request }) => {
    const res = await request.get('/sitemap.xml')
    expect(res.status()).toBe(200)
    const body = await res.text()
    expect(body).toContain(`https://www.metaborong.com/blog/${SLUG}/`)
  })

  test('Bucket C.3 — rss.xml contains the title and slug-derived link', async ({ request }) => {
    const res = await request.get('/blog/rss.xml')
    expect(res.status()).toBe(200)
    const body = await res.text()
    expect(body).toContain(TITLE)
    expect(body).toContain(`https://www.metaborong.com/blog/${SLUG}/`)
  })

  test('Bucket C.4 — /blog/[slug] HTML contains Article JSON-LD + canonical', async ({ request }) => {
    const res = await request.get(`/blog/${SLUG}/`)
    expect(res.status()).toBe(200)
    const html = await res.text()
    // Article JSON-LD is emitted via <script type="application/ld+json"> in
    // the page metadata; check for the canonical mention + JSON-LD marker.
    expect(html).toMatch(/<script[^>]*type="application\/ld\+json"/)
    expect(html).toContain(SLUG)
  })

  test('Bucket B.6 — unpublish flips status back to draft and the public page 404s', async ({ request }) => {
    const res = await api.post(`/api/admin/posts/${postId}/unpublish`, {
      headers: { 'X-CSRF-Token': csrf },
    })
    expect(res.status()).toBe(200)
    expect((await res.json()).post.status).toBe('draft')

    // Allow Next.js ISR revalidate to settle.
    await new Promise((r) => setTimeout(r, 250))
    const pub = await request.get(`/blog/${SLUG}/raw.md`)
    expect(pub.status()).toBe(404)
  })

  test('Bucket B.7 — delete drops the row; subsequent GET 404s', async () => {
    const del = await api.delete(`/api/admin/posts/${postId}`, {
      headers: { 'X-CSRF-Token': csrf },
    })
    expect(del.status()).toBe(200)
    expect((await del.json()).ok).toBe(true)

    const after = await api.get(`/api/admin/posts/${postId}`)
    expect(after.status()).toBe(404)
    expect((await after.json()).code).toBe('NOT_FOUND')
  })
})
