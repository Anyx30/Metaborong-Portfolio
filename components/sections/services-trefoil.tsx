'use client'

import { useEffect, useRef, useState } from 'react'
import { pillars } from '@/components/sections/services-data'
import type { PillarId } from '@/components/sections/services-data'
import { PillarGlyph } from '@/components/sections/services-glyphs'

type Props = {
  className?: string
}

const HUB = { x: 250, y: 250 }
const SPOKE_LENGTH = 160
const NODE_OFFSETS: Record<PillarId, { x: number; y: number }> = {
  web3: { x: HUB.x, y: HUB.y - SPOKE_LENGTH },
  'ai-agents': { x: HUB.x - SPOKE_LENGTH * Math.cos(Math.PI / 6), y: HUB.y + SPOKE_LENGTH * Math.sin(Math.PI / 6) },
  'product-studio': { x: HUB.x + SPOKE_LENGTH * Math.cos(Math.PI / 6), y: HUB.y + SPOKE_LENGTH * Math.sin(Math.PI / 6) },
}

export function ServicesTrefoil({ className = '' }: Props) {
  const [activeId, setActiveId] = useState<PillarId | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            observer.unobserve(entry.target)
            window.setTimeout(() => setActiveId('web3'), 600)
          }
        }
      },
      { rootMargin: '0px 0px -50px 0px', threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const primed = activeId !== null

  return (
    <div ref={rootRef} className={`grid grid-cols-1 lg:grid-cols-2 gap-[48px] ${className}`}>
      <div className="relative aspect-square max-h-[520px] w-full">
        <svg viewBox="0 0 500 500" className="w-full h-full">
          <defs>
            <radialGradient id="services-ground" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#204AF8" stopOpacity="0.04" />
              <stop offset="60%" stopColor="#204AF8" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect x="0" y="0" width="500" height="500" fill="url(#services-ground)" aria-hidden="true" />

          {pillars.map((p) => {
            const node = NODE_OFFSETS[p.id]
            const isActive = p.id === activeId
            return (
              <line
                key={`spoke-${p.id}`}
                x1={HUB.x}
                y1={HUB.y}
                x2={node.x}
                y2={node.y}
                stroke="#204AF8"
                strokeDasharray="4 6"
                className={`services-spoke ${isActive ? 'services-spoke-active' : 'services-spoke-inactive'}`}
                aria-hidden="true"
              />
            )
          })}

          <circle cx={HUB.x} cy={HUB.y} r="16" fill="#204AF8" fillOpacity="0.15" aria-hidden="true" />
          <circle cx={HUB.x} cy={HUB.y} r="8" fill="#204AF8" aria-hidden="true" />

          {pillars.map((p) => {
            const node = NODE_OFFSETS[p.id]
            const isActive = p.id === activeId
            return (
              <foreignObject
                key={`node-${p.id}`}
                x={node.x - 40}
                y={node.y - 40}
                width="80"
                height="80"
                style={{ overflow: 'visible' }}
              >
                <button
                  type="button"
                  onClick={() => setActiveId(p.id)}
                  aria-label={`Activate ${p.label} pillar`}
                  className="services-node-btn w-full h-full bg-transparent border-0 p-0 cursor-pointer focus:outline-none rounded-full"
                >
                  <PillarGlyph pillarId={p.id} active={isActive} primed={primed} />
                </button>
              </foreignObject>
            )
          })}
        </svg>
      </div>

      <div className="flex flex-col" role="tablist" aria-orientation="vertical">
        {pillars.map((p) => {
          const isActive = p.id === activeId
          const panelId = `services-panel-${p.id}`
          const tabId = `services-tab-${p.id}`
          return (
            <div
              key={p.id}
              className={`border-b border-border-subtle last:border-b-0 ${isActive ? 'border-l-[3px] pl-[24px]' : 'border-l-0 pl-[27px]'}`}
              style={isActive ? { borderLeftColor: p.color } : undefined}
            >
              <button
                type="button"
                role="tab"
                id={tabId}
                aria-selected={isActive}
                aria-controls={panelId}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveId(p.id)}
                className="w-full flex items-center gap-[16px] py-[20px] bg-transparent border-0 cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                <span className="text-[12px] font-mono text-gray-light">{p.num}</span>
                <span className="w-[8px] h-[8px] rounded-full" style={{ background: p.color }} />
                <span
                  className="text-[18px] font-semibold tracking-[-0.02em] text-dark"
                  style={isActive ? { color: p.color } : undefined}
                >
                  {p.label}
                </span>
                <span className="ml-auto text-gray-light" aria-hidden="true">{isActive ? '▴' : '▾'}</span>
              </button>
              {isActive && (
                <div
                  role="tabpanel"
                  id={panelId}
                  aria-labelledby={tabId}
                  className="pb-[24px] pr-[8px]"
                >
                  <h3 className="text-[20px] font-bold tracking-[-0.025em] leading-[1.2] text-dark mb-[12px]">
                    {p.headline}
                  </h3>
                  <p className="text-[14px] text-gray leading-[1.75] tracking-[-0.005em] mb-[20px]">
                    {p.body}
                  </p>
                  <ul className="flex flex-col gap-[10px] list-none p-0 m-0 mb-[20px]">
                    {p.children.map((c) => (
                      <li key={c.slug}>
                        <a
                          href={`${p.hubHref}${c.slug}/`}
                          className="group flex flex-col gap-[2px] no-underline"
                        >
                          <span className="flex items-center gap-[6px] text-[14px] font-semibold text-dark">
                            {c.name}
                            <span aria-hidden="true">→</span>
                          </span>
                          <span className="text-[13px] text-gray leading-[1.5]">
                            {c.description}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                  <a
                    href={p.hubHref}
                    className="text-[14px] font-semibold tracking-[-0.01em] no-underline"
                    style={{ color: p.color }}
                  >
                    {p.hubCta} →
                  </a>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
