'use client'

import { useEffect, useRef, useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { pillars } from '@/components/sections/services-data'
import type { PillarId } from '@/components/sections/services-data'
import { PillarGlyph } from '@/components/sections/services-glyphs'

type Props = {
  className?: string
}

const HUB = { x: 250, y: 230 }
const SPOKE_LENGTH = 150
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
        .services-spoke {
          transition:
            stroke 350ms cubic-bezier(0.32, 0, 0.16, 1),
            stroke-opacity 350ms cubic-bezier(0.32, 0, 0.16, 1),
            stroke-width 350ms cubic-bezier(0.32, 0, 0.16, 1);
        }

        .services-atmo {
          transition: opacity 600ms ease-out;
        }

        .services-pulse-dot {
          filter: drop-shadow(0 0 4px currentColor);
          opacity: 0;
          animation: services-pulse-travel 900ms cubic-bezier(0.32, 0, 0.16, 1) forwards;
        }
        @keyframes services-pulse-travel {
          0%   { transform: translate(0px, 0px); opacity: 0; }
          18%  { opacity: 1; }
          82%  { opacity: 1; }
          100% { transform: translate(var(--dx, 0px), var(--dy, 0px)); opacity: 0; }
        }

        .services-halo {
          opacity: 0;
          animation: services-halo-in 500ms cubic-bezier(0.16, 1, 0.3, 1) 200ms forwards;
        }
        @keyframes services-halo-in {
          from { opacity: 0; transform: scale(0.7); transform-origin: center; transform-box: fill-box; }
          to   { opacity: 0.10; transform: scale(1); }
        }

        .services-glyph[data-active="true"] [data-draw] {
          animation: services-stroke-draw 620ms cubic-bezier(0.65, 0, 0.35, 1) both;
        }
        @keyframes services-stroke-draw {
          from { stroke-dashoffset: var(--draw-len, 200); }
          to   { stroke-dashoffset: 0; }
        }

        .services-node-btn:focus-visible svg {
          outline: 2px solid var(--color-brand);
          outline-offset: 4px;
          border-radius: 50%;
        }

        @media (prefers-reduced-motion: reduce) {
          .services-spoke,
          .services-pulse-dot,
          .services-halo,
          .services-atmo,
          .services-glyph * {
            transition: none !important;
            animation: none !important;
          }
          .services-pulse-dot { display: none !important; }
          .services-halo { opacity: 0.10 !important; transform: none !important; }
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
            <defs>
              <radialGradient id="services-atmo-grad" cx="50%" cy="46%" r="55%">
                <stop offset="0%" stopColor={activeColor} stopOpacity="0.06" />
                <stop offset="100%" stopColor={activeColor} stopOpacity="0" />
              </radialGradient>
              <filter id="services-hub-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2.5" />
              </filter>
            </defs>

            {/* Atmospheric backdrop — fades in once primed, color tracks active pillar */}
            <rect
              width="500"
              height="500"
              fill="url(#services-atmo-grad)"
              className="services-atmo"
              style={{ opacity: primed ? 1 : 0 }}
              aria-hidden="true"
            />

            {/* Spokes — dashed when inactive, solid when active */}
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
                  stroke={isActive ? PILLAR_COLOR[p.id] : '#94a3b8'}
                  strokeOpacity={isActive ? 0.85 : 0.30}
                  strokeWidth={isActive ? 1.75 : 1}
                  strokeDasharray={isActive ? undefined : '4 6'}
                  className="services-spoke"
                  aria-hidden="true"
                />
              )
            })}

            {/* Active node halo — sits behind the glyph */}
            {activeId && activeNode && (
              <circle
                key={`halo-${activeId}-${pulseTick}`}
                cx={activeNode.x}
                cy={activeNode.y}
                r="58"
                fill={activeColor}
                className="services-halo"
                aria-hidden="true"
              />
            )}

            {/* Traveling pulse dot — hub → active node */}
            {activeNode && (
              <circle
                key={`pulse-${activeId}-${pulseTick}`}
                cx={HUB.x}
                cy={HUB.y}
                r="3"
                fill={activeColor}
                color={activeColor}
                className="services-pulse-dot"
                style={{
                  ['--dx' as string]: `${activeNode.x - HUB.x}px`,
                  ['--dy' as string]: `${activeNode.y - HUB.y}px`,
                }}
                aria-hidden="true"
              />
            )}

            {/* Hub — layered concentric structure with soft glow */}
            <g aria-hidden="true">
              <circle
                cx={HUB.x}
                cy={HUB.y}
                r="28"
                fill="none"
                stroke="#204AF8"
                strokeWidth="1"
                strokeOpacity="0.32"
                strokeDasharray="2 4"
              />
              <circle
                cx={HUB.x}
                cy={HUB.y}
                r="18"
                fill="none"
                stroke="#204AF8"
                strokeWidth="1.25"
                strokeOpacity="0.55"
              />
              <circle
                cx={HUB.x}
                cy={HUB.y}
                r="9"
                fill="#204AF8"
                opacity="0.5"
                filter="url(#services-hub-glow)"
              />
              <circle cx={HUB.x} cy={HUB.y} r="6" fill="#204AF8" />
            </g>

            {/* Pillar nodes — glyphs at 120px footprint */}
            {pillars.map((p) => {
              const node = NODE_OFFSETS[p.id]
              const isActive = p.id === activeId
              return (
                <foreignObject
                  key={`node-${p.id}`}
                  x={node.x - 60}
                  y={node.y - 60}
                  width="120"
                  height="120"
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

        <div
          className="relative flex flex-col border-l border-border-subtle"
          role="tablist"
          aria-orientation="vertical"
          onKeyDown={handleTabKeyDown}
        >
          {pillars.map((p) => {
            const isActive = p.id === activeId
            const panelId = `services-panel-${p.id}`
            const tabId = `services-tab-${p.id}`
            return (
              <div
                key={p.id}
                className="relative border-b border-border-subtle last:border-b-0 pl-[24px]"
              >
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute -left-px top-0 bottom-0 w-[3px]"
                    style={{ background: p.color }}
                  />
                )}
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
                  <span className="text-[13px] font-mono text-gray tabular-nums">{p.num}</span>
                  <span className="w-[8px] h-[8px] rounded-full" style={{ background: p.color }} />
                  <span
                    className="text-[18px] font-semibold tracking-[-0.02em] text-dark"
                    style={isActive ? { color: p.color } : undefined}
                  >
                    {p.label}
                  </span>
                  <span className="ml-auto text-gray-light flex items-center" aria-hidden="true">
                    {isActive ? <Minus size={16} /> : <Plus size={16} />}
                  </span>
                </button>
                {isActive && (
                  <div role="tabpanel" id={panelId} aria-labelledby={tabId} className="pb-[24px]">
                    <h3 className="text-[20px] font-bold tracking-[-0.025em] leading-[1.2] text-dark mb-[12px]">
                      {p.headline}
                    </h3>
                    <p className="text-[14px] text-gray leading-[1.75] tracking-[-0.005em] mb-[20px]">
                      {p.body}
                    </p>
                    <ul className="flex flex-col gap-[14px] list-none p-0 m-0 mb-[8px]">
                      {p.children.map((c) => (
                        <li key={c.slug}>
                          <a
                            href={`${p.hubHref}${c.slug}/`}
                            className="group flex flex-col gap-[4px] no-underline -mx-[8px] px-[8px] py-[6px] rounded-md transition-colors hover:bg-border-subtle/60"
                          >
                            <span className="flex items-center gap-[6px] text-[14px] font-semibold text-dark">
                              {c.name}
                              <span
                                aria-hidden="true"
                                className="inline-block transition-transform duration-200 group-hover:translate-x-[2px]"
                              >
                                →
                              </span>
                            </span>
                            <span className="text-[13px] text-gray leading-[1.5]">
                              {c.description}
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                    <div className="border-t border-border-subtle pt-[16px] mt-[8px]">
                      <a
                        href={p.hubHref}
                        className="text-[15px] font-bold tracking-[-0.01em] no-underline hover:underline"
                        style={{ color: p.color }}
                      >
                        {p.hubCta} →
                      </a>
                    </div>
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
