// Single source of truth for the Block / Post / Image / variant shapes.
// Backend writes this file; Frontend imports from it. Any change here is a
// contract change and must be reflected in docs/cms/agent-prompts.md §2.4.
//
// Both TypeScript types AND matching Zod schemas are exported so that runtime
// validation (Zod) and compile-time inference (TypeScript) share a definition.
// We define Zod schemas first and derive types via z.infer where practical so
// drift is impossible.

import { z } from 'zod'

// ── primitives ────────────────────────────────────────────────────────────────

export const slugRegex   = /^[a-z0-9]+(-[a-z0-9]+)*$/
export const tagRegex    = /^[a-z0-9-]+$/
export const headingLevelSchema = z.union([
  z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6),
])
export type HeadingLevel = z.infer<typeof headingLevelSchema>

// ── semantic role ─────────────────────────────────────────────────────────────

export const semanticRoleSchema = z.enum([
  'intro', 'tldr', 'definition', 'step', 'evidence', 'cta',
])
export type SemanticRole = z.infer<typeof semanticRoleSchema>

// ── block types ───────────────────────────────────────────────────────────────

export const blockTypeSchema = z.enum([
  'heading', 'paragraph', 'image', 'list',
  'quote', 'code', 'callout', 'faq', 'key-takeaway',
])
export type BlockType = z.infer<typeof blockTypeSchema>

const headingBlockSchema = z.object({
  id:   z.string().min(1),
  type: z.literal('heading'),
  role: semanticRoleSchema.optional(),
  data: z.object({
    text:   z.string().min(1),
    level:  headingLevelSchema,
    anchor: z.string().optional(),
  }),
})

const paragraphBlockSchema = z.object({
  id:   z.string().min(1),
  type: z.literal('paragraph'),
  role: semanticRoleSchema.optional(),
  data: z.object({ text: z.string() }),
})

const imageBlockSchema = z.object({
  id:   z.string().min(1),
  type: z.literal('image'),
  role: semanticRoleSchema.optional(),
  data: z.object({
    imageId: z.string().uuid(),
    alt:     z.string().min(1, 'image block requires alt text'),
    caption: z.string().optional(),
  }),
})

const listBlockSchema = z.object({
  id:   z.string().min(1),
  type: z.literal('list'),
  role: semanticRoleSchema.optional(),
  data: z.object({
    ordered: z.boolean(),
    items:   z.array(z.string()).min(1),
  }),
})

const quoteBlockSchema = z.object({
  id:   z.string().min(1),
  type: z.literal('quote'),
  role: semanticRoleSchema.optional(),
  data: z.object({
    text: z.string().min(1),
    cite: z.string().optional(),
  }),
})

const codeBlockSchema = z.object({
  id:   z.string().min(1),
  type: z.literal('code'),
  role: semanticRoleSchema.optional(),
  data: z.object({
    lang: z.string(),
    code: z.string(),
  }),
})

const calloutBlockSchema = z.object({
  id:   z.string().min(1),
  type: z.literal('callout'),
  role: semanticRoleSchema.optional(),
  data: z.object({
    tone: z.enum(['tip', 'warn', 'note']),
    text: z.string().min(1),
  }),
})

const faqBlockSchema = z.object({
  id:   z.string().min(1),
  type: z.literal('faq'),
  role: semanticRoleSchema.optional(),
  data: z.object({
    question: z.string().min(1),
    answer:   z.string().min(1),
  }),
})

const keyTakeawayBlockSchema = z.object({
  id:   z.string().min(1),
  type: z.literal('key-takeaway'),
  role: semanticRoleSchema.optional(),
  data: z.object({ text: z.string().min(1) }),
})

export const blockSchema = z.discriminatedUnion('type', [
  headingBlockSchema,
  paragraphBlockSchema,
  imageBlockSchema,
  listBlockSchema,
  quoteBlockSchema,
  codeBlockSchema,
  calloutBlockSchema,
  faqBlockSchema,
  keyTakeawayBlockSchema,
])
export type Block = z.infer<typeof blockSchema>

// content_json is an array of Blocks. Editor enforcement rules (at most one
// tldr, no h1, image blocks require alt) are layered on top of this schema in
// validateContentJson() below so failures get human-readable messages.

export const contentJsonSchema = z.array(blockSchema)
export type ContentJson = z.infer<typeof contentJsonSchema>

