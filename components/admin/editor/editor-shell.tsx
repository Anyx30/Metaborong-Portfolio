'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Block, Image as ImageRow, Post } from '@/lib/blog-schema'
import { BlockEditor } from './editor'
import { PreviewPane } from './preview-pane'

const SPLIT_KEY = 'mb_admin_editor_split'
const DEFAULT_SPLIT = 0.5

interface EditorShellProps {
  basePost: Post
  initialBlocks: Block[]
  onBlocksChange: (blocks: Block[]) => void
  onSaveShortcut?: () => void
  /** Form-level live overlay for non-content fields visible in the preview. */
  liveOverlay?: Partial<Pick<Post, 'title' | 'excerpt' | 'tags' | 'author_name' | 'author_url' | 'meta_title' | 'meta_description' | 'cover_image_id' | 'og_image_id'>>
  /**
   * Image rows the parent has resolved (cover, og, plus any inline images
   * the editor's picker has fetched during this session). Forwarded to the
   * preview pane so PostView's resolveImage callback can render covers
   * and inline images live. Pre-existing inline images that haven't been
   * re-picked won't be in this map; they still render correctly on the
   * public route which fetches server-side. M4 v1.5+ improvement is to
   * pre-fetch inline imageIds at page load so the preview is fully
   * faithful for existing posts.
   */
  images?: ImageRow[]
}

/**
 * Two-pane editor shell.
 *
 *   · Left pane: <BlockEditor /> + inspector
 *   · Right pane: <PreviewPane /> with region selector
 *   · Draggable divider between them, position persisted to localStorage
 *     under `mb_admin_editor_split` (number 0..1).
 *   · "Hide preview" / "Show preview" button collapses the right pane.
 *     Persists the last non-zero value so re-show goes back to where it was.
 *   · On <lg viewports collapses to a tab toggle (Edit / Preview) instead
 *     of side-by-side rendering.
 */
