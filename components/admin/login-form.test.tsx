// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

import { LoginForm } from './login-form'
import {
  ApiError,
  api,
  CsrfMissingError as RealCsrfMissingError,
  NetworkError as RealNetworkError,
} from '@/lib/api-client'

// next/navigation hooks are not available outside the App Router runtime —
// stub them so the form renders. The same `routerPush` and `searchParamsGet`
// spies are reused across tests via beforeEach reassignment.
const routerPush = vi.fn()
const routerRefresh = vi.fn()
let nextParam: string | null = null

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: routerPush, refresh: routerRefresh }),
  useSearchParams: () => ({ get: (k: string) => (k === 'next' ? nextParam : null) }),
}))

// Wrap api.post so each test can stub the response without re-mocking the
// whole module. The real ApiError / CsrfMissingError / NetworkError exports
// remain real so `instanceof` checks inside the component still hold.
vi.mock('@/lib/api-client', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api-client')>('@/lib/api-client')
  return {
    ...actual,
    api: {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    },
  }
})

const post = api.post as unknown as ReturnType<typeof vi.fn>

describe('<LoginForm />', () => {
  beforeEach(() => {
    routerPush.mockReset()
    routerRefresh.mockReset()
    post.mockReset()
    nextParam = null
  })

  afterEach(() => {
    cleanup()
  })

  it('renders both labelled inputs and the Sign in button', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('blocks submit on empty email — inline error, focus to email, no API call', () => {
    render(<LoginForm />)
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    expect(screen.getByRole('alert')).toHaveTextContent(/email is required/i)
    expect(screen.getByLabelText(/email/i)).toHaveFocus()
    expect(post).not.toHaveBeenCalled()
  })

  it('blocks submit on empty password — inline error, focus to password, no API call', () => {
    render(<LoginForm />)
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.co' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    expect(screen.getByRole('alert')).toHaveTextContent(/password is required/i)
    expect(screen.getByLabelText(/password/i)).toHaveFocus()
    expect(post).not.toHaveBeenCalled()
  })

  it('happy path posts to /api/admin/login with skipCsrf:true and navigates to /admin', async () => {
    post.mockResolvedValueOnce({ ok: true })
    render(<LoginForm />)
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.co' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pw' } })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    })

    expect(post).toHaveBeenCalledTimes(1)
    expect(post).toHaveBeenCalledWith(
      '/api/admin/login',
      { email: 'a@b.co', password: 'pw' },
      { skipCsrf: true },
    )
    expect(routerPush).toHaveBeenCalledWith('/admin')
    expect(routerRefresh).toHaveBeenCalled()
  })

  it('401 envelope: renders error, clears password, retains email, focuses password', async () => {
    post.mockRejectedValueOnce(
      new ApiError({
        status: 401,
        code: 'UNAUTHORIZED',
        error: 'Invalid email or password.',
      }),
    )
    render(<LoginForm />)
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
    const pwInput = screen.getByLabelText(/password/i) as HTMLInputElement
    fireEvent.change(emailInput, { target: { value: 'a@b.co' } })
    fireEvent.change(pwInput, { target: { value: 'wrong-pw' } })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    })

    expect(screen.getByRole('alert')).toHaveTextContent(/invalid email or password/i)
    expect(emailInput.value).toBe('a@b.co')
    expect(pwInput.value).toBe('')
    expect(pwInput).toHaveFocus()
    expect(routerPush).not.toHaveBeenCalled()
  })

  it('429 RATE_LIMITED: shows countdown, disables button, decrements with fake timers', async () => {
    vi.useFakeTimers()
    try {
      post.mockRejectedValueOnce(
        new ApiError({
          status: 429,
          code: 'RATE_LIMITED',
          error: 'Too many attempts.',
          retryAfter: 90,
        }),
      )
      render(<LoginForm />)
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.co' } })
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pw' } })

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
      })

      const button = screen.getByRole('button', { name: /sign in/i })
      expect(button).toBeDisabled()
      // 90s ⇒ "2 minutes" (Math.ceil) per formatRetry().
      expect(screen.getByRole('alert')).toHaveTextContent(/2 minutes/i)

      // Advance 31s — remaining is 59s, which formatRetry() prints in
      // seconds (under-60-seconds branch). Asserts the live countdown is
      // ticking and crossing the minutes→seconds boundary.
      await act(async () => {
        vi.advanceTimersByTime(31_000)
      })
      expect(screen.getByRole('alert')).toHaveTextContent(/59 seconds/i)
      expect(button).toBeDisabled()
    } finally {
      vi.useRealTimers()
    }
  })

  it('NetworkError: shows the inline "Network error, try again." message', async () => {
    post.mockRejectedValueOnce(new RealNetworkError(new Error('boom')))
    render(<LoginForm />)
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.co' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pw' } })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    })

    expect(screen.getByRole('alert')).toHaveTextContent(/network error, try again/i)
  })

  it('CsrfMissingError fallback: shows the friendly "could not establish a session" copy', async () => {
    post.mockRejectedValueOnce(new RealCsrfMissingError())
    render(<LoginForm />)
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.co' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pw' } })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    })

    expect(screen.getByRole('alert')).toHaveTextContent(/could not establish a session/i)
  })

  describe('safeNext (open-redirect protection via ?next=)', () => {
    it('honors a same-origin /admin/* path on success', async () => {
      nextParam = '/admin/posts'
      post.mockResolvedValueOnce({ ok: true })
      render(<LoginForm />)
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.co' } })
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pw' } })

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
      })

      expect(routerPush).toHaveBeenCalledWith('/admin/posts')
    })

    it('falls back to /admin when next is protocol-relative (//evil.com)', async () => {
      nextParam = '//evil.com'
      post.mockResolvedValueOnce({ ok: true })
      render(<LoginForm />)
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.co' } })
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pw' } })

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
      })

      expect(routerPush).toHaveBeenCalledWith('/admin')
    })

    it('falls back to /admin when next is an absolute URL (https://evil.com)', async () => {
      nextParam = 'https://evil.com'
      post.mockResolvedValueOnce({ ok: true })
      render(<LoginForm />)
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.co' } })
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pw' } })

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
      })

      expect(routerPush).toHaveBeenCalledWith('/admin')
    })
  })
})
