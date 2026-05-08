'use client'

import { bandPalette } from '@/lib/ai-readiness/ui-types'

interface ScorePillProps {
  score: number | null | undefined
  band: string | null | undefined
  /** Render the leading dot separator — used inside the editor button. */
  withSeparator?: boolean
  /** Test id override; defaults to ai-readiness-score-pill. */
  testId?: string
  /** Compact (dashboard) vs default (editor button). */
  size?: 'sm' | 'xs'
}

/** Small score chip rendered next to the editor's "Check AI readiness"
 *  button and on each row of the admin posts list. Same visual language
 *  in both places so the dashboard pill is recognisable as the same
 *  thing as the editor pill. */
export function AiReadinessScorePill({
  score,
  band,
  withSeparator = false,
  testId = 'ai-readiness-score-pill',
  size = 'sm',
}: ScorePillProps) {
  if (score === null || score === undefined) return null
  const palette = bandPalette(band)
  const heightCls = size === 'xs' ? 'h-[20px] text-[10px] px-2' : 'h-[22px] text-[10px] px-2'
  const display = `${withSeparator ? '· ' : ''}${score} · ${(band ?? '').toUpperCase().trim() || '—'}`
  return (
    <span
      data-testid={testId}
      role="status"
      aria-label={`AI readiness score ${score}, band ${band ?? 'unknown'}`}
      className={`inline-flex items-center rounded-sm border ${palette.border} ${palette.bg} ${palette.text} font-medium uppercase tracking-[0.12em] ${heightCls}`}
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      {display}
    </span>
  )
}
