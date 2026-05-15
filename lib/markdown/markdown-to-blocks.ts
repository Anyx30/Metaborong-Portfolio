// Markdown → blocks converter (mcp-be).
//
// Walks a mdast AST produced by mdast-util-from-markdown and emits blocks
// in the shape lib/blog-schema.ts expects. Used by the MCP cms_create_draft
// and cms_patch_post tools so Claude can author drafts in plain markdown
// and the CMS still gets a clean Block[].
//
// Supported syntax (locked at v1 — see docs/cms/handoffs/mcp-be-*.md §4):
//   ##..###### text          → heading (level 2-6); level 1 is REJECTED
//   plain paragraph          → paragraph
//   - / *  / 1.              → list, ordered=true|false
//   ``` …  ```               → code, with optional language tag
//   > body                   → quote (last "— cite" line becomes cite)
//   > [!tip|note|warn] body  → callout, tone=tip|note|warn
//   > [!takeaway] body       → key-takeaway
//   > [!faq] Q\n>A           → faq (Q on first line, A on rest)
//   ![alt](uuid)             → image (url MUST be a UUID of an existing
//                              image row — see cms_upload_image)
//
// Role hints
//   1. <!-- role: tldr --> on its own line, immediately before a block →
//      applies the role to the next emitted block.
//   2. block_roles map ({ 0: 'intro', 3: 'tldr' }) wins on conflict with
//      the inline hint.
//
// Out of scope for v1 (silently dropped / stripped):
//   - tables, footnotes, raw HTML other than role-hint comments
//   - inline links/strong/emphasis preserved as PLAIN TEXT only
//   - frontmatter (we never emit YAML/TOML in the round-trip)
//   - inline images inside a multi-content paragraph

import { randomUUID } from 'node:crypto'
import { fromMarkdown } from 'mdast-util-from-markdown'
import type {
  Blockquote,
  Code,
  Heading,
  Html,
  Image as MdastImage,
  List,
  ListItem,
  Nodes,
  Paragraph,
  PhrasingContent,
  Root,
  RootContent,
} from 'mdast'
import {
  semanticRoleSchema,
  type Block,
  type SemanticRole,
} from '../blog-schema'
import {
  blockquoteParseToBlock,
  parseBlockquoteBody,
} from './admonitions'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const ROLE_COMMENT_RE = /^<!--\s*role\s*:\s*([a-zA-Z-]+)\s*-->\s*$/

export interface MarkdownToBlocksOptions {
  /**
   * Map of zero-based block index → SemanticRole. Wins over an inline
   * `<!-- role: ... -->` hint at the same index. Passed straight through
   * from the cms_create_draft / cms_patch_post `block_roles` field.
   */
  blockRoles?: Record<number, SemanticRole>
}

export type MarkdownConversionResult =
  | { ok: true; blocks: Block[] }
  | { ok: false; code: 'INVALID_CONTENT'; message: string; field?: string }

/**
 * Convert a markdown source string to a Block[] suitable for content_json.
 * Returns a discriminated union so the MCP tool can map an INVALID_CONTENT
 * error to its JSON-RPC envelope without re-parsing the message.
 */
export function markdownToBlocks(
  source: string,
  opts: MarkdownToBlocksOptions = {},
): MarkdownConversionResult {
  const tree: Root = fromMarkdown(source)
  const blocks: Block[] = []
  let pendingRole: SemanticRole | undefined

  for (const node of tree.children) {
    // Role-hint comment — stash for the next emitted block.
    if (node.type === 'html') {
      const role = parseRoleComment(node)
      if (role) {
        pendingRole = role
      }
      continue
    }

    const indexAtEmit = blocks.length
    const overrideRole = opts.blockRoles?.[indexAtEmit]
    const role: SemanticRole | undefined = overrideRole ?? pendingRole
    pendingRole = undefined

    const conv = convertBlock(node, role)
    if (conv === null) continue            // silently skipped (empty / unknown)
    if (!conv.ok) return conv              // hard error — abort

    blocks.push(conv.block)
  }

  return { ok: true, blocks }
}

// ── per-node conversion ──────────────────────────────────────────────────────

type SuccessConversion = { ok: true; block: Block }
type ConversionError   = { ok: false; code: 'INVALID_CONTENT'; message: string; field?: string }
type SingleResult      = SuccessConversion | ConversionError | null

function convertBlock(node: RootContent, role?: SemanticRole): SingleResult {
  switch (node.type) {
    case 'heading':    return convertHeading(node, role)
    case 'paragraph':  return convertParagraph(node, role)
    case 'list':       return convertList(node, role)
    case 'code':       return convertCode(node, role)
    case 'blockquote': return convertBlockquote(node, role)
    case 'thematicBreak':
    case 'definition':
    case 'table':
    case 'yaml':
    case 'html':
      // tables, frontmatter, leftover html — silently dropped in v1.
      return null
    default:
      return null
  }
}

function convertHeading(node: Heading, role?: SemanticRole): SingleResult {
  if (node.depth === 1) {
    return {
      ok: false,
      code: 'INVALID_CONTENT',
      message: 'H1 is reserved for the post title; use ## or lower.',
      field: 'markdown',
    }
  }
  const text = stringifyPhrasing(node.children)
  if (!text) return null
  return {
    ok: true,
    block: applyRole({
      id:   randomUUID(),
      type: 'heading',
      data: { text, level: node.depth },
    }, role),
  }
}

