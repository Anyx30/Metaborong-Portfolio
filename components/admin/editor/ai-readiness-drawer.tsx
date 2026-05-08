'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError, NetworkError, api } from '@/lib/api-client'
import type { AiReadinessCheck, Post } from '@/lib/blog-schema'
import {
  bandPalette,
  checkStatusPalette,
  type AiReadinessApiResponse,
} from '@/lib/ai-readiness/ui-types'

type DrawerState =
  | { kind: 'idle' }
  | { kind: 'loading' }                                 // POST in flight
  | { kind: 'rate-limited'; retryAt: number }           // 429 — Retry-After parsed
  | { kind: 'mcp-disabled' }                            // 503
  | { kind: 'not-published' }                           // 409 + POST_NOT_PUBLISHED
  | { kind: 'error'; message: string }
  | { kind: 'ready'; report: AiReadinessApiResponse }

interface AiReadinessDrawerProps {
  open: boolean
  onClose: () => void
  /** Drives header title + decides whether the "Publish now" jump-link can
   *  be offered when the BE returns POST_NOT_PUBLISHED. */
  post: Pick<Post, 'id' | 'title' | 'status'>
  /** When the drawer mounts, prefer the report we already have on the post
   *  (server-rendered into the page). Avoids a redundant POST on every open. */
  initialReport: AiReadinessApiResponse | null
  /** Invoked when the drawer's "Publish now" button is clicked from the
   *  not-published state. Parent re-runs its existing publish handler. */
  onPublishRequest?: () => void
}

/** Right-side drawer that surfaces the AI readiness report.
 *
 *  Slides in over the editor's preview pane (visually) — implemented as a
 *  fixed-position panel anchored to the right edge of the viewport. The
 *  preview pane is naturally on the right of the editor shell, so this
 *  pattern matches the dispatch's "drawer takes the preview's width"
 *  intent without coupling the drawer to EditorShell internals.
 *
 *  Renders three regions:
 *    1. Header — post title + close X.
 *    2. Hero card — overall score, band, page/domain split (from
 *       report.pageScore / report.domainScore), scanned-at timestamp,
 *       and a Re-scan button.
 *    3. List of check cards — status pill / label / per-check score /
 *       page-or-domain scope chip / details / recommendation.
 *
 *  Error surfaces (each is leak-safe — no token / URL leaks):
 *    · 429   → "Rate limited — try again at HH:MM" using Retry-After.
 *    · 503   → "Service not configured" admin-only banner.
 *    · 409 + code='POST_NOT_PUBLISHED' → "Publish the post first" with a
 *      Publish-now button that runs the parent's publish flow. */
export function AiReadinessDrawer({
  open,
  onClose,
  post,
  initialReport,
  onPublishRequest,
}: AiReadinessDrawerProps) {
  const [state, setState] = useState<DrawerState>(() =>
    initialReport ? { kind: 'ready', report: initialReport } : { kind: 'idle' },
  )
  // Track whether we've kicked off the auto-scan once for this open cycle.
  // The dispatch says "if no cached report, fires a POST and shows a
  // spinner" — we only want to do that the first time the drawer opens
  // for an unscored post, not on every re-open within the session.
  const autoScanFiredRef = useRef(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const runScan = useCallback(async () => {
    setState({ kind: 'loading' })
    try {
      const res = await api.post<AiReadinessApiResponse>(`/api/admin/posts/${post.id}/ai-readiness`)
      setState({ kind: 'ready', report: res })
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 429) {
          const seconds = err.retryAfter ?? 60
          setState({ kind: 'rate-limited', retryAt: Date.now() + seconds * 1000 })
          return
        }
        if (err.status === 503 && err.code === 'MCP_DISABLED') {
          setState({ kind: 'mcp-disabled' })
          return
        }
        if (err.code === 'POST_NOT_PUBLISHED') {
          setState({ kind: 'not-published' })
          return
        }
        setState({ kind: 'error', message: err.message })
        return
      }
      if (err instanceof NetworkError) {
        setState({ kind: 'error', message: 'Network error — try again.' })
        return
      }
      setState({ kind: 'error', message: 'Scan failed.' })
    }
  }, [post.id])

  // Auto-scan when the drawer opens for an unscored post.
  useEffect(() => {
    if (!open) return
    if (autoScanFiredRef.current) return
    if (state.kind === 'ready') return
    if (initialReport) return
    autoScanFiredRef.current = true
    void runScan()
  }, [open, state.kind, initialReport, runScan])

  // Reset auto-scan latch when the drawer closes so a fresh open after a
  // publish (the soft-prompt's "Score" CTA) re-fires the auto-scan.
  useEffect(() => {
    if (!open) autoScanFiredRef.current = false
  }, [open])

  // Esc closes; focus moves to the close button on open.
  useEffect(() => {
    if (!open) return
    closeButtonRef.current?.focus()
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-labelledby="ai-readiness-drawer-title"
      data-testid="ai-readiness-drawer"
      className="fixed inset-y-0 right-0 z-40 flex w-full max-w-[560px] flex-col border-l border-border bg-white shadow-[-12px_0_32px_rgba(0,0,0,0.06)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-border px-[20px] py-[14px]">
        <div className="min-w-0">
          <p
            className="text-[10px] font-medium uppercase tracking-[0.16em] text-gray"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            AI readiness
          </p>
          <h2
            id="ai-readiness-drawer-title"
            className="mt-[2px] truncate text-[15px] font-semibold tracking-[-0.015em] text-dark"
            title={post.title}
          >
            {post.title}
          </h2>
        </div>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close AI readiness drawer"
          data-testid="ai-readiness-drawer-close"
          className="inline-flex h-[32px] w-[32px] items-center justify-center rounded-md border border-transparent text-gray transition-colors duration-150 hover:border-border hover:text-dark focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <span aria-hidden="true" className="text-[18px] leading-none">×</span>
        </button>
      </div>

      {/* Body — scrolls independently of the header. */}
      <div className="flex-1 overflow-y-auto px-[20px] py-[20px]">
        {renderBody(state, runScan, onPublishRequest)}
      </div>
    </aside>
  )
}

