'use client'

// React NodeViews for the Tiptap nodes that need inline UI affordances.
// Per dispatch: heading (level dropdown), image (picker trigger + alt
// input), callout (tone selector), faq (question + answer inputs).
//
// The remaining block types (paragraph, list, quote, code, key-takeaway)
// render with default Tiptap DOM and surface their knobs through the
// right-rail inspector.

import { NodeViewContent, NodeViewWrapper, type NodeViewProps } from '@tiptap/react'
import NextImage from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError, api } from '@/lib/api-client'
import { ImagePicker } from '@/components/admin/images/image-picker'
import type { Image as ImageRow } from '@/lib/blog-schema'

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
        // Always visible — the heading-level control is the heading
        // block's primary affordance and must be reachable without a
        // hover or focus-within trick (Tiptap's contenteditable host is
        // an *ancestor* of the NodeView, so `:focus-within` on the
        // wrapper never matches when the caret is inside the heading).
        className="absolute -top-[16px] left-0 flex items-center gap-1"
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

/**
 * Image block — atom node. Real M4 picker swap-in:
 *   · "Choose image" button when imageId is empty → opens ImagePicker.
 *   · Selected: thumbnail preview + alt input + caption input + Replace.
 *   · imageId set but row missing in DB (stale UUID from M3) →
 *     broken-image placeholder with a "Replace" button.
 *
 * The imageId attr is set from the picker's onSelect; alt is REQUIRED to
 * pass the form-level Zod validation. The picker also writes alt back to
 * the image row (PATCH /api/admin/images/[id]) so the next time this image
 * is reused the alt is pre-filled — but the block-level alt attr is what
 * the public renderer uses (so per-context alt is allowed).
 */
export function ImageNodeView({ node, updateAttributes, selected }: NodeViewProps) {
  const imageId = (node.attrs.imageId as string | null) ?? ''
  const alt = (node.attrs.alt as string | null) ?? ''
  const caption = (node.attrs.caption as string | null) ?? ''
  const altMissing = alt.trim().length === 0

  const [pickerOpen, setPickerOpen] = useState(false)
  const [resolved, setResolved] = useState<ImageRow | null>(null)
  const [resolveStatus, setResolveStatus] = useState<'idle' | 'loading' | 'missing'>('idle')
  const altInputRef = useRef<HTMLInputElement | null>(null)

  // Resolve imageId → image row whenever the attr changes. Uses an empty
  // PATCH (allowed by the BE) as a "GET by id" since that's what M4 BE
  // exposes for single-row reads.
  useEffect(() => {
    if (!imageId) {
      setResolved(null)
      setResolveStatus('idle')
      return
    }
    if (resolved && resolved.id === imageId) return
    let cancelled = false
    setResolveStatus('loading')
    api
      .patch<{ image: ImageRow }>(`/api/admin/images/${imageId}`, {})
      .then((res) => {
        if (cancelled) return
        setResolved(res.image)
        setResolveStatus('idle')
      })
      .catch((err: unknown) => {
        if (cancelled) return
        if (err instanceof ApiError && err.status === 404) {
          setResolved(null)
          setResolveStatus('missing')
        } else {
          setResolveStatus('idle')
        }
      })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageId])

  const onPick = useCallback((image: ImageRow) => {
    updateAttributes({
      imageId: image.id,
      // Pre-fill alt from the image row when the block alt is empty so the
      // user lands in a valid state by default; they can still tailor.
      ...(alt.trim().length === 0 ? { alt: image.alt } : {}),
    })
    setResolved(image)
    setResolveStatus('idle')
    requestAnimationFrame(() => altInputRef.current?.focus())
  }, [alt, updateAttributes])

  return (
    <NodeViewWrapper
      as="div"
      className={`mb-block my-[24px] rounded-lg border ${altMissing && imageId ? 'border-[#fda29b]' : 'border-border'} bg-white p-[16px] ${selected ? 'ring-2 ring-brand/30' : ''}`}
      data-block-id={node.attrs.id ?? undefined}
      data-block-type="image"
    >
      <div contentEditable={false} className="flex flex-col gap-3">
        {!imageId ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-bg-subtle py-[40px] text-center">
            <p className="text-[13px] text-gray">No image selected.</p>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="inline-flex h-[36px] items-center rounded-md bg-brand px-3 text-[13px] font-semibold text-white transition-opacity duration-150 hover:opacity-95 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Choose image
            </button>
          </div>
        ) : resolveStatus === 'loading' ? (
          <div className="flex h-[160px] w-full items-center justify-center rounded-md border border-dashed border-border bg-bg-subtle text-[13px] text-gray-light">
            Loading image…
          </div>
        ) : resolveStatus === 'missing' || !resolved ? (
          <div className="flex flex-col items-start gap-2 rounded-md border border-dashed border-[#fda29b] bg-[#fef3f2] p-3">
            <p className="text-[13px] text-[#b42318]">
              This image was deleted or is unavailable.
            </p>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="inline-flex h-[32px] items-center rounded-md border border-[#fda29b] bg-white px-2 text-[12px] font-semibold text-[#b42318] hover:bg-[#fef3f2] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Replace
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div
              className="relative w-full overflow-hidden rounded-md border border-border bg-bg-subtle"
              style={{ aspectRatio: `${resolved.width} / ${resolved.height}`, maxHeight: '320px' }}
            >
              <NextImage
                src={resolved.blob_url}
                alt={alt || resolved.alt || resolved.filename}
                fill
                sizes="(max-width: 768px) 100vw, 720px"
                className="object-contain"
                style={{ objectPosition: `${resolved.focal_x * 100}% ${resolved.focal_y * 100}%` }}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="truncate text-[12px] text-gray" title={resolved.filename}>
                {resolved.filename} · {resolved.width}×{resolved.height}
              </p>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="inline-flex h-[28px] items-center rounded-md border border-border bg-white px-2 text-[12px] font-medium text-dark transition-colors duration-150 hover:border-brand/30 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Replace
              </button>
            </div>
          </div>
        )}

        <label
          className="text-[11px] font-medium uppercase tracking-[0.08em] text-gray"
          style={{ fontFamily: 'var(--font-mono)' }}
          htmlFor={`image-alt-${node.attrs.id ?? 'new'}`}
        >
          Alt text <span className="text-[#b42318]" aria-hidden="true">*</span>
        </label>
        <input
          ref={altInputRef}
          id={`image-alt-${node.attrs.id ?? 'new'}`}
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
        <label
          className="mt-1 text-[11px] font-medium uppercase tracking-[0.08em] text-gray"
          style={{ fontFamily: 'var(--font-mono)' }}
          htmlFor={`image-caption-${node.attrs.id ?? 'new'}`}
        >
          Caption (optional)
        </label>
        <input
          id={`image-caption-${node.attrs.id ?? 'new'}`}
          type="text"
          value={caption}
          onChange={(e) => updateAttributes({ caption: e.target.value })}
          placeholder="e.g. Figure 1"
          className="h-[34px] w-full rounded-md border border-border bg-white px-2 text-[13px] tracking-[-0.005em] text-dark placeholder:text-gray-light focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        />
      </div>
      <ImagePicker
        open={pickerOpen}
        mode="inline"
        onClose={() => setPickerOpen(false)}
        onSelect={onPick}
      />
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
