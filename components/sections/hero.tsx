'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { HeroAsciiCanvas } from '@/components/sections/hero-ascii-canvas'
import { ChevronDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Reveal } from '@/components/ui/reveal'
import { Typewriter } from '@/components/ui/typewriter'

// Source image is 2754×1536 → aspect 2754/1536. The stage is locked to this
// ratio and scaled to COVER the viewport, so the image and the three cards
// share one coordinate space and the cards stay registered on the flowers
// at every viewport size (pure CSS, no tracking JS).
const STAGE_W = 'max(100vw,calc(100vh*2754/1536))'
const STAGE_H = 'max(100vh,calc(100vw*1536/2754))'

export function HeroSection() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#0a0e1a]">
      {/* Aspect-locked cover stage: image + cards live here together. */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: STAGE_W, height: STAGE_H }}
      >
        <Image
          src="/hero-bg.jpg"
          alt=""
          data-testid="hero-bg"
          fill
          priority
          sizes="100vw"
          className="object-cover select-none"
        />

        {/* Live ASCII render of the bg; covers the <Image> (kept as SSR/first-
            paint fallback + sample source + structural-test anchor). */}
        <HeroAsciiCanvas />

        {/* Scrim: base veil (mobile legibility, gone at lg) + L1 left gradient.
            Task 3 tuned: veil 0.62 (mobile), gradient 0.94/0.88/0.18/0 to pass WCAG-AA. */}
        <div className="absolute inset-0 bg-[rgba(8,12,24,0.62)] lg:bg-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,12,24,0.94)_0%,rgba(8,12,24,0.88)_30%,rgba(8,12,24,0.18)_52%,transparent_66%)]" />

        {/* Three proof windows — over the right flower cluster, current
            low/high/low stagger. Stage-% coords; Task 4 tunes. */}
        <HeroOverlayCard
          loadingLabels={['Cogitating…', 'Reasoning…', 'Inferring…', 'Embedding…']}
          resultLabel="w₁ 0.83, ∑ 0.44"
          style={{ left: '65%', top: '42%' }}
        />
        <HeroOverlayCard
          loadingLabels={['Mining block…', 'Signing tx…', 'Validating…', 'Committing…']}
          resultLabel="0x4a7f..."
          style={{ left: '76%', top: '16%' }}
        />
        <HeroOverlayCard
          loadingLabels={['Deploying…', 'Building…', 'Migrating…', 'Scaling…']}
          resultLabel="/v1/deploy"
          style={{ left: '76%', top: '52%' }}
        />
      </div>

      {/* Copy — section-anchored (tracks the viewport-relative left scrim). */}
      <Reveal className="relative z-10 flex min-h-screen flex-col justify-center px-[24px] md:px-[48px] lg:px-[96px] xl:px-[128px] py-[120px]">
        <div className="max-w-[620px]">
          {/* Eyebrow chip — original structure kept; recolored for dark only. */}
          <div className="inline-flex items-center mb-7 bg-white/[0.07] border border-white/25 rounded-sm px-3 py-[6px] w-fit">
            <Eyebrow className="text-[12px]! tracking-[0.12em]! text-off-white/[0.78]!">
              Web3 &amp; AI development studio
            </Eyebrow>
          </div>

          <h1 className="text-[clamp(32px,4.8vw,72px)] font-black tracking-[-0.04em] leading-[1.02] text-off-white mb-6">
            <Typewriter
              lines={[
                { text: 'Web3 protocols.' },
                { text: 'AI agents.' },
                { text: 'Shipped.', className: 'text-[#7fb3ff]' },
              ]}
              durationMs={650}
              startDelayMs={150}
            />
          </h1>

          <blockquote cite="/#services" className="mb-6">
            <p className="text-base text-off-white/[0.86] leading-[1.6] tracking-[-0.005em] max-w-[560px]">
              Metaborong is a Web3 development company and AI agent studio. A
              remote-first team of senior engineers, globally distributed. We ship
              DeFi protocols and smart contract audits across EVM chains and Solana,
              AI agents spanning RAG, agentic workflows, and generative systems, and
              full-stack SaaS for founders and early-stage startups. Spec to
              production, fast.
            </p>
          </blockquote>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Button href="/#contact" size="lg" arrow="→" className="justify-center w-full sm:w-auto">Get a scope</Button>
            <Button
              href="/#work"
              variant="ghost"
              size="lg"
              className="justify-center w-full sm:w-auto text-white! border-white/45! hover:bg-white/10! hover:border-white/70! active:bg-white/15!"
            >
              Open recent work
            </Button>
          </div>
        </div>
      </Reveal>

      <div
        aria-hidden="true"
        className={`absolute bottom-[40px] left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/70 transition-opacity duration-300 z-10 ${
          scrolled ? 'opacity-0' : 'opacity-100'
        } motion-safe:animate-[heroScrollBounce_1.6s_cubic-bezier(0.45,0,0.55,1)_infinite]`}
      >
        <ChevronDown size={16} strokeWidth={2} />
        <span className="text-[10px] tracking-[0.15em] uppercase">Scroll</span>
      </div>
    </section>
  )
}

