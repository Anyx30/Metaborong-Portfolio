'use client'

import { useEffect, useRef, useState } from 'react'

const VIEW_W = 800
const VIEW_H = 380

const AXIS_X0 = 132
const AXIS_X12 = 560
const WEEKS_TOTAL = 12
const PX_PER_WEEK = (AXIS_X12 - AXIS_X0) / WEEKS_TOTAL
const xAt = (week: number) => AXIS_X0 + week * PX_PER_WEEK

const WEEK6_X = xAt(6)
const AXIS_BASELINE_Y = 310

const LANE_HEIGHT = 56
const LANE_TOP = 80
const BAR_HEIGHT = 28

interface Lane {
  id: 'freelancer' | 'metaborong' | 'agencies'
  label: string
  shipWeek: number
  shipWeekLabel?: string
  fill: string
  trackFill: string
  status: string
  statusGlyph: '⚠' | '✓' | '✗'
  emphasis?: boolean
}

const LANES: Lane[] = [
  {
    id: 'freelancer',
    label: 'FREELANCER',
    shipWeek: 3,
    fill: '#ffba08',
    trackFill: 'rgba(255,186,8,0.18)',
    status: 'BRITTLE AT SCALE',
    statusGlyph: '⚠',
  },
  {
    id: 'metaborong',
    label: 'METABORONG',
    shipWeek: 5,
    fill: '#38b000',
    trackFill: 'rgba(56,176,0,0.22)',
    status: 'BUILT TO LAST',
    statusGlyph: '✓',
    emphasis: true,
  },
  {
    id: 'agencies',
    label: 'AGENCIES',
    shipWeek: 10.5,
    fill: '#fffffc',
    trackFill: 'rgba(255,255,252,0.16)',
    status: 'WINDOW CLOSED',
    statusGlyph: '✗',
    shipWeekLabel: '11+',
  },
]

