// Tiptap extension that guarantees every mb-prefixed block in the editor
// document has a unique `id` attribute.
//
// Why this exists: ProseMirror's built-in splitBlock command (fired on
// Enter inside a heading / paragraph / etc.) copies the parent node's
// attrs verbatim onto the new sibling — including our `id`. Likewise,
// copy/paste within the editor reproduces the source id on the pasted
// node. Both produce duplicate ids that downstream React keys, the
// PostView de-dupe shim, and the wire-format Block[] all have to work
// around. Fixing it here at the editor level means duplicates rarely
// reach disk in the first place; the serializer's defensive freshening
// (lib/editor/serialize.ts editorStateToBlocks) and PostView's
// dedupeBlockKeys (components/blog/post-view.tsx) stay in place as
// belt-and-suspenders for posts saved before this plugin landed.
//
// Implementation: an appendTransaction hook walks the post-transaction
// document and rewrites the id on any mb-* node whose id was already
// claimed by an earlier sibling, or that was missing entirely. The fix
// is appended to the same transaction (addToHistory=false) so undo /
// redo doesn't replay the rename as a separate user action.

import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { NODE_NAMES } from '@/lib/editor/serialize'

const MB_NODE_NAMES = new Set<string>(Object.values(NODE_NAMES))

function freshId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

export const uniqueIdsPluginKey = new PluginKey('mbUniqueIds')

export const UniqueIds = Extension.create({
  name: 'mbUniqueIds',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: uniqueIdsPluginKey,
        appendTransaction(transactions, _oldState, newState) {
          if (!transactions.some((tr) => tr.docChanged)) return null

          const seen = new Set<string>()
          const fixes: Array<{ pos: number; nextId: string }> = []

          // Block-level mb-* nodes are direct children of the doc; we
          // don't recurse, which keeps this O(n) over the top-level
          // children even on long posts. MbListItem (the only nested
          // mb-* node) carries no `id` attr by design, so it's not at
          // risk of duplication.
          newState.doc.forEach((node, offset) => {
            if (!MB_NODE_NAMES.has(node.type.name)) return
            const rawId = node.attrs?.id
            const id = typeof rawId === 'string' && rawId.length > 0 ? rawId : null
            if (!id || seen.has(id)) {
              const nextId = freshId()
              seen.add(nextId)
              fixes.push({ pos: offset, nextId })
            } else {
              seen.add(id)
            }
          })

          if (fixes.length === 0) return null

          const tr = newState.tr
          for (const { pos, nextId } of fixes) {
            const node = newState.doc.nodeAt(pos)
            if (!node) continue
            // setNodeMarkup preserves content + length, so positions
            // computed from `newState` stay valid across consecutive fixes.
            tr.setNodeMarkup(pos, undefined, { ...node.attrs, id: nextId })
          }
          tr.setMeta('addToHistory', false)
          return tr
        },
      }),
    ]
  },
})
