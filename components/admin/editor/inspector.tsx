'use client'

import type { Editor } from '@tiptap/react'
import { useEffect, useId, useState } from 'react'
import type { GeoVariants, SemanticRole } from '@/lib/blog-schema'
import { NODE_NAMES } from '@/lib/editor/serialize'
import { InfoTooltip } from '../info-tooltip'

// Block types that accept a per-block text override on a variant tab. The
// `image` block accepts an alt override instead. List / code / faq are
// excluded in v1.5 — see dispatch §5.
const TEXT_OVERRIDABLE_NODE_NAMES: ReadonlySet<string> = new Set([
  NODE_NAMES.heading,
  NODE_NAMES.paragraph,
  NODE_NAMES.quote,
  NODE_NAMES.callout,
  NODE_NAMES.keyTakeaway,
])

const ROLES: ReadonlyArray<{ value: '' | SemanticRole; label: string }> = [
  { value: '',           label: '— no role —' },
  { value: 'intro',      label: 'intro' },
  { value: 'tldr',       label: 'tldr' },
  { value: 'definition', label: 'definition' },
  { value: 'step',       label: 'step' },
  { value: 'evidence',   label: 'evidence' },
  { value: 'cta',        label: 'cta' },
]

interface InspectorProps {
  editor: Editor | null
  /** Number of blocks currently carrying role='tldr'. Drives the warning banner. */
  tldrCount?: number
  /** True if the document contains a heading-level skip (h2 → h4 etc). */
  hasHeadingSkip?: boolean
  /**
   * Active variant tab. When 'US' or 'EU', the inspector swaps its body for
   * a per-block override panel and stops emitting role / metadata edits.
   * Block structure is base-only on variant tabs.
   */
  activeVariant?: 'OTHER' | 'US' | 'EU'
  /** Live geo_variants from the parent — used to pre-fill override inputs. */
  variants?: GeoVariants
  /** Setter for the per-block override (provided when on a variant tab). */
  onSetBlockOverride?: (blockId: string, kind: 'text' | 'alt', value: string) => void
}

interface SelectionSnapshot {
  nodeName: string
  attrs: Record<string, unknown>
  pos: number
}

