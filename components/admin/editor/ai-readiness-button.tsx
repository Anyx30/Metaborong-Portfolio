'use client'

import { useEffect, useState } from 'react'
import { ApiError, api } from '@/lib/api-client'
import type { Post } from '@/lib/blog-schema'
import { AiReadinessScorePill } from './ai-readiness-score-pill'

type ProbeState =
  /** GET hasn't resolved yet — render the button as an invisible placeholder
   *  to keep the action bar layout stable while we decide whether to show. */
  | { kind: 'probing' }
  /** GET returned 503 MCP_DISABLED AND we have no cached band → hide entirely. */
  | { kind: 'hidden' }
  /** GET returned 200/null OR we already have a cached band — render normally. */
  | { kind: 'visible' }

interface AiReadinessButtonProps {
  /** The post we're scoring against. We read `id`, `status`, `ai_readiness_score`,
   *  and `ai_readiness_band` to decide labels and disabled state. */
  post: Pick<Post, 'id' | 'status' | 'ai_readiness_score' | 'ai_readiness_band'>
  /** Click handler — opens the drawer. The drawer owns the POST/GET and
   *  the spinner; the button just toggles open state. */
  onOpen: () => void
}

/** Top-bar "Check AI readiness" button. Lives next to Publish/Unpublish.
 *
 *  Behavior (M7-FE dispatch §1):
 *    · Hidden entirely if `post.ai_readiness_band === null` AND a probe of
 *      `GET /api/admin/posts/[id]/ai-readiness` returns 503 MCP_DISABLED.
 *    · Disabled with a tooltip on drafts (v1.5 only scores published URLs).
 *    · Shows the cached `· score · BAND` pill when a score exists. */
export function AiReadinessButton({ post, onOpen }: AiReadinessButtonProps) {
  const [probe, setProbe] = useState<ProbeState>(() =>
    // If a band is already cached, we know the MCP was reachable at scan
    // time — no need to probe just to keep the button visible.
    post.ai_readiness_band !== null ? { kind: 'visible' } : { kind: 'probing' },
  )

  useEffect(() => {
    if (post.ai_readiness_band !== null) {
      setProbe({ kind: 'visible' })
      return
    }
    let cancelled = false
    api
      .get<unknown>(`/api/admin/posts/${post.id}/ai-readiness`)
      .then(() => { if (!cancelled) setProbe({ kind: 'visible' }) })
      .catch((err) => {
        if (cancelled) return
        // 503 + MCP_DISABLED is the only state we hide on. Any other error
        // (network, 401, 404) leaves the button visible so the admin can
        // surface the real failure when they click and the drawer fetches.
        if (err instanceof ApiError && err.status === 503 && err.code === 'MCP_DISABLED') {
          setProbe({ kind: 'hidden' })
        } else {
          setProbe({ kind: 'visible' })
        }
      })
    return () => { cancelled = true }
  }, [post.id, post.ai_readiness_band])

  if (probe.kind === 'hidden') return null
  if (probe.kind === 'probing') {
    // Reserve the space so the Publish button doesn't jump while we wait.
    return <span aria-hidden="true" data-testid="ai-readiness-button-probing" className="inline-block h-[36px]" />
  }

  const isDraft = post.status === 'draft'
  const hasScore = post.ai_readiness_score !== null && post.ai_readiness_score !== undefined

  return (
    <button
      type="button"
      data-testid="ai-readiness-button"
      onClick={onOpen}
      disabled={isDraft}
      aria-disabled={isDraft || undefined}
      title={isDraft ? 'Score is only available after publish in v1.5' : undefined}
      className="inline-flex h-[36px] items-center gap-2 rounded-md border border-border bg-white px-3 text-[13px] font-medium text-dark transition-colors duration-150 hover:border-brand/30 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <span>Check AI readiness</span>
      {hasScore ? (
        <AiReadinessScorePill
          score={post.ai_readiness_score ?? null}
          band={post.ai_readiness_band ?? null}
          withSeparator
          testId="ai-readiness-button-pill"
        />
      ) : null}
    </button>
  )
}
