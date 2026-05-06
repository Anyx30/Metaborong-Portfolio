/*
 * Admin API client
 * -----------------
 * The single typed fetch wrapper used by every admin client component for
 * /api/admin/** calls. Behaviors (per docs/cms/agent-prompts.md §2):
 *
 *   · credentials: 'include' on every request so the mb_admin_session cookie
 *     rides along.
 *   · For non-GET requests, reads the mb_csrf cookie (NOT HttpOnly, set on
 *     login response) and attaches it as the X-CSRF-Token header. If the
 *     cookie is absent the call rejects with CsrfMissingError BEFORE any
 *     network round-trip.
 *   · Parses every response body once. 2xx → returns the typed body;
 *     non-2xx → throws ApiError carrying { status, code, error, field } from
 *     the §2.2 envelope.
 *   · 401 → triggers a global redirect to /admin/login?next=<currentPath>
 *     via window.location (so the browser fully re-fetches under the new
 *     anonymous state).
 *   · 403 with code === 'CSRF_FAILED' → triggers a one-time full-page reload
 *     so the server can re-issue mb_csrf.
 *   · 429 → parses the Retry-After header into a number of seconds and
 *     attaches it to the thrown ApiError as `retryAfter`.
 *
 * Only the error envelope is consumed at this layer. Callers stay shape-
 * agnostic via generics: api.post<{ ok: true }>('/api/admin/login', body).
 */

export type ApiErrorCode =
  | 'UNAUTHORIZED'
  | 'CSRF_FAILED'
  | 'VALIDATION_FAILED'
  | 'NOT_FOUND'
  | 'SLUG_CONFLICT'
  | 'RATE_LIMITED'
  | 'MCP_DISABLED'
  | 'MCP_UPSTREAM_ERROR'
  | 'UPLOAD_TOO_LARGE'
  | 'UPLOAD_BAD_TYPE'
  | 'INTERNAL'
  // Allow forward-compatibility with codes the contract may add later.
  | (string & {})

export interface ApiErrorEnvelope {
  error: string
  code: ApiErrorCode
  field?: string
}

export class ApiError extends Error {
  status: number
  code: ApiErrorCode
  field?: string
  retryAfter?: number

  constructor(args: {
    status: number
    code: ApiErrorCode
    error: string
    field?: string
    retryAfter?: number
  }) {
    super(args.error)
    this.name = 'ApiError'
    this.status = args.status
    this.code = args.code
    this.field = args.field
    this.retryAfter = args.retryAfter
  }
}

export class CsrfMissingError extends Error {
  constructor() {
    super('Missing mb_csrf cookie — sign in again.')
    this.name = 'CsrfMissingError'
  }
}

export class NetworkError extends Error {
  constructor(cause?: unknown) {
    super('Network error — please try again.')
    this.name = 'NetworkError'
    if (cause !== undefined) (this as { cause?: unknown }).cause = cause
  }
}

const CSRF_COOKIE_NAME = 'mb_csrf'

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const target = `${name}=`
  const parts = document.cookie ? document.cookie.split(';') : []
  for (const raw of parts) {
    const trimmed = raw.trim()
    if (trimmed.startsWith(target)) {
      return decodeURIComponent(trimmed.slice(target.length))
    }
  }
  return null
}

function isMutating(method: string): boolean {
  return method !== 'GET' && method !== 'HEAD'
}

function parseRetryAfter(headerValue: string | null): number | undefined {
  if (!headerValue) return undefined
  const asNumber = Number(headerValue)
  if (Number.isFinite(asNumber) && asNumber >= 0) return Math.round(asNumber)
  // Retry-After can be an HTTP-date; convert to a delta from now.
  const ts = Date.parse(headerValue)
  if (!Number.isNaN(ts)) {
    const delta = Math.round((ts - Date.now()) / 1000)
    return delta > 0 ? delta : 0
  }
  return undefined
}

function redirectToLogin(): void {
  if (typeof window === 'undefined') return
  const next = encodeURIComponent(window.location.pathname + window.location.search)
  window.location.assign(`/admin/login?next=${next}`)
}

