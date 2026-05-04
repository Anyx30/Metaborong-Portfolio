'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, Boxes, ChevronDown, Layers, Menu, Sparkles, X, type LucideIcon } from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'

type Service = { pillar: string; href: string; sub: string; icon: LucideIcon }

const services: Service[] = [
  { pillar: 'Web3 / Blockchain', icon: Boxes,    href: '/services/web3/',           sub: 'DeFi, NFT, wallets, DAO — multichain' },
  { pillar: 'AI Agents',         icon: Sparkles, href: '/services/ai-agents/',      sub: 'Agentic AI, RAG, voice agents, automation' },
  { pillar: 'Product Studio',    icon: Layers,   href: '/services/product-studio/', sub: 'End-to-end SaaS product builds' },
]

const navLinks = [
  { label: 'Work',  href: '/work/' },
  { label: 'About', href: '/about/' },
  { label: 'Blog',  href: '/blog/' },
]

export function Nav() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileOpen, setMobileOpen]   = useState(false)
  const [scrolled, setScrolled]       = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeMobile = () => setMobileOpen(false)

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 backdrop-blur-md transition-[background-color,border-color,box-shadow] duration-200 ${
        scrolled
          ? 'bg-white/95 border-b border-border shadow-[0_1px_8px_rgba(0,0,0,0.06)]'
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
              data-active={dropdownOpen}
              className="relative flex cursor-pointer items-center gap-[4px] border-0 bg-transparent p-0 text-sm tracking-[-0.01em] text-gray transition-colors duration-150 hover:text-dark data-[active=true]:text-dark after:absolute after:-bottom-[6px] after:left-0 after:h-[2px] after:w-0 after:bg-brand after:transition-[width] after:duration-200 hover:after:w-full data-[active=true]:after:w-full"
            >
              Services
              <ChevronDown
                size={14}
                className={`transition-transform duration-150 ${dropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 top-full w-[300px] pt-[12px]">
                <div className="absolute left-[18px] top-[7px] h-[10px] w-[10px] rotate-45 border border-border border-r-0 border-b-0 bg-white" />
                <div className="nav-dd-card relative rounded-lg border border-border bg-white p-[8px] shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
                  {services.map((s, i) => {
                    const Icon = s.icon
                    return (
                      <a
                        key={s.pillar}
                        href={s.href}
                        style={{ animationDelay: `${i * 40}ms` }}
                        className="nav-dd-row group relative flex items-center gap-[12px] rounded-md px-[12px] py-[10px] no-underline hover:bg-border-subtle"
                      >
                        <div className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-md bg-brand/10 text-brand">
                          <Icon size={16} strokeWidth={2} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] font-semibold tracking-[-0.01em] leading-[1.3] text-brand">{s.pillar}</div>
                          <div className="mt-[2px] text-[11px] leading-[1.4] text-gray-light">{s.sub}</div>
                        </div>
                        <ArrowRight
                          size={14}
                          className="shrink-0 -translate-x-[4px] text-brand opacity-0 transition-[transform,opacity] duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                        />
                      </a>
                    )
                  })}
                  <div className="mt-[4px] border-t border-border-subtle pt-[4px]">
                    <a
                      href="/services/"
                      className="group flex items-center justify-between rounded-md px-[12px] py-[8px] no-underline hover:bg-border-subtle"
                    >
                      <span className="text-[12px] font-semibold tracking-[-0.01em] text-gray transition-colors group-hover:text-brand">
                        Explore all services
                      </span>
                      <ArrowRight
                        size={12}
                        className="text-gray transition-[transform,color] duration-200 group-hover:translate-x-[2px] group-hover:text-brand"
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
              className="relative text-sm tracking-[-0.01em] text-gray no-underline transition-colors duration-150 hover:text-dark after:absolute after:-bottom-[6px] after:left-0 after:h-[2px] after:w-0 after:bg-brand after:transition-[width] after:duration-200 hover:after:w-full"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:inline-flex rounded-md transition-[transform,box-shadow] duration-200 hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(32,74,248,0.35)]">
          <Button href="/contact/" size="sm">Let&apos;s Talk &rarr;</Button>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(v => !v)}
          className="ml-auto cursor-pointer border-0 bg-transparent p-0 text-gray md:hidden"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="flex flex-col gap-[12px] border-t border-border bg-white px-[24px] py-[16px] md:px-[48px] md:hidden">
          {services.map(s => (
            <a
              key={s.pillar}
              href={s.href}
              onClick={closeMobile}
              className="text-sm font-semibold text-brand no-underline"
            >
              {s.pillar}
            </a>
          ))}
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
          <Button href="/contact/" size="sm">Let&apos;s Talk &rarr;</Button>
        </div>
      )}
    </header>
  )
}
