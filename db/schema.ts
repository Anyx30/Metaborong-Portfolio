// TypeScript doc shapes for the four CMS collections. These mirror what
// Drizzle's pg-core tables described in v1: every column is now a field
// on a TS interface. JSON columns become nested BSON documents; arrays
// become BSON arrays; timestamps become native BSON Date.
//
// `_id` is a string UUID v4 (not an ObjectId). Reasons:
//   - preserves all existing fixtures, test data, and route-level UUID
//     regex guards (UUID_RE in the ai-readiness route, etc.)
//   - keeps the wire shape `id` field readable as a UUID, not a hex blob
//   - external callers (FE, MCP clients) never see `_id` — the row→wire
//     mapper (`rowToPost` / `rowToImage`) reads `row._id` and emits `id`.
//
// Schema validation is done by Zod at the API boundary
// (`lib/blog-schema.ts`); we do NOT also attach a MongoDB JSON-Schema
// validator on the collections to avoid drift between the two sources of
// truth.

import type { Block, GeoVariants, AiReadinessReport } from '../lib/blog-schema'

// ── posts ────────────────────────────────────────────────────────────────────

export interface PostDoc {
  _id:                       string
  slug:                      string
  title:                     string
  excerpt:                   string | null
  status:                    'draft' | 'published'
  content_json:              Block[]
  content_schema_version:    number
  cover_image_id:            string | null
  og_image_id:               string | null
  tags:                      string[]
  author_name:               string
  author_url:                string | null
  meta_title:                string | null
  meta_description:          string | null
  canonical_url:             string | null
  geo_variants:              GeoVariants
  ai_readiness_score:        number | null
  ai_readiness_band:         string | null
  ai_readiness_report:       AiReadinessReport | null
  ai_readiness_content_hash: string | null
  ai_readiness_checked_at:   Date | null
  published_at:              Date | null
  created_at:                Date
  updated_at:                Date
}

// ── images ───────────────────────────────────────────────────────────────────
// Independent reusable assets. Post DELETE does NOT cascade to images.

export interface ImageDoc {
  _id:        string
  blob_url:   string
  width:      number
  height:     number
  alt:        string
  focal_x:    number
  focal_y:    number
  filename:   string
  created_at: Date
}

// ── login_attempts ───────────────────────────────────────────────────────────
// Rate-limit counter; TTL index in db/collections.ts auto-prunes rows
// older than 1h.

export interface LoginAttemptDoc {
  _id:          string
  ip:           string
  attempted_at: Date
}

// ── ai_readiness_attempts ────────────────────────────────────────────────────
// Same shape as login_attempts but bucketed per admin; TTL is 2h (the
// per-admin window is 1h; the extra hour is sweep slack).

export interface AiReadinessAttemptDoc {
  _id:          string
  admin_email:  string
  attempted_at: Date
}

// ── back-compat aliases ──────────────────────────────────────────────────────
// Old names from the Drizzle era so importers don't all have to change at
// once. Drop these when no consumer references them.
export type PostRow    = PostDoc
export type PostInsert = PostDoc
export type ImageRow   = ImageDoc
export type ImageInsert = ImageDoc
