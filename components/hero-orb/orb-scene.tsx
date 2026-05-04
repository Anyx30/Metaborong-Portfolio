'use client'

import { useRef, useMemo, useEffect, useState, useCallback, type KeyboardEvent } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { useTimeOfDay } from '@/lib/use-time-of-day'
import { useDeviceTier, type DeviceTier } from '@/lib/use-device-tier'
import { useGeo, regionFor, type Region } from '@/lib/use-geo'

// ── Constants ─────────────────────────────────────────────────────────────────

const N_TOTAL = 394   // 380 filler glyphs + 14 service nodes
const N_ORANGE = 14
const SPHERE_R = 1.25
const NODE_R = 0.030
const AUTO_SPEED = 0.058  // rad/s ≈ OrbitControls 0.55

// Glyph alphabet for filler nodes — weighted toward soft characters,
// denser ones used as accents.
const GLYPHS = ['·', '·', '·', '·', '+', '+', '*', '◦', '╳', '█'] as const

const CAT_COLOR = {
  WEB3: '#F6851B',
  AI: '#4dff9a',
  PRODUCT: '#204AF8',
} as const

// ── Reduced motion detection ──────────────────────────────────────────────────

function useReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduce(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setReduce(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduce
}

// ── Services ──────────────────────────────────────────────────────────────────

const SERVICES: { name: string; cat: keyof typeof CAT_COLOR }[] = [
  { name: 'DeFi Protocol Development', cat: 'WEB3' },
  { name: 'Smart Contract Security', cat: 'WEB3' },
  { name: 'NFT Marketplace Dev', cat: 'WEB3' },
  { name: 'Crypto Wallet Development', cat: 'WEB3' },
  { name: 'Token Launchpad', cat: 'WEB3' },
  { name: 'Liquid Staking Vaults', cat: 'WEB3' },
  { name: 'DAO & Governance Systems', cat: 'WEB3' },
  { name: 'Agentic AI Systems', cat: 'AI' },
  { name: 'Generative AI Development', cat: 'AI' },
  { name: 'AI Workflow Automation', cat: 'AI' },
  { name: 'Voice Agent Integration', cat: 'AI' },
  { name: 'RAG & Knowledge Systems', cat: 'AI' },
  { name: 'AI Systems Integration', cat: 'AI' },
  { name: 'SaaS Product Development', cat: 'PRODUCT' },
]

// ── Geometry helpers ──────────────────────────────────────────────────────────

function fibonacciSphere(n: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  const phi = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    pts.push(new THREE.Vector3(Math.cos(phi * i) * r, y, Math.sin(phi * i) * r))
  }
  return pts
}

function pickOrangeIndices(): Set<number> {
  const step = Math.floor(N_TOTAL / N_ORANGE)
  const s = new Set<number>()
  for (let i = 0; i < N_ORANGE; i++) s.add(Math.round(step * i + step * 0.5))
  return s
}

function buildEdges(pts: THREE.Vector3[]): number[] {
  const pairs: number[] = []
  const seen = new Set<string>()
  pts.forEach((p, i) => {
    pts.map((q, j) => ({ j, d: p.distanceTo(q) }))
      .sort((a, b) => a.d - b.d)
      .slice(1, 6)
      .forEach(({ j }) => {
        const key = i < j ? `${i}_${j}` : `${j}_${i}`
        if (!seen.has(key)) { seen.add(key); pairs.push(i, j) }
      })
  })
  return pairs
}

// Adjacency: vertexIndex → list of edge indices (positions in the flat pairs array)
function buildAdjacency(pairs: number[]): Map<number, number[]> {
  const adj = new Map<number, number[]>()
  for (let e = 0; e < pairs.length; e += 2) {
    const a = pairs[e]
    const b = pairs[e + 1]
    if (!adj.has(a)) adj.set(a, [])
    if (!adj.has(b)) adj.set(b, [])
    adj.get(a)!.push(e / 2)
    adj.get(b)!.push(e / 2)
  }
  return adj
}

// Cheap deterministic hash → 0..1 — gives consistent size variation
// without re-randomising on every module load.
function hashF(i: number): number {
  let x = ((i * 2654435761) >>> 0)
  x = ((x ^ (x >>> 16)) >>> 0)
  return x / 0xFFFFFFFF
}

// ── Module-level geometry (client-only, built once) ───────────────────────────

