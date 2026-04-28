'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { sampleCube, sampleTorus, sampleDodecahedron, buildEdges, lerpShapes, renderFrame, DEFAULT_CONFIG, type Vec3 } from './renderer'

const SEQUENCE = [
  { from: 'cube',         to: 'torus',         hold: 3.0, morph: 2.0 },
  { from: 'torus',        to: 'dodecahedron',  hold: 3.0, morph: 2.0 },
  { from: 'dodecahedron', to: 'cube',          hold: 3.0, morph: 2.0 },
]
const TOTAL = SEQUENCE.reduce((s, x) => s + x.hold + x.morph, 0)

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

const SHAPES: Record<string, Vec3[]> = {
  cube: sampleCube(),
  torus: sampleTorus(),
  dodecahedron: sampleDodecahedron(),
}
const EDGES = buildEdges()

export function useGenesisCube(): string {
  const [frame, setFrame] = useState('')
  const rxRef    = useRef(0.4)
  const ryRef    = useRef(0.2)
  const startRef = useRef<number | null>(null)
  const rafRef   = useRef<number | null>(null)

  const tick = useCallback((now: number) => {
    if (startRef.current === null) startRef.current = now
    const elapsed = ((now - startRef.current) / 1000) % TOTAL

    let t = elapsed
    let fromKey = 'cube', toKey = 'torus', morphT = 0

    for (const phase of SEQUENCE) {
      if (t < phase.hold) { fromKey = phase.from; toKey = phase.to; morphT = 0; break }
      t -= phase.hold
      if (t < phase.morph) { fromKey = phase.from; toKey = phase.to; morphT = easeInOut(t / phase.morph); break }
      t -= phase.morph
    }

    const pts = morphT === 0 ? SHAPES[fromKey] : lerpShapes(SHAPES[fromKey], SHAPES[toKey], morphT)
    rxRef.current += 0.003
    ryRef.current += 0.007
    setFrame(renderFrame(pts, EDGES, rxRef.current, ryRef.current, DEFAULT_CONFIG))
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current) }
  }, [tick])

  return frame
}
