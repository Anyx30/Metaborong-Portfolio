import { describe, it, expect } from 'vitest'
import {
  blockSchema,
  contentJsonSchema,
  validateContentJson,
  geoVariantsSchema,
  geoRegionSchema,
  semanticRoleSchema,
  postSchema,
  postSummarySchema,
  imageSchema,
  loginBodySchema,
  aiReadinessSuggestionSchema,
  aiReadinessReportSchema,
  errorCodeSchema,
} from '@/lib/blog-schema'

// ── Block discriminated union ────────────────────────────────────────────────

describe('blockSchema — heading', () => {
  it('accepts heading levels 2..6', () => {
    for (const level of [2, 3, 4, 5, 6] as const) {
      const parsed = blockSchema.safeParse({
        id: 'b1',
        type: 'heading',
        data: { text: 'Hello', level },
      })
      expect(parsed.success, `level ${level} should parse`).toBe(true)
    }
  })

  it('rejects level=1 (h1 is reserved for post.title)', () => {
    const parsed = blockSchema.safeParse({
      id: 'b1',
      type: 'heading',
      data: { text: 'Hello', level: 1 },
    })
    expect(parsed.success).toBe(false)
  })

  it('rejects empty heading text', () => {
    const parsed = blockSchema.safeParse({
      id: 'b1',
      type: 'heading',
      data: { text: '', level: 2 },
    })
    expect(parsed.success).toBe(false)
  })
})

describe('blockSchema — image', () => {
  it('accepts image with non-empty alt', () => {
    const parsed = blockSchema.safeParse({
      id: 'i1',
      type: 'image',
      data: { imageId: '00000000-0000-4000-a000-000000000000', alt: 'a cat' },
    })
    expect(parsed.success).toBe(true)
  })

  it('rejects image with empty alt', () => {
    const parsed = blockSchema.safeParse({
      id: 'i1',
      type: 'image',
      data: { imageId: '00000000-0000-4000-a000-000000000000', alt: '' },
    })
    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      expect(parsed.error.issues.some((i) => i.path.join('.').includes('alt'))).toBe(true)
    }
  })

  it('rejects image with non-uuid imageId', () => {
    const parsed = blockSchema.safeParse({
      id: 'i1',
      type: 'image',
      data: { imageId: 'not-a-uuid', alt: 'x' },
    })
    expect(parsed.success).toBe(false)
  })
})

describe('blockSchema — paragraph / list / quote / code / callout / faq / key-takeaway', () => {
  it('accepts a paragraph and rejects extra/missing fields', () => {
    expect(blockSchema.safeParse({ id: 'p', type: 'paragraph', data: { text: 'x' } }).success).toBe(true)
    expect(blockSchema.safeParse({ id: 'p', type: 'paragraph', data: {} }).success).toBe(false)
  })

  it('list requires ordered + non-empty items', () => {
    expect(blockSchema.safeParse({ id: 'l', type: 'list', data: { ordered: false, items: ['a'] } }).success).toBe(true)
    expect(blockSchema.safeParse({ id: 'l', type: 'list', data: { ordered: false, items: [] } }).success).toBe(false)
  })

  it('quote requires text', () => {
    expect(blockSchema.safeParse({ id: 'q', type: 'quote', data: { text: 'x' } }).success).toBe(true)
    expect(blockSchema.safeParse({ id: 'q', type: 'quote', data: { text: '' } }).success).toBe(false)
  })

  it('callout enforces tone enum', () => {
    expect(blockSchema.safeParse({ id: 'c', type: 'callout', data: { tone: 'tip', text: 'x' } }).success).toBe(true)
    expect(blockSchema.safeParse({ id: 'c', type: 'callout', data: { tone: 'shout', text: 'x' } }).success).toBe(false)
  })

  it('faq requires question + answer', () => {
    expect(blockSchema.safeParse({ id: 'f', type: 'faq', data: { question: 'q', answer: 'a' } }).success).toBe(true)
    expect(blockSchema.safeParse({ id: 'f', type: 'faq', data: { question: '', answer: 'a' } }).success).toBe(false)
  })

  it('code accepts empty body but requires lang field', () => {
    expect(blockSchema.safeParse({ id: 'c', type: 'code', data: { lang: 'ts', code: '' } }).success).toBe(true)
    expect(blockSchema.safeParse({ id: 'c', type: 'code', data: { code: '' } }).success).toBe(false)
  })

  it('key-takeaway requires text', () => {
    expect(blockSchema.safeParse({ id: 'k', type: 'key-takeaway', data: { text: 'x' } }).success).toBe(true)
    expect(blockSchema.safeParse({ id: 'k', type: 'key-takeaway', data: { text: '' } }).success).toBe(false)
  })
})

