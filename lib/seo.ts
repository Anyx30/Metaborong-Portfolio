// JSON-LD builders for the public blog surface.
//
// Article + BreadcrumbList land in M5-core (essential SEO). FAQPage,
// HowTo, and Speakable are deferred to v1.5+ per PRD §5.7.
//
// These builders return plain objects ready to be JSON-stringified into
// <script type="application/ld+json"> tags. They never throw — every
// optional field falls back gracefully so a partially-populated draft
// still emits well-formed JSON-LD.
//
// The output shapes follow schema.org/Article and schema.org/BreadcrumbList.

import type { Post } from './blog-schema'

export const SITE_ORIGIN = 'https://www.metaborong.com'

const PUBLISHER = {
  '@type': 'Organization' as const,
  name: 'Metaborong',
  url: SITE_ORIGIN,
  logo: {
    '@type': 'ImageObject' as const,
    url: `${SITE_ORIGIN}/logo.png`,
  },
}

interface ArticleSchemaInput {
  post: Post
  /**
   * Resolved cover image URL (next/image src or absolute https). When
   * absent, the OG fallback route is used so Article still has an image.
   */
  imageUrl?: string | null
}

/**
 * Build a schema.org/Article JSON-LD object. The output is a plain JSON-
 * serializable object; the caller stringifies it inside a
 * <script type="application/ld+json"> tag.
 *
 * Fields:
 *   - headline / description / datePublished / dateModified — mandatory.
 *   - mainEntityOfPage — canonical URL of the post.
 *   - image — cover image when present, else /og?slug=<slug> fallback.
 *   - author — author_name + author_url when present.
 *   - publisher — Metaborong Organization stub.
 *   - keywords — post.tags joined.
 */
export function articleSchema({ post, imageUrl }: ArticleSchemaInput): Record<string, unknown> {
  const url = post.canonical_url ?? `${SITE_ORIGIN}/blog/${post.slug}/`
  const image = imageUrl ?? `${SITE_ORIGIN}/og?slug=${encodeURIComponent(post.slug)}`
  const description = post.meta_description ?? post.excerpt ?? post.title

  const author: Record<string, unknown> = {
    '@type': 'Person',
    name: post.author_name,
  }
  if (post.author_url) author.url = post.author_url

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.meta_title ?? post.title,
    description,
    image,
    datePublished: post.published_at ?? post.created_at,
    dateModified: post.updated_at,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    url,
    author,
    publisher: PUBLISHER,
    keywords: post.tags.length > 0 ? post.tags.join(', ') : undefined,
  }
}

interface BreadcrumbSchemaInput {
  /** The post's slug + title — the leaf of the trail. */
  post: Pick<Post, 'slug' | 'title'>
}

/**
 * Build a schema.org/BreadcrumbList for Home → Blog → Post. The breadcrumb
 * is the canonical SEO breadcrumb signal — Google uses it to render
 * site-hierarchy chips in the search snippet.
 */
export function breadcrumbSchema({ post }: BreadcrumbSchemaInput): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_ORIGIN,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${SITE_ORIGIN}/blog/`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `${SITE_ORIGIN}/blog/${post.slug}/`,
      },
    ],
  }
}
