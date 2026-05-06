// Insert helpers for the slash menu.
//
// Each block type's insert command builds a fresh ProseMirror node (with a
// new uuid) and inserts it at the current selection. Empty lead paragraphs
// are replaced rather than appended to so the slash menu feels native.

import type { Editor } from '@tiptap/react'
import type { BlockType } from '@/lib/blog-schema'
import { NODE_NAMES } from '@/lib/editor/serialize'

export interface InsertableBlock {
  type: BlockType
  label: string
  description: string
}

export const INSERTABLE_BLOCKS: InsertableBlock[] = [
  { type: 'heading',      label: 'Heading',       description: 'Section title (H2..H6).' },
  { type: 'paragraph',    label: 'Paragraph',     description: 'Plain text.' },
  { type: 'image',        label: 'Image',         description: 'Reference an uploaded image by UUID.' },
  { type: 'list',         label: 'List',          description: 'Bulleted or numbered list.' },
  { type: 'quote',        label: 'Quote',         description: 'Pull quote with optional citation.' },
  { type: 'code',         label: 'Code',          description: 'Monospace code block.' },
  { type: 'callout',      label: 'Callout',       description: 'Tip / warning / note aside.' },
  { type: 'faq',          label: 'FAQ',           description: 'Question and answer pair (FAQPage schema).' },
  { type: 'key-takeaway', label: 'Key takeaway',  description: 'Short bullet surfaced to AI summaries.' },
]

function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // Fallback: rfc-4122 v4 from Math.random — only used in dev environments
  // missing crypto.randomUUID. Tests never exercise this path.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

interface PMJSONNode {
  type: string
  attrs?: Record<string, unknown>
  content?: PMJSONNode[]
}

export function buildBlockJson(type: BlockType): PMJSONNode {
  const id = newId()
  switch (type) {
    case 'heading':
      return { type: NODE_NAMES.heading, attrs: { id, role: null, level: 2, anchor: null }, content: [] }
    case 'paragraph':
      return { type: NODE_NAMES.paragraph, attrs: { id, role: null }, content: [] }
    case 'image':
      return {
        type: NODE_NAMES.image,
        attrs: { id, role: null, imageId: '', alt: '', caption: null },
      }
    case 'list':
      return {
        type: NODE_NAMES.list,
        attrs: { id, role: null, ordered: false },
        content: [{ type: NODE_NAMES.listItem, attrs: {}, content: [] }],
      }
    case 'quote':
      return { type: NODE_NAMES.quote, attrs: { id, role: null, cite: null }, content: [] }
    case 'code':
      return { type: NODE_NAMES.code, attrs: { id, role: null, lang: '' }, content: [] }
    case 'callout':
      return { type: NODE_NAMES.callout, attrs: { id, role: null, tone: 'note' }, content: [] }
    case 'faq':
      return {
        type: NODE_NAMES.faq,
        attrs: { id, role: null, question: '', answer: '' },
      }
    case 'key-takeaway':
      return { type: NODE_NAMES.keyTakeaway, attrs: { id, role: null }, content: [] }
  }
}

/**
 * Insert a fresh block of `type` at the editor's current selection. If the
 * cursor is inside an empty paragraph, that paragraph is replaced — same
 * affordance as the slash menu in Notion / Linear.
 */
export function insertBlock(editor: Editor, type: BlockType): void {
  const node = buildBlockJson(type)
  const { state } = editor
  const $from = state.selection.$from
  const parent = $from.parent
  const replacingEmptyParagraph =
    parent.type.name === NODE_NAMES.paragraph &&
    parent.content.size === 0
  if (replacingEmptyParagraph) {
    const start = $from.before($from.depth)
    const end = $from.after($from.depth)
    editor.chain().focus().insertContentAt({ from: start, to: end }, node).run()
  } else {
    editor.chain().focus().insertContent(node).run()
  }
}
