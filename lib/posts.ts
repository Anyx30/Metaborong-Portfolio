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
// All functions accept an optional Drizzle DB handle so route tests can
// inject a pg-mem-backed client without monkey-patching the global.

import { and, desc, eq, sql } from 'drizzle-orm'
import { db as defaultDb } from '../db/client'
import { posts, type PostRow } from '../db/schema'
import {
  type Post,
  type PostSummary,
  type GeoRegion,
} from './blog-schema'
import { mergeVariant } from './geo'

// Drizzle's typed db is generic; for the helper signature we use a
// structural type so route tests can pass in a pg-mem-backed client.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DbLike = any

// ── row → Post mapping ───────────────────────────────────────────────────────

/**
 * Convert a Drizzle row into the Post wire shape (ISO timestamps, no
 * undefined fields). Centralised so list / single / patch endpoints all
 * emit the same payload.
 */
export function rowToPost(row: PostRow): Post {
  return {
    id:                       row.id,
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
    ai_readiness_band:        row.ai_readiness_band ?? null,
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

export function rowToSummary(row: PostRow): PostSummary {
  return {
    id:                  row.id,
    slug:                row.slug,
    title:               row.title,
    status:              row.status as PostSummary['status'],
    tags:                row.tags,
    updated_at:          toIso(row.updated_at) ?? new Date(0).toISOString(),
    published_at:        toIso(row.published_at),
    ai_readiness_score:  row.ai_readiness_score ?? null,
    ai_readiness_band:   row.ai_readiness_band ?? null,
    has_geo_variants:    !!row.geo_variants && Object.keys(row.geo_variants).length > 0,
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
  const rows = await dbHandle
    .select()
    .from(posts)
    .where(and(eq(posts.slug, slug), eq(posts.status, 'published')))
    .limit(1)
  const row = rows[0] as PostRow | undefined
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
 * filter uses a GIN-indexed array containment check on posts.tags. The
 * total comes from a separate row scan; for v1 the catalog is small
 * enough that a small bounded scan is fine — switch to keyset pagination
 * (or a maintained counter) when post count grows past ~1000.
 */
export async function listPublishedPosts(
  opts: ListOptions = {},
  dbHandle: DbLike = defaultDb,
): Promise<ListResult> {
  const page = Math.max(1, Math.floor(opts.page ?? 1))
  const perPage = Math.min(50, Math.max(1, Math.floor(opts.perPage ?? 12)))
  const offset = (page - 1) * perPage

  const filters = [eq(posts.status, 'published')]
  if (opts.tag) {
    // `$1 = ANY(tags)` is functionally equivalent to `tags @> ARRAY[$1]`
    // and uses the GIN index for tag matches. Using `= ANY` avoids
    // serializing a single-element JS array as PG's `{tag}` text literal,
    // which the test driver (pg-mem) parses differently from real PG.
    filters.push(sql`${opts.tag} = ANY(${posts.tags})`)
  }
  const whereClause = filters.length > 1 ? and(...filters) : filters[0]

  const rows = (await dbHandle
    .select()
    .from(posts)
    .where(whereClause)
    .orderBy(desc(posts.published_at))
    .limit(perPage)
    .offset(offset)) as PostRow[]

  // Bounded total scan — fetch only the ids of matching rows so we can
  // return an accurate total + hasMore without an aggregate query (which
  // doesn't survive pg-mem in tests; see M1 BE handoff §9.6).
  const totalRows = (await dbHandle
    .select({ id: posts.id })
    .from(posts)
    .where(whereClause)) as Array<{ id: string }>

  const total = totalRows.length
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
  const rows = (await dbHandle
    .select()
    .from(posts)
    .where(eq(posts.status, 'published'))
    .orderBy(desc(posts.published_at))
    .limit(cap)) as PostRow[]
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
 * Drafts are filtered out at the SQL layer; nothing leaks except what
 * /blog already exposes publicly.
 */
export async function listAllPublishedForLlms(
  dbHandle: DbLike = defaultDb,
): Promise<Array<Pick<Post,
  'slug' | 'title' | 'excerpt' | 'meta_description' |
  'published_at' | 'updated_at' | 'author_name' | 'content_json'
>>> {
  const rows = (await dbHandle
    .select()
    .from(posts)
    .where(eq(posts.status, 'published'))
    .orderBy(desc(posts.published_at))) as PostRow[]
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
  const rows = await dbHandle
    .select()
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1)
  const row = rows[0] as PostRow | undefined
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
  const where = status === 'all' ? undefined : eq(posts.status, status)
  const rows = (await dbHandle
    .select()
    .from(posts)
    .where(where)
    .orderBy(desc(posts.updated_at))) as PostRow[]
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

// Used by the SQL "duplicate-key" error catch in route handlers.
export const PG_UNIQUE_VIOLATION_CODE = '23505'

// drizzle wraps pg errors in DrizzleQueryError({ query, params, cause }),
// so the PG SQLSTATE code lives one level down. Walk a short cause chain
// so callers don't have to reach in themselves.
export function isUniqueViolation(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cur: any = err
  for (let i = 0; i < 5 && cur; i++) {
    if (cur.code === PG_UNIQUE_VIOLATION_CODE) return true
    if (cur.data && cur.data.code === PG_UNIQUE_VIOLATION_CODE) return true
    cur = cur.cause
  }
  return false
}
