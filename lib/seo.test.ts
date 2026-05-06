// Unit tests for the M5-core JSON-LD builders.

import { describe, expect, it } from 'vitest'
import { articleSchema, breadcrumbSchema, SITE_ORIGIN } from './seo'
import type { Post } from './blog-schema'

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    slug: 'how-we-shipped',
    title: 'How we shipped the protocol in six weeks',
    excerpt: 'A short summary that doubles as the lede.',
    status: 'published',
    content_json: [],
    content_schema_version: 1,
    cover_image_id: null,
    og_image_id: null,
    tags: ['web3', 'engineering'],
    author_name: 'Arnab Ray',
    author_url: 'https://example.com/arnab',
    meta_title: null,
    meta_description: null,
    canonical_url: null,
    geo_variants: {},
    ai_readiness_score: null,
    ai_readiness_band: null,
    ai_readiness_report: null,
    ai_readiness_checked_at: null,
    published_at: '2026-04-12T08:00:00.000Z',
    created_at: '2026-04-10T08:00:00.000Z',
    updated_at: '2026-04-12T08:00:00.000Z',
    ...overrides,
  }
}

describe('articleSchema', () => {
  it('emits a schema.org Article with mandatory fields populated', () => {
    const out = articleSchema({ post: makePost() })
    expect(out['@context']).toBe('https://schema.org')
    expect(out['@type']).toBe('Article')
    expect(out.headline).toBe('How we shipped the protocol in six weeks')
    expect(out.datePublished).toBe('2026-04-12T08:00:00.000Z')
    expect(out.dateModified).toBe('2026-04-12T08:00:00.000Z')
    expect(out.url).toBe(`${SITE_ORIGIN}/blog/how-we-shipped/`)
  })

  it('falls back to /og?slug=… when no cover image url is supplied', () => {
    const out = articleSchema({ post: makePost() })
    expect(out.image).toBe(`${SITE_ORIGIN}/og?slug=how-we-shipped`)
  })

  it('uses the supplied cover image when present', () => {
    const out = articleSchema({
      post: makePost(),
      imageUrl: 'https://cdn.example/cover.jpg',
    })
    expect(out.image).toBe('https://cdn.example/cover.jpg')
  })

  it('prefers meta_title and meta_description when set', () => {
    const out = articleSchema({
      post: makePost({
        meta_title: 'Six weeks, one protocol',
        meta_description: 'How we did it.',
      }),
    })
    expect(out.headline).toBe('Six weeks, one protocol')
    expect(out.description).toBe('How we did it.')
  })

  it('honors canonical_url when set', () => {
    const out = articleSchema({
      post: makePost({ canonical_url: 'https://canonical.example/post' }),
    })
    expect(out.url).toBe('https://canonical.example/post')
    expect(out.mainEntityOfPage).toEqual({
      '@type': 'WebPage',
      '@id': 'https://canonical.example/post',
    })
  })

  it('emits author with url when author_url present, name-only otherwise', () => {
    const withUrl = articleSchema({ post: makePost() })
    expect(withUrl.author).toEqual({
      '@type': 'Person',
      name: 'Arnab Ray',
      url: 'https://example.com/arnab',
    })
    const without = articleSchema({ post: makePost({ author_url: null }) })
    expect(without.author).toEqual({ '@type': 'Person', name: 'Arnab Ray' })
  })

  it('joins tags into keywords; omits keywords entirely when empty', () => {
    expect(articleSchema({ post: makePost() }).keywords).toBe('web3, engineering')
    expect(articleSchema({ post: makePost({ tags: [] }) }).keywords).toBeUndefined()
  })

  it('falls back to created_at when published_at is null (still-draft case)', () => {
    const out = articleSchema({ post: makePost({ published_at: null }) })
    expect(out.datePublished).toBe('2026-04-10T08:00:00.000Z')
  })

  it('publisher is the Metaborong Organization stub', () => {
    const out = articleSchema({ post: makePost() }) as { publisher: Record<string, unknown> }
    expect(out.publisher['@type']).toBe('Organization')
    expect(out.publisher.name).toBe('Metaborong')
    expect(out.publisher.url).toBe(SITE_ORIGIN)
  })
})

describe('breadcrumbSchema', () => {
  it('emits Home → Blog → Post in order', () => {
    const out = breadcrumbSchema({
      post: { slug: 'how-we-shipped', title: 'How we shipped' },
    }) as { '@type': string; itemListElement: Array<{ position: number; name: string; item: string }> }
    expect(out['@type']).toBe('BreadcrumbList')
    expect(out.itemListElement).toHaveLength(3)
    expect(out.itemListElement[0]).toEqual({
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: SITE_ORIGIN,
    })
    expect(out.itemListElement[1]).toEqual({
      '@type': 'ListItem',
      position: 2,
      name: 'Blog',
      item: `${SITE_ORIGIN}/blog/`,
    })
    expect(out.itemListElement[2]).toEqual({
      '@type': 'ListItem',
      position: 3,
      name: 'How we shipped',
      item: `${SITE_ORIGIN}/blog/how-we-shipped/`,
    })
  })
})