// ── enums ────────────────────────────────────────────────────────────────────

describe('SemanticRole / GeoRegion / ErrorCode enums', () => {
  it('semanticRoleSchema accepts every role and rejects unknowns', () => {
    for (const role of ['intro', 'tldr', 'definition', 'step', 'evidence', 'cta']) {
      expect(semanticRoleSchema.safeParse(role).success).toBe(true)
    }
    expect(semanticRoleSchema.safeParse('cool').success).toBe(false)
  })

  it('geoRegionSchema accepts US / EU / OTHER only', () => {
    expect(geoRegionSchema.safeParse('US').success).toBe(true)
    expect(geoRegionSchema.safeParse('EU').success).toBe(true)
    expect(geoRegionSchema.safeParse('OTHER').success).toBe(true)
    expect(geoRegionSchema.safeParse('APAC').success).toBe(false)
  })

  it('errorCodeSchema accepts known codes and rejects invented ones', () => {
    expect(errorCodeSchema.safeParse('UNAUTHORIZED').success).toBe(true)
    expect(errorCodeSchema.safeParse('CSRF_FAILED').success).toBe(true)
    expect(errorCodeSchema.safeParse('NOT_A_CODE').success).toBe(false)
  })
})

// ── content_json + validateContentJson ───────────────────────────────────────

describe('contentJsonSchema + validateContentJson', () => {
  it('accepts an empty array', () => {
    expect(contentJsonSchema.safeParse([]).success).toBe(true)
    expect(validateContentJson([])).toEqual({ ok: true })
  })

  it('rejects a content_json with two tldr-role blocks', () => {
    const parsed = contentJsonSchema.parse([
      { id: 'a', type: 'paragraph', role: 'tldr', data: { text: 'x' } },
      { id: 'b', type: 'paragraph', role: 'tldr', data: { text: 'y' } },
    ])
    const result = validateContentJson(parsed)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.field).toBe('content_json')
      expect(result.message).toMatch(/tldr/i)
    }
  })

  it('accepts content with at most one tldr block', () => {
    const parsed = contentJsonSchema.parse([
      { id: 'a', type: 'paragraph', role: 'tldr', data: { text: 'x' } },
      { id: 'b', type: 'paragraph', role: 'intro', data: { text: 'y' } },
    ])
    expect(validateContentJson(parsed)).toEqual({ ok: true })
  })
})

// ── GeoVariants ──────────────────────────────────────────────────────────────

describe('geoVariantsSchema', () => {
  it('accepts an empty object', () => {
    expect(geoVariantsSchema.safeParse({}).success).toBe(true)
  })

  it('accepts US-only variant with subset of fields', () => {
    expect(geoVariantsSchema.safeParse({
      US: { title: 'Hello', cta_label: 'Click' },
    }).success).toBe(true)
  })

  it('rejects an OTHER region key (only US/EU are storable)', () => {
    expect(geoVariantsSchema.safeParse({
      OTHER: { title: 'Hello' },
    }).success).toBe(false)
  })

  it('rejects unknown region keys', () => {
    expect(geoVariantsSchema.safeParse({
      APAC: { title: 'Hello' },
    }).success).toBe(false)
  })
})

// ── Post / PostSummary / Image ───────────────────────────────────────────────

const ISO = '2026-05-05T12:00:00.000Z'

const validPost = {
  id: '00000000-0000-4000-a000-000000000001',
  slug: 'a-post',
  title: 'A Post',
  excerpt: null,
  status: 'draft' as const,
  content_json: [],
  content_schema_version: 1 as const,
  cover_image_id: null,
  og_image_id: null,
  tags: [],
  author_name: 'Admin',
  author_url: null,
  meta_title: null,
  meta_description: null,
  canonical_url: null,
  geo_variants: {},
  ai_readiness_score: null,
  ai_readiness_band: null,
  ai_readiness_report: null,
  ai_readiness_checked_at: null,
  published_at: null,
  created_at: ISO,
  updated_at: ISO,
}