const _unitPts = fibonacciSphere(N_TOTAL)
const _orangeIdxSet = pickOrangeIndices()
const _orangeIdxs = [..._orangeIdxSet]
const _worldPts = _unitPts.map(p => p.clone().multiplyScalar(SPHERE_R))
const _orangePts = _orangeIdxs.map(i => _worldPts[i])

// ── Filler ASCII glyphs: per-node Sprite with cached canvas textures ──────────
// Skills ref (threejs-geometry, threejs-fundamentals): Sprite always faces
// camera; CanvasTexture lets us draw any glyph and reuse via a Map cache.

const _glyphTextureCache = new Map<string, THREE.Texture>()

function getGlyphTexture(glyph: string): THREE.Texture {
  const cached = _glyphTextureCache.get(glyph)
  if (cached) return cached

  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, size, size)
  // Spec calibrated #c8d8ff for a darker bg; on bg-bg-subtle #f5f7ff that's
  // invisible. Use brand-blue tone to match the prior dot fill on this surface.
  ctx.fillStyle = '#3b5dd9'
  ctx.font = '700 44px "JetBrains Mono", monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(glyph, size / 2, size / 2 + 2)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.needsUpdate = true
  _glyphTextureCache.set(glyph, tex)
  return tex
}

function buildGlyphSprites(): THREE.Group {
  const group = new THREE.Group()
  const sizeFor = (g: string): number => {
    if (g === '·') return 0.040
    if (g === '+') return 0.052
    if (g === '*') return 0.058
    if (g === '◦') return 0.064
    if (g === '╳') return 0.066
    return 0.072 // █
  }

  _unitPts.forEach((_, i) => {
    if (_orangeIdxSet.has(i)) return
    const glyph = GLYPHS[Math.floor(hashF(i) * GLYPHS.length)]
    const mat = new THREE.SpriteMaterial({
      map: getGlyphTexture(glyph),
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    })
    const sprite = new THREE.Sprite(mat)
    sprite.position.copy(_worldPts[i])
    const s = sizeFor(glyph) * (0.85 + hashF(i + 1) * 0.30)
    sprite.scale.set(s, s, s)
    group.add(sprite)
  })
  return group
}

// ── Edges: depth-based vertex colours for visual depth cue ───────────────────
// Skills ref (threejs-geometry): per-vertex colour on BufferGeometry.
// Front vertices (z > 0) get stronger blue; back vertices get muted blue.
// Since the group rotates we use the INITIAL z (precomputed once) as a proxy
// for the average front/back depth — avoids per-frame colour buffer updates.

interface EdgeBundle {
  lines: THREE.LineSegments  // baseline dim mesh — stays calm
  pulseLines: THREE.LineSegments  // overlay mesh — only active pulses
  pulsePositions: Float32Array        // shared buffer for pulse positions
  pairs: number[]
  adjacency: Map<number, number[]>
}

function buildEdgeLines(): EdgeBundle {
  const pairs = buildEdges(_unitPts)
  const n = pairs.length
  const pos = new Float32Array(n * 3)
  const col = new Float32Array(n * 3)

  // Brand-locked: do NOT tint the front-facing blue. Time-of-day shift only
  // applies to the dim baseline so the visual identity stays consistent.
  const blue = new THREE.Color('#204AF8')
  const dim  = new THREE.Color('#99aeff')
  if (hueShiftDeg !== 0) dim.offsetHSL(hueShiftDeg / 360, 0, 0)

  for (let i = 0; i < n; i++) {
    const wp = _worldPts[pairs[i]]
    wp.toArray(pos, i * 3)

    const t = (wp.z + SPHERE_R) / (2 * SPHERE_R)
    const c = blue.clone().lerp(dim, 1 - t)
    c.toArray(col, i * 3)
  }

  // Baseline mesh — dim, the resting network
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
  const lines = new THREE.LineSegments(
    geo,
    new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.32 })
  )

  // Pulse overlay mesh — sized for up to 24 active edge segments at once.
  // Per-vertex colors so concurrent pulses can render in different brand
  // colors (alternates orange/green, matching Web3/AI pillar palette).
  const PULSE_CAPACITY = 24
  const pulsePositions = new Float32Array(PULSE_CAPACITY * 2 * 3) // 2 vertices per edge
  const pulseColors = new Float32Array(PULSE_CAPACITY * 2 * 3)
  const pulseGeo = new THREE.BufferGeometry()
  pulseGeo.setAttribute('position', new THREE.BufferAttribute(pulsePositions, 3))
  pulseGeo.setAttribute('color', new THREE.BufferAttribute(pulseColors, 3))
  pulseGeo.setDrawRange(0, 0)
  const pulseLines = new THREE.LineSegments(
    pulseGeo,
    new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      depthWrite: false,
    })
  )

  return {
    lines,
    pulseLines,
    pulsePositions,
    pairs,
    adjacency: buildAdjacency(pairs),
  }
}

