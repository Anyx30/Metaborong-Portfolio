'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { pillars, type PillarId } from '@/components/sections/services-data'
import { ServicesIsoCanvas } from '@/components/sections/services-iso-canvas'

const TOP_N = 5

export function ServicesPillars() {
  const [activeId, setActiveId] = useState<PillarId>(pillars[0].id)
  const wrapRef = useRef<HTMLDivElement>(null)
  const anchorRefs = useRef<Map<PillarId, HTMLDivElement>>(new Map())

  // Scroll-driven active pillar (lg+ via tall sticky-pinned section).
  useEffect(() => {
    const refsMap = anchorRefs.current
    if (refsMap.size === 0) return

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) {
          const id = (visible[0].target as HTMLElement).dataset.pillar as PillarId
          if (id) setActiveId(id)
        }
      },
      {
        rootMargin: '-49% 0px -49% 0px',
        threshold: 0,
      },
    )

    refsMap.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  const active = pillars.find((p) => p.id === activeId)!

  return (
    <>
      <ScopedStyle />

      {/* Mobile (lg-): compact stack, no pinning. */}
      <div className="lg:hidden mt-[48px]">
        <MobileStack />
      </div>

      {/* Desktop (lg+): scrolltelling. */}
      <div ref={wrapRef} className="hidden lg:block relative h-[260vh]">
        {pillars.map((p, i) => (
          <div
            key={p.id}
            ref={(el) => {
              if (el) anchorRefs.current.set(p.id, el)
              else anchorRefs.current.delete(p.id)
            }}
            data-pillar={p.id}
            aria-hidden="true"
            className="absolute left-0 w-px pointer-events-none"
            style={{
              top: `${(i * 100) / 3}%`,
              height: `${100 / 3}%`,
            }}
          />
        ))}

        <div className="sticky top-0 h-screen flex items-center">
          <div className="w-full grid grid-cols-[minmax(320px,380px)_1fr] items-stretch">
            <LeftAccordion activeId={activeId} setActiveId={setActiveId} active={active} />
            <RightCanvas active={active} activeId={activeId} />
          </div>
        </div>
      </div>
    </>
  )
}

/* ---------- LEFT ACCORDION ---------- */

