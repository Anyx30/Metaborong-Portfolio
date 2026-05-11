'use client'

import { useEffect, useRef, useState } from 'react'

const VIEW_W = 660
const VIEW_H = 470
const BASELINE = 360
const ISO_DX = 26
const ISO_DY = 15
const WEEK0_X = 80
const WEEK6_X = 380
const WEEK_CLOSED_X = VIEW_W - 20

interface Bar {
  id: 'freelancer' | 'metaborong' | 'agencies'
  label: string
  week: string
  subLabel: string
  x: number
  height: number
  fill: string
  topFill: string
  sideFill: string
  textFill: string
  subTextFill: string
}

const BARS: Bar[] = [
  {
    id: 'freelancer',
    label: 'FREELANCER',
    week: 'WEEK 3',
    subLabel: 'BRITTLE AT SCALE',
    x: 110,
    height: 95,
    fill: '#ffba08',
    topFill: '#ffd966',
    sideFill: '#cc9506',
    textFill: '#040404',
    subTextFill: 'rgba(4,4,4,0.55)',
  },
  {
    id: 'metaborong',
    label: 'METABORONG',
    week: 'WEEK 5',
    subLabel: 'BUILT TO LAST',
    x: 230,
    height: 170,
    fill: '#38b000',
    topFill: '#5fd429',
    sideFill: '#2a8500',
    textFill: '#fffffc',
    subTextFill: 'rgba(255,255,252,0.85)',
  },
  {
    id: 'agencies',
    label: 'AGENCIES',
    week: 'WEEK 11+',
    subLabel: 'WINDOW CLOSED',
    x: 480,
    height: 250,
    fill: '#fffffc',
    topFill: '#ffffff',
    sideFill: '#cccccc',
    textFill: '#040404',
    subTextFill: 'rgba(4,4,4,0.55)',
  },
]

const BAR_W = 92

function IsoPrism({ bar }: { bar: Bar }) {
  const { x, height, fill, topFill, sideFill } = bar
  const yTop = BASELINE - height
  const yBottom = BASELINE

  const frontPoints = `${x},${yBottom} ${x + BAR_W},${yBottom} ${x + BAR_W},${yTop} ${x},${yTop}`
  const topPoints = `${x},${yTop} ${x + BAR_W},${yTop} ${x + BAR_W + ISO_DX},${yTop - ISO_DY} ${x + ISO_DX},${yTop - ISO_DY}`
  const sidePoints = `${x + BAR_W},${yBottom} ${x + BAR_W + ISO_DX},${yBottom - ISO_DY} ${x + BAR_W + ISO_DX},${yTop - ISO_DY} ${x + BAR_W},${yTop}`

  return (
    <g>
      <polygon points={frontPoints} fill={fill} />
      <polygon points={sidePoints} fill={sideFill} />
      <polygon points={topPoints} fill={topFill} />
    </g>
  )
}

function BarLabel({ bar }: { bar: Bar }) {
  const labelX = bar.x + BAR_W / 2 + ISO_DX / 2
  const labelY = BASELINE - bar.height + 28
  const weekY = labelY + 18
  const subY = BASELINE - bar.height / 2 + 4

  return (
    <g pointerEvents="none">
      <text
        x={labelX}
        y={labelY}
        textAnchor="middle"
        fill={bar.textFill}
        className="problem-chart-label"
      >
        {bar.label}
      </text>
      <text
        x={labelX}
        y={weekY}
        textAnchor="middle"
        fill={bar.subTextFill}
        className="problem-chart-label problem-chart-label-week"
      >
        {bar.week}
      </text>
      <text
        x={labelX}
        y={subY}
        textAnchor="middle"
        fill={bar.subTextFill}
        className="problem-chart-label problem-chart-label-sub"
      >
        {bar.subLabel}
      </text>
    </g>
  )
}