function Lane({ lane, index }: { lane: Lane; index: number }) {
  const yCenter = LANE_TOP + index * LANE_HEIGHT + LANE_HEIGHT / 2
  const yTop = yCenter - BAR_HEIGHT / 2
  const shipX = xAt(lane.shipWeek)
  const insideEnd = Math.min(shipX, WEEK6_X)
  const outsideStart = WEEK6_X
  const outsideEnd = shipX
  const overshootsWindow = lane.shipWeek > 6

  return (
    <g>
      {/* Lane name on left */}
      <text
        x={AXIS_X0 - 14}
        y={yCenter + 4}
        textAnchor="end"
        fill={lane.emphasis ? '#fffffc' : 'rgba(255,255,252,0.85)'}
        className={`problem-chart-lane-label${lane.emphasis ? ' is-emphasis' : ''}`}
      >
        {lane.label}
      </text>

      {/* Faint dotted track across full timeline */}
      <line
        x1={AXIS_X0}
        y1={yCenter}
        x2={AXIS_X12}
        y2={yCenter}
        stroke="rgba(255,255,252,0.18)"
        strokeWidth="1"
        strokeDasharray="1 4"
      />

      {/* Solid bar from W0 to ship week (capped at window-close for the inside portion) */}
      <rect
        x={AXIS_X0}
        y={yTop}
        width={insideEnd - AXIS_X0}
        height={BAR_HEIGHT}
        fill={lane.fill}
        rx="1"
      />

      {/* Overshoot portion (faded, hatched-feel) past window close */}
      {overshootsWindow && (
        <rect
          x={outsideStart}
          y={yTop}
          width={outsideEnd - outsideStart}
          height={BAR_HEIGHT}
          fill={lane.fill}
          fillOpacity="0.32"
          stroke={lane.fill}
          strokeOpacity="0.5"
          strokeDasharray="3 3"
          rx="1"
        />
      )}

      {/* Ship marker — pin at the end of the bar */}
      <g>
        <line
          x1={shipX}
          y1={yTop - 6}
          x2={shipX}
          y2={yTop + BAR_HEIGHT + 6}
          stroke={overshootsWindow ? 'rgba(255,255,252,0.55)' : lane.fill}
          strokeWidth="1.5"
        />
        <circle
          cx={shipX}
          cy={yCenter}
          r="5"
          fill={overshootsWindow ? '#296ff0' : '#fffffc'}
          stroke={overshootsWindow ? 'rgba(255,255,252,0.7)' : lane.fill}
          strokeWidth="2"
        />
      </g>

      {/* Week-N tag above the ship marker */}
      <text
        x={shipX}
        y={yTop - 12}
        textAnchor="middle"
        fill="#fffffc"
        className="problem-chart-week-tag"
      >
        WEEK {lane.shipWeekLabel ?? lane.shipWeek}
      </text>

      {/* Status glyph + label to the right of the bar */}
      <g>
        <text
          x={shipX + 16}
          y={yCenter + 5}
          fill={lane.emphasis ? '#fffffc' : 'rgba(255,255,252,0.95)'}
          className="problem-chart-status-glyph"
        >
          {lane.statusGlyph}
        </text>
        <text
          x={shipX + 32}
          y={yCenter + 5}
          fill={lane.emphasis ? '#fffffc' : 'rgba(255,255,252,0.85)'}
          className={`problem-chart-status${lane.emphasis ? ' is-emphasis' : ''}`}
        >
          {lane.status}
        </text>
      </g>
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
          <pattern id="problem-closed-hatch" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(255,255,252,0.18)" strokeWidth="1" />
          </pattern>
          <linearGradient id="problem-sweep-gradient" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#fffffc" stopOpacity="0" />
            <stop offset="50%" stopColor="#fffffc" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#fffffc" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Closed-window zone fill — hatched, distinct */}
        <rect
          x={WEEK6_X}
          y={LANE_TOP - 16}
          width={AXIS_X12 - WEEK6_X + 60}
          height={AXIS_BASELINE_Y - LANE_TOP + 24}
          fill="url(#problem-closed-hatch)"
        />
        <rect
          x={WEEK6_X}
          y={LANE_TOP - 16}
          width={AXIS_X12 - WEEK6_X + 60}
          height={AXIS_BASELINE_Y - LANE_TOP + 24}
          fill="rgba(0,0,0,0.12)"
        />

        {/* Decisive vertical line at week 6 (window closes) */}
        <line
          x1={WEEK6_X}
          y1={LANE_TOP - 12}
          x2={WEEK6_X}
          y2={AXIS_BASELINE_Y + 8}
          stroke="rgba(255,255,252,0.9)"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        <text
          x={WEEK6_X}
          y={LANE_TOP - 24}
          textAnchor="middle"
          fill="#fffffc"
          className="problem-chart-window-label"
        >
          ↓ WINDOW CLOSES
        </text>

        {/* Lanes */}
        {LANES.map((lane, i) => (
          <Lane key={lane.id} lane={lane} index={i} />
        ))}

        {/* X axis baseline */}
        <line
          x1={AXIS_X0}
          y1={AXIS_BASELINE_Y}
          x2={AXIS_X12}
          y2={AXIS_BASELINE_Y}
          stroke="rgba(255,255,252,0.55)"
          strokeWidth="1"
        />

        {/* X axis week ticks */}
        {[0, 3, 6, 9, 12].map((w) => (
          <g key={w}>
            <line
              x1={xAt(w)}
              y1={AXIS_BASELINE_Y - 4}
              x2={xAt(w)}
              y2={AXIS_BASELINE_Y + 4}
              stroke="rgba(255,255,252,0.55)"
              strokeWidth="1"
            />
            <text
              x={xAt(w)}
              y={AXIS_BASELINE_Y + 22}
              textAnchor="middle"
              fill="rgba(255,255,252,0.85)"
              className="problem-chart-axis-week"
            >
              W{w.toString().padStart(2, '0')}
            </text>
          </g>
        ))}
        <text
          x={AXIS_X0}
          y={AXIS_BASELINE_Y + 40}
          textAnchor="start"
          fill="rgba(255,255,252,0.6)"
          className="problem-chart-axis-meta"
        >
          [ TREND STARTS ]
        </text>
        <text
          x={WEEK6_X}
          y={AXIS_BASELINE_Y + 40}
          textAnchor="middle"
          fill="rgba(255,255,252,0.6)"
          className="problem-chart-axis-meta"
        >
          [ WINDOW CLOSES ]
        </text>
        <text
          x={AXIS_X12}
          y={AXIS_BASELINE_Y + 40}
          textAnchor="end"
          fill="rgba(255,255,252,0.6)"
          className="problem-chart-axis-meta"
        >
          [ TREND DISSOLVED ]
        </text>

        {/* Sweep overlay */}
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

      {/* Mobile fallback — same logic, more compressed */}
      <svg
        viewBox="0 0 360 280"
        preserveAspectRatio="xMidYMid meet"
        className="problem-chart problem-chart-flat"
        aria-hidden="true"
      >
        <defs>
          <pattern id="problem-closed-hatch-m" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(255,255,252,0.2)" strokeWidth="1" />
          </pattern>
        </defs>
        {/* W axis: 0 to 12, baseline at y=230 */}
        {(() => {
          const X0 = 30
          const X12 = 330
          const ppw = (X12 - X0) / 12
          const xa = (w: number) => X0 + w * ppw
          const w6 = xa(6)
          const baseline = 235
          const laneH = 48
          const laneTop = 40
          const bh = 22
          return (
            <>
              <rect x={w6} y={laneTop - 8} width={X12 - w6 + 20} height={baseline - laneTop + 10} fill="url(#problem-closed-hatch-m)" />
              <rect x={w6} y={laneTop - 8} width={X12 - w6 + 20} height={baseline - laneTop + 10} fill="rgba(0,0,0,0.12)" />
              <line x1={w6} y1={laneTop - 4} x2={w6} y2={baseline + 6} stroke="rgba(255,255,252,0.9)" strokeWidth="1.5" strokeDasharray="3 3" />
              {LANES.map((lane, i) => {
                const yC = laneTop + i * laneH + laneH / 2
                const yT = yC - bh / 2
                const shipX = xa(lane.shipWeek)
                const insideEnd = Math.min(shipX, w6)
                const overshoots = lane.shipWeek > 6
                return (
                  <g key={lane.id + '-m'}>
                    <text x={X0 + 4} y={yT - 6} fill="#fffffc" className="problem-chart-lane-label">
                      {lane.label}
                    </text>
                    <rect x={X0} y={yT} width={insideEnd - X0} height={bh} fill={lane.fill} />
                    {overshoots && (
                      <rect x={w6} y={yT} width={shipX - w6} height={bh} fill={lane.fill} fillOpacity="0.32" stroke={lane.fill} strokeOpacity="0.5" strokeDasharray="3 3" />
                    )}
                    <circle cx={shipX} cy={yC} r="4" fill={overshoots ? '#296ff0' : '#fffffc'} stroke={lane.fill} strokeWidth="2" />
                    <text x={shipX + 8} y={yC + 4} fill="rgba(255,255,252,0.85)" className="problem-chart-status">
                      W{lane.shipWeek === 11.5 ? '11+' : lane.shipWeek} {lane.statusGlyph}
                    </text>
                  </g>
                )
              })}
              <line x1={X0} y1={baseline} x2={X12} y2={baseline} stroke="rgba(255,255,252,0.5)" strokeWidth="1" />
              {[0, 6, 12].map((w) => (
                <text key={w} x={xa(w)} y={baseline + 16} textAnchor="middle" fill="rgba(255,255,252,0.7)" className="problem-chart-axis-week">
                  W{w.toString().padStart(2, '0')}
                </text>
              ))}
              <text x={w6} y={laneTop - 14} textAnchor="middle" fill="#fffffc" className="problem-chart-window-label">
                ↓ WINDOW CLOSES
              </text>
            </>
          )
        })()}
      </svg>
    </>
  )
}