export function EditorShell({
  basePost,
  initialBlocks,
  onBlocksChange,
  onSaveShortcut,
  liveOverlay,
  images,
}: EditorShellProps) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks)
  const [split, setSplit] = useState<number>(DEFAULT_SPLIT)
  const [collapsed, setCollapsed] = useState<boolean>(false)
  const [isLg, setIsLg] = useState<boolean>(true)
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')
  const containerRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const lastSplitRef = useRef<number>(DEFAULT_SPLIT)

  // Hydrate split from localStorage and watch viewport breakpoint.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SPLIT_KEY)
      if (raw) {
        const num = Number(raw)
        if (Number.isFinite(num) && num >= 0 && num <= 1) {
          setSplit(num)
          if (num > 0) lastSplitRef.current = num
          if (num === 0) setCollapsed(true)
        }
      }
    } catch { /* localStorage may throw in private mode */ }

    const mq = window.matchMedia('(min-width: 1024px)')
    function update() { setIsLg(mq.matches) }
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // Forward block changes upstream + remember locally for the preview pane.
  const handleBlocksChange = useCallback((next: Block[]) => {
    setBlocks(next)
    onBlocksChange(next)
  }, [onBlocksChange])

  // Drag the divider.
  useEffect(() => {
    function onMove(e: PointerEvent) {
      if (!draggingRef.current) return
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const ratio = Math.min(0.9, Math.max(0.2, x / rect.width))
      setSplit(ratio)
      lastSplitRef.current = ratio
      try { window.localStorage.setItem(SPLIT_KEY, String(ratio)) } catch { /* ignore */ }
    }
    function onUp() {
      draggingRef.current = false
      document.body.style.cursor = ''
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [])

  function startDrag() {
    draggingRef.current = true
    document.body.style.cursor = 'col-resize'
  }

  function togglePreview() {
    if (collapsed) {
      const restored = lastSplitRef.current || DEFAULT_SPLIT
      setSplit(restored)
      setCollapsed(false)
      try { window.localStorage.setItem(SPLIT_KEY, String(restored)) } catch { /* ignore */ }
    } else {
      setCollapsed(true)
      try { window.localStorage.setItem(SPLIT_KEY, '0') } catch { /* ignore */ }
    }
  }

  // ── small-viewport tab layout ──────────────────────────────────────────

  if (!isLg) {
    return (
      <div className="flex h-[calc(100vh-280px)] min-h-[520px] flex-col rounded-xl border border-border bg-white">
        <div role="tablist" aria-label="Editor / preview" className="flex items-center gap-1 border-b border-border px-2 pt-2">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'edit'}
            onClick={() => setTab('edit')}
            className={tabClass(tab === 'edit')}
          >
            Edit
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'preview'}
            onClick={() => setTab('preview')}
            className={tabClass(tab === 'preview')}
          >
            Preview
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className={tab === 'edit' ? 'h-full' : 'hidden'}>
            <BlockEditor
              initialBlocks={initialBlocks}
              onChange={handleBlocksChange}
              onSaveShortcut={onSaveShortcut}
            />
          </div>
          <div className={tab === 'preview' ? 'h-full' : 'hidden'}>
            <PreviewPane basePost={basePost} liveBlocks={blocks} liveOverlay={liveOverlay} images={images} />
          </div>
        </div>
      </div>
    )
  }

  // ── desktop: side-by-side with draggable divider ──────────────────────

  const leftPct = collapsed ? 100 : split * 100
  const rightPct = 100 - leftPct

  return (
    <div className="flex h-[calc(100vh-280px)] min-h-[520px] flex-col rounded-xl border border-border bg-white">
      <div className="flex items-center justify-between border-b border-border px-[12px] py-[8px]">
        <p
          className="text-[10px] font-medium uppercase tracking-[0.16em] text-gray"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Editor
        </p>
        <button
          type="button"
          onClick={togglePreview}
          aria-pressed={!collapsed}
          className="inline-flex h-[28px] items-center rounded-md border border-border bg-white px-2 text-[12px] font-medium text-dark transition-colors duration-150 hover:border-brand/30 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {collapsed ? 'Show preview' : 'Hide preview'}
        </button>
      </div>
      <div ref={containerRef} className="flex flex-1 overflow-hidden" data-testid="editor-shell">
        <div style={{ width: `${leftPct}%` }} className="h-full flex-shrink-0 overflow-hidden border-r border-border">
          <BlockEditor
            initialBlocks={initialBlocks}
            onChange={handleBlocksChange}
            onSaveShortcut={onSaveShortcut}
          />
        </div>
        {!collapsed ? (
          <>
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize editor / preview split"
              tabIndex={0}
              data-testid="editor-divider"
              onPointerDown={startDrag}
              onKeyDown={(e) => {
                if (e.key === 'ArrowLeft') {
                  setSplit((s) => {
                    const next = Math.max(0.2, s - 0.05)
                    lastSplitRef.current = next
                    try { window.localStorage.setItem(SPLIT_KEY, String(next)) } catch {}
                    return next
                  })
                }
                if (e.key === 'ArrowRight') {
                  setSplit((s) => {
                    const next = Math.min(0.9, s + 0.05)
                    lastSplitRef.current = next
                    try { window.localStorage.setItem(SPLIT_KEY, String(next)) } catch {}
                    return next
                  })
                }
              }}
              className="w-[6px] flex-shrink-0 cursor-col-resize bg-border hover:bg-brand/30 focus:outline-none focus-visible:bg-brand/50"
            />
            <div style={{ width: `${rightPct}%` }} className="h-full flex-shrink-0 overflow-hidden">
              <PreviewPane basePost={basePost} liveBlocks={blocks} liveOverlay={liveOverlay} images={images} />
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}

function tabClass(active: boolean): string {
  return `inline-flex h-[32px] items-center rounded-t-md border-b-2 px-3 text-[13px] font-medium ${
    active ? 'border-brand text-dark' : 'border-transparent text-gray hover:text-dark'
  }`
}
