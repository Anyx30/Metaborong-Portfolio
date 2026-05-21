'use client'

import { Fragment, useState, useEffect, useRef, type KeyboardEvent } from 'react'
import { ArrowRight, ChevronDown, Menu, X } from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { pillars, getPublishedLeaves } from '@/components/sections/services-data'

const navLinks = [
  { label: 'Work', href: '/#work' },
  { label: 'Team', href: '/#founders' },
  { label: 'FAQ',  href: '/#faq' },
  { label: 'Blog', href: '/blog' },
]

/** 1px vertical hairline that cells the nav bar into discrete items.
 *  60% of nav height (34/56), vertically centered. */
function Divider() {
  return <span aria-hidden="true" className="w-px h-[34px] bg-border self-center" />
}

export function Nav() {
  const [megaOpen, setMegaOpen]     = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled]     = useState(false)
  const [activeIdx, setActiveIdx]   = useState<[number, number]>([0, 0])
  const headerRef = useRef<HTMLElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<HTMLAnchorElement[][]>([[], [], []])
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wasOpenRef = useRef(false)
  // Tracks whether the mega was opened via keyboard so we only manage focus
  // for keyboard users. Mouse users never see the brand-blue focus ring.
  const keyboardOpenRef = useRef(false)

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }
  const scheduleClose = () => {
    cancelClose()
    closeTimer.current = setTimeout(() => setMegaOpen(false), 120)
  }
  const openMega = () => { cancelClose(); keyboardOpenRef.current = false; setMegaOpen(true) }

  // Esc closes mega-menu + mobile menu
  useEffect(() => {
    if (!megaOpen && !mobileOpen) return
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMegaOpen(false)
        setMobileOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [megaOpen, mobileOpen])

  // Click outside <header> closes mega-menu
  useEffect(() => {
    if (!megaOpen) return
    const onClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMegaOpen(false)
      }
    }
    window.addEventListener('mousedown', onClick)
    return () => window.removeEventListener('mousedown', onClick)
  }, [megaOpen])

  // Scroll feedback: dashed border becomes solid past scrollY 0
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Focus management: only intervene for keyboard users.
  // Mouse open (hover or click) does not move focus into the panel, so the
  // brand-blue focus ring never appears on a menu item or the trigger.
  // wasOpenRef avoids stealing focus on initial mount.
  useEffect(() => {
    if (megaOpen) {
      wasOpenRef.current = true
      setActiveIdx([0, 0])
      if (keyboardOpenRef.current) {
        requestAnimationFrame(() => {
          itemRefs.current[0]?.[0]?.focus()
        })
      }
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false
      if (keyboardOpenRef.current) {
        triggerRef.current?.focus()
      }
      keyboardOpenRef.current = false
    }
  }, [megaOpen])

  const closeMobile = () => setMobileOpen(false)

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  // ── Mega-menu keyboard nav ────────────────────────────────────────────────
  const setItemRef = (col: number, row: number) => (el: HTMLAnchorElement | null) => {
    if (!itemRefs.current[col]) itemRefs.current[col] = []
    if (el) itemRefs.current[col][row] = el
  }

  const moveFocus = (nextCol: number, nextRow: number) => {
    const colLen = itemRefs.current[nextCol]?.length ?? 0
    if (colLen === 0) return
    const row = Math.min(Math.max(nextRow, 0), colLen - 1)
    const col = Math.min(Math.max(nextCol, 0), 2)
    setActiveIdx([col, row])
    itemRefs.current[col][row]?.focus()
  }

  const onMegaKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const [col, row] = activeIdx
    const colLen = itemRefs.current[col]?.length ?? 0
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        moveFocus(col, Math.min(row + 1, colLen - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        moveFocus(col, Math.max(row - 1, 0))
        break
      case 'ArrowRight':
        e.preventDefault()
        moveFocus(Math.min(col + 1, 2), row)
        break
      case 'ArrowLeft':
        e.preventDefault()
        moveFocus(Math.max(col - 1, 0), row)
        break
      case 'Home':
        e.preventDefault()
        moveFocus(col, 0)
        break
      case 'End':
        e.preventDefault()
        moveFocus(col, colLen - 1)
        break
    }
  }

  const onTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      keyboardOpenRef.current = true
      if (megaOpen) {
        moveFocus(0, 0)
      } else {
        setMegaOpen(true)
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      keyboardOpenRef.current = true
    }
  }

  return (
    <header
      ref={headerRef}
      onMouseEnter={cancelClose}
      onMouseLeave={scheduleClose}
      className={`fixed inset-x-0 top-0 z-50 bg-bg-subtle border-t border-t-gray-subtle border-b border-b-border ${scrolled ? '' : '[border-bottom-style:dashed]'}`}
    >
      {/* Nav bar row.
          Polish pass: cell-grid hairlines (desktop) slice the bar into measured
          regions. Top frame is solid + 1px (structural); bottom toggles dashed→solid
          on scroll (feedback). Two different strokes = blueprint-y. */}
      <nav className="w-full px-[16px] sm:px-[24px] md:px-[40px] lg:px-[48px] xl:px-[80px] 2xl:px-[128px]">
        <div className="flex h-14 items-center max-w-[1280px] mx-auto">
          <Logo size="sm" />

          {/* Desktop cluster (lg+): every item is its own cell, separated by a 1px hairline.
              Reads left-to-right as Logo │ Services │ Work │ Team │ FAQ │ Let's Talk.
              ml-auto right-anchors the cluster; logo holds the left edge. */}
          <div className="hidden lg:flex items-center gap-[24px] ml-auto">
            <Divider />

            <button
              ref={triggerRef}
              type="button"
              aria-expanded={megaOpen}
              aria-haspopup="menu"
              aria-controls="mega-services"
              data-active={megaOpen}
              onMouseEnter={openMega}
              onMouseDown={() => { keyboardOpenRef.current = false }}
              onClick={() => setMegaOpen(v => !v)}
              onKeyDown={onTriggerKeyDown}
              className="relative flex cursor-pointer items-center gap-[4px] border-0 bg-transparent p-0 text-sm tracking-[-0.01em] text-gray transition-colors duration-[var(--duration-instant)] hover:text-dark data-[active=true]:text-dark after:absolute after:-bottom-[6px] after:left-0 after:right-0 after:h-[2px] after:bg-brand after:origin-left after:scale-x-0 after:transition-transform after:duration-[var(--duration-instant)] hover:after:scale-x-100 data-[active=true]:after:scale-x-100 [touch-action:manipulation]"
            >
              Services
              <ChevronDown
                size={14}
                aria-hidden="true"
                className={`transition-transform duration-[var(--duration-instant)] ${megaOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {navLinks.map(link => (
              <Fragment key={link.label}>
                <Divider />
                <a
                  href={link.href}
                  className="relative text-sm tracking-[-0.01em] text-gray no-underline transition-colors duration-[var(--duration-instant)] hover:text-dark after:absolute after:-bottom-[6px] after:left-0 after:right-0 after:h-[2px] after:bg-dark after:origin-left after:scale-x-0 after:transition-transform after:duration-[var(--duration-instant)] hover:after:scale-x-100 [touch-action:manipulation]"
                >
                  {link.label}
                </a>
              </Fragment>
            ))}

            <Divider />

            <Button href="/#contact" size="sm" arrow="→">Let&apos;s Talk</Button>
          </div>

          {/* Mobile hamburger (<lg) */}
          <button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(v => !v)}
            className="ml-auto cursor-pointer border-0 bg-transparent p-[4px] text-gray transition-colors duration-[var(--duration-instant)] hover:text-dark lg:hidden [touch-action:manipulation]"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Desktop mega-menu strip (full-width, lg+) */}
      {megaOpen && (
        <div
          id="mega-services"
          role="menu"
          aria-label="Services"
          onKeyDown={onMegaKeyDown}
          className="hidden lg:block absolute inset-x-0 top-full bg-white border-b border-dashed border-border animate-[mega-in_var(--duration-fast)_ease-out_forwards] motion-reduce:animate-none"
        >
          {/* L4: asymmetric padding. Top edge is contained by the nav bar above;
              bottom edge needs more breath before the dashed border. */}
          <div className="px-[16px] sm:px-[24px] md:px-[48px] lg:px-[96px] xl:px-[128px] pt-[32px] pb-[40px]">
            <div className="grid grid-cols-3 gap-[48px] max-w-[1280px] mx-auto">
              {pillars.map((p, colIdx) => {
                const visibleChildren = getPublishedLeaves(p).slice(0, 5)
                const childCount = visibleChildren.length
                return (
                  <div key={p.id} className={colIdx < 2 ? 'pr-[24px] border-r border-border' : ''}>
                    <div className="flex items-center gap-[12px]">
                      <span className="text-[13px] font-mono text-gray tabular-nums">{p.num}</span>
                      <span
                        aria-hidden="true"
                        className="w-[9px] h-[9px] outline outline-[1.5px] outline-offset-[1.5px]"
                        style={{ background: p.color, outlineColor: p.color }}
                      />
                      <h3 className="text-[20px] font-bold tracking-[-0.025em] leading-[1.2] text-dark">
                        {p.label}
                      </h3>
                    </div>
                    <p className="mt-[6px] text-sm leading-[1.5] text-gray">{p.headline}</p>

                    {/* L2: ul-to-hub gap promoted from 20→32 so hub CTA reads as a separate group, not the next list item. */}
                    <ul className="mt-[20px] flex flex-col gap-[10px]">
                      {visibleChildren.map((c, rowIdx) => {
                        const isActive = activeIdx[0] === colIdx && activeIdx[1] === rowIdx
                        return (
                          <li key={c.slug}>
                            <a
                              ref={setItemRef(colIdx, rowIdx)}
                              href={`/services/${p.id}/${c.slug}/`}
                              role="menuitem"
                              tabIndex={isActive ? 0 : -1}
                              onClick={() => setMegaOpen(false)}
                              onFocus={() => setActiveIdx([colIdx, rowIdx])}
                              className="text-sm text-gray no-underline transition-colors duration-[var(--duration-instant)] hover:text-dark focus:text-dark"
                            >
                              {c.name}
                            </a>
                          </li>
                        )
                      })}
                    </ul>

                    {(() => {
                      const hubRow = childCount
                      const isActive = activeIdx[0] === colIdx && activeIdx[1] === hubRow
                      return (
                        <a
                          ref={setItemRef(colIdx, hubRow)}
                          href={p.hubHref}
                          role="menuitem"
                          tabIndex={isActive ? 0 : -1}
                          onClick={() => setMegaOpen(false)}
                          onFocus={() => setActiveIdx([colIdx, hubRow])}
                          style={{ color: p.color }}
                          className="mt-[32px] inline-flex items-center gap-[4px] font-mono text-[11px] uppercase tracking-[0.1em] no-underline group"
                        >
                          All {p.hubCta}
                          <ArrowRight size={12} className="transition-transform duration-[var(--duration-fast)] group-hover:translate-x-[2px]" />
                        </a>
                      )
                    })()}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu (<lg) */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="lg:hidden absolute top-14 left-0 right-0 h-[calc(100dvh-56px)] overflow-y-auto bg-bg-subtle px-[16px] sm:px-[24px] md:px-[40px] pt-[32px] pb-[40px] flex flex-col gap-[8px]"
        >
          {/* Pillar blocks — collapsed by default. Children stay in DOM for SEO. */}
          {pillars.map((p, i) => (
            <details
              key={p.id}
              className={i > 0 ? 'pt-[12px] pb-[4px] border-t border-dashed border-border group' : 'pb-[4px] group'}
            >
              {/* L3: collapsed summary stays compact (numeral row + H3 only).
                  Headline moves into the expanded panel where it earns its place. */}
              <summary className="nav-summary flex items-center justify-between cursor-pointer py-[14px] [touch-action:manipulation]">
                  <div className="flex items-center gap-[12px]">
                    <span className="text-[13px] font-mono text-gray tabular-nums">{p.num}</span>
                    <span
                      aria-hidden="true"
                      className="w-[9px] h-[9px] outline outline-[1.5px] outline-offset-[1.5px]"
                      style={{ background: p.color, outlineColor: p.color }}
                    />
                    <h3 className="text-[18px] font-bold tracking-[-0.025em] leading-[1.2] text-dark">
                      {p.label}
                    </h3>
                  </div>
                <ChevronDown
                  size={18}
                  aria-hidden="true"
                  className="shrink-0 text-gray transition-transform duration-[var(--duration-instant)] group-open:rotate-180"
                />
              </summary>

              <p className="mt-[12px] text-sm leading-[1.5] text-gray">{p.headline}</p>

              <ul className="mt-[8px] flex flex-col">
                {getPublishedLeaves(p).slice(0, 5).map(c => (
                  <li key={c.slug}>
                    <a
                      href={`/services/${p.id}/${c.slug}/`}
                      onClick={closeMobile}
                      className="block py-[14px] text-sm text-gray no-underline"
                    >
                      {c.name}
                    </a>
                  </li>
                ))}
              </ul>

              <a
                href={p.hubHref}
                onClick={closeMobile}
                style={{ color: p.color }}
                className="mt-[8px] inline-flex items-center gap-[4px] py-[14px] font-mono text-[11px] uppercase tracking-[0.1em] no-underline"
              >
                All {p.hubCta} <ArrowRight size={12} />
              </a>
            </details>
          ))}

          {/* Nav links group */}
          <div className="pt-[16px] border-t border-dashed border-border flex flex-col">
            {navLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                onClick={closeMobile}
                className="block py-[14px] text-sm text-gray no-underline"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="pt-[8px]">
            <Button href="/#contact" size="sm" arrow="→">Let&apos;s Talk</Button>
          </div>
        </div>
      )}
    </header>
  )
}
