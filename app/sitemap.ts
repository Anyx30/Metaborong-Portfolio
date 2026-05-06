// Next.js convention: app/sitemap.ts → /sitemap.xml.
//
// Lists the homepage and every published post URL. Pages through
// listPublishedPosts() so a catalog larger than perPage still emits a
// complete sitemap. lastmod = post.updated_at so freshness signals stay
// honest (PRD §5.7 — LLMs use freshness signals).
//
// Regenerated on the same revalidate cadence as /blog (60s).

import type { MetadataRoute } from 'next'
import { listPublishedPosts } from '@/lib/posts'
import { SITE_ORIGIN } from '@/lib/seo'

export const revalidate = 60

const PAGE_SIZE = 50

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: `${SITE_ORIGIN}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_ORIGIN}/blog/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  // Walk all published posts in pages of PAGE_SIZE so even a back catalog
  // beyond a single page is fully covered. Cursor walk continues until the
  // helper signals !hasMore. A pathological infinite loop would still bail
  // at 200 pages = 10k posts (well above v1 expectations).
  for (let page = 1; page <= 200; page++) {
    const result = await listPublishedPosts({ page, perPage: PAGE_SIZE })
    for (const post of result.posts) {
      entries.push({
        url: `${SITE_ORIGIN}/blog/${post.slug}/`,
        lastModified: post.updated_at ? new Date(post.updated_at) : undefined,
        changeFrequency: 'monthly',
        priority: 0.7,
      })
    }
    if (!result.hasMore) break
  }

  return entries
}
