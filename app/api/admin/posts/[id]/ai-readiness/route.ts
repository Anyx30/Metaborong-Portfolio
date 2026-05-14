// /api/admin/posts/[id]/ai-readiness
//
//   POST → run a fresh VerseOdin scan (or return cached if content+1h
//          window match), persist the score+report, return the result.
//   GET  → return the last stored score+report, or 404 NOT_SCORED if
//          the post has never been scanned.
//
// Edge cases owned here:
//   - 401 UNAUTHORIZED         no session
//   - 403 CSRF_FAILED          POST without/wrong CSRF
//   - 404 NOT_FOUND            non-uuid id, or post does not exist
//   - 404 NOT_SCORED           GET on a post that has never been scanned
//   - 409 POST_NOT_PUBLISHED   POST against a draft (v1.5: scan needs a
//                              real public URL; pre-publish scoring is
//                              deferred to v1.6 — PRD §10).
//   - 429 RATE_LIMITED         per-admin 30-per-hour cap, with Retry-After
//   - 503 MCP_DISABLED         any of the 3 env vars is unset, or the
//                              upstream returned 401/403 (don't leak which)
//   - 502 MCP_UPSTREAM_ERROR   upstream non-2xx / malformed payload
//   - 504 MCP_UPSTREAM_ERROR   upstream timed out (10s cap, AbortError)
//
// Persistence (POST happy path): writes ai_readiness_score, _band, _report
// (nested BSON doc), _content_hash, and _checked_at on the post row.
// Hash is sha256(canonicalUrl + '|' + post.updated_at) — coarse, but the
// URL changes only when the slug changes (and PATCH bumps updated_at on
// every edit), so cache invalidation tracks user-visible content changes
// for free.

import { NextRequest, NextResponse } from 'next/server'
import { createHash, randomUUID } from 'node:crypto'
import { db } from '../../../../../../db/client'
import type { PostDoc, AiReadinessAttemptDoc } from '../../../../../../db/schema'
import { requireAdmin, requireCsrf } from '../../../../../../lib/auth'
import { errorResponse } from '../../../../../../lib/api'
import {
  scanUrl,
  bandFor,
  isDisabled,
  McpDisabledError,
  McpAuthError,
  McpTimeoutError,
  McpUpstreamError,
  McpInvalidPayloadError,
} from '../../../../../../lib/ai-readiness/client'

export const runtime = 'nodejs'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const RATE_WINDOW_SECONDS = 60 * 60
const RATE_MAX_PER_WINDOW = 30
const CACHE_FRESHNESS_MS  = 60 * 60 * 1000

type RouteCtx = { params: Promise<{ id: string }> }

function postsColl() {
  return db.collection<PostDoc>('posts')
}

function attemptsColl() {
  return db.collection<AiReadinessAttemptDoc>('ai_readiness_attempts')
}

// ── helpers ───────────────────────────────────────────────────────────────────

function canonicalScanUrl(post: {
  slug: string
  canonical_url: string | null
}): string {
  if (post.canonical_url && post.canonical_url.trim()) return post.canonical_url
  return `https://www.metaborong.com/blog/${post.slug}/`
}

function isoOf(d: Date | string | null | undefined): string {
  if (!d) return ''
  return d instanceof Date ? d.toISOString() : d
}

function contentHashFor(canonical: string, updatedAt: Date | string): string {
  return createHash('sha256').update(`${canonical}|${isoOf(updatedAt)}`).digest('hex')
}

async function countRecentAttempts(adminEmail: string): Promise<number> {
  const since = new Date(Date.now() - RATE_WINDOW_SECONDS * 1000)
  return attemptsColl().countDocuments({
    admin_email: adminEmail,
    attempted_at: { $gte: since },
  })
}

async function recordAttempt(adminEmail: string): Promise<void> {
  await attemptsColl().insertOne({
    _id: randomUUID(),
    admin_email: adminEmail,
    attempted_at: new Date(),
  })
}

