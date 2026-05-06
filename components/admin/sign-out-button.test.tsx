// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

import { SignOutButton } from './sign-out-button'
import {
  ApiError,
  api,
  CsrfMissingError as RealCsrfMissingError,
  NetworkError as RealNetworkError,
} from '@/lib/api-client'

const routerPush = vi.fn()
const routerRefresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: routerPush, refresh: routerRefresh }),
}))

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

describe('<SignOutButton />', () => {
  beforeEach(() => {
    routerPush.mockReset()
    routerRefresh.mockReset()
    post.mockReset()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders a Sign out button', () => {
    render(<SignOutButton />)
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
  })

  it('happy path: posts to /api/admin/logout and navigates to /admin/login', async () => {
    post.mockResolvedValueOnce({ ok: true })
    render(<SignOutButton />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sign out/i }))
    })

    expect(post).toHaveBeenCalledTimes(1)
    expect(post).toHaveBeenCalledWith('/api/admin/logout')
    expect(routerPush).toHaveBeenCalledWith('/admin/login')
    expect(routerRefresh).toHaveBeenCalled()
  })

  it('401 from logout is silent — no inline error rendered (api-client handles redirect)', async () => {
    post.mockRejectedValueOnce(
      new ApiError({ status: 401, code: 'UNAUTHORIZED', error: 'auth required' }),
    )
    render(<SignOutButton />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sign out/i }))
    })

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(routerPush).not.toHaveBeenCalled()
  })

  it('CsrfMissingError silently bounces to /admin/login (session is gone anyway)', async () => {
    post.mockRejectedValueOnce(new RealCsrfMissingError())
    render(<SignOutButton />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sign out/i }))
    })

    expect(routerPush).toHaveBeenCalledWith('/admin/login')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('NetworkError shows the inline "Network error, try again." copy', async () => {
    post.mockRejectedValueOnce(new RealNetworkError(new Error('boom')))
    render(<SignOutButton />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sign out/i }))
    })

    expect(screen.getByRole('alert')).toHaveTextContent(/network error, try again/i)
    expect(routerPush).not.toHaveBeenCalled()
  })

  it('Generic ApiError shows the API message inline', async () => {
    post.mockRejectedValueOnce(
      new ApiError({ status: 500, code: 'INTERNAL', error: 'Boom on the server.' }),
    )
    render(<SignOutButton />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sign out/i }))
    })

    expect(screen.getByRole('alert')).toHaveTextContent(/boom on the server/i)
  })
})