export function validateContentJson(content: ContentJson): { ok: true } | { ok: false; field?: string; message: string } {
  let tldrCount = 0
  for (const block of content) {
    if (block.type === 'heading') {
      // headingLevelSchema already excludes 1, but be defensive.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((block.data as any).level === 1) {
        return { ok: false, field: 'content_json', message: 'h1 is reserved for post.title; heading blocks must use levels 2–6' }
      }
    }
    if (block.role === 'tldr') {
      tldrCount += 1
      if (tldrCount > 1) {
        return { ok: false, field: 'content_json', message: 'at most one block per post may carry role=tldr' }
      }
    }
  }
  return { ok: true }
}

// ── geo variants ──────────────────────────────────────────────────────────────

export const geoRegionSchema = z.enum(['US', 'EU', 'OTHER'])
export type GeoRegion = z.infer<typeof geoRegionSchema>

const variantPayloadSchema = z.object({
  title:            z.string().optional(),
  excerpt:          z.string().optional(),
  meta_title:       z.string().optional(),
  meta_description: z.string().optional(),
  cta_label:        z.string().optional(),
  cta_href:         z.string().optional(),
  block_overrides:  z.record(
    z.string(),
    z.object({ text: z.string().optional(), alt: z.string().optional() }),
  ).optional(),
})

export const geoVariantsSchema = z.object({
  US: variantPayloadSchema.optional(),
  EU: variantPayloadSchema.optional(),
}).strict()
export type GeoVariants = z.infer<typeof geoVariantsSchema>

// ── AI readiness ──────────────────────────────────────────────────────────────
//
// Wire shape mirrors the VerseOdin MCP tool `ai_readiness_scan` response —
// see lib/ai-readiness/client.ts for the JSON-RPC envelope and curl-probe
// fixture in docs/cms/handoffs/m7-be-*.md §Appendix.
//
// Kept legacy: aiReadinessSuggestionSchema. v1 doesn't surface block-scoped
// suggestions because VerseOdin checks aren't block-scoped (see PRD §10
// open questions). The schema is retained so consumers built against the
// pre-M7 stub don't break their imports; report.suggestions is no longer
// emitted and the FE drawer renders `report.checks` instead.

export const aiReadinessSuggestionSchema = z.object({
  severity: z.enum(['info', 'warn', 'error']),
  message:  z.string(),
  blockId:  z.string().optional(),
})
export type AiReadinessSuggestion = z.infer<typeof aiReadinessSuggestionSchema>

export const aiReadinessBandSchema = z.enum(['strong', 'adequate', 'weak'])
export type AiReadinessBand = z.infer<typeof aiReadinessBandSchema>

// 8 known check ids per VerseOdin v1 (probed 2026-05-08). `.passthrough()`
// at the report level lets future check ids round-trip without a schema
// bump, but the enum is the authoritative list for typing FE chip rows.
export const aiReadinessCheckIdSchema = z.enum([
  'robots-txt',
  'sitemap',
  'llms-txt',
  'heading-structure',
  'readability',
  'meta-tags',
  'semantic-html',
  'accessibility',
])
export type AiReadinessCheckId = z.infer<typeof aiReadinessCheckIdSchema>

export const aiReadinessCheckStatusSchema = z.enum(['pass', 'warning', 'fail'])
export type AiReadinessCheckStatus = z.infer<typeof aiReadinessCheckStatusSchema>

export const aiReadinessCheckScopeSchema = z.enum(['page', 'domain'])
export type AiReadinessCheckScope = z.infer<typeof aiReadinessCheckScopeSchema>

export const aiReadinessCheckSchema = z.object({
  id:             aiReadinessCheckIdSchema,
  label:          z.string(),
  status:         aiReadinessCheckStatusSchema,
  score:          z.number().min(0).max(100),
  scope:          aiReadinessCheckScopeSchema,
  details:        z.string(),
  recommendation: z.string(),
})
export type AiReadinessCheck = z.infer<typeof aiReadinessCheckSchema>

export const aiReadinessMetadataSchema = z.object({
  title:       z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  analyzedAt:  z.string(), // ISO 8601 from VerseOdin
})
export type AiReadinessMetadata = z.infer<typeof aiReadinessMetadataSchema>

// `.passthrough()` lets new VerseOdin top-level fields round-trip; new
// `checks` ids are similarly tolerated via .passthrough() on the array
// element. We pin the 8 known ids in the enum so FE typing is honest, but
// an unknown id no longer hard-fails Zod — see client.ts for the relaxed
// element schema used at parse time.
export const aiReadinessReportSchema = z.object({
  overallScore:           z.number().min(0).max(100),
  pageScore:              z.number().min(0).max(100),
  domainScore:            z.number().min(0).max(100),
  domainReputationBonus:  z.number(),
  metadata:               aiReadinessMetadataSchema,
  checks:                 z.array(aiReadinessCheckSchema),
}).passthrough()
export type AiReadinessReport = z.infer<typeof aiReadinessReportSchema>

