// /api/admin/images
//   GET   ?cursor=…       → { images: Image[], nextCursor: string | null }
//   POST  multipart `file` → { image: Image }   (status 201)
//
// Both routes require an admin session (401 otherwise). POST also requires
// CSRF (403 otherwise).
//
// Upload pipeline (POST):
//   1. Fail-fast on Content-Length when present and > 8 MB → 413.
//   2. Stream-bound the body read so a missing / lying Content-Length
//      can't OOM the worker → 413 if the wire payload exceeds the cap.
//   3. Reconstruct as a Web Request so we can use `formData()` to extract
//      the `file` field.
//   4. Magic-byte sniff (NEVER trust Content-Type — it's user-controlled).
//      Reject anything that isn't JPEG / PNG / WebP → 415 UPLOAD_BAD_TYPE.
//   5. sharp → WebP @ q85, EXIF stripped, final dimensions read off the
//      output buffer.
//   6. @vercel/blob put at `images/<server-uuid>.webp` (random filename,
//      NEVER round-trip the user's name).
//   7. INSERT into `images` with default alt='' and focal=(0.5, 0.5). If
//      the insert fails AFTER a successful blob upload, attempt a best-
//      effort blob delete so we don't leave orphans.

import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../../db/client'
import { images } from '../../../../db/schema'
import { requireAdmin, requireCsrf } from '../../../../lib/auth'
import { errorResponse } from '../../../../lib/api'
import {
  IMAGE_MAX_BYTES,
  WIRE_READ_HEADROOM,
  bestEffortDeleteBlob,
  listImagesPage,
  readBoundedBody,
  rowToImage,
  sanitizeOriginalFilename,
  sniffImageFormat,
  transcodeToWebp,
  uploadWebpToBlob,
} from '../../../../lib/images'

export const runtime = 'nodejs'

// ── GET /api/admin/images ────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req)
  if (guard instanceof NextResponse) return guard

  const url = new URL(req.url)
  const cursor = url.searchParams.get('cursor')
  const page = await listImagesPage(cursor)
  return NextResponse.json(page)
}

// ── POST /api/admin/images ───────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const csrfFail = requireCsrf(req)
  if (csrfFail) return csrfFail
  const guard = await requireAdmin(req)
  if (guard instanceof NextResponse) return guard

  // (1) Honest Content-Length → 413 before reading any bytes.
  const contentLengthHeader = req.headers.get('content-length')
  if (contentLengthHeader) {
    const declared = Number.parseInt(contentLengthHeader, 10)
    if (Number.isFinite(declared) && declared > IMAGE_MAX_BYTES + WIRE_READ_HEADROOM) {
      return errorResponse(413, 'UPLOAD_TOO_LARGE', 'file exceeds 8MB limit')
    }
  }

  // (2) Bounded read of the multipart wire bytes.
  const wireBuf = await readBoundedBody(req.body, IMAGE_MAX_BYTES + WIRE_READ_HEADROOM)
  if (!wireBuf) {
    return errorResponse(413, 'UPLOAD_TOO_LARGE', 'file exceeds 8MB limit')
  }

  // (3) Re-parse as multipart. The original headers carry the boundary,
  //     which formData() needs to find part boundaries.
  let formData: FormData
  try {
    const replay = new Request(req.url, {
      method:  'POST',
      headers: req.headers,
      // Node Buffer is not in the BodyInit union; wrap as Uint8Array so
      // the Web Request constructor accepts it.
      body:    new Uint8Array(wireBuf),
    })
    formData = await replay.formData()
  } catch {
    return errorResponse(422, 'VALIDATION_FAILED', 'malformed multipart body')
  }

  const fileEntry = formData.get('file')
  if (fileEntry === null || typeof fileEntry === 'string') {
    return errorResponse(
      422,
      'VALIDATION_FAILED',
      'missing file part',
      { field: 'file' },
    )
  }
  const file = fileEntry as Blob & { name?: string; size?: number }

  // Post-parse size check — handles the case where Content-Length was
  // missing AND the file part itself exceeds 8 MB (vs. multipart overhead).
  if (typeof file.size === 'number' && file.size > IMAGE_MAX_BYTES) {
    return errorResponse(413, 'UPLOAD_TOO_LARGE', 'file exceeds 8MB limit')
  }

  const inputBytes = Buffer.from(await file.arrayBuffer())

  // (4) Magic-byte sniff.
  const detected = sniffImageFormat(inputBytes)
  if (!detected) {
    return errorResponse(415, 'UPLOAD_BAD_TYPE', 'Only JPG/PNG/WebP allowed.')
  }

  // (5) sharp transcode. A buffer that the sniff approved but sharp can't
  //     decode (corrupted / truncated) collapses to 415 too.
  let transcoded
  try {
    transcoded = await transcodeToWebp(inputBytes)
  } catch (err) {
    console.error('[POST /api/admin/images] sharp transcode failed:', err)
    return errorResponse(415, 'UPLOAD_BAD_TYPE', 'Only JPG/PNG/WebP allowed.')
  }

  // (6) Vercel Blob upload.
  let uploaded
  try {
    uploaded = await uploadWebpToBlob(transcoded.buffer)
  } catch (err) {
    console.error('[POST /api/admin/images] blob upload failed:', err)
    return errorResponse(502, 'INTERNAL', 'upload failed')
  }

  // (7) Persist row. Roll back the blob on insert failure.
  const filename = sanitizeOriginalFilename(file.name ?? null)
  try {
    const inserted = await db
      .insert(images)
      .values({
        blob_url: uploaded.url,
        width:    transcoded.width,
        height:   transcoded.height,
        alt:      '',
        focal_x:  0.5,
        focal_y:  0.5,
        filename,
      })
      .returning()
    const row = inserted[0]
    if (!row) {
      void bestEffortDeleteBlob(uploaded.url)
      return errorResponse(500, 'INTERNAL', 'insert returned no row')
    }
    return NextResponse.json({ image: rowToImage(row) }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/admin/images] insert failed:', err)
    void bestEffortDeleteBlob(uploaded.url)
    return errorResponse(500, 'INTERNAL', 'failed to persist image')
  }
}