// ── Edge pulse: walks adjacency graph, animates a chain over 800ms ───────────

interface ActivePulse {
  edgeIndices: number[]
  startTime: number
  color: [number, number, number]  // RGB 0..1, picked at fire time
}

// Pulse palette — alternates between Web3 orange and AI green for variety.
// Brand-blue (Product) is omitted because it would blend into the dim
// blue baseline mesh.
const PULSE_COLORS: [number, number, number][] = [
  [0xF6 / 255, 0x85 / 255, 0x1B / 255],  // orange — Web3
  [0x4D / 255, 0xFF / 255, 0x9A / 255],  // green — AI
]

function walkChain(
  adjacency: Map<number, number[]>,
  pairs: number[],
  length: number,
): number[] {
  const vertices = [...adjacency.keys()]
  if (vertices.length === 0) return []
  const startVertex = vertices[Math.floor(Math.random() * vertices.length)]
  const visited = new Set<number>()
  const chain: number[] = []
  let current = startVertex
  for (let step = 0; step < length; step++) {
    const neighbors = (adjacency.get(current) || []).filter(e => !visited.has(e))
    if (neighbors.length === 0) break
    const edgeIdx = neighbors[Math.floor(Math.random() * neighbors.length)]
    visited.add(edgeIdx)
    chain.push(edgeIdx)
    const a = pairs[edgeIdx * 2]
    const b = pairs[edgeIdx * 2 + 1]
    current = current === a ? b : a
  }
  return chain
}

function useEdgePulse(bundle: EdgeBundle, reducedMotion: boolean) {
  const lastFireRef = useRef(0)
  const colorIndexRef = useRef(0)  // alternates 0/1 for orange/green
  const activeRef = useRef<ActivePulse[]>([])

  useFrame(({ clock }) => {
    const pulseGeo = bundle.pulseLines.geometry
    const pulseMat = bundle.pulseLines.material as THREE.LineBasicMaterial
    const posAttr = pulseGeo.getAttribute('position') as THREE.BufferAttribute
    const colAttr = pulseGeo.getAttribute('color') as THREE.BufferAttribute
    const posArr = posAttr.array as Float32Array
    const colArr = colAttr.array as Float32Array

    if (reducedMotion) {
      if (activeRef.current.length > 0) {
        pulseGeo.setDrawRange(0, 0)
        activeRef.current = []
      }
      return
    }

    const now = clock.elapsedTime * 1000

    // Fire a new pulse every 1-2s, alternating color
    if (now - lastFireRef.current > 1000 + Math.random() * 1000) {
      lastFireRef.current = now
      const chainLen = 3 + Math.floor(Math.random() * 3) // 3..5
      const chain = walkChain(bundle.adjacency, bundle.pairs, chainLen)
      if (chain.length > 0) {
        const color = PULSE_COLORS[colorIndexRef.current]
        colorIndexRef.current = (colorIndexRef.current + 1) % PULSE_COLORS.length
        activeRef.current.push({ edgeIndices: chain, startTime: now, color })
      }
    }

    let writeIdx = 0
    let peakAlpha = 0
    const baselinePos = bundle.lines.geometry.getAttribute('position').array as Float32Array

    activeRef.current = activeRef.current.filter(p => {
      const elapsed = now - p.startTime
      if (elapsed > 800) return false
      const alpha = elapsed < 200
        ? (elapsed / 200) * 1.0
        : (1 - (elapsed - 200) / 600) * 1.0
      if (alpha > peakAlpha) peakAlpha = alpha

      for (const edgeIdx of p.edgeIndices) {
        if (writeIdx >= 24) break // capacity guard
        const srcOffset = edgeIdx * 6
        const dstOffset = writeIdx * 6
        for (let i = 0; i < 6; i++) {
          posArr[dstOffset + i] = baselinePos[srcOffset + i]
        }
        // Write this pulse's color to both vertices of the segment
        for (let v = 0; v < 2; v++) {
          colArr[dstOffset + v * 3] = p.color[0]
          colArr[dstOffset + v * 3 + 1] = p.color[1]
          colArr[dstOffset + v * 3 + 2] = p.color[2]
        }
        writeIdx++
      }
      return true
    })

    pulseGeo.setDrawRange(0, writeIdx * 2)
    posAttr.needsUpdate = true
    colAttr.needsUpdate = true
    pulseMat.opacity = peakAlpha
  })
}

