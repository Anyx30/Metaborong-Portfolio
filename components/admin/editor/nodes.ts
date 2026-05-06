// Custom Tiptap nodes for each Block type. The node `name` matches what
// lib/editor/serialize.ts emits, so the editor's ProseMirror tree can be
// converted back to Block[] without ambiguity.
//
// Heading / image / callout / faq use React NodeViews (see node-views.tsx);
// other text-bearing nodes render as plain DOM and surface their knobs via
// the right-rail inspector.

import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { NODE_NAMES } from '@/lib/editor/serialize'
import {
  CalloutNodeView,
  FaqNodeView,
  HeadingNodeView,
  ImageNodeView,
} from './node-views'

const idAttrs = {
  id:   { default: null as string | null },
  role: { default: null as string | null },
}

// ── heading ───────────────────────────────────────────────────────────────

export const MbHeading = Node.create({
  name: NODE_NAMES.heading,
  group: 'block',
  content: 'inline*',
  defining: true,
  addAttributes() {
    return {
      ...idAttrs,
      level: { default: 2 as 2 | 3 | 4 | 5 | 6 },
      anchor: { default: null as string | null },
    }
  },
  parseHTML() {
    return ([2, 3, 4, 5, 6] as const).map((level) => ({
      tag: `h${level}`,
      attrs: { level },
    }))
  },
  renderHTML({ node, HTMLAttributes }) {
    const level = node.attrs.level || 2
    return [`h${level}`, mergeAttributes(HTMLAttributes, { 'data-block-type': 'heading' }), 0]
  },
  addNodeView() {
    return ReactNodeViewRenderer(HeadingNodeView)
  },
})

// ── paragraph ─────────────────────────────────────────────────────────────

