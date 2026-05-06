'use client'

import type { Editor } from '@tiptap/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { INSERTABLE_BLOCKS, insertBlock } from './insert-block'
import type { BlockType } from '@/lib/blog-schema'

interface MenuPos {
  top: number
  left: number
}

interface SlashMenuProps {
  editor: Editor
}

/**
 * Slash menu: typing `/` opens a popover listing block types. Arrow keys +
 * Enter to insert; Esc closes. Filterable by typing more characters after
 * the slash. Persists the trigger position (caret rect) so the popover
 * tracks the caret without re-querying every keystroke.
 */
export function SlashMenu({ editor }: SlashMenuProps) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<MenuPos | null>(null)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const slashStartRef = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const filtered = filterBlocks(query)

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
    setActiveIndex(0)
    slashStartRef.current = null
  }, [])

  const insert = useCallback((type: BlockType) => {
    if (slashStartRef.current != null) {
      const from = slashStartRef.current
      const to = editor.state.selection.from
      if (to >= from) {
        editor.chain().focus().deleteRange({ from, to }).run()
      }
    }
    insertBlock(editor, type)
    close()
  }, [editor, close])

  // Track the editor's selection / content. When `/` is typed we open;
  // typing after extends the query; backspace closes when the slash is gone.
  useEffect(() => {
    function onUpdate() {
      const start = slashStartRef.current
      if (start == null) return
      const { state } = editor
      const to = state.selection.from
      if (to < start) { close(); return }
      const text = state.doc.textBetween(start, to, '\n')
      if (!text.startsWith('/')) { close(); return }
      setQuery(text.slice(1))
      setActiveIndex(0)
    }

    function onSelectionUpdate() {
      onUpdate()
    }

    editor.on('update', onUpdate)
    editor.on('selectionUpdate', onSelectionUpdate)
    return () => {
      editor.off('update', onUpdate)
      editor.off('selectionUpdate', onSelectionUpdate)
    }
  }, [editor, close])

  // Capture the `/` keystroke at the editor element to open the menu.
  useEffect(() => {
    const dom = editor.view.dom as HTMLElement
    function onKeyDown(e: KeyboardEvent) {
      if (open) return
      if (e.key !== '/') return
      // Position the menu where the caret is. The keydown fires *before*
      // ProseMirror inserts the `/`, so the slash itself lives at
      // (selection.from - 1) once the rAF tick runs.
      requestAnimationFrame(() => {
        const sel = editor.state.selection
        const after = sel.from
        const start = Math.max(0, after - 1)
        slashStartRef.current = start
        const coords = editor.view.coordsAtPos(after)
        const root = dom.getBoundingClientRect()
        setPos({
          top: coords.bottom - root.top + 4,
          left: coords.left - root.left,
        })
        setOpen(true)
        setActiveIndex(0)
      })
    }
    dom.addEventListener('keydown', onKeyDown)
    return () => dom.removeEventListener('keydown', onKeyDown)
  }, [editor, open])

  // Keyboard navigation while the menu is open.
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((i) => (filtered.length === 0 ? 0 : (i + 1) % filtered.length))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((i) => (filtered.length === 0 ? 0 : (i - 1 + filtered.length) % filtered.length))
        return
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        const target = filtered[activeIndex]
        if (target) insert(target.type)
      }
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [open, filtered, activeIndex, insert, close])

  if (!open || !pos) return null

  return (
    <div
      ref={containerRef}
      role="listbox"
      aria-label="Insert block"
      className="absolute z-30 w-[280px] rounded-lg border border-border bg-white p-[6px] shadow-[0_12px_32px_rgba(0,0,0,0.08)]"
      style={{ top: pos.top, left: pos.left }}
    >
      {filtered.length === 0 ? (
        <p className="px-2 py-1 text-[12px] text-gray tracking-[-0.005em]">No matching block.</p>
      ) : (
        filtered.map((b, i) => (
          <button
            key={b.type}
            type="button"
            role="option"
            aria-selected={i === activeIndex}
            onMouseDown={(e) => { e.preventDefault(); insert(b.type) }}
            onMouseEnter={() => setActiveIndex(i)}
            className={`flex w-full flex-col items-start rounded-md px-[10px] py-[6px] text-left transition-colors duration-100 ${
              i === activeIndex ? 'bg-bg-subtle' : 'bg-white hover:bg-bg-subtle'
            }`}
          >
            <span className="text-[13px] font-semibold tracking-[-0.005em] text-dark">{b.label}</span>
            <span className="text-[11px] text-gray tracking-[-0.005em]">{b.description}</span>
          </button>
        ))
      )}
    </div>
  )
}

function filterBlocks(q: string) {
  const norm = q.trim().toLowerCase()
  if (!norm) return INSERTABLE_BLOCKS
  return INSERTABLE_BLOCKS.filter(
    (b) => b.label.toLowerCase().includes(norm) || b.type.toLowerCase().includes(norm),
  )
}
