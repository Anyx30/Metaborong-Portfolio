// Block[] → markdown serializer.
//
// Walks a content_json array and emits CommonMark-flavored markdown. Used
// by app/blog/[slug]/raw.md/route.ts so LLM crawlers can fetch a clean
// markdown view of any published post for grounding (PRD §5.7 GEO bundle —
// the full /llms.txt + /llms-full.txt land in v1.5+, but per-post markdown
// is the foundation).
//
// Mapping (per M5-core BE prompt):
//   heading       → "#" repeated <level> times + space + text
//   paragraph     → text
//   list          → "- " or "1. " items, one per line
//   quote         → "> " prefixed line; "— cite" appended when present
//   code          → fenced ```lang\n<code>\n```
//   image         → ![alt](url)  (url is a placeholder until the caller
//                   passes a resolveImage fn; without one we emit
//                   ![alt](image:<imageId>) so the markdown is still
//                   self-describing for downstream tooling)
//   callout       → blockquote with tone prefix: "> [TIP] ..."
//   faq           → "**Q:** ...\n\n**A:** ..."
//   key-takeaway  → "> **Key:** ..."
//
// Output is "stable" — the same Block[] always serializes to byte-equal
// markdown so cache hits / hashes work cleanly.

import type { Block } from './blog-schema'

export interface BlocksToMdOptions {
  /**
   * Optional resolver for image-block ids → blob URLs. When omitted the
   * serializer falls back to image:<imageId> placeholders so the output
   * still round-trips.
   */
  resolveImage?: (imageId: string) => { src: string } | null
}

/**
 * Convert an array of blocks into a markdown document. Blocks are joined
 * with a blank line between them — standard markdown paragraph separator.
 */
export function blocksToMarkdown(blocks: Block[], opts: BlocksToMdOptions = {}): string {
  return blocks.map((b) => blockToMarkdown(b, opts)).filter(Boolean).join('\n\n')
}

function blockToMarkdown(block: Block, opts: BlocksToMdOptions): string {
  switch (block.type) {
    case 'heading': {
      const hashes = '#'.repeat(block.data.level)
      return `${hashes} ${block.data.text}`
    }
    case 'paragraph':
      return block.data.text
    case 'list': {
      return block.data.items
        .map((item, i) => (block.data.ordered ? `${i + 1}. ${item}` : `- ${item}`))
        .join('\n')
    }
    case 'quote': {
      const body = block.data.text
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n')
      return block.data.cite ? `${body}\n>\n> — ${block.data.cite}` : body
    }
    case 'code': {
      const lang = block.data.lang || ''
      return '```' + lang + '\n' + block.data.code + '\n```'
    }
    case 'image': {
      const resolved = opts.resolveImage?.(block.data.imageId)
      const url = resolved?.src ?? `image:${block.data.imageId}`
      const main = `![${escapeAlt(block.data.alt)}](${url})`
      return block.data.caption ? `${main}\n*${block.data.caption}*` : main
    }
    case 'callout': {
      const label = TONE_LABEL[block.data.tone]
      // Multi-line callouts: prefix each line with `> ` so markdown
      // renderers keep them inside the same blockquote.
      return block.data.text
        .split('\n')
        .map((line, i) => (i === 0 ? `> [${label}] ${line}` : `> ${line}`))
        .join('\n')
    }
    case 'faq':
      return `**Q:** ${block.data.question}\n\n**A:** ${block.data.answer}`
    case 'key-takeaway':
      return `> **Key:** ${block.data.text}`
  }
}

const TONE_LABEL: Record<'tip' | 'warn' | 'note', string> = {
  tip:  'TIP',
  warn: 'WARN',
  note: 'NOTE',
}

// Alt text gets embedded inside `![ ... ]`; ] would close the bracket and
// break the image syntax. Escape just enough to keep markdown valid; we
// don't try to round-trip arbitrary punctuation.
function escapeAlt(alt: string): string {
  return alt.replace(/\]/g, '\\]')
}

/**
 * Derive a short plain-text description from a Block[] for surfaces that
 * cannot render markdown — RSS `<description>`, social preview cards, llms.txt
 * one-liners.
 *
 * Walks blocks in order, picks the first text-bearing block (preferring an
 * intro/tldr-roled paragraph), strips markdown decorations, and truncates to
 * `maxChars` at a word boundary so partial words don't spill out.
 */
export function deriveTextDescription(blocks: Block[], maxChars = 280): string {
  if (!blocks || blocks.length === 0) return ''

  // Prefer a block with role 'tldr' or 'intro' if any; otherwise first
  // text-bearing block.
  const candidate =
    blocks.find((b) => b.role === 'tldr' && hasText(b)) ??
    blocks.find((b) => b.role === 'intro' && hasText(b)) ??
    blocks.find(hasText)

  if (!candidate) return ''
  const raw = pickText(candidate)
  return truncateAtWord(raw, maxChars)
}

function hasText(block: Block): boolean {
  switch (block.type) {
    case 'paragraph':
    case 'heading':
    case 'quote':
    case 'callout':
    case 'key-takeaway':
      return Boolean(block.data.text && block.data.text.trim())
    case 'faq':
      return Boolean(block.data.answer && block.data.answer.trim())
    case 'list':
      return block.data.items.some((it) => it.trim().length > 0)
    default:
      return false
  }
}

function pickText(block: Block): string {
  switch (block.type) {
    case 'paragraph':
    case 'heading':
    case 'quote':
    case 'callout':
    case 'key-takeaway':
      return block.data.text
    case 'faq':
      return block.data.answer
    case 'list':
      return block.data.items.join(' ')
    default:
      return ''
  }
}

function truncateAtWord(input: string, maxChars: number): string {
  // Collapse all whitespace (including newlines) into single spaces so
  // line breaks in source markdown don't show up as literal newlines in
  // a single-line description.
  const flat = input.replace(/\s+/g, ' ').trim()
  if (flat.length <= maxChars) return flat
  const cut = flat.slice(0, maxChars)
  const lastSpace = cut.lastIndexOf(' ')
  // If we couldn't find a space to break on, hard-cut.
  const trimmed = lastSpace > maxChars * 0.6 ? cut.slice(0, lastSpace) : cut
  return trimmed.replace(/[\s,;:.\-—]+$/, '') + '…'
}
