'use client'

import { useRef, useMemo, useEffect, useState, useCallback, type KeyboardEvent } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

// ── Constants ─────────────────────────────────────────────────────────────────

const N_TOTAL    = 294   // 280 filler glyphs + 14 service nodes
const N_ORANGE   = 14
const SPHERE_R   = 1.25
const NODE_R     = 0.030
const AUTO_SPEED = 0.058  // rad/s ≈ OrbitControls 0.55

// Glyph alphabet for filler nodes — weighted toward soft characters,
// denser ones used as accents.
const GLYPHS = ['·', '·', '·', '·', '+', '+', '*', '◦', '╳', '█'] as const

const CAT_COLOR = {
  WEB3:    '#F6851B',
  AI:      '#4dff9a',
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
  { name: 'DeFi Protocol Development',  cat: 'WEB3'    },
  { name: 'Smart Contract Security',    cat: 'WEB3'    },
  { name: 'NFT Marketplace Dev',        cat: 'WEB3'    },
  { name: 'Crypto Wallet Development',  cat: 'WEB3'    },
  { name: 'Token Launchpad',            cat: 'WEB3'    },
  { name: 'Liquid Staking Vaults',      cat: 'WEB3'    },
  { name: 'DAO & Governance Systems',   cat: 'WEB3'    },
  { name: 'Agentic AI Systems',         cat: 'AI'      },
  { name: 'Generative AI Development',  cat: 'AI'      },
  { name: 'AI Workflow Automation',     cat: 'AI'      },
  { name: 'Voice Agent Integration',    cat: 'AI'      },
  { name: 'RAG & Knowledge Systems',    cat: 'AI'      },
  { name: 'AI Systems Integration',     cat: 'AI'      },
  { name: 'SaaS Product Development',   cat: 'PRODUCT' },
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

// Cheap deterministic hash → 0..1 — gives consistent size variation
// without re-randomising on every module load.
function hashF(i: number): number {
  let x = ((i * 2654435761) >>> 0)
  x = ((x ^ (x >>> 16)) >>> 0)
  return x / 0xFFFFFFFF
}

// ── Module-level geometry (client-only, built once) ───────────────────────────

const _unitPts      = fibonacciSphere(N_TOTAL)
const _orangeIdxSet = pickOrangeIndices()
const _orangeIdxs   = [..._orangeIdxSet]
const _worldPts     = _unitPts.map(p => p.clone().multiplyScalar(SPHERE_R))
const _orangePts    = _orangeIdxs.map(i => _worldPts[i])

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

function buildEdgeLines(): THREE.LineSegments {
  const pairs  = buildEdges(_unitPts)
  const n      = pairs.length
  const pos    = new Float32Array(n * 3)
  const col    = new Float32Array(n * 3)  // per-vertex RGB

  const blue = new THREE.Color('#204AF8')
  const dim  = new THREE.Color('#99aeff')  // muted periwinkle for back vertices

  for (let i = 0; i < n; i++) {
    const wp = _worldPts[pairs[i]]
    wp.toArray(pos, i * 3)

    // z in [-SPHERE_R, SPHERE_R] → 0..1
    const t = (wp.z + SPHERE_R) / (2 * SPHERE_R)
    const c = blue.clone().lerp(dim, 1 - t)  // front = blue, back = dim
    c.toArray(col, i * 3)
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('color',    new THREE.BufferAttribute(col, 3))
  return new THREE.LineSegments(
    geo,
    new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.22 })
  )
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
  const velY   = useRef(0)
  const velX   = useRef(0)
  const d      = useRef({ active: false, moved: false, lx: 0, ly: 0 })

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
    document.addEventListener('pointerup',   onUp)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup',   onUp)
    }
  }, [gl])

  useFrame((_, delta) => {
    if (!groupRef.current) return
    if (!d.current.active) {
      const target = reducedMotion ? 0 : AUTO_SPEED * delta
      velY.current  = velY.current * 0.90 + target * 0.10
      velX.current *= 0.90
    }
    groupRef.current.rotation.y += velY.current
    groupRef.current.rotation.x  = Math.max(-0.28, Math.min(0.28,
      groupRef.current.rotation.x + velX.current
    ))
  })
}

// ── HUD floating label ────────────────────────────────────────────────────────