function renderBody(
  state: DrawerState,
  runScan: () => void,
  onPublishRequest?: () => void,
) {
  if (state.kind === 'loading') {
    return (
      <div role="status" aria-live="polite" className="flex flex-col items-center gap-3 py-[64px]">
        <span aria-hidden="true" className="inline-block h-[24px] w-[24px] animate-spin rounded-full border-2 border-gray/30 border-t-brand" />
        <p className="text-[13px] text-gray tracking-[-0.005em]">Scanning…</p>
      </div>
    )
  }

  if (state.kind === 'rate-limited') {
    const at = new Date(state.retryAt)
    const hh = at.getHours().toString().padStart(2, '0')
    const mm = at.getMinutes().toString().padStart(2, '0')
    return (
      <Banner
        kind="warn"
        testId="ai-readiness-banner-rate-limited"
        title="Rate limited"
        body={`Try again at ${hh}:${mm}.`}
      />
    )
  }

  if (state.kind === 'mcp-disabled') {
    return (
      <Banner
        kind="error"
        testId="ai-readiness-banner-mcp-disabled"
        title="Service not configured"
        body="Set the AI_READINESS_MCP_* env vars in your deployment and reload."
      />
    )
  }

  if (state.kind === 'not-published') {
    return (
      <Banner
        kind="warn"
        testId="ai-readiness-banner-not-published"
        title="Publish the post first"
        body="VerseOdin scores a published URL — drafts can't be scanned in v1.5."
        action={onPublishRequest ? (
          <button
            type="button"
            onClick={onPublishRequest}
            data-testid="ai-readiness-publish-now"
            className="inline-flex h-[32px] items-center rounded-md bg-brand px-3 text-[13px] font-semibold text-white transition-opacity duration-150 hover:opacity-95 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Publish now
          </button>
        ) : null}
      />
    )
  }

  if (state.kind === 'error') {
    return (
      <Banner
        kind="error"
        testId="ai-readiness-banner-error"
        title="Scan failed"
        body={state.message}
        action={
          <button
            type="button"
            onClick={runScan}
            className="inline-flex h-[32px] items-center rounded-md border border-border bg-white px-3 text-[13px] font-medium text-dark transition-colors duration-150 hover:border-brand/30 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Retry
          </button>
        }
      />
    )
  }

  if (state.kind === 'idle') {
    return (
      <Banner
        kind="info"
        testId="ai-readiness-banner-idle"
        title="No scan yet"
        body="Run a scan to see how this post lands with AI search."
        action={
          <button
            type="button"
            onClick={runScan}
            className="inline-flex h-[32px] items-center rounded-md bg-brand px-3 text-[13px] font-semibold text-white transition-opacity duration-150 hover:opacity-95 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Scan now
          </button>
        }
      />
    )
  }

  // state.kind === 'ready'
  return <ReportBody response={state.report} runScan={runScan} />
}

