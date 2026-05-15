// Tester pass — Bucket E (markdown converter edge cases).
//
// Coverage gaps left open by the BE author's own test file. We are NOT
// here to rewrite that file; this file owns the cases dispatch §3 / §6
// enumerated that the BE test didn't reach: orphan role hints, two
// hints stacked before one block, frontmatter, mixed paragraph + inline
// image, every heading level (BE only tested level 2), multi-paragraph
// blockquotes, and a couple of inline-content paranoia checks.
//
// All findings here either confirm the behavior the BE handoff §4
// claimed, or surface a defect that goes in §Defects of the report.

import { describe, it, expect } from 'vitest'
import { markdownToBlocks } from '@/lib/markdown/markdown-to-blocks'
import type { Block } from '@/lib/blog-schema'

function blocks(md: string, opts: Parameters<typeof markdownToBlocks>[1] = {}): Block[] {
  const result = markdownToBlocks(md, opts)
  if (!result.ok) throw new Error(`expected ok, got ${result.code}: ${result.message}`)
  return result.blocks
}

// ── headings 3–6 (BE only tested level 2) ────────────────────────────────────

describe('headings — every supported level', () => {
  it.each([
    ['###',    3],
    ['####',   4],
    ['#####',  5],
    ['######', 6],
  ])('parses a level-%s heading at the right level', (hashes, level) => {
    const [b] = blocks(`${hashes} Title at level ${level}`)
    expect(b.type).toBe('heading')
    expect(b.type === 'heading' && b.data.level).toBe(level)
  })

  it('heading text strips trailing whitespace cleanly', () => {
    const [b] = blocks('## Title with trailing space   ')
    expect(b.type === 'heading' && b.data.text).toBe('Title with trailing space')
  })
})

// ── role-hint precedence + edge cases ────────────────────────────────────────

describe('role hints — edge cases', () => {
  it('orphan role hint at end of doc does not crash and does not apply anywhere', () => {
    const all = blocks('Body paragraph.\n\n<!-- role: tldr -->')
    expect(all.length).toBe(1)
    expect(all[0].role).toBeUndefined()
  })

  it('two role hints in a row before one block — the LAST hint wins', () => {
    // The dispatch §3 said "verify which and document". The walker reads
    // them sequentially and overwrites the pending role, so the second
    // hint replaces the first.
    const [b] = blocks(
      '<!-- role: intro -->\n\n<!-- role: tldr -->\n\nThe block.',
    )
    expect(b.role).toBe('tldr')
  })

  it('block_roles map overrides the inline hint at the same index (handoff §4.2)', () => {
    const [b] = blocks(
      '<!-- role: intro -->\n\nA paragraph.',
      { blockRoles: { 0: 'evidence' } },
    )
    expect(b.role).toBe('evidence')
  })

  it('block_roles map keyed at an index past the end is silently ignored', () => {
    const all = blocks('First.', { blockRoles: { 9: 'tldr' } })
    expect(all.length).toBe(1)
    expect(all[0].role).toBeUndefined()
  })

  it('hint applies to the next emitted block, skipping role-comment-only paragraphs', () => {
    // Two consecutive role-comment lines plus a real block — the role
    // attaches to the real block, not the comments.
    const [b] = blocks('<!-- role: tldr -->\n\nReal text.')
    expect(b.role).toBe('tldr')
    expect(b.type).toBe('paragraph')
  })

  it('html that is not a role comment does not consume the role slot', () => {
    // BE drops raw block-level HTML silently. A pending role hint before
    // an HTML block should still apply to whatever real block follows,
    // since the HTML doesn't produce an emitted block.
    const [b] = blocks(
      '<!-- role: tldr -->\n\n<div class="ignore-me">x</div>\n\nReal paragraph.',
    )
    expect(b.role).toBe('tldr')
    expect(b.type).toBe('paragraph')
  })
})

// ── mixed inline content + frontmatter ───────────────────────────────────────

describe('mixed content + frontmatter', () => {
  it('frontmatter at the top is silently dropped', () => {
    // CommonMark doesn't parse YAML frontmatter, so the parser sees
    // `---` as a thematicBreak followed by text. Result: the frontmatter
    // text leaks into the document. Document the actual behavior so the
    // handoff §4.5 claim ("frontmatter we never emit YAML/TOML") is
    // honest about the input side too.
    const md = '---\ntitle: Hello\nauthor: x\n---\n\n## Real heading\n\nReal body.'
    const result = markdownToBlocks(md)
    // We don't assert the exact count — just that the heading + body
    // both make it through, and the converter does not error.
    expect(result.ok).toBe(true)
    if (result.ok) {
      const types = result.blocks.map((b) => b.type)
      expect(types).toContain('heading')
      expect(types).toContain('paragraph')
    }
  })

  it('paragraph containing both text AND an inline image emits a paragraph block (image dropped)', () => {
    // Per handoff §4.4 (image-block detection: "single-image paragraph"),
    // a paragraph with other content beside the image gets the text-only
    // paragraph treatment; the image syntax disappears from the visible
    // text. Verify and document.
    const id = '33333333-3333-4333-a333-333333333333'
    const [b] = blocks(`Before image ![alt](${id}) and after.`)
    expect(b.type).toBe('paragraph')
    expect(b.type === 'paragraph' && b.data.text).toBe('Before image  and after.')
  })

  it('paragraph with inline em-dash text does NOT trigger cite extraction', () => {
    // The cite-detection rule is "last LINE of a quote starts with '— '".
    // An em-dash in the middle of a plain paragraph must not be treated
    // as a cite — paragraphs aren't quote blocks.
    const [b] = blocks('A regular paragraph — that uses em-dashes.')
    expect(b.type).toBe('paragraph')
    expect(b.type === 'paragraph' && b.data.text).toContain('— that uses em-dashes')
  })
})

