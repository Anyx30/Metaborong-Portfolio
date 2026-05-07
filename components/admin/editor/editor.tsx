'use client'

import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useMemo, useRef } from 'react'
import { Inspector } from './inspector'
import { MB_NODES } from './nodes'
import { SlashMenu } from './slash-menu'
import { UniqueIds } from './unique-ids'
import { blocksToEditorState, editorStateToBlocks, NODE_NAMES } from '@/lib/editor/serialize'
import type { Block, GeoVariants } from '@/lib/blog-schema'

interface BlockEditorProps {
  initialBlocks: Block[]
  onChange: (blocks: Block[]) => void
  /** Cmd/Ctrl+S handler — wired by the parent form for "save now". */
  onSaveShortcut?: () => void
  /**
   * Whether the editor accepts user input. False on US/EU variant tabs:
   * block structure is base-only, but per-block text/alt overrides are
   * editable through the inspector's variant-overrides panel.
   */
  editable?: boolean
  /** Active variant tab — drives the inspector's override panel mode. */
  activeVariant?: 'OTHER' | 'US' | 'EU'
  /** Live geo_variants from the parent — used to pre-fill override inputs. */
  variants?: GeoVariants
  /** Setter for per-block override (forwarded to Inspector). */
  onSetBlockOverride?: (blockId: string, kind: 'text' | 'alt', value: string) => void
}

/**
 * Tiptap-backed block editor (the LEFT pane in the editor shell).
 *
 *   · Boots with blocksToEditorState(initialBlocks); falls back to a single
 *     empty paragraph when the input is empty so ProseMirror's `block+`
 *     content rule is satisfied.
 *   · Calls onChange(editorStateToBlocks(...)) on every editor update.
 *     Debouncing happens upstream (preview pane runs at 150ms; autosave
 *     at 2s).
 *   · Cmd/Ctrl+S triggers onSaveShortcut (manual save / autosave kick).
 *   · Esc closes the slash menu (handled inside <SlashMenu />).
 *   · Mounts the role/metadata inspector wired to the same editor.
 */
export function BlockEditor({
  initialBlocks,
  onChange,
  onSaveShortcut,
  editable = true,
  activeVariant = 'OTHER',
  variants,
  onSetBlockOverride,
}: BlockEditorProps) {
  const initialContent = useMemo(() => initialContentJson(initialBlocks), [initialBlocks])
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        paragraph: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      ...MB_NODES,
      UniqueIds,
    ],
    content: initialContent,
    editable,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'mb-tiptap-doc relative min-h-[480px] outline-none px-[24px] py-[24px]',
        spellcheck: 'true',
      },
    },
    onUpdate({ editor }) {
      const blocks = editorStateToBlocks(editor.getJSON() as never)
      onChangeRef.current(blocks)
    },
  })

  // Toggling between variant tabs flips read-only without remounting the
  // editor (preserves cursor + history). Tiptap exposes setEditable on the
  // editor instance.
  useEffect(() => {
    if (!editor) return
    if (editor.isEditable !== editable) editor.setEditable(editable)
  }, [editor, editable])

  // Cmd/Ctrl+S binds to "save now". Listens at the editor's container so
  // it's only active while the editor has focus.
  useEffect(() => {
    if (!editor || !onSaveShortcut) return
    const dom = editor.view.dom as HTMLElement
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey
      if (meta && e.key.toLowerCase() === 's') {
        e.preventDefault()
        onSaveShortcut?.()
      }
    }
    dom.addEventListener('keydown', onKey)
    return () => dom.removeEventListener('keydown', onKey)
  }, [editor, onSaveShortcut])

  // Compute warnings for the inspector banner (multi-tldr, heading skip).
  const warnings = useMemo(() => {
    const blocks = editor ? editorStateToBlocks(editor.getJSON() as never) : initialBlocks
    let tldr = 0
    let prevLevel = 1
    let skip = false
    for (const b of blocks) {
      if (b.role === 'tldr') tldr += 1
      if (b.type === 'heading') {
        if (b.data.level - prevLevel > 1) skip = true
        prevLevel = b.data.level
      }
    }
    return { tldrCount: tldr, hasHeadingSkip: skip }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor?.state, initialBlocks])

  return (
    <div className="flex h-full min-h-[520px] w-full">
      <div className="relative flex-1 overflow-y-auto bg-white" data-testid="editor-canvas">
        {editor ? (
          <>
            <EditorContent editor={editor} />
            <SlashMenu editor={editor} />
          </>
        ) : (
          <div className="px-[24px] py-[24px] text-[13px] text-gray-light">Loading editor…</div>
        )}
      </div>
      <div className="hidden w-[280px] flex-shrink-0 lg:block">
        <Inspector
          editor={editor}
          tldrCount={warnings.tldrCount}
          hasHeadingSkip={warnings.hasHeadingSkip}
          activeVariant={activeVariant}
          variants={variants}
          onSetBlockOverride={onSetBlockOverride}
        />
      </div>
    </div>
  )
}

function initialContentJson(blocks: Block[]) {
  if (blocks.length === 0) {
    return {
      type: 'doc',
      content: [
        {
          type: NODE_NAMES.paragraph,
          attrs: { id: makeId(), role: null },
          content: [],
        },
      ],
    }
  }
  return blocksToEditorState(blocks)
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}
