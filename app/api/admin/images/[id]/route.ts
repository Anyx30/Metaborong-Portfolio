// /api/admin/images/[id]
//   PATCH  { alt?, focal_x?, focal_y? }  → { image: Image }
//
// Admin-only, CSRF-required. focal_x and focal_y must be in [0, 1]; out-
// of-range values fail Zod validation → 422 with `field` populated. Empty
// alt is allowed at this layer (block-level alt-required gating happens
// in the Frontend block save).
//
// No DELETE: per PRD §5.5, images are independent reusable assets, and
// post DELETE explicitly does not cascade-delete them. v1 ships without
// an admin image-delete endpoint; admins can edit alt / focal but not
// delete in v1.

import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '../../../../../db/client'
import { images } from '../../../../../db/schema'
import { requireAdmin, requireCsrf } from '../../../../../lib/auth'
import { errorResponse } from '../../../../../lib/api'
import { rowToImage } from '../../../../../lib/images'
import { patchImageBodySchema } from '../../../../../lib/image-validation'

export const runtime = 'nodejs'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type RouteCtx = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, ctx: RouteCtx) {
  const csrfFail = requireCsrf(req)
  if (csrfFail) return csrfFail
  const guard = await requireAdmin(req)
  if (guard instanceof NextResponse) return guard

  const { id } = await ctx.params
  if (!UUID_RE.test(id)) {
    return errorResponse(404, 'NOT_FOUND', 'image not found')
  }

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return errorResponse(422, 'VALIDATION_FAILED', 'request body must be valid JSON')
  }

  const parsed = patchImageBodySchema.safeParse(raw)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return errorResponse(
      422,
      'VALIDATION_FAILED',
      issue?.message ?? 'invalid request body',
      { field: issue?.path?.join('.') || undefined },
    )
  }
  const update = parsed.data

  // Empty body — return the existing row so callers don't have to special-
  // case "no change". Drizzle's update().set({}) is a runtime error so we
  // need this branch regardless.
  if (Object.keys(update).length === 0) {
    const rows = await db.select().from(images).where(eq(images.id, id)).limit(1)
    const row = rows[0]
    if (!row) return errorResponse(404, 'NOT_FOUND', 'image not found')
    return NextResponse.json({ image: rowToImage(row) })
  }

  const updated = await db
    .update(images)
    .set(update)
    .where(eq(images.id, id))
    .returning()
  const row = updated[0]
  if (!row) return errorResponse(404, 'NOT_FOUND', 'image not found')
  return NextResponse.json({ image: rowToImage(row) })
}
