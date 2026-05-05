// Unit tests for the admin API client.
//
// Runs in Node (the default vitest environment) with hand-rolled `document`
// and `window` globals so we can assert on `document.cookie` reads,
// `window.location.assign`, and `window.location.reload` without paying the
// happy-dom startup cost on every test.
//
// The api-client module owns one piece of mutable singleton state — the
// `csrfReloadTriggered` flag that prevents an infinite reload loop on
// repeated 403 CSRF responses. We reset modules between tests so that flag
// starts each test in its initial (false) state.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

type LocationStub = {
  pathname: string
  search: string
  assign: ReturnType<typeof vi.fn>
  reload: ReturnType<typeof vi.fn>
}

type DocumentStub = { cookie: string }

interface World {
  document: DocumentStub
  location: LocationStub
}

function buildResponse(init: {
  status: number
  body?: unknown
  headers?: Record<string, string>
}): Response {
  const text =
    init.body === undefined ? '' : typeof init.body === 'string' ? init.body : JSON.stringify(init.body)
  return new Response(text, {
    status: init.status,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  })
}

function setupWorld(opts: { cookie?: string; pathname?: string; search?: string } = {}): World {
  const document: DocumentStub = { cookie: opts.cookie ?? '' }
  const location: LocationStub = {
    pathname: opts.pathname ?? '/admin',
    search: opts.search ?? '',
    assign: vi.fn(),
    reload: vi.fn(),
  }
  ;(globalThis as unknown as { document: DocumentStub }).document = document
  ;(globalThis as unknown as { window: { location: LocationStub } }).window = { location }
  return { document, location }
}

function teardownWorld(): void {
  delete (globalThis as Partial<{ document: unknown; window: unknown }>).document
  delete (globalThis as Partial<{ document: unknown; window: unknown }>).window
}

async function loadClient() {
  // Dynamic import after vi.resetModules() so the csrfReloadTriggered
  // module-level flag starts fresh for each test.
  return await import('./api-client')
}

