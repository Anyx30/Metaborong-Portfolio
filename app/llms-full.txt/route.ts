// /llms-full.txt — llmstxt.org-format index PLUS full markdown body for
// every published post.
//
// One-shot grounding bundle for LLM crawlers. The lighter /llms.txt route
// is the index-only companion; per-post markdown still lives at
// /blog/{slug}/raw.md for crawlers that prefer to fetch a single post.
//
// Format:
//
//   # Metaborong
//   > One-line site description.
//
//   ## Posts
//
//   ### Post Title 1
//
//   URL: https://www.metaborong.com/blog/<slug-1>/
//   Published: <YYYY-MM-DD>
//   Author: <author_name>
//
//   <full markdown body via blocksToMarkdown(post.content_json)>
//
//   ---
//
//   ### Post Title 2
//   …
//
// Heading hierarchy is intentionally flat (### per post regardless of
// what the body contains). The dispatch chose option (b) — accept the
// cosmetic oddity of a body that contains its own H1 sitting under the
// post's H3 heading; LLM crawlers consume the plain-text content and
// don't care about heading nesting. Demoting body headings is flagged
// as v1.6 polish.

import { listAllPublishedForLlms } from '@/lib/posts'
import { blocksToMarkdown } from '@/lib/blocks-to-md'

const SITE_ORIGIN = 'https://www.metaborong.com'
const SITE_TITLE = 'Metaborong'
const SITE_DESCRIPTION =
  'Metaborong is a Web3 development company and AI agent studio that builds DeFi protocols, autonomous AI systems, and custom SaaS products for founders and crypto-native teams.'

// Conservative size guard. Most LLMs cap a single fetch at 1–2 MB of
// context; 5 MB is the threshold above which we surface a "consider
// per-post fetching via raw.md" hint at the top of the body. We never
// truncate — the spec is silent and clipping would make the bundle
// silently incomplete, which is worse than oversized.
const SIZE_WARN_BYTES = 5 * 1024 * 1024

export async function GET(): Promise<Response> {
  const items = await listAllPublishedForLlms()

  const headerLines: string[] = [
    `# ${SITE_TITLE}`,
    `> ${SITE_DESCRIPTION}`,
    '',
    '## Posts',
    '',
  ]

  // Build each post block.
  const postBlocks = items.map(serializePostBlock)

  // The "---" separator goes between adjacent posts, not after the last
  // one — it'd otherwise produce a trailing rule that some markdown
  // parsers render as an empty thematic break.
  const body = postBlocks.join('\n\n---\n\n')

  // Probe size of the assembled output so we can prepend the warning
  // line atomically (otherwise we'd have to re-walk the post list).
  const headerBlob = headerLines.join('\n') + (body ? '\n' + body + '\n' : '')
  const headerBytes = Buffer.byteLength(headerBlob, 'utf8')

  let finalBody: string
  if (headerBytes > SIZE_WARN_BYTES) {
    const warning = [
      '> Note: post catalog exceeds 5 MB; consider per-post fetching via',
      '> /blog/<slug>/raw.md (link rel=alternate).',
      '',
    ].join('\n')
    // Insert warning right after the title block, before "## Posts" so a
    // crawler reading top-down sees it first.
    finalBody = [
      `# ${SITE_TITLE}`,
      `> ${SITE_DESCRIPTION}`,
      '',
      warning,
      '## Posts',
      '',
    ].join('\n') + (body ? body + '\n' : '')
  } else {
    finalBody = headerBlob
  }

  return new Response(finalBody, {
    status: 200,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400',
    },
  })
}

interface FullItem {
  slug: string
  title: string
  published_at: string | null
  updated_at: string
  author_name: string
  content_json: import('@/lib/blog-schema').Post['content_json']
}

function serializePostBlock(p: FullItem): string {
  const url = `${SITE_ORIGIN}/blog/${p.slug}/`
  // ISO 8601 calendar date (YYYY-MM-DD) — locale-independent so a crawler
  // in any region parses it the same way.
  const publishedDate = p.published_at
    ? toIsoDate(p.published_at)
    : toIsoDate(p.updated_at)
  const lines: string[] = [
    `### ${escapeHeadingTitle(p.title)}`,
    '',
    `URL: ${url}`,
    `Published: ${publishedDate}`,
    `Author: ${escapeMetaLine(p.author_name)}`,
    '',
    blocksToMarkdown(p.content_json),
  ]
  return lines.join('\n')
}

// Strip newlines so a freak title with an embedded newline doesn't break
// the post-block boundary. Backslashes pass through; markdown's heading
// syntax doesn't reserve `[`, `]`, `(`, `)` so we don't escape those.
function escapeHeadingTitle(title: string): string {
  return title.replace(/\s+/g, ' ').trim()
}

// Same flatten for the "Author:" and similar single-line meta fields.
function escapeMetaLine(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function toIsoDate(iso: string): string {
  // Strings come from toIsoString() upstream so they always have a `T`;
  // splitting at T is safe and locale-independent.
  return iso.slice(0, 10)
}
