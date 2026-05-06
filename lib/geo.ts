// Server-side geo resolution for blog posts.
//
// resolveRegion() reads the same Vercel-edge geo header that
// app/api/consent/route.ts uses (x-vercel-ip-country) and bucket-maps it to
// the GeoRegion enum the frontend already consumes ('US' | 'EU' | 'OTHER').
// In development, falls back to DEV_GEO_COUNTRY env so the variant path can
// be exercised without a Vercel preview deploy.
//
// mergeVariant() returns a NEW Post with the relevant variant fields
// overlaid on the base. Variants live in geo_variants.{US,EU} per the
// blog-schema contract; OTHER always falls back to base. Block-level
// text/alt overrides apply via geo_variants[region].block_overrides keyed
// by block.id.

import type { GeoRegion, GeoVariants, Post, Block } from './blog-schema'

// EU bucket: EU member states + EFTA / UK so practical readership is
// covered. If the editorial team wants to split UK out later, that's a
// schema change (third variant key), not a resolver change.
const EU_COUNTRIES = new Set<string>([
  // EU 27
  'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI',
  'FR', 'GR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT',
  'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK',
  // UK + EFTA
  'GB', 'CH', 'NO', 'IS',
])

function bucketFromCountry(country: string | null | undefined): GeoRegion {
  if (!country) return 'OTHER'
  const upper = country.trim().toUpperCase()
  if (!upper) return 'OTHER'
  if (upper === 'US') return 'US'
  if (EU_COUNTRIES.has(upper)) return 'EU'
  return 'OTHER'
}

/**
 * Resolve the visitor's region from request headers.
 *
 * Order:
 *   1. x-vercel-ip-country (Vercel edge sets this in production)
 *   2. DEV_GEO_COUNTRY (env override for local dev / CI)
 *
 * Always returns a valid GeoRegion — never throws.
 */
export function resolveRegion(headers: Headers): GeoRegion {
  const fromHeader = headers.get('x-vercel-ip-country')
  if (fromHeader) return bucketFromCountry(fromHeader)
  const fromEnv = process.env.NODE_ENV !== 'production'
    ? process.env.DEV_GEO_COUNTRY
    : undefined
  return bucketFromCountry(fromEnv)
}

/**
 * Merge a region's variant fields onto the base post. Returns a new Post
 * (does not mutate the input). Falls back to base whenever the variant or
 * a specific field is missing. OTHER always returns the base unchanged.
 *
 * Block overrides from geo_variants[region].block_overrides are applied to
 * `text` (paragraph/heading/quote/callout/key-takeaway) and `alt` (image)
 * by block id; blocks without an override pass through.
 */
export function mergeVariant(post: Post, region: GeoRegion): Post {
  if (region === 'OTHER') return post
  const variant = post.geo_variants?.[region]
  if (!variant) return post

  const next: Post = {
    ...post,
    title:            variant.title            ?? post.title,
    excerpt:          variant.excerpt          ?? post.excerpt,
    meta_title:       variant.meta_title       ?? post.meta_title,
    meta_description: variant.meta_description ?? post.meta_description,
  }

  const overrides = variant.block_overrides
  if (overrides && Object.keys(overrides).length > 0) {
    next.content_json = post.content_json.map((block) =>
      applyBlockOverride(block, overrides[block.id]),
    )
  }

  return next
}

function applyBlockOverride(
  block: Block,
  override: { text?: string; alt?: string } | undefined,
): Block {
  if (!override) return block
  // The discriminated union narrows `block.data` per `block.type`, but a
  // single spread expression confuses the inferred return type. So we
  // narrow with explicit branches that re-assemble each variant fully.
  if (override.text != null) {
    if (block.type === 'heading') {
      return { ...block, data: { ...block.data, text: override.text } }
    }
    if (block.type === 'paragraph') {
      return { ...block, data: { ...block.data, text: override.text } }
    }
    if (block.type === 'quote') {
      return { ...block, data: { ...block.data, text: override.text } }
    }
    if (block.type === 'callout') {
      return { ...block, data: { ...block.data, text: override.text } }
    }
    if (block.type === 'key-takeaway') {
      return { ...block, data: { ...block.data, text: override.text } }
    }
  }
  if (override.alt != null && block.type === 'image') {
    return { ...block, data: { ...block.data, alt: override.alt } }
  }
  // list / code / faq don't expose `text` or `alt` as variant-overridable
  // fields in v1; pass through unchanged.
  return block
}

// Convenience used by lib/posts.ts: a typed accessor that pulls a variant
// without exposing other regions' variants to the caller.
export function variantFor(post: Post, region: GeoRegion): GeoVariants[keyof GeoVariants] | undefined {
  if (region === 'OTHER') return undefined
  return post.geo_variants?.[region]
}
