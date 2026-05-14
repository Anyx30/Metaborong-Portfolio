// Server-side data-fetching helpers for blog posts.
//
// Three pure-ish functions consumed by Server Components (and by the
// /api/admin/posts route handlers via lib/post-store.ts):
//
//   - getPostBySlug(slug, region) — public reader. Merges the geo variant
//     onto a published post. Returns null for drafts and missing posts so
//     /blog/[slug] can render a 404 without leaking draft existence.
//   - listPublishedPosts({ tag?, page, perPage }) — public listing,
//     ordered by published_at DESC, optional tag filter, paginated.
//   - getDraftPostById(id) — admin-only reader for the edit screen and
//     the standalone preview route. The CALLER is responsible for the
//     admin auth check; this helper does not gate by status.
//
// All functions accept an optional MongoDB Db handle so route tests can
// inject an isolated mongodb-memory-server-backed Db without monkey-
// patching the global. Pattern preserved from the M1 Drizzle design.

import type { Db } from 'mongodb'
import { db as defaultDb } from '../db/client'
import type { PostDoc } from '../db/schema'
import {
  type Post,
  type PostSummary,
  type GeoRegion,
} from './blog-schema'
import { mergeVariant } from './geo'

type DbLike = Db

function postsOf(handle: DbLike) {
  return handle.collection<PostDoc>('posts')
}

// ── row → Post mapping ───────────────────────────────────────────────────────

/**
 * Convert a Mongo document into the Post wire shape (ISO timestamps, no
 * undefined fields). Centralised so list / single / patch endpoints all
 * emit the same payload. `_id` becomes the wire field `id`.
 */
export function rowToPost(row: PostDoc): Post {
  return {
    id:                       row._id,
    slug:                     row.slug,
    title:                    row.title,
    excerpt:                  row.excerpt ?? null,
    status:                   row.status as Post['status'],
    content_json:             row.content_json,
    content_schema_version:   1,
    cover_image_id:           row.cover_image_id ?? null,
    og_image_id:              row.og_image_id ?? null,
    tags:                     row.tags,
    author_name:              row.author_name,
    author_url:               row.author_url ?? null,
    meta_title:               row.meta_title ?? null,
    meta_description:         row.meta_description ?? null,
    canonical_url:            row.canonical_url ?? null,
    geo_variants:             row.geo_variants,
    ai_readiness_score:       row.ai_readiness_score ?? null,
    // DB field is free-form text; the wire shape narrows to the
    // strong/adequate/weak enum. Cast at the boundary — the route handler
    // only ever writes a value emitted by bandFor().
    ai_readiness_band:        (row.ai_readiness_band ?? null) as Post['ai_readiness_band'],
    ai_readiness_report:      row.ai_readiness_report ?? null,
    ai_readiness_checked_at:  toIso(row.ai_readiness_checked_at),
    published_at:             toIso(row.published_at),
    created_at:               toIso(row.created_at) ?? new Date(0).toISOString(),
    updated_at:               toIso(row.updated_at) ?? new Date(0).toISOString(),
  }
}

function toIso(d: Date | string | null | undefined): string | null {
  if (!d) return null
  if (d instanceof Date) return d.toISOString()
  return d
}

export function rowToSummary(row: PostDoc): PostSummary {
  // Canonical chip order on the dashboard: US first, EU second. Regions with
  // empty payloads (e.g. `{ US: {} }`) are skipped — the variant only
  // counts if at least one field actually overrides base.
  const variantRegions: ('US' | 'EU')[] = []
  const variants = row.geo_variants ?? {}
  for (const region of ['US', 'EU'] as const) {
    const payload = variants[region]
    if (payload && Object.keys(payload).length > 0) variantRegions.push(region)
  }
  return {
    id:                  row._id,
    slug:                row.slug,
    title:               row.title,
    status:              row.status as PostSummary['status'],
    tags:                row.tags,
    updated_at:          toIso(row.updated_at) ?? new Date(0).toISOString(),
    published_at:        toIso(row.published_at),
    ai_readiness_score:  row.ai_readiness_score ?? null,
    ai_readiness_band:   (row.ai_readiness_band ?? null) as PostSummary['ai_readiness_band'],
    has_geo_variants:    variantRegions.length > 0,
    geo_variant_regions: variantRegions,
  }
}

// ── public readers ───────────────────────────────────────────────────────────

/**
 * Fetch a published post by slug, with the visitor's geo-variant fields
 * merged on. Returns null for drafts and missing posts — the same shape
 * so /blog/[slug] can render a 404 page without leaking draft existence.
 */
export async function getPostBySlug(
  slug: string,
  region: GeoRegion,
  dbHandle: DbLike = defaultDb,
): Promise<Post | null> {
  const row = await postsOf(dbHandle).findOne({ slug, status: 'published' })
  if (!row) return null
  return mergeVariant(rowToPost(row), region)
}

export interface ListOptions {
  tag?: string
  page?: number
  perPage?: number
}

export interface ListResult {
  posts: PostSummary[]
  total: number
  hasMore: boolean
}

/**
 * Paginated list of published posts ordered by published_at DESC. tag
 * filter uses Mongo's natural multikey index on `tags`. For v1 the
 * catalog is small enough that a `countDocuments` per request is fine —
 * switch to a maintained counter when post count grows past ~10k.
 */
