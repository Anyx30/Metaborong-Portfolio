// POST /api/admin/posts/[id]/publish
//
// Atomically sets status='published' and populates published_at if and
// only if it is currently null (so re-publishing an already-published
// post preserves the original timestamp). Revalidates /blog and the
// slug page BEFORE returning. CSRF + admin gates apply.

import { NextRequest, NextResponse } from 'next/server'
import { eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '../../../../../../db/client'
import { posts } from '../../../../../../db/schema'
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

  // `COALESCE(published_at, $now)` keeps the existing timestamp on republish
  // and stamps a new one on first publish. Single statement → atomic; no
  // explicit BEGIN/COMMIT needed.
  const updated = await db
    .update(posts)
    .set({
      status: 'published',
      published_at: sql`COALESCE(${posts.published_at}, ${now})`,
      updated_at: now,
    })
    .where(eq(posts.id, id))
    .returning()

  const row = updated[0]
  if (!row) return errorResponse(404, 'NOT_FOUND', 'post not found')

  revalidatePath('/blog')
  revalidatePath(`/blog/${row.slug}`, 'page')

  return NextResponse.json({ post: rowToPost(row) })
}
