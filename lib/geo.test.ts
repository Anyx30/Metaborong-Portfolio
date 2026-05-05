import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { resolveRegion, mergeVariant, variantFor } from '@/lib/geo'
import type { Post } from '@/lib/blog-schema'

// Build a known-good base Post for variant tests; only the fields that
// mergeVariant() touches are interesting — everything else passes through.
const ISO = '2026-05-05T12:00:00.000Z'
const basePost: Post = {
  id: '11111111-1111-4111-8111-111111111111',
  slug: 'a-post',
  title: 'Base title',
  excerpt: 'Base excerpt',
  status: 'published',
  content_json: [
    { id: 'b1', type: 'heading', data: { text: 'Base heading', level: 2 } },
    { id: 'b2', type: 'paragraph', data: { text: 'Base body' } },
    { id: 'b3', type: 'image',     data: { imageId: '22222222-2222-4222-8222-222222222222', alt: 'base alt' } },
  ],
  content_schema_version: 1,
  cover_image_id: null,
  og_image_id: null,
  tags: ['web3'],
  author_name: 'Admin',
  author_url: null,
  meta_title: 'Base meta title',
  meta_description: 'Base meta desc',
  canonical_url: null,
  geo_variants: {},
  ai_readiness_score: null,
  ai_readiness_band: null,
  ai_readiness_report: null,
  ai_readiness_checked_at: null,
  published_at: ISO,
  created_at: ISO,
  updated_at: ISO,
}

describe('resolveRegion', () => {
  let envBackup: NodeJS.ProcessEnv
  beforeEach(() => { envBackup = { ...process.env } })
  afterEach(() => { process.env = envBackup })

  it('US country code → US bucket', () => {
    expect(resolveRegion(new Headers({ 'x-vercel-ip-country': 'US' }))).toBe('US')
  })

  it('DE / FR / GB / NO all bucket to EU', () => {
    expect(resolveRegion(new Headers({ 'x-vercel-ip-country': 'DE' }))).toBe('EU')
    expect(resolveRegion(new Headers({ 'x-vercel-ip-country': 'FR' }))).toBe('EU')
    expect(resolveRegion(new Headers({ 'x-vercel-ip-country': 'GB' }))).toBe('EU')
    expect(resolveRegion(new Headers({ 'x-vercel-ip-country': 'NO' }))).toBe('EU')
  })

  it('JP / IN / BR → OTHER', () => {
    expect(resolveRegion(new Headers({ 'x-vercel-ip-country': 'JP' }))).toBe('OTHER')
    expect(resolveRegion(new Headers({ 'x-vercel-ip-country': 'IN' }))).toBe('OTHER')
    expect(resolveRegion(new Headers({ 'x-vercel-ip-country': 'BR' }))).toBe('OTHER')
  })

  it('empty or absent header → OTHER (when no env override)', () => {
    delete process.env.DEV_GEO_COUNTRY
    expect(resolveRegion(new Headers())).toBe('OTHER')
    expect(resolveRegion(new Headers({ 'x-vercel-ip-country': '' }))).toBe('OTHER')
  })

  it('lowercase country code is normalised', () => {
    expect(resolveRegion(new Headers({ 'x-vercel-ip-country': 'us' }))).toBe('US')
    expect(resolveRegion(new Headers({ 'x-vercel-ip-country': 'de' }))).toBe('EU')
  })

  it('falls back to DEV_GEO_COUNTRY in non-production when header absent', () => {
    // NODE_ENV is readonly in @types/node v20+, but the test still needs
    // to flip it to exercise the dev-only DEV_GEO_COUNTRY fallback.
    Object.assign(process.env, { NODE_ENV: 'development' })
    process.env.DEV_GEO_COUNTRY = 'DE'
    expect(resolveRegion(new Headers())).toBe('EU')
  })

  it('header beats DEV_GEO_COUNTRY', () => {
    // NODE_ENV is readonly in @types/node v20+, but the test still needs
    // to flip it to exercise the dev-only DEV_GEO_COUNTRY fallback.
    Object.assign(process.env, { NODE_ENV: 'development' })
    process.env.DEV_GEO_COUNTRY = 'DE'
    expect(resolveRegion(new Headers({ 'x-vercel-ip-country': 'US' }))).toBe('US')
  })
})

