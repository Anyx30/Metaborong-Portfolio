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
import { requireAdmin, requireCsrf } from '../../../../lib/auth'
import { errorResponse } from '../../../../lib/api'
import {
  createPost,
  listAllPostsForAdmin,
} from '../../../../lib/posts'
import {
  createPostBodySchema,
  listQuerySchema,
} from '../../../../lib/post-validation'

export const runtime = 'nodejs'

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

  const result = await createPost({
    title:       parsed.data.title,
    slug:        parsed.data.slug,
    author_name: identity.email,
  })

  if (!result.ok) {
    switch (result.code) {
      case 'SLUG_CONFLICT':
        return errorResponse(422, 'SLUG_CONFLICT', result.message, { field: result.field })
      case 'VALIDATION_FAILED':
        return errorResponse(422, 'VALIDATION_FAILED', result.message, { field: result.field })
      case 'INTERNAL':
        return errorResponse(500, 'INTERNAL', result.message)
    }
  }

  return NextResponse.json({ post: result.post }, { status: 201 })
}
