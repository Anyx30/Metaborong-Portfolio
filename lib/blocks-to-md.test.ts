// Round-trip tests for the Block[] → markdown serializer.
//
// We don't test the markdown rendering pipeline here — just that every
// block type maps to its expected stable string. If output drifts, hashes
// of the markdown change and downstream cache layers (LLM ingestion, raw
// md route) re-serve unnecessarily.

import { describe, expect, it } from 'vitest'
import { blocksToMarkdown, deriveTextDescription } from './blocks-to-md'
import type { Block } from './blog-schema'

describe('blocksToMarkdown', () => {
  it('serializes a heading block with the right number of hashes', () => {
    const blocks: Block[] = [
      { id: '1', type: 'heading', data: { text: 'Section', level: 2 } },
      { id: '2', type: 'heading', data: { text: 'Subsection', level: 3 } },
    ]
    expect(blocksToMarkdown(blocks)).toBe('## Section\n\n### Subsection')
  })

  it('serializes a paragraph as raw text', () => {
    const blocks: Block[] = [{ id: '1', type: 'paragraph', data: { text: 'Hello world.' } }]
    expect(blocksToMarkdown(blocks)).toBe('Hello world.')
  })

  it('serializes ordered and unordered lists', () => {
    const blocks: Block[] = [
      { id: '1', type: 'list', data: { ordered: false, items: ['one', 'two'] } },
      { id: '2', type: 'list', data: { ordered: true,  items: ['first', 'second'] } },
    ]
    expect(blocksToMarkdown(blocks)).toBe('- one\n- two\n\n1. first\n2. second')
  })

  it('serializes a quote, optionally with cite', () => {
    const a: Block[] = [{ id: '1', type: 'quote', data: { text: 'Be brave.' } }]
    expect(blocksToMarkdown(a)).toBe('> Be brave.')
    const b: Block[] = [{ id: '1', type: 'quote', data: { text: 'Be brave.', cite: 'A. Wise' } }]
    expect(blocksToMarkdown(b)).toBe('> Be brave.\n>\n> — A. Wise')
  })

  it('serializes a fenced code block with language hint', () => {
    const blocks: Block[] = [{ id: '1', type: 'code', data: { lang: 'ts', code: 'const x = 1' } }]
    expect(blocksToMarkdown(blocks)).toBe('```ts\nconst x = 1\n```')
  })

  it('serializes a code block without a language', () => {
    const blocks: Block[] = [{ id: '1', type: 'code', data: { lang: '', code: 'plain' } }]
    expect(blocksToMarkdown(blocks)).toBe('```\nplain\n```')
  })

  it('serializes an image with placeholder when no resolver supplied', () => {
    const blocks: Block[] = [
      { id: '1', type: 'image', data: { imageId: '11111111-1111-1111-1111-111111111111', alt: 'cover' } },
    ]
    expect(blocksToMarkdown(blocks)).toBe('![cover](image:11111111-1111-1111-1111-111111111111)')
  })

  it('serializes an image with a resolved URL when resolver present', () => {
    const blocks: Block[] = [
      { id: '1', type: 'image', data: { imageId: 'abc', alt: 'cover', caption: 'A nice photo' } },
    ]
    const out = blocksToMarkdown(blocks, {
      resolveImage: (id) => (id === 'abc' ? { src: 'https://cdn/foo.jpg' } : null),
    })
    expect(out).toBe('![cover](https://cdn/foo.jpg)\n*A nice photo*')
  })

  it('escapes "]" in image alt text', () => {
    const blocks: Block[] = [
      { id: '1', type: 'image', data: { imageId: 'a', alt: 'before ] after' } },
    ]
    expect(blocksToMarkdown(blocks)).toBe('![before \\] after](image:a)')
  })

  it('serializes callouts with a tone prefix', () => {
    const blocks: Block[] = [
      { id: '1', type: 'callout', data: { tone: 'tip',  text: 'Try this.' } },
      { id: '2', type: 'callout', data: { tone: 'warn', text: 'Careful.'  } },
      { id: '3', type: 'callout', data: { tone: 'note', text: 'Aside.'    } },
    ]
    expect(blocksToMarkdown(blocks)).toBe(
      '> [TIP] Try this.\n\n> [WARN] Careful.\n\n> [NOTE] Aside.',
    )
  })

  it('serializes a multi-line callout with prefix on the first line only', () => {
    const blocks: Block[] = [
      { id: '1', type: 'callout', data: { tone: 'tip', text: 'Line one\nLine two' } },
    ]
    expect(blocksToMarkdown(blocks)).toBe('> [TIP] Line one\n> Line two')
  })

  it('serializes an FAQ as Q/A pair', () => {
    const blocks: Block[] = [
      { id: '1', type: 'faq', data: { question: 'Why?', answer: 'Because.' } },
    ]
    expect(blocksToMarkdown(blocks)).toBe('**Q:** Why?\n\n**A:** Because.')
  })

  it('serializes a key-takeaway as a bold blockquote', () => {
    const blocks: Block[] = [
      { id: '1', type: 'key-takeaway', data: { text: 'Ship small.' } },
    ]
    expect(blocksToMarkdown(blocks)).toBe('> **Key:** Ship small.')
  })

  it('round-trips a representative content_json with one of each block type', () => {
    const blocks: Block[] = [
      { id: '1', type: 'heading',     data: { text: 'Intro', level: 2 } },
      { id: '2', type: 'paragraph',   data: { text: 'A thing.' } },
      { id: '3', type: 'list',        data: { ordered: false, items: ['a', 'b'] } },
      { id: '4', type: 'quote',       data: { text: 'Be bold.', cite: 'X' } },
      { id: '5', type: 'code',        data: { lang: 'js', code: 'console.log(1)' } },
      { id: '6', type: 'image',       data: { imageId: 'img1', alt: 'shot' } },
      { id: '7', type: 'callout',     data: { tone: 'note', text: 'remember' } },
      { id: '8', type: 'faq',         data: { question: 'Q', answer: 'A' } },
      { id: '9', type: 'key-takeaway', data: { text: 'TLDR' } },
    ]
    const md = blocksToMarkdown(blocks)
    // Stable: serializing twice must produce identical output.
    expect(blocksToMarkdown(blocks)).toBe(md)
    // Basic structural sanity — every block contributes a non-empty chunk.
    expect(md.split('\n\n').length).toBeGreaterThanOrEqual(blocks.length)
    expect(md).toContain('## Intro')
    expect(md).toContain('- a')
    expect(md).toContain('```js')
    expect(md).toContain('![shot]')
    expect(md).toContain('> [NOTE]')
    expect(md).toContain('**Q:** Q')
    expect(md).toContain('> **Key:** TLDR')
  })

  it('returns an empty string for an empty block array', () => {
    expect(blocksToMarkdown([])).toBe('')
  })
})