describe('mergeVariant', () => {
  it('OTHER region returns the base post unchanged', () => {
    expect(mergeVariant(basePost, 'OTHER')).toBe(basePost)
  })

  it('region with no variant entry returns the base post', () => {
    const post = { ...basePost, geo_variants: {} }
    expect(mergeVariant(post, 'US')).toBe(post)
  })

  it('US variant overlays title / excerpt / meta fields onto base', () => {
    const post: Post = {
      ...basePost,
      geo_variants: {
        US: {
          title: 'US title',
          excerpt: 'US excerpt',
          meta_title: 'US meta title',
          meta_description: 'US meta desc',
        },
      },
    }
    const merged = mergeVariant(post, 'US')
    expect(merged.title).toBe('US title')
    expect(merged.excerpt).toBe('US excerpt')
    expect(merged.meta_title).toBe('US meta title')
    expect(merged.meta_description).toBe('US meta desc')
    // base author / id / slug pass through
    expect(merged.id).toBe(basePost.id)
    expect(merged.author_name).toBe(basePost.author_name)
  })

  it('partial variant only overrides the fields it sets', () => {
    const post: Post = {
      ...basePost,
      geo_variants: { EU: { title: 'EU only title' } },
    }
    const merged = mergeVariant(post, 'EU')
    expect(merged.title).toBe('EU only title')
    expect(merged.excerpt).toBe(basePost.excerpt)
    expect(merged.meta_title).toBe(basePost.meta_title)
  })

  it('block_overrides apply text to text-bearing blocks and alt to image blocks', () => {
    const post: Post = {
      ...basePost,
      geo_variants: {
        US: {
          block_overrides: {
            b1: { text: 'US heading' },
            b2: { text: 'US body' },
            b3: { alt: 'US alt' },
          },
        },
      },
    }
    const merged = mergeVariant(post, 'US')
    const blocks = merged.content_json
    const heading = blocks.find((b) => b.id === 'b1')!
    const para    = blocks.find((b) => b.id === 'b2')!
    const image   = blocks.find((b) => b.id === 'b3')!
    if (heading.type !== 'heading') throw new Error('expected heading')
    if (para.type    !== 'paragraph') throw new Error('expected paragraph')
    if (image.type   !== 'image') throw new Error('expected image')
    expect(heading.data.text).toBe('US heading')
    expect(para.data.text).toBe('US body')
    expect(image.data.alt).toBe('US alt')
  })

  it('mergeVariant does not mutate the input post', () => {
    const post: Post = {
      ...basePost,
      geo_variants: { US: { title: 'X' } },
      content_json: [{ id: 'b1', type: 'paragraph', data: { text: 'orig' } }],
    }
    const titleBefore = post.title
    mergeVariant(post, 'US')
    expect(post.title).toBe(titleBefore)
  })

  it('does not expose the OTHER region key (variants are US/EU only)', () => {
    // OTHER is not a storable variant key per the contract — confirm
    // the resolver path treats it as base.
    const post: Post = {
      ...basePost,
      geo_variants: { US: { title: 'should not leak' } },
    }
    const merged = mergeVariant(post, 'OTHER')
    expect(merged.title).toBe(basePost.title)
  })
})

describe('variantFor', () => {
  it('returns the variant payload when present', () => {
    const post: Post = {
      ...basePost,
      geo_variants: { US: { title: 'X' }, EU: { title: 'Y' } },
    }
    expect(variantFor(post, 'US')).toEqual({ title: 'X' })
    expect(variantFor(post, 'EU')).toEqual({ title: 'Y' })
  })

  it('returns undefined for OTHER', () => {
    expect(variantFor(basePost, 'OTHER')).toBeUndefined()
  })

  it('returns undefined when the region has no variant', () => {
    expect(variantFor(basePost, 'US')).toBeUndefined()
  })
})