// ── Background drift particles ───────────────────────────────────────────────
// Count is hardware-tier-aware (set by useDeviceTier in OrbScene); buildDrift
// receives it as a parameter rather than reading a module constant.

const DRIFT_SPEED = 0.02 // units / second
// Symmetric box around the orb so particles fill the surrounding space evenly
// from the camera's fixed viewing angle, not clustered behind.
const DRIFT_BOX = { x: 3.4, y: 3.4, zMin: -1.6, zMax: 1.0 }

const DRIFT_COUNT_BY_TIER: Record<DeviceTier, number> = {
  high: 180,
  mid:  90,
  low:  45,
}

// Service indices to feature more often in the auto-cycle, bucketed by region.
// Indices match the SERVICES array order. When the visitor has consented to
// geo and the country resolves to a known region, the auto-cycle picks 60% of
// the time from this list; the remaining 40% stays uniform random for variety.
// 'other' (and the no-consent default) means pure uniform.
const FEATURED_BY_REGION: Record<Region, number[]> = {
  americas: [0, 7, 8],            // DeFi Protocol, Agentic AI, Generative AI
  emea:     [1, 6, 9],            // Smart Contract Security, DAO & Governance, AI Workflow
  apac:     [4, 5, 10, 11],       // Token Launchpad, Liquid Staking, Voice Agent, RAG
  other:    [],                   // no bias
}

const FEATURED_PICK_RATE = 0.6    // 60% of auto-fires draw from the featured list

interface DriftBundle {
  points: THREE.Points
  positions: Float32Array
  velocities: Float32Array
}

function buildDrift(count: number, hueShiftDeg: number): DriftBundle {
  const positions  = new Float32Array(count * 3)
  const velocities = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * DRIFT_BOX.x
    positions[i * 3 + 1] = (Math.random() - 0.5) * DRIFT_BOX.y
    positions[i * 3 + 2] = DRIFT_BOX.zMin + Math.random() * (DRIFT_BOX.zMax - DRIFT_BOX.zMin)

    const vx = Math.random() - 0.5
    const vy = Math.random() - 0.5
    const vz = Math.random() - 0.5  // full-range z velocity for true 3D drift
    const len = Math.hypot(vx, vy, vz) || 1
    velocities[i * 3] = (vx / len) * DRIFT_SPEED
    velocities[i * 3 + 1] = (vy / len) * DRIFT_SPEED
    velocities[i * 3 + 2] = (vz / len) * DRIFT_SPEED
  }

  const driftColor = new THREE.Color('#3b5dd9') // matches glyph fill
  if (hueShiftDeg !== 0) driftColor.offsetHSL(hueShiftDeg / 360, 0, 0)

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const mat = new THREE.PointsMaterial({
    color: '#3b5dd9',  // matches glyph fill so it reads as a single visual system
    size: 0.018,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
    sizeAttenuation: true,
  })
  const points = new THREE.Points(geo, mat)
  points.renderOrder = -1
  return { points, positions, velocities }
}

function useDrift(bundle: DriftBundle, reducedMotion: boolean) {
  useFrame((_, delta) => {
    if (reducedMotion) return
    const pos = bundle.positions
    const vel = bundle.velocities
    const count = pos.length / 3   // derived from bundle so loop bound matches the actual buffer
    const halfX = DRIFT_BOX.x / 2
    const halfY = DRIFT_BOX.y / 2

    for (let i = 0; i < count; i++) {
      pos[i * 3]     += vel[i * 3]     * delta
      pos[i * 3 + 1] += vel[i * 3 + 1] * delta
      pos[i * 3 + 2] += vel[i * 3 + 2] * delta

      if (pos[i * 3] > halfX) pos[i * 3] = -halfX
      if (pos[i * 3] < -halfX) pos[i * 3] = halfX
      if (pos[i * 3 + 1] > halfY) pos[i * 3 + 1] = -halfY
      if (pos[i * 3 + 1] < -halfY) pos[i * 3 + 1] = halfY
      if (pos[i * 3 + 2] > DRIFT_BOX.zMax) pos[i * 3 + 2] = DRIFT_BOX.zMin
      if (pos[i * 3 + 2] < DRIFT_BOX.zMin) pos[i * 3 + 2] = DRIFT_BOX.zMax
    }

    const attr = bundle.points.geometry.getAttribute('position') as THREE.BufferAttribute
    attr.needsUpdate = true
  })
}