/** Right-rail block inspector. Edits commit on blur or change for selects. */
export function Inspector({
  editor,
  tldrCount = 0,
  hasHeadingSkip = false,
  activeVariant = 'OTHER',
  variants,
  onSetBlockOverride,
}: InspectorProps) {
  const [sel, setSel] = useState<SelectionSnapshot | null>(null)

  useEffect(() => {
    if (!editor) return
    function pickSelection() {
      if (!editor) return
      const { selection, doc } = editor.state
      const $from = selection.$from
      // Walk up to the nearest top-level (depth 1) block node.
      let depth = $from.depth
      while (depth > 0 && $from.node(depth).type.name === 'text') depth -= 1
      const node = depth > 0 ? $from.node(1) : doc.firstChild
      if (!node) { setSel(null); return }
      const pos = depth > 0 ? $from.before(1) : 0
      setSel({ nodeName: node.type.name, attrs: { ...node.attrs }, pos })
    }
    pickSelection()
    editor.on('selectionUpdate', pickSelection)
    editor.on('update', pickSelection)
    return () => {
      editor.off('selectionUpdate', pickSelection)
      editor.off('update', pickSelection)
    }
  }, [editor])

  if (!editor || !sel) {
    return (
      <aside className="flex h-full w-full flex-col gap-[12px] border-l border-border bg-white p-[16px]">
        <h2
          className="text-[10px] font-medium uppercase tracking-[0.16em] text-gray"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Block inspector
        </h2>
        <p className="text-[12px] text-gray-light tracking-[-0.005em]">Select a block to edit its role and metadata.</p>
      </aside>
    )
  }

  function update(attrs: Record<string, unknown>) {
    if (!editor) return
    editor.chain().focus().command(({ tr }) => {
      const node = tr.doc.nodeAt(sel!.pos)
      if (!node) return false
      tr.setNodeMarkup(sel!.pos, undefined, { ...node.attrs, ...attrs })
      return true
    }).run()
  }

  const role = (sel.attrs.role as SemanticRole | null) ?? ''
  const blockType = friendlyType(sel.nodeName)

  // Variant override panel: replaces the role / metadata inputs while a US
  // or EU tab is active. The block's structure stays read-only; only the
  // text (or alt for image blocks) overrides flow through.
  if (activeVariant !== 'OTHER') {
    const region = activeVariant
    const blockId = (sel.attrs.id as string | undefined) ?? ''
    const overridePayload = variants?.[region]?.block_overrides?.[blockId] ?? {}
    const overrideKind: 'text' | 'alt' | null =
      sel.nodeName === NODE_NAMES.image ? 'alt'
      : TEXT_OVERRIDABLE_NODE_NAMES.has(sel.nodeName) ? 'text'
      : null
    const overrideValue =
      overrideKind === 'text' ? (overridePayload.text ?? '')
      : overrideKind === 'alt' ? (overridePayload.alt ?? '')
      : ''
    return (
      <aside className="flex h-full w-full flex-col gap-[12px] overflow-y-auto border-l border-border bg-white p-[16px]" data-testid="inspector-variant">
        <header className="flex flex-col gap-[2px]">
          <h2
            className="text-[10px] font-medium uppercase tracking-[0.16em] text-gray"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Variant overrides · {region}
          </h2>
          <p className="text-[14px] font-semibold tracking-[-0.01em] text-dark">{blockType}</p>
        </header>
        {overrideKind === null ? (
          <p className="rounded-md border border-border bg-bg-subtle px-2 py-1 text-[11px] text-gray tracking-[-0.005em]">
            This block type isn&apos;t variant-overridable in v1.5. Lists,
            code, and FAQ overrides are deferred to v1.6.
          </p>
        ) : (
          <Field
            label={overrideKind === 'alt' ? `${region} alt override` : `${region} text override`}
            info={`Replaces the block's ${overrideKind === 'alt' ? 'alt text' : 'text'} when the reader is in ${region}. Leave empty to inherit the Base version. Useful for region-specific phrasing or compliance (e.g. EU privacy wording).`}
          >
            <input
              type="text"
              value={overrideValue}
              onChange={(e) => onSetBlockOverride?.(blockId, overrideKind, e.target.value)}
              placeholder={overrideKind === 'alt' ? 'Variant alt text' : 'Variant text'}
              data-testid={`block-override-input-${overrideKind}`}
              aria-label={`${region} ${overrideKind} override`}
              className={inputCls()}
            />
            <span className="text-[11px] text-gray-light tracking-[-0.005em]">
              Empty = falls back to base.
            </span>
          </Field>
        )}
      </aside>
    )
  }

  return (
    <aside className="flex h-full w-full flex-col gap-[12px] overflow-y-auto border-l border-border bg-white p-[16px]">
      <header className="flex flex-col gap-[2px]">
        <h2
          className="text-[10px] font-medium uppercase tracking-[0.16em] text-gray"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Block inspector
        </h2>
        <p className="text-[14px] font-semibold tracking-[-0.01em] text-dark">{blockType}</p>
      </header>

      {tldrCount > 1 ? (
        <p role="alert" className="rounded-md border border-[#fda29b] bg-[#fef3f2] px-2 py-1 text-[11px] text-[#b42318] tracking-[-0.005em]">
          Multiple blocks carry role=tldr. Only one is allowed; clear the extras before saving.
        </p>
      ) : null}
      {hasHeadingSkip ? (
        <p className="rounded-md border border-accent/40 bg-[#fff8f1] px-2 py-1 text-[11px] text-[#b54708] tracking-[-0.005em]">
          Heading levels skip a level somewhere (e.g. H2 → H4). SEO-friendly outlines are non-decreasing by 1.
        </p>
      ) : null}

      <Field
        label="Role"
        info="Tags a block's semantic intent for SEO/AEO/GEO outputs. 'tldr' surfaces in /llms.txt, 'definition' wraps for featured-snippet eligibility, 'step' aggregates into HowTo schema when 3+ are present, 'evidence' marks source citations, 'cta' is excluded from AI summaries."
      >
        <select
          value={role}
          onChange={(e) => update({ role: e.target.value || null })}
          aria-label="Block role"
          className="h-[34px] w-full rounded-md border border-border bg-white px-2 text-[13px] tracking-[-0.005em] text-dark focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {ROLES.map((r) => (
            <option key={r.value || 'none'} value={r.value}>{r.label}</option>
          ))}
        </select>
        {role === 'step' ? (
          <span className="text-[11px] text-gray tracking-[-0.005em]">
            3+ step blocks emit HowTo schema.
          </span>
        ) : null}
      </Field>

      {sel.nodeName === NODE_NAMES.heading ? (
        <HeadingFields attrs={sel.attrs} update={update} />
      ) : null}
      {sel.nodeName === NODE_NAMES.list ? (
        <ListFields attrs={sel.attrs} update={update} />
      ) : null}
      {sel.nodeName === NODE_NAMES.callout ? (
        <CalloutFields attrs={sel.attrs} update={update} />
      ) : null}
      {sel.nodeName === NODE_NAMES.image ? (
        <ImageFields attrs={sel.attrs} update={update} />
      ) : null}
      {sel.nodeName === NODE_NAMES.quote ? (
        <QuoteFields attrs={sel.attrs} update={update} />
      ) : null}
      {sel.nodeName === NODE_NAMES.code ? (
        <CodeFields attrs={sel.attrs} update={update} />
      ) : null}
      {sel.nodeName === NODE_NAMES.faq ? (
        <FaqFields attrs={sel.attrs} update={update} />
      ) : null}
    </aside>
  )
}