// ── post + post summary + image ───────────────────────────────────────────────

export const postStatusSchema = z.enum(['draft', 'published'])
export type PostStatus = z.infer<typeof postStatusSchema>

// Length caps mirror the PATCH body schema in lib/post-validation.ts —
// see that file's comment block for rationale. Caps are enforced at the
// wire-shape layer so anything we round-trip is also bounded.
export const postSchema = z.object({
  id:                       z.string().uuid(),
  slug:                     z.string().regex(slugRegex).min(1).max(80),
  title:                    z.string().trim().min(1).max(200),
  excerpt:                  z.string().max(500).nullable(),
  status:                   postStatusSchema,
  content_json:             contentJsonSchema,
  content_schema_version:   z.literal(1),
  cover_image_id:           z.string().uuid().nullable(),
  og_image_id:              z.string().uuid().nullable(),
  tags:                     z.array(z.string().regex(tagRegex).max(40)).max(10),
  author_name:              z.string().min(1).max(120),
  author_url:               z.string().url().nullable(),
  meta_title:               z.string().max(200).nullable(),
  meta_description:         z.string().max(160).nullable(),
  canonical_url:            z.string().url().nullable(),
  geo_variants:             geoVariantsSchema,
  ai_readiness_score:       z.number().int().min(0).max(100).nullable(),
  ai_readiness_band:        aiReadinessBandSchema.nullable(),
  ai_readiness_report:      aiReadinessReportSchema.nullable(),
  ai_readiness_checked_at:  z.string().datetime().nullable(),
  published_at:             z.string().datetime().nullable(),
  created_at:               z.string().datetime(),
  updated_at:               z.string().datetime(),
})
export type Post = z.infer<typeof postSchema>

export const postSummarySchema = postSchema.pick({
  id: true,
  slug: true,
  title: true,
  status: true,
  tags: true,
  updated_at: true,
  published_at: true,
  ai_readiness_score: true,
  ai_readiness_band: true,
}).extend({
  has_geo_variants: z.boolean(),
  // The list of regions that carry a geo variant. Drives the per-region
  // chip row in the admin dashboard. Order is canonical (US, EU).
  geo_variant_regions: z.array(z.enum(['US', 'EU'])),
})
export type PostSummary = z.infer<typeof postSummarySchema>

export const imageSchema = z.object({
  id:         z.string().uuid(),
  blob_url:   z.string().url(),
  width:      z.number().int().positive(),
  height:     z.number().int().positive(),
  alt:        z.string(),
  focal_x:    z.number().min(0).max(1),
  focal_y:    z.number().min(0).max(1),
  filename:   z.string(),
  created_at: z.string().datetime(),
})
export type Image = z.infer<typeof imageSchema>

// ── login body schema ─────────────────────────────────────────────────────────
// Used by POST /api/admin/login. Email is normalized to lowercase by the route
// handler before comparison.

export const loginBodySchema = z.object({
  email:    z.string().email().max(254),
  password: z.string().min(1).max(1024),
})
export type LoginBody = z.infer<typeof loginBodySchema>

// ── error envelope ────────────────────────────────────────────────────────────
// All non-2xx responses from /api/admin/** must conform to this shape.

export const errorCodeSchema = z.enum([
  'UNAUTHORIZED',
  'CSRF_FAILED',
  'VALIDATION_FAILED',
  'NOT_FOUND',
  'SLUG_CONFLICT',
  'RATE_LIMITED',
  'MCP_DISABLED',
  'MCP_UPSTREAM_ERROR',
  'UPLOAD_TOO_LARGE',
  'UPLOAD_BAD_TYPE',
  'INTERNAL',
  // M7-BE additions for the AI Readiness route. POST_NOT_PUBLISHED
  // signals the v1.5 carve-out (URL-based scoring requires a published
  // post — pre-publish scoring is deferred to v1.6 per PRD §10).
  // NOT_SCORED is the shape GET returns when the post has never been
  // scanned yet (so the FE drawer can show its empty state).
  'POST_NOT_PUBLISHED',
  'NOT_SCORED',
])
export type ErrorCode = z.infer<typeof errorCodeSchema>

export type ApiError = {
  error: string
  code: ErrorCode
  field?: string
}