function convertParagraph(node: Paragraph, role?: SemanticRole): SingleResult {
  // Paragraph that is JUST an image → image block. (Most common shape:
  // CommonMark wraps a lone `![alt](url)` line in a paragraph.) Trim
  // empty text children before testing so trailing whitespace doesn't
  // force the paragraph path.
  const significant = node.children.filter(
    (c: PhrasingContent) => !(c.type === 'text' && c.value.trim() === ''),
  )
  if (significant.length === 1 && significant[0].type === 'image') {
    return convertImage(significant[0] as MdastImage, role)
  }

  const text = stringifyPhrasing(node.children)
  if (!text.trim()) return null
  return {
    ok: true,
    block: applyRole({
      id:   randomUUID(),
      type: 'paragraph',
      data: { text },
    }, role),
  }
}

function convertImage(node: MdastImage, role?: SemanticRole): SingleResult {
  const url = (node.url ?? '').trim()
  if (!UUID_RE.test(url)) {
    return {
      ok: false,
      code: 'INVALID_CONTENT',
      message:
        'Image src must be a UUID returned by cms_upload_image; ' +
        'external URLs are rejected. Got: ' + (url || '<empty>'),
      field: 'markdown',
    }
  }
  const alt = (node.alt ?? '').trim()
  if (!alt) {
    return {
      ok: false,
      code: 'INVALID_CONTENT',
      message: 'Image block requires non-empty alt text.',
      field: 'markdown',
    }
  }
  return {
    ok: true,
    block: applyRole({
      id:   randomUUID(),
      type: 'image',
      data: { imageId: url, alt },
    }, role),
  }
}

function convertList(node: List, role?: SemanticRole): SingleResult {
  const items: string[] = []
  for (const child of node.children) {
    if (child.type !== 'listItem') continue
    const itemText = stringifyListItem(child)
    if (itemText) items.push(itemText)
  }
  if (items.length === 0) return null
  return {
    ok: true,
    block: applyRole({
      id:   randomUUID(),
      type: 'list',
      data: { ordered: Boolean(node.ordered), items },
    }, role),
  }
}

function convertCode(node: Code, role?: SemanticRole): SingleResult {
  return {
    ok: true,
    block: applyRole({
      id:   randomUUID(),
      type: 'code',
      data: { lang: node.lang ?? '', code: node.value ?? '' },
    }, role),
  }
}

function convertBlockquote(node: Blockquote, role?: SemanticRole): SingleResult {
  const body = stringifyBlockquoteBody(node)
  const parsed = parseBlockquoteBody(body)
  if (parsed.kind === 'error') {
    return {
      ok: false,
      code: 'INVALID_CONTENT',
      message: parsed.message,
      field: 'markdown',
    }
  }
  const block = blockquoteParseToBlock(randomUUID(), parsed, role)
  return { ok: true, block }
}

// ── stringification ──────────────────────────────────────────────────────────
//
// We collapse all inline content to its visible plain text. Bold, italic,
// links, inline code — the renderer (lib/editor/serialize.ts on the FE)
// treats block.data.text as plain, so preserving markdown syntax here
// would surface raw asterisks in the final HTML. v1 trade-off; rich
// inline support is on the v2 backlog.

function stringifyPhrasing(children: PhrasingContent[]): string {
  return children.map(stringifyPhrasingNode).join('')
}

function stringifyPhrasingNode(node: PhrasingContent): string {
  switch (node.type) {
    case 'text':       return node.value
    case 'inlineCode': return node.value
    case 'break':      return '\n'
    case 'image':      return ''                              // handled at paragraph level
    case 'imageReference': return ''
    case 'link':
    case 'strong':
    case 'emphasis':
    case 'delete':
      return stringifyPhrasing((node as { children: PhrasingContent[] }).children)
    case 'linkReference':
      return stringifyPhrasing((node as { children: PhrasingContent[] }).children)
    case 'html':
      // inline html (e.g. <br>) — drop the markup
      return ''
    default:
      // footnoteReference, footnote — drop
      return ''
  }
}

function stringifyListItem(item: ListItem): string {
  // List items typically contain a single paragraph. Multi-paragraph items
  // join with a newline so the FE renderer can show line breaks; nested
  // lists collapse to their bullet text only.
  const parts: string[] = []
  for (const child of item.children) {
    if (child.type === 'paragraph') {
      parts.push(stringifyPhrasing(child.children))
    } else if (child.type === 'list') {
      for (const li of child.children) {
        if (li.type === 'listItem') parts.push(stringifyListItem(li))
      }
    }
  }
  return parts.join('\n').trim()
}

/**
 * Stringify a blockquote into a plain-text body suitable for the
 * admonition parser. Paragraphs are joined with '\n\n', breaks
 * within a paragraph stay as '\n'.
 */
function stringifyBlockquoteBody(node: Blockquote): string {
  const paragraphs: string[] = []
  for (const child of node.children) {
    if (child.type === 'paragraph') {
      paragraphs.push(stringifyPhrasing(child.children))
    } else if (child.type === 'blockquote') {
      paragraphs.push(stringifyBlockquoteBody(child))
    } else if (child.type === 'list') {
      // Nested list inside a blockquote — flatten items to bullet lines.
      for (const li of child.children) {
        if (li.type === 'listItem') {
          paragraphs.push('- ' + stringifyListItem(li))
        }
      }
    } else if (child.type === 'code') {
      paragraphs.push(child.value)
    }
    // heading / other — dropped to keep callouts clean
  }
  return paragraphs.join('\n\n')
}

function parseRoleComment(node: Html): SemanticRole | undefined {
  const m = node.value.match(ROLE_COMMENT_RE)
  if (!m) return undefined
  const parsed = semanticRoleSchema.safeParse(m[1])
  return parsed.success ? parsed.data : undefined
}

function applyRole<B extends Block>(block: B, role?: SemanticRole): B {
  if (!role) return block
  return { ...block, role } as B
}

// Re-exports so callers don't need a separate import.
export type { Block, SemanticRole }
// Used by the tools to keep the AST type surface in one place.
export type { Nodes as MdastNode }
