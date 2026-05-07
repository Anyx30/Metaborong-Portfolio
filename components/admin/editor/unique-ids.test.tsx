// @vitest-environment happy-dom

// Tests for the UniqueIds Tiptap extension. The plugin lives in
// addProseMirrorPlugins, so it only takes effect once the editor is
// mounted to a DOM and dispatching real transactions. happy-dom gives
// us enough of a document for that without spinning up a browser.
//
// We don't render the React-side BlockEditor here — these tests target
// the plugin contract directly via a headless Tiptap Editor.

import { afterEach, describe, expect, it } from 'vitest'
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

import { MB_NODES } from './nodes'
import { UniqueIds } from './unique-ids'
import { NODE_NAMES } from '@/lib/editor/serialize'

const editors: Editor[] = []

afterEach(() => {
  while (editors.length) {
    const e = editors.pop()
    e?.destroy()
  }
})

function makeEditor(content: object): Editor {
  const element = document.createElement('div')
  document.body.appendChild(element)
  const editor = new Editor({
    element,
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
        // StarterKit ships with TrailingNode, which auto-inserts a
        // default-type node at the end of the doc on certain edits.
        // With our schema's first registered node being MbHeading, the
        // injected trailing node is an mbHeading — irrelevant noise for
        // these tests.
        trailingNode: false,
      }),
      ...MB_NODES,
      UniqueIds,
    ],
    content,
  })
  editors.push(editor)
  return editor
}

function topLevelIds(editor: Editor): Array<string | null> {
  const ids: Array<string | null> = []
  editor.state.doc.forEach((node) => {
    const id = node.attrs?.id
    ids.push(typeof id === 'string' && id.length > 0 ? id : null)
  })
  return ids
}

// Trigger appendTransaction by dispatching a real (docChanged) edit and
// then immediately reverting it — leaves the doc text unchanged but
// gives the plugin a docChanged transaction to observe.
function nudge(editor: Editor): void {
  const at = editor.state.doc.firstChild ? 1 : 0
  editor.view.dispatch(editor.state.tr.insertText('x', at, at))
  editor.view.dispatch(editor.state.tr.delete(at, at + 1))
}

describe('UniqueIds plugin', () => {
  it('rewrites the second of two duplicate ids to a fresh value (paste-style duplication)', () => {
    const dup = 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb'
    const editor = makeEditor({
      type: 'doc',
      content: [
        {
          type: NODE_NAMES.paragraph,
          attrs: { id: dup, role: null },
          content: [{ type: 'text', text: 'first' }],
        },
        {
          type: NODE_NAMES.paragraph,
          attrs: { id: dup, role: null },
          content: [{ type: 'text', text: 'second' }],
        },
      ],
    })

    nudge(editor)

    const ids = topLevelIds(editor)
    expect(ids).toHaveLength(2)
    expect(ids[0]).toBe(dup)              // first occurrence kept verbatim
    expect(ids[1]).not.toBe(dup)          // duplicate freshened
    expect((ids[1] as string).length).toBeGreaterThan(0)
  })

  it('Tiptap splitBlock (Enter inside a heading) leaves both halves with distinct ids', () => {
    const seed = 'cccccccc-cccc-4ccc-cccc-cccccccccccc'
    const editor = makeEditor({
      type: 'doc',
      content: [
        {
          type: NODE_NAMES.heading,
          attrs: { id: seed, role: null, level: 2, anchor: null },
          content: [{ type: 'text', text: 'BeforeAfter' }],
        },
      ],
    })

    // Place the caret right after "Before" then split. ProseMirror's
    // splitBlock command copies the parent node's attrs (including id)
    // onto the new sibling — exactly the duplicate the plugin is here
    // to fix.
    editor.commands.setTextSelection(7)
    editor.commands.splitBlock()

    const ids = topLevelIds(editor)
    expect(ids).toHaveLength(2)
    expect(ids[0]).toBeTruthy()
    expect(ids[1]).toBeTruthy()
    expect(ids[0]).not.toBe(ids[1])
    expect(ids[0]).toBe(seed)             // first half retains the original id
  })

  it('does nothing when ids are already unique (no rewrite)', () => {
    const a = 'dddddddd-dddd-4ddd-dddd-dddddddddddd'
    const b = 'eeeeeeee-eeee-4eee-eeee-eeeeeeeeeeee'
    const editor = makeEditor({
      type: 'doc',
      content: [
        { type: NODE_NAMES.paragraph, attrs: { id: a, role: null }, content: [{ type: 'text', text: 'A' }] },
        { type: NODE_NAMES.paragraph, attrs: { id: b, role: null }, content: [{ type: 'text', text: 'B' }] },
      ],
    })

    nudge(editor)

    const ids = topLevelIds(editor)
    expect(ids).toEqual([a, b])
  })

  it('fills in a missing id on a node parsed without one (default attr null)', () => {
    const editor = makeEditor({
      type: 'doc',
      content: [
        // Deliberately missing `id` — what an external paste might look
        // like before the plugin fires. The schema's default of null is
        // what we want the plugin to rewrite into a fresh uuid.
        { type: NODE_NAMES.paragraph, attrs: { role: null }, content: [{ type: 'text', text: 'orphan' }] },
      ],
    })

    nudge(editor)

    const ids = topLevelIds(editor)
    expect(ids).toHaveLength(1)
    expect(typeof ids[0]).toBe('string')
    expect((ids[0] as string).length).toBeGreaterThan(0)
  })
})
