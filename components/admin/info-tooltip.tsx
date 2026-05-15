'use client'

import { useEffect, useId, useRef, useState } from 'react'

interface InfoTooltipProps {
  /** Plain-text help copy. Keep one or two short sentences. */
  info: string
  /** Optional accessible label override. Defaults to "More info". */
  label?: string
  /** Side the popover opens to. Defaults to 'bottom-end'. */
  side?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | 'right'
}

/**
 * Small (i) info button. Hovering or focusing shows a popover with help
 * text; clicking toggles it for touch/mobile and for users who want it
 * to stick. Click-outside closes. Standalone, no portal — relies on the
 * parent being positioned so the popover lands inside the editor surface.
 */
export function InfoTooltip({ info, label = 'More info', side = 'bottom-end' }: InfoTooltipProps) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLSpanElement | null>(null)
  const popId = useId()

  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('mousedown', onClick)
    window.addEventListener('keydown', onEsc)
    return () => {
      window.removeEventListener('mousedown', onClick)
      window.removeEventListener('keydown', onEsc)
    }
  }, [open])

  const sideCls =
    side === 'bottom-start' ? 'top-full left-0 mt-1' :
    side === 'top-end'      ? 'bottom-full right-0 mb-1' :
    side === 'top-start'    ? 'bottom-full left-0 mb-1' :
    side === 'right'        ? 'top-1/2 -translate-y-1/2 left-full ml-1' :
                              'top-full right-0 mt-1'

  return (
    <span ref={wrapRef} className="relative inline-flex items-center group">
      <button
        type="button"
        aria-label={label}
        aria-describedby={open ? popId : undefined}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onFocus={() => setOpen(true)}
        onMouseLeave={(e) => {
          if (!wrapRef.current?.contains(e.relatedTarget as Node | null)) setOpen(false)
        }}
        onBlur={(e) => {
          if (!wrapRef.current?.contains(e.relatedTarget as Node | null)) setOpen(false)
        }}
        className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-gray-light/60 bg-bg-subtle text-[9px] font-bold leading-none text-gray transition-colors hover:border-brand hover:bg-brand/5 hover:text-brand focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        i
      </button>
      {open ? (
        <span
          id={popId}
          role="tooltip"
          className={`absolute ${sideCls} z-50 w-[260px] rounded-md border border-border bg-white px-3 py-2 text-[11px] leading-[1.4] text-dark shadow-md tracking-[-0.005em]`}
        >
          {info}
        </span>
      ) : null}
    </span>
  )
}
