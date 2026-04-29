export type Vec3 = [number, number, number]
export interface SurfacePoint { pos: Vec3; normal: Vec3 }

// Canvas grid — 4:5 intrinsic aspect ratio
export const CHAR_W = 8
export const CHAR_H = 14
export const COLS   = 52
export const ROWS   = 40
export const CANVAS_W = COLS * CHAR_W  // 416px
export const CANVAS_H = ROWS * CHAR_H  // 560px

// Projection
const FOCAL = 460
const DIST  = 5.0

// Density ramp: space (darkest/nothing) → dense chars (brightest/facing viewer)
const RAMP = ' .,:;=+*#0123456789@'

// Surface sampling resolution — high enough to fill the grid
const SR = 80   // latitude steps
const SC = 128  // longitude steps
export const SAMPLE_COUNT = SR * SC

// ── Math helpers ─────────────────────────────────────────────────────────────

function norm(v: Vec3): Vec3 {
  const l = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]) || 1
  return [v[0] / l, v[1] / l, v[2] / l]
}

function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

// Light direction: upper-left, slightly in front of the shape
const LIGHT: Vec3 = norm([-0.3, 0.6, -1.0])

// ── Rotation ─────────────────────────────────────────────────────────────────

export function rotateXY(p: Vec3, rx: number, ry: number): Vec3 {
  const [x, y, z] = p
  const y1 = y * Math.cos(rx) - z * Math.sin(rx)
  const z1 = y * Math.sin(rx) + z * Math.cos(rx)
  const x2 = x * Math.cos(ry) + z1 * Math.sin(ry)
  const z2 = -x * Math.sin(ry) + z1 * Math.cos(ry)
  return [x2, y1, z2]
}

// ── Shape samplers ────────────────────────────────────────────────────────────
// All shapes produce exactly SAMPLE_COUNT points in the same (i,j) topology
// so they can be linearly interpolated for smooth morphing.

export function sampleTorus(): SurfacePoint[] {
  const R = 1.0, r = 0.42
  const pts: SurfacePoint[] = []
  for (let i = 0; i < SR; i++) {
    for (let j = 0; j < SC; j++) {
      const u = (j / SC) * Math.PI * 2
      const v = (i / SR) * Math.PI * 2
      const cv = Math.cos(v), sv = Math.sin(v)
      const cu = Math.cos(u), su = Math.sin(u)
      pts.push({
        pos:    [(R + r * cv) * cu, (R + r * cv) * su, r * sv],
        normal: [cv * cu,           cv * su,            sv],
      })
    }
  }
  return pts
}

export function sampleCube(): SurfacePoint[] {
  const s = 0.88
  const pts: SurfacePoint[] = []
  for (let i = 0; i < SR; i++) {
    for (let j = 0; j < SC; j++) {
      const u = (j / SC) * Math.PI * 2
      const v = (i / SR) * Math.PI - Math.PI / 2
      const sx = Math.cos(v) * Math.cos(u)
      const sy = Math.cos(v) * Math.sin(u)
      const sz = Math.sin(v)
      const m  = Math.max(Math.abs(sx), Math.abs(sy), Math.abs(sz))
      // Face normal: dominant axis direction
      const ax = Math.abs(sx), ay = Math.abs(sy), az = Math.abs(sz)
      let nx = 0, ny = 0, nz = 0
      if      (ax >= ay && ax >= az) nx = Math.sign(sx)
      else if (ay >= ax && ay >= az) ny = Math.sign(sy)
      else                           nz = Math.sign(sz)
      pts.push({ pos: [sx / m * s, sy / m * s, sz / m * s], normal: [nx, ny, nz] })
    }
  }
  return pts
}