function Field({ label, info, children }: { label: string; info?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-[4px]">
      <span className="flex items-center gap-1">
        <span
          className="text-[10px] font-medium uppercase tracking-[0.12em] text-gray"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {label}
        </span>
        {info ? <InfoTooltip info={info} label={`Help: ${label}`} /> : null}
      </span>
      {children}
    </label>
  )
}

function inputCls() {
  return 'h-[34px] w-full rounded-md border border-border bg-white px-2 text-[13px] tracking-[-0.005em] text-dark placeholder:text-gray-light focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'
}

function HeadingFields({ attrs, update }: { attrs: Record<string, unknown>; update: (a: Record<string, unknown>) => void }) {
  return (
    <>
      <Field
        label="Level"
        info="Heading hierarchy (H2–H6). H1 is reserved for the post title — never editable. Keep the outline non-decreasing by 1 (no H2 → H4 jumps); search engines penalise broken hierarchies."
      >
        <select
          value={(attrs.level as number) ?? 2}
          onChange={(e) => update({ level: Number(e.target.value) })}
          className={inputCls()}
        >
          {[2, 3, 4, 5, 6].map((l) => <option key={l} value={l}>{`H${l}`}</option>)}
        </select>
      </Field>
      <Field
        label="Anchor (optional)"
        info="URL fragment for in-page jump links (e.g. /blog/post#getting-started). Auto-derived from the heading text if left blank. Use kebab-case."
      >
        <input
          type="text"
          value={(attrs.anchor as string | null) ?? ''}
          onBlur={(e) => update({ anchor: e.target.value.trim() || null })}
          onChange={(e) => update({ anchor: e.target.value || null })}
          placeholder="auto-generated from text"
          className={inputCls()}
        />
      </Field>
    </>
  )
}

function ListFields({ attrs, update }: { attrs: Record<string, unknown>; update: (a: Record<string, unknown>) => void }) {
  const ordered = !!attrs.ordered
  // Don't reuse <Field>: it wraps children in <label>, which leaks the
  // field label + the *other* button's text into each button's
  // accessible name. role="group" + aria-labelledby is the screen-reader
  // -correct pattern for a labeled toggle pair.
  const labelId = useId()
  return (
    <div className="flex flex-col gap-[4px]">
      <span className="flex items-center gap-1">
        <span
          id={labelId}
          className="text-[10px] font-medium uppercase tracking-[0.12em] text-gray"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          List style
        </span>
        <InfoTooltip
          info="Ordered (1, 2, 3) implies sequence — use when order matters. Unordered (•) is for collections where order doesn't matter."
          label="Help: List style"
        />
      </span>
      <div role="group" aria-labelledby={labelId} className="flex gap-2">
        <button
          type="button"
          aria-pressed={!ordered}
          onClick={() => update({ ordered: false })}
          className={`flex-1 rounded-md border px-2 py-1 text-[12px] font-medium ${!ordered ? 'border-brand bg-brand text-white' : 'border-border bg-white text-dark hover:border-brand/30'}`}
        >Unordered</button>
        <button
          type="button"
          aria-pressed={ordered}
          onClick={() => update({ ordered: true })}
          className={`flex-1 rounded-md border px-2 py-1 text-[12px] font-medium ${ordered ? 'border-brand bg-brand text-white' : 'border-border bg-white text-dark hover:border-brand/30'}`}
        >Ordered</button>
      </div>
    </div>
  )
}

function CalloutFields({ attrs, update }: { attrs: Record<string, unknown>; update: (a: Record<string, unknown>) => void }) {
  return (
    <Field
      label="Tone"
      info="Visual + semantic flavour. Tip = helpful aside, Warning = caution / pitfall, Note = neutral information. Each tone gets its own colour and icon on the public page."
    >
      <select
        value={(attrs.tone as string) ?? 'note'}
        onChange={(e) => update({ tone: e.target.value })}
        className={inputCls()}
      >
        <option value="tip">Tip</option>
        <option value="warn">Warning</option>
        <option value="note">Note</option>
      </select>
    </Field>
  )
}

