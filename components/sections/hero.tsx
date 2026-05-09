'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'
import { useGeo } from '@/lib/use-geo'
import { Reveal } from '@/components/ui/reveal'
import { Typewriter } from '@/components/ui/typewriter'

const STATIC_MICROCOPY = 'No pitch decks. No retainers. Direct from founders.'

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
  // SSR-stable default; client effect swaps in a timezone-aware variant after
  // mount so search engines and the first paint show the brand-on-message line.
  const [microCopy, setMicroCopy] = useState(STATIC_MICROCOPY)
  const geo = useGeo()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Re-run when geo changes (post-consent) so the line picks up the country
  // immediately on Accept without waiting for the next minute tick.
  useEffect(() => {
    const update = () => {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
        // IANA strings can be "Etc/GMT" / "UTC" / region-only; prefer the trailing
        // segment when there's a slash, otherwise fall back to the full id.
        const tzCity = tz.includes('/')
          ? tz.split('/').pop()!.replace(/_/g, ' ')
          : tz
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        // When geo is present (consent accepted + Vercel edge headers available),
        // the line names the visitor's country and uses their city if known.
        const city = geo?.city || tzCity
        const country = geo?.country
        setMicroCopy(
          country
            ? `Shipping Web3 to ${country} from ${city}, currently ${time}.`
            : `Shipping from ${city}, currently ${time}.`,
        )
      } catch {
        // Older browser without Intl.DateTimeFormat — keep current copy.
      }
    }
    update()
    const id = setInterval(update, 60_000)
    return () => clearInterval(id)
  }, [geo])

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

          {/* AEO extraction blockquote — promoted */}
          <blockquote cite="/#founders" className="mb-6">
            <p className="text-base font-medium text-dark leading-[1.6] tracking-[-0.015em] max-w-[560px]">
              Metaborong is a Web3 and AI development studio shipping DeFi protocols, AI agent
              systems, and SaaS products for founders across the US and Europe.
            </p>
          </blockquote>

          {/* Body lead — demoted */}
          <p className="text-base text-gray leading-[1.6] tracking-[-0.005em] max-w-[480px] mb-8">
            For founders who need a technical partner that ships — not an agency that pitches.
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-3 mb-5">
            <Button href="/#contact" size="lg" arrow="→">Get a scope</Button>
            <Button href="/#work" variant="ghost" size="lg">See the work</Button>
          </div>

          {/* Micro-copy — context-aware after hydration (timezone + local time) */}
          <p className="font-mono text-[11px] text-gray tracking-[0.02em]">
            {microCopy}
          </p>
        </Reveal>

        {/* Right: ASCII-art still — replaces the orb */}
        <div className="relative overflow-hidden h-[60vh] lg:h-auto lg:min-h-screen flex items-center justify-center">
          {/* Inner box constrains the ASCII-art to a sensible size on tall viewports. */}
          <div className="relative w-[86%] h-[80%] max-w-[520px] max-h-[700px]">
            <Image
              src="/hero-ascii-art.png"
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 520px, 86vw"
              className="object-contain object-center select-none pointer-events-none"
            />
            {/* Inset vignette anchored to the image edges — matches Figma's
               tight inset shadow (20px blur + 20px spread on a ~531px frame). */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow: 'inset 0 0 28px 22px var(--color-bg-subtle)',
              }}
            />
            {/* Glassmorphic overlay "windows" — three pillar proofs, anchored to the image frame */}
            <HeroOverlayCard
              label="w₁ 0.83, ∑ 0.44"
              style={{ left: '8.7%', top: '25.3%' }}
            />
            <HeroOverlayCard
              label="0x4a7f..."
              style={{ left: '41.6%', top: '8.2%' }}
            />
            <HeroOverlayCard
              label="/v1/deploy"
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
 *  to encode the three pillars (AI weights, web3 hash, product API path). */
function HeroOverlayCard({
  label,
  style,
}: {
  label: string
  style: React.CSSProperties
}) {
  return (
    <div
      aria-hidden="true"
      className="absolute z-20 w-[92px] h-[108px] lg:w-[116px] lg:h-[137px] backdrop-blur-[15px] border border-white/80"
      style={style}
    >
      {/* Title bar with three traffic-light squares */}
      <div className="absolute inset-x-0 top-0 h-[22px] bg-white/95 border-b border-white flex items-center gap-[2px] px-[3px]">
        <span className="w-[15px] h-[14px] bg-[#d90429]" />
        <span className="w-[15px] h-[14px] bg-[#ffba08]" />
        <span className="w-[15px] h-[14px] bg-[#38b000]" />
      </div>
      {/* Body label, bottom-left */}
      <p className="absolute left-[9px] bottom-[10px] font-bold text-[11px] lg:text-[12px] tracking-[-0.01em] text-white whitespace-nowrap drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">
        {label}
      </p>
    </div>
  )
}