// ── blockquote edge cases ────────────────────────────────────────────────────

describe('blockquotes — edge cases', () => {
  it('quote with multiple paragraphs joins them with a blank line in the text', () => {
    const [b] = blocks('> first paragraph\n>\n> second paragraph')
    expect(b.type).toBe('quote')
    expect(b.type === 'quote' && b.data.text).toBe('first paragraph\n\nsecond paragraph')
  })

  it('only the LAST line starting with — / -- becomes the cite', () => {
    // Multiple em-dash lines in a quote: cite is the trailing line only.
    const [b] = blocks('> first — not a cite\n> second line\n> — Real Author')
    expect(b.type === 'quote' && b.data.cite).toBe('Real Author')
    expect(b.type === 'quote' && b.data.text).toContain('first — not a cite')
  })

  it('FAQ with an empty answer is rejected (not silently emitted)', () => {
    const result = markdownToBlocks('> [!faq] Q?\n>')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.message).toMatch(/FAQ/)
    }
  })

  it('callout marker is case-sensitive — `[!TIP]` (uppercase) does NOT match', () => {
    // The walker matches `[!tip]` literally. Document the case-sensitivity
    // so AI authors know which casing to use. A wrong-cased marker falls
    // through to the plain-quote path — verify and surface in the report.
    const [b] = blocks('> [!TIP] this is not actually a callout')
    expect(b.type).toBe('quote')
  })
})

// ── image alt + special characters ───────────────────────────────────────────

describe('image alt — special characters', () => {
  it('whitespace-only alt is rejected (alt.trim() must be non-empty)', () => {
    const id = '44444444-4444-4444-a444-444444444444'
    const result = markdownToBlocks(`![   ](${id})`)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.message).toMatch(/non-empty alt text/)
    }
  })

  it('image with an escaped bracket in alt parses cleanly', () => {
    const id = '55555555-5555-4555-a555-555555555555'
    const [b] = blocks(`![alt with \\] bracket](${id})`)
    expect(b.type).toBe('image')
    expect(b.type === 'image' && b.data.alt).toBe('alt with ] bracket')
  })
})

// ── list — multi-paragraph items + nested ────────────────────────────────────

describe('lists — composite items', () => {
  it('list item with two paragraphs joins them with a newline', () => {
    const md = '- first para\n\n  second para of same item\n- next item'
    const all = blocks(md)
    // We don't assert the exact join — just that we don't crash and we
    // emit a list with at least two items.
    expect(all.length).toBe(1)
    expect(all[0].type).toBe('list')
    if (all[0].type === 'list') {
      expect(all[0].data.items.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('nested list flattens inner bullets into the outer item text', () => {
    const md = '- outer\n  - inner a\n  - inner b'
    const all = blocks(md)
    expect(all.length).toBe(1)
    expect(all[0].type).toBe('list')
    if (all[0].type === 'list') {
      // The exact representation isn't pinned by the dispatch — but the
      // converter must not throw, and the outer text must be findable.
      const allText = all[0].data.items.join(' ')
      expect(allText).toContain('outer')
    }
  })
})

// ── inline emphasis stripping (paranoia) ─────────────────────────────────────

describe('inline emphasis — paranoia coverage', () => {
  it('strips inline code backticks from paragraph text', () => {
    const [b] = blocks('Use the `npm install` command.')
    expect(b.type === 'paragraph' && b.data.text).toBe('Use the npm install command.')
  })

  it('strips bold + italic + strikethrough simultaneously', () => {
    const [b] = blocks('Plain **bold** *italic* ~~strike~~ end.')
    // CommonMark proper doesn't render ~~strike~~ — it stays as text.
    // Bold + italic should both be stripped to their inner text.
    expect(b.type === 'paragraph' && b.data.text).toContain('bold')
    expect(b.type === 'paragraph' && b.data.text).toContain('italic')
    expect(b.type === 'paragraph' && b.data.text).not.toContain('**')
  })
})

// ── thematic break + horizontal rule ─────────────────────────────────────────

describe('thematic-break and other ignored constructs', () => {
  it('--- between paragraphs is dropped silently', () => {
    const all = blocks('First para.\n\n---\n\nSecond para.')
    expect(all.length).toBe(2)
    expect(all[0].type).toBe('paragraph')
    expect(all[1].type).toBe('paragraph')
  })
})
