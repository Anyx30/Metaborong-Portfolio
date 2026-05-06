// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

import { EditorShell } from './editor-shell'
import { INSERTABLE_BLOCKS, buildBlockJson, insertBlock } from './insert-block'
import { HeadingNodeView, ImageNodeView, CalloutNodeView, FaqNodeView } from './node-views'
import { NODE_NAMES } from '@/lib/editor/serialize'
import type { Block, Post } from '@/lib/blog-schema'

// EditorShell tests stay focused on the shell's responsibilities (layout,
// divider drag, localStorage persistence, collapse + tab toggle on small
// viewports). The Tiptap-heavy left pane is mocked; its internal behavior
// is covered by the slash-menu / node-view / inspector unit tests below
// plus the M3 Playwright spec.

vi.mock('./editor', () => ({
  BlockEditor: ({ initialBlocks }: { initialBlocks: Block[] }) => (
    <div data-testid="mock-block-editor" data-block-count={initialBlocks.length}>
      Editor pane
    </div>
  ),
}))

vi.mock('./preview-pane', () => ({
  PreviewPane: ({ liveBlocks }: { liveBlocks: Block[] }) => (
    <div data-testid="mock-preview-pane" data-block-count={liveBlocks.length}>
      Preview pane
    </div>
  ),
}))

function basePost(overrides: Partial<Post> = {}): Post {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    slug: 'sample',
    title: 'Sample',
    excerpt: null,
    status: 'draft',
    content_json: [],
    content_schema_version: 1,
    cover_image_id: null,
    og_image_id: null,
    tags: [],
    author_name: 'Tester',
    author_url: null,
    meta_title: null,
    meta_description: null,
    canonical_url: null,
    geo_variants: {},
    ai_readiness_score: null,
    ai_readiness_band: null,
    ai_readiness_report: null,
    ai_readiness_checked_at: null,
    published_at: null,
    created_at: '2026-04-12T08:00:00.000Z',
    updated_at: '2026-04-12T08:00:00.000Z',
    ...overrides,
  }
}

