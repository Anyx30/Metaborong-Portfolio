import { describe, expect, it } from 'vitest'
import {
  blocksToEditorState,
  editorStateToBlocks,
  emptyEditorDoc,
  NODE_NAMES,
} from './serialize'
import {
  blockSchema,
  contentJsonSchema,
  validateContentJson,
  type Block,
} from '@/lib/blog-schema'

// ── per-block-type round-trip identity fixtures ────────────────────────────

const fixtures: Record<string, Block> = {
  heading: {
    id: 'h1', type: 'heading', role: 'intro',
    data: { text: 'Why we shipped', level: 2, anchor: 'why-we-shipped' },
  },
  'heading-no-anchor': {
    id: 'h2', type: 'heading',
    data: { text: 'Section A', level: 3 },
  },
  paragraph: {
    id: 'p1', type: 'paragraph', role: 'tldr',
    data: { text: 'A succinct summary that AI overviews can lift verbatim.' },
  },
  image: {
    id: 'i1', type: 'image',
    data: {
      imageId: '550e8400-e29b-41d4-a716-446655440000',
      alt: 'A product diagram',
      caption: 'Figure 1',
    },
  },
  'image-no-caption': {
    id: 'i2', type: 'image', role: 'evidence',
    data: { imageId: '550e8400-e29b-41d4-a716-446655440001', alt: 'Bare diagram' },
  },
  list: {
    id: 'l1', type: 'list', role: 'step',
    data: { ordered: true, items: ['First', 'Second', 'Third'] },
  },
  'list-unordered': {
    id: 'l2', type: 'list',
    data: { ordered: false, items: ['One', 'Two'] },
  },
  quote: {
    id: 'q1', type: 'quote',
    data: { text: 'Standards are how we collaborate.', cite: 'Tim Berners-Lee' },
  },
  'quote-no-cite': {
    id: 'q2', type: 'quote',
    data: { text: 'No source.' },
  },
  code: {
    id: 'c1', type: 'code',
    data: { lang: 'ts', code: 'const x: number = 1\nconsole.log(x)' },
  },
  callout: {
    id: 'cl1', type: 'callout',
    data: { tone: 'warn', text: 'Hot takes ahead.' },
  },
  faq: {
    id: 'f1', type: 'faq',
    data: { question: 'What is GEO?', answer: 'Generative Engine Optimization.' },
  },
  'key-takeaway': {
    id: 'kt1', type: 'key-takeaway', role: 'definition',
    data: { text: 'GEO is SEO for LLM citation.' },
  },
}

describe('serialize: round-trip identity per block type', () => {
  for (const [name, block] of Object.entries(fixtures)) {
    it(`round-trips ${name}`, () => {
      const doc = blocksToEditorState([block])
      expect(doc.type).toBe('doc')
      expect(doc.content?.length).toBe(1)
      const back = editorStateToBlocks(doc)
      expect(back).toEqual([block])
    })
  }

  it('round-trips a multi-block document preserving order', () => {
    const blocks: Block[] = [
      fixtures['heading'],
      fixtures['paragraph'],
      fixtures['image'],
      fixtures['list'],
      fixtures['quote'],
      fixtures['code'],
      fixtures['callout'],
      fixtures['faq'],
      fixtures['key-takeaway'],
    ]
    const doc = blocksToEditorState(blocks)
    expect(doc.content?.length).toBe(9)
    expect(editorStateToBlocks(doc)).toEqual(blocks)
  })

  it('preserves role on round-trip when set', () => {
    const back = editorStateToBlocks(blocksToEditorState([fixtures['paragraph']]))
    expect(back[0].role).toBe('tldr')
  })

  it('omits role on round-trip when unset', () => {
    const back = editorStateToBlocks(blocksToEditorState([fixtures['heading-no-anchor']]))
    expect('role' in back[0]).toBe(false)
  })

  it('produces an empty doc for empty input', () => {
    expect(blocksToEditorState([])).toEqual({ type: 'doc', content: [] })
    expect(editorStateToBlocks({ type: 'doc', content: [] })).toEqual([])
  })

  it('emptyEditorDoc helper returns an empty doc the editor can boot from', () => {
    expect(emptyEditorDoc()).toEqual({ type: 'doc', content: [] })
  })

  it('uses mb-prefixed node names so we never clash with Tiptap defaults', () => {
    const doc = blocksToEditorState([fixtures['paragraph'], fixtures['list']])
    const types = (doc.content ?? []).map((n) => n.type)
    expect(types).toEqual([NODE_NAMES.paragraph, NODE_NAMES.list])
    for (const t of types) expect(t.startsWith('mb')).toBe(true)
  })
})

// ── schema validation guards (heading level / image alt / tldr cardinality) ──

describe('serialize → schema validation', () => {
  it('rejects level=1 in a heading block (Zod)', () => {
    const bad = {
      id: 'h-bad', type: 'heading',
      data: { text: 'Should be h1', level: 1 },
    }
    const parse = blockSchema.safeParse(bad)
    expect(parse.success).toBe(false)
  })

  it('accepts level=2..6 in heading blocks', () => {
    for (const level of [2, 3, 4, 5, 6] as const) {
      const ok = blockSchema.safeParse({
        id: `h-${level}`, type: 'heading', data: { text: 'ok', level },
      })
      expect(ok.success).toBe(true)
    }
  })

  it('rejects an image block with empty alt', () => {
    const bad = {
      id: 'i-bad', type: 'image',
      data: { imageId: '00000000-0000-0000-0000-000000000099', alt: '' },
    }
    const parse = blockSchema.safeParse(bad)
    expect(parse.success).toBe(false)
  })

  it('flags a second tldr role via validateContentJson but does not throw', () => {
    const blocks: Block[] = [
      { id: 'p1', type: 'paragraph', role: 'tldr', data: { text: 'first' } },
      { id: 'p2', type: 'paragraph', role: 'tldr', data: { text: 'second' } },
    ]
    expect(() => contentJsonSchema.parse(blocks)).not.toThrow()
    const enforce = validateContentJson(blocks)
    expect(enforce.ok).toBe(false)
    if (!enforce.ok) {
      expect(enforce.message).toMatch(/tldr/i)
    }
  })

  it('passes validateContentJson when at most one tldr block is present', () => {
    const blocks: Block[] = [
      { id: 'p1', type: 'paragraph', role: 'tldr', data: { text: 'only one' } },
      { id: 'p2', type: 'paragraph', data: { text: 'plain' } },
    ]
    const enforce = validateContentJson(blocks)
    expect(enforce.ok).toBe(true)
  })

  it('serializer output for valid blocks parses through contentJsonSchema after round-trip', () => {
    const blocks: Block[] = [
      fixtures['heading'],
      fixtures['paragraph'],
      fixtures['image'],
      fixtures['list'],
      fixtures['quote'],
      fixtures['code'],
      fixtures['callout'],
      fixtures['faq'],
      fixtures['key-takeaway'],
    ]
    const back = editorStateToBlocks(blocksToEditorState(blocks))
    const parse = contentJsonSchema.safeParse(back)
    expect(parse.success).toBe(true)
  })
})