export function sampleDodecahedron(): SurfacePoint[] {
  const pts: SurfacePoint[] = []
  for (let i = 0; i < SR; i++) {
    for (let j = 0; j < SC; j++) {
      const u = (j / SC) * Math.PI * 2
      const v = (i / SR) * Math.PI - Math.PI / 2
      const sx = Math.cos(v) * Math.cos(u)
      const sy = Math.cos(v) * Math.sin(u)
      const sz = Math.sin(v)
      // Pentagonal-icosahedral distortion approximating dodecahedral facets
      const d = 0.14 * Math.cos(5 * u) * Math.cos(3 * v)
              + 0.07 * Math.cos(2 * u) * Math.cos(4 * v)
      const r = 1.0 * (1 + d)
      pts.push({ pos: [sx * r, sy * r, sz * r], normal: norm([sx, sy, sz]) })
    }
  }
  return pts
}

// ── Morphing ──────────────────────────────────────────────────────────────────
// Mutates `out` in place to avoid per-frame heap allocation.

export function lerpInto(
  a: SurfacePoint[],
  b: SurfacePoint[],
  t: number,
  out: SurfacePoint[]
): void {
  for (let i = 0; i < a.length; i++) {
    const ap = a[i].pos,    bp = b[i].pos
    const an = a[i].normal, bn = b[i].normal

    out[i].pos[0] = ap[0] + (bp[0] - ap[0]) * t
    out[i].pos[1] = ap[1] + (bp[1] - ap[1]) * t
    out[i].pos[2] = ap[2] + (bp[2] - ap[2]) * t

    const nx = an[0] + (bn[0] - an[0]) * t
    const ny = an[1] + (bn[1] - an[1]) * t
    const nz = an[2] + (bn[2] - an[2]) * t
    const nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1
    out[i].normal[0] = nx / nl
    out[i].normal[1] = ny / nl
    out[i].normal[2] = nz / nl
  }
}

// ── Canvas renderer ───────────────────────────────────────────────────────────
// Donut.c-style: dense surface sampling + back-face culling = filled solid look.
// Character chosen by lighting intensity (normal · light direction).

const BLUE  = '#204AF8'
const SPARK = '#4dff9a'

// Typed arrays for z-buffer and char buffer — avoids GC pressure per frame
const _zBuf    = new Float32Array(COLS * ROWS)
const _charBuf = new Uint8Array(COLS * ROWS)
const _spark   = new Uint8Array(COLS * ROWS)

export function renderToCanvas(
  ctx: CanvasRenderingContext2D,
  samples: SurfacePoint[],
  rx: number,
  ry: number
): void {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)

  _zBuf.fill(-1000)
  _charBuf.fill(0)
  _spark.fill(0)

  const halfW = CANVAS_W / 2
  const halfH = CANVAS_H / 2

  for (let s = 0; s < samples.length; s++) {
    const sp = samples[s]
    const rp = rotateXY(sp.pos,    rx, ry)
    const rn = rotateXY(sp.normal, rx, ry)

    const z = rp[2] + DIST
    if (z < 0.1) continue

    // Back-face culling: skip surfaces facing away from viewer.
    // This is the key that makes it look solid, not wireframe.
    const L = dot(rn, LIGHT)
    if (L <= 0) continue

    const col = Math.round((rp[0] / z) * FOCAL / CHAR_W + COLS / 2)
    const row = Math.round(-(rp[1] / z) * FOCAL / CHAR_H + ROWS / 2)

    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) continue

    const idx = row * COLS + col
    if (rp[2] <= _zBuf[idx]) continue

    _zBuf[idx] = rp[2]

    // Gamma-correct the luminance so midtones are richer
    const ci = Math.min(RAMP.length - 1, Math.max(1, Math.floor(Math.pow(L, 0.55) * (RAMP.length - 1))))
    _charBuf[idx] = ci

    // Rare green spark: only on brightest-lit surfaces, low probability
    _spark[idx] = (L > 0.78 && Math.random() < 0.008) ? 1 : 0
  }

  ctx.font = `13px "JetBrains Mono", "Courier New", monospace`
  ctx.textBaseline = 'top'

  for (let row = 0; row < ROWS; row++) {
    const y = row * CHAR_H
    for (let col = 0; col < COLS; col++) {
      const idx = row * COLS + col
      const ci = _charBuf[idx]
      if (!ci) continue
      ctx.fillStyle = _spark[idx] ? SPARK : BLUE
      ctx.fillText(RAMP[ci], col * CHAR_W, y)
    }
  }
}
