// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

import { AiReadinessButton } from './ai-readiness-button'
import { ApiError, api } from '@/lib/api-client'
import type { Post } from '@/lib/blog-schema'

vi.mock('@/lib/api-client', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api-client')>('@/lib/api-client')
  return {
    ...actual,
    api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  }
})

const apiGet = api.get as unknown as ReturnType<typeof vi.fn>

function postFixture(overrides: Partial<Post> = {}): Pick<Post, 'id' | 'status' | 'ai_readiness_score' | 'ai_readiness_band'> {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    status: 'draft',
    ai_readiness_score: null,
    ai_readiness_band: null,
    ...overrides,
  }
}

describe('<AiReadinessButton />', () => {
  beforeEach(() => { apiGet.mockReset() })
  afterEach(() => cleanup())

  it('hides the button when band is null AND probe returns 503 MCP_DISABLED', async () => {
    apiGet.mockRejectedValueOnce(
      new ApiError({ status: 503, code: 'MCP_DISABLED', error: 'Service not configured' }),
    )
    render(<AiReadinessButton post={postFixture({ status: 'published' })} onOpen={() => {}} />)
    await waitFor(() => {
      expect(screen.queryByTestId('ai-readiness-button')).toBeNull()
      expect(screen.queryByTestId('ai-readiness-button-probing')).toBeNull()
    })
    expect(apiGet).toHaveBeenCalledWith(
      '/api/admin/posts/11111111-1111-1111-1111-111111111111/ai-readiness',
    )
  })

  it('renders disabled with the v1.5 tooltip when the post is in draft status', async () => {
    apiGet.mockResolvedValueOnce(null)
    render(<AiReadinessButton post={postFixture({ status: 'draft' })} onOpen={() => {}} />)
    const btn = await screen.findByTestId('ai-readiness-button')
    expect(btn).toBeDisabled()
    expect(btn).toHaveAttribute('title', expect.stringMatching(/after publish in v1\.5/i))
  })

  it('renders enabled with the score pill when the post has a cached band', async () => {
    // Cached band short-circuits the probe; api.get must NOT be called.
    render(
      <AiReadinessButton
        post={postFixture({ status: 'published', ai_readiness_score: 41, ai_readiness_band: 'weak' })}
        onOpen={() => {}}
      />,
    )
    const btn = await screen.findByTestId('ai-readiness-button')
    expect(btn).toBeEnabled()
    const pill = screen.getByTestId('ai-readiness-button-pill')
    expect(pill.textContent).toMatch(/·\s*41\s*·\s*WEAK/i)
    expect(apiGet).not.toHaveBeenCalled()
  })

  it('clicking the button invokes the onOpen callback', async () => {
    const onOpen = vi.fn()
    render(
      <AiReadinessButton
        post={postFixture({ status: 'published', ai_readiness_score: 72, ai_readiness_band: 'adequate' })}
        onOpen={onOpen}
      />,
    )
    const btn = await screen.findByTestId('ai-readiness-button')
    btn.click()
    expect(onOpen).toHaveBeenCalledTimes(1)
  })
})
