'use client'

// React NodeViews for the Tiptap nodes that need inline UI affordances.
// Per dispatch: heading (level dropdown), image (UUID + alt input), callout
// (tone selector), faq (question + answer inputs).
//
// The remaining block types (paragraph, list, quote, code, key-takeaway)
// render with default Tiptap DOM and surface their knobs through the
// right-rail inspector.

import { NodeViewContent, NodeViewWrapper, type NodeViewProps } from '@tiptap/react'
import { useCallback } from 'react'

const HEADING_LEVELS: ReadonlyArray<2 | 3 | 4 | 5 | 6> = [2, 3, 4, 5, 6]

/** Heading block — H2..H6 dropdown sits before the editable text. */
export function HeadingNodeView({ node, updateAttributes, selected }: NodeViewProps) {
  const level = (node.attrs.level as 2 | 3 | 4 | 5 | 6) ?? 2
  const onLevelChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = Number(e.target.value) as 2 | 3 | 4 | 5 | 6
    if (HEADING_LEVELS.includes(next)) updateAttributes({ level: next })
  }, [updateAttributes])

  const sizeClass =
    level === 2 ? 'text-[clamp(28px,3.2vw,40px)] tracking-[-0.03em]' :
    level === 3 ? 'text-[clamp(22px,2.4vw,28px)] tracking-[-0.025em]' :
    level === 4 ? 'text-[20px] tracking-[-0.02em]' :
    level === 5 ? 'text-[17px] tracking-[-0.015em]' :
                  'text-[15px] tracking-[-0.01em]'

  return (
    <NodeViewWrapper
      as="div"
      className={`mb-block group relative my-[16px] rounded-md ${selected ? 'ring-2 ring-brand/30' : ''}`}
      data-block-id={node.attrs.id ?? undefined}
      data-block-type="heading"
    >
      <div
        contentEditable={false}
        className="absolute -top-[18px] left-0 hidden items-center gap-1 group-hover:flex group-focus-within:flex"
      >
        <label className="sr-only" htmlFor={`heading-level-${node.attrs.id ?? 'new'}`}>
          Heading level
        </label>
        <select
          id={`heading-level-${node.attrs.id ?? 'new'}`}
          value={level}
          onChange={onLevelChange}
          aria-label="Heading level"
          className="rounded-sm border border-border bg-white px-1 py-[2px] text-[10px] font-medium uppercase tracking-[0.12em] text-gray focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {HEADING_LEVELS.map((l) => (
            <option key={l} value={l}>{`H${l}`}</option>
          ))}
        </select>
      </div>
      <NodeViewContent className={`block font-bold leading-[1.15] text-dark outline-none ${sizeClass}`} />
    </NodeViewWrapper>
  )
}

/** Image block — atom; UUID input + alt input + caption input. */
export function ImageNodeView({ node, updateAttributes, selected }: NodeViewProps) {
  const imageId = (node.attrs.imageId as string | null) ?? ''
  const alt = (node.attrs.alt as string | null) ?? ''
  const caption = (node.attrs.caption as string | null) ?? ''
  const altMissing = alt.trim().length === 0

  return (
    <NodeViewWrapper
      as="div"
      className={`mb-block my-[24px] rounded-lg border ${altMissing ? 'border-[#fda29b]' : 'border-dashed border-border'} bg-bg-subtle p-[16px] ${selected ? 'ring-2 ring-brand/30' : ''}`}
      data-block-id={node.attrs.id ?? undefined}
      data-block-type="image"
    >
      <div contentEditable={false} className="flex flex-col gap-2">
        <p
          className="text-[10px] font-medium uppercase tracking-[0.16em] text-gray"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Image · pre-M4 placeholder
        </p>
        <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-gray" style={{ fontFamily: 'var(--font-mono)' }}>
          Image ID (UUID)
        </label>
        <input
          type="text"
          value={imageId}
          onChange={(e) => updateAttributes({ imageId: e.target.value })}
          placeholder="00000000-0000-0000-0000-000000000000"
          className="h-[34px] w-full rounded-md border border-border bg-white px-2 text-[13px] tracking-[-0.005em] text-dark placeholder:text-gray-light focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          style={{ fontFamily: 'var(--font-mono)' }}
        />
        <label className="mt-1 text-[11px] font-medium uppercase tracking-[0.08em] text-gray" style={{ fontFamily: 'var(--font-mono)' }}>
          Alt text <span className="text-[#b42318]">*</span>
        </label>
        <input
          type="text"
          value={alt}
          aria-required="true"
          onChange={(e) => updateAttributes({ alt: e.target.value })}
          placeholder="Describe the image for screen readers"
          className={`h-[34px] w-full rounded-md border bg-white px-2 text-[13px] tracking-[-0.005em] text-dark placeholder:text-gray-light focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${altMissing ? 'border-[#fda29b]' : 'border-border'}`}
        />
        {altMissing ? (
          <p role="alert" className="text-[11px] text-[#b42318] tracking-[-0.005em]">
            Alt text required.
          </p>
        ) : null}
        <label className="mt-1 text-[11px] font-medium uppercase tracking-[0.08em] text-gray" style={{ fontFamily: 'var(--font-mono)' }}>
          Caption (optional)
        </label>
        <input
          type="text"
          value={caption}
          onChange={(e) => updateAttributes({ caption: e.target.value })}
          placeholder="e.g. Figure 1"
          className="h-[34px] w-full rounded-md border border-border bg-white px-2 text-[13px] tracking-[-0.005em] text-dark placeholder:text-gray-light focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        />
      </div>
    </NodeViewWrapper>
  )
}