// ── POST ─────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest, ctx: RouteCtx) {
  const csrfFail = requireCsrf(req)
  if (csrfFail) return csrfFail
  const guard = await requireAdmin(req)
  if (guard instanceof NextResponse) return guard
  const adminEmail = guard.email

  // Disabled mode is a config gate, not a per-request concern. Surface 503
  // BEFORE any DB read so the FE probe (per agent-prompts §3) gets the
  // disabled signal cheaply.
  if (isDisabled()) {
    return errorResponse(
      503,
      'MCP_DISABLED',
      'AI Readiness service is not configured.',
    )
  }

  const { id } = await ctx.params
  if (!UUID_RE.test(id)) return errorResponse(404, 'NOT_FOUND', 'post not found')

  const post = await postsColl().findOne({ _id: id })
  if (!post) return errorResponse(404, 'NOT_FOUND', 'post not found')

  // PRD §5.10 v1.5: scoring requires a public URL. v1.6 will add a
  // tokenized preview URL for draft scoring (flagged as out-of-scope here).
  if (post.status !== 'published' || post.published_at === null) {
    return errorResponse(
      409,
      'POST_NOT_PUBLISHED',
      'Score is only available after publish in v1.5.',
    )
  }

  const targetUrl = canonicalScanUrl(post)
  const hash = contentHashFor(targetUrl, post.updated_at)

  // Content-hash cache: if the post hasn't changed AND we have a fresh-
  // enough scan, return it without burning quota or hitting upstream.
  if (
    post.ai_readiness_content_hash === hash &&
    post.ai_readiness_score !== null &&
    post.ai_readiness_band !== null &&
    post.ai_readiness_report !== null &&
    post.ai_readiness_checked_at &&
    Date.now() - new Date(post.ai_readiness_checked_at).getTime() < CACHE_FRESHNESS_MS
  ) {
    return NextResponse.json({
      score:     post.ai_readiness_score,
      band:      post.ai_readiness_band,
      report:    post.ai_readiness_report,
      cached:    true,
      scannedAt: isoOf(post.ai_readiness_checked_at),
    })
  }

  // Rate limit BEFORE upstream so a flood can't drain the quota.
  const recent = await countRecentAttempts(adminEmail)
  if (recent >= RATE_MAX_PER_WINDOW) {
    return errorResponse(
      429,
      'RATE_LIMITED',
      'AI readiness scan rate limit reached; try again later.',
      { retryAfterSeconds: RATE_WINDOW_SECONDS },
    )
  }
  await recordAttempt(adminEmail)

  let report
  try {
    report = await scanUrl(targetUrl)
  } catch (err) {
    // Map the typed errors from lib/ai-readiness/client.ts to the §2.2
    // envelope. Never leak token presence, env-var names, or upstream URLs.
    if (err instanceof McpDisabledError) {
      return errorResponse(503, 'MCP_DISABLED', 'AI Readiness service is not configured.')
    }
    if (err instanceof McpAuthError) {
      // Auth fail upstream → look like disabled to the FE so the drawer
      // shows the same "service misconfigured" UX. Logged server-side
      // for the operator to investigate.
      console.error('[ai-readiness] upstream rejected auth (status=', err.status, ')')
      return errorResponse(503, 'MCP_DISABLED', 'AI Readiness service is not configured.')
    }
    if (err instanceof McpTimeoutError) {
      console.error('[ai-readiness] upstream timed out')
      return errorResponse(504, 'MCP_UPSTREAM_ERROR', 'AI Readiness service timed out.')
    }
    if (err instanceof McpInvalidPayloadError) {
      console.error('[ai-readiness] upstream payload invalid:', err.message, err.cause)
      return errorResponse(502, 'MCP_UPSTREAM_ERROR', 'AI Readiness service returned an invalid response.')
    }
    if (err instanceof McpUpstreamError) {
      console.error('[ai-readiness] upstream error status=', err.status)
      return errorResponse(502, 'MCP_UPSTREAM_ERROR', 'AI Readiness service is unavailable.')
    }
    console.error('[ai-readiness] unexpected error:', err)
    return errorResponse(500, 'INTERNAL', 'AI Readiness scan failed.')
  }

  const score = Math.round(report.overallScore)
  const band = bandFor(score)
  const checkedAt = new Date()

  await postsColl().updateOne(
    { _id: id },
    {
      $set: {
        ai_readiness_score:        score,
        ai_readiness_band:         band,
        ai_readiness_report:       report,
        ai_readiness_content_hash: hash,
        ai_readiness_checked_at:   checkedAt,
      },
    },
  )

  return NextResponse.json({
    score,
    band,
    report,
    cached:    false,
    scannedAt: checkedAt.toISOString(),
  })
}

// ── GET ──────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest, ctx: RouteCtx) {
  const guard = await requireAdmin(req)
  if (guard instanceof NextResponse) return guard

  // Mirror the POST handler's config gate so the FE button-hide probe
  // (per agent-prompts §3 / M7-FE handoff §9.2) sees the same disabled
  // signal from either method. Cheaper than a per-method fork on the FE.
  if (isDisabled()) {
    return errorResponse(503, 'MCP_DISABLED', 'AI Readiness service is not configured.')
  }

  const { id } = await ctx.params
  if (!UUID_RE.test(id)) return errorResponse(404, 'NOT_FOUND', 'post not found')

  const row = await postsColl().findOne(
    { _id: id },
    {
      projection: {
        ai_readiness_score:      1,
        ai_readiness_band:       1,
        ai_readiness_report:     1,
        ai_readiness_checked_at: 1,
      },
    },
  )
  if (!row) return errorResponse(404, 'NOT_FOUND', 'post not found')

  if (row.ai_readiness_score === null || row.ai_readiness_score === undefined) {
    return errorResponse(404, 'NOT_SCORED', 'post has not been scanned')
  }

  return NextResponse.json({
    score:     row.ai_readiness_score,
    band:      row.ai_readiness_band,
    report:    row.ai_readiness_report,
    cached:    true,
    scannedAt: isoOf(row.ai_readiness_checked_at),
  })
}
