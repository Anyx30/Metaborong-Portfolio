'use client'

import { useEffect, useRef, useState } from 'react'

const VIEW_W = 720
const VIEW_H = 360
const X0 = 110
const X_END = 660
const WEEK_COUNT = 12
const WEEK_DX = (X_END - X0) / WEEK_COUNT
const WEEK6_X = X0 + 6 * WEEK_DX
const TRACK_Y = [80, 170, 260] as const

interface Team {
  id: 'freelancer' | 'metaborong' | 'agencies'
  label: string
  week: string
  weekNum: number
  subLabel: string
  fill: string
  emphasis: boolean
}

const TEAMS: Team[] = [
  {
    id: 'freelancer',
    label: 'FREELANCER',
    week: 'W3',
    weekNum: 3,
    subLabel: 'BRITTLE AT SCALE',
    fill: '#ffba08',
    emphasis: false,
  },
  {
    id: 'metaborong',
    label: 'METABORONG',
    week: 'W5',
    weekNum: 5,
    subLabel: 'BUILT TO LAST',
    fill: '#38b000',
    emphasis: true,
  },
  {
    id: 'agencies',
    label: 'AGENCIES',
    week: 'W11+',
    weekNum: 11,
    subLabel: 'WINDOW CLOSED',
    fill: '#fffffc',
    emphasis: false,
  },
]

function weekToX(week: number): number {
  return X0 + week * WEEK_DX
}

