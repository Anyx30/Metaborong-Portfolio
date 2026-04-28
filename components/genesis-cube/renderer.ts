export type Vec3 = [number, number, number]

export interface RenderConfig {
  rows: number
  cols: number
  dist: number
  scale: number
}

export const DEFAULT_CONFIG: RenderConfig = { rows: 40, cols: 80, dist: 5, scale: 18 }

const RAMP = ' 0123456789'

function luminanceChar(z: number, zMin: number, zMax: number): string {
  const t = zMax === zMin ? 0.5 : (z - zMin) / (zMax - zMin)
  const idx = Math.floor(t * (RAMP.length - 1))
  return RAMP[Math.max(0, Math.min(RAMP.length - 1, idx))]
}

export function rotate(p: Vec3, rx: number, ry: number): Vec3 {
  const [x, y, z] = p
  const y1 = y * Math.cos(rx) - z * Math.sin(rx)
  const z1 = y * Math.sin(rx) + z * Math.cos(rx)
  const x2 = x * Math.cos(ry) + z1 * Math.sin(ry)
  const z2 = -x * Math.sin(ry) + z1 * Math.cos(ry)
  return [x2, y1, z2]
}

function project(p: Vec3, cfg: RenderConfig): [number, number] {
  const [x, y, z] = p
  const d = z + cfg.dist
  return [
    Math.round((x / d) * cfg.scale + cfg.cols / 2),
    Math.round(-(y / d) * cfg.scale + cfg.rows / 2),
  ]
}

function drawLine(
  grid: string[][],
  zbuf: number[][],
  p1: Vec3,
  p2: Vec3,
  rx: number,
  ry: number,
  cfg: RenderConfig,
  zMin: number,
  zMax: number
): void {
  const r1 = rotate(p1, rx, ry)
  const r2 = rotate(p2, rx, ry)
  const [x1, y1] = project(r1, cfg)
  const [x2, y2] = project(r2, cfg)
  const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1), 1)
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const px = Math.round(x1 + (x2 - x1) * t)
    const py = Math.round(y1 + (y2 - y1) * t)
    const pz = r1[2] + (r2[2] - r1[2]) * t
    if (px >= 0 && px < cfg.cols && py >= 0 && py < cfg.rows) {
      if (pz > zbuf[py][px]) {
        zbuf[py][px] = pz
        grid[py][px] = luminanceChar(pz, zMin, zMax)
      }
    }
  }
}

const SR = 16
const SC = 32

export function sampleTorus(): Vec3[] {
  const R = 1.0, r = 0.42
  const pts: Vec3[] = []
  for (let i = 0; i < SR; i++) {
    for (let j = 0; j < SC; j++) {
      const u = (j / SC) * Math.PI * 2
      const v = (i / SR) * Math.PI * 2
      pts.push([(R + r * Math.cos(v)) * Math.cos(u), (R + r * Math.cos(v)) * Math.sin(u), r * Math.sin(v)])
    }
  }
  return pts
}

export function sampleCube(): Vec3[] {
  const s = 0.9
  const pts: Vec3[] = []
  for (let i = 0; i < SR; i++) {
    for (let j = 0; j < SC; j++) {
      const u = (j / SC) * Math.PI * 2
      const v = (i / SR) * Math.PI - Math.PI / 2
      const sx = Math.cos(v) * Math.cos(u)
      const sy = Math.cos(v) * Math.sin(u)
      const sz = Math.sin(v)
      const m = Math.max(Math.abs(sx), Math.abs(sy), Math.abs(sz))
      pts.push([sx / m * s, sy / m * s, sz / m * s])
    }
  }
  return pts
}

export function sampleDodecahedron(): Vec3[] {
  const pts: Vec3[] = []
  for (let i = 0; i < SR; i++) {
    for (let j = 0; j < SC; j++) {
      const u = (j / SC) * Math.PI * 2
      const v = (i / SR) * Math.PI - Math.PI / 2
      const sx = Math.cos(v) * Math.cos(u)
      const sy = Math.cos(v) * Math.sin(u)
      const sz = Math.sin(v)
      const mod = 1 + 0.18 * Math.cos(5 * u) * Math.cos(3 * v)
      pts.push([sx * mod, sy * mod, sz * mod])
    }
  }
  return pts
}

export function lerpShapes(a: Vec3[], b: Vec3[], t: number): Vec3[] {
  return a.map((pa, i) => [
    pa[0] + (b[i][0] - pa[0]) * t,
    pa[1] + (b[i][1] - pa[1]) * t,
    pa[2] + (b[i][2] - pa[2]) * t,
  ])
}

export function buildEdges(): Array<[number, number]> {
  const edges: Array<[number, number]> = []
  for (let i = 0; i < SR; i++) {
    for (let j = 0; j < SC; j++) {
      edges.push(
        [i * SC + j, i * SC + ((j + 1) % SC)],
        [i * SC + j, ((i + 1) % SR) * SC + j]
      )
    }
  }
  return edges
}

export function renderFrame(pts: Vec3[], edges: Array<[number, number]>, rx: number, ry: number, cfg: RenderConfig): string {
  const grid: string[][] = Array.from({ length: cfg.rows }, () => Array(cfg.cols).fill(' '))
  const zbuf: number[][] = Array.from({ length: cfg.rows }, () => Array(cfg.cols).fill(-Infinity))
  const rotated = pts.map(p => rotate(p, rx, ry))
  const zVals = rotated.map(p => p[2])
  const zMin = Math.min(...zVals)
  const zMax = Math.max(...zVals)
  for (const [a, b] of edges) drawLine(grid, zbuf, pts[a], pts[b], rx, ry, cfg, zMin, zMax)
  return grid.map(row => row.join('')).join('\n')
}
