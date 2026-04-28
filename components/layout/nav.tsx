'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Menu, X } from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'

const services = [
  { pillar: 'Web3 / Blockchain', color: '#204AF8', href: '/services/web3/', sub: 'DeFi, NFT, wallets, DAO — multichain' },
  { pillar: 'AI Agents',         color: '#10b981', href: '/services/ai-agents/', sub: 'Agentic AI, RAG, voice agents, automation' },
  { pillar: 'Product Studio',    color: '#F6851B', href: '/services/product-studio/', sub: 'End-to-end SaaS product builds' },
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

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: scrolled ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.8)',
      backdropFilter: 'blur(8px)',
      borderBottom: scrolled ? '1px solid #e5e7eb' : 'none',
      boxShadow: scrolled ? '0 1px 8px rgba(0,0,0,0.06)' : 'none',
      transition: 'all 0.2s',
    }}>
      <nav style={{
        maxWidth: 1280, margin: '0 auto',
        padding: '0 40px', height: 56,
        display: 'flex', alignItems: 'center', gap: 32,
      }}>
        <Logo size="sm" />

        {/* Desktop links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flex: 1 }}>
          <div style={{ position: 'relative' }}
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 14, color: '#676767', fontFamily: 'var(--font-brand)',
                letterSpacing: '-0.01em', padding: 0,
              }}
              aria-expanded={dropdownOpen}
            >
              Services
              <ChevronDown size={14} style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
            </button>

            {dropdownOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', left: 0,
                width: 260, background: '#fff',
                border: '1px solid #e5e7eb', borderRadius: 12,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)', padding: 8,
              }}>
                {services.map(s => (
                  <a key={s.pillar} href={s.href} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 12px', borderRadius: 8, textDecoration: 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0, marginTop: 5 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: s.color, letterSpacing: '-0.01em' }}>{s.pillar}</div>
                      <div style={{ fontSize: 11, color: '#999999', marginTop: 2 }}>{s.sub}</div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {navLinks.map(link => (
            <a key={link.label} href={link.href} style={{ fontSize: 14, color: '#676767', textDecoration: 'none', letterSpacing: '-0.01em' }}>
              {link.label}
            </a>
          ))}
        </div>

        <Button href="/contact/" size="sm">Let&apos;s Talk &rarr;</Button>

        {/* Mobile hamburger */}
        <button
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'none', color: '#676767' }}
          onClick={() => setMobileOpen(v => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {mobileOpen && (
        <div style={{ borderTop: '1px solid #e5e7eb', background: '#fff', padding: '16px 40px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {services.map(s => (
            <a key={s.pillar} href={s.href} style={{ fontSize: 14, color: '#303030', textDecoration: 'none' }}>{s.pillar}</a>
          ))}
          {navLinks.map(link => (
            <a key={link.label} href={link.href} style={{ fontSize: 14, color: '#676767', textDecoration: 'none' }}>{link.label}</a>
          ))}
          <Button href="/contact/" size="sm">Let&apos;s Talk &rarr;</Button>
        </div>
      )}
    </header>
  )
}
