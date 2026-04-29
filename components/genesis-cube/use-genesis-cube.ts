'use client'

import { useEffect, useRef } from 'react'
import {
  sampleCube, sampleTorus, sampleDodecahedron,
  lerpInto, renderToCanvas,
  SAMPLE_COUNT,
  type SurfacePoint,
} from './renderer'

const SEQUENCE = [
  { from: 'cube',         to: 'torus',         hold: 2.0, morph: 4.0 },
  { from: 'torus',        to: 'dodecahedron',  hold: 2.0, morph: 4.0 },
  { from: 'dodecahedron', to: 'cube',          hold: 2.0, morph: 4.0 },
]
const TOTAL = SEQUENCE.reduce((s, x) => s + x.hold + x.morph, 0)  // 18s loop

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

// Pre-allocate morph buffer — avoids 10k object allocations per frame
const morphBuf: SurfacePoint[] = Array.from({ length: SAMPLE_COUNT }, () => ({
  pos:    [0, 0, 0] as [number, number, number],
  normal: [0, 0, 0] as [number, number, number],
}))

const SHAPES: Record<string, SurfacePoint[]> = {
  cube:         sampleCube(),
  torus:        sampleTorus(),
  dodecahedron: sampleDodecahedron(),
}

export function useGenesisCube(): React.RefObject<HTMLCanvasElement | null> {
  const canvasRef    = useRef<HTMLCanvasElement | null>(null)
  const rxRef        = useRef(0.35)
  const ryRef        = useRef(0.0)
  const lastTimeRef  = useRef<number | null>(null)
  const startRef     = useRef<number | null>(null)
  const rafRef       = useRef<number | null>(null)

  useEffect(() => {
    function tick(now: number) {
      const canvas = canvasRef.current
      if (!canvas) { rafRef.current = requestAnimationFrame(tick); return }

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      if (startRef.current === null) startRef.current = now
      if (lastTimeRef.current === null) lastTimeRef.current = now
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05)  // cap at 50ms
      lastTimeRef.current = now

      // Slow, meditative rotation — Y primary, X secondary
      ryRef.current += 0.22 * dt
      rxRef.current += 0.09 * dt

      // Resolve morph phase
      const elapsed = ((now - startRef.current) / 1000) % TOTAL
      let t = elapsed
      let fromKey = 'cube', toKey = 'torus', morphT = 0

      for (const phase of SEQUENCE) {
        if (t < phase.hold) { fromKey = phase.from; toKey = phase.to; morphT = 0; break }
        t -= phase.hold
        if (t < phase.morph) {
          fromKey = phase.from
          toKey   = phase.to
          morphT  = easeInOut(t / phase.morph)
          break
        }
        t -= phase.morph
      }

      let pts: SurfacePoint[]
      if (morphT === 0) {
        pts = SHAPES[fromKey]
      } else {
        lerpInto(SHAPES[fromKey], SHAPES[toKey], morphT, morphBuf)
        pts = morphBuf
      }

      renderToCanvas(ctx, pts, rxRef.current, ryRef.current)
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current) }
  }, [])

  return canvasRef
}