// ── CSS keyframes injected once ───────────────────────────────────────────────

const KF = `
@keyframes _orbIn {
  0%   { opacity:0; transform:scale(.88); filter:blur(5px) }
  18%  { opacity:1; transform:scale(1);   filter:blur(0)   }
  76%  { opacity:1 }
  100% { opacity:0 }
}
@keyframes _orbCur { 0%,100%{opacity:1} 50%{opacity:0} }
@keyframes _orbScn {
  0%   { transform:translateY(-100%); opacity:.15 }
  50%  { opacity:.45 }
  100% { transform:translateY(350%);  opacity:.15 }
}
`
function useKeyframes() {
  useEffect(() => {
    const el = Object.assign(document.createElement('style'), { textContent: KF })
    document.head.appendChild(el)
    return () => el.remove()
  }, [])
}

// ── Custom orbit controller ───────────────────────────────────────────────────

function useOrbit(groupRef: React.RefObject<THREE.Group | null>, reducedMotion: boolean) {
  const { gl } = useThree()
  const velY = useRef(0)
  const velX = useRef(0)
  const d = useRef({ active: false, moved: false, lx: 0, ly: 0 })

  useEffect(() => {
    const canvas = gl.domElement
    const onDown = (e: PointerEvent) => {
      if (e.target !== canvas) return
      d.current = { active: true, moved: false, lx: e.clientX, ly: e.clientY }
    }
    const onMove = (e: PointerEvent) => {
      const s = d.current
      if (!s.active) return
      const dx = e.clientX - s.lx
      const dy = e.clientY - s.ly
      s.lx = e.clientX; s.ly = e.clientY
      if (!s.moved && Math.hypot(dx, dy) > 5) s.moved = true
      if (s.moved) { velY.current = dx * 0.007; velX.current = dy * 0.004 }
    }
    const onUp = () => { d.current.active = false }

    document.addEventListener('pointerdown', onDown)
    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
    }
  }, [gl])

  useFrame((_, delta) => {
    if (!groupRef.current) return
    if (!d.current.active) {
      const target = reducedMotion ? 0 : AUTO_SPEED * delta
      velY.current = velY.current * 0.90 + target * 0.10
      velX.current *= 0.90
    }
    groupRef.current.rotation.y += velY.current
    groupRef.current.rotation.x = Math.max(-0.28, Math.min(0.28,
      groupRef.current.rotation.x + velX.current
    ))
  })
}

// ── HUD floating label ────────────────────────────────────────────────────────

interface LabelState {
  id: number
  localPos: THREE.Vector3
  svc: { name: string; cat: keyof typeof CAT_COLOR }
  openLeft: boolean
}

function FloatingLabel({ state, onExpire }: { state: LabelState; onExpire: () => void }) {
  const color = CAT_COLOR[state.svc.cat]

  useEffect(() => {
    const t = setTimeout(onExpire, 3600)
    return () => clearTimeout(t)
  }, [state.id, onExpire])

  const wrapTransform = state.openLeft
    ? 'translateX(-100%) translateY(-100%)'
    : 'translateX(0%)    translateY(-100%)'

  return (
    <Html
      position={state.localPos.toArray() as [number, number, number]}
      zIndexRange={[30, 30]}
      style={{ transform: wrapTransform, pointerEvents: 'none' }}
    >
      <div style={{
        position: 'relative',
        background: 'rgba(2, 6, 26, 0.94)',
        border: `1px solid ${color}88`,
        borderRadius: '2px',
        padding: '10px 20px 10px 14px',
        boxShadow: `0 0 28px ${color}38, 0 0 8px ${color}65, inset 0 0 20px ${color}06`,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        userSelect: 'none',
        minWidth: '170px',
        animation: '_orbIn 3.6s cubic-bezier(.16,1,.3,1) forwards',
      }}>
        {(['tl', 'tr', 'bl', 'br'] as const).map(c => (
          <span key={c} style={{
            position: 'absolute',
            width: 9, height: 9,
            top: c[0] === 't' ? -1 : 'auto',
            bottom: c[0] === 'b' ? -1 : 'auto',
            left: c[1] === 'l' ? -1 : 'auto',
            right: c[1] === 'r' ? -1 : 'auto',
            borderTop: c[0] === 't' ? `2px solid ${color}` : 'none',
            borderBottom: c[0] === 'b' ? `2px solid ${color}` : 'none',
            borderLeft: c[1] === 'l' ? `2px solid ${color}` : 'none',
            borderRight: c[1] === 'r' ? `2px solid ${color}` : 'none',
          }} />
        ))}
        <span style={{
          position: 'absolute', inset: 0, height: '30%',
          background: `linear-gradient(transparent, ${color}14, transparent)`,
          animation: '_orbScn 2.2s linear infinite', pointerEvents: 'none',
        }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, position: 'relative' }}>
          <span style={{
            width: 5, height: 5, borderRadius: '50%',
            background: color, boxShadow: `0 0 7px ${color}`, flexShrink: 0,
          }} />
          <span style={{
            fontFamily: '"JetBrains Mono", "Courier New", monospace',
            fontSize: '11px', color: '#d8e8ff',
            letterSpacing: '0.06em', textTransform: 'uppercase' as const,
          }}>
            {state.svc.name}
          </span>
          <span style={{
            fontFamily: 'monospace', color, fontWeight: 700,
            animation: '_orbCur .8s step-end infinite', marginLeft: 1,
          }}>_</span>
        </div>
      </div>
    </Html>
  )
}