describe('lib/api-client', () => {
  let world: World

  beforeEach(() => {
    vi.resetModules()
    vi.restoreAllMocks()
    world = setupWorld()
  })

  afterEach(() => {
    teardownWorld()
  })

  it('GET requests do not attach X-CSRF-Token, even with the cookie present', async () => {
    world.document.cookie = 'mb_csrf=abc123'
    const fetchMock = vi.fn().mockResolvedValue(buildResponse({ status: 200, body: { ok: true } }))
    vi.stubGlobal('fetch', fetchMock)

    const { api } = await loadClient()
    await api.get('/api/admin/posts')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [, init] = fetchMock.mock.calls[0]
    expect(init.method).toBe('GET')
    expect(init.headers['X-CSRF-Token']).toBeUndefined()
    expect(init.credentials).toBe('include')
  })

  it('POST with mb_csrf cookie attaches X-CSRF-Token header and proceeds', async () => {
    world.document.cookie = 'foo=bar; mb_csrf=tok-42; baz=qux'
    const fetchMock = vi.fn().mockResolvedValue(buildResponse({ status: 200, body: { ok: true } }))
    vi.stubGlobal('fetch', fetchMock)

    const { api } = await loadClient()
    await api.post('/api/admin/posts', { title: 'hi' })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [, init] = fetchMock.mock.calls[0]
    expect(init.method).toBe('POST')
    expect(init.headers['X-CSRF-Token']).toBe('tok-42')
    expect(init.headers['Content-Type']).toBe('application/json')
  })

  it('POST without mb_csrf and without skipCsrf throws CsrfMissingError BEFORE calling fetch', async () => {
    world.document.cookie = ''
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const { api, CsrfMissingError } = await loadClient()
    await expect(api.post('/api/admin/posts', {})).rejects.toBeInstanceOf(CsrfMissingError)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('POST without mb_csrf with skipCsrf:true proceeds without the header (login carve-out)', async () => {
    world.document.cookie = ''
    const fetchMock = vi.fn().mockResolvedValue(buildResponse({ status: 200, body: { ok: true } }))
    vi.stubGlobal('fetch', fetchMock)

    const { api } = await loadClient()
    await api.post('/api/admin/login', { email: 'a@b.co', password: 'pw' }, { skipCsrf: true })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [, init] = fetchMock.mock.calls[0]
    expect(init.headers['X-CSRF-Token']).toBeUndefined()
  })

  it('POST with cookie AND skipCsrf:true STILL attaches the header (defense in depth)', async () => {
    world.document.cookie = 'mb_csrf=present-anyway'
    const fetchMock = vi.fn().mockResolvedValue(buildResponse({ status: 200, body: { ok: true } }))
    vi.stubGlobal('fetch', fetchMock)

    const { api } = await loadClient()
    await api.post('/api/admin/login', {}, { skipCsrf: true })

    const [, init] = fetchMock.mock.calls[0]
    expect(init.headers['X-CSRF-Token']).toBe('present-anyway')
  })

  it('401 response triggers redirect to /admin/login?next=<path> via window.location.assign', async () => {
    teardownWorld()
    world = setupWorld({ pathname: '/admin/posts/abc', search: '?tab=draft', cookie: 'mb_csrf=x' })
    const fetchMock = vi.fn().mockResolvedValue(
      buildResponse({ status: 401, body: { error: 'auth required', code: 'UNAUTHORIZED' } }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const { api, ApiError } = await loadClient()
    await expect(api.get('/api/admin/posts')).rejects.toBeInstanceOf(ApiError)

    expect(world.location.assign).toHaveBeenCalledTimes(1)
    expect(world.location.assign).toHaveBeenCalledWith(
      `/admin/login?next=${encodeURIComponent('/admin/posts/abc?tab=draft')}`,
    )
  })

  it('401 with skipAuthRedirect:true throws ApiError but does NOT redirect', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      buildResponse({ status: 401, body: { error: 'auth required', code: 'UNAUTHORIZED' } }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const { api, ApiError } = await loadClient()
    await expect(api.get('/api/admin/me', { skipAuthRedirect: true })).rejects.toBeInstanceOf(ApiError)
    expect(world.location.assign).not.toHaveBeenCalled()
  })

  it('403 CSRF_FAILED reloads the page exactly once across multiple failures (csrfReloadTriggered guard)', async () => {
    world.document.cookie = 'mb_csrf=t1'
    // Fresh Response per call — the body stream can only be read once.
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve(buildResponse({ status: 403, body: { error: 'bad token', code: 'CSRF_FAILED' } })),
    )
    vi.stubGlobal('fetch', fetchMock)

    const { api, ApiError } = await loadClient()
    await expect(api.post('/api/admin/posts', {})).rejects.toBeInstanceOf(ApiError)
    await expect(api.post('/api/admin/posts', {})).rejects.toBeInstanceOf(ApiError)

    expect(world.location.reload).toHaveBeenCalledTimes(1)
  })

  it('429 with numeric Retry-After parses the seconds onto the thrown ApiError', async () => {
    world.document.cookie = 'mb_csrf=t'
    const fetchMock = vi.fn().mockResolvedValue(
      buildResponse({
        status: 429,
        body: { error: 'too many', code: 'RATE_LIMITED' },
        headers: { 'Retry-After': '120' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const { api, ApiError } = await loadClient()
    let caught: unknown
    try {
      await api.post('/api/admin/login', {}, { skipCsrf: true })
    } catch (err) {
      caught = err
    }
    expect(caught).toBeInstanceOf(ApiError)
    expect((caught as InstanceType<typeof ApiError>).retryAfter).toBe(120)
    expect((caught as InstanceType<typeof ApiError>).code).toBe('RATE_LIMITED')
  })

  it('429 with HTTP-date Retry-After parses to a positive delta in seconds', async () => {
    const future = new Date(Date.now() + 90_000).toUTCString() // ~90s from now
    const fetchMock = vi.fn().mockResolvedValue(
      buildResponse({
        status: 429,
        body: { error: 'too many', code: 'RATE_LIMITED' },
        headers: { 'Retry-After': future },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const { api, ApiError } = await loadClient()
    let caught: unknown
    try {
      await api.post('/api/admin/login', {}, { skipCsrf: true })
    } catch (err) {
      caught = err
    }
    expect(caught).toBeInstanceOf(ApiError)
    const retry = (caught as InstanceType<typeof ApiError>).retryAfter ?? 0
    expect(retry).toBeGreaterThan(60)
    expect(retry).toBeLessThanOrEqual(120)
  })

  it('Network failure throws NetworkError with the original cause attached', async () => {
    const original = new TypeError('boom')
    const fetchMock = vi.fn().mockRejectedValue(original)
    vi.stubGlobal('fetch', fetchMock)

    const { api, NetworkError } = await loadClient()
    let caught: unknown
    try {
      await api.get('/api/admin/posts')
    } catch (err) {
      caught = err
    }
    expect(caught).toBeInstanceOf(NetworkError)
    expect((caught as { cause?: unknown }).cause).toBe(original)
  })

  it('AbortError is re-thrown as-is, not wrapped in NetworkError', async () => {
    const abort = new DOMException('aborted', 'AbortError')
    const fetchMock = vi.fn().mockRejectedValue(abort)
    vi.stubGlobal('fetch', fetchMock)

    const { api, NetworkError } = await loadClient()
    await expect(api.get('/api/admin/posts')).rejects.toBe(abort)
    // And not wrapped:
    await expect(api.get('/api/admin/posts')).rejects.not.toBeInstanceOf(NetworkError)
  })

  it('2xx returns the parsed JSON body typed via the generic', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      buildResponse({ status: 200, body: { ok: true, count: 7 } }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const { api } = await loadClient()
    const body = await api.get<{ ok: boolean; count: number }>('/api/admin/posts')
    expect(body.ok).toBe(true)
    expect(body.count).toBe(7)
  })

  it('204 returns undefined without trying to parse a body', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)

    const { api } = await loadClient()
    const body = await api.get<undefined>('/api/admin/something')
    expect(body).toBeUndefined()
  })
})
