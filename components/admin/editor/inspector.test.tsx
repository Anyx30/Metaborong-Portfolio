// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

import type { Editor } from '@tiptap/react'

import { Inspector } from './inspector'
import { NODE_NAMES } from '@/lib/editor/serialize'
import type { GeoVariants } from '@/lib/blog-schema'

// The Inspector reads three things from the editor:
//   1. editor.state.selection.$from.depth + node(...) + before(...)
//   2. editor.state.doc.firstChild  (when depth === 0)
//   3. editor.on/off('selectionUpdate' | 'update', fn)
//   4. editor.chain().focus().command(...).run()  (only when an attr edit fires)
//
// A real Tiptap Editor would require a full ProseMirror schema; for the
// scope of these inspector branch tests we only need the selection
// snapshot to populate `sel` so the inspector renders the right body.
// A duck-typed mock keeps happy-dom out of Tiptap's dependency graph.
function makeEditor({
  nodeName,
  attrs = {},
}: {
  nodeName: string
  attrs?: Record<string, unknown>
}): Editor {
  const node = { type: { name: nodeName }, attrs }
  const state = {
    selection: {
      $from: {
        depth: 0,
        node: () => node,
        before: () => 0,
      },
    },
    doc: {
      firstChild: node,
      nodeAt: () => node,
    },
  }
  return {
    state,
    chain: () => ({
      focus: () => ({
        command: (_fn: unknown) => ({ run: () => true }),
      }),
    }),
    on: () => {},
    off: () => {},
  } as unknown as Editor
}

describe('<Inspector /> — variant override panel', () => {
  afterEach(() => cleanup())

  it('Base tab: renders role + metadata inputs (no variant override panel)', () => {
    const editor = makeEditor({
      nodeName: NODE_NAMES.paragraph,
      attrs: { id: 'p1', role: null },
    })
    render(
      <Inspector editor={editor} activeVariant="OTHER" variants={{}} />,
    )
    // Role select drives the base-tab body.
    expect(screen.getByLabelText(/block role/i)).toBeInTheDocument()
    // The variant panel is identified by the testid on the <aside>.
    expect(screen.queryByTestId('inspector-variant')).toBeNull()
    // Heading "Block inspector" rather than "Variant overrides · …".
    expect(screen.getByText(/block inspector/i)).toBeInTheDocument()
  })

  it('US tab + paragraph selected: renders "US text override" input wired through onSetBlockOverride', () => {
    const onSet = vi.fn()
    const editor = makeEditor({
      nodeName: NODE_NAMES.paragraph,
      attrs: { id: 'p1', role: null },
    })
    const variants: GeoVariants = {
      US: { block_overrides: { p1: { text: 'existing US override' } } },
    }
    render(
      <Inspector
        editor={editor}
        activeVariant="US"
        variants={variants}
        onSetBlockOverride={onSet}
      />,
    )

    // The variant panel mounts and the role select is replaced.
    expect(screen.getByTestId('inspector-variant')).toBeInTheDocument()
    expect(screen.queryByLabelText(/block role/i)).toBeNull()

    // Pre-fills with the existing override value so authors can iterate.
    const input = screen.getByTestId('block-override-input-text') as HTMLInputElement
    expect(input).toBeInTheDocument()
    expect(input.value).toBe('existing US override')

    // Heading announces the active region.
    expect(screen.getByText(/variant overrides · US/i)).toBeInTheDocument()

    // Typing flushes through the parent setter — keystrokes never touch
    // base attrs (no editor.chain() commit on a variant tab).
    fireEvent.change(input, { target: { value: 'new US text' } })
    expect(onSet).toHaveBeenCalledTimes(1)
    expect(onSet).toHaveBeenCalledWith('p1', 'text', 'new US text')
  })

  it('US tab + image selected: renders "US alt override" input', () => {
    const onSet = vi.fn()
    const editor = makeEditor({
      nodeName: NODE_NAMES.image,
      attrs: { id: 'img1', alt: 'base alt', imageId: 'b3a4-…' },
    })
    render(
      <Inspector
        editor={editor}
        activeVariant="US"
        variants={{}}
        onSetBlockOverride={onSet}
      />,
    )

    // The variant panel renders with the alt-override input rather than
    // the text input — image blocks override `alt`, not `text`.
    expect(screen.getByTestId('inspector-variant')).toBeInTheDocument()
    expect(screen.getByTestId('block-override-input-alt')).toBeInTheDocument()
    expect(screen.queryByTestId('block-override-input-text')).toBeNull()

    // No prefill: variants is empty for US, so the input starts blank.
    const altInput = screen.getByTestId('block-override-input-alt') as HTMLInputElement
    expect(altInput.value).toBe('')

    // The aria-label encodes "<region> alt override" for SR announcement.
    expect(screen.getByLabelText(/US alt override/i)).toBeInTheDocument()
  })
})
