'use client'

import { type PillarId } from '@/components/sections/services-data'

// Per the Figma (Frame 1707481128), the active cube uses #296ff0 not the brand
// #296ff0 — the design lightens the blue slightly for the iso surface so the
// inset white shine reads correctly.
const PILLAR_COLOR: Record<PillarId, string> = {
  'web3': '#296ff0',
  'ai-agents': '#10b981',
  'product-studio': '#F6851B',
}

const PILLAR_LABEL: Record<PillarId, string> = {
  'web3': 'WEB3',
  'ai-agents': 'AI',
  'product-studio': 'PRODUCT',
}

// Pillars sit on integer grid intersections. With the grid using the cube's
// iso transform (rotate(-30) skewX(30) scaleY(0.866)), moving (+1, +1) in grid
// cells maps to (+173.2, 0) on screen — exactly horizontal. So three pillars
// at grid (-1,-1), (0,0), (+1,+1) sit on the same iso-horizontal line, each
// one cube-edge apart so plates and the active cube nearly touch — matching
// the tight spacing in Figma Frame 1707481128.
const PILLAR_OFFSET_X: Record<PillarId, number> = {
  'ai-agents': -173.2,
  'web3': 0,
  'product-studio': 173.2,
}

const PILLAR_ORDER: PillarId[] = ['ai-agents', 'web3', 'product-studio']

export function ServicesIsoCanvas({ activeId }: { activeId: PillarId }) {
  return (
    <div className="iso-canvas">
      <ScopedStyle />
      <IsoGrid />
      <div className="iso-stage">
        {PILLAR_ORDER.map((id) => (
          <Pillar
            key={id}
            id={id}
            isActive={id === activeId}
            offsetX={PILLAR_OFFSET_X[id]}
          />
        ))}
      </div>
    </div>
  )
}

function IsoGrid() {
  return (
    <div aria-hidden className="iso-grid-stage">
      <div className="iso-grid">
        {Array.from({ length: 144 }).map((_, i) => (
          <div key={i} className="iso-grid-cell" />
        ))}
      </div>
    </div>
  )
}

function Pillar({
  id,
  isActive,
  offsetX,
}: {
  id: PillarId
  isActive: boolean
  offsetX: number
}) {
  // Labels for AI & WEB3 mount to the iso left-facing plane; PRODUCT mounts
  // to the right-facing plane so the text reads outward from the scene.
  const labelOrientation = id === 'product-studio' ? 'right' : 'left'

  return (
    <div
      className="iso-pillar"
      data-active={isActive}
      data-label-orientation={labelOrientation}
      data-pillar-id={id}
      style={
        {
          '--pillar-color': PILLAR_COLOR[id],
          '--offset-x': `${offsetX}px`,
        } as React.CSSProperties
      }
    >
      <div className="iso-cube">
        <div className="iso-face iso-face--left" />
        <div className="iso-face iso-face--right" />
        <div className="iso-face iso-face--top" />
        <div className="iso-label">{PILLAR_LABEL[id]}</div>
      </div>
    </div>
  )
}