/** Callout block — tone selector above editable text. */
export function CalloutNodeView({ node, updateAttributes, selected }: NodeViewProps) {
  const tone = (node.attrs.tone as 'tip' | 'warn' | 'note') ?? 'note'
  const palette =
    tone === 'tip' ? { border: 'border-brand', bg: 'bg-[#f5f7ff]', dot: 'bg-brand', label: 'Tip' } :
    tone === 'warn' ? { border: 'border-accent', bg: 'bg-[#fff8f1]', dot: 'bg-accent', label: 'Warning' } :
    { border: 'border-border', bg: 'bg-bg-subtle', dot: 'bg-gray-light', label: 'Note' }
  return (
    <NodeViewWrapper
      as="div"
      className={`mb-block my-[16px] rounded-lg border ${palette.border} ${palette.bg} p-[16px] ${selected ? 'ring-2 ring-brand/30' : ''}`}
      data-block-id={node.attrs.id ?? undefined}
      data-block-type="callout"
    >
      <div contentEditable={false} className="mb-[8px] flex items-center gap-2">
        <span className={`inline-block h-2 w-2 rounded-sm ${palette.dot}`} aria-hidden="true" />
        <label className="sr-only" htmlFor={`callout-tone-${node.attrs.id ?? 'new'}`}>
          Callout tone
        </label>
        <select
          id={`callout-tone-${node.attrs.id ?? 'new'}`}
          value={tone}
          onChange={(e) => updateAttributes({ tone: e.target.value })}
          aria-label="Callout tone"
          className="rounded-sm border border-border bg-white px-1 py-[2px] text-[10px] font-medium uppercase tracking-[0.12em] text-gray focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <option value="tip">Tip</option>
          <option value="warn">Warning</option>
          <option value="note">Note</option>
        </select>
      </div>
      <NodeViewContent className="block text-[15px] leading-[1.6] tracking-[-0.005em] text-dark outline-none" />
    </NodeViewWrapper>
  )
}

/** FAQ block — atom; question + answer inputs. */
export function FaqNodeView({ node, updateAttributes, selected }: NodeViewProps) {
  const question = (node.attrs.question as string | null) ?? ''
  const answer = (node.attrs.answer as string | null) ?? ''
  return (
    <NodeViewWrapper
      as="div"
      className={`mb-block my-[16px] rounded-lg border border-border bg-white p-[16px] ${selected ? 'ring-2 ring-brand/30' : ''}`}
      data-block-id={node.attrs.id ?? undefined}
      data-block-type="faq"
    >
      <div contentEditable={false} className="flex flex-col gap-2">
        <p
          className="text-[10px] font-medium uppercase tracking-[0.16em] text-gray"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          FAQ
        </p>
        <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-gray" style={{ fontFamily: 'var(--font-mono)' }}>
          Question
        </label>
        <input
          type="text"
          value={question}
          onChange={(e) => updateAttributes({ question: e.target.value })}
          placeholder="What is GEO?"
          className="h-[34px] w-full rounded-md border border-border bg-white px-2 text-[14px] tracking-[-0.005em] text-dark placeholder:text-gray-light focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        />
        <label className="mt-1 text-[11px] font-medium uppercase tracking-[0.08em] text-gray" style={{ fontFamily: 'var(--font-mono)' }}>
          Answer
        </label>
        <textarea
          rows={3}
          value={answer}
          onChange={(e) => updateAttributes({ answer: e.target.value })}
          placeholder="Generative Engine Optimization — structuring content so LLM-powered search engines cite you accurately."
          className="w-full rounded-md border border-border bg-white px-2 py-2 text-[14px] leading-[1.55] tracking-[-0.005em] text-dark placeholder:text-gray-light focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        />
      </div>
    </NodeViewWrapper>
  )
}
