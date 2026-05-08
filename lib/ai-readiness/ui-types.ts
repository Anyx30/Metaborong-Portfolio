// AI Readiness — UI helpers + wire-response type alias.
//
// All shape types (AiReadinessReport / Check / Band / Status / Scope) live
// in `lib/blog-schema.ts` as the single source of truth shared with M7-BE.
// This file only adds:
//   1. The wire-response envelope returned by the route handler
//      (`{ score, band, report, cached, scannedAt }`) — not part of the
//      stored Post shape, so it doesn't belong in blog-schema.
//   2. Palette helpers used by the editor button + drawer + dashboard pill.

import type {
  AiReadinessBand,
  AiReadinessCheckStatus,
  AiReadinessReport,
} from '@/lib/blog-schema'

/** Body of `POST /api/admin/posts/[id]/ai-readiness` and `GET …`. The
 *  per-check details and scope live inside `report` (VerseOdin-shaped). */
export interface AiReadinessApiResponse {
  score: number
  band: AiReadinessBand
  report: AiReadinessReport
  cached: boolean
  scannedAt: string
}

/** Tailwind palette for an overall band pill. Bands are persisted
 *  lowercase (`'strong'|'adequate'|'weak'`); display is uppercase. */
export function bandPalette(band: AiReadinessBand | string | null | undefined): {
  border: string
  bg: string
  text: string
} {
  const key = (band ?? '').toLowerCase().trim()
  if (key === 'strong') {
    return { border: 'border-[#10b981]/30', bg: 'bg-[#ecfdf5]', text: 'text-[#047857]' }
  }
  if (key === 'adequate') {
    return { border: 'border-[#F6851B]/30', bg: 'bg-[#fff7ed]', text: 'text-[#9a3412]' }
  }
  if (key === 'weak') {
    return { border: 'border-[#fda29b]', bg: 'bg-[#fef3f2]', text: 'text-[#b42318]' }
  }
  return { border: 'border-border', bg: 'bg-bg-subtle', text: 'text-gray' }
}

/** Per-check status palette + display label. */
export function checkStatusPalette(status: AiReadinessCheckStatus): {
  border: string
  bg: string
  text: string
  label: string
} {
  if (status === 'pass') {
    return { border: 'border-[#10b981]/30', bg: 'bg-[#ecfdf5]', text: 'text-[#047857]', label: 'PASS' }
  }
  if (status === 'warning') {
    return { border: 'border-[#F6851B]/30', bg: 'bg-[#fff7ed]', text: 'text-[#9a3412]', label: 'WARN' }
  }
  return { border: 'border-[#fda29b]', bg: 'bg-[#fef3f2]', text: 'text-[#b42318]', label: 'FAIL' }
}
