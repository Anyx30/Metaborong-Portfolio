'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ApiError,
  CsrfMissingError,
  NetworkError,
  api,
} from '@/lib/api-client'

type FieldKey = 'email' | 'password'

function validate(values: { email: string; password: string }): {
  field: FieldKey
  message: string
} | null {
  if (!values.email.trim()) {
    return { field: 'email', message: 'Email is required.' }
  }
  if (!values.password) {
    return { field: 'password', message: 'Password is required.' }
  }
  return null
}

// Only allow internal /admin/* paths to prevent open-redirect via ?next=.
function safeNext(value: string | null): string {
  if (!value) return '/admin'
  if (!value.startsWith('/admin')) return '/admin'
  if (value.startsWith('//')) return '/admin'
  // Block protocol-relative and full URLs that slipped past the prefix check.
  if (value.includes('://')) return '/admin'
  return value
}

function formatRetry(seconds: number): string {
  if (seconds <= 0) return 'a moment'
  if (seconds < 60) return `${seconds} second${seconds === 1 ? '' : 's'}`
  const minutes = Math.ceil(seconds / 60)
  return `${minutes} minute${minutes === 1 ? '' : 's'}`
}

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = safeNext(searchParams.get('next'))

  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldError, setFieldError] = useState<FieldKey | null>(null)
  const [retryAt, setRetryAt] = useState<number | null>(null) // epoch ms
  const [retryRemaining, setRetryRemaining] = useState<number>(0) // seconds
  // Defers focus until after `busy` flips back to false — direct focus()
  // calls inside the catch block run while the input is still disabled,
  // which silently no-ops in real browsers and happy-dom alike.
  const [focusAfterReset, setFocusAfterReset] = useState<FieldKey | null>(null)

  useEffect(() => {
    if (busy) return
    if (focusAfterReset === 'email') emailRef.current?.focus()
    else if (focusAfterReset === 'password') passwordRef.current?.focus()
    if (focusAfterReset !== null) setFocusAfterReset(null)
  }, [busy, focusAfterReset])

  useEffect(() => {
    if (retryAt === null) return
    const tick = () => {
      const remaining = Math.max(0, Math.round((retryAt - Date.now()) / 1000))
      setRetryRemaining(remaining)
      if (remaining === 0) setRetryAt(null)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [retryAt])

  const rateLimited = retryAt !== null && retryRemaining > 0

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (busy || rateLimited) return

    const values = { email: email.trim(), password }
    const clientError = validate(values)
    if (clientError) {
      setError(clientError.message)
      setFieldError(clientError.field)
      // Move focus to the offending field for keyboard / screen-reader users.
      if (clientError.field === 'email') emailRef.current?.focus()
      else passwordRef.current?.focus()
      return
    }

    setError(null)
    setFieldError(null)
    setBusy(true)
    try {
      // skipCsrf: login is the one endpoint where mb_csrf can't pre-exist —
      // it's the call that issues the cookie. BE carves login out server-side.
      await api.post<{ ok: true }>('/api/admin/login', values, { skipCsrf: true })
      router.push(next)
      router.refresh()
    } catch (err) {
      // Per spec: never clear email; do clear password.
      setPassword('')

      if (err instanceof CsrfMissingError) {
        // Defensive only — with skipCsrf:true on the login POST above this
        // path is unreachable. Kept as a friendly fallback in case the
        // api-client contract changes.
        setError('Could not establish a session — please refresh and try again.')
        setBusy(false)
        return
      }

      if (err instanceof NetworkError) {
        setError('Network error, try again.')
        setBusy(false)
        return
      }

      if (err instanceof ApiError) {
        if (err.status === 429 && err.code === 'RATE_LIMITED') {
          const seconds = err.retryAfter ?? 900 // fall back to 15 min if header missing
          setRetryAt(Date.now() + seconds * 1000)
          setRetryRemaining(seconds)
          setError(`Too many attempts. Try again in ${formatRetry(seconds)}.`)
          setBusy(false)
          return
        }

        // Per spec: render the contract's `error` field. Map field path back
        // to one of our known inputs when present.
        const f =
          err.field === 'email' || err.field === 'password' ? err.field : null
        setFieldError(f)
        setError(err.message)
        // Defer focus until busy is back to false (input is no longer disabled).
        setFocusAfterReset(f === 'email' ? 'email' : 'password')
        setBusy(false)
        return
      }

      setError('Sign in failed. Please try again.')
      setBusy(false)
    }
  }

  const submitDisabled = busy || rateLimited

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex w-full flex-col gap-[20px]"
    >
      <div className="flex flex-col gap-[6px]">
        <label
          htmlFor="admin-email"
          className="text-[12px] font-medium uppercase tracking-[0.08em] text-gray"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Email
        </label>
        <input
          id="admin-email"
          ref={emailRef}
          name="email"
          type="email"
          autoComplete="username"
          required
          aria-invalid={fieldError === 'email' || undefined}
          aria-describedby={error ? 'admin-login-error' : undefined}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={busy}
          className={`h-[44px] w-full rounded-md border bg-white px-3 text-[14px] tracking-[-0.01em] text-dark transition-colors duration-150 placeholder:text-gray-light focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
            fieldError === 'email' ? 'border-[#b42318]' : 'border-border hover:border-brand/30'
          }`}
        />
      </div>

      <div className="flex flex-col gap-[6px]">
        <label
          htmlFor="admin-password"
          className="text-[12px] font-medium uppercase tracking-[0.08em] text-gray"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Password
        </label>
        <input
          id="admin-password"
          ref={passwordRef}
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={fieldError === 'password' || undefined}
          aria-describedby={error ? 'admin-login-error' : undefined}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={busy}
          className={`h-[44px] w-full rounded-md border bg-white px-3 text-[14px] tracking-[-0.01em] text-dark transition-colors duration-150 placeholder:text-gray-light focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
            fieldError === 'password' ? 'border-[#b42318]' : 'border-border hover:border-brand/30'
          }`}
        />
      </div>

      {error ? (
        <div
          id="admin-login-error"
          role="alert"
          aria-live="polite"
          className="rounded-md border border-[#fda29b] bg-[#fef3f2] px-3 py-2 text-[13px] leading-[1.45] text-[#b42318] tracking-[-0.005em]"
        >
          {rateLimited && retryRemaining > 0
            ? `Too many attempts. Try again in ${formatRetry(retryRemaining)}.`
            : error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={submitDisabled}
        className="inline-flex h-[44px] items-center justify-center gap-2 rounded-md bg-brand px-5 text-[14px] font-semibold tracking-[-0.01em] text-white transition-opacity duration-150 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        {busy ? (
          <>
            <span
              aria-hidden="true"
              className="inline-block h-[14px] w-[14px] animate-spin rounded-full border-2 border-white/40 border-t-white"
            />
            Signing in…
          </>
        ) : (
          'Sign in'
        )}
      </button>
    </form>
  )
}