describe('postSchema', () => {
  it('accepts a fully-populated minimal post', () => {
    expect(postSchema.safeParse(validPost).success).toBe(true)
  })

  it('rejects bad slug shape', () => {
    expect(postSchema.safeParse({ ...validPost, slug: 'A Bad Slug' }).success).toBe(false)
    // Consecutive hyphens are NOT allowed by the kebab-case regex — each
    // hyphen must be flanked by [a-z0-9].
    expect(postSchema.safeParse({ ...validPost, slug: 'has--double-hyphen' }).success).toBe(false)
    expect(postSchema.safeParse({ ...validPost, slug: '-leading' }).success).toBe(false)
    expect(postSchema.safeParse({ ...validPost, slug: 'trailing-' }).success).toBe(false)
    expect(postSchema.safeParse({ ...validPost, slug: '' }).success).toBe(false)
    expect(postSchema.safeParse({ ...validPost, slug: 'x'.repeat(81) }).success).toBe(false)
    // Sanity: a well-formed slug parses.
    expect(postSchema.safeParse({ ...validPost, slug: 'good-slug-2026' }).success).toBe(true)
  })

  it('rejects more than 10 tags', () => {
    expect(postSchema.safeParse({ ...validPost, tags: Array(11).fill('a') }).success).toBe(false)
  })

  it('rejects out-of-range ai_readiness_score', () => {
    expect(postSchema.safeParse({ ...validPost, ai_readiness_score: 101 }).success).toBe(false)
    expect(postSchema.safeParse({ ...validPost, ai_readiness_score: -1 }).success).toBe(false)
    expect(postSchema.safeParse({ ...validPost, ai_readiness_score: 50 }).success).toBe(true)
  })

  it('rejects unknown status values', () => {
    expect(postSchema.safeParse({ ...validPost, status: 'archived' }).success).toBe(false)
  })
})

describe('postSummarySchema', () => {
  it('accepts a valid summary', () => {
    const summary = {
      id: validPost.id,
      slug: validPost.slug,
      title: validPost.title,
      status: validPost.status,
      tags: validPost.tags,
      updated_at: validPost.updated_at,
      published_at: validPost.published_at,
      ai_readiness_score: null,
      ai_readiness_band: null,
      has_geo_variants: false,
    }
    expect(postSummarySchema.safeParse(summary).success).toBe(true)
  })

  it('rejects when has_geo_variants is missing', () => {
    const summary = {
      id: validPost.id,
      slug: validPost.slug,
      title: validPost.title,
      status: validPost.status,
      tags: validPost.tags,
      updated_at: validPost.updated_at,
      published_at: validPost.published_at,
      ai_readiness_score: null,
      ai_readiness_band: null,
    }
    expect(postSummarySchema.safeParse(summary).success).toBe(false)
  })
})

describe('imageSchema', () => {
  it('accepts a valid image', () => {
    expect(imageSchema.safeParse({
      id: validPost.id,
      blob_url: 'https://example.com/x.webp',
      width: 800,
      height: 600,
      alt: '',
      focal_x: 0.5,
      focal_y: 0.5,
      filename: 'x.webp',
      created_at: ISO,
    }).success).toBe(true)
  })

  it('rejects out-of-range focal point', () => {
    expect(imageSchema.safeParse({
      id: validPost.id,
      blob_url: 'https://example.com/x.webp',
      width: 800,
      height: 600,
      alt: '',
      focal_x: 1.5,
      focal_y: 0.5,
      filename: 'x.webp',
      created_at: ISO,
    }).success).toBe(false)
  })
})

// ── loginBodySchema ──────────────────────────────────────────────────────────

describe('loginBodySchema', () => {
  it('accepts a valid login body', () => {
    expect(loginBodySchema.safeParse({ email: 'a@b.co', password: 'hunter2' }).success).toBe(true)
  })

  it('rejects empty email', () => {
    expect(loginBodySchema.safeParse({ email: '', password: 'hunter2' }).success).toBe(false)
  })

  it('rejects empty password', () => {
    expect(loginBodySchema.safeParse({ email: 'a@b.co', password: '' }).success).toBe(false)
  })

  it('rejects malformed email', () => {
    expect(loginBodySchema.safeParse({ email: 'not-an-email', password: 'hunter2' }).success).toBe(false)
  })

  it('rejects missing fields entirely', () => {
    expect(loginBodySchema.safeParse({}).success).toBe(false)
    expect(loginBodySchema.safeParse({ email: 'a@b.co' }).success).toBe(false)
  })
})

// ── AI readiness ─────────────────────────────────────────────────────────────

describe('aiReadinessSuggestionSchema + aiReadinessReportSchema', () => {
  it('accepts a suggestion with severity + message + optional blockId', () => {
    expect(aiReadinessSuggestionSchema.safeParse({ severity: 'info', message: 'm' }).success).toBe(true)
    expect(aiReadinessSuggestionSchema.safeParse({ severity: 'warn', message: 'm', blockId: 'b1' }).success).toBe(true)
  })

  it('rejects invalid severity', () => {
    expect(aiReadinessSuggestionSchema.safeParse({ severity: 'critical', message: 'm' }).success).toBe(false)
  })

  it('aiReadinessReportSchema requires a suggestions array', () => {
    expect(aiReadinessReportSchema.safeParse({ suggestions: [] }).success).toBe(true)
    expect(aiReadinessReportSchema.safeParse({}).success).toBe(false)
  })
})
