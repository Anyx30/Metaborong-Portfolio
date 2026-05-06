// Tiptap ↔ Block[] serializer.
//
// Block[] (lib/blog-schema.ts) is the canonical, server-validated content
// shape. The Tiptap editor operates on a ProseMirror JSON tree built from
// custom node names (mbHeading / mbParagraph / …) — Tiptap's default JSON
// output is intentionally NOT used as the wire format.
//
// This module is the single transform between the two representations.
// Round-trip identity is binding:
//
//   blocksToEditorState(editorStateToBlocks(state)) ≡ state
//   editorStateToBlocks(blocksToEditorState(blocks)) ≡ blocks
//
// for any valid Block[] / PMDoc.
//
// Kept Tiptap-free on purpose: pure data transforms run cheaply in Node
// without a DOM, so unit tests don't need happy-dom.

import type { Block, SemanticRole } from '@/lib/blog-schema'

export const NODE_NAMES = {
  heading:     'mbHeading',
  paragraph:   'mbParagraph',
  image:       'mbImage',
  list:        'mbList',
  listItem:    'mbListItem',
  quote:       'mbQuote',
  code:        'mbCode',
  callout:     'mbCallout',
  faq:         'mbFaq',
  keyTakeaway: 'mbKeyTakeaway',
} as const

export type MbNodeName = (typeof NODE_NAMES)[keyof typeof NODE_NAMES]

export interface PMNode {
  type: string
  attrs?: Record<string, unknown>
  content?: PMNode[]
  text?: string
}

export interface PMDoc {
  type: 'doc'
  content?: PMNode[]
}

// Inline text inside a block node always lives as a single ProseMirror
// `text` node. Empty strings collapse to no content (PM forbids empty
// text nodes), and the de-serializer treats absent content as ''.
function textNodesFor(s: string): PMNode[] {
  return s ? [{ type: 'text', text: s }] : []
}

function textOf(node: PMNode | undefined): string {
  if (!node) return ''
  if (node.type === 'text') return node.text ?? ''
  if (!node.content) return ''
  return node.content.map(textOf).join('')
}

function readRole(attrs: Record<string, unknown> | undefined): SemanticRole | undefined {
  const v = attrs?.role
  if (typeof v !== 'string' || v.length === 0) return undefined
  return v as SemanticRole
}

function commonAttrs(b: Block): Record<string, unknown> {
  return { id: b.id, role: b.role ?? null }
}

// ── block → node ───────────────────────────────────────────────────────────

function blockToNode(b: Block): PMNode {
  switch (b.type) {
    case 'heading':
      return {
        type: NODE_NAMES.heading,
        attrs: {
          ...commonAttrs(b),
          level: b.data.level,
          anchor: b.data.anchor ?? null,
        },
        content: textNodesFor(b.data.text),
      }
    case 'paragraph':
      return {
        type: NODE_NAMES.paragraph,
        attrs: commonAttrs(b),
        content: textNodesFor(b.data.text),
      }
    case 'image':
      return {
        type: NODE_NAMES.image,
        attrs: {
          ...commonAttrs(b),
          imageId: b.data.imageId,
          alt: b.data.alt,
          caption: b.data.caption ?? null,
        },
      }
    case 'list':
      return {
        type: NODE_NAMES.list,
        attrs: { ...commonAttrs(b), ordered: b.data.ordered },
        content: b.data.items.map((item) => ({
          type: NODE_NAMES.listItem,
          attrs: {},
          content: textNodesFor(item),
        })),
      }
    case 'quote':
      return {
        type: NODE_NAMES.quote,
        attrs: { ...commonAttrs(b), cite: b.data.cite ?? null },
        content: textNodesFor(b.data.text),
      }
    case 'code':
      return {
        type: NODE_NAMES.code,
        attrs: { ...commonAttrs(b), lang: b.data.lang },
        content: textNodesFor(b.data.code),
      }
    case 'callout':
      return {
        type: NODE_NAMES.callout,
        attrs: { ...commonAttrs(b), tone: b.data.tone },
        content: textNodesFor(b.data.text),
      }
    case 'faq':
      return {
        type: NODE_NAMES.faq,
        attrs: {
          ...commonAttrs(b),
          question: b.data.question,
          answer: b.data.answer,
        },
      }
    case 'key-takeaway':
      return {
        type: NODE_NAMES.keyTakeaway,
        attrs: commonAttrs(b),
        content: textNodesFor(b.data.text),
      }
  }
}

