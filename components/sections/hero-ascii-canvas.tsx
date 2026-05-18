'use client'

import { useEffect, useRef } from 'react'

// Ported from the approved static POC. Color-tinted ASCII of /hero-bg.jpg on
// #0a0e1a. Static base drawn once to an offscreen canvas; the rAF loop only
// composites a cheap moving scanline (no per-frame glyph recompute).
const RAMP = ' .:-=+*#%@'
const BG = '#0a0e1a'
const SRC = '/hero-bg.jpg'
const FONT_PX = 8

const clamp = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v)

export function HeroAsciiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const cx = canvas.getContext('2d')
    if (!cx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let running = false
    let base: HTMLCanvasElement | null = null
    let phase = 0
    let resizeTimer: number | undefined

    const img = new Image()
    img.decoding = 'async'

    const sample = document.createElement('canvas')
    const sctx = sample.getContext('2d', { willReadFrequently: true })

    function buildBase() {
      if (!sctx || !img.complete || img.naturalWidth === 0) return
      const rect = wrap!.getBoundingClientRect()
      const W = Math.max(1, Math.round(rect.width))
      const H = Math.max(1, Math.round(rect.height))
      const dpr = Math.min(1.75, window.devicePixelRatio || 1)

      const probe = sctx
      probe.font = FONT_PX + 'px Menlo, ui-monospace, monospace'
      const cw = Math.max(3, Math.round(probe.measureText('M').width))
      const chh = FONT_PX + 1
      const cols = Math.ceil(W / cw)
      const rows = Math.ceil(H / chh)

      sample.width = cols
      sample.height = rows
      sctx.drawImage(img, 0, 0, cols, rows)
      const d = sctx.getImageData(0, 0, cols, rows).data

      const n = cols * rows
      const rr = new Float32Array(n)
      const gg = new Float32Array(n)
      const bb = new Float32Array(n)
      const lum = new Float32Array(n)
      let lo = 255
      let hi = 0
      for (let p = 0; p < n; p++) {
        let r = d[p * 4] * 1.28
        let g = d[p * 4 + 1] * 1.28
        let b = d[p * 4 + 2] * 1.28
        const m = (r + g + b) / 3
        r = m + (r - m) * 1.42
        g = m + (g - m) * 1.42
        b = m + (b - m) * 1.42
        r = clamp((r - 128) * 1.06 + 128)
        g = clamp((g - 128) * 1.06 + 128)
        b = clamp((b - 128) * 1.06 + 128)
        rr[p] = r
        gg[p] = g
        bb[p] = b
        const L = 0.299 * r + 0.587 * g + 0.114 * b
        lum[p] = L
        if (L < lo) lo = L
        if (L > hi) hi = L
      }
      const span = Math.max(1, hi - lo)

      const b2 = document.createElement('canvas')
      b2.width = W * dpr
      b2.height = H * dpr
      const bctx = b2.getContext('2d')
      if (!bctx) return
      bctx.scale(dpr, dpr)
      bctx.fillStyle = BG
      bctx.fillRect(0, 0, W, H)
      bctx.font = FONT_PX + 'px Menlo, ui-monospace, monospace'
      bctx.textBaseline = 'top'
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const p = j * cols + i
          const t = Math.pow((lum[p] - lo) / span, 0.72)
          let idx = Math.round(t * (RAMP.length - 1))
          let ch = RAMP[idx]
          if (ch === ' ') {
            if (lum[p] < 14) continue
            ch = '.'
          }
          const cl = Math.max(1, 0.299 * rr[p] + 0.587 * gg[p] + 0.114 * bb[p])
          const k = (86 + 150 * t) / cl
          const R = clamp(rr[p] * k + 10) | 0
          const G = clamp(gg[p] * k + 12) | 0
          const B = clamp(bb[p] * k + 16) | 0
          bctx.fillStyle = 'rgb(' + R + ',' + G + ',' + B + ')'
          bctx.fillText(ch, i * cw, j * chh)
        }
      }
      base = b2
      canvas!.width = W * dpr
      canvas!.height = H * dpr
      canvas!.style.width = W + 'px'
      canvas!.style.height = H + 'px'
    }

    function paintStatic() {
      if (!base || !cx) return
      cx.setTransform(1, 0, 0, 1, 0, 0)
      cx.drawImage(base, 0, 0)
    }

    function frame() {
      if (!running) return
      if (base && cx) {
        cx.setTransform(1, 0, 0, 1, 0, 0)
        cx.drawImage(base, 0, 0)
        const h = canvas!.height
        const band = (Math.sin(phase) * 0.5 + 0.5) * h
        const g = cx.createLinearGradient(0, band - h * 0.16, 0, band + h * 0.16)
        g.addColorStop(0, 'rgba(150,190,255,0)')
        g.addColorStop(0.5, 'rgba(150,190,255,0.05)')
        g.addColorStop(1, 'rgba(150,190,255,0)')
        cx.fillStyle = g
        cx.fillRect(0, 0, canvas!.width, canvas!.height)
        phase += 0.012
      }
      raf = requestAnimationFrame(frame)
    }

    function start() {
      if (reduce || running) return
      running = true
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(frame)
    }
    function stop() {
      running = false
      cancelAnimationFrame(raf)
    }

    function init() {
      buildBase()
      paintStatic()
      if (!reduce) start()
    }

    img.src = SRC
    if (img.complete && img.naturalWidth) init()
    else img.onload = init

    const io = new IntersectionObserver(
      ([e]) => {
        if (reduce) return
        if (e.isIntersecting) start()
        else stop()
      },
      { threshold: 0 },
    )
    io.observe(wrap)

    const onResize = () => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        buildBase()
        paintStatic()
      }, 200)
    }
    window.addEventListener('resize', onResize)

    return () => {
      stop()
      io.disconnect()
      window.removeEventListener('resize', onResize)
      window.clearTimeout(resizeTimer)
    }
  }, [])

  return (
    <div ref={wrapRef} aria-hidden="true" className="absolute inset-0">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  )
}
