// /llms.txt — llmstxt.org-format index of every published post.
//
// This is the GEO surface for LLM crawlers (Perplexity, ChatGPT search,
// Google AIO/AI Mode). The companion /llms-full.txt route emits the same
// header followed by full markdown bodies; per-post grounding lives at
// /blog/{slug}/raw.md (M5-core).
//
// Format (https://llmstxt.org/):
//
//   # Metaborong
//   > One-line site description.
//
//   ## Posts
//
//   - [Post Title](https://www.metaborong.com/blog/<slug>/): one-line tldr
//   - …
//
// One bullet per published post, newest first. Region-neutral — geo
// variants don't expand into separate entries; the user-region resolver
// applies at /blog/{slug} request time, not at index emission time.

import { listAllPublishedForLlms } from '@/lib/posts'
import { deriveTextDescription } from '@/lib/blocks-to-md'

const SITE_ORIGIN = 'https://www.metaborong.com'
const SITE_TITLE = 'Metaborong'
const SITE_DESCRIPTION =
  'Metaborong is a Web3 development company and AI agent studio that builds DeFi protocols, autonomous AI systems, and custom SaaS products for founders and crypto-native teams.'

// Soft cap for the per-post tldr line. Long enough for a useful sentence,
// short enough that a 200-post catalog stays under a few hundred KB.
const TLDR_MAX_CHARS = 140

export async function GET(): Promise<Response> {
  const items = await listAllPublishedForLlms()

  const lines: string[] = [
    `# ${SITE_TITLE}`,
    `> ${SITE_DESCRIPTION}`,
    '',
    '## Posts',
    '',
  ]

  if (items.length === 0) {
    lines.push('- No posts yet.')
  } else {
    for (const p of items) {
      const tldr = pickTldr(p)
      const safeTitle = escapeMarkdownTitle(p.title)
      const url = `${SITE_ORIGIN}/blog/${p.slug}/`
      lines.push(`- [${safeTitle}](${url}): ${tldr}`)
    }
  }
  lines.push('')

  return new Response(lines.join('\n'), {
    status: 200,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400',
    },
  })
}

interface LlmsItem {
  title: string
  excerpt: string | null
  meta_description: string | null
  content_json: import('@/lib/blog-schema').Post['content_json']
}

// Bullet tldr precedence: editor-written excerpt → meta_description →
// derived snippet from the body → finally the title (so we never emit
// an empty trailing colon).
function pickTldr(p: LlmsItem): string {
  const candidates = [
    p.excerpt?.trim(),
    p.meta_description?.trim(),
    deriveTextDescription(p.content_json, TLDR_MAX_CHARS),
    p.title,
  ]
  for (const c of candidates) {
    if (c && c.length > 0) return truncateOneLine(c, TLDR_MAX_CHARS)
  }
  return p.title
}

// Markdown bullet line is `- [title](url): tldr`. Inside the brackets,
// `]` would close the link text early; inside the parens, `(` and `)`
// would close the URL early. Backslash-escape both so titles round-trip
// without breaking the link syntax.
function escapeMarkdownTitle(title: string): string {
  return title
    .replace(/\\/g, '\\\\')
    .replace(/\]/g, '\\]')
    .replace(/\[/g, '\\[')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
}

// The tldr lives on a single bullet line — collapse newlines so a
// multi-paragraph excerpt doesn't break the list structure, and cap at
// `max` chars so absurdly long meta_descriptions don't bloat the index.
function truncateOneLine(s: string, max: number): string {
  const flat = s.replace(/\s+/g, ' ').trim()
  if (flat.length <= max) return flat
  const cut = flat.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  const trimmed = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut
  return trimmed.replace(/[\s,;:.\-—]+$/, '') + '…'
}