let csrfReloadTriggered = false
function reloadForCsrf(): void {
  if (typeof window === 'undefined') return
  if (csrfReloadTriggered) return
  csrfReloadTriggered = true
  window.location.reload()
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT'
  body?: unknown
  signal?: AbortSignal
  /** When true, bypass the global 401 redirect (used by the layout-level auth probe). */
  skipAuthRedirect?: boolean
  /**
   * When true, allow non-GET requests to proceed without an mb_csrf cookie.
   * Login is the only endpoint where this is appropriate — the cookie is what
   * a successful login *issues*, so it cannot pre-exist on the very first
   * attempt. Backend's CSRF check carves login out server-side; this flag
   * carves it out on the client too. Do NOT use anywhere else.
   */
  skipCsrf?: boolean
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const method = opts.method ?? 'GET'
  const headers: Record<string, string> = {
    Accept: 'application/json',
  }

  let body: BodyInit | undefined
  if (opts.body !== undefined) {
    if (opts.body instanceof FormData) {
      body = opts.body
      // Don't set Content-Type — the browser supplies the multipart boundary.
    } else {
      headers['Content-Type'] = 'application/json'
      body = JSON.stringify(opts.body)
    }
  }

  if (isMutating(method)) {
    const token = readCookie(CSRF_COOKIE_NAME)
    if (token) {
      headers['X-CSRF-Token'] = token
    } else if (!opts.skipCsrf) {
      throw new CsrfMissingError()
    }
  }

  let res: Response
  try {
    res = await fetch(path, {
      method,
      headers,
      body,
      credentials: 'include',
      signal: opts.signal,
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    throw new NetworkError(err)
  }

  // 204 / empty body
  if (res.status === 204) return undefined as T

  let parsed: unknown = null
  const text = await res.text()
  if (text) {
    try {
      parsed = JSON.parse(text)
    } catch {
      // Fall through; we'll surface a generic ApiError below.
    }
  }

  if (res.ok) return parsed as T

  // Error path — normalize to the §2.2 envelope.
  const envelope: Partial<ApiErrorEnvelope> =
    parsed && typeof parsed === 'object' ? (parsed as Partial<ApiErrorEnvelope>) : {}

  const code: ApiErrorCode = (envelope.code as ApiErrorCode) || 'INTERNAL'
  const message = envelope.error || `Request failed with status ${res.status}.`
  const field = envelope.field

  if (res.status === 401 && !opts.skipAuthRedirect) {
    redirectToLogin()
  }
  if (res.status === 403 && code === 'CSRF_FAILED') {
    reloadForCsrf()
  }

  const retryAfter = res.status === 429 ? parseRetryAfter(res.headers.get('Retry-After')) : undefined

  throw new ApiError({ status: res.status, code, error: message, field, retryAfter })
}

export interface MultipartOptions {
  /** Called as the upload streams up. Reflects ProgressEvent.loaded / .total. */
  onProgress?: (loaded: number, total: number) => void
  signal?: AbortSignal
}

/**
 * POST a FormData body with upload-progress callbacks. Implemented via
 * XMLHttpRequest because `fetch()` does not expose `progress` events for
 * the request body — only response bodies. Reuses the same CSRF / 401 /
 * 403 / 429 handling as the fetch-based `request()` so callers see one
 * error shape across both.
 *
 * Returns the parsed 2xx body typed via the generic. Throws ApiError /
 * NetworkError / CsrfMissingError just like the rest of the client.
 */
function postMultipart<T>(path: string, formData: FormData, opts: MultipartOptions = {}): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const csrf = readCookie(CSRF_COOKIE_NAME)
    if (!csrf) {
      reject(new CsrfMissingError())
      return
    }

    const xhr = new XMLHttpRequest()
    xhr.open('POST', path, true)
    xhr.withCredentials = true
    xhr.setRequestHeader('Accept', 'application/json')
    xhr.setRequestHeader('X-CSRF-Token', csrf)
    // Don't set Content-Type — the browser supplies the multipart boundary.

    if (opts.onProgress && xhr.upload) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) opts.onProgress!(e.loaded, e.total)
      })
    }

    xhr.addEventListener('load', () => {
      const status = xhr.status
      const text = xhr.responseText
      let parsed: unknown = null
      if (text) {
        try { parsed = JSON.parse(text) } catch { /* fall through */ }
      }

      if (status >= 200 && status < 300) {
        resolve(parsed as T)
        return
      }

      const envelope: Partial<ApiErrorEnvelope> =
        parsed && typeof parsed === 'object' ? (parsed as Partial<ApiErrorEnvelope>) : {}
      const code: ApiErrorCode = (envelope.code as ApiErrorCode) || 'INTERNAL'
      const message = envelope.error || `Upload failed with status ${status}.`
      const field = envelope.field

      if (status === 401) redirectToLogin()
      if (status === 403 && code === 'CSRF_FAILED') reloadForCsrf()

      const retryAfter = status === 429 ? parseRetryAfter(xhr.getResponseHeader('Retry-After')) : undefined
      reject(new ApiError({ status, code, error: message, field, retryAfter }))
    })

    xhr.addEventListener('error', () => {
      reject(new NetworkError())
    })
    xhr.addEventListener('abort', () => {
      reject(new DOMException('aborted', 'AbortError'))
    })

    if (opts.signal) {
      if (opts.signal.aborted) {
        xhr.abort()
        return
      }
      opts.signal.addEventListener('abort', () => xhr.abort(), { once: true })
    }

    xhr.send(formData)
  })
}

export const api = {
  get: <T>(path: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...opts, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...opts, method: 'PATCH', body }),
  delete: <T>(path: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...opts, method: 'DELETE' }),
  postMultipart,
}