function ImageFields({ attrs, update }: { attrs: Record<string, unknown>; update: (a: Record<string, unknown>) => void }) {
  const altMissing = !((attrs.alt as string) ?? '').trim()
  return (
    <>
      <Field
        label="Image ID (UUID)"
        info="UUID of an image already uploaded to the library. Easier path: use the slash menu (/) → 'image' which opens the picker and fills this for you."
      >
        <input
          type="text"
          value={(attrs.imageId as string) ?? ''}
          onChange={(e) => update({ imageId: e.target.value })}
          placeholder="00000000-0000-0000-0000-000000000000"
          className={inputCls()}
          style={{ fontFamily: 'var(--font-mono)' }}
        />
      </Field>
      <Field
        label="Alt text *"
        info="Required. Describes the image for screen readers and when images fail to load. Be specific (e.g. 'Diagram of MCP request flow' beats 'image')."
      >
        <input
          type="text"
          aria-required="true"
          value={(attrs.alt as string) ?? ''}
          onChange={(e) => update({ alt: e.target.value })}
          placeholder="Required"
          className={`${inputCls()} ${altMissing ? '!border-[#fda29b]' : ''}`}
        />
      </Field>
      <Field
        label="Caption (optional)"
        info="Optional visible text under the image. Use for image credits or extra context the alt text shouldn't repeat."
      >
        <input
          type="text"
          value={(attrs.caption as string | null) ?? ''}
          onChange={(e) => update({ caption: e.target.value || null })}
          className={inputCls()}
        />
      </Field>
    </>
  )
}

function QuoteFields({ attrs, update }: { attrs: Record<string, unknown>; update: (a: Record<string, unknown>) => void }) {
  return (
    <Field
      label="Citation (optional)"
      info="Who said the quote (e.g. 'Tim Berners-Lee'). Becomes the visible <cite> tag on the rendered page; helps with attribution and SEO authority signals."
    >
      <input
        type="text"
        value={(attrs.cite as string | null) ?? ''}
        onChange={(e) => update({ cite: e.target.value || null })}
        placeholder="e.g. Tim Berners-Lee"
        className={inputCls()}
      />
    </Field>
  )
}

function CodeFields({ attrs, update }: { attrs: Record<string, unknown>; update: (a: Record<string, unknown>) => void }) {
  return (
    <Field
      label="Language"
      info="Code highlighting hint (e.g. 'ts', 'bash', 'json'). Used as a CSS class on the rendered <pre><code>; full syntax highlighting is on the v2.1 roadmap."
    >
      <input
        type="text"
        value={(attrs.lang as string) ?? ''}
        onChange={(e) => update({ lang: e.target.value })}
        placeholder="ts"
        className={inputCls()}
        style={{ fontFamily: 'var(--font-mono)' }}
      />
    </Field>
  )
}

function FaqFields({ attrs, update }: { attrs: Record<string, unknown>; update: (a: Record<string, unknown>) => void }) {
  return (
    <>
      <Field
        label="Question"
        info="Phrase as a complete question (e.g. 'How does the MCP cache work?'). FAQ blocks aggregate into the page's FAQPage JSON-LD — Google's rich result for Q&A pages."
      >
        <input
          type="text"
          value={(attrs.question as string) ?? ''}
          onChange={(e) => update({ question: e.target.value })}
          className={inputCls()}
        />
      </Field>
      <Field
        label="Answer"
        info="Multi-line allowed. Keep it concise — featured-snippet eligibility favours 40–60 word answers that directly address the question."
      >
        <textarea
          rows={4}
          value={(attrs.answer as string) ?? ''}
          onChange={(e) => update({ answer: e.target.value })}
          className={`${inputCls()} h-auto py-1`}
        />
      </Field>
    </>
  )
}

function friendlyType(nodeName: string): string {
  switch (nodeName) {
    case NODE_NAMES.heading:     return 'Heading'
    case NODE_NAMES.paragraph:   return 'Paragraph'
    case NODE_NAMES.image:       return 'Image'
    case NODE_NAMES.list:        return 'List'
    case NODE_NAMES.quote:       return 'Quote'
    case NODE_NAMES.code:        return 'Code'
    case NODE_NAMES.callout:     return 'Callout'
    case NODE_NAMES.faq:         return 'FAQ'
    case NODE_NAMES.keyTakeaway: return 'Key takeaway'
    default:                     return nodeName
  }
}