function TimelineTrack({ team, idx }: { team: Team; idx: number }) {
  const y = TRACK_Y[idx]
  const shipX = weekToX(team.weekNum)
  const insideWindow = team.weekNum <= 6
  const markerR = team.emphasis ? 11 : 8
  const subLabelX = shipX + 18

  return (
    <g>
      <text x={X0 - 16} y={y + 5} textAnchor="end" fill="#fffffc" className="problem-tl-team">
        {team.label}
      </text>

      <line
        x1={X0}
        y1={y}
        x2={X_END}
        y2={y}
        stroke="rgba(255,255,252,0.18)"
        strokeWidth="2"
      />
      <line
        x1={X0}
        y1={y}
        x2={shipX}
        y2={y}
        stroke={team.fill}
        strokeWidth={team.emphasis ? 4 : 3}
        strokeLinecap="round"
      />

      {team.emphasis && (
        <circle
          cx={shipX}
          cy={y}
          r={markerR + 6}
          fill={team.fill}
          fillOpacity="0.18"
        />
      )}
      <circle
        cx={shipX}
        cy={y}
        r={markerR}
        fill={team.fill}
        stroke="#296ff0"
        strokeWidth="2"
      />

      <text
        x={shipX}
        y={y - markerR - 8}
        textAnchor="middle"
        fill="#fffffc"
        className="problem-tl-week"
      >
        {team.week}
      </text>

      <text
        x={insideWindow ? subLabelX : shipX - 18}
        y={y + 5}
        textAnchor={insideWindow ? 'start' : 'end'}
        fill={team.emphasis ? '#fffffc' : 'rgba(255,255,252,0.7)'}
        className="problem-tl-sublabel"
      >
        {team.subLabel}
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
          <linearGradient id="problem-closed-zone" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#040404" stopOpacity="0" />
            <stop offset="35%" stopColor="#040404" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#040404" stopOpacity="0.28" />
          </linearGradient>
          <linearGradient id="problem-sweep-gradient" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#fffffc" stopOpacity="0" />
            <stop offset="50%" stopColor="#fffffc" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#fffffc" stopOpacity="0" />
          </linearGradient>
        </defs>

        <rect
          x={WEEK6_X}
          y={28}
          width={X_END - WEEK6_X + 32}
          height={VIEW_H - 80}
          fill="url(#problem-closed-zone)"
        />

        <line
          x1={WEEK6_X}
          y1={28}
          x2={WEEK6_X}
          y2={VIEW_H - 60}
          stroke="rgba(255,255,252,0.6)"
          strokeWidth="1"
          strokeDasharray="3 4"
        />
        <text
          x={WEEK6_X}
          y={20}
          textAnchor="middle"
          fill="#fffffc"
          className="problem-tl-boundary"
        >
          WINDOW CLOSES
        </text>

        {TEAMS.map((team, i) => (
          <TimelineTrack key={team.id} team={team} idx={i} />
        ))}

        <g className="problem-tl-axis">
          <line
            x1={X0}
            y1={VIEW_H - 50}
            x2={X_END}
            y2={VIEW_H - 50}
            stroke="rgba(255,255,252,0.35)"
            strokeWidth="1"
          />
          {[0, 3, 6, 9, 12].map((w) => (
            <g key={w}>
              <line
                x1={weekToX(w)}
                y1={VIEW_H - 54}
                x2={weekToX(w)}
                y2={VIEW_H - 46}
                stroke="rgba(255,255,252,0.5)"
                strokeWidth="1"
              />
              <text
                x={weekToX(w)}
                y={VIEW_H - 32}
                textAnchor="middle"
                fill="rgba(255,255,252,0.8)"
                className="problem-tl-tick"
              >
                {`W${w.toString().padStart(2, '0')}`}
              </text>
            </g>
          ))}
          <text
            x={X0}
            y={VIEW_H - 14}
            textAnchor="start"
            fill="rgba(255,255,252,0.55)"
            className="problem-tl-axis-meta"
          >
            [ TREND STARTS ]
          </text>
          <text
            x={X_END}
            y={VIEW_H - 14}
            textAnchor="end"
            fill="rgba(255,255,252,0.55)"
            className="problem-tl-axis-meta"
          >
            [ WINDOW CLOSED ]
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
        viewBox="0 0 340 280"
        preserveAspectRatio="xMidYMid meet"
        className="problem-chart problem-chart-flat"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="problem-closed-zone-mobile" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#040404" stopOpacity="0" />
            <stop offset="50%" stopColor="#040404" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#040404" stopOpacity="0.28" />
          </linearGradient>
        </defs>

        {(() => {
          const mX0 = 12
          const mXEnd = 328
          const mDX = (mXEnd - mX0) / 12
          const mWeek6 = mX0 + 6 * mDX
          const mTrackY = [60, 130, 200]
          return (
            <>
              <rect x={mWeek6} y={20} width={mXEnd - mWeek6 + 4} height={220} fill="url(#problem-closed-zone-mobile)" />
              <line
                x1={mWeek6}
                y1={20}
                x2={mWeek6}
                y2={235}
                stroke="rgba(255,255,252,0.6)"
                strokeWidth="1"
                strokeDasharray="3 4"
              />
              <text x={mWeek6} y={14} textAnchor="middle" fill="#fffffc" className="problem-tl-boundary">
                WINDOW CLOSES
              </text>
              {TEAMS.map((team, i) => {
                const y = mTrackY[i]
                const shipX = mX0 + team.weekNum * mDX
                const inside = team.weekNum <= 6
                return (
                  <g key={team.id + '-m'}>
                    <text x={mX0} y={y - 18} fill="#fffffc" className="problem-tl-team">
                      {team.label}
                    </text>
                    <line x1={mX0} y1={y} x2={mXEnd} y2={y} stroke="rgba(255,255,252,0.18)" strokeWidth="2" />
                    <line
                      x1={mX0}
                      y1={y}
                      x2={shipX}
                      y2={y}
                      stroke={team.fill}
                      strokeWidth={team.emphasis ? 4 : 3}
                      strokeLinecap="round"
                    />
                    <circle cx={shipX} cy={y} r={team.emphasis ? 9 : 7} fill={team.fill} stroke="#296ff0" strokeWidth="2" />
                    <text
                      x={shipX}
                      y={y + 22}
                      textAnchor={inside ? 'start' : 'end'}
                      fill={team.emphasis ? '#fffffc' : 'rgba(255,255,252,0.7)'}
                      className="problem-tl-sublabel"
                    >
                      {team.week} · {team.subLabel}
                    </text>
                  </g>
                )
              })}
              {[0, 6, 12].map((w) => (
                <text
                  key={'tick-' + w}
                  x={mX0 + w * mDX}
                  y={258}
                  textAnchor="middle"
                  fill="rgba(255,255,252,0.7)"
                  className="problem-tl-tick"
                >
                  {`W${w.toString().padStart(2, '0')}`}
                </text>
              ))}
            </>
          )
        })()}
      </svg>
    </>
  )
}