function LeftAccordion({
  activeId,
  setActiveId,
  active,
}: {
  activeId: PillarId
  setActiveId: (id: PillarId) => void
  active: (typeof pillars)[number]
}) {
  return (
    <div className="border-r border-border-subtle bg-white overflow-hidden flex flex-col h-[600px]">
      <div className="px-[20px] py-[14px] border-b border-border-subtle flex items-center justify-between flex-shrink-0">
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-gray-light">
          Three pillars
        </span>
        <span className="font-mono text-[11px] font-bold tracking-[0.06em]">
          <span style={{ color: active.color }}>{active.num}</span>
          <span className="text-gray-light"> / 03</span>
        </span>
      </div>

      <ol className="overflow-y-auto flex-1">
        {pillars.map((pillar, idx) => {
          const isActive = pillar.id === activeId
          const isLast = idx === pillars.length - 1
          const visibleChildren = pillar.children.slice(0, TOP_N)
          return (
            <li
              key={pillar.id}
              className={`relative ${isLast ? '' : 'border-b border-border-subtle'}`}
              style={{ '--pillar-color': pillar.color } as React.CSSProperties}
            >
              <span
                aria-hidden="true"
                className="services-row-bar absolute left-0 top-0 bottom-0 w-[3px]"
                data-active={isActive}
                style={{ backgroundColor: pillar.color }}
              />

              <button
                type="button"
                onClick={() => {
                  setActiveId(pillar.id)
                  const wrap = document.querySelector('[data-services-anchor-wrap]') as HTMLElement | null
                  if (wrap) {
                    const i = pillars.findIndex((p) => p.id === pillar.id)
                    const rect = wrap.getBoundingClientRect()
                    const sectionTop = rect.top + window.scrollY
                    const target =
                      sectionTop + (wrap.offsetHeight / pillars.length) * (i + 0.5) - window.innerHeight / 2
                    window.scrollTo({ top: target, behavior: 'smooth' })
                  }
                }}
                aria-expanded={isActive}
                aria-controls={`pillar-body-${pillar.id}`}
                className="services-row-button w-full text-left px-[24px] py-[18px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset"
                data-active={isActive}
              >
                <span
                  className="font-mono text-[12px] font-bold tracking-[0.06em] block services-row-num"
                  data-active={isActive}
                  style={isActive ? { color: pillar.color } : undefined}
                >
                  [{pillar.num}]
                </span>
                <span className="block mt-[6px] text-[15px] font-bold tracking-[-0.005em] uppercase services-row-label">
                  {pillar.label}
                </span>
              </button>

              <div
                id={`pillar-body-${pillar.id}`}
                className="services-row-body"
                data-active={isActive}
                role="region"
              >
                <div className="services-row-body-inner">
                  <div className="px-[24px] pb-[20px]">
                    <ul role="list" className="space-y-[4px]">
                      {visibleChildren.map((child) => (
                        <li key={child.slug}>
                          <Link
                            href={`${pillar.hubHref}${child.slug}/`}
                            className="group flex items-center justify-between gap-[12px] min-h-[44px] -mx-[8px] px-[10px] py-[8px] rounded-sm hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 transition-colors duration-[var(--duration-instant)]"
                          >
                            <span className="text-[13px] font-medium tracking-[-0.005em] text-dark">
                              {child.name}
                            </span>
                            <ArrowUpRight className="shrink-0 text-gray-light group-hover:text-[var(--pillar-color)] transition-colors duration-[var(--duration-instant)]" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-[12px] pt-[12px] border-t border-border-subtle">
                      <Link
                        href={pillar.hubHref}
                        className="inline-flex items-center gap-[8px] text-[13px] font-medium hover:opacity-80 transition-opacity duration-[var(--duration-instant)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                        style={{ color: pillar.color }}
                      >
                        <span>See all {pillar.label} services</span>
                        <ArrowRight />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/* ---------- RIGHT CANVAS (now powered by R3F) ---------- */

function RightCanvas({ active, activeId }: { active: (typeof pillars)[number]; activeId: PillarId }) {
  return (
    <div className="bg-white overflow-hidden h-[600px] flex flex-col">
      <div className="px-[24px] pt-[20px] pb-[12px] flex-shrink-0">
        <p
          key={`hl-${active.id}`}
          className="services-canvas-headline font-mono text-[11px] font-bold uppercase tracking-[0.14em]"
          style={{ color: active.color }}
        >
          {active.headline}
        </p>
      </div>
      <div className="relative flex-1">
        <ServicesIsoCanvas activeId={activeId} />
      </div>
      <div className="px-[24px] py-[20px] border-t border-border-subtle flex-shrink-0">
        <p key={`b-${active.id}`} className="services-canvas-body text-[14px] leading-[1.65] text-gray max-w-[640px]">
          {active.body}
        </p>
      </div>
    </div>
  )
}

/* ---------- MOBILE STACK ---------- */

function MobileStack() {
  return (
    <div className="space-y-[48px]">
      {pillars.map((pillar) => (
        <article
          key={pillar.id}
          id={`pillar-${pillar.id}-mobile`}
          aria-labelledby={`pillar-${pillar.id}-mobile-heading`}
          style={{ '--pillar-color': pillar.color } as React.CSSProperties}
        >
          <p className="mb-[8px]">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-gray-light">
              [{pillar.num}]
            </span>
            <span
              className="font-mono ml-[10px] text-[11px] font-bold uppercase tracking-[0.1em]"
              style={{ color: pillar.color }}
            >
              {pillar.label}
            </span>
          </p>
          <h3
            id={`pillar-${pillar.id}-mobile-heading`}
            className="text-[22px] font-bold tracking-[-0.025em] leading-tight text-dark"
          >
            {pillar.headline}
          </h3>
          <p className="mt-[12px] text-[15px] leading-[1.65] text-gray">{pillar.body}</p>
          <ul role="list" className="mt-[20px] space-y-[8px]">
            {pillar.children.slice(0, TOP_N).map((child) => (
              <li key={child.slug}>
                <Link
                  href={`${pillar.hubHref}${child.slug}/`}
                  className="group flex items-center justify-between gap-[12px] min-h-[44px] px-[16px] py-[12px] border border-border bg-white hover:border-[var(--pillar-color)] transition-colors duration-[var(--duration-instant)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  <span className="text-[13px] font-bold uppercase tracking-[0.02em] text-dark leading-tight">
                    {child.name}
                  </span>
                  <ArrowUpRight className="shrink-0 text-gray-light group-hover:text-[var(--pillar-color)] transition-colors duration-[var(--duration-instant)]" />
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-[16px]">
            <Link
              href={pillar.hubHref}
              className="inline-flex items-center gap-[8px] text-[14px] font-medium"
              style={{ color: pillar.color }}
            >
              <span>See all {pillar.label} services</span>
              <ArrowRight />
            </Link>
          </div>
        </article>
      ))}
    </div>
  )
}

/* ---------- SCOPED STYLES ---------- */

function ScopedStyle() {
  return (
    <style precedence="default">{`
      .services-row-button {
        background-color: transparent;
        transition: background-color var(--duration-fast, 250ms);
        cursor: pointer;
      }
      .services-row-button[data-active="true"] { background-color: #f5f7ff; }
      .services-row-button[data-active="false"]:hover { background-color: #fafbff; }
      .services-row-num { color: #999999; transition: color var(--duration-fast, 250ms); }
      .services-row-label { color: #676767; transition: color var(--duration-fast, 250ms); }
      .services-row-button[data-active="true"] .services-row-label { color: #303030; }
      .services-row-bar { opacity: 0; transition: opacity var(--duration-fast, 250ms); }
      .services-row-bar[data-active="true"] { opacity: 1; }
      .services-row-body {
        display: grid;
        grid-template-rows: 1fr;
        transition: grid-template-rows var(--duration-base, 400ms) cubic-bezier(0.16, 1, 0.3, 1),
                    opacity var(--duration-base, 400ms) cubic-bezier(0.16, 1, 0.3, 1);
        opacity: 1;
      }
      .services-row-body[data-active="false"] { grid-template-rows: 0fr; opacity: 0; }
      .services-row-body-inner { min-height: 0; overflow: hidden; }
      .services-canvas-headline, .services-canvas-body {
        animation: services-fade-in var(--duration-fast, 250ms) ease-out;
      }
      @keyframes services-fade-in {
        from { opacity: 0; transform: translateY(4px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @media (prefers-reduced-motion: reduce) {
        .services-row-button, .services-row-num, .services-row-label,
        .services-row-bar, .services-row-body { transition: none !important; }
        .services-canvas-headline, .services-canvas-body { animation: none !important; }
      }
    `}</style>
  )
}

function ArrowUpRight({ className = '' }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className={className}>
      <path d="M3 11L11 3M11 3H4.5M11 3V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  )
}

function ArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 7H12M12 7L7.5 2.5M12 7L7.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  )
}
