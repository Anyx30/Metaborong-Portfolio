// POST /api/admin/posts/[id]/publish
//
// Atomically sets status='published' and populates published_at if and
// only if it is currently null (so re-publishing an already-published
// post preserves the original timestamp). Revalidates /blog and the
// slug page BEFORE returning. CSRF + admin gates apply.

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { db } from '../../../../../../db/client'
import type { PostDoc } from '../../../../../../db/schema'
import { requireAdmin, requireCsrf } from '../../../../../../lib/auth'
import { errorResponse } from '../../../../../../lib/api'
import { rowToPost } from '../../../../../../lib/posts'

export const runtime = 'nodejs'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type RouteCtx = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, ctx: RouteCtx) {
  const csrfFail = requireCsrf(req)
  if (csrfFail) return csrfFail
  const guard = await requireAdmin(req)
  if (guard instanceof NextResponse) return guard

  const { id } = await ctx.params
  if (!UUID_RE.test(id)) return errorResponse(404, 'NOT_FOUND', 'post not found')

  const now = new Date()

  // Aggregation-pipeline update so $ifNull keeps the existing published_at
  // on republish and stamps a new one on first publish. Single statement →
  // atomic at the document level; no explicit transaction needed.
  const row = await db.collection<PostDoc>('posts').findOneAndUpdate(
    { _id: id },
    [
      {
        $set: {
          status: 'published',
          published_at: { $ifNull: ['$published_at', now] },
          updated_at: now,
        },
      },
    ],
    { returnDocument: 'after' },
  )

  if (!row) return errorResponse(404, 'NOT_FOUND', 'post not found')

  revalidatePath('/blog')
  revalidatePath(`/blog/${row.slug}`, 'page')

  return NextResponse.json({ post: rowToPost(row) })
}
