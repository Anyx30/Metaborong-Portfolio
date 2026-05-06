'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ApiError, CsrfMissingError, NetworkError, api } from '@/lib/api-client'

export function SignOutButton() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    if (busy) return
    setBusy(true)
    setError(null)
    try {
      await api.post<{ ok: true }>('/api/admin/logout')
      router.push('/admin/login')
      router.refresh()
    } catch (err) {
      if (err instanceof CsrfMissingError) {
        // No CSRF means the session is gone anyway; just bounce.
        router.push('/admin/login')
        return
      }
      if (err instanceof ApiError && err.status === 401) {
        // 401 redirect already handled by api-client; nothing more to do.
        return
      }
      const message =
        err instanceof NetworkError
          ? 'Network error, try again.'
          : err instanceof ApiError
            ? err.message
            : 'Sign out failed.'
      setError(message)
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      {error ? (
        <span
          role="alert"
          className="text-[12px] text-[#b42318] tracking-[-0.005em]"
        >
          {error}
        </span>
      ) : null}
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[13px] font-medium text-dark tracking-[-0.01em] transition-colors duration-150 hover:border-brand/30 hover:text-brand disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        {busy ? 'Signing out…' : 'Sign out'}
      </button>
    </div>
  )
}
