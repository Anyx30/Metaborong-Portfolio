'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ApiError, NetworkError, api } from '@/lib/api-client'
import type { PostSummary } from '@/lib/blog-schema'
import { AiReadinessScorePill } from '@/components/admin/editor/ai-readiness-score-pill'

type StatusFilter = 'all' | 'draft' | 'published'
const TABS: Array<{ key: StatusFilter; label: string }> = [
  { key: 'all',       label: 'All' },
  { key: 'draft',     label: 'Draft' },
  { key: 'published', label: 'Published' },
]

interface Props {
  initialPosts: PostSummary[]
  status: StatusFilter
  fetchError: string | null
}

function formatRelative(iso: string | null): string {
  if (!iso) return '—'
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return '—'
  const delta = Date.now() - t
  const min = Math.round(delta / 60_000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr}h ago`
  const d = Math.round(hr / 24)
  if (d < 7) return `${d}d ago`
  return new Date(iso).toISOString().slice(0, 10)
}

function StatusPill({ status }: { status: 'draft' | 'published' }) {
  const palette =
    status === 'published'
      ? 'border-[#10b981]/30 bg-[#ecfdf5] text-[#047857]'
      : 'border-border bg-bg-subtle text-gray'
  return (
    <span
      role="status"
      aria-label={`Status: ${status}`}
      className={`inline-flex h-[22px] items-center rounded-sm border px-2 text-[10px] font-medium uppercase tracking-[0.12em] ${palette}`}
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      {status}
    </span>
  )
}

function ScoreColumn({
  score, band,
}: {
  score: PostSummary['ai_readiness_score']
  band: PostSummary['ai_readiness_band']
}) {
  if (score === null || score === undefined) {
    return (
      <span
        data-testid="ai-readiness-score-empty"
        aria-label="No AI readiness score yet"
        className="hidden text-[12px] text-gray-light tracking-[-0.005em] sm:inline"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        —
      </span>
    )
  }
  return (
    <span className="hidden sm:inline-flex" data-testid="ai-readiness-score-cell">
      <AiReadinessScorePill score={score} band={band} size="xs" />
    </span>
  )
}

function VariantChips({ regions }: { regions: ReadonlyArray<'US' | 'EU'> }) {
  if (regions.length === 0) return null
  return (
    <span className="hidden items-center gap-1 sm:inline-flex" data-testid="variant-chips">
      {regions.map((r) => (
        <span
          key={r}
          aria-label={`Has ${r} variant`}
          data-testid={`variant-chip-${r}`}
          className="inline-flex h-[20px] items-center rounded-sm border border-brand/30 bg-[#eef2ff] px-2 text-[10px] font-medium uppercase tracking-[0.12em] text-brand"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {r}
        </span>
      ))}
    </span>
  )
}

export function AdminPostsList({ initialPosts, status, fetchError }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const activeTab = (TABS.find((t) => t.key === status) ?? TABS[0]).key

  const [posts, setPosts] = useState<PostSummary[]>(initialPosts)
  const [deleteTarget, setDeleteTarget] = useState<PostSummary | null>(null)
  const [error, setError] = useState<string | null>(fetchError)

  useEffect(() => { setPosts(initialPosts) }, [initialPosts])
  useEffect(() => { setError(fetchError) }, [fetchError])

  function switchTab(next: StatusFilter) {
    const params = new URLSearchParams(searchParams)
    if (next === 'all') params.delete('status')
    else params.set('status', next)
    const qs = params.toString()
    startTransition(() => {
      router.push(qs ? `/admin?${qs}` : '/admin')
    })
  }

  if (error) {
    return (
      <div role="alert" className="rounded-xl border border-[#fda29b] bg-[#fef3f2] p-[24px] text-[14px] text-[#b42318]">
        Could not load posts: {error}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <>
        <Tabs active={activeTab} onChange={switchTab} />
        <div className="rounded-xl border border-dashed border-border bg-white p-[64px] text-center">
          <p
            className="mb-[10px] text-[11px] font-medium uppercase tracking-[0.18em] text-gray-light"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Empty
          </p>
          <h2 className="mb-[8px] text-[20px] font-semibold tracking-[-0.02em] text-dark">
            {activeTab === 'all' ? 'No posts yet' :
             activeTab === 'draft' ? 'No drafts' :
             'No published posts'}
          </h2>
          <p className="mx-auto max-w-[420px] text-[14px] leading-[1.55] tracking-[-0.005em] text-gray">
            {activeTab === 'all' ? 'Create your first post to get started.' :
             activeTab === 'draft' ? 'Drafts in progress will show up here.' :
             'Posts you publish will show up here.'}
          </p>
        </div>
      </>
    )
  }

  return (
    <>
      <Tabs active={activeTab} onChange={switchTab} />
      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-white">
        {posts.map((p) => (
          <li
            key={p.id}
            className="grid grid-cols-[1fr_auto] items-center gap-[16px] px-[20px] py-[16px] sm:grid-cols-[1fr_auto_auto_auto_auto_auto]"
          >
            <div className="min-w-0">
              <Link
                href={`/admin/posts/${p.id}`}
                className="block text-[15px] font-semibold tracking-[-0.015em] text-dark no-underline hover:text-brand"
              >
                {p.title}
              </Link>
              <p
                className="mt-[2px] truncate text-[12px] text-gray-light tracking-[-0.005em]"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                /{p.slug}
              </p>
            </div>
            <StatusPill status={p.status} />
            <VariantChips regions={p.geo_variant_regions ?? []} />
            <ScoreColumn score={p.ai_readiness_score} band={p.ai_readiness_band} />
            <span className="hidden text-[12px] tracking-[-0.005em] text-gray sm:inline">
              {formatRelative(p.updated_at)}
            </span>
            <div className="flex items-center gap-1">
              <Link
                href={`/admin/posts/${p.id}`}
                className="inline-flex h-[30px] items-center rounded-md border border-border bg-white px-3 text-[12px] font-medium text-dark no-underline transition-colors duration-150 hover:border-brand/30 hover:text-brand focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Edit
              </Link>
              <button
                type="button"
                onClick={() => setDeleteTarget(p)}
                className="inline-flex h-[30px] items-center rounded-md border border-transparent px-3 text-[12px] font-medium text-gray transition-colors duration-150 hover:border-[#fda29b] hover:text-[#b42318] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                aria-label={`Delete ${p.title}`}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      {deleteTarget ? (
        <DeleteConfirmModal
          target={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onDeleted={(deletedId) => {
            setPosts((prev) => prev.filter((p) => p.id !== deletedId))
            setDeleteTarget(null)
            router.refresh()
          }}
          onError={(msg) => setError(msg)}
        />
      ) : null}
    </>
  )
}

function Tabs({ active, onChange }: { active: StatusFilter; onChange: (next: StatusFilter) => void }) {
  return (
    <nav role="tablist" aria-label="Filter posts by status" className="flex gap-1 border-b border-border">
      {TABS.map((t) => {
        const isActive = t.key === active
        return (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(t.key)}
            className={`relative -mb-px h-[36px] border-b-2 px-3 text-[13px] tracking-[-0.005em] transition-colors duration-150 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              isActive
                ? 'border-brand text-dark font-semibold'
                : 'border-transparent text-gray hover:text-dark'
            }`}
          >
            {t.label}
          </button>
        )
      })}
    </nav>
  )
}

function DeleteConfirmModal({
  target,
  onCancel,
  onDeleted,
  onError,
}: {
  target: PostSummary
  onCancel: () => void
  onDeleted: (id: string) => void
  onError: (msg: string) => void
}) {
  const [typed, setTyped] = useState('')
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)
  // Captures the per-row Delete button so focus returns there on cancel.
  // On a successful delete the row is removed; the trigger is gone, so
  // the restore is a no-op (handled by the document.body.contains gate).
  const triggerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const active = document.activeElement
    if (active instanceof HTMLElement) triggerRef.current = active
    inputRef.current?.focus()
    return () => {
      const trigger = triggerRef.current
      if (trigger && document.body.contains(trigger)) trigger.focus()
    }
  }, [])
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !busy) onCancel()
      if (e.key === 'Tab') {
        const order = [inputRef.current, cancelRef.current, confirmRef.current].filter(Boolean) as HTMLElement[]
        if (order.length === 0) return
        const idx = order.indexOf(document.activeElement as HTMLElement)
        if (idx < 0) return
        e.preventDefault()
        const next = (idx + (e.shiftKey ? -1 : 1) + order.length) % order.length
        order[next].focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [busy, onCancel])

  const slugMatches = useMemo(() => typed.trim() === target.slug, [typed, target.slug])
  const confirmDisabled = busy || !slugMatches

  async function handleConfirm() {
    if (confirmDisabled) return
    setBusy(true)
    try {
      await api.delete<{ ok: true }>(`/api/admin/posts/${target.id}`)
      try { window.localStorage.removeItem(`mb.editor.variant.${target.id}`) } catch { /* private mode */ }
      onDeleted(target.id)
    } catch (err) {
      const msg =
        err instanceof NetworkError ? 'Network error, try again.' :
        err instanceof ApiError ? err.message :
        'Delete failed.'
      onError(msg)
      setBusy(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-canvas/60 px-4"
    >
      <div className="w-full max-w-[440px] rounded-xl border border-border bg-white p-[28px] shadow-[0_24px_64px_rgba(0,0,0,0.12)]">
        <h2 id="delete-modal-title" className="mb-[6px] text-[18px] font-bold tracking-[-0.025em] text-dark">
          Delete this post?
        </h2>
        <p className="mb-[20px] text-[14px] leading-[1.5] text-gray tracking-[-0.005em]">
          This is permanent. To confirm, type the slug{' '}
          <code
            className="rounded-sm bg-bg-subtle px-1 py-[1px] text-[12px] text-dark"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {target.slug}
          </code>{' '}
          below.
        </p>
        <input
          ref={inputRef}
          type="text"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          aria-label="Type the slug to confirm"
          className="mb-[20px] h-[40px] w-full rounded-md border border-border bg-white px-3 text-[14px] tracking-[-0.005em] text-dark placeholder:text-gray-light focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          placeholder={target.slug}
        />
        <div className="flex justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="inline-flex h-[36px] items-center rounded-md border border-border bg-white px-3 text-[13px] font-medium text-dark transition-colors duration-150 hover:border-brand/30 disabled:opacity-60 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Cancel
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={handleConfirm}
            disabled={confirmDisabled}
            className="inline-flex h-[36px] items-center rounded-md bg-[#b42318] px-3 text-[13px] font-semibold text-white transition-opacity duration-150 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {busy ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
