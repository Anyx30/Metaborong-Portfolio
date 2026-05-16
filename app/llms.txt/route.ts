// /llms.txt — llmstxt.org-format index for the whole site.
//
// One comprehensive GEO surface for LLM crawlers (Perplexity, ChatGPT
// search, Google AIO/AI Mode): company facts + services + FAQs (static,
// from the marketing data) followed by every published blog post. The
// companion /llms-full.txt route emits full post bodies; per-post
// grounding lives at /blog/{slug}/raw.md (M5-core).
//
// Reads published posts from the DB, so this route is ISR (revalidate
// 300s) rather than force-static.

import { pillars } from '@/components/sections/services-data'
import { faqs } from '@/components/sections/faq-data'
import { SITE_ORIGIN } from '@/lib/seo'
import { listAllPublishedForLlms } from '@/lib/posts'
import { deriveTextDescription } from '@/lib/blocks-to-md'

export const revalidate = 300

// Soft cap for the per-post tldr line. Long enough for a useful sentence,
// short enough that a 200-post catalog stays under a few hundred KB.
const TLDR_MAX_CHARS = 140

export async function GET(): Promise<Response> {
  const lines: string[] = []

  lines.push('# Metaborong')
  lines.push('')
  lines.push('> Metaborong is a Web3 development company and AI agent studio. A remote-first team of senior engineers, globally distributed. We ship DeFi protocols and smart contract audits, AI agents spanning agentic workflows and generative systems, and full-stack SaaS for founders and early-stage startups. Spec to production, fast.')
  lines.push('')

  lines.push('## Key facts')
  lines.push('- Founded by three technical co-founders: Arnab Ray (CEO), Anik Ghosh (COO), Soumojit Ash (CTO).')
  lines.push('- Remote-first and globally distributed; no single head office.')
  lines.push('- Direct contact: contact@metaborong.com — no account managers, no pitch decks.')
  lines.push('- Typical project duration: 4–12 weeks; smart contract audits and AI integrations deliver in 4–6 weeks.')
  lines.push('- 8+ products shipped in production across DeFi, gaming, AI, and SaaS.')
  lines.push('- Three service pillars: Web3/Blockchain, AI Agents, and Product Studio.')
  lines.push('')

  lines.push('## Main pages')
  lines.push(`- [Homepage](${SITE_ORIGIN}/): Studio overview, services, work, team, and FAQs.`)
  lines.push(`- [Blog](${SITE_ORIGIN}/blog/): Articles on Web3, AI agents, and product engineering.`)
  lines.push('')

  lines.push('## Services')
  for (const p of pillars) {
    lines.push(`### ${p.label}`)
    lines.push(`${p.body}`)
    lines.push('')
    for (const c of p.children) {
      lines.push(`- **${c.name}** — ${c.description}`)
    }
    lines.push('')
  }

  lines.push('## Frequently asked questions')
  for (const f of faqs) {
    lines.push(`### ${f.q}`)
    lines.push(f.a)
    lines.push('')
  }

  lines.push('## Posts')
  lines.push('')
  const items = await listAllPublishedForLlms()
  if (items.length === 0) {
    lines.push('- No posts yet.')
  } else {
    for (const p of items) {
      const tldr = pickTldr(p)
      const safeTitle = escapeMarkdownTitle(p.title)
      lines.push(`- [${safeTitle}](${SITE_ORIGIN}/blog/${p.slug}/): ${tldr}`)
    }
  }
  lines.push('')

  lines.push('## Contact')
  lines.push('- Email: contact@metaborong.com')
  lines.push('- LinkedIn: https://linkedin.com/company/metaborong-technologies')
  lines.push('- X (Twitter): https://x.com/Metaborong')
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
  slug: string
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
