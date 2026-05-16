import { describe, it, expect } from 'vitest'
import { markdownToBlocks } from '@/lib/markdown/markdown-to-blocks'
import type { Block } from '@/lib/blog-schema'

function blocks(md: string, opts: Parameters<typeof markdownToBlocks>[1] = {}): Block[] {
  const result = markdownToBlocks(md, opts)
  if (!result.ok) throw new Error(`expected ok, got ${result.code}: ${result.message}`)
  return result.blocks
}

describe('markdownToBlocks — single block types', () => {
  it('converts a paragraph', () => {
    const [b] = blocks('Hello world.')
    expect(b.type).toBe('paragraph')
    expect(b.type === 'paragraph' && b.data.text).toBe('Hello world.')
  })

  it('converts a level-2 heading', () => {
    const [b] = blocks('## My heading')
    expect(b.type).toBe('heading')
    expect(b.type === 'heading' && b.data.level).toBe(2)
    expect(b.type === 'heading' && b.data.text).toBe('My heading')
  })

  it('rejects H1 with INVALID_CONTENT', () => {
    const result = markdownToBlocks('# Nope')
    expect(result.ok).toBe(false)
    expect(!result.ok && result.code).toBe('INVALID_CONTENT')
    expect(!result.ok && result.message).toMatch(/H1 is reserved/)
  })

  it('converts unordered and ordered lists', () => {
    const [u, o] = blocks('- a\n- b\n\n1. x\n2. y')
    expect(u.type === 'list' && u.data.ordered).toBe(false)
    expect(u.type === 'list' && u.data.items).toEqual(['a', 'b'])
    expect(o.type === 'list' && o.data.ordered).toBe(true)
    expect(o.type === 'list' && o.data.items).toEqual(['x', 'y'])
  })

  it('converts a fenced code block with language', () => {
    const [b] = blocks('```ts\nconst x = 1\n```')
    expect(b.type === 'code' && b.data.lang).toBe('ts')
    expect(b.type === 'code' && b.data.code).toBe('const x = 1')
  })

  it('converts a fenced code block without language', () => {
    const [b] = blocks('```\nplain code\n```')
    expect(b.type === 'code' && b.data.lang).toBe('')
    expect(b.type === 'code' && b.data.code).toBe('plain code')
  })

  it('converts a plain quote with no cite', () => {
    const [b] = blocks('> the only way out is through')
    expect(b.type).toBe('quote')
    expect(b.type === 'quote' && b.data.text).toBe('the only way out is through')
    expect(b.type === 'quote' && b.data.cite).toBeUndefined()
  })

  it('converts a quote with a "— cite" line', () => {
    const [b] = blocks('> the only way out is through\n> — Robert Frost')
    expect(b.type === 'quote' && b.data.text).toBe('the only way out is through')
    expect(b.type === 'quote' && b.data.cite).toBe('Robert Frost')
  })

  it('converts an image with a UUID src', () => {
    const id = '11111111-1111-4111-a111-111111111111'
    const [b] = blocks(`![hero shot](${id})`)
    expect(b.type).toBe('image')
    expect(b.type === 'image' && b.data.imageId).toBe(id)
    expect(b.type === 'image' && b.data.alt).toBe('hero shot')
  })

  it('rejects an image with a non-UUID src', () => {
    const result = markdownToBlocks('![alt](https://example.com/x.jpg)')
    expect(result.ok).toBe(false)
    expect(!result.ok && result.message).toMatch(/UUID returned by cms_upload_image/)
  })

  it('rejects an image with empty alt', () => {
    const id = '11111111-1111-4111-a111-111111111111'
    const result = markdownToBlocks(`![](${id})`)
    expect(result.ok).toBe(false)
    expect(!result.ok && result.message).toMatch(/non-empty alt text/)
  })
})