describe('deriveTextDescription', () => {
  it('returns "" for an empty content_json', () => {
    expect(deriveTextDescription([])).toBe('')
  })

  it('prefers a tldr-roled block over earlier text', () => {
    const blocks: Block[] = [
      { id: '1', type: 'paragraph', data: { text: 'Some intro paragraph.' } },
      { id: '2', type: 'paragraph', role: 'tldr', data: { text: 'The summary.' } },
    ]
    expect(deriveTextDescription(blocks)).toBe('The summary.')
  })

  it('prefers an intro-roled block over the first text-bearing block', () => {
    const blocks: Block[] = [
      { id: '1', type: 'heading', data: { text: 'Section', level: 2 } },
      { id: '2', type: 'paragraph', role: 'intro', data: { text: 'The intro text.' } },
      { id: '3', type: 'paragraph', data: { text: 'Body text.' } },
    ]
    expect(deriveTextDescription(blocks)).toBe('The intro text.')
  })

  it('falls back to the first text-bearing block when no roles are set', () => {
    const blocks: Block[] = [
      { id: '1', type: 'paragraph', data: { text: 'First paragraph.' } },
    ]
    expect(deriveTextDescription(blocks)).toBe('First paragraph.')
  })

  it('truncates at a word boundary near maxChars and appends an ellipsis', () => {
    const long = 'word '.repeat(80).trim() // ~400 chars
    const blocks: Block[] = [
      { id: '1', type: 'paragraph', data: { text: long } },
    ]
    const out = deriveTextDescription(blocks, 50)
    expect(out.length).toBeLessThanOrEqual(51)
    expect(out.endsWith('…')).toBe(true)
    expect(out).not.toMatch(/wor…$/) // didn't cut mid-word
  })

  it('collapses internal whitespace into single spaces', () => {
    const blocks: Block[] = [
      { id: '1', type: 'paragraph', data: { text: 'line one\n\nline two\twith\ttabs' } },
    ]
    expect(deriveTextDescription(blocks)).toBe('line one line two with tabs')
  })

  it('extracts FAQ answer text', () => {
    const blocks: Block[] = [
      { id: '1', type: 'faq', data: { question: 'Q?', answer: 'The answer to it.' } },
    ]
    expect(deriveTextDescription(blocks)).toBe('The answer to it.')
  })

  it('joins list items with spaces', () => {
    const blocks: Block[] = [
      { id: '1', type: 'list', data: { ordered: false, items: ['alpha', 'beta', 'gamma'] } },
    ]
    expect(deriveTextDescription(blocks)).toBe('alpha beta gamma')
  })
})
