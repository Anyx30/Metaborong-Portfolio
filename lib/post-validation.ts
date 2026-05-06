// Body schemas for the POST / PATCH endpoints under /api/admin/posts/**.
//
// These intentionally LIVE NEXT TO blog-schema.ts rather than inside it —
// blog-schema.ts is the wire-shape contract (full Post objects), while
// these are the request-body shapes (subsets, with stricter unknown-field
// handling so a typo'd field is a 422 instead of a silent no-op).

import { z } from 'zod'
import {
  contentJsonSchema,
  geoVariantsSchema,
  postStatusSchema,
  slugRegex,
  tagRegex,
} from './blog-schema'

// POST /api/admin/posts — create a draft.
//
// Editor enters a title; slug is optional (server slugifies the title when
// absent). Body is .strict() so unknown fields fail fast — prevents the
// FE from accidentally posting a full Post and bypassing publish/unpublish
// gating.
export const createPostBodySchema = z.object({
  title: z.string().trim().min(1).max(200),
  slug:  z.string().regex(slugRegex, 'slug must be kebab-case ASCII').min(1).max(80).optional(),
}).strict()
export type CreatePostBody = z.infer<typeof createPostBodySchema>

// PATCH /api/admin/posts/[id] — partial update.
//
// Mirrors the editable subset of Post. status, published_at,
// ai_readiness_*, and the immutable timestamps are NOT acceptable here —
// status transitions go through /publish + /unpublish, ai_readiness is
// owned by M7's MCP route, and id/created_at are server-side only.
//
// M8-core hardening — server-side length caps on every free-form text
// field. The Frontend pre-validates, but a hand-crafted PATCH that bypasses
// the editor would otherwise fill the DB with megabyte excerpts. Caps
// match the PRD-aligned defaults documented in §6.5 / contract §2.5:
//
//   title              200   (already in §2.5)
//   slug               80    (already in §2.5)
//   excerpt            500   (M8-core)
//   meta_description   160   (M8-core; matches Google's snippet truncation)
//   meta_title         200   (M8-core; lenient — pages won't render >65)
//   author_name        120   (M8-core; defensive)
//   tags[i]            40    (M8-core; matches §2.5)
//   tags.length        10    (already in §2.5)
//
// Schemas remain `.strict()` so unknown keys still fail with VALIDATION_FAILED.
export const patchPostBodySchema = z.object({
  slug:                z.string().regex(slugRegex).min(1).max(80).optional(),
  title:               z.string().trim().min(1).max(200).optional(),
  excerpt:             z.string().max(500).nullable().optional(),
  content_json:        contentJsonSchema.optional(),
  cover_image_id:      z.string().uuid().nullable().optional(),
  og_image_id:         z.string().uuid().nullable().optional(),
  tags:                z.array(z.string().regex(tagRegex).max(40)).max(10).optional(),
  author_name:         z.string().min(1).max(120).optional(),
  author_url:          z.string().url().nullable().optional(),
  meta_title:          z.string().max(200).nullable().optional(),
  meta_description:    z.string().max(160).nullable().optional(),
  canonical_url:       z.string().url().nullable().optional(),
  geo_variants:        geoVariantsSchema.optional(),
}).strict()
export type PatchPostBody = z.infer<typeof patchPostBodySchema>

// GET /api/admin/posts?status=…
// Optional ?status filter; absent = both.
export const listQuerySchema = z.object({
  status: postStatusSchema.optional(),
}).strict()
export type ListQuery = z.infer<typeof listQuerySchema>
