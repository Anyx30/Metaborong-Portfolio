'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'
import { useGeo } from '@/lib/use-geo'
import { Reveal } from '@/components/ui/reveal'
import { Typewriter } from '@/components/ui/typewriter'

/** Two-letter ISO country code → flag emoji via Regional Indicator Symbols.
 *  Returns '' for invalid input. */
function countryFlag(code: string): string {
  if (!code || code.length !== 2) return ''
  const upper = code.toUpperCase()
  const A = 0x1F1E6
  const offset = 'A'.charCodeAt(0)
  const cp1 = A + upper.charCodeAt(0) - offset
  const cp2 = A + upper.charCodeAt(1) - offset
  if (cp1 < A || cp1 > A + 25 || cp2 < A || cp2 > A + 25) return ''
  return String.fromCodePoint(cp1, cp2)
}

export function HeroSection() {
  const [scrolled, setScrolled] = useState(false)
  const geo = useGeo()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Pause the ASCII shimmer filter when the hero scrolls out of view.
  // Frees the compositor + saves battery on mobile while in-section visuals stay live.
  const asciiBoxRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const box = asciiBoxRef.current
    if (!box) return
    const img = box.querySelector('.hero-ascii-image')
    if (!img) return
    const obs = new IntersectionObserver(
      ([entry]) => img.setAttribute('data-active', String(entry.isIntersecting)),
      { threshold: 0 },
    )
    obs.observe(box)
    return () => obs.disconnect()
  }, [])

  return (
    <section className="relative min-h-screen bg-bg-subtle">
      <div className="max-w-[1600px] mx-auto min-h-screen grid grid-cols-1 lg:grid-cols-[57fr_43fr]">
        {/* Left: copy */}
        <Reveal className="flex flex-col justify-center pt-[104px] pb-[48px] lg:pt-[120px] lg:pb-[64px] px-[24px] md:px-[48px] lg:px-[112px] xl:px-[144px]">
          {/* Eyebrow chip */}
          <div className="inline-flex items-center gap-2 mb-7 bg-bg border border-border rounded-sm px-3 py-[5px] w-fit">
            <span className="w-2 h-2 bg-brand rounded-sm shrink-0 inline-block" />
            <Eyebrow>
              Web3 Development · AI Agents · Product Studio
              {geo?.country && geo?.city && ` · ${countryFlag(geo.country)} ${geo.city}`}
            </Eyebrow>
          </div>

          {/* H1 */}
          <h1 className="text-[clamp(40px,4.8vw,72px)] font-black tracking-[-0.04em] leading-[1.02] text-dark mb-6 whitespace-nowrap">
            <Typewriter
              lines={[
                { text: 'Web3 protocols.' },
                { text: 'AI agents.' },
                { text: 'Shipped.', className: 'text-brand' },
              ]}
              durationMs={650}
              startDelayMs={150}
            />
          </h1>

          {/* AEO extraction blockquote */}
          <blockquote cite="/#services" className="mb-6">
            <p className="text-base text-gray leading-[1.6] tracking-[-0.005em] max-w-[560px]">
              Metaborong is a remote-first, globally distributed development studio of senior
              engineers. The studio builds Web3 protocols on Ethereum and Solana, AI agent
              systems, and SaaS products for founders and early-stage startups: DeFi, smart
              contracts, agentic workflow automation, voice agents, and full-stack MVP
              engineering.
            </p>
          </blockquote>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <Button href="/#contact" size="lg" arrow="→">Get a scope</Button>
            <Button href="/#work" variant="ghost" size="lg">Open recent work</Button>
          </div>
        </Reveal>

        {/* Right: ASCII-art still — replaces the orb */}
        <div className="relative overflow-hidden h-[60vh] lg:h-auto lg:min-h-screen flex items-center justify-center">
          {/* Inner box constrains the ASCII-art to a sensible size on tall viewports. */}
          <div ref={asciiBoxRef} className="relative w-[86%] h-[80%] max-w-[520px] max-h-[700px]">
            {/* SVG filter that injects pixel-level jitter via animated turbulence noise.
               Lives inline so the whole shimmer is GPU-rasterized and CSS-toggleable. */}
            <svg
              className="absolute w-0 h-0 pointer-events-none"
              aria-hidden="true"
              focusable="false"
            >
              <filter
                id="hero-ascii-shimmer"
                x="0%"
                y="0%"
                width="100%"
                height="100%"
              >
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.9"
                  numOctaves="1"
                  seed="1"
                  result="noise"
                >
                  <animate
                    attributeName="seed"
                    values="1;7;3;9;5;1"
                    dur="2.6s"
                    repeatCount="indefinite"
                    calcMode="discrete"
                  />
                </feTurbulence>
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="noise"
                  scale="8"
                  xChannelSelector="R"
                  yChannelSelector="G"
                >
                  {/* Glitch spike: scale jumps to 14 briefly every 3s for a subtle tear */}
                  <animate
                    attributeName="scale"
                    values="8;8;14;8;8"
                    keyTimes="0;0.45;0.5;0.55;1"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </feDisplacementMap>
              </filter>
            </svg>
            <Image
              src="/hero-ascii-art.png"
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 520px, 86vw"
              className="hero-ascii-image object-contain object-center select-none pointer-events-none"
            />
            {/* Inset vignette anchored to the image edges — matches Figma's
               tight inset shadow (20px blur + 20px spread on a ~531px frame). */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow: 'inset 0 0 36px 30px var(--color-bg-subtle)',
              }}
            />
            {/* Glassmorphic overlay "windows" — three pillar proofs, anchored to the image frame */}
            <HeroOverlayCard
              loadingLabels={['Cogitating…', 'Reasoning…', 'Inferring…', 'Embedding…']}
              resultLabel="w₁ 0.83, ∑ 0.44"
              style={{ left: '8.7%', top: '25.3%' }}
            />
            <HeroOverlayCard
              loadingLabels={['Mining block…', 'Signing tx…', 'Validating…', 'Committing…']}
              resultLabel="0x4a7f..."
              style={{ left: '41.6%', top: '8.2%' }}
            />
            <HeroOverlayCard
              loadingLabels={['Deploying…', 'Building…', 'Migrating…', 'Scaling…']}
              resultLabel="/v1/deploy"
              style={{ left: '66.9%', top: '34.5%' }}
            />
          </div>
        </div>
      </div>

      {/* Scroll-down affordance — centered on full viewport, not the left column */}
      <div
        aria-hidden="true"
        className={`absolute bottom-[40px] left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-light transition-opacity duration-300 z-10 ${
          scrolled ? 'opacity-0' : 'opacity-100'
        } motion-safe:animate-[heroScrollBounce_1.6s_cubic-bezier(0.45,0,0.55,1)_infinite]`}
      >
        <ChevronDown size={16} strokeWidth={2} />
        <span className="text-[10px] tracking-[0.15em] uppercase">Scroll</span>
      </div>
    </section>
  )
}

