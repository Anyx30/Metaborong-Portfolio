'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Eyebrow } from '@/components/ui/eyebrow'
import { pillars, type PillarId } from '@/components/sections/services-data'

const TOP_N = 5

export function ServicesPillars() {
  const [activeId, setActiveId] = useState<PillarId>(pillars[0].id)
  const panelRefs = useRef<Map<PillarId, HTMLElement>>(new Map())

  useEffect(() => {
    const refsMap = panelRefs.current
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
        // Pillar becomes active when ≥40% visible OR when its top crosses 30% from viewport top.
        rootMargin: '-30% 0px -50% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    )

    refsMap.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-[48px] lg:gap-[64px] mt-[64px]">
      {/* Sticky rail (lg+) */}
      <nav
        aria-label="Service pillars"
        className="hidden lg:block sticky top-[120px] self-start"
      >
        <ol className="space-y-[8px]">
          {pillars.map((p) => {
            const isActive = p.id === activeId
            return (
              <li key={p.id}>
                <a
                  href={`#pillar-${p.id}`}
                  data-active={isActive}
                  className="group block px-[16px] py-[14px] border border-border-subtle data-[active=true]:border-border data-[active=true]:bg-white transition-colors duration-[var(--duration-instant)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  <span
                    className="font-mono text-[12px] text-gray-light group-data-[active=true]:text-dark transition-colors duration-[var(--duration-instant)]"
                  >
                    [{p.num}]
                  </span>
                  <span
                    className="block mt-[6px] text-[14px] font-bold tracking-[-0.005em] text-gray group-data-[active=true]:text-dark uppercase transition-colors duration-[var(--duration-instant)]"
                  >
                    {p.label}
                  </span>
                </a>
              </li>
            )
          })}
        </ol>
      </nav>

      {/* Pillar panels */}
      <div className="space-y-[80px] lg:space-y-[160px]">
        {pillars.map((pillar) => {
          const visibleChildren = pillar.children.slice(0, TOP_N)
          return (
            <article
              key={pillar.id}
              id={`pillar-${pillar.id}`}
              data-pillar={pillar.id}
              aria-labelledby={`pillar-${pillar.id}-heading`}
              ref={(el) => {
                if (el) panelRefs.current.set(pillar.id, el)
                else panelRefs.current.delete(pillar.id)
              }}
              className="scroll-mt-[120px] relative"
              style={{ '--pillar-color': pillar.color } as React.CSSProperties}
            >
              {/* Mobile-only inline bracket badge */}
              <Eyebrow as="p" className="lg:hidden font-mono mb-[12px]">
                [{pillar.num}] {pillar.label}
              </Eyebrow>

              <Eyebrow as="p" className="hidden lg:block font-mono mb-[16px]" style={{ color: pillar.color }}>
                {pillar.headline.toUpperCase()}
              </Eyebrow>

              <h3
                id={`pillar-${pillar.id}-heading`}
                className="lg:hidden text-[28px] font-bold tracking-[-0.025em] leading-[1.1] text-dark mb-[24px]"
              >
                {pillar.headline}
              </h3>

              {/* 3D isometric accent */}
              <IsoBlocks active={pillar.id} />

              <p className="mt-[32px] max-w-[640px] text-[16px] leading-[1.65] tracking-[-0.005em] text-gray">
                {pillar.body}
              </p>

              {/* Child services grid */}
              <ul role="list" className="mt-[32px] grid grid-cols-1 sm:grid-cols-2 gap-[8px] max-w-[640px]">
                {visibleChildren.map((child) => (
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

              {/* Hub CTA */}
              <div className="mt-[24px]">
                <Link
                  href={pillar.hubHref}
                  className="inline-flex items-center gap-[8px] text-[14px] font-medium text-dark hover:text-[var(--pillar-color)] transition-colors duration-[var(--duration-instant)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  <span>See all {pillar.label} services</span>
                  <ArrowRight />
                </Link>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Three isometric shapes; the active pillar's shape is a raised cube in its
 * brand color, the other two are flat diamonds in slate. The active cube
 * animates up on viewport entry (one-shot, IO-gated, reduced-motion safe).
 */
function IsoBlocks({ active }: { active: PillarId }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEntered(true)
          io.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const order: PillarId[] = ['ai-agents', 'web3', 'product-studio']
  // Center-stage the active pillar by positioning it in the middle slot.
  const arrangement = (() => {
    if (active === 'web3') return ['ai-agents', 'web3', 'product-studio'] as PillarId[]
    if (active === 'ai-agents') return ['product-studio', 'ai-agents', 'web3'] as PillarId[]
    return ['web3', 'product-studio', 'ai-agents'] as PillarId[]
  })()

  void order

  return (
    <div
      ref={wrapRef}
      data-entered={entered}
      aria-hidden="true"
      className="relative h-[200px] sm:h-[240px] mt-[16px] overflow-hidden bg-bg-raised border border-border-subtle"
    >
      {/* Dot grid background */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            'radial-gradient(circle, #d9d9d9 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <svg
        viewBox="0 0 600 240"
        className="relative w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {arrangement.map((id, idx) => {
          const isActive = id === active
          const cx = 150 + idx * 150
          const cy = 140
          const color =
            id === 'web3' ? '#204AF8' : id === 'ai-agents' ? '#10b981' : '#F6851B'
          return (
            <IsoShape
              key={id}
              cx={cx}
              cy={cy}
              color={color}
              active={isActive}
              entered={entered}
              label={
                id === 'web3' ? 'WEB3' : id === 'ai-agents' ? 'AI' : 'PRODUCT'
              }
              labelSide={idx === 0 ? 'left' : idx === 2 ? 'right' : 'top'}
            />
          )
        })}
      </svg>
    </div>
  )
}

function IsoShape({
  cx,
  cy,
  color,
  active,
  entered,
  label,
  labelSide,
}: {
  cx: number
  cy: number
  color: string
  active: boolean
  entered: boolean
  label: string
  labelSide: 'left' | 'right' | 'top'
}) {
  // Isometric diamond rhombus dimensions
  const w = 60 // half-width
  const h = 30 // half-height
  // Raised offset for the active cube
  const rise = active && entered ? 36 : 0

  // Top face (diamond) — for cube it's offset upward; for diamond it's flat
  const topY = cy - rise
  const topFace = `${cx},${topY - h} ${cx + w},${topY} ${cx},${topY + h} ${cx - w},${topY}`

  // For the active raised cube: left face + right face
  const showCube = active
  const leftFace = showCube
    ? `${cx - w},${topY} ${cx},${topY + h} ${cx},${topY + h + rise} ${cx - w},${topY + rise}`
    : ''
  const rightFace = showCube
    ? `${cx + w},${topY} ${cx},${topY + h} ${cx},${topY + h + rise} ${cx + w},${topY + rise}`
    : ''

  return (
    <g
      style={{
        transition: 'transform var(--duration-slow) cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {showCube && (
        <>
          <polygon
            points={leftFace}
            fill={color}
            opacity={0.85}
            style={{
              transition: 'opacity var(--duration-slow) cubic-bezier(0.16, 1, 0.3, 1)',
              opacity: entered ? 0.85 : 0,
            }}
          />
          <polygon
            points={rightFace}
            fill={color}
            opacity={0.65}
            style={{
              transition: 'opacity var(--duration-slow) cubic-bezier(0.16, 1, 0.3, 1)',
              opacity: entered ? 0.65 : 0,
            }}
          />
        </>
      )}
      <polygon
        points={topFace}
        fill={showCube ? color : '#e2e8f0'}
        stroke={showCube ? color : '#cbd5e1'}
        strokeWidth={1.5}
      />
      {/* Label */}
      <text
        x={
          labelSide === 'left' ? cx - w - 8 : labelSide === 'right' ? cx + w + 8 : cx
        }
        y={
          labelSide === 'top' ? topY - h - 12 : topY + 4
        }
        textAnchor={
          labelSide === 'left' ? 'end' : labelSide === 'right' ? 'start' : 'middle'
        }
        className="font-mono"
        style={{
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.1em',
          fill: showCube ? color : '#999999',
          transform: 'rotate(-30deg)',
          transformOrigin: `${cx}px ${topY}px`,
        }}
      >
        {label}
      </text>
    </g>
  )
}

function ArrowUpRight({ className = '' }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className={className}
    >
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