/** Glassmorphic "browser-window" card overlay. Encodes the three pillars
 *  (AI weights, web3 hash, product API path). Cycles loading → result while
 *  the hero is in viewport; pauses out of view. Behavior unchanged from the
 *  pre-redesign component — only the responsive-visibility class and the
 *  data-hero-card hook differ. */
function HeroOverlayCard({
  loadingLabels,
  resultLabel,
  style,
}: {
  loadingLabels: string[]
  resultLabel: string
  style: React.CSSProperties
}) {
  const [phase, setPhase] = useState<'loading' | 'result'>('loading')
  const [gerundIdx, setGerundIdx] = useState(0)
  const [cycle, setCycle] = useState(0)
  const cardRef = useRef<HTMLDivElement | null>(null)
  const inViewRef = useRef(true)

  useEffect(() => {
    const card = cardRef.current
    if (!card) return
    const obs = new IntersectionObserver(
      ([entry]) => { inViewRef.current = entry.isIntersecting },
      { threshold: 0 },
    )
    obs.observe(card)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPhase('result')
      return
    }
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | null = null

    const advance = (to: 'loading' | 'result') => {
      if (cancelled) return
      if (!inViewRef.current) {
        timer = setTimeout(() => advance(to), 500)
        return
      }
      if (to === 'result') {
        setPhase('result')
        timer = setTimeout(() => advance('loading'), 6000)
      } else {
        setGerundIdx(i => (i + 1) % loadingLabels.length)
        setCycle(c => c + 1)
        setPhase('loading')
        timer = setTimeout(() => advance('result'), 1500)
      }
    }

    timer = setTimeout(() => advance('result'), 2300)

    return () => { cancelled = true; if (timer) clearTimeout(timer) }
  }, [loadingLabels.length])

  return (
    <div
      ref={cardRef}
      data-hero-card
      aria-hidden="true"
      className="hero-card-pop hidden lg:block absolute z-20 w-[92px] h-[108px] lg:w-[116px] lg:h-[137px] backdrop-blur-[15px] border border-white/80 opacity-0"
      style={style}
    >
      <div className="absolute inset-x-0 top-0 h-[22px] bg-white/95 border-b border-white flex items-center gap-[2px] px-[3px]">
        <span className="w-[15px] h-[14px] bg-[#d90429]" />
        <span className="w-[15px] h-[14px] bg-[#ffba08]" />
        <span className="w-[15px] h-[14px] bg-[#38b000]" />
      </div>
      {phase === 'loading' ? (
        <div className="absolute left-[9px] bottom-[10px] flex items-center gap-[5px] text-white whitespace-nowrap drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">
          <Loader2 size={11} strokeWidth={2.5} className="animate-spin opacity-90" />
          <span className="font-mono text-[10px] lg:text-[11px] tracking-[-0.01em]">
            <Typewriter
              key={`loading-${cycle}`}
              lines={[{ text: loadingLabels[gerundIdx] }]}
              durationMs={400}
              startDelayMs={cycle === 0 ? 1100 : 0}
            />
          </span>
        </div>
      ) : (
        <p className="absolute left-[9px] bottom-[10px] font-bold text-[11px] lg:text-[12px] tracking-[-0.01em] text-white whitespace-nowrap drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">
          <Typewriter
            key={`result-${cycle}`}
            lines={[{ text: resultLabel }]}
            durationMs={550}
            startDelayMs={0}
          />
        </p>
      )}
    </div>
  )
}
