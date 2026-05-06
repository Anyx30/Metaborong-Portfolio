// Server-side image helpers.
//
// Owns:
//   - magic-byte format sniffing (defence-in-depth against MIME spoofing)
//   - sharp pipeline (transcode → WebP @ q85, EXIF stripped via sharp's default)
//   - bounded-read of the multipart request body so a missing / lying
//     Content-Length can't OOM the worker
//   - filename sanitisation (the user-supplied name is stored for display
//     only — the on-disk path is server-generated)
//   - Vercel Blob put/del wrappers (centralised so the route handlers stay
//     thin and the @vercel/blob mock surface in tests is small)
//   - keyset cursor pagination (created_at DESC, id DESC) for GET /images
//
// Route handlers should consume only the exports below; they should NOT
// reach into sharp / @vercel/blob themselves so the test mock points stay
// at this single boundary.

import 'server-only'
import { randomUUID } from 'node:crypto'
import sharp from 'sharp'
import { put as blobPut, del as blobDel } from '@vercel/blob'
import { and, desc, eq, inArray, lt, or } from 'drizzle-orm'
import { db as defaultDb } from '../db/client'
import { images, type ImageRow } from '../db/schema'
import { type Image } from './blog-schema'

export const IMAGE_MAX_BYTES = 8 * 1024 * 1024 // 8 MB
export const IMAGE_PAGE_SIZE = 24
export const WEBP_QUALITY    = 85

// 64 KB headroom over IMAGE_MAX_BYTES for multipart boundary + part headers
// at the wire-read stage. The post-parse `file.size` check still enforces
// the user-facing 8 MB cap on the payload itself.
export const WIRE_READ_HEADROOM = 65536

export type DetectedFormat = 'jpeg' | 'png' | 'webp'

// ── magic-byte sniff ─────────────────────────────────────────────────────────
//
// Content-Type is user-controlled and lies; sniff the first 12 bytes ourselves
// before handing anything to sharp.
//
//   JPEG : FF D8 FF                                            (3-byte SOI+marker)
//   PNG  : 89 50 4E 47  0D 0A 1A 0A                            (8-byte signature)
//   WebP : 52 49 46 46  __ __ __ __  57 45 42 50               ("RIFF…WEBP" container)

export function sniffImageFormat(bytes: Uint8Array): DetectedFormat | null {
  if (bytes.length < 12) return null
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpeg'
  if (
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) return 'png'
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) return 'webp'
  return null
}

// ── sharp pipeline ───────────────────────────────────────────────────────────

export interface TranscodedImage {
  buffer: Buffer
  width:  number
  height: number
}

/**
 * Transcode an arbitrary input image buffer to WebP @ quality 85.
 *
 * `.rotate()` with no args applies any EXIF orientation tag and then
 * removes it. sharp's default behaviour is to drop all metadata unless
 * `.withMetadata()` / `.keepMetadata()` is called explicitly, so EXIF is
 * stripped both for privacy and to shave bytes.
 */
export async function transcodeToWebp(input: Buffer): Promise<TranscodedImage> {
  const out = await sharp(input)
    .rotate()
    .webp({ quality: WEBP_QUALITY })
    .toBuffer({ resolveWithObject: true })
  return {
    buffer: out.data,
    width:  out.info.width,
    height: out.info.height,
  }
}

// ── bounded body reader ──────────────────────────────────────────────────────

/**
 * Read up to `max` bytes from a Web ReadableStream. Returns null if the
 * stream produced more than `max` bytes (in which case we abort the read
 * and the caller emits 413). Returns the concatenated body otherwise.
 *
 * Used so the multipart body can't OOM the worker when Content-Length is
 * missing or lying.
 */
export async function readBoundedBody(
  body: ReadableStream<Uint8Array> | null,
  max: number,
): Promise<Buffer | null> {
  if (!body) return null
  const reader = body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  try {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (value && value.byteLength > 0) {
        total += value.byteLength
        if (total > max) {
          try { await reader.cancel() } catch { /* swallow — we're already aborting */ }
          return null
        }
        chunks.push(value)
      }
    }
  } finally {
    try { reader.releaseLock() } catch { /* already released */ }
  }
  return Buffer.concat(chunks.map((c) => Buffer.from(c)))
}

// ── filename sanitisation ────────────────────────────────────────────────────

// Control-character class for the sanitiser: NUL..US plus DEL. Written as
// Unicode escapes so the source file stays plain ASCII text — embedding
// the raw bytes makes git treat the file as binary.
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS_RE = /[\u0000-\u001f\u007f]/g

/**
 * Sanitise the user-supplied original filename for the `images.filename`
 * column. We never use this name for the on-disk / blob path — that's
 * server-generated. This is purely for the admin UI's "Where did this come
 * from" display, so we keep readable characters and drop anything that
 * could cause display / log oddities.
 */
