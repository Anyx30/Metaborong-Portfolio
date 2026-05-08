'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { Block, GeoRegion, Image as ImageRow, Post } from '@/lib/blog-schema'
import { mergeVariant } from '@/lib/geo'
import { PostView } from '@/components/blog/post-view'

const REGIONS: ReadonlyArray<GeoRegion> = ['OTHER', 'US', 'EU']
const REGION_LABELS: Record<GeoRegion, string> = {
  OTHER: 'Base',
  US: 'US',
  EU: 'EU',
}

interface PreviewPaneProps {
  basePost: Post
  /** Live blocks from the editor; replaces basePost.content_json. */
  liveBlocks: Block[]
  /** Live edits to title/excerpt/tags/meta from the form fields above. */
  liveOverlay?: Partial<Pick<Post, 'title' | 'excerpt' | 'tags' | 'author_name' | 'author_url' | 'meta_title' | 'meta_description' | 'cover_image_id' | 'og_image_id'>>
  /**
   * Image rows the parent has resolved (cover, og, plus inline images
   * the picker has fetched this session). Used to build the `resolveImage`
   * callback PostView needs to render <img> blocks live. Pre-existing
   * inline images that haven't been re-picked won't be in this map; the
   * preview shows a placeholder for them, but the public route renders
   * them correctly via server-side getImagesByIds.
   */
  images?: ImageRow[]
  /**
   * Controlled region. When provided, the parent owns the region state and
   * the preview reads it through. Default uncontrolled behavior remains
   * available for tests / callers that don't wire it.
   */
  region?: GeoRegion
  onRegionChange?: (next: GeoRegion) => void
  /**
   * Whether the preview region is locked to the editor's variant tab. Drives
   * the "Sync with editor tab" toggle. Optional — when neither `synced` nor
   * `onToggleSync` are provided, the toggle hides and the selector behaves
   * like before.
   */
  synced?: boolean
  onToggleSync?: () => void
}

/**
 * Live preview pane.
 *
 *   · Re-renders on every editor change, debounced 150ms — the editor
 *     state lives in React, no server round-trip.
 *   · Region selector (Base / US / EU) routes through lib/geo.ts
 *     mergeVariant so the preview shows the same overlay the public
 *     route will produce under each geo header.
 *   · Wraps PostView verbatim — same DOM as the public renderer.
 */
export function PreviewPane({
  basePost,
  liveBlocks,
  liveOverlay,
  images,
  region: controlledRegion,
  onRegionChange,
  synced,
  onToggleSync,
}: PreviewPaneProps) {
  const isControlled = controlledRegion !== undefined
  const [internalRegion, setInternalRegion] = useState<GeoRegion>('OTHER')
  const region = isControlled ? controlledRegion : internalRegion
  const handleRegionChange = (next: GeoRegion) => {
    if (onRegionChange) onRegionChange(next)
    if (!isControlled) setInternalRegion(next)
  }

  const [debouncedBlocks, setDebouncedBlocks] = useState<Block[]>(liveBlocks)
  const [debouncedOverlay, setDebouncedOverlay] = useState(liveOverlay ?? {})
  const [renderTick, setRenderTick] = useState(0)
  const blocksRef = useRef(liveBlocks)
  const overlayRef = useRef(liveOverlay ?? {})

  // 150ms debounce on every editor change (PRD §5.9 + dispatch).
  useEffect(() => {
    blocksRef.current = liveBlocks
    overlayRef.current = liveOverlay ?? {}
    const id = setTimeout(() => {
      setDebouncedBlocks(blocksRef.current)
      setDebouncedOverlay(overlayRef.current)
      setRenderTick((n) => n + 1)
    }, 150)
    return () => clearTimeout(id)
  }, [liveBlocks, liveOverlay])

  const previewPost: Post = useMemo(() => {
    const draft: Post = {
      ...basePost,
      content_json: debouncedBlocks,
      ...debouncedOverlay,
    }
    return mergeVariant(draft, region)
  }, [basePost, debouncedBlocks, debouncedOverlay, region])

  // Resolver from id → ImageRow. Memoized over the images array so PostView
  // doesn't re-render on every parent re-render. Returns null for unknown
  // ids (the renderer falls back to a placeholder, same as for missing
  // image rows in the public route).
  const resolveImage = useMemo(() => {
    const map = new Map<string, ImageRow>()
    for (const img of images ?? []) map.set(img.id, img)
    return (imageId: string): ImageRow | null => map.get(imageId) ?? null
  }, [images])

  const showSyncToggle = synced !== undefined && onToggleSync !== undefined

  return (
    <div className="flex h-full flex-col" data-testid="preview-pane" data-render-tick={renderTick} data-synced={synced ? '1' : '0'}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-bg-subtle px-[16px] py-[8px]">
        <p
          className="text-[10px] font-medium uppercase tracking-[0.16em] text-gray"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Live preview
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {showSyncToggle ? (
            <button
              type="button"
              onClick={onToggleSync}
              aria-pressed={synced}
              data-testid="preview-sync-toggle"
              className={`inline-flex h-[22px] items-center rounded-sm border px-2 text-[10px] font-medium uppercase tracking-[0.12em] transition-colors duration-150 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                synced
                  ? 'border-brand/40 bg-[#eef2ff] text-brand'
                  : 'border-border bg-white text-gray hover:border-brand/30 hover:text-dark'
              }`}
              style={{ fontFamily: 'var(--font-mono)' }}
              title={synced ? 'Synced with editor tab' : 'Free-form preview'}
            >
              {synced ? '· Synced' : 'Sync with tab'}
            </button>
          ) : null}
          <label className="flex items-center gap-2">
            <span
              className="text-[10px] font-medium uppercase tracking-[0.12em] text-gray"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Region
            </span>
            <select
              value={region}
              onChange={(e) => handleRegionChange(e.target.value as GeoRegion)}
              aria-label="Preview region"
              className="rounded-sm border border-border bg-white px-1 py-[2px] text-[12px] tracking-[-0.005em] text-dark focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {REGIONS.map((r) => (
                <option key={r} value={r}>{REGION_LABELS[r]}</option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto bg-white">
        <PostView post={previewPost} resolveImage={resolveImage} draftBanner />
      </div>
    </div>
  )
}
