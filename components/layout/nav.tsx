'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, Boxes, ChevronDown, Layers, Menu, Sparkles, X, type LucideIcon } from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'

type Pillar = 'web3' | 'ai' | 'product'
type Service = { pillar: string; href: string; sub: string; icon: LucideIcon; tone: Pillar }

const services: Service[] = [
  { pillar: 'Web3 / Blockchain', icon: Boxes,    href: '/services/web3/',           sub: 'DeFi, NFT, wallets, DAO — multichain',     tone: 'web3' },
  { pillar: 'AI Agents',         icon: Sparkles, href: '/services/ai-agents/',      sub: 'Agentic AI, RAG, voice agents, automation', tone: 'ai' },
  { pillar: 'Product Studio',    icon: Layers,   href: '/services/product-studio/', sub: 'End-to-end SaaS product builds',            tone: 'product' },
]

const navLinks = [
  { label: 'Work', href: '/#work' },
  { label: 'Team', href: '/#founders' },
  { label: 'FAQ',  href: '/#faq' },
]

const toneClass: Record<Pillar, { text: string; bg: string }> = {
  web3:    { text: 'text-brand', bg: 'bg-brand/10' },
  ai:      { text: 'text-brand', bg: 'bg-brand/10' },
  product: { text: 'text-brand', bg: 'bg-brand/10' },
}

export function Nav() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileOpen, setMobileOpen]   = useState(false)
  const [scrolled, setScrolled]       = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Esc closes mobile menu + dropdown
  useEffect(() => {
    if (!mobileOpen && !dropdownOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false)
        setDropdownOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileOpen, dropdownOpen])

  const closeMobile = () => setMobileOpen(false)

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 backdrop-blur-md transition-[background-color,border-color,box-shadow] duration-[var(--duration-instant)] ${
        scrolled
          ? 'bg-white/95 border-b border-border shadow-[var(--shadow-sm)]'
          : 'bg-white/80'
      }`}
    >
      <nav className="flex h-14 w-full items-center gap-[32px] px-[24px] md:px-[48px] lg:px-[96px] xl:px-[128px]">
        <Logo size="sm" />

        {/* Desktop links */}
        <div className="hidden md:flex flex-1 items-center gap-[24px]">
          <div
            className="relative"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button
              type="button"
              aria-expanded={dropdownOpen}
              aria-haspopup="menu"
              data-active={dropdownOpen}
              className="relative flex cursor-pointer items-center gap-[4px] border-0 bg-transparent p-0 text-sm tracking-[-0.01em] text-gray transition-colors duration-[var(--duration-instant)] hover:text-dark data-[active=true]:text-dark after:absolute after:-bottom-[6px] after:left-0 after:h-[2px] after:w-0 after:bg-brand after:transition-[width] after:duration-[var(--duration-fast)] hover:after:w-full data-[active=true]:after:w-full"
            >
              Services
              <ChevronDown
                size={14}
                className={`transition-transform duration-[var(--duration-instant)] ${dropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 top-full w-[300px] pt-[12px]" role="menu">
                <div className="absolute left-[18px] top-[7px] h-[10px] w-[10px] rotate-45 border border-border border-r-0 border-b-0 bg-white" />
                <div className="nav-dd-card relative rounded-lg border border-border bg-white p-[8px] shadow-[var(--shadow-md)]">
                  {services.map((s, i) => {
                    const Icon = s.icon
                    const tone = toneClass[s.tone]
                    return (
                      <a
                        key={s.pillar}
                        href={s.href}
                        role="menuitem"
                        style={{ animationDelay: `${i * 40}ms` }}
                        className="nav-dd-row group relative flex items-center gap-[12px] rounded-md px-[12px] py-[10px] no-underline hover:bg-border-subtle"
                      >
                        <div className={`flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-md ${tone.bg} ${tone.text}`}>
                          <Icon size={16} strokeWidth={2} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={`text-[13px] font-semibold tracking-[-0.01em] leading-[1.3] ${tone.text}`}>{s.pillar}</div>
                          <div className="mt-[2px] text-[11px] leading-[1.4] text-gray-light">{s.sub}</div>
                        </div>
                        <ArrowRight
                          size={14}
                          className={`shrink-0 -translate-x-[4px] ${tone.text} opacity-0 transition-[transform,opacity] duration-[var(--duration-fast)] group-hover:translate-x-0 group-hover:opacity-100`}
                        />
                      </a>
                    )
                  })}
                  <div className="mt-[4px] border-t border-border-subtle pt-[4px]">
                    <a
                      href="/services/"
                      role="menuitem"
                      className="group flex items-center justify-between rounded-md px-[12px] py-[8px] no-underline hover:bg-border-subtle"
                    >
                      <span className="text-[12px] font-semibold tracking-[-0.01em] text-gray transition-colors duration-[var(--duration-instant)] group-hover:text-brand">
                        Explore all services
                      </span>
                      <ArrowRight
                        size={12}
                        className="text-gray transition-[transform,color] duration-[var(--duration-fast)] group-hover:translate-x-[2px] group-hover:text-brand"
                      />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

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

        <div className="hidden md:inline-flex">
          <Button href="/#contact" size="sm" arrow="→">Let&apos;s Talk</Button>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(v => !v)}
          className="ml-auto cursor-pointer border-0 bg-transparent p-[4px] text-gray transition-colors duration-[var(--duration-instant)] hover:text-dark md:hidden"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {mobileOpen && (
        <div
          id="mobile-menu"
          className="nav-dd-card flex flex-col gap-[12px] border-t border-border bg-white px-[24px] py-[16px] md:px-[48px] md:hidden"
        >
          {services.map(s => {
            const tone = toneClass[s.tone]
            return (
              <a
                key={s.pillar}
                href={s.href}
                onClick={closeMobile}
                className={`text-sm font-semibold no-underline ${tone.text}`}
              >
                {s.pillar}
              </a>
            )
          })}
          <div className="border-t border-border-subtle pt-[12px] flex flex-col gap-[12px]">
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
            <a
              href="/services/"
              onClick={closeMobile}
              className="text-[12px] font-semibold tracking-[-0.01em] text-gray no-underline"
            >
              Explore all services →
            </a>
          </div>
          <div className="mt-[4px]">
            <Button href="/#contact" size="sm" arrow="→">Let&apos;s Talk</Button>
          </div>
        </div>
      )}
    </header>
  )
}
