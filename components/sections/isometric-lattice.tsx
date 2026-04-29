'use client'

// ── Constants ────────────────────────────────────────────────────────────────

const CX = 200
const CY = 455
const SCALE = 85
const FLOOR_H = 48
const LEVELS = 8
const COS30 = Math.sqrt(3) / 2
const SQ3_2 = Math.sqrt(3) / 2
const BLUE = '#204AF8'

// Hex cross-section: center + 6 outer nodes (unit hex, counter-clockwise from right)
const HEX: [number, number][] = [
  [0, 0],
  [1, 0],
  [0.5, SQ3_2],
  [-0.5, SQ3_2],
  [-1, 0],
  [-0.5, -SQ3_2],
  [0.5, -SQ3_2],
]

function isoXY(wx: number, wy: number, wz: number): [number, number] {
  return [
    CX + (wx - wz) * COS30 * SCALE,
    CY + (wx + wz) * 0.5 * SCALE - wy * FLOOR_H,
  ]
}

// ── Geometry (computed at module load — deterministic, no browser APIs) ───────

interface N { id: string; sx: number; sy: number; wy: number; ni: number }
interface E { id: string; x1: number; y1: number; x2: number; y2: number; sy: number; wy: number; kind: 'ring'|'spoke'|'vert'|'diag' }

const _nodes: N[] = []
for (let y = 0; y < LEVELS; y++) {
  HEX.forEach(([wx, wz], ni) => {
    const [sx, sy] = isoXY(wx, y, wz)
    _nodes.push({ id: `n_${y}_${ni}`, sx, sy, wy: y, ni })
  })
}

const _edges: E[] = []
const gn = (y: number, i: number) => _nodes[y * 7 + i]

for (let y = 0; y < LEVELS; y++) {
  // Hex ring at this level
  for (let ni = 1; ni <= 6; ni++) {
    const a = gn(y, ni), b = gn(y, (ni % 6) + 1)
    _edges.push({ id: `ring_${y}_${ni}`, x1: a.sx, y1: a.sy, x2: b.sx, y2: b.sy, sy: (a.sy + b.sy) / 2, wy: y, kind: 'ring' })
  }
  // Spokes: center → outer
  for (let ni = 1; ni <= 6; ni++) {
    const c = gn(y, 0), a = gn(y, ni)
    _edges.push({ id: `spk_${y}_${ni}`, x1: c.sx, y1: c.sy, x2: a.sx, y2: a.sy, sy: (c.sy + a.sy) / 2, wy: y, kind: 'spoke' })
  }
  if (y < LEVELS - 1) {
    // Verticals: every node to same node above
    for (let ni = 0; ni < 7; ni++) {
      const a = gn(y, ni), b = gn(y + 1, ni)
      _edges.push({ id: `vert_${y}_${ni}`, x1: a.sx, y1: a.sy, x2: b.sx, y2: b.sy, sy: (a.sy + b.sy) / 2, wy: y, kind: 'vert' })
    }
    // Diagonals: outer ni → outer ni+1 in level above (creates diamond cells)
    for (let ni = 1; ni <= 6; ni++) {
      const a = gn(y, ni), b = gn(y + 1, (ni % 6) + 1)
      _edges.push({ id: `diag_${y}_${ni}`, x1: a.sx, y1: a.sy, x2: b.sx, y2: b.sy, sy: (a.sy + b.sy) / 2, wy: y, kind: 'diag' })
    }
  }
}

// Painter's algorithm: sort ascending sy (higher on screen = further back = render first)
const NODES = [..._nodes].sort((a, b) => a.sy - b.sy)
const EDGES = [..._edges].sort((a, b) => a.sy - b.sy)

// ── Helpers ───────────────────────────────────────────────────────────────────

// Build delay: bottom level first → top level last
function buildDelay(wy: number, offset = 0): string {
  return `${(wy * 0.25 + offset).toFixed(2)}s`
}

// Pulse delay: starts after build finishes (~2s), staggered per node
function pulseDelay(wy: number, ni: number): string {
  return `${(2.4 + (wy * 7 + ni) * 0.19).toFixed(2)}s`
}

