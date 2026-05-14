// POST /api/admin/posts/[id]/unpublish
//
// Sets status='draft'. published_at is PRESERVED so the editor can later
// re-publish without losing the historical first-publish timestamp. The
// public route immediately 404s for this slug after revalidatePath fires.
// CSRF + admin gates apply.

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

  const row = await db.collection<PostDoc>('posts').findOneAndUpdate(
    { _id: id },
    {
      $set: {
        status: 'draft',
        updated_at: new Date(),
        // published_at intentionally untouched.
      },
    },
    { returnDocument: 'after' },
  )

  if (!row) return errorResponse(404, 'NOT_FOUND', 'post not found')

  revalidatePath('/blog')
  revalidatePath(`/blog/${row.slug}`, 'page')

  return NextResponse.json({ post: rowToPost(row) })
}