function setViewport(matches: boolean) {
  // happy-dom doesn't respect changes to window.innerWidth for matchMedia,
  // so stub matchMedia directly.
  window.matchMedia = vi.fn().mockImplementation(() => ({
    matches,
    media: '(min-width: 1024px)',
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia
}

describe('<EditorShell />', () => {
  beforeEach(() => {
    window.localStorage.clear()
    setViewport(true)
  })
  afterEach(() => cleanup())

  it('renders both panes by default on desktop', () => {
    render(<EditorShell basePost={basePost()} initialBlocks={[]} onBlocksChange={() => {}} />)
    expect(screen.getByTestId('mock-block-editor')).toBeInTheDocument()
    expect(screen.getByTestId('mock-preview-pane')).toBeInTheDocument()
    expect(screen.getByRole('separator', { name: /resize/i })).toBeInTheDocument()
  })

  it('"Hide preview" collapses the right pane and persists 0 to localStorage', () => {
    render(<EditorShell basePost={basePost()} initialBlocks={[]} onBlocksChange={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /hide preview/i }))
    expect(screen.queryByTestId('mock-preview-pane')).not.toBeInTheDocument()
    expect(window.localStorage.getItem('mb_admin_editor_split')).toBe('0')
  })

  it('"Show preview" restores the last non-zero split', () => {
    window.localStorage.setItem('mb_admin_editor_split', '0.4')
    // Fresh render reads the stored value, then user collapses and restores.
    render(<EditorShell basePost={basePost()} initialBlocks={[]} onBlocksChange={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /hide preview/i }))
    fireEvent.click(screen.getByRole('button', { name: /show preview/i }))
    expect(screen.getByTestId('mock-preview-pane')).toBeInTheDocument()
    expect(window.localStorage.getItem('mb_admin_editor_split')).toBe('0.4')
  })

  it('hydrates the split ratio from localStorage on mount', () => {
    window.localStorage.setItem('mb_admin_editor_split', '0.7')
    render(<EditorShell basePost={basePost()} initialBlocks={[]} onBlocksChange={() => {}} />)
    // Pane stays present; we can't read computed widths reliably under
    // happy-dom, but we can confirm the divider and panes render.
    expect(screen.getByTestId('mock-preview-pane')).toBeInTheDocument()
    expect(screen.getByRole('separator', { name: /resize/i })).toBeInTheDocument()
  })

  it('divider keyboard nav adjusts the split and persists to localStorage', () => {
    render(<EditorShell basePost={basePost()} initialBlocks={[]} onBlocksChange={() => {}} />)
    const sep = screen.getByRole('separator', { name: /resize/i })
    fireEvent.keyDown(sep, { key: 'ArrowRight' })
    fireEvent.keyDown(sep, { key: 'ArrowRight' })
    const stored = Number(window.localStorage.getItem('mb_admin_editor_split'))
    expect(stored).toBeGreaterThan(0.5)
    fireEvent.keyDown(sep, { key: 'ArrowLeft' })
    fireEvent.keyDown(sep, { key: 'ArrowLeft' })
    fireEvent.keyDown(sep, { key: 'ArrowLeft' })
    const stored2 = Number(window.localStorage.getItem('mb_admin_editor_split'))
    expect(stored2).toBeLessThan(stored)
  })

  it('on <lg viewports renders an Edit / Preview tab toggle instead of side-by-side', () => {
    setViewport(false)
    render(<EditorShell basePost={basePost()} initialBlocks={[]} onBlocksChange={() => {}} />)
    const editTab = screen.getByRole('tab', { name: /edit/i })
    const previewTab = screen.getByRole('tab', { name: /preview/i })
    expect(editTab).toHaveAttribute('aria-selected', 'true')
    fireEvent.click(previewTab)
    expect(previewTab).toHaveAttribute('aria-selected', 'true')
  })
})

// ── Slash menu / insert helper ────────────────────────────────────────────

describe('slash-menu insert helpers', () => {
  it('exposes all 9 block types in INSERTABLE_BLOCKS', () => {
    const types = INSERTABLE_BLOCKS.map((b) => b.type).sort()
    expect(types).toEqual([
      'callout', 'code', 'faq', 'heading', 'image',
      'key-takeaway', 'list', 'paragraph', 'quote',
    ])
  })

  it('buildBlockJson tags each block with the matching mb-prefixed Tiptap node name + a fresh uuid', () => {
    const seen = new Set<string>()
    for (const b of INSERTABLE_BLOCKS) {
      const node = buildBlockJson(b.type)
      expect(node.type.startsWith('mb')).toBe(true)
      expect((node.attrs?.id as string).length).toBeGreaterThan(0)
      seen.add(node.attrs?.id as string)
    }
    // Each call returns a fresh uuid.
    expect(seen.size).toBe(INSERTABLE_BLOCKS.length)
  })

  it('insertBlock dispatches a valid editor.chain().insertContent... command', () => {
    const insertContentAt = vi.fn().mockReturnThis()
    const insertContent = vi.fn().mockReturnThis()
    const focus = vi.fn().mockReturnThis()
    const run = vi.fn()
    const fakeEditor = {
      state: {
        selection: {
          $from: {
            parent: { type: { name: NODE_NAMES.paragraph }, content: { size: 0 } },
            depth: 1,
            before: () => 0,
            after: () => 2,
          },
        },
      },
      chain: () => ({ focus, insertContentAt, insertContent, run }),
    } as never
    insertBlock(fakeEditor, 'heading')
    // Empty paragraph at caret → replaced via insertContentAt.
    expect(insertContentAt).toHaveBeenCalledTimes(1)
    expect(insertContent).not.toHaveBeenCalled()
  })

  it('insertBlock falls back to insertContent when caret is not in an empty paragraph', () => {
    const insertContentAt = vi.fn().mockReturnThis()
    const insertContent = vi.fn().mockReturnThis()
    const focus = vi.fn().mockReturnThis()
    const run = vi.fn()
    const fakeEditor = {
      state: {
        selection: {
          $from: {
            parent: { type: { name: NODE_NAMES.heading }, content: { size: 5 } },
            depth: 1,
            before: () => 0,
            after: () => 7,
          },
        },
      },
      chain: () => ({ focus, insertContentAt, insertContent, run }),
    } as never
    insertBlock(fakeEditor, 'paragraph')
    expect(insertContent).toHaveBeenCalledTimes(1)
    expect(insertContentAt).not.toHaveBeenCalled()
  })
})

// ── Node views ────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fakeNodeViewProps(attrs: Record<string, unknown>): { props: any; updateAttributes: ReturnType<typeof vi.fn> } {
  const updateAttributes = vi.fn()
  return {
    props: {
      node: { attrs },
      updateAttributes,
      selected: false,
      editor: null,
      decorations: [],
      view: null,
      getPos: () => 0,
      extension: null,
      HTMLAttributes: {},
      innerDecorations: [],
    },
    updateAttributes,
  }
}