export function sanitizeOriginalFilename(raw: string | null | undefined): string {
  if (!raw) return 'unnamed'
  const justName = raw.split(/[\\/]/).pop() ?? raw
  const cleaned = justName
    .replace(CONTROL_CHARS_RE, '')        // strip control chars
    .replace(/[<>:"|?*]/g, '_')            // Windows-illegal punctuation
    .trim()
    .slice(0, 200)
  return cleaned || 'unnamed'
}

// ── row → wire ───────────────────────────────────────────────────────────────

export function rowToImage(row: ImageRow): Image {
  return {
    id:         row.id,
    blob_url:   row.blob_url,
    width:      row.width,
    height:     row.height,
    alt:        row.alt,
    focal_x:    row.focal_x,
    focal_y:    row.focal_y,
    filename:   row.filename,
    created_at: row.created_at instanceof Date
      ? row.created_at.toISOString()
      : String(row.created_at),
  }
}

// ── cursor pagination ────────────────────────────────────────────────────────

export function encodeCursor(createdAt: Date | string, id: string): string {
  const iso = typeof createdAt === 'string' ? createdAt : createdAt.toISOString()
  return Buffer.from(`${iso}|${id}`, 'utf8').toString('base64url')
}

export interface DecodedCursor {
  createdAt: Date
  id:        string
}

export function decodeCursor(raw: string): DecodedCursor | null {
  try {
    const decoded = Buffer.from(raw, 'base64url').toString('utf8')
    const sep = decoded.indexOf('|')
    if (sep < 0) return null
    const iso = decoded.slice(0, sep)
    const id  = decoded.slice(sep + 1)
    if (!id) return null
    const dt = new Date(iso)
    if (Number.isNaN(dt.getTime())) return null
    return { createdAt: dt, id }
  } catch {
    return null
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DbLike = any

/**
 * Server-only fetch of a single image row by id. Returns null when the
 * id is missing from the table (rather than throwing), so callers can
 * gracefully render a broken-image placeholder for stale imageId attrs.
 */
export async function getImageById(
  id: string,
  dbHandle: DbLike = defaultDb,
): Promise<Image | null> {
  const rows = (await dbHandle
    .select()
    .from(images)
    .where(eq(images.id, id))
    .limit(1)) as ImageRow[]
  const row = rows[0]
  return row ? rowToImage(row) : null
}

/**
 * Server-only batch fetch — used by the public reader and admin preview
 * to resolve every imageId referenced by a post in one round-trip rather
 * than one query per image block.
 */
export async function getImagesByIds(
  ids: ReadonlyArray<string>,
  dbHandle: DbLike = defaultDb,
): Promise<Map<string, Image>> {
  const out = new Map<string, Image>()
  if (ids.length === 0) return out
  const rows = (await dbHandle
    .select()
    .from(images)
    .where(inArray(images.id, ids as string[]))) as ImageRow[]
  for (const row of rows) out.set(row.id, rowToImage(row))
  return out
}

/**
 * One page of images, ordered (created_at DESC, id DESC). The cursor is
 * the (created_at, id) tuple of the LAST row of the previous page; the
 * SQL where clause returns rows strictly older than that tuple.
 */
export async function listImagesPage(
  cursorParam: string | null,
  dbHandle: DbLike = defaultDb,
): Promise<{ images: Image[]; nextCursor: string | null }> {
  const cursor = cursorParam ? decodeCursor(cursorParam) : null

  const where = cursor
    ? or(
        lt(images.created_at, cursor.createdAt),
        and(eq(images.created_at, cursor.createdAt), lt(images.id, cursor.id)),
      )
    : undefined

  const rows = (await dbHandle
    .select()
    .from(images)
    .where(where)
    .orderBy(desc(images.created_at), desc(images.id))
    .limit(IMAGE_PAGE_SIZE + 1)) as ImageRow[]

  const page    = rows.slice(0, IMAGE_PAGE_SIZE)
  const hasMore = rows.length > IMAGE_PAGE_SIZE
  const last    = page[page.length - 1]
  const nextCursor = hasMore && last ? encodeCursor(last.created_at, last.id) : null

  return { images: page.map(rowToImage), nextCursor }
}

// ── Vercel Blob ──────────────────────────────────────────────────────────────

export interface UploadedBlob {
  url:      string
  pathname: string
}

/**
 * Push a WebP buffer to Vercel Blob at `images/<server-uuid>.webp`. The
 * path is generated server-side; the user-supplied filename never round-
 * trips into the URL.
 */
export async function uploadWebpToBlob(buffer: Buffer): Promise<UploadedBlob> {
  const pathname = `images/${randomUUID()}.webp`
  const result = await blobPut(pathname, buffer, {
    access:          'public',
    addRandomSuffix: false,
    contentType:     'image/webp',
  })
  return { url: result.url, pathname }
}

/**
 * Fire-and-forget cleanup for the orphan-blob case where the upload
 * succeeded but the DB insert failed afterwards. Best effort — any error
 * is logged and swallowed; we don't want to mask the original DB failure.
 */
export async function bestEffortDeleteBlob(url: string): Promise<void> {
  try {
    await blobDel(url)
  } catch (err) {
    console.warn('[images] failed to clean up orphan blob:', err)
  }
}