export async function listPublishedPosts(
  opts: ListOptions = {},
  dbHandle: DbLike = defaultDb,
): Promise<ListResult> {
  const page = Math.max(1, Math.floor(opts.page ?? 1))
  const perPage = Math.min(50, Math.max(1, Math.floor(opts.perPage ?? 12)))
  const offset = (page - 1) * perPage

  const filter: Record<string, unknown> = { status: 'published' }
  if (opts.tag) filter.tags = opts.tag

  const coll = postsOf(dbHandle)

  const [rows, total] = await Promise.all([
    coll.find(filter).sort({ published_at: -1 }).skip(offset).limit(perPage).toArray(),
    coll.countDocuments(filter),
  ])

  const hasMore = offset + rows.length < total

  return {
    posts: rows.map(rowToSummary),
    total,
    hasMore,
  }
}

/**
 * Newest-first published posts with the fields RSS / GEO surfaces need.
 * `listPublishedPosts` returns `PostSummary` (no excerpt / content_json),
 * which is the right shape for the dashboard but not for a feed item that
 * needs a `<description>`. Rather than thicken every summary, we expose a
 * narrow helper here that pulls just the columns the feed reads.
 */
export async function listPublishedForFeed(
  limit: number,
  dbHandle: DbLike = defaultDb,
): Promise<Array<Pick<Post,
  'slug' | 'title' | 'excerpt' | 'tags' | 'content_json' | 'published_at'
>>> {
  const cap = Math.min(200, Math.max(1, Math.floor(limit)))
  const rows = await postsOf(dbHandle)
    .find({ status: 'published' })
    .sort({ published_at: -1 })
    .limit(cap)
    .toArray()
  return rows.map((row) => ({
    slug:         row.slug,
    title:        row.title,
    excerpt:      row.excerpt ?? null,
    tags:         row.tags,
    content_json: row.content_json,
    published_at: toIso(row.published_at),
  }))
}

/**
 * All published posts in the shape /llms.txt and /llms-full.txt need.
 * Newest-first; no pagination — the llmstxt.org index files want the
 * complete catalog in a single response so LLM crawlers can ground
 * against everything in one fetch (PRD §5.7 GEO bundle).
 *
 * Drafts are filtered out at the query layer; nothing leaks except what
 * /blog already exposes publicly.
 */
export async function listAllPublishedForLlms(
  dbHandle: DbLike = defaultDb,
): Promise<Array<Pick<Post,
  'slug' | 'title' | 'excerpt' | 'meta_description' |
  'published_at' | 'updated_at' | 'author_name' | 'content_json'
>>> {
  const rows = await postsOf(dbHandle)
    .find({ status: 'published' })
    .sort({ published_at: -1 })
    .toArray()
  return rows.map((row) => ({
    slug:             row.slug,
    title:            row.title,
    excerpt:          row.excerpt ?? null,
    meta_description: row.meta_description ?? null,
    published_at:     toIso(row.published_at),
    updated_at:       toIso(row.updated_at) ?? new Date(0).toISOString(),
    author_name:      row.author_name,
    content_json:     row.content_json,
  }))
}

/**
 * Admin-only read of a single post by id, regardless of status. The
 * caller MUST have already gated on requireAdmin(); this helper does not
 * check session itself (so it's reusable from server components, route
 * handlers, and the standalone preview route).
 */
export async function getDraftPostById(
  id: string,
  dbHandle: DbLike = defaultDb,
): Promise<Post | null> {
  const row = await postsOf(dbHandle).findOne({ _id: id })
  return row ? rowToPost(row) : null
}

/**
 * Admin-only list of all posts, optionally filtered by status. Used by
 * GET /api/admin/posts (the dashboard).
 */
export async function listAllPostsForAdmin(
  status: 'draft' | 'published' | 'all' = 'all',
  dbHandle: DbLike = defaultDb,
): Promise<PostSummary[]> {
  const filter: Record<string, unknown> = status === 'all' ? {} : { status }
  const rows = await postsOf(dbHandle)
    .find(filter)
    .sort({ updated_at: -1 })
    .toArray()
  return rows.map(rowToSummary)
}

// ── slug helpers ─────────────────────────────────────────────────────────────

/**
 * Generate a URL-safe slug from a title. Non-ASCII characters are dropped
 * (good enough for the bilingual editorial team's English-first content;
 * if multi-script slugs become a need, swap for a transliteration lib).
 *
 * Output is guaranteed to match the postSchema slug regex
 * /^[a-z0-9]+(-[a-z0-9]+)*$/ and be 1..80 chars long.
 */
export function slugifyTitle(title: string): string {
  const slug = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip combining marks
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '') // re-trim if slice cut mid-hyphen-run
  // Pathological titles (all symbols, empty after normalisation) — fall back
  // to a stable placeholder so the route handler can either accept it as a
  // base for collision-handling or 422 the body.
  return slug || 'untitled'
}

// MongoDB duplicate-key error code. The native driver surfaces it as
// `err.code === 11000` on either a MongoServerError or a MongoBulkWriteError.
export const MONGO_DUPLICATE_KEY_CODE = 11000

/**
 * Walk a short cause chain (the driver occasionally wraps the original
 * error) to recognise a unique-index violation. Used by the slug-conflict
 * branch in the POST/PATCH /api/admin/posts routes.
 */
export function isUniqueViolation(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cur: any = err
  for (let i = 0; i < 5 && cur; i++) {
    if (cur.code === MONGO_DUPLICATE_KEY_CODE) return true
    cur = cur.cause
  }
  return false
}
