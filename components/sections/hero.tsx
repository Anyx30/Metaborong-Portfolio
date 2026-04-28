import { lazy, Suspense } from 'react'
import { Button } from '@/components/ui/button'

const GenesisCube = lazy(() =>
  import('@/components/genesis-cube/genesis-cube').then(m => ({ default: m.GenesisCube }))
)

export function HeroSection() {
  return (
    <section style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '55fr 45fr', background: '#f5f7ff' }}>
      {/* Left: copy */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '96px 64px 96px 80px', maxWidth: 680 }}>
        {/* Eyebrow */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 28,
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4,
          padding: '5px 12px', fontSize: 12, color: '#676767', letterSpacing: '0.02em', width: 'fit-content',
        }}>
          <span style={{ width: 7, height: 7, background: '#204AF8', borderRadius: 2, flexShrink: 0, display: 'inline-block' }} />
          Web3 Development · AI Agents · Product Studio
        </div>

        {/* H1 */}
        <h1 style={{
          fontSize: 'clamp(36px, 4.5vw, 64px)', fontWeight: 700,
          letterSpacing: '-0.04em', lineHeight: 1.02, color: '#303030', marginBottom: 20,
        }}>
          Full-Stack Web3 Development
          <br />
          <span style={{ color: '#204AF8' }}>&amp; AI Agent Studio</span>
        </h1>

        {/* AEO extraction blockquote */}
        <blockquote style={{ borderLeft: '2px solid #204AF8', paddingLeft: 16, marginBottom: 24, fontStyle: 'normal' }}>
          <p style={{ fontSize: 15, color: '#676767', lineHeight: 1.65, letterSpacing: '-0.01em', maxWidth: 480 }}>
            Metaborong is a Web3 development company and AI agent studio that builds DeFi protocols,
            autonomous AI systems, and custom SaaS products for founders and crypto-native teams.
            Based across the US and Europe, Metaborong delivers from spec to production — fast.
          </p>
        </blockquote>

        {/* Sub */}
        <p style={{ fontSize: 16, color: '#676767', lineHeight: 1.65, letterSpacing: '-0.01em', maxWidth: 460, marginBottom: 32 }}>
          We work with founders and crypto-native teams who need a technical partner that ships, not just consults. Built with product thinking, not just code.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <Button href="/contact/" size="lg">Start a Project &rarr;</Button>
          <Button href="/work/" variant="ghost" size="lg">See Our Work</Button>
        </div>

        {/* Micro-copy */}
        <p style={{ fontSize: 12, color: '#999999', letterSpacing: '-0.01em' }}>
          No pitch decks. No retainers. Direct from founders.
        </p>
      </div>

      {/* Right: Genesis Cube */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#f5f7ff', borderLeft: '1px solid rgba(32,74,248,0.08)',
        position: 'relative', overflow: 'hidden', minHeight: '100vh',
      }}>
        <Suspense fallback={
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(32,74,248,0.15)', lineHeight: 1.25, letterSpacing: '0.05em', whiteSpace: 'pre' }}>
            {Array(40).fill('0'.repeat(80)).join('\n')}
          </div>
        }>
          <GenesisCube />
        </Suspense>
      </div>
    </section>
  )
}