// ── Service node ──────────────────────────────────────────────────────────────
// Skills ref (threejs-fundamentals): MeshStandardMaterial + lights for 3D depth.
// Staggered sine pulse on each node — each node gets its own phase in [0, 2π].

function ServiceNode({
  pos, color, serviceIdx, isFeatured, onHover,
}: {
  pos: THREE.Vector3; color: string; serviceIdx: number
  /** When true (region-featured), the pulse amplitude is bumped from ±7% to
   * ±9% so the regional bias is visible at a glance, not just inferable from
   * the auto-cycle's label rotation. */
  isFeatured: boolean
  onHover: (pos: THREE.Vector3, idx: number) => void
}) {
  const coreRef = useRef<THREE.Mesh>(null)
  // Spread nodes across the full phase circle so the wave propagates around the sphere
  const phase = (serviceIdx / N_ORANGE) * Math.PI * 2

  useFrame(({ clock }) => {
    if (!coreRef.current) return
    const amp = isFeatured ? 0.09 : 0.07
    const s = 1 + Math.sin(clock.elapsedTime * 1.6 + phase) * amp
    coreRef.current.scale.setScalar(s)
  })

  const onEnter = useCallback((e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    document.body.style.cursor = 'pointer'
    onHover(pos, serviceIdx)
  }, [pos, serviceIdx, onHover])

  const onLeave = useCallback((e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    document.body.style.cursor = 'default'
  }, [])

  const serviceName = SERVICES[serviceIdx].name

  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onHover(pos, serviceIdx)
    }
  }

  return (
    <group position={pos}>
      {/* Large halo — extends the hover hitbox and adds soft glow */}
      <mesh onPointerEnter={onEnter} onPointerLeave={onLeave}>
        <sphereGeometry args={[NODE_R * 2.6, 8, 6]} />
        <meshBasicMaterial color={color} transparent opacity={0.09} />
      </mesh>
      {/* Core — MeshStandardMaterial so world-space lights create a 3D highlight
          that shifts dynamically as the sphere rotates. emissive keeps nodes
          visible even in shadowed areas. */}
      <mesh ref={coreRef} onPointerEnter={onEnter} onPointerLeave={onLeave}>
        <sphereGeometry args={[NODE_R, 12, 10]} />
        <meshStandardMaterial
          color={color}
          roughness={0.22}
          metalness={0.12}
          emissive={color}
          emissiveIntensity={0.32}
        />
      </mesh>
      {/* Always-on-top hit target — sits in screen space via <Html>, so it
          works for keyboard (Tab, Enter/Space) AND pointer hover when the
          underlying 3D mesh rotates behind the sphere and gets occluded by
          glyphs. Without this, hover only worked on front-facing nodes. */}
      <Html center zIndexRange={[20, 20]}>
        <button
          type="button"
          aria-label={`View ${serviceName} service`}
          onKeyDown={onKey}
          onFocus={() => onHover(pos, serviceIdx)}
          onMouseEnter={() => {
            document.body.style.cursor = 'pointer'
            onHover(pos, serviceIdx)
          }}
          onMouseLeave={() => { document.body.style.cursor = 'default' }}
          className="w-11 h-11 lg:w-6 lg:h-6 rounded-full bg-transparent border-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ outlineColor: color }}
        />
      </Html>
    </group>
  )
}

// ── Controller ────────────────────────────────────────────────────────────────