describe('HeadingNodeView', () => {
  afterEach(() => cleanup())

  it('exposes only levels 2..6 in the dropdown — never level 1', () => {
    const { props } = fakeNodeViewProps({ id: 'h1', role: null, level: 3, anchor: null })
    render(<HeadingNodeView {...props} />)
    const select = screen.getByLabelText(/heading level/i) as HTMLSelectElement
    const values = Array.from(select.options).map((o) => o.value)
    expect(values).toEqual(['2', '3', '4', '5', '6'])
    expect(values).not.toContain('1')
  })

  it('updates the heading level via updateAttributes', () => {
    const { props, updateAttributes } = fakeNodeViewProps({ id: 'h1', role: null, level: 2, anchor: null })
    render(<HeadingNodeView {...props} />)
    const select = screen.getByLabelText(/heading level/i)
    fireEvent.change(select, { target: { value: '4' } })
    expect(updateAttributes).toHaveBeenCalledWith({ level: 4 })
  })
})

describe('ImageNodeView', () => {
  afterEach(() => cleanup())

  it('alt input is aria-required and shows an error when empty', () => {
    const { props } = fakeNodeViewProps({ id: 'i1', role: null, imageId: '', alt: '', caption: null })
    render(<ImageNodeView {...props} />)
    const altInput = screen.getByPlaceholderText(/describe the image for screen readers/i)
    expect(altInput).toHaveAttribute('aria-required', 'true')
    expect(screen.getByRole('alert').textContent).toMatch(/alt text required/i)
  })

  it('clearing the alt error once a non-empty value is typed', () => {
    const { props, updateAttributes } = fakeNodeViewProps({ id: 'i1', role: null, imageId: '', alt: '', caption: null })
    const { rerender } = render(<ImageNodeView {...props} />)
    const altInput = screen.getByPlaceholderText(/describe the image for screen readers/i)
    fireEvent.change(altInput, { target: { value: 'A diagram' } })
    expect(updateAttributes).toHaveBeenCalledWith({ alt: 'A diagram' })
    // Simulate Tiptap re-rendering with the new attrs.
    const { props: nextProps } = fakeNodeViewProps({ id: 'i1', role: null, imageId: '', alt: 'A diagram', caption: null })
    rerender(<ImageNodeView {...nextProps} />)
    expect(screen.queryByRole('alert')).toBeNull()
  })
})

describe('CalloutNodeView', () => {
  afterEach(() => cleanup())

  it('exposes tip / warn / note in the tone selector', () => {
    const { props } = fakeNodeViewProps({ id: 'cl1', role: null, tone: 'note' })
    render(<CalloutNodeView {...props} />)
    const select = screen.getByLabelText(/callout tone/i) as HTMLSelectElement
    expect(Array.from(select.options).map((o) => o.value)).toEqual(['tip', 'warn', 'note'])
  })
})

describe('FaqNodeView', () => {
  afterEach(() => cleanup())

  it('writes question + answer changes through to updateAttributes', () => {
    const { props, updateAttributes } = fakeNodeViewProps({ id: 'f1', role: null, question: '', answer: '' })
    render(<FaqNodeView {...props} />)
    fireEvent.change(screen.getByPlaceholderText(/what is geo/i), { target: { value: 'Q?' } })
    fireEvent.change(screen.getByPlaceholderText(/generative engine/i), { target: { value: 'A.' } })
    expect(updateAttributes).toHaveBeenCalledWith({ question: 'Q?' })
    expect(updateAttributes).toHaveBeenCalledWith({ answer: 'A.' })
  })
})

// `act` reference kept to silence lint when only used inside async cases above.
void act