// ── node → block ───────────────────────────────────────────────────────────

function nodeToBlock(n: PMNode): Block | null {
  const id = typeof n.attrs?.id === 'string' ? (n.attrs.id as string) : ''
  if (!id) return null
  const role = readRole(n.attrs)

  const withRole = <B extends Block>(b: B): B => (role ? { ...b, role } : b)

  switch (n.type) {
    case NODE_NAMES.heading: {
      const rawLevel = n.attrs?.level
      const level: 2 | 3 | 4 | 5 | 6 =
        rawLevel === 2 || rawLevel === 3 || rawLevel === 4 || rawLevel === 5 || rawLevel === 6
          ? rawLevel
          : 2
      const anchor = typeof n.attrs?.anchor === 'string' && n.attrs.anchor.length > 0
        ? (n.attrs.anchor as string)
        : undefined
      return withRole<Block>({
        id,
        type: 'heading',
        data: { text: textOf(n), level, ...(anchor ? { anchor } : {}) },
      })
    }
    case NODE_NAMES.paragraph:
      return withRole<Block>({
        id, type: 'paragraph',
        data: { text: textOf(n) },
      })
    case NODE_NAMES.image: {
      const imageId = typeof n.attrs?.imageId === 'string' ? (n.attrs.imageId as string) : ''
      const alt = typeof n.attrs?.alt === 'string' ? (n.attrs.alt as string) : ''
      const caption = typeof n.attrs?.caption === 'string' && n.attrs.caption.length > 0
        ? (n.attrs.caption as string)
        : undefined
      return withRole<Block>({
        id, type: 'image',
        data: { imageId, alt, ...(caption ? { caption } : {}) },
      })
    }
    case NODE_NAMES.list: {
      const ordered = !!n.attrs?.ordered
      const items = (n.content ?? [])
        .filter((c) => c.type === NODE_NAMES.listItem)
        .map(textOf)
      return withRole<Block>({
        id, type: 'list',
        data: { ordered, items },
      })
    }
    case NODE_NAMES.quote: {
      const cite = typeof n.attrs?.cite === 'string' && n.attrs.cite.length > 0
        ? (n.attrs.cite as string)
        : undefined
      return withRole<Block>({
        id, type: 'quote',
        data: { text: textOf(n), ...(cite ? { cite } : {}) },
      })
    }
    case NODE_NAMES.code: {
      const lang = typeof n.attrs?.lang === 'string' ? (n.attrs.lang as string) : ''
      return withRole<Block>({
        id, type: 'code',
        data: { lang, code: textOf(n) },
      })
    }
    case NODE_NAMES.callout: {
      const rawTone = n.attrs?.tone
      const tone: 'tip' | 'warn' | 'note' =
        rawTone === 'tip' || rawTone === 'warn' || rawTone === 'note' ? rawTone : 'note'
      return withRole<Block>({
        id, type: 'callout',
        data: { tone, text: textOf(n) },
      })
    }
    case NODE_NAMES.faq: {
      const question = typeof n.attrs?.question === 'string' ? (n.attrs.question as string) : ''
      const answer = typeof n.attrs?.answer === 'string' ? (n.attrs.answer as string) : ''
      return withRole<Block>({
        id, type: 'faq',
        data: { question, answer },
      })
    }
    case NODE_NAMES.keyTakeaway:
      return withRole<Block>({
        id, type: 'key-takeaway',
        data: { text: textOf(n) },
      })
    default:
      return null
  }
}

// ── public API ─────────────────────────────────────────────────────────────

export function blocksToEditorState(blocks: Block[]): PMDoc {
  return { type: 'doc', content: blocks.map(blockToNode) }
}

export function editorStateToBlocks(doc: PMDoc): Block[] {
  const out: Block[] = []
  for (const node of doc.content ?? []) {
    const block = nodeToBlock(node)
    if (block) out.push(block)
  }
  return out
}

// Convenience helper for editor UI: give me a fresh empty doc the editor
// can boot from when a post has zero blocks.
export function emptyEditorDoc(): PMDoc {
  return { type: 'doc', content: [] }
}