function OrbController({
  groupRef,
  reducedMotion,
}: {
  groupRef: React.RefObject<THREE.Group | null>
  reducedMotion: boolean
}) {
  useOrbit(groupRef, reducedMotion)
  return null
}

function EdgePulse({
  bundle,
  reducedMotion,
}: {
  bundle: EdgeBundle
  reducedMotion: boolean
}) {
  useEdgePulse(bundle, reducedMotion)
  return null
}

function Drift({
  bundle,
  reducedMotion,
}: {
  bundle: DriftBundle
  reducedMotion: boolean
}) {
  useDrift(bundle, reducedMotion)
  return <primitive object={bundle.points} />
}

// ── Main scene ────────────────────────────────────────────────────────────────

export function OrbScene() {
  useKeyframes()

  const groupRef = useRef<THREE.Group>(null)

  // Time + hardware accents. Both hooks use lazy state initializers so the
  // values are real on the first client render — orb mounts client-only
  // (ssr:false in hero.tsx), so there's no hydration boundary to coordinate.
  const tod  = useTimeOfDay()
  const tier = useDeviceTier()
  const driftCount = DRIFT_COUNT_BY_TIER[tier]

  // Geo from the consent-gated cookie. Null until the visitor accepts. Drives:
  //  1) the auto-cycle's regional service bias (FEATURED_BY_REGION)
  //  2) per-node pulse amplitude (featured nodes throb harder)
  //  3) orb oblateness (high-latitude visitors see a squashed sphere)
  const geo = useGeo()
  const region = regionFor(geo?.country)
  const featuredSet = useMemo(() => new Set(FEATURED_BY_REGION[region]), [region])

  // Hour-of-day breath: orb scales smoothly from 0.97× at midnight to 1.03×
  // at solar noon. Captured at mount; visitors who linger across an hour
  // boundary won't see the orb resize mid-session (intentional — see plan).
  const breath  = 1 + 0.03 * Math.sin(((tod.hour - 6) / 24) * 2 * Math.PI)
  // Latitude oblateness: equatorial visitors see a perfect sphere; the y-axis
  // squashes up to 3% as |lat| approaches 60°+. Subtle, geographically coherent.
  const oblate  = 1 - Math.min(Math.abs(geo?.latitude ?? 0) / 60, 1) * 0.03
  const groupScale: [number, number, number] = [breath, breath * oblate, breath]

  // Captured ONCE on mount. The hue and drift count picked at first render
  // are fixed for the session — rebuilding the geometry mid-session (e.g. on
  // a partOfDay change every 4-8 hours) would require re-disposing all GPU
  // resources and would visibly flash the orb. Acceptable tradeoff.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { glyphSprites, edgeBundle, drift } = useMemo(() => ({
    glyphSprites: buildGlyphSprites(),
    edgeBundle: buildEdgeLines(),
    drift: buildDrift(),
  }), [])

  useEffect(() => () => {
    glyphSprites.traverse(obj => {
      if (obj instanceof THREE.Sprite) {
        ; (obj.material as THREE.SpriteMaterial).dispose()
      }
    })
    edgeBundle.lines.geometry.dispose()
      ; (edgeBundle.lines.material as THREE.Material).dispose()
    edgeBundle.pulseLines.geometry.dispose()
      ; (edgeBundle.pulseLines.material as THREE.Material).dispose()
    drift.points.geometry.dispose()
      ; (drift.points.material as THREE.Material).dispose()
    _glyphTextureCache.forEach(tex => tex.dispose())
    _glyphTextureCache.clear()
  }, [glyphSprites, edgeBundle, drift])

  const [label, setLabel] = useState<LabelState | null>(null)
  const lastUserInteractionRef = useRef(0)

  const handleHover = useCallback((localPos: THREE.Vector3, idx: number) => {
    const worldX = groupRef.current
      ? localPos.clone().applyMatrix4(groupRef.current.matrixWorld).x
      : localPos.x
    lastUserInteractionRef.current = Date.now()
    setLabel({ id: Date.now(), localPos, svc: SERVICES[idx], openLeft: worldX > 0 })
  }, [])

  const clearLabel = useCallback(() => setLabel(null), [])

  const reducedMotion = useReducedMotion()

  // ── Layer 4 — random label cycle ───────────────────────────────────────────
  // Every ~6s (5-7s jitter), pick a random service node and surface its label,
  // making the orb feel alive when no one's interacting. Suppressed if the
  // user just interacted (within 4s) or under prefers-reduced-motion.
  useEffect(() => {
    if (reducedMotion) return
    let timeoutId: ReturnType<typeof setTimeout>

    const featured = FEATURED_BY_REGION[region]

    const fire = () => {
      const sinceUser = Date.now() - lastUserInteractionRef.current
      if (sinceUser > 4000) {
        // Region-aware pick: when there are featured indices, draw from them
        // FEATURED_PICK_RATE of the time; otherwise fall through to uniform.
        const useFeatured = featured.length > 0 && Math.random() < FEATURED_PICK_RATE
        const idx = useFeatured
          ? featured[Math.floor(Math.random() * featured.length)]
          : Math.floor(Math.random() * N_ORANGE)
        const localPos = _orangePts[idx]
        const worldX = groupRef.current
          ? localPos.clone().applyMatrix4(groupRef.current.matrixWorld).x
          : localPos.x
        setLabel({
          id: Date.now(),
          localPos,
          svc: SERVICES[idx],
          openLeft: worldX > 0,
        })
      }
      timeoutId = setTimeout(fire, 5000 + Math.random() * 2000)
    }

    timeoutId = setTimeout(fire, 3000) // wait 3s after mount before first auto-trigger
    return () => clearTimeout(timeoutId)
  }, [reducedMotion, region])

  return (
    <>
      <OrbController groupRef={groupRef} reducedMotion={reducedMotion} />
      <EdgePulse bundle={edgeBundle} reducedMotion={reducedMotion} />
      <Drift bundle={drift} reducedMotion={reducedMotion} />

      {/* Lights live in world-space so they DON'T rotate with the group.
          This means service nodes get a shifting highlight as they rotate —
          each node looks 3D and alive. ambientLight provides a minimum floor. */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 3]} intensity={1.0} />

      <group ref={groupRef} scale={groupScale}>
        <primitive object={edgeBundle.lines} />
        <primitive object={edgeBundle.pulseLines} />
        <primitive object={glyphSprites} />

        {_orangeIdxs.map((_, si) => (
          <ServiceNode
            key={si}
            pos={_orangePts[si]}
            color={CAT_COLOR[SERVICES[si].cat]}
            serviceIdx={si}
            isFeatured={featuredSet.has(si)}
            onHover={handleHover}
          />
        ))}


        <Html center zIndexRange={[10, 10]}>
          <div style={{ pointerEvents: 'none', userSelect: 'none' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="78" height="45"
              viewBox="0 0 52.082 30.457" fill="none" aria-hidden="true">
              <path
                d="M 10.421 5.234 C 10.421 2.343 12.754 0 15.631 0 C 18.509 0 20.842 2.343 20.842 5.234 L 20.842 10.326 C 20.842 10.326 21.153 12.766 22.164 13.809 C 23.206 14.886 25.723 15.229 25.723 15.229 L 26.382 15.229 C 26.382 15.229 28.898 14.886 29.941 13.809 C 30.799 12.924 31.153 11.031 31.24 10.48 L 31.24 5.234 C 31.24 2.343 33.573 0 36.451 0 C 39.328 0 41.661 2.343 41.661 5.234 L 41.661 10.326 C 41.661 10.326 41.972 12.766 42.983 13.809 C 44.026 14.886 46.542 15.229 46.542 15.229 L 47.852 15.229 C 50.188 15.229 52.082 17.131 52.082 19.477 L 52.082 30.457 L 41.661 30.457 L 41.661 15.229 L 36.121 15.229 C 36.121 15.229 33.605 15.571 32.562 16.648 C 31.704 17.534 31.35 19.426 31.263 19.977 L 31.263 25.224 C 31.263 28.114 28.93 30.457 26.052 30.457 C 23.175 30.457 20.842 28.114 20.842 25.224 L 20.842 20.131 C 20.842 20.131 20.501 17.604 19.429 16.556 C 18.39 15.541 15.961 15.229 15.961 15.229 L 10.421 15.229 L 10.421 30.457 L 0 30.457 L 0 19.477 C 0 17.131 1.894 15.229 4.23 15.229 L 5.54 15.229 C 5.54 15.229 8.056 14.886 9.099 13.809 C 10.11 12.766 10.421 10.326 10.421 10.326 L 10.421 5.234 Z"
                fill="#204AF8" fillRule="evenodd"
              />
            </svg>
          </div>
        </Html>

        {label && <FloatingLabel key={label.id} state={label} onExpire={clearLabel} />}
      </group>
    </>
  )
}
