// RSS 2.0 feed for /blog. Generated from listPublishedPosts() (the same
// helper /blog uses), so the feed is always in sync with what's public.
//
// Reachable at /blog/rss.xml. Linked from the /blog header per M5-core.

import { listPublishedPosts } from '@/lib/posts'

const SITE_ORIGIN = 'https://www.metaborong.com'
const FEED_TITLE = 'Metaborong — Field notes from the studio'
const FEED_DESC =
  'Web3 protocol design, AI agent architecture, and the messy product decisions in between.'

// Light XML escape — we're emitting XML by hand, so user content (titles,
// excerpts, tags) must have <, >, &, ', " escaped before interpolation.
function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export const revalidate = 60

export async function GET(): Promise<Response> {
  // Up to 50 most-recent published posts. Bigger feeds rarely render in
  // readers and add ISR cost; if the back catalog grows past that, we can
  // start splitting feeds by tag.
  const result = await listPublishedPosts({ page: 1, perPage: 50 })

  const lastBuild = result.posts[0]?.published_at ?? new Date().toISOString()

  const items = result.posts
    .map((p) => {
      const url = `${SITE_ORIGIN}/blog/${p.slug}/`
      const pub = p.published_at
        ? new Date(p.published_at).toUTCString()
        : new Date().toUTCString()
      const categories = p.tags
        .map((t) => `      <category>${xmlEscape(t)}</category>`)
        .join('\n')
      return [
        '    <item>',
        `      <title>${xmlEscape(p.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${pub}</pubDate>`,
        categories,
        '    </item>',
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n')

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n` +
    `  <channel>\n` +
    `    <title>${xmlEscape(FEED_TITLE)}</title>\n` +
    `    <link>${SITE_ORIGIN}/blog/</link>\n` +
    `    <description>${xmlEscape(FEED_DESC)}</description>\n` +
    `    <language>en-us</language>\n` +
    `    <lastBuildDate>${new Date(lastBuild).toUTCString()}</lastBuildDate>\n` +
    `    <atom:link href="${SITE_ORIGIN}/blog/rss.xml" rel="self" type="application/rss+xml" />\n` +
    `${items ? items + '\n' : ''}` +
    `  </channel>\n` +
    `</rss>\n`

  return new Response(xml, {
    headers: {
      'content-type': 'application/rss+xml; charset=utf-8',
      'cache-control': 'public, s-maxage=60, stale-while-revalidate=3600',
    },
  })
}
