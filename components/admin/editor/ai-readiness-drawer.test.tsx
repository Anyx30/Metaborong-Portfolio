// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

import { AiReadinessDrawer } from './ai-readiness-drawer'
import { ApiError, api } from '@/lib/api-client'
import type { AiReadinessApiResponse } from '@/lib/ai-readiness/ui-types'
import type { AiReadinessCheck, AiReadinessReport } from '@/lib/blog-schema'

vi.mock('@/lib/api-client', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api-client')>('@/lib/api-client')
  return {
    ...actual,
    api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  }
})

const apiPost = api.post as unknown as ReturnType<typeof vi.fn>

function makeChecks(): AiReadinessCheck[] {
  // The 8 known VerseOdin check ids per lib/blog-schema.ts
  // aiReadinessCheckIdSchema. Mix of pass/warning/fail so each status
  // palette branch renders.
  return [
    { id: 'robots-txt',         label: 'robots.txt',         status: 'pass',    scope: 'domain', score: 100, details: 'Detail.', recommendation: 'Rec.' },
    { id: 'sitemap',            label: 'Sitemap',            status: 'pass',    scope: 'domain', score: 100, details: 'Detail.', recommendation: 'Rec.' },
    { id: 'llms-txt',           label: 'llms.txt',           status: 'warning', scope: 'domain', score: 50,  details: 'Detail.', recommendation: 'Rec.' },
    { id: 'heading-structure',  label: 'Heading structure',  status: 'pass',    scope: 'page',   score: 100, details: 'Detail.', recommendation: 'Rec.' },
    { id: 'readability',        label: 'Readability',        status: 'warning', scope: 'page',   score: 60,  details: 'Detail.', recommendation: 'Rec.' },
    { id: 'meta-tags',          label: 'Meta tags',          status: 'pass',    scope: 'page',   score: 92,  details: 'Detail.', recommendation: 'Rec.' },
    { id: 'semantic-html',      label: 'Semantic HTML',      status: 'fail',    scope: 'page',   score: 0,   details: 'Detail.', recommendation: 'Rec.' },
    { id: 'accessibility',      label: 'Accessibility',      status: 'pass',    scope: 'page',   score: 88,  details: 'Detail.', recommendation: 'Rec.' },
  ]
}

function makeReport(overrides: Partial<AiReadinessReport> = {}): AiReadinessReport {
  return {
    overallScore:          78,
    pageScore:             80,
    domainScore:           75,
    domainReputationBonus: 0,
    metadata: {
      title:       'Hello',
      description: 'Lede',
      analyzedAt:  '2026-05-08T12:34:56.000Z',
    },
    checks: makeChecks(),
    ...overrides,
  }
}

function makeResponse(overrides: Partial<AiReadinessApiResponse> = {}): AiReadinessApiResponse {
  return {
    score:     78,
    band:      'adequate',
    report:    makeReport(),
    cached:    false,
    scannedAt: '2026-05-08T12:34:56.000Z',
    ...overrides,
  }
}