describe('markdownToBlocks — admonitions', () => {
  it('converts [!tip] callout', () => {
    const [b] = blocks('> [!tip] cache-warm before deploy')
    expect(b.type).toBe('callout')
    expect(b.type === 'callout' && b.data.tone).toBe('tip')
    expect(b.type === 'callout' && b.data.text).toBe('cache-warm before deploy')
  })

  it('converts [!note] and [!warn] callouts', () => {
    const [n, w] = blocks('> [!note] heads up\n\n> [!warn] careful')
    expect(n.type === 'callout' && n.data.tone).toBe('note')
    expect(w.type === 'callout' && w.data.tone).toBe('warn')
  })

  it('admonition markers are case-insensitive (v2.2 N2 fix)', () => {
    // GitHub's own admonition syntax tolerates mixed case; the v1
    // converter required exactly [!tip]. After v2.2 [!TIP] / [!Tip] /
    // [!tIp] all resolve the same way.
    const [tipUpper, tipMixed, takeawayUpper, faqMixed] = blocks(
      '> [!TIP] upper-case tip\n\n' +
      '> [!Tip] title-case tip\n\n' +
      '> [!TAKEAWAY] upper-case takeaway\n\n' +
      '> [!Faq] What is X?\n> X is the answer.',
    )
    expect(tipUpper.type === 'callout' && tipUpper.data.tone).toBe('tip')
    expect(tipMixed.type === 'callout' && tipMixed.data.tone).toBe('tip')
    expect(takeawayUpper.type).toBe('key-takeaway')
    expect(faqMixed.type === 'faq' && faqMixed.data.question).toBe('What is X?')
  })

  it('converts [!takeaway] key-takeaway', () => {
    const [b] = blocks('> [!takeaway] ship draft-only via MCP')
    expect(b.type).toBe('key-takeaway')
    expect(b.type === 'key-takeaway' && b.data.text).toBe('ship draft-only via MCP')
  })

  it('converts [!faq] with Q on first line, A after newline', () => {
    const [b] = blocks('> [!faq] What is X?\n> X is the answer.')
    expect(b.type).toBe('faq')
    expect(b.type === 'faq' && b.data.question).toBe('What is X?')
    expect(b.type === 'faq' && b.data.answer).toBe('X is the answer.')
  })

  it('converts [!faq] with answer in a separate blockquote paragraph', () => {
    const [b] = blocks('> [!faq] Q?\n>\n> Multi-line answer goes here.')
    expect(b.type === 'faq' && b.data.question).toBe('Q?')
    expect(b.type === 'faq' && b.data.answer).toBe('Multi-line answer goes here.')
  })

  it('rejects [!faq] with no answer', () => {
    const result = markdownToBlocks('> [!faq] just a question?')
    expect(result.ok).toBe(false)
    expect(!result.ok && result.message).toMatch(/FAQ/)
  })
})

describe('markdownToBlocks — role hints', () => {
  it('applies an HTML-comment role to the next block', () => {
    const [b] = blocks('<!-- role: tldr -->\n\nThis is the tldr.')
    expect(b.role).toBe('tldr')
    expect(b.type).toBe('paragraph')
  })

  it('only applies the role to the IMMEDIATELY following block', () => {
    const [first, second] = blocks(
      '<!-- role: intro -->\n\nFirst paragraph.\n\nSecond paragraph.',
    )
    expect(first.role).toBe('intro')
    expect(second.role).toBeUndefined()
  })

  it('ignores an unknown role string', () => {
    const [b] = blocks('<!-- role: bogus -->\n\nParagraph.')
    expect(b.role).toBeUndefined()
  })

  it('block_roles override map wins over inline hint at same index', () => {
    const [b] = blocks(
      '<!-- role: intro -->\n\nA paragraph.',
      { blockRoles: { 0: 'tldr' } },
    )
    expect(b.role).toBe('tldr')
  })

  it('block_roles map applies even without inline hints', () => {
    const [a, b] = blocks(
      '## H\n\nBody.',
      { blockRoles: { 1: 'evidence' } },
    )
    expect(a.role).toBeUndefined()
    expect(b.role).toBe('evidence')
  })
})

describe('markdownToBlocks — edge cases', () => {
  it('skips empty paragraphs silently', () => {
    const all = blocks('First.\n\n\n\nSecond.')
    expect(all.length).toBe(2)
  })

  it('strips inline emphasis to plain text in paragraphs', () => {
    const [b] = blocks('Hello **bold** *italic* [linked](https://x.test) text.')
    expect(b.type === 'paragraph' && b.data.text).toBe('Hello bold italic linked text.')
  })

  it('emits at most one block for a single-image paragraph', () => {
    const id = '22222222-2222-4222-a222-222222222222'
    const all = blocks(`Intro line.\n\n![alt text](${id})\n\nOutro.`)
    expect(all.length).toBe(3)
    expect(all[1].type).toBe('image')
  })

  it('every emitted block has a non-empty unique id', () => {
    const all = blocks('## H\n\nP1\n\nP2\n\n- item\n\n```\ncode\n```')
    const ids = all.map((b) => b.id)
    expect(ids.every((id) => id && id.length > 0)).toBe(true)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('handles a quote that uses "--" instead of "—"', () => {
    const [b] = blocks('> wise words\n> -- the author')
    expect(b.type === 'quote' && b.data.cite).toBe('the author')
  })

  it('drops raw block-level HTML without erroring', () => {
    // mdast-util-from-markdown is CommonMark-only — no GFM table parsing —
    // so we only need to verify the HTML-drop path here.
    const md = '<div>not us</div>\n\nReal paragraph.'
    const all = blocks(md)
    expect(all.length).toBe(1)
    expect(all[0].type).toBe('paragraph')
    expect(all[0].type === 'paragraph' && all[0].data.text).toBe('Real paragraph.')
  })
})
