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

const PILLAR_COLOR: Record<PillarId, string> = {
  web3: '#204AF8',
  'ai-agents': '#10b981',
  'product-studio': '#F6851B',
}

export function ServicesTrefoil({ className = '' }: Props) {
  const [activeId, setActiveId] = useState<PillarId | null>(null)
  // pulseTick increments on each activation — used as a key to remount the pulse element so its animation re-runs.
  const [pulseTick, setPulseTick] = useState(0)
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            observer.unobserve(entry.target)
            window.setTimeout(() => {
              setActiveId('web3')
              setPulseTick((n) => n + 1)
            }, 600)
          }
        }
      },
      { rootMargin: '0px 0px -50px 0px', threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const primed = activeId !== null

  const activate = (id: PillarId) => {
    setActiveId(id)
    setPulseTick((n) => n + 1)
  }

  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return
    e.preventDefault()
    const idx = pillars.findIndex((p) => p.id === activeId)
    let next = idx
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (idx + 1) % pillars.length
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (idx - 1 + pillars.length) % pillars.length
    if (e.key === 'Home') next = 0
    if (e.key === 'End') next = pillars.length - 1
    activate(pillars[next].id)
    const newTabId = `services-tab-${pillars[next].id}`
    document.getElementById(newTabId)?.focus()
  }

  const activeNode = activeId ? NODE_OFFSETS[activeId] : null
  const activeColor = activeId ? PILLAR_COLOR[activeId] : '#204AF8'

  return (
    <>
      <style precedence="default">{`
        /* All transitions are one-shot. No infinite loops on this section. */
        .services-spoke {
          transition:
            stroke 350ms cubic-bezier(0.32, 0, 0.16, 1),
            stroke-opacity 350ms cubic-bezier(0.32, 0, 0.16, 1),
            stroke-width 350ms cubic-bezier(0.32, 0, 0.16, 1);
        }

        .services-pulse {
          stroke-dasharray: 14 486;
          stroke-dashoffset: 500;
          opacity: 0;
          animation: services-pulse-travel 720ms cubic-bezier(0.32, 0, 0.16, 1) forwards;
        }
        @keyframes services-pulse-travel {
          0%   { stroke-dashoffset: 500; opacity: 0; }
          14%  { opacity: 1; }
          86%  { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 0; }
        }

        /* Glyph stroke-draw: each [data-draw] element reveals via stroke-dashoffset. */
        .services-glyph[data-active="true"] [data-draw] {
          animation: services-stroke-draw 620ms cubic-bezier(0.65, 0, 0.35, 1) both;
        }
        @keyframes services-stroke-draw {
          from { stroke-dashoffset: var(--draw-len, 200); }
          to   { stroke-dashoffset: 0; }
        }

        /* Focus ring fallback for buttons inside foreignObject. */
        .services-node-btn:focus-visible svg {
          outline: 2px solid var(--color-brand);
          outline-offset: 4px;
          border-radius: 50%;
        }

        @media (prefers-reduced-motion: reduce) {
          .services-spoke,
          .services-pulse,
          .services-glyph * {
            transition: none !important;
            animation: none !important;
          }
          .services-pulse { display: none !important; }
          .services-glyph[data-active="true"] [data-draw] {
            stroke-dashoffset: 0 !important;
          }
        }
      `}</style>
      <div
        ref={rootRef}
        className={`grid grid-cols-1 lg:grid-cols-2 gap-[48px] items-center ${className}`}
      >
        <div className="relative aspect-square max-h-[520px] w-full">
          <svg viewBox="0 0 500 500" className="w-full h-full">
            {/* Datum line — single horizontal architectural baseline */}
            <line
              x1="40"
              x2="460"
              y1={HUB.y}
              y2={HUB.y}
              stroke="#303030"
              strokeOpacity="0.05"
              strokeWidth="1"
              aria-hidden="true"
            />

            {/* Spokes — neutral at rest, pillar-colored when active */}
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
                  stroke={isActive ? PILLAR_COLOR[p.id] : '#303030'}
                  strokeOpacity={isActive ? 0.85 : 0.10}
                  strokeWidth={isActive ? 1.5 : 1}
                  className="services-spoke"
                  aria-hidden="true"
                />
              )
            })}

            {/* One-shot energy pulse along active spoke */}
            {activeNode && (
              <line
                key={`pulse-${activeId}-${pulseTick}`}
                x1={HUB.x}
                y1={HUB.y}
                x2={activeNode.x}
                y2={activeNode.y}
                stroke={activeColor}
                strokeWidth="2"
                strokeLinecap="round"
                className="services-pulse"
                aria-hidden="true"
              />
            )}

            {/* Hub cluster — engineered centroid */}
            <g aria-hidden="true">
              {/* Crosshair tick marks at cardinal axes */}
              <line x1={HUB.x - 36} x2={HUB.x - 28} y1={HUB.y} y2={HUB.y} stroke="#204AF8" strokeWidth="1" strokeOpacity="0.3" />
              <line x1={HUB.x + 28} x2={HUB.x + 36} y1={HUB.y} y2={HUB.y} stroke="#204AF8" strokeWidth="1" strokeOpacity="0.3" />
              <line x1={HUB.x} x2={HUB.x} y1={HUB.y - 36} y2={HUB.y - 28} stroke="#204AF8" strokeWidth="1" strokeOpacity="0.3" />
              <line x1={HUB.x} x2={HUB.x} y1={HUB.y + 28} y2={HUB.y + 36} stroke="#204AF8" strokeWidth="1" strokeOpacity="0.3" />
              {/* Outer ring */}
              <circle cx={HUB.x} cy={HUB.y} r="24" fill="none" stroke="#204AF8" strokeWidth="1" strokeOpacity="0.4" />
              {/* Inner ring */}
              <circle cx={HUB.x} cy={HUB.y} r="12" fill="none" stroke="#204AF8" strokeWidth="1" strokeOpacity="0.6" />
              {/* Center dot */}
              <circle cx={HUB.x} cy={HUB.y} r="3" fill="#204AF8" />
            </g>

            {/* Pillar nodes */}
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
                    onClick={() => activate(p.id)}
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

        <div className="flex flex-col" role="tablist" aria-orientation="vertical" onKeyDown={handleTabKeyDown}>
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
                  onClick={() => activate(p.id)}
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
                  <div role="tabpanel" id={panelId} aria-labelledby={tabId} className="pb-[24px] pr-[8px]">
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
    </>
  )
}