describe('<AiReadinessDrawer />', () => {
  beforeEach(() => { apiPost.mockReset() })
  afterEach(() => cleanup())

  it('renders the hero card and 8 check cards from a fixture report', () => {
    render(
      <AiReadinessDrawer
        open
        onClose={() => {}}
        post={{ id: 'p1', title: 'Hello', status: 'published' }}
        initialReport={makeResponse()}
      />,
    )
    // Hero score + band.
    expect(screen.getByTestId('ai-readiness-overall-score')).toHaveTextContent('78')
    expect(screen.getByTestId('ai-readiness-overall-band')).toHaveTextContent(/ADEQUATE/i)
    // Page / domain split.
    const split = screen.getByTestId('ai-readiness-split')
    expect(within(split).getByText('80')).toBeInTheDocument()
    expect(within(split).getByText('75')).toBeInTheDocument()
    // 8 check cards.
    const cards = screen.getAllByTestId('ai-readiness-check-card')
    expect(cards).toHaveLength(8)
    // No POST should have fired — we seeded an initialReport.
    expect(apiPost).not.toHaveBeenCalled()
  })

  it('shows a "rate limited" banner with the parsed Retry-After time on 429', async () => {
    apiPost.mockRejectedValueOnce(
      new ApiError({ status: 429, code: 'RATE_LIMITED', error: 'Too many', retryAfter: 600 }),
    )
    render(
      <AiReadinessDrawer
        open
        onClose={() => {}}
        post={{ id: 'p1', title: 'Hello', status: 'published' }}
        initialReport={null}
      />,
    )
    const banner = await screen.findByTestId('ai-readiness-banner-rate-limited')
    expect(banner).toHaveTextContent(/rate limited/i)
    // The exact HH:MM is wall-clock-dependent; assert the format only.
    expect(banner.textContent ?? '').toMatch(/Try again at \d{2}:\d{2}/)
  })

  it('shows a "publish first" banner with a Publish-now button on POST_NOT_PUBLISHED', async () => {
    apiPost.mockRejectedValueOnce(
      new ApiError({ status: 409, code: 'POST_NOT_PUBLISHED', error: 'Score is only available after publish in v1.5.' }),
    )
    const onPublishRequest = vi.fn()
    render(
      <AiReadinessDrawer
        open
        onClose={() => {}}
        post={{ id: 'p1', title: 'Hello', status: 'draft' }}
        initialReport={null}
        onPublishRequest={onPublishRequest}
      />,
    )
    const banner = await screen.findByTestId('ai-readiness-banner-not-published')
    expect(banner).toHaveTextContent(/publish the post first/i)
    const cta = within(banner).getByTestId('ai-readiness-publish-now')
    fireEvent.click(cta)
    expect(onPublishRequest).toHaveBeenCalledTimes(1)
  })

  it('shows the MCP-disabled banner on 503', async () => {
    apiPost.mockRejectedValueOnce(
      new ApiError({ status: 503, code: 'MCP_DISABLED', error: 'Service not configured' }),
    )
    render(
      <AiReadinessDrawer
        open
        onClose={() => {}}
        post={{ id: 'p1', title: 'Hello', status: 'published' }}
        initialReport={null}
      />,
    )
    const banner = await screen.findByTestId('ai-readiness-banner-mcp-disabled')
    expect(banner).toHaveTextContent(/service not configured/i)
  })

  it('Re-scan button fires a fresh POST when a report is already shown', async () => {
    apiPost.mockResolvedValueOnce(makeResponse({ score: 91, band: 'strong' }))
    render(
      <AiReadinessDrawer
        open
        onClose={() => {}}
        post={{ id: 'p1', title: 'Hello', status: 'published' }}
        initialReport={makeResponse()}
      />,
    )
    expect(screen.getByTestId('ai-readiness-overall-score')).toHaveTextContent('78')
    const rescan = screen.getByTestId('ai-readiness-rescan')
    await act(async () => { fireEvent.click(rescan) })
    await waitFor(() => {
      expect(screen.getByTestId('ai-readiness-overall-score')).toHaveTextContent('91')
    })
    expect(apiPost).toHaveBeenCalledTimes(1)
  })

  it('auto-fires a POST when opened without an initialReport', async () => {
    apiPost.mockResolvedValueOnce(makeResponse())
    render(
      <AiReadinessDrawer
        open
        onClose={() => {}}
        post={{ id: 'p1', title: 'Hello', status: 'published' }}
        initialReport={null}
      />,
    )
    await waitFor(() => {
      expect(apiPost).toHaveBeenCalledWith('/api/admin/posts/p1/ai-readiness')
    })
    expect(await screen.findByTestId('ai-readiness-overall-score')).toHaveTextContent('78')
  })

  it('does not render at all when open=false', () => {
    render(
      <AiReadinessDrawer
        open={false}
        onClose={() => {}}
        post={{ id: 'p1', title: 'Hello', status: 'published' }}
        initialReport={makeResponse()}
      />,
    )
    expect(screen.queryByTestId('ai-readiness-drawer')).toBeNull()
  })
})
