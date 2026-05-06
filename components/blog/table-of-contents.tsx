'use client'

import { useEffect, useState } from 'react'
import type { Block } from '@/lib/blog-schema'

// Mirror of block-renderer.tsx's anchorFor() so a TOC link's href always
// matches the heading element's id. If you change one, change the other.
function anchorFor(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'section'
  )
}

interface TocEntry {
  id: string
  text: string
  level: 2 | 3 | 4 | 5 | 6
}

export interface TableOfContentsProps {
  blocks: Block[]
  /** 'desktop' = sticky right-rail; 'mobile' = collapsible accordion. */
  variant: 'desktop' | 'mobile'
}

export function extractHeadings(blocks: Block[]): TocEntry[] {
  const out: TocEntry[] = []
  for (const block of blocks) {
    if (block.type !== 'heading') continue
    const { text, level, anchor } = block.data
    out.push({ id: anchor || anchorFor(text), text, level })
  }
  return out
}

/**
 * Sticky right-rail nav (variant=desktop) or collapsible accordion
 * (variant=mobile). Renders nothing when the post has zero heading
 * blocks (PRD edge case).
 *
 * Anchor click smooth-scrolls to the heading and updates window.location.hash.
 * The component is a Client Component because:
 *   - smooth-scroll behavior + hash update happen on click
 *   - the active-section highlight uses IntersectionObserver
 */
export function TableOfContents({ blocks, variant }: TableOfContentsProps) {
  const entries = extractHeadings(blocks)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [openMobile, setOpenMobile] = useState(false)

  useEffect(() => {
    if (entries.length === 0) return
    const ids = entries.map((e) => e.id)
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) return

    // Highlight the topmost heading currently in the upper half of the
    // viewport. rootMargin shifts the visibility band up to keep the
    // active row meaningful even at the top/bottom of the article.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: [0, 1] },
    )
    for (const el of elements) observer.observe(el)
    return () => observer.disconnect()
  }, [entries])

  if (entries.length === 0) return null

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault()
    const el = document.getElementById(id)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    history.pushState(null, '', `#${id}`)
    setActiveId(id)
    setOpenMobile(false)
  }

  if (variant === 'desktop') {
    return (
      <nav
        aria-label="Table of contents"
        role="navigation"
        className="sticky top-[100px] max-h-[calc(100vh-120px)] overflow-y-auto pr-4"
      >
        <p
          className="mb-[12px] text-[11px] font-medium uppercase tracking-[0.16em] text-gray"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          On this page
        </p>
        <ul className="space-y-[8px] border-l border-border">
          {entries.map((e) => (
            <li
              key={e.id}
              style={{ paddingLeft: `${(e.level - 2) * 12 + 12}px` }}
            >
              <a
                href={`#${e.id}`}
                onClick={(ev) => handleClick(ev, e.id)}
                className={`block py-[2px] text-[13px] leading-[1.4] tracking-[-0.005em] no-underline transition-colors ${
                  activeId === e.id
                    ? 'text-brand font-semibold'
                    : 'text-gray hover:text-dark'
                }`}
                aria-current={activeId === e.id ? 'location' : undefined}
              >
                {e.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    )
  }

  return (
    <details
      className="rounded-lg border border-border bg-white"
      open={openMobile}
      onToggle={(e) => setOpenMobile((e.target as HTMLDetailsElement).open)}
    >
      <summary
        className="cursor-pointer list-none px-[16px] py-[12px] text-[13px] font-semibold tracking-[-0.005em] text-dark flex items-center justify-between"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        <span className="text-gray font-normal uppercase tracking-[0.12em] text-[11px]">
          On this page
        </span>
        <span aria-hidden="true" className="text-gray">
          {openMobile ? '–' : '+'}
        </span>
      </summary>
      <nav
        aria-label="Table of contents"
        role="navigation"
        className="border-t border-border px-[16px] py-[12px]"
      >
        <ul className="space-y-[6px]">
          {entries.map((e) => (
            <li
              key={e.id}
              style={{ paddingLeft: `${(e.level - 2) * 12}px` }}
            >
              <a
                href={`#${e.id}`}
                onClick={(ev) => handleClick(ev, e.id)}
                className={`block py-[2px] text-[13px] leading-[1.4] tracking-[-0.005em] no-underline ${
                  activeId === e.id
                    ? 'text-brand font-semibold'
                    : 'text-gray hover:text-dark'
                }`}
                aria-current={activeId === e.id ? 'location' : undefined}
              >
                {e.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </details>
  )
}