/** Glassmorphic "browser-window" card overlay — used over the hero ASCII-art
 *  to encode the three pillars (AI weights, web3 hash, product API path).
 *  Cycles loading → result → loading → result while hero is in viewport.
 *  Pauses when hero scrolls out of view (mirror of ASCII shimmer pattern). */
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

  // Pause cycle when card scrolls out of view (matches ASCII shimmer gate)
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
      // Park transitions while out of view
      if (!inViewRef.current) {
        timer = setTimeout(() => advance(to), 500)
        return
      }
      if (to === 'result') {
        setPhase('result')
        // Settled hold before re-entering loading
        timer = setTimeout(() => advance('loading'), 6000)
      } else {
        setGerundIdx(i => (i + 1) % loadingLabels.length)
        setCycle(c => c + 1)
        setPhase('loading')
        // Loading window before swap to result
        timer = setTimeout(() => advance('result'), 1500)
      }
    }

    // Initial sequence: card pop completes ~1080ms, loading text types ~1100→1500ms,
    // hold ~800ms, swap to result at 2300ms. Subsequent cycles use 1500ms loading window.
    timer = setTimeout(() => advance('result'), 2300)

    return () => { cancelled = true; if (timer) clearTimeout(timer) }
  }, [loadingLabels.length])

  return (
    <div
      ref={cardRef}
      aria-hidden="true"
      className="hero-card-pop absolute z-20 w-[92px] h-[108px] lg:w-[116px] lg:h-[137px] backdrop-blur-[15px] border border-white/80 opacity-0"
      style={style}
    >
      {/* Title bar with three traffic-light squares */}
      <div className="absolute inset-x-0 top-0 h-[22px] bg-white/95 border-b border-white flex items-center gap-[2px] px-[3px]">
        <span className="w-[15px] h-[14px] bg-[#d90429]" />
        <span className="w-[15px] h-[14px] bg-[#ffba08]" />
        <span className="w-[15px] h-[14px] bg-[#38b000]" />
      </div>
      {/* Body label, bottom-left */}
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
