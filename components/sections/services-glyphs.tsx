type GlyphProps = {
  active: boolean
  primed?: boolean
  reducedMotion?: boolean
}

const baseClass = 'transition-opacity duration-300 ease-out'

const stateOpacity = (primed: boolean) => (primed ? 'opacity-100' : 'opacity-0')

const NEUTRAL_STROKE = '#cbd5e1'
const NEUTRAL_FILL = '#e2e8f0'
const NEUTRAL_DOT = '#94a3b8'

export function Web3Glyph({ active, primed, reducedMotion }: GlyphProps) {
  const stroke = active ? '#204AF8' : NEUTRAL_STROKE
  const fill = active ? '#204AF8' : NEUTRAL_FILL
  const dotFill = active ? '#204AF8' : NEUTRAL_DOT
  return (
    <svg
      viewBox="-40 -40 80 80"
      width="120"
      height="120"
      className={`services-glyph ${baseClass} ${stateOpacity(primed ?? false)}`}
      data-active={active}
      data-primed={primed ?? false}
      data-reduced-motion={reducedMotion ?? false}
      aria-hidden="true"
    >
      <polygon
        data-draw
        style={{ ['--draw-len' as string]: '60' }}
        points="6.06,-3.5 0,-7 -6.06,-3.5 -6.06,3.5 0,7 6.06,3.5"
        fill="none"
        stroke={stroke}
        strokeWidth="1"
        strokeOpacity={active ? 0.45 : 0.55}
        strokeDasharray="60"
      />
      <polygon
        data-draw
        style={{ ['--draw-len' as string]: '85' }}
        points="12.12,-7 0,-14 -12.12,-7 -12.12,7 0,14 12.12,7"
        fill={fill}
        fillOpacity={active ? 0.22 : 0.45}
        stroke={stroke}
        strokeWidth="1.25"
        strokeDasharray="85"
      />
      {[
        [21.65, 12.5],
        [0, 25],
        [-21.65, 12.5],
        [-21.65, -12.5],
        [0, -25],
        [21.65, -12.5],
      ].map(([x, y], i) => (
        <g key={i} transform={`translate(${x}, ${y})`}>
          <polygon
            data-draw
            style={{ ['--draw-len' as string]: '60' }}
            points="8.66,-5 0,-10 -8.66,-5 -8.66,5 0,10 8.66,5"
            fill={fill}
            fillOpacity={active ? 0.10 : 0.25}
            stroke={stroke}
            strokeWidth="1"
            strokeDasharray="60"
          />
        </g>
      ))}
      <circle cx="0" cy="0" r="1.5" fill={dotFill} />
    </svg>
  )
}

export function AIAgentsGlyph({ active, primed, reducedMotion }: GlyphProps) {
  const stroke = active ? '#10b981' : NEUTRAL_STROKE
  const dotFill = active ? '#10b981' : NEUTRAL_DOT
  return (
    <svg
      viewBox="-40 -40 80 80"
      width="120"
      height="120"
      className={`services-glyph ${baseClass} ${stateOpacity(primed ?? false)}`}
      data-active={active}
      data-primed={primed ?? false}
      data-reduced-motion={reducedMotion ?? false}
      aria-hidden="true"
    >
      <circle
        data-draw
        style={{ ['--draw-len' as string]: '140' }}
        cx="0"
        cy="0"
        r="22"
        fill={active ? 'none' : NEUTRAL_FILL}
        fillOpacity={active ? 0 : 0.35}
        stroke={stroke}
        strokeWidth="1.25"
        strokeOpacity={active ? 0.7 : 0.55}
        strokeDasharray="140"
      />
      {[
        [0, -28],
        [26.63, -8.65],
        [16.46, 22.65],
        [-16.46, 22.65],
        [-26.63, -8.65],
      ].map(([x, y], i) => (
        <line
          key={`ray-${i}`}
          data-draw
          style={{ ['--draw-len' as string]: '32' }}
          x1="0"
          y1="0"
          x2={x}
          y2={y}
          stroke={stroke}
          strokeWidth="0.75"
          strokeOpacity={active ? 0.25 : 0.30}
          strokeDasharray="32"
        />
      ))}
      {[
        [0, -28, 0, 0],
        [26.63, -8.65, 26.63 / 28, -8.65 / 28],
        [16.46, 22.65, 16.46 / 28, 22.65 / 28],
        [-16.46, 22.65, -16.46 / 28, 22.65 / 28],
        [-26.63, -8.65, -26.63 / 28, -8.65 / 28],
      ].map(([x, y, ux, uy], i) => {
        const tx = -uy * 2.5
        const ty = ux * 2.5
        return (
          <g key={`pt-${i}`}>
            <circle cx={x} cy={y} r="3.2" fill={dotFill} />
            <line
              x1={x - tx}
              y1={y - ty}
              x2={x + tx}
              y2={y + ty}
              stroke={stroke}
              strokeWidth="1"
              strokeOpacity={active ? 0.55 : 0.45}
            />
          </g>
        )
      })}
      <circle cx="0" cy="0" r="5" fill={dotFill} />
    </svg>
  )
}

export function ProductStudioGlyph({ active, primed, reducedMotion }: GlyphProps) {
  const stroke = active ? '#F6851B' : NEUTRAL_STROKE
  const fill = active ? '#F6851B' : NEUTRAL_FILL
  return (
    <svg
      viewBox="-40 -40 80 80"
      width="120"
      height="120"
      className={`services-glyph ${baseClass} ${stateOpacity(primed ?? false)}`}
      data-active={active}
      data-primed={primed ?? false}
      data-reduced-motion={reducedMotion ?? false}
      aria-hidden="true"
    >
      <line
        data-draw
        style={{ ['--draw-len' as string]: '60' }}
        x1="0"
        y1="-22"
        x2="0"
        y2="38"
        stroke={stroke}
        strokeWidth="1"
        strokeOpacity={active ? 0.4 : 0.35}
        strokeDasharray="60"
      />
      <polygon
        data-draw
        style={{ ['--draw-len' as string]: '95' }}
        points="0,-22 22,-14 0,-6 -22,-14"
        fill={fill}
        fillOpacity={active ? 0.35 : 0.55}
        stroke={stroke}
        strokeWidth="1.25"
        strokeDasharray="95"
      />
      <polygon
        data-draw
        style={{ ['--draw-len' as string]: '110' }}
        points="0,-4 26,6 0,16 -26,6"
        fill={fill}
        fillOpacity={active ? 0.22 : 0.40}
        stroke={stroke}
        strokeWidth="1"
        strokeDasharray="110"
      />
      <polygon
        data-draw
        style={{ ['--draw-len' as string]: '128' }}
        points="0,14 30,26 0,38 -30,26"
        fill={fill}
        fillOpacity={active ? 0.14 : 0.28}
        stroke={stroke}
        strokeWidth="1"
        strokeDasharray="128"
      />
    </svg>
  )
}

export function PillarGlyph({
  pillarId,
  active,
  primed,
  reducedMotion,
}: {
  pillarId: 'web3' | 'ai-agents' | 'product-studio'
  active: boolean
  primed?: boolean
  reducedMotion?: boolean
}) {
  if (pillarId === 'web3') return <Web3Glyph active={active} primed={primed} reducedMotion={reducedMotion} />
  if (pillarId === 'ai-agents') return <AIAgentsGlyph active={active} primed={primed} reducedMotion={reducedMotion} />
  return <ProductStudioGlyph active={active} primed={primed} reducedMotion={reducedMotion} />
}
