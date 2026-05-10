'use client'

import { useState, useEffect, useRef } from 'react'
import { ArrowRight, ChevronDown, Menu, X } from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { pillars } from '@/components/sections/services-data'

const navLinks = [
  { label: 'Work', href: '/#work' },
  { label: 'Team', href: '/#founders' },
  { label: 'FAQ',  href: '/#faq' },
]

export function Nav() {
  const [megaOpen, setMegaOpen]     = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

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
  const openMega = () => { cancelClose(); setMegaOpen(true) }

  // Esc closes mega-menu + mobile menu
  useEffect(() => {
    if (!megaOpen && !mobileOpen) return
    const onKey = (e: KeyboardEvent) => {
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

  const closeMobile = () => setMobileOpen(false)

  return (
    <header
      ref={headerRef}
      onMouseEnter={cancelClose}
      onMouseLeave={scheduleClose}
      className="fixed inset-x-0 top-0 z-50 bg-bg-subtle border-b border-dashed border-border"
    >
      {/* Nav bar row */}
      <nav className="flex h-14 w-full items-center gap-[32px] px-[24px] md:px-[48px] lg:px-[96px] xl:px-[128px]">
        <Logo size="sm" />

        {/* Desktop: links + dropdown trigger (lg+) */}
        <div className="hidden lg:flex flex-1 items-center gap-[24px]">
          <button
            type="button"
            aria-expanded={megaOpen}
            aria-haspopup="menu"
            aria-controls="mega-services"
            data-active={megaOpen}
            onMouseEnter={openMega}
            onClick={() => setMegaOpen(v => !v)}
            className="relative flex cursor-pointer items-center gap-[4px] border-0 bg-transparent p-0 text-sm tracking-[-0.01em] text-gray transition-colors duration-[var(--duration-instant)] hover:text-dark data-[active=true]:text-dark after:absolute after:-bottom-[6px] after:left-0 after:h-[2px] after:w-0 after:bg-brand after:transition-[width] after:duration-[var(--duration-fast)] hover:after:w-full data-[active=true]:after:w-full"
          >
            Services
            <ChevronDown
              size={14}
              className={`transition-transform duration-[var(--duration-instant)] ${megaOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {navLinks.map(link => (
            <a
              key={link.label}
              href={link.href}
              className="relative text-sm tracking-[-0.01em] text-gray no-underline transition-colors duration-[var(--duration-instant)] hover:text-dark after:absolute after:-bottom-[6px] after:left-0 after:h-[2px] after:w-0 after:bg-brand after:transition-[width] after:duration-[var(--duration-fast)] hover:after:w-full"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA (lg+) */}
        <div className="hidden lg:inline-flex">
          <Button href="/#contact" size="sm" arrow="→">Let&apos;s Talk</Button>
        </div>

        {/* Mobile hamburger (<lg) */}
        <button
          type="button"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(v => !v)}
          className="ml-auto cursor-pointer border-0 bg-transparent p-[4px] text-gray transition-colors duration-[var(--duration-instant)] hover:text-dark lg:hidden"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Desktop mega-menu strip (full-width, lg+) */}
      {megaOpen && (
        <div
          id="mega-services"
          role="menu"
          className="hidden lg:block absolute inset-x-0 top-full bg-white border-b border-dashed border-border animate-[mega-in_var(--duration-fast)_ease-out_forwards] motion-reduce:animate-none"
        >
          <div className="grid grid-cols-3 gap-[48px] px-[24px] md:px-[48px] lg:px-[96px] xl:px-[128px] py-[32px]">
            {pillars.map((p) => (
              <div key={p.id}>
                <div className="flex items-center gap-[10px]">
                  <span className="text-[13px] font-mono text-gray tabular-nums">{p.num}</span>
                  <span
                    aria-hidden="true"
                    className="w-[9px] h-[9px] outline outline-[1.5px] outline-offset-[1.5px]"
                    style={{ background: p.color, outlineColor: p.color }}
                  />
                </div>
                <h3
                  role="presentation"
                  className="mt-[12px] text-[20px] font-bold tracking-[-0.025em] leading-[1.2] text-dark"
                >
                  {p.label}
                </h3>
                <p className="mt-[6px] text-sm leading-[1.5] text-gray">{p.headline}</p>

                <ul className="mt-[16px] flex flex-col gap-[8px]">
                  {p.children.slice(0, 5).map(c => (
                    <li key={c.slug}>
                      <a
                        href={`/services/${p.id}/${c.slug}/`}
                        role="menuitem"
                        onClick={() => setMegaOpen(false)}
                        className="text-sm text-gray no-underline transition-colors duration-[var(--duration-instant)] hover:text-dark"
                      >
                        {c.name}
                      </a>
                    </li>
                  ))}
                </ul>

                <a
                  href={p.hubHref}
                  role="menuitem"
                  onClick={() => setMegaOpen(false)}
                  style={{ color: p.color }}
                  className="mt-[20px] inline-flex items-center gap-[4px] font-mono text-[11px] uppercase tracking-[0.1em] no-underline group"
                >
                  All {p.hubCta}
                  <ArrowRight size={12} className="transition-transform duration-[var(--duration-fast)] group-hover:translate-x-[2px]" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile menu (<lg) */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="lg:hidden bg-bg-subtle border-t border-border px-[24px] md:px-[48px] py-[24px] flex flex-col gap-[24px]"
        >
          {/* Pillar blocks */}
          {pillars.map((p, i) => (
            <div
              key={p.id}
              className={i > 0 ? 'pt-[24px] border-t border-dashed border-border' : ''}
            >
              <div className="flex items-center gap-[10px]">
                <span className="text-[13px] font-mono text-gray tabular-nums">{p.num}</span>
                <span
                  aria-hidden="true"
                  className="w-[8px] h-[8px] rounded-full animate-[nav-dot-pulse_1800ms_ease-in-out_infinite] motion-reduce:animate-none"
                  style={{ background: p.color }}
                />
              </div>
              <h3 className="mt-[10px] text-[18px] font-bold tracking-[-0.025em] leading-[1.2] text-dark">
                {p.label}
              </h3>
              <p className="mt-[4px] text-sm leading-[1.5] text-gray">{p.headline}</p>

              <ul className="mt-[12px] flex flex-col gap-[8px]">
                {p.children.slice(0, 5).map(c => (
                  <li key={c.slug}>
                    <a
                      href={`/services/${p.id}/${c.slug}/`}
                      onClick={closeMobile}
                      className="text-sm text-gray no-underline"
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
                className="mt-[12px] inline-flex items-center gap-[4px] font-mono text-[11px] uppercase tracking-[0.1em] no-underline"
              >
                All {p.hubCta} <ArrowRight size={12} />
              </a>
            </div>
          ))}

          {/* Nav links group */}
          <div className="pt-[24px] border-t border-dashed border-border flex flex-col gap-[12px]">
            {navLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                onClick={closeMobile}
                className="text-sm text-gray no-underline"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div>
            <Button href="/#contact" size="sm" arrow="→">Let&apos;s Talk</Button>
          </div>
        </div>
      )}
    </header>
  )
}