interface LabelState {
  id:       number
  localPos: THREE.Vector3
  svc:      { name: string; cat: keyof typeof CAT_COLOR }
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
        position:     'relative',
        background:   'rgba(2, 6, 26, 0.94)',
        border:       `1px solid ${color}88`,
        borderRadius: '2px',
        padding:      '10px 20px 10px 14px',
        boxShadow:    `0 0 28px ${color}38, 0 0 8px ${color}65, inset 0 0 20px ${color}06`,
        whiteSpace:   'nowrap',
        overflow:     'hidden',
        userSelect:   'none',
        minWidth:     '170px',
        animation:    '_orbIn 3.6s cubic-bezier(.16,1,.3,1) forwards',
      }}>
        {(['tl','tr','bl','br'] as const).map(c => (
          <span key={c} style={{
            position:     'absolute',
            width: 9, height: 9,
            top:    c[0] === 't' ? -1 : 'auto',
            bottom: c[0] === 'b' ? -1 : 'auto',
            left:   c[1] === 'l' ? -1 : 'auto',
            right:  c[1] === 'r' ? -1 : 'auto',
            borderTop:    c[0] === 't' ? `2px solid ${color}` : 'none',
            borderBottom: c[0] === 'b' ? `2px solid ${color}` : 'none',
            borderLeft:   c[1] === 'l' ? `2px solid ${color}` : 'none',
            borderRight:  c[1] === 'r' ? `2px solid ${color}` : 'none',
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
  pos, color, serviceIdx, onHover,
}: {
  pos: THREE.Vector3; color: string; serviceIdx: number
  onHover: (pos: THREE.Vector3, idx: number) => void
}) {
  const coreRef = useRef<THREE.Mesh>(null)
  // Spread nodes across the full phase circle so the wave propagates around the sphere
  const phase = (serviceIdx / N_ORANGE) * Math.PI * 2

  useFrame(({ clock }) => {
    if (!coreRef.current) return
    const s = 1 + Math.sin(clock.elapsedTime * 1.6 + phase) * 0.07
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
      {/* Keyboard accessibility — invisible button at the node's screen position.
          Tab into focus, Enter/Space (or focus alone) opens the same HUD label
          that pointer hover triggers. */}
      <Html center zIndexRange={[20, 20]}>
        <button
          type="button"
          aria-label={`View ${serviceName} service`}
          onKeyDown={onKey}
          onFocus={() => onHover(pos, serviceIdx)}
          className="w-5 h-5 rounded-full bg-transparent border-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2"
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

// ── Main scene ────────────────────────────────────────────────────────────────

export function OrbScene() {
  useKeyframes()

  const groupRef = useRef<THREE.Group>(null)

  const { glyphSprites, edgeLines } = useMemo(() => ({
    glyphSprites: buildGlyphSprites(),
    edgeLines:    buildEdgeLines(),
  }), [])

  useEffect(() => () => {
    glyphSprites.traverse(obj => {
      if (obj instanceof THREE.Sprite) {
        ;(obj.material as THREE.SpriteMaterial).dispose()
      }
    })
    edgeLines.geometry.dispose()
    ;(edgeLines.material as THREE.Material).dispose()
    _glyphTextureCache.forEach(tex => tex.dispose())
    _glyphTextureCache.clear()
  }, [glyphSprites, edgeLines])

  const [label, setLabel] = useState<LabelState | null>(null)

  const handleHover = useCallback((localPos: THREE.Vector3, idx: number) => {
    const worldX = groupRef.current
      ? localPos.clone().applyMatrix4(groupRef.current.matrixWorld).x
      : localPos.x
    setLabel({ id: Date.now(), localPos, svc: SERVICES[idx], openLeft: worldX > 0 })
  }, [])

  const clearLabel = useCallback(() => setLabel(null), [])

  const reducedMotion = useReducedMotion()

  return (
    <>
      <OrbController groupRef={groupRef} reducedMotion={reducedMotion} />

      {/* Lights live in world-space so they DON'T rotate with the group.
          This means service nodes get a shifting highlight as they rotate —
          each node looks 3D and alive. ambientLight provides a minimum floor. */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 3]} intensity={1.0} />

      <group ref={groupRef}>
        <primitive object={edgeLines} />
        <primitive object={glyphSprites} />

        {_orangeIdxs.map((_, si) => (
          <ServiceNode
            key={si}
            pos={_orangePts[si]}
            color={CAT_COLOR[SERVICES[si].cat]}
            serviceIdx={si}
            onHover={handleHover}
          />
        ))}

        <Html center zIndexRange={[10, 10]}>
          <div style={{ pointerEvents: 'none', userSelect: 'none' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="52" height="30"
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