function ReportBody({
  response, runScan,
}: {
  response: AiReadinessApiResponse
  runScan: () => void
}) {
  const palette = bandPalette(response.band)
  const scannedAt = new Date(response.scannedAt)
  const timestamp = Number.isNaN(scannedAt.getTime())
    ? response.scannedAt
    : scannedAt.toLocaleString()
  const checks = response.report.checks ?? []
  const pageScore = response.report.pageScore
  const domainScore = response.report.domainScore

  return (
    <div className="flex flex-col gap-[20px]">
      {/* Hero card — overall score */}
      <section
        data-testid="ai-readiness-hero"
        className="rounded-xl border border-border bg-white p-[20px]"
      >
        <div className="flex items-baseline justify-between gap-3">
          <p
            className="text-[10px] font-medium uppercase tracking-[0.16em] text-gray"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Overall score
          </p>
          <button
            type="button"
            onClick={runScan}
            data-testid="ai-readiness-rescan"
            className="inline-flex h-[28px] items-center rounded-md border border-border bg-white px-2 text-[12px] font-medium text-dark transition-colors duration-150 hover:border-brand/30 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Re-scan
          </button>
        </div>
        <div className="mt-[8px] flex items-end gap-3">
          <span
            data-testid="ai-readiness-overall-score"
            className="text-[48px] font-bold leading-none tracking-[-0.025em] text-dark"
          >
            {response.score}
          </span>
          <span
            data-testid="ai-readiness-overall-band"
            className={`mb-[4px] inline-flex h-[24px] items-center rounded-sm border ${palette.border} ${palette.bg} ${palette.text} px-2 text-[10px] font-medium uppercase tracking-[0.12em]`}
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {(response.band ?? '').toUpperCase().trim() || '—'}
          </span>
        </div>
        <dl
          data-testid="ai-readiness-split"
          className="mt-[16px] grid grid-cols-2 gap-2 text-[12px] tracking-[-0.005em]"
        >
          <div className="rounded-md border border-border bg-bg-subtle px-3 py-2">
            <dt
              className="text-[10px] uppercase tracking-[0.12em] text-gray"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Page
            </dt>
            <dd className="text-[18px] font-semibold text-dark">{Math.round(pageScore)}</dd>
          </div>
          <div className="rounded-md border border-border bg-bg-subtle px-3 py-2">
            <dt
              className="text-[10px] uppercase tracking-[0.12em] text-gray"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Domain
            </dt>
            <dd className="text-[18px] font-semibold text-dark">{Math.round(domainScore)}</dd>
          </div>
        </dl>
        <p
          className="mt-[16px] text-[11px] text-gray-light tracking-[-0.005em]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Scanned {timestamp}
        </p>
      </section>

      {/* Per-check cards */}
      {checks.length > 0 ? (
        <ul data-testid="ai-readiness-checks" className="flex flex-col gap-2">
          {checks.map((check) => (
            <CheckCard key={check.id} check={check} />
          ))}
        </ul>
      ) : (
        <p className="text-[12px] text-gray-light tracking-[-0.005em]">
          No detailed checks returned. The scan completed but VerseOdin
          didn't surface per-check breakdowns this time.
        </p>
      )}
    </div>
  )
}

function CheckCard({ check }: { check: AiReadinessCheck }) {
  const status = checkStatusPalette(check.status)
  return (
    <li
      data-testid="ai-readiness-check-card"
      data-check-id={check.id}
      data-check-status={check.status}
      className="rounded-xl border border-border bg-white p-[16px]"
    >
      <header className="mb-[8px] flex flex-wrap items-center gap-2">
        <span
          aria-label={`Status ${status.label}`}
          className={`inline-flex h-[20px] items-center rounded-sm border ${status.border} ${status.bg} ${status.text} px-2 text-[10px] font-medium uppercase tracking-[0.12em]`}
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {status.label}
        </span>
        <h3 className="text-[14px] font-semibold tracking-[-0.01em] text-dark">{check.label}</h3>
        <span
          className="ml-auto inline-flex h-[20px] items-center rounded-sm border border-border bg-bg-subtle px-2 text-[10px] font-medium tracking-[0.12em] text-gray"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {Math.round(check.score)}
        </span>
        <span
          className="inline-flex h-[20px] items-center rounded-sm border border-border bg-white px-2 text-[10px] font-medium uppercase tracking-[0.12em] text-gray"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {check.scope}
        </span>
      </header>
      <p className="text-[13px] leading-[1.5] text-dark tracking-[-0.005em]">{check.details}</p>
      {check.recommendation ? (
        <p className="mt-[8px] text-[12px] leading-[1.5] text-gray tracking-[-0.005em]">
          {check.recommendation}
        </p>
      ) : null}
    </li>
  )
}

function Banner({
  kind, title, body, action, testId,
}: {
  kind: 'info' | 'warn' | 'error'
  title: string
  body: string
  action?: React.ReactNode
  testId: string
}) {
  const palette =
    kind === 'error' ? 'border-[#fda29b] bg-[#fef3f2] text-[#b42318]' :
    kind === 'warn'  ? 'border-[#F6851B]/30 bg-[#fff7ed] text-[#9a3412]' :
                       'border-border bg-bg-subtle text-dark'
  return (
    <div data-testid={testId} role="alert" className={`rounded-xl border p-[20px] ${palette}`}>
      <p className="mb-[6px] text-[14px] font-semibold tracking-[-0.01em]">{title}</p>
      <p className="text-[13px] leading-[1.5] tracking-[-0.005em]">{body}</p>
      {action ? <div className="mt-[12px]">{action}</div> : null}
    </div>
  )
}
