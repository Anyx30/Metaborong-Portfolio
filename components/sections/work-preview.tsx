'use client'

import { useEffect, useRef } from 'react'

const projects = [
  { name: 'KGeN',               category: 'Web3 · Gaming', color: '#296ff0' },
  { name: 'DATA3 AI',           category: 'AI · Data',     color: '#10b981' },
  { name: 'Bionic',             category: 'Web3 · DeFi',   color: '#296ff0' },
  { name: 'Bayan — AI Chatbot', category: 'AI · Voice',    color: '#10b981' },
]

export function WorkPreviewSection() {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.innerWidth >= 1024) return
    const container = scrollRef.current
    if (!container) return
  }, [])

  return (
    <section className="bg-bg px-[16px] py-[56px] sm:px-[24px] md:px-[48px] md:py-[72px] lg:px-[96px] lg:py-[80px] xl:px-[128px]">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-[20px] flex flex-col gap-[18px] sm:mb-[24px] sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-[12px] text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-light">Our work</p>
            <h2 className="text-[clamp(32px,4vw,52px)] font-bold tracking-[-0.035em] text-dark">What we&apos;ve built</h2>
          </div>
          <a href="/#contact" className="inline-flex min-h-[44px] items-center text-[14px] font-semibold text-brand no-underline">Talk to us →</a>
        </div>
        <p className="mb-[36px] max-w-[600px] text-[16px] leading-[1.65] tracking-[-0.01em] text-gray sm:mb-[48px]">
          Live products across DeFi, AI, gaming, and SaaS — each shipped with founders we still work with. Case studies are on the way.
        </p>
        <div className="relative mt-[24px] [--cw:calc(100vw-32px)] sm:[--cw:calc(100vw-48px)]">
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto snap-x snap-mandatory gap-[16px] lg:grid lg:grid-cols-4 lg:gap-[16px] pb-[24px] -mx-[16px] px-[16px] sm:-mx-[24px] sm:px-[24px] lg:mx-0 lg:px-0 lg:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {projects.map(p => (
              <div 
                key={p.name} 
                className="snap-center snap-always shrink-0 w-[calc(100vw-32px)] sm:w-[calc(100vw-48px)] md:w-[calc(50vw-32px)] lg:w-auto lg:max-w-none flex"
              >
                <div className="flex w-full flex-col gap-[12px] rounded-[12px] border border-border px-[20px] py-[24px] sm:px-[24px] sm:py-[28px] lg:px-[28px] lg:py-[32px]">
                  <div className="mb-[8px] h-[80px] rounded-[8px] bg-bg-subtle" />
                  <div className="text-[11px] font-semibold uppercase tracking-[0.06em]" style={{ color: p.color }}>{p.category}</div>
                  <h3 className="text-[18px] font-bold tracking-[-0.025em] text-dark">{p.name}</h3>
                  <a href="/#contact" className="mt-auto inline-flex min-h-[44px] items-center text-[13px] font-medium text-brand no-underline">Read more →</a>
                </div>
              </div>
            ))}
          </div>

          {/* Floating swipe hint arrow (Left) */}
          <div 
            className="pointer-events-none absolute lg:hidden text-gray opacity-80 motion-safe:animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"
            style={{
              top: 'calc(50% - 12px)',
              left: 'calc(var(--cw) * 0.04)',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="square" strokeLinejoin="miter">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </div>

          {/* Floating swipe hint arrow (Right) */}
          <div 
            className="pointer-events-none absolute lg:hidden text-gray opacity-80 motion-safe:animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"
            style={{
              top: 'calc(50% - 12px)',
              right: 'calc(var(--cw) * 0.04)',
              transform: 'translate(50%, -50%)'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="square" strokeLinejoin="miter">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