function ScopedStyle() {
  return (
    <style precedence="default">{`
      .iso-canvas {
        position: absolute;
        inset: 0;
        overflow: hidden;
        background: #fffffc;
      }

      /* ---------------- ISO GRID ---------------- */
      .iso-grid-stage {
        position: absolute;
        inset: 0;
        pointer-events: none;
        overflow: hidden;
      }
      /* Grid uses the SAME iso transform as the cube top face so grid lines
         run parallel to cube edges, and cube floor corners land on grid
         intersections. Centered such that the canvas center is at grid (0,0). */
      .iso-grid {
        position: absolute;
        top: 50%;
        left: 50%;
        display: grid;
        grid-template-columns: repeat(14, 100px);
        grid-template-rows: repeat(14, 100px);
        width: 1400px;
        height: 1400px;
        transform: translate(-50%, -50%) rotate(-30deg) skewX(30deg) scaleY(0.866);
      }
      .iso-grid-cell {
        width: 100px;
        height: 100px;
        background: transparent;
        border-right: 1px solid #e8e8e8;
        border-bottom: 1px solid #e8e8e8;
      }

      /* ---------------- STAGE & PILLAR POSITIONING ---------------- */
      .iso-stage {
        position: absolute;
        inset: 0;
        transform: translateY(14px);
      }
      .iso-pillar {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 173.2px;
        height: 200px;
        /* translateY(-100%) lifts the floor to canvas vertical center — the
           grid origin. With offsets at ±173.2 (one grid diagonal), each cube's
           front-bottom corner lands exactly on grid intersections (-1,-1),
           (0,0), (+1,+1). */
        transform: translate(calc(-50% + var(--offset-x)), -100%);
      }

      /* ---------------- CUBE ---------------- */
      .iso-cube {
        position: relative;
        width: 100%;
        height: 100%;
      }

      /* Shared face properties — all three faces transition the same way. */
      .iso-face {
        position: absolute;
        transform-origin: 0 0;
        backface-visibility: hidden;
        will-change: transform, height, background;
        transition:
          height 520ms cubic-bezier(0.16, 1, 0.3, 1),
          transform 520ms cubic-bezier(0.16, 1, 0.3, 1),
          background 520ms cubic-bezier(0.16, 1, 0.3, 1),
          box-shadow 520ms cubic-bezier(0.16, 1, 0.3, 1),
          border-color 520ms cubic-bezier(0.16, 1, 0.3, 1);
      }

      /* TOP face: 100x100 div, iso-projected to a diamond.
         translateY(-H) lifts it as the cube extrudes. */
      .iso-face--top {
        top: 150px;
        left: 0;
        width: 100px;
        height: 100px;
        transform: translateY(0) rotate(-30deg) skewX(30deg) scaleY(0.866);
        background: #d8d2c8;
        box-shadow:
          inset 0 0 0 0.667px rgba(255, 255, 255, 0.5),
          inset 0 -12px 20px rgba(0, 0, 0, 0.10);
        border: 0.667px solid #cec7bc;
      }

      /* LEFT side: parallelogram, top edge anchored at diamond's LEFT vertex.
         Height grows 0 -> 100 as cube extrudes. */
      .iso-face--left {
        top: 150px;
        left: 0;
        width: 100px;
        height: 0;
        transform: translateY(0) skewY(30deg) scaleX(0.866);
        background: color-mix(in srgb, var(--pillar-color, #94a3b8) 85%, black);
      }

      /* RIGHT side: anchored at diamond's FRONT vertex (86.6, 50) below origin
         in floor coords, i.e. (86.6, 200) in pillar coords. */
      .iso-face--right {
        top: 200px;
        left: 86.6px;
        width: 100px;
        height: 0;
        transform: translateY(0) skewY(-30deg) scaleX(0.866);
        background: color-mix(in srgb, var(--pillar-color, #94a3b8) 72%, black);
      }

      /* ---------------- ACTIVE STATE ---------------- */
      /* Top face lifts to translateY(-100), colour fills with pillar hue,
         and the Figma "inset 0 50px 80px white-24%" inner shine kicks in. */
      .iso-pillar[data-active="true"] .iso-face--top {
        background: var(--pillar-color);
        box-shadow: inset 0 50px 80px 0 rgba(255, 255, 255, 0.32);
        border: 0.667px solid rgba(255, 255, 255, 0.9);
        transform: translateY(-100px) rotate(-30deg) skewX(30deg) scaleY(0.866);
      }

      .iso-pillar[data-active="true"] .iso-face--left {
        height: 100px;
        transform: translateY(-100px) skewY(30deg) scaleX(0.866);
      }

      .iso-pillar[data-active="true"] .iso-face--right {
        height: 100px;
        transform: translateY(-100px) skewY(-30deg) scaleX(0.866);
      }

      /* ---------------- LABEL ---------------- */
      .iso-label {
        position: absolute;
        font-family: var(--font-grotesk, 'Space Grotesk', system-ui, sans-serif);
        font-weight: 700;
        font-size: 22px;
        line-height: 1;
        color: #040404;
        text-transform: uppercase;
        letter-spacing: 0.02em;
        white-space: nowrap;
        pointer-events: none;
        transform-origin: 0 0;
        transition: transform 520ms cubic-bezier(0.16, 1, 0.3, 1);
      }

      /* Labels float OUTSIDE the diamond, running parallel to the back edges.
         Asymmetric top values are intentional: left-orientation bbox extends
         UP from origin (rotate(-30) lifts top-right corner), right-orientation
         bbox extends DOWN. So matching visual "above the diamond" requires a
         smaller top value for the right-orientation label.
         - Left (AI, WEB3): sits above-left, parallel to the back-LEFT edge
           (L vertex up to B). WEB3 has an extra shift toward B (see below)
           to clear the AI cube when AI rises.
         - Right (PRODUCT): sits above-right, parallel to the back-RIGHT edge
           (B to R), origin pushed past the R vertex so the text overhang
           sits in empty space.
         When active, label rides up with the cube via translateY(-100px),
         preserving its outside-the-block stance. */
      .iso-pillar[data-label-orientation="left"] .iso-label {
        top: 108px;
        left: -10px;
        transform: translateY(0) rotate(-30deg) skewX(-30deg) scaleY(0.866);
      }
      /* WEB3 is the centre pillar — when AI rises on its left, the AI cube's
         right edge sits at the same X as WEB3's left vertex, which clips the
         WEB3 label. Shift WEB3 ~30px along the back-left edge direction
         (toward vertex B) so the label clears the AI cube. AI keeps the
         outside-left origin since nothing rises on its left. */
      .iso-pillar[data-pillar-id="web3"][data-label-orientation="left"] .iso-label {
        top: 93px;
        left: 16px;
      }
      .iso-pillar[data-label-orientation="right"] .iso-label {
        top: 70px;
        left: 110px;
        transform: translateY(0) rotate(30deg) skewX(30deg) scaleY(0.866);
      }

      /* Active state — label rises with the cube. */
      .iso-pillar[data-active="true"][data-label-orientation="left"] .iso-label {
        transform: translateY(-100px) rotate(-30deg) skewX(-30deg) scaleY(0.866);
      }
      .iso-pillar[data-active="true"][data-label-orientation="right"] .iso-label {
        transform: translateY(-100px) rotate(30deg) skewX(30deg) scaleY(0.866);
      }

      /* ---------------- REDUCED MOTION ---------------- */
      @media (prefers-reduced-motion: reduce) {
        .iso-face, .iso-label {
          transition: none !important;
        }
      }
    `}</style>
  )
}
