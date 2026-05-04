'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Reveal } from '@/components/ui/reveal'

// Three.js: client-only, lazy-loaded after paint — no LCP impact
const HeroOrb = dynamic(
  () => import('@/components/hero-orb/hero-orb').then(m => ({ default: m.HeroOrb })),
  { ssr: false, loading: () => null }
)

export function HeroSection() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section className="relative min-h-screen bg-bg-subtle">
      <div className="max-w-[1600px] mx-auto min-h-screen grid grid-cols-1 lg:grid-cols-[60fr_40fr]">
        {/* Left: copy */}
        <Reveal className="flex flex-col justify-center py-[64px] lg:py-[96px] px-[24px] md:px-[48px] lg:px-[96px] xl:px-[128px]">
          {/* Eyebrow chip */}
          <div className="inline-flex items-center gap-2 mb-7 bg-bg border border-border rounded-sm px-3 py-[5px] w-fit">
            <span className="w-2 h-2 bg-brand rounded-sm shrink-0 inline-block" />
            <Eyebrow>Web3 Development · AI Agents · Product Studio</Eyebrow>
          </div>

          {/* H1 */}
          <h1 className="text-[clamp(40px,5vw,72px)] font-bold tracking-[-0.04em] leading-[1.02] text-dark mb-6">
            Web3 protocols.
            <br />
            AI agents.
            <br />
            <span className="text-brand">Shipped.</span>
          </h1>

          {/* AEO extraction blockquote — promoted */}
          <blockquote cite="/about" className="border-l-[3px] border-brand pl-5 py-1 mb-6">
            <p className="text-base font-medium text-dark leading-[1.6] tracking-[-0.015em] max-w-[560px]">
              Metaborong is a Web3 and AI agent development studio that ships DeFi protocols,
              autonomous AI systems, and custom SaaS products for founders and crypto-native teams
              across the US and Europe.
            </p>
          </blockquote>

          {/* Body lead — demoted */}
          <p className="text-sm text-gray leading-[1.6] tracking-[-0.005em] max-w-[480px] mb-8">
            For founders who need a technical partner that ships — not an agency that pitches.
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-3 mb-5">
            <Button href="/contact/" size="lg">Start a Project &rarr;</Button>
            <Button href="/work/" variant="ghost" size="lg">See Our Work</Button>
          </div>

          {/* Micro-copy */}
          <p className="text-xs text-gray tracking-[-0.01em]">
            No pitch decks. No retainers. Direct from founders.
          </p>
        </Reveal>

        {/* Right: Three.js orb */}
        <div className="relative overflow-hidden flex items-center justify-center h-[60vh] lg:h-auto lg:min-h-screen">
          <HeroOrb />
        </div>
      </div>

      {/* Scroll-down affordance — centered on full viewport, not the left column */}
      <div
        aria-hidden="true"
        className={`absolute bottom-[40px] left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-light transition-opacity duration-300 z-10 ${scrolled ? 'opacity-0' : 'opacity-100'
          } motion-safe:animate-[heroScrollBounce_1.6s_cubic-bezier(0.45,0,0.55,1)_infinite]`}
      >
        <ChevronDown size={16} strokeWidth={2} />
        <span className="text-[10px] tracking-[0.15em] uppercase">Scroll</span>
      </div>
    </section>
  )
}
