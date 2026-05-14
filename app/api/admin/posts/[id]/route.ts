// /api/admin/posts/[id]
//   GET    → { post: Post }
//   PATCH  → { post: Post }   accepts Partial<Post>; rejects unknown fields
//                              and slug change once the post is published
//   DELETE → { ok: true }     hard delete; revalidates /blog and the slug
//
// All three require an admin session. PATCH and DELETE additionally
// require CSRF (per double-submit cookie). 404 fires when the row does
// not exist; UUID-shape mismatches on the path also collapse to 404
// rather than 500 so probing the surface doesn't leak schema details.

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { db } from '../../../../../db/client'
import type { PostDoc } from '../../../../../db/schema'
import { requireAdmin, requireCsrf } from '../../../../../lib/auth'
import { errorResponse } from '../../../../../lib/api'
import {
  getDraftPostById,
  isUniqueViolation,
  rowToPost,
} from '../../../../../lib/posts'
import { patchPostBodySchema } from '../../../../../lib/post-validation'

export const runtime = 'nodejs'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type RouteCtx = { params: Promise<{ id: string }> }

function postsColl() {
  return db.collection<PostDoc>('posts')
}

// ── GET ──────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest, ctx: RouteCtx) {
  const guard = await requireAdmin(req)
  if (guard instanceof NextResponse) return guard

  const { id } = await ctx.params
  if (!UUID_RE.test(id)) {
    return errorResponse(404, 'NOT_FOUND', 'post not found')
  }

  const post = await getDraftPostById(id)
  if (!post) return errorResponse(404, 'NOT_FOUND', 'post not found')
  return NextResponse.json({ post })
}

// ── PATCH ────────────────────────────────────────────────────────────────────

export async function PATCH(req: NextRequest, ctx: RouteCtx) {
  const csrfFail = requireCsrf(req)
  if (csrfFail) return csrfFail
  const guard = await requireAdmin(req)
  if (guard instanceof NextResponse) return guard

  const { id } = await ctx.params
  if (!UUID_RE.test(id)) {
    return errorResponse(404, 'NOT_FOUND', 'post not found')
  }

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return errorResponse(422, 'VALIDATION_FAILED', 'request body must be valid JSON')
  }

  const parsed = patchPostBodySchema.safeParse(raw)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return errorResponse(
      422,
      'VALIDATION_FAILED',
      issue?.message ?? 'invalid request body',
      { field: issue?.path?.join('.') || undefined },
    )
  }
  const body = parsed.data

  // Read existing row so we can enforce slug-immutability after first publish.
  const existing = await getDraftPostById(id)
  if (!existing) return errorResponse(404, 'NOT_FOUND', 'post not found')

  if (body.slug && body.slug !== existing.slug && existing.published_at !== null) {
    return errorResponse(
      422,
      'VALIDATION_FAILED',
      'Slug is immutable after first publish.',
      { field: 'slug' },
    )
  }

  const update = { ...body, updated_at: new Date() }

  let row
  try {
    row = await postsColl().findOneAndUpdate(
      { _id: id },
      { $set: update },
      { returnDocument: 'after' },
    )
  } catch (err) {
    if (isUniqueViolation(err)) {
      return errorResponse(
        422,
        'SLUG_CONFLICT',
        'a post with this slug already exists',
        { field: 'slug' },
      )
    }
    console.error('[PATCH /api/admin/posts/:id] update failed:', err)
    return errorResponse(500, 'INTERNAL', 'failed to update post')
  }

  if (!row) return errorResponse(404, 'NOT_FOUND', 'post not found')

  // If slug changed AND post is currently published, refresh both the old
  // and the new slug paths so neither serves stale content.
  if (existing.status === 'published') {
    revalidatePath('/blog')
    revalidatePath(`/blog/${existing.slug}`, 'page')
    if (row.slug !== existing.slug) {
      revalidatePath(`/blog/${row.slug}`, 'page')
    }
  }

  return NextResponse.json({ post: rowToPost(row) })
}

// ── DELETE ───────────────────────────────────────────────────────────────────

export async function DELETE(req: NextRequest, ctx: RouteCtx) {
  const csrfFail = requireCsrf(req)
  if (csrfFail) return csrfFail
  const guard = await requireAdmin(req)
  if (guard instanceof NextResponse) return guard

  const { id } = await ctx.params
  if (!UUID_RE.test(id)) {
    return errorResponse(404, 'NOT_FOUND', 'post not found')
  }

  // Fetch so we can revalidate the public slug path after delete. We do NOT
  // cascade-delete images — they're independent reusable assets.
  const existing = await getDraftPostById(id)
  if (!existing) return errorResponse(404, 'NOT_FOUND', 'post not found')

  const result = await postsColl().deleteOne({ _id: id })

  if (result.deletedCount === 0) {
    return errorResponse(404, 'NOT_FOUND', 'post not found')
  }

  if (existing.status === 'published') {
    revalidatePath('/blog')
    revalidatePath(`/blog/${existing.slug}`, 'page')
  }

  return NextResponse.json({ ok: true })
}
