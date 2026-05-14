// /api/admin/posts
//   GET   ?status=draft|published   → { posts: PostSummary[] }
//   POST  { title, slug? }          → { post: Post }   (status='draft')
//
// Both routes require an admin session (401 otherwise). POST also requires
// CSRF (403 otherwise). Body is validated by Zod; bad shape → 422 with the
// §2.2 envelope + a `field` path. Slug collisions on POST → 422 with
// SLUG_CONFLICT (the underlying unique index makes the check race-safe;
// we catch the Mongo duplicate-key error and translate).

import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { db } from '../../../../db/client'
import type { PostDoc } from '../../../../db/schema'
import { requireAdmin, requireCsrf } from '../../../../lib/auth'
import { errorResponse } from '../../../../lib/api'
import {
  isUniqueViolation,
  listAllPostsForAdmin,
  rowToPost,
  slugifyTitle,
} from '../../../../lib/posts'
import {
  createPostBodySchema,
  listQuerySchema,
} from '../../../../lib/post-validation'

export const runtime = 'nodejs'

function postsColl() {
  return db.collection<PostDoc>('posts')
}

// ── GET /api/admin/posts ─────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req)
  if (guard instanceof NextResponse) return guard

  const url = new URL(req.url)
  const queryParsed = listQuerySchema.safeParse({
    status: url.searchParams.get('status') ?? undefined,
  })
  if (!queryParsed.success) {
    const issue = queryParsed.error.issues[0]
    return errorResponse(
      422,
      'VALIDATION_FAILED',
      issue?.message ?? 'invalid query',
      { field: issue?.path?.join('.') || 'status' },
    )
  }

  const summaries = await listAllPostsForAdmin(queryParsed.data.status ?? 'all')
  return NextResponse.json({ posts: summaries })
}

// ── POST /api/admin/posts ────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const csrfFail = requireCsrf(req)
  if (csrfFail) return csrfFail
  const guard = await requireAdmin(req)
  if (guard instanceof NextResponse) return guard
  const identity = guard

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return errorResponse(422, 'VALIDATION_FAILED', 'request body must be valid JSON')
  }

  const parsed = createPostBodySchema.safeParse(raw)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return errorResponse(
      422,
      'VALIDATION_FAILED',
      issue?.message ?? 'invalid request body',
      { field: issue?.path?.join('.') || undefined },
    )
  }

  const { title } = parsed.data
  const slug = parsed.data.slug ?? slugifyTitle(title)

  const now = new Date()
  const doc: PostDoc = {
    _id:                       randomUUID(),
    slug,
    title,
    excerpt:                   null,
    status:                    'draft',
    content_json:              [],
    content_schema_version:    1,
    cover_image_id:            null,
    og_image_id:               null,
    tags:                      [],
    author_name:               identity.email,
    author_url:                null,
    meta_title:                null,
    meta_description:          null,
    canonical_url:             null,
    geo_variants:              {},
    ai_readiness_score:        null,
    ai_readiness_band:         null,
    ai_readiness_report:       null,
    ai_readiness_content_hash: null,
    ai_readiness_checked_at:   null,
    published_at:              null,
    created_at:                now,
    updated_at:                now,
  }

  try {
    await postsColl().insertOne(doc)
    return NextResponse.json({ post: rowToPost(doc) }, { status: 201 })
  } catch (err) {
    if (isUniqueViolation(err)) {
      return errorResponse(
        422,
        'SLUG_CONFLICT',
        'a post with this slug already exists',
        { field: 'slug' },
      )
    }
    // Don't leak the raw error; log for ops.
    console.error('[POST /api/admin/posts] insert failed:', err)
    return errorResponse(500, 'INTERNAL', 'failed to create post')
  }
}