export function ProblemTrendChart() {
  const ref = useRef<SVGSVGElement>(null)
  const [swept, setSwept] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) return
    const obs = new IntersectionObserver(
      ([entry], o) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          setSwept(true)
          o.unobserve(el)
        }
      },
      { threshold: [0, 0.5] }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <>
      <svg
        ref={ref}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid meet"
        className="problem-chart problem-chart-iso"
        aria-hidden="true"
      >
        <defs>
          <filter id="problem-noise" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.08 0" />
          </filter>
          <linearGradient id="problem-closed-zone" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#fffffc" stopOpacity="0" />
            <stop offset="40%" stopColor="#fffffc" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#fffffc" stopOpacity="0.12" />
          </linearGradient>
          <linearGradient id="problem-sweep-gradient" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#fffffc" stopOpacity="0" />
            <stop offset="50%" stopColor="#fffffc" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#fffffc" stopOpacity="0" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width={VIEW_W} height={VIEW_H} fill="transparent" filter="url(#problem-noise)" />

        <rect
          x={WEEK6_X}
          y={20}
          width={WEEK_CLOSED_X - WEEK6_X}
          height={BASELINE - 20 + ISO_DY}
          fill="url(#problem-closed-zone)"
        />

        <line
          x1={WEEK0_X}
          y1={BASELINE}
          x2={WEEK_CLOSED_X}
          y2={BASELINE}
          stroke="rgba(255,255,252,0.5)"
          strokeWidth="1"
          strokeDasharray="2 3"
        />
        <line
          x1={WEEK6_X}
          y1={BASELINE - 240}
          x2={WEEK6_X}
          y2={BASELINE + 8}
          stroke="rgba(255,255,252,0.35)"
          strokeWidth="1"
          strokeDasharray="2 4"
        />

        {BARS.map((bar) => (
          <IsoPrism key={bar.id} bar={bar} />
        ))}
        {BARS.map((bar) => (
          <BarLabel key={bar.id + '-label'} bar={bar} />
        ))}

        <g className="problem-chart-axis">
          <text x={WEEK0_X} y={BASELINE + 30} fill="#fffffc" className="problem-chart-axis-week">
            WEEK 0
          </text>
          <text x={WEEK0_X} y={BASELINE + 44} fill="rgba(255,255,252,0.7)" className="problem-chart-axis-meta">
            [ TREND STARTS ]
          </text>
          <text x={WEEK6_X} y={BASELINE + 30} fill="#fffffc" className="problem-chart-axis-week" textAnchor="middle">
            WEEK 06
          </text>
          <text x={WEEK6_X} y={BASELINE + 44} fill="rgba(255,255,252,0.7)" className="problem-chart-axis-meta" textAnchor="middle">
            [ TREND DISSOLVES ]
          </text>
        </g>

        <rect
          className="problem-chart-sweep"
          data-active={swept ? 'true' : 'false'}
          x="0"
          y="0"
          width={VIEW_W / 3}
          height={VIEW_H}
          fill="url(#problem-sweep-gradient)"
        />
      </svg>

      <svg
        viewBox="0 0 320 200"
        preserveAspectRatio="xMidYMid meet"
        className="problem-chart problem-chart-flat"
        aria-hidden="true"
      >
        {BARS.map((bar, i) => {
          const x = 30 + i * 95
          const h = (bar.height / 250) * 140 + 20
          const y = 160 - h
          return (
            <g key={bar.id + '-flat'}>
              <rect x={x} y={y} width={70} height={h} fill={bar.fill} />
              <text x={x + 35} y={y - 6} textAnchor="middle" fill="#fffffc" className="problem-chart-label">
                {bar.label}
              </text>
              <text x={x + 35} y={y + h + 14} textAnchor="middle" fill="rgba(255,255,252,0.75)" className="problem-chart-axis-meta">
                {bar.week}
              </text>
            </g>
          )
        })}
        <line x1="20" y1="160" x2="300" y2="160" stroke="rgba(255,255,252,0.5)" strokeWidth="1" />
        <line x1="223" y1="20" x2="223" y2="170" stroke="rgba(255,255,252,0.35)" strokeWidth="1" strokeDasharray="2 4" />
        <text x="223" y="188" textAnchor="middle" fill="rgba(255,255,252,0.7)" className="problem-chart-axis-meta">
          [ WINDOW CLOSES ]
        </text>
      </svg>
    </>
  )
}