export const MbParagraph = Node.create({
  name: NODE_NAMES.paragraph,
  group: 'block',
  content: 'inline*',
  addAttributes() {
    return idAttrs
  },
  parseHTML() {
    return [{ tag: 'p[data-block-type="paragraph"]' }, { tag: 'p' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['p', mergeAttributes(HTMLAttributes, { 'data-block-type': 'paragraph', class: 'mb-block my-[16px] text-[16px] leading-[1.65] tracking-[-0.005em] text-dark outline-none' }), 0]
  },
})

// ── image (atom) ──────────────────────────────────────────────────────────

export const MbImage = Node.create({
  name: NODE_NAMES.image,
  group: 'block',
  atom: true,
  selectable: true,
  addAttributes() {
    return {
      ...idAttrs,
      imageId: { default: '' as string },
      alt:     { default: '' as string },
      caption: { default: null as string | null },
    }
  },
  parseHTML() {
    return [{ tag: 'figure[data-block-type="image"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['figure', mergeAttributes(HTMLAttributes, { 'data-block-type': 'image' })]
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView)
  },
})

// ── list + listItem ───────────────────────────────────────────────────────

export const MbList = Node.create({
  name: NODE_NAMES.list,
  group: 'block',
  content: `${NODE_NAMES.listItem}+`,
  addAttributes() {
    return {
      ...idAttrs,
      ordered: { default: false as boolean },
    }
  },
  parseHTML() {
    return [
      { tag: 'ul[data-block-type="list"]', attrs: { ordered: false } },
      { tag: 'ol[data-block-type="list"]', attrs: { ordered: true } },
    ]
  },
  renderHTML({ node, HTMLAttributes }) {
    const tag = node.attrs.ordered ? 'ol' : 'ul'
    const cls = node.attrs.ordered ? 'list-decimal' : 'list-disc'
    return [
      tag,
      mergeAttributes(HTMLAttributes, {
        'data-block-type': 'list',
        class: `mb-block my-[16px] pl-[24px] text-[16px] leading-[1.65] tracking-[-0.005em] text-dark ${cls}`,
      }),
      0,
    ]
  },
})

export const MbListItem = Node.create({
  name: NODE_NAMES.listItem,
  content: 'inline*',
  defining: true,
  parseHTML() {
    return [{ tag: 'li' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['li', mergeAttributes(HTMLAttributes, { class: 'my-[6px] outline-none' }), 0]
  },
})

// ── quote ─────────────────────────────────────────────────────────────────

export const MbQuote = Node.create({
  name: NODE_NAMES.quote,
  group: 'block',
  content: 'inline*',
  defining: true,
  addAttributes() {
    return {
      ...idAttrs,
      cite: { default: null as string | null },
    }
  },
  parseHTML() {
    return [{ tag: 'blockquote[data-block-type="quote"]' }, { tag: 'blockquote' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['blockquote', mergeAttributes(HTMLAttributes, {
      'data-block-type': 'quote',
      class: 'mb-block my-[24px] border-l-[3px] border-brand pl-[20px] py-[4px] italic text-[17px] leading-[1.6] tracking-[-0.01em] text-dark outline-none',
    }), 0]
  },
})

// ── code ──────────────────────────────────────────────────────────────────

export const MbCode = Node.create({
  name: NODE_NAMES.code,
  group: 'block',
  content: 'text*',
  marks: '',
  code: true,
  defining: true,
  addAttributes() {
    return {
      ...idAttrs,
      lang: { default: '' as string },
    }
  },
  parseHTML() {
    return [{ tag: 'pre[data-block-type="code"]', preserveWhitespace: 'full' }]
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'pre',
      mergeAttributes(HTMLAttributes, {
        'data-block-type': 'code',
        class: 'mb-block my-[24px] overflow-x-auto rounded-lg border border-border bg-bg-subtle p-[16px] text-[13px] leading-[1.55] outline-none',
        style: 'font-family: var(--font-mono);',
      }),
      ['code', {}, 0],
    ]
  },
})

// ── callout ───────────────────────────────────────────────────────────────

export const MbCallout = Node.create({
  name: NODE_NAMES.callout,
  group: 'block',
  content: 'inline*',
  defining: true,
  addAttributes() {
    return {
      ...idAttrs,
      tone: { default: 'note' as 'tip' | 'warn' | 'note' },
    }
  },
  parseHTML() {
    return [{ tag: 'aside[data-block-type="callout"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['aside', mergeAttributes(HTMLAttributes, { 'data-block-type': 'callout' }), 0]
  },
  addNodeView() {
    return ReactNodeViewRenderer(CalloutNodeView)
  },
})

// ── faq (atom) ────────────────────────────────────────────────────────────

export const MbFaq = Node.create({
  name: NODE_NAMES.faq,
  group: 'block',
  atom: true,
  selectable: true,
  addAttributes() {
    return {
      ...idAttrs,
      question: { default: '' as string },
      answer:   { default: '' as string },
    }
  },
  parseHTML() {
    return [{ tag: 'details[data-block-type="faq"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['details', mergeAttributes(HTMLAttributes, { 'data-block-type': 'faq' })]
  },
  addNodeView() {
    return ReactNodeViewRenderer(FaqNodeView)
  },
})

// ── key takeaway ──────────────────────────────────────────────────────────

export const MbKeyTakeaway = Node.create({
  name: NODE_NAMES.keyTakeaway,
  group: 'block',
  content: 'inline*',
  defining: true,
  addAttributes() {
    return idAttrs
  },
  parseHTML() {
    return [{ tag: 'aside[data-block-type="key-takeaway"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'aside',
      mergeAttributes(HTMLAttributes, {
        'data-block-type': 'key-takeaway',
        class: 'mb-block my-[24px] rounded-lg border-l-[3px] border-brand bg-bg-subtle p-[16px] text-[15px] leading-[1.6] tracking-[-0.005em] text-dark outline-none',
      }),
      0,
    ]
  },
})

export const MB_NODES = [
  MbHeading,
  MbParagraph,
  MbImage,
  MbList,
  MbListItem,
  MbQuote,
  MbCode,
  MbCallout,
  MbFaq,
  MbKeyTakeaway,
] as const