function pulseDur(ni: number): string {
  return `${(3.2 + (ni % 4) * 0.7).toFixed(1)}s`
}

// Edge opacity by kind
const EDGE_OPACITY: Record<E['kind'], number> = {
  ring: 0.55,
  vert: 0.45,
  diag: 0.38,
  spoke: 0.18,
}

// ── Component ─────────────────────────────────────────────────────────────────

export function IsometricLattice({ className = '' }: { className?: string }) {
  return (
    <div
      className={className}
      aria-hidden="true"
      style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <svg
        viewBox="0 0 400 560"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: 'auto', height: '88%', maxWidth: '92%', overflow: 'visible' }}
      >
        <defs>
          <filter id="ilGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="ilGlowSoft" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="nodeFill" cx="38%" cy="35%" r="65%">
            <stop offset="0%" stopColor={BLUE} stopOpacity="0.22" />
            <stop offset="100%" stopColor={BLUE} stopOpacity="0.04" />
          </radialGradient>
          <radialGradient id="nodeFillBright" cx="38%" cy="35%" r="65%">
            <stop offset="0%" stopColor={BLUE} stopOpacity="0.45" />
            <stop offset="100%" stopColor={BLUE} stopOpacity="0.08" />
          </radialGradient>
        </defs>

        <style>{`
          @keyframes ilEdgeIn {
            from { opacity: 0 }
            to   { opacity: var(--eo, 0.45) }
          }
          @keyframes ilNodeIn {
            0%   { opacity: 0; r: 2 }
            60%  { opacity: 1; r: calc(var(--nr, 9) * 1.15) }
            100% { opacity: 1; r: var(--nr, 9) }
          }
          @keyframes ilPulse {
            0%, 100% { opacity: 0.55 }
            50%       { opacity: 1 }
          }
          @keyframes ilFloat {
            0%, 100% { transform: translateY(0px) }
            50%       { transform: translateY(-7px) }
          }
          .il-root {
            animation: ilFloat 7s ease-in-out 2.4s infinite;
          }
          .il-edge {
            animation: ilEdgeIn 0.45s ease-out both;
          }
          .il-node {
            animation:
              ilNodeIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both,
              ilPulse var(--pd, 3.5s) ease-in-out var(--pde, 3s) infinite;
          }
        `}</style>

        <g className="il-root">

          {/* Edges — rendered back-to-front */}
          <g fill="none">
            {EDGES.map(e => (
              <line
                key={e.id}
                className="il-edge"
                x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                stroke={BLUE}
                strokeWidth={e.kind === 'ring' ? 1.2 : e.kind === 'spoke' ? 0.7 : 1}
                style={{
                  '--eo': EDGE_OPACITY[e.kind],
                  animationDelay: buildDelay(e.wy, e.kind === 'diag' ? 0.1 : 0),
                } as React.CSSProperties}
              />
            ))}
          </g>

          {/* Nodes — rendered back-to-front */}
          <g>
            {NODES.map(n => {
              const isCenter = n.ni === 0
              const isTop    = n.wy === LEVELS - 1
              const r = isCenter ? 5.5 : isTop ? 11 : 9.5
              const useBright = isTop && !isCenter
              return (
                <circle
                  key={n.id}
                  className="il-node"
                  cx={n.sx}
                  cy={n.sy}
                  r={r}
                  fill={`url(#${useBright ? 'nodeFillBright' : 'nodeFill'})`}
                  stroke={BLUE}
                  strokeWidth={isTop ? 1.4 : 0.9}
                  filter={isTop ? 'url(#ilGlow)' : n.wy >= LEVELS - 3 ? 'url(#ilGlowSoft)' : undefined}
                  style={{
                    '--nr': r,
                    '--pd': pulseDur(n.ni),
                    '--pde': pulseDelay(n.wy, n.ni),
                    animationDelay: buildDelay(n.wy, 0.08),
                  } as React.CSSProperties}
                />
              )
            })}
          </g>

        </g>
      </svg>
    </div>
  )
}
