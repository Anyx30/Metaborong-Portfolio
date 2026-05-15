// Admonition extraction for blockquotes.
//
// CMS-flavoured blockquotes carry overloaded semantics:
//   > [!tip|note|warn] body            → callout block
//   > [!takeaway] body                 → key-takeaway block
//   > [!faq] question\n> answer        → faq block
//   > body\n> — author                 → quote block with cite
//   > body                             → quote block
//
// The marker MUST appear at the very start of the blockquote's first
// paragraph (after stripping the `> ` prefix). Anything else falls
// through to the plain-quote path so we don't trap accidental markdown
// that happens to mention `[!tip]` as literal text.

import type {
  Block,
  SemanticRole,
} from '../blog-schema'

export interface QuoteParse {
  kind: 'quote'
  text: string
  cite?: string
}

export interface CalloutParse {
  kind: 'callout'
  tone: 'tip' | 'note' | 'warn'
  text: string
}

export interface FaqParse {
  kind: 'faq'
  question: string
  answer: string
}

export interface KeyTakeawayParse {
  kind: 'key-takeaway'
  text: string
}

export interface FaqParseError {
  kind: 'error'
  message: string
}

export type BlockquoteParse =
  | QuoteParse
  | CalloutParse
  | FaqParse
  | KeyTakeawayParse
  | FaqParseError

// Markers must be at column 0 of the joined text and followed by either
// whitespace or end-of-input. We're permissive on whether the user wrote
// `[!tip]` followed by a space, two spaces, or a newline.
const CALLOUT_MARKERS = {
  '[!tip]':      'tip',
  '[!note]':     'note',
  '[!warn]':     'warn',
} as const

/**
 * Inspect the joined plain-text body of a blockquote (paragraphs joined
 * with '\n\n', text-runs preserved with their inline newlines) and decide
 * which block flavour to emit.
 */
export function parseBlockquoteBody(body: string): BlockquoteParse {
  const trimmedLeading = body.replace(/^\s+/, '')

  for (const [marker, tone] of Object.entries(CALLOUT_MARKERS)) {
    if (trimmedLeading.startsWith(marker)) {
      const rest = trimmedLeading.slice(marker.length).replace(/^\s+/, '')
      return { kind: 'callout', tone: tone as 'tip' | 'note' | 'warn', text: rest }
    }
  }

  if (trimmedLeading.startsWith('[!takeaway]')) {
    const rest = trimmedLeading.slice('[!takeaway]'.length).replace(/^\s+/, '')
    return { kind: 'key-takeaway', text: rest }
  }

  if (trimmedLeading.startsWith('[!faq]')) {
    // Question = remainder of the same logical line. Answer = everything
    // after the first separator (newline or paragraph break). A blockquote
    // body of just `[!faq] hello` with no answer is a parse error — FAQ
    // requires both a question and an answer.
    const rest = trimmedLeading.slice('[!faq]'.length).replace(/^[ \t]+/, '')
    const firstBreak = rest.search(/\r?\n/)
    if (firstBreak < 0) {
      return {
        kind: 'error',
        message: 'FAQ blockquote requires both a question and an answer; got only a question line.',
      }
    }
    const question = rest.slice(0, firstBreak).trim()
    const answer   = rest.slice(firstBreak + 1).replace(/^\s+/, '').trim()
    if (!question || !answer) {
      return {
        kind: 'error',
        message: 'FAQ blockquote requires both a non-empty question and a non-empty answer.',
      }
    }
    return { kind: 'faq', question, answer }
  }

  // Plain quote. Look for a trailing "— cite" / "-- cite" line.
  const lines = body.split('\n')
  let cite: string | undefined
  let textLines = lines
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim()
    if (line.length === 0) continue
    const match = line.match(/^(?:—|--)\s+(.+)$/)
    if (match) {
      cite = match[1].trim()
      textLines = lines.slice(0, i)
    }
    break
  }
  const text = textLines.join('\n').replace(/\s+$/, '')
  if (cite) return { kind: 'quote', text, cite }
  return { kind: 'quote', text }
}

/**
 * Build the block payload for a parsed blockquote. The caller MUST have
 * already filtered out the error variant (parse.kind === 'error'); we
 * accept only the success variants here so the return type stays Block.
 */
export function blockquoteParseToBlock(
  id: string,
  parse: QuoteParse | CalloutParse | FaqParse | KeyTakeawayParse,
  role?: SemanticRole,
): Block {
  if (parse.kind === 'callout') {
    return roled({ id, type: 'callout', data: { tone: parse.tone, text: parse.text } }, role)
  }
  if (parse.kind === 'key-takeaway') {
    return roled({ id, type: 'key-takeaway', data: { text: parse.text } }, role)
  }
  if (parse.kind === 'faq') {
    return roled(
      { id, type: 'faq', data: { question: parse.question, answer: parse.answer } },
      role,
    )
  }
  // quote
  const data: { text: string; cite?: string } = { text: parse.text }
  if (parse.cite) data.cite = parse.cite
  return roled({ id, type: 'quote', data }, role)
}

function roled<B extends Block>(block: B, role?: SemanticRole): B {
  if (!role) return block
  return { ...block, role } as B
}
