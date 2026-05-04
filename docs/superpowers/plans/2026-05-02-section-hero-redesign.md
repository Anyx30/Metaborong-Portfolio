# Hero Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor `components/sections/hero.tsx` and `components/hero-orb/orb-scene.tsx` to land the hero redesign locked in `docs/superpowers/specs/2026-05-02-section-hero-redesign.md` — Phase 1 (typography/copy/a11y/mobile stop-gap) and Phase 2 (ASCII glyph filler + edge pulse + drift particles).

**Architecture:** Two files only. `hero.tsx` keeps its current structure; tasks 1–4 add a scroll chevron component, swap the blockquote scale, add `prefers-reduced-motion` honoring on the chevron, and collapse the grid to single-column below `lg`. `orb-scene.tsx` gains a reduced-motion hook (Task 5), keyboard access on service nodes (Task 6), then three additive Three.js layers (Tasks 7–9). Each Phase 2 layer is independent — gated on a top-level constant so any one can be disabled without affecting the others.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind v4, TypeScript, `three`, `@react-three/fiber`, `@react-three/drei`, `lucide-react`. No new dependencies.

**Verification model:** No unit tests for this codebase. Each task ends with a screenshot/visual gate via `agent-browser` (CLI: `npx agent-browser ...`) at specific viewports, plus `pnpm build` clean. Frequent commits — one per task.

---

## Files

| Path | Change | Responsibility |
|---|---|---|
| `components/sections/hero.tsx` | Modify | Layout, copy, scroll chevron, mobile collapse, blockquote scale + cite |
| `components/hero-orb/orb-scene.tsx` | Modify | Reduced-motion hook, keyboard access, ASCII filler, edge pulse, drift particles |

No new files. No new dependencies.

---

## Phase 1 — Hero typography + a11y + mobile

### Task 1: Align AEO blockquote to locked type scale

Spec requires 16px text-dark font-medium with `cite="/about"`. Current code uses 17px without `cite`.

**Files:**
- Modify: `components/sections/hero.tsx:35-41`

- [ ] **Step 1: Update blockquote markup**

Replace lines 35–41 with:

```tsx
{/* AEO extraction blockquote — promoted */}
<blockquote cite="/about" className="border-l-[3px] border-brand pl-5 py-1 mb-6">
  <p className="text-base font-medium text-dark leading-[1.6] tracking-[-0.015em] max-w-[560px]">
    Metaborong is a Web3 and AI agent development studio that ships DeFi protocols,
    autonomous AI systems, and custom SaaS products for founders and crypto-native teams
    across the US and Europe.
  </p>
</blockquote>
```

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: clean build, no type errors.

- [ ] **Step 3: Visual verify at 1440**

Run:
```bash
npx agent-browser set viewport 1440 900 && \
npx agent-browser open http://localhost:3000 && \
npx agent-browser wait --load networkidle && \
npx agent-browser wait 1500 && \
npx agent-browser screenshot ./screenshots/task1-blockquote.png
```
Expected: blockquote text noticeably bolder (medium-weight) than body lead, 16px size matches body lead size but darker color + bold weight outweighs it. 3px brand-blue rail on the left.

- [ ] **Step 4: Commit**

```bash
git add components/sections/hero.tsx
git commit -m "feat(hero): align AEO blockquote to 16px text-dark medium + cite=/about"
```

---

### Task 2: Add scroll-down affordance

Spec requires a chevron + "Scroll" label at the bottom of the left column, fading after 100px scroll.

**Files:**
- Modify: `components/sections/hero.tsx`

- [ ] **Step 1: Convert section to track scroll position**

`hero.tsx` is already `'use client'`. Add a scroll listener via `useEffect` + `useState`. Replace the entire file with:

```tsx
'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'

// Three.js: client-only, lazy-loaded after paint — no LCP impact
const HeroOrb = dynamic(
  () => import('@/components/hero-orb/hero-orb').then(m => ({ default: m.HeroOrb })),
  { ssr: false, loading: () => null }
)

export function HeroSection() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section className="min-h-screen bg-bg-subtle">
      <div className="max-w-[1600px] mx-auto min-h-screen grid grid-cols-[60fr_40fr]">
        {/* Left: copy */}
        <div className="relative flex flex-col justify-center py-[96px] px-[24px] md:px-[48px] lg:px-[96px] xl:px-[128px]">
          {/* Eyebrow chip */}
          <div className="inline-flex items-center gap-2 mb-7 bg-bg border border-border rounded-sm px-3 py-[5px] w-fit">
            <span className="w-2 h-2 bg-brand rounded-sm shrink-0 inline-block" />
            <Eyebrow>Web3 Development · AI Agents · Product Studio</Eyebrow>
          </div>

          {/* H1 */}
          <h1 className="text-[clamp(40px,5vw,72px)] font-bold tracking-[-0.04em] leading-[1.02] text-dark mb-6">
            Web3 protocols.
            <br />
            AI agents.
            <br />
            <span className="text-brand">Shipped.</span>
          </h1>

          {/* AEO extraction blockquote — promoted */}
          <blockquote cite="/about" className="border-l-[3px] border-brand pl-5 py-1 mb-6">
            <p className="text-base font-medium text-dark leading-[1.6] tracking-[-0.015em] max-w-[560px]">
              Metaborong is a Web3 and AI agent development studio that ships DeFi protocols,
              autonomous AI systems, and custom SaaS products for founders and crypto-native teams
              across the US and Europe.
            </p>
          </blockquote>

          {/* Body lead — demoted */}
          <p className="text-sm text-gray leading-[1.6] tracking-[-0.005em] max-w-[480px] mb-8">
            For founders who need a technical partner that ships — not an agency that pitches.
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-3 mb-5">
            <Button href="/contact/" size="lg">Start a Project &rarr;</Button>
            <Button href="/work/" variant="ghost" size="lg">See Our Work</Button>
          </div>

          {/* Micro-copy */}
          <p className="text-xs text-gray-light tracking-[-0.01em]">
            No pitch decks. No retainers. Direct from founders.
          </p>

          {/* Scroll-down affordance */}
          <div
            aria-hidden="true"
            className={`absolute bottom-[40px] left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-light transition-opacity duration-300 ${
              scrolled ? 'opacity-0' : 'opacity-100'
            } motion-safe:animate-[heroScrollBounce_1.6s_cubic-bezier(0.45,0,0.55,1)_infinite]`}
          >
            <ChevronDown size={16} strokeWidth={2} />
            <span className="text-[10px] tracking-[0.15em] uppercase">Scroll</span>
          </div>
        </div>

        {/* Right: Three.js orb */}
        <div className="relative overflow-hidden flex items-center justify-center min-h-screen">
          <HeroOrb />
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Add the bounce keyframe to globals.css**

`hero.tsx` references `heroScrollBounce`. Add it to `app/globals.css`. Open the file and append after the `_orbScn` keyframes (around line 162, before the `.orb-label` block):

```css
/* ── Hero scroll affordance ──────────────────────────────────────────── */
@keyframes heroScrollBounce {
  0%, 100% { transform: translate(-50%, 0); }
  50%      { transform: translate(-50%, 8px); }
}
```

- [ ] **Step 3: Verify build**

Run: `pnpm build`
Expected: clean build.

- [ ] **Step 4: Visual verify chevron present + bounces**

Run:
```bash
npx agent-browser set viewport 1440 900 && \
npx agent-browser reload && \
npx agent-browser wait --load networkidle && \
npx agent-browser wait 2000 && \
npx agent-browser screenshot ./screenshots/task2-chevron-visible.png
```
Expected: chevron + "Scroll" visible at the bottom-center of the left column.

- [ ] **Step 5: Verify chevron fades after scroll**

Run:
```bash
npx agent-browser scroll down 200 && \
npx agent-browser wait 500 && \
npx agent-browser screenshot ./screenshots/task2-chevron-faded.png
```
Expected: chevron faded (opacity 0).

- [ ] **Step 6: Commit**

```bash
git add components/sections/hero.tsx app/globals.css
git commit -m "feat(hero): add scroll-down affordance with motion-safe bounce"
```

---

### Task 3: Add mobile stop-gap collapse rule

Spec requires `< lg` to collapse the 60/40 grid into a single column with the orb stacked below copy at `60vh`.

**Files:**
- Modify: `components/sections/hero.tsx`

- [ ] **Step 1: Update grid + column min-heights for mobile**

In `hero.tsx`, change the grid wrapper line:

Find:
```tsx
<div className="max-w-[1600px] mx-auto min-h-screen grid grid-cols-[60fr_40fr]">
```

Replace with:
```tsx
<div className="max-w-[1600px] mx-auto min-h-screen grid grid-cols-1 lg:grid-cols-[60fr_40fr]">
```

Find the orb wrapper:
```tsx
<div className="relative overflow-hidden flex items-center justify-center min-h-screen">
  <HeroOrb />
</div>
```

Replace with:
```tsx
<div className="relative overflow-hidden flex items-center justify-center h-[60vh] lg:h-auto lg:min-h-screen">
  <HeroOrb />
</div>
```

Find the left column wrapper:
```tsx
<div className="relative flex flex-col justify-center py-[96px] px-[24px] md:px-[48px] lg:px-[96px] xl:px-[128px]">
```

Replace with:
```tsx
<div className="relative flex flex-col justify-center py-[64px] lg:py-[96px] px-[24px] md:px-[48px] lg:px-[96px] xl:px-[128px]">
```

(The `py-[64px]` mobile vertical padding gives breathing room without the section dwarfing on phones; reverts to the locked 96px at `lg`+.)

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: clean.

- [ ] **Step 3: Visual verify at mobile viewport**

Run:
```bash
npx agent-browser set viewport 375 812 && \
npx agent-browser reload && \
npx agent-browser wait --load networkidle && \
npx agent-browser wait 2500 && \
npx agent-browser screenshot --full ./screenshots/task3-mobile.png
```
Expected: copy stack on top, orb below at ~60vh, no horizontal scroll, scroll chevron still anchored to bottom of left (now top) column.

- [ ] **Step 4: Visual verify desktop unchanged at 1440**

Run:
```bash
npx agent-browser set viewport 1440 900 && \
npx agent-browser reload && \
npx agent-browser wait --load networkidle && \
npx agent-browser wait 1500 && \
npx agent-browser screenshot ./screenshots/task3-1440.png
```
Expected: identical to task2 screenshot (60/40 grid intact).

- [ ] **Step 5: Commit**

```bash
git add components/sections/hero.tsx
git commit -m "feat(hero): mobile stop-gap — single column below lg, orb at 60vh"
```

---

## Phase 2 — Orb polish stack

### Task 4: Add reduced-motion detection hook to orb-scene

The Phase 2 motion layers must be skippable under `prefers-reduced-motion: reduce`. Add a shared hook that the auto-rotate, edge pulse, and drift particle code will consume.

**Files:**
- Modify: `components/hero-orb/orb-scene.tsx`

- [ ] **Step 1: Add the hook**

In `orb-scene.tsx`, find the existing imports near the top:

```tsx
import { useRef, useMemo, useEffect, useState, useCallback } from 'react'
```

Already imports what we need. Add the hook function — drop it just below the `// ── Constants ─────` block (around line 17, before `const CAT_COLOR`):

```tsx
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
```

- [ ] **Step 2: Wire it to auto-rotate**

Find the `useOrbit` hook signature:

```tsx
function useOrbit(groupRef: React.RefObject<THREE.Group | null>) {
```

Change the signature to accept the flag, and gate the auto-rotate:

```tsx
function useOrbit(groupRef: React.RefObject<THREE.Group | null>, reducedMotion: boolean) {
```

Inside `useFrame`, find:

```tsx
useFrame((_, delta) => {
  if (!groupRef.current) return
  if (!d.current.active) {
    const target = AUTO_SPEED * delta
    velY.current  = velY.current * 0.90 + target * 0.10
    velX.current *= 0.90
  }
  groupRef.current.rotation.y += velY.current
  groupRef.current.rotation.x  = Math.max(-0.28, Math.min(0.28,
    groupRef.current.rotation.x + velX.current
  ))
})
```

Replace with:

```tsx
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
```

Then update `OrbController` to pass it through. Find:

```tsx
function OrbController({ groupRef }: { groupRef: React.RefObject<THREE.Group | null> }) {
  useOrbit(groupRef)
  return null
}
```

Replace with:

```tsx
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
```

In `OrbScene`, find:

```tsx
return (
  <>
    <OrbController groupRef={groupRef} />
```

Replace with:

```tsx
const reducedMotion = useReducedMotion()

return (
  <>
    <OrbController groupRef={groupRef} reducedMotion={reducedMotion} />
```

(Add the `const reducedMotion = useReducedMotion()` line just before the `return (` statement in `OrbScene`.)

- [ ] **Step 3: Verify build**

Run: `pnpm build`
Expected: clean.

- [ ] **Step 4: Visual verify auto-rotate stops with reduced motion**

Run:
```bash
npx agent-browser set viewport 1440 900 && \
npx agent-browser set media reduced-motion && \
npx agent-browser reload && \
npx agent-browser wait --load networkidle && \
npx agent-browser wait 4000 && \
npx agent-browser screenshot ./screenshots/task4-reduced-a.png && \
npx agent-browser wait 3000 && \
npx agent-browser screenshot ./screenshots/task4-reduced-b.png
```
Expected: both screenshots show the orb in the *same* rotational position (auto-rotate disabled). Compare visually — orb should be static.

- [ ] **Step 5: Restore default motion + verify rotation resumes**

Run:
```bash
npx agent-browser set media light && \
npx agent-browser reload && \
npx agent-browser wait --load networkidle && \
npx agent-browser wait 4000 && \
npx agent-browser screenshot ./screenshots/task4-normal-a.png && \
npx agent-browser wait 3000 && \
npx agent-browser screenshot ./screenshots/task4-normal-b.png
```
Expected: the two screenshots show *different* rotational positions (auto-rotate active). If `set media light` also resets reduced-motion, this confirms the hook responds to `change` events.

- [ ] **Step 6: Commit**

```bash
git add components/hero-orb/orb-scene.tsx
git commit -m "feat(orb): reduced-motion hook — kills auto-rotate when prefers-reduced-motion"
```

---

### Task 5: Add keyboard access to service nodes

Spec requires service nodes to be keyboard-reachable with focus ring + Enter/Space triggering the same HUD label as hover.

`@react-three/drei` does not give Three.js meshes native focus. The cleanest approach: render an invisible HTML overlay button per service node via `<Html>`, which the keyboard can tab through. Pressing Enter/Space calls the same `onHover` callback.

**Files:**
- Modify: `components/hero-orb/orb-scene.tsx`

- [ ] **Step 1: Wrap each ServiceNode with a keyboard-accessible HTML overlay**

Find the existing `ServiceNode` component (around line 306 — `function ServiceNode({ pos, color, serviceIdx, onHover, })`). The current return:

```tsx
return (
  <group position={pos}>
    {/* Large halo — extends the hover hitbox and adds soft glow */}
    <mesh onPointerEnter={onEnter} onPointerLeave={onLeave}>
      <sphereGeometry args={[NODE_R * 2.6, 8, 6]} />
      <meshBasicMaterial color={color} transparent opacity={0.09} />
    </mesh>
    {/* Core — MeshStandardMaterial so world-space lights create a 3D highlight */}
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
  </group>
)
```

Replace with the same JSX plus an `<Html>` overlay carrying a transparent button, and a service name to expose to screen readers:

```tsx
const serviceName = SERVICES[serviceIdx].name

const onKey = (e: React.KeyboardEvent<HTMLButtonElement>) => {
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
    {/* Core — MeshStandardMaterial so world-space lights create a 3D highlight */}
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
    {/* Keyboard accessibility — invisible button that tabs into focus, calls
        onHover on Enter/Space. Sits at the node's screen position via <Html>. */}
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
```

The button is 20px (5 × 4px), transparent, sits centered on the node. Tab order follows React render order. `onFocus` mirrors `onHover` so the HUD opens immediately when a keyboard user reaches the node — no need to also press Enter for first-disclosure.

`React` import: confirm `react` is imported (it isn't currently — the file only imports specific symbols). Add `KeyboardEvent` typing via `React.KeyboardEvent` so update the existing import:

Find:
```tsx
import { useRef, useMemo, useEffect, useState, useCallback } from 'react'
```

Replace with:
```tsx
import { useRef, useMemo, useEffect, useState, useCallback, type KeyboardEvent } from 'react'
```

And update the handler signature to use the bare type:
```tsx
const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
```

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: clean. If TS complains about `KeyboardEvent`, double-check the import.

- [ ] **Step 3: Visual verify keyboard access**

Run:
```bash
npx agent-browser set viewport 1440 900 && \
npx agent-browser reload && \
npx agent-browser wait --load networkidle && \
npx agent-browser wait 2500 && \
npx agent-browser press Tab && \
npx agent-browser press Tab && \
npx agent-browser press Tab && \
npx agent-browser press Tab && \
npx agent-browser press Tab && \
npx agent-browser press Tab && \
npx agent-browser press Tab && \
npx agent-browser screenshot ./screenshots/task5-keyboard-focus.png
```
Expected: somewhere in the screenshot, a service node's HUD label is open (focus has reached one of the orb's service nodes). The exact tab count depends on prior focusable elements (logo, nav, CTAs, then service node buttons).

- [ ] **Step 4: Commit**

```bash
git add components/hero-orb/orb-scene.tsx
git commit -m "feat(orb): keyboard access for service nodes — Tab + focus opens HUD"
```

---

### Task 6: Layer 1 — ASCII glyph filler

Replace the blue `InstancedMesh` with `THREE.Sprite`s rendered from per-glyph canvas textures. Bump count from 200 → 280.

**Files:**
- Modify: `components/hero-orb/orb-scene.tsx`

- [ ] **Step 1: Bump constants and add glyph alphabet**

Find:
```tsx
const N_TOTAL    = 214
const N_ORANGE   = 14
```

Replace with:
```tsx
const N_TOTAL    = 294   // 280 filler + 14 service
const N_ORANGE   = 14

// Glyph alphabet for filler nodes — weighted toward soft characters,
// denser ones used as accents.
const GLYPHS = ['·', '·', '·', '·', '+', '+', '*', '◦', '╳', '█'] as const
```

(`·` appears 4× and `+` 2× to bias the visual mix toward softer dots; `█` appears once so it's a rare accent.)

- [ ] **Step 2: Add canvas-texture cache**

Add this above `buildBlueMesh`:

```tsx
// Build a single canvas texture for one glyph at a fixed resolution.
// Cached in a module-level Map so we generate ~6 textures total, not 280.
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
  ctx.fillStyle = '#c8d8ff'
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
```

- [ ] **Step 3: Replace `buildBlueMesh` with `buildGlyphSprites`**

Find the existing `buildBlueMesh` function (~line 96-112) and the comment block above it. Replace the whole section (from `// ── Blue nodes:` comment through end of `buildBlueMesh()`) with:

```tsx
// ── Filler ASCII glyphs: per-node Sprite with cached canvas textures ──────────
// Skills ref (threejs-geometry, threejs-fundamentals): Sprite always faces
// camera; CanvasTexture lets us draw any glyph and reuse via a Map cache.

function buildGlyphSprites(): THREE.Group {
  const group = new THREE.Group()
  // Denser glyphs (`◦`, `╳`, `█`) render slightly larger so they read as accents.
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
      opacity: 0.55,
      depthWrite: false,
    })
    const sprite = new THREE.Sprite(mat)
    sprite.position.copy(_worldPts[i])
    const s = sizeFor(glyph) * (0.85 + hashF(i + 1) * 0.30) // slight per-node variance
    sprite.scale.set(s, s, s)
    group.add(sprite)
  })
  return group
}
```

- [ ] **Step 4: Update the consumer in `OrbScene`**

Find:
```tsx
const { blueMesh, edgeLines } = useMemo(() => ({
  blueMesh:  buildBlueMesh(),
  edgeLines: buildEdgeLines(),
}), [])
```

Replace with:
```tsx
const { glyphSprites, edgeLines } = useMemo(() => ({
  glyphSprites: buildGlyphSprites(),
  edgeLines:    buildEdgeLines(),
}), [])
```

Find:
```tsx
useEffect(() => () => {
  blueMesh.geometry.dispose()
  ;(blueMesh.material as THREE.Material).dispose()
  blueMesh.dispose()
  edgeLines.geometry.dispose()
  ;(edgeLines.material as THREE.Material).dispose()
}, [blueMesh, edgeLines])
```

Replace with:
```tsx
useEffect(() => () => {
  glyphSprites.traverse(obj => {
    if (obj instanceof THREE.Sprite) {
      ;(obj.material as THREE.SpriteMaterial).dispose()
    }
  })
  edgeLines.geometry.dispose()
  ;(edgeLines.material as THREE.Material).dispose()
  // Glyph textures are shared via cache; dispose on full unmount only
  _glyphTextureCache.forEach(tex => tex.dispose())
  _glyphTextureCache.clear()
}, [glyphSprites, edgeLines])
```

Find the JSX:
```tsx
<group ref={groupRef}>
  <primitive object={edgeLines} />
  <primitive object={blueMesh} />
```

Replace with:
```tsx
<group ref={groupRef}>
  <primitive object={edgeLines} />
  <primitive object={glyphSprites} />
```

- [ ] **Step 5: Verify build**

Run: `pnpm build`
Expected: clean.

- [ ] **Step 6: Visual verify ASCII glyphs**

Run:
```bash
npx agent-browser set viewport 1440 900 && \
npx agent-browser reload && \
npx agent-browser wait --load networkidle && \
npx agent-browser wait 3000 && \
npx agent-browser screenshot ./screenshots/task6-glyphs.png
```
Expected: orb's filler nodes are recognizable ASCII glyphs (mostly `·` and `+`, with `◦`, `╳`, `█` as accents). 14 service nodes still visible as glowing colored dots. Edges still drawn between original Fibonacci points.

- [ ] **Step 7: Commit**

```bash
git add components/hero-orb/orb-scene.tsx
git commit -m "feat(orb): Layer 1 — ASCII glyph filler replaces blue dots, 200→280"
```

---

### Task 7: Layer 2 — Edge pulse animation

Pulse fires every ~4s, picks a random connected chain of 3–5 edges, fades brand-blue at 0.6 alpha for 800ms, then restores baseline color.

**Files:**
- Modify: `components/hero-orb/orb-scene.tsx`

- [ ] **Step 1: Track edge graph for chain selection**

The `buildEdges` helper produces a flat `pairs` array (`[i,j, i,j, ...]`). To pick a *connected chain* we need an adjacency map. Add this helper right after `buildEdges`:

```tsx
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
```

Update the module-level edge construction to expose what we'll need:

Find:
```tsx
function buildEdgeLines(): THREE.LineSegments {
  const pairs  = buildEdges(_unitPts)
  const n      = pairs.length
  ...
}
```

Refactor to also return the pairs + adjacency for later use:

```tsx
function buildEdgeLines(): {
  lines: THREE.LineSegments
  pairs: number[]
  adjacency: Map<number, number[]>
  baselineColors: Float32Array
} {
  const pairs  = buildEdges(_unitPts)
  const n      = pairs.length
  const pos    = new Float32Array(n * 3)
  const col    = new Float32Array(n * 3)

  const blue = new THREE.Color('#204AF8')
  const dim  = new THREE.Color('#99aeff')

  for (let i = 0; i < n; i++) {
    const wp = _worldPts[pairs[i]]
    wp.toArray(pos, i * 3)
    const t = (wp.z + SPHERE_R) / (2 * SPHERE_R)
    const c = blue.clone().lerp(dim, 1 - t)
    c.toArray(col, i * 3)
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('color',    new THREE.BufferAttribute(col, 3))
  const lines = new THREE.LineSegments(
    geo,
    new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.22 })
  )
  return {
    lines,
    pairs,
    adjacency: buildAdjacency(pairs),
    baselineColors: col.slice(), // copy for restoration
  }
}
```

- [ ] **Step 2: Add the pulse hook**

Below the existing `useOrbit` hook, add:

```tsx
// ── Edge pulse: fires every ~4s, animates a chain of 3-5 edges ───────────────

interface ActivePulse {
  edgeIndices: number[]   // edge indices in the flat pairs array
  startTime:   number     // performance.now() when fired
}

function useEdgePulse(
  edgeBundle: ReturnType<typeof buildEdgeLines>,
  reducedMotion: boolean,
) {
  const lastFireRef = useRef(0)
  const activeRef   = useRef<ActivePulse[]>([])

  useFrame(({ clock }) => {
    if (reducedMotion) return
    const now = clock.elapsedTime * 1000

    // Fire a new pulse roughly every 4s (with ±1s jitter).
    if (now - lastFireRef.current > 3000 + Math.random() * 2000) {
      lastFireRef.current = now
      const chainLen = 3 + Math.floor(Math.random() * 3) // 3..5
      const chain    = walkChain(edgeBundle.adjacency, edgeBundle.pairs, chainLen)
      if (chain.length > 0) {
        activeRef.current.push({ edgeIndices: chain, startTime: now })
      }
    }

    // Update color buffer for active pulses.
    const geo = edgeBundle.lines.geometry
    const colorAttr = geo.getAttribute('color') as THREE.BufferAttribute
    const colArr = colorAttr.array as Float32Array

    // Reset to baseline first.
    colArr.set(edgeBundle.baselineColors)

    // Apply each active pulse's overlay.
    activeRef.current = activeRef.current.filter(p => {
      const elapsed = now - p.startTime
      if (elapsed > 800) return false // expired
      // 0..200ms ramp-up, 200..800ms ramp-down
      const alpha = elapsed < 200
        ? (elapsed / 200) * 0.6
        : (1 - (elapsed - 200) / 600) * 0.6
      const r = 0x20 / 255, g = 0x4A / 255, b = 0xF8 / 255
      for (const edgeIdx of p.edgeIndices) {
        const offset = edgeIdx * 6 // 2 vertices × 3 components
        for (let v = 0; v < 2; v++) {
          const base = offset + v * 3
          colArr[base]     = colArr[base]     * (1 - alpha) + r * alpha
          colArr[base + 1] = colArr[base + 1] * (1 - alpha) + g * alpha
          colArr[base + 2] = colArr[base + 2] * (1 - alpha) + b * alpha
        }
      }
      return true
    })

    colorAttr.needsUpdate = true
  })
}

// Walk the adjacency graph to produce a connected chain of edge indices.
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
    // Move to the other end of this edge.
    const a = pairs[edgeIdx * 2]
    const b = pairs[edgeIdx * 2 + 1]
    current = current === a ? b : a
  }
  return chain
}
```

- [ ] **Step 3: Wire the pulse hook into `OrbScene`**

Find:
```tsx
const { glyphSprites, edgeLines } = useMemo(() => ({
  glyphSprites: buildGlyphSprites(),
  edgeLines:    buildEdgeLines(),
}), [])
```

The `buildEdgeLines` return shape changed. Replace with:

```tsx
const { glyphSprites, edgeBundle } = useMemo(() => ({
  glyphSprites: buildGlyphSprites(),
  edgeBundle:   buildEdgeLines(),
}), [])
```

Update the cleanup `useEffect` to use the new shape:

Find:
```tsx
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
```

Replace with:
```tsx
useEffect(() => () => {
  glyphSprites.traverse(obj => {
    if (obj instanceof THREE.Sprite) {
      ;(obj.material as THREE.SpriteMaterial).dispose()
    }
  })
  edgeBundle.lines.geometry.dispose()
  ;(edgeBundle.lines.material as THREE.Material).dispose()
  _glyphTextureCache.forEach(tex => tex.dispose())
  _glyphTextureCache.clear()
}, [glyphSprites, edgeBundle])
```

Find:
```tsx
<group ref={groupRef}>
  <primitive object={edgeLines} />
  <primitive object={glyphSprites} />
```

Replace with:
```tsx
<group ref={groupRef}>
  <primitive object={edgeBundle.lines} />
  <primitive object={glyphSprites} />
```

Now wire the hook itself. The `useEdgePulse` hook calls `useFrame`, so it must run inside the Canvas tree. Add a small inner component below `OrbController`:

```tsx
function EdgePulse({
  edgeBundle,
  reducedMotion,
}: {
  edgeBundle: ReturnType<typeof buildEdgeLines>
  reducedMotion: boolean
}) {
  useEdgePulse(edgeBundle, reducedMotion)
  return null
}
```

Then in `OrbScene`'s JSX, add `<EdgePulse>` next to `<OrbController>`:

Find:
```tsx
return (
  <>
    <OrbController groupRef={groupRef} reducedMotion={reducedMotion} />
```

Replace with:
```tsx
return (
  <>
    <OrbController groupRef={groupRef} reducedMotion={reducedMotion} />
    <EdgePulse edgeBundle={edgeBundle} reducedMotion={reducedMotion} />
```

- [ ] **Step 4: Verify build**

Run: `pnpm build`
Expected: clean.

- [ ] **Step 5: Visual verify pulse fires**

Take 4 screenshots over ~12 seconds and look for chains of brand-blue edges in any of them.

Run:
```bash
npx agent-browser set viewport 1440 900 && \
npx agent-browser reload && \
npx agent-browser wait --load networkidle && \
npx agent-browser wait 1500 && \
npx agent-browser screenshot ./screenshots/task7-pulse-1.png && \
npx agent-browser wait 3000 && \
npx agent-browser screenshot ./screenshots/task7-pulse-2.png && \
npx agent-browser wait 3000 && \
npx agent-browser screenshot ./screenshots/task7-pulse-3.png && \
npx agent-browser wait 3000 && \
npx agent-browser screenshot ./screenshots/task7-pulse-4.png
```
Expected: at least one screenshot shows visibly brighter brand-blue edges (a chain of 3–5 highlighted lines among the dim edge mesh). The chain location varies because pulse fires randomly.

- [ ] **Step 6: Verify pulse disabled under reduced motion**

Run:
```bash
npx agent-browser set media reduced-motion && \
npx agent-browser reload && \
npx agent-browser wait --load networkidle && \
npx agent-browser wait 8000 && \
npx agent-browser screenshot ./screenshots/task7-reduced.png && \
npx agent-browser set media light
```
Expected: no pulses visible (all edges remain at their baseline color gradient).

- [ ] **Step 7: Commit**

```bash
git add components/hero-orb/orb-scene.tsx
git commit -m "feat(orb): Layer 2 — edge pulse along random 3-5 edge chains, ~4s cadence"
```

---

### Task 8: Layer 3 — Background drift particles

A separate, sparse field of 120 tiny dots living *behind* the orb. Drift slowly, wrap on bounds, render below the orb group.

**Files:**
- Modify: `components/hero-orb/orb-scene.tsx`

- [ ] **Step 1: Build the drift particle data**

Add a builder above `OrbScene`:

```tsx
// ── Background drift particles: 120 dots living behind the orb ────────────────
// Skills ref (threejs-geometry): BufferGeometry + PointsMaterial. We mutate
// position attribute per frame for drift; velocity vectors precomputed once.

const DRIFT_COUNT  = 120
const DRIFT_SPEED  = 0.02 // units / second
const DRIFT_BOX    = { x: 2.4, y: 2.4, zMin: -1.0, zMax: 0.2 }

interface DriftBundle {
  points:     THREE.Points
  positions:  Float32Array
  velocities: Float32Array
}

function buildDrift(): DriftBundle {
  const positions  = new Float32Array(DRIFT_COUNT * 3)
  const velocities = new Float32Array(DRIFT_COUNT * 3)
  for (let i = 0; i < DRIFT_COUNT; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * DRIFT_BOX.x
    positions[i * 3 + 1] = (Math.random() - 0.5) * DRIFT_BOX.y
    positions[i * 3 + 2] = DRIFT_BOX.zMin + Math.random() * (DRIFT_BOX.zMax - DRIFT_BOX.zMin)

    // Random unit-length velocity, scaled by DRIFT_SPEED.
    const vx = Math.random() - 0.5
    const vy = Math.random() - 0.5
    const vz = (Math.random() - 0.5) * 0.3 // less z-drift to keep them roughly behind orb
    const len = Math.hypot(vx, vy, vz) || 1
    velocities[i * 3]     = (vx / len) * DRIFT_SPEED
    velocities[i * 3 + 1] = (vy / len) * DRIFT_SPEED
    velocities[i * 3 + 2] = (vz / len) * DRIFT_SPEED
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const mat = new THREE.PointsMaterial({
    color:       '#c8d8ff',
    size:        0.012,
    transparent: true,
    opacity:     0.30,
    depthWrite:  false,
    sizeAttenuation: true,
  })
  const points = new THREE.Points(geo, mat)
  points.renderOrder = -1
  return { points, positions, velocities }
}
```

- [ ] **Step 2: Add the drift animation hook**

Below `useEdgePulse`:

```tsx
function useDrift(bundle: DriftBundle, reducedMotion: boolean) {
  useFrame((_, delta) => {
    if (reducedMotion) return
    const pos = bundle.positions
    const vel = bundle.velocities

    for (let i = 0; i < DRIFT_COUNT; i++) {
      pos[i * 3]     += vel[i * 3]     * delta
      pos[i * 3 + 1] += vel[i * 3 + 1] * delta
      pos[i * 3 + 2] += vel[i * 3 + 2] * delta

      // Wrap on box bounds.
      const halfX = DRIFT_BOX.x / 2
      const halfY = DRIFT_BOX.y / 2
      if (pos[i * 3]     >  halfX) pos[i * 3]     = -halfX
      if (pos[i * 3]     < -halfX) pos[i * 3]     =  halfX
      if (pos[i * 3 + 1] >  halfY) pos[i * 3 + 1] = -halfY
      if (pos[i * 3 + 1] < -halfY) pos[i * 3 + 1] =  halfY
      if (pos[i * 3 + 2] > DRIFT_BOX.zMax) pos[i * 3 + 2] = DRIFT_BOX.zMin
      if (pos[i * 3 + 2] < DRIFT_BOX.zMin) pos[i * 3 + 2] = DRIFT_BOX.zMax
    }

    const attr = bundle.points.geometry.getAttribute('position') as THREE.BufferAttribute
    attr.needsUpdate = true
  })
}
```

- [ ] **Step 3: Wire drift into `OrbScene`**

Find:
```tsx
const { glyphSprites, edgeBundle } = useMemo(() => ({
  glyphSprites: buildGlyphSprites(),
  edgeBundle:   buildEdgeLines(),
}), [])
```

Replace with:
```tsx
const { glyphSprites, edgeBundle, drift } = useMemo(() => ({
  glyphSprites: buildGlyphSprites(),
  edgeBundle:   buildEdgeLines(),
  drift:        buildDrift(),
}), [])
```

Update the cleanup effect. Find:
```tsx
useEffect(() => () => {
  glyphSprites.traverse(obj => {
    if (obj instanceof THREE.Sprite) {
      ;(obj.material as THREE.SpriteMaterial).dispose()
    }
  })
  edgeBundle.lines.geometry.dispose()
  ;(edgeBundle.lines.material as THREE.Material).dispose()
  _glyphTextureCache.forEach(tex => tex.dispose())
  _glyphTextureCache.clear()
}, [glyphSprites, edgeBundle])
```

Replace with:
```tsx
useEffect(() => () => {
  glyphSprites.traverse(obj => {
    if (obj instanceof THREE.Sprite) {
      ;(obj.material as THREE.SpriteMaterial).dispose()
    }
  })
  edgeBundle.lines.geometry.dispose()
  ;(edgeBundle.lines.material as THREE.Material).dispose()
  drift.points.geometry.dispose()
  ;(drift.points.material as THREE.Material).dispose()
  _glyphTextureCache.forEach(tex => tex.dispose())
  _glyphTextureCache.clear()
}, [glyphSprites, edgeBundle, drift])
```

Add a small `Drift` component below `EdgePulse`:

```tsx
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
```

In the JSX, drift renders OUTSIDE the rotating `<group ref={groupRef}>` so it doesn't rotate with the orb. Find:

```tsx
return (
  <>
    <OrbController groupRef={groupRef} reducedMotion={reducedMotion} />
    <EdgePulse edgeBundle={edgeBundle} reducedMotion={reducedMotion} />

    {/* Lights live in world-space so they DON'T rotate with the group. */}
    <ambientLight intensity={0.5} />
    <directionalLight position={[3, 4, 3]} intensity={1.0} />

    <group ref={groupRef}>
```

Replace with:
```tsx
return (
  <>
    <OrbController groupRef={groupRef} reducedMotion={reducedMotion} />
    <EdgePulse edgeBundle={edgeBundle} reducedMotion={reducedMotion} />
    <Drift bundle={drift} reducedMotion={reducedMotion} />

    {/* Lights live in world-space so they DON'T rotate with the group. */}
    <ambientLight intensity={0.5} />
    <directionalLight position={[3, 4, 3]} intensity={1.0} />

    <group ref={groupRef}>
```

- [ ] **Step 4: Verify build**

Run: `pnpm build`
Expected: clean.

- [ ] **Step 5: Visual verify drift**

Run:
```bash
npx agent-browser set viewport 1440 900 && \
npx agent-browser reload && \
npx agent-browser wait --load networkidle && \
npx agent-browser wait 2000 && \
npx agent-browser screenshot ./screenshots/task8-drift-a.png && \
npx agent-browser wait 4000 && \
npx agent-browser screenshot ./screenshots/task8-drift-b.png
```
Expected: faint additional dots visible behind/around the orb in both screenshots, with subtly different positions between A and B (drift over time). Service nodes still glow distinctly. Drift particles should NOT occlude service nodes.

- [ ] **Step 6: Verify drift disabled under reduced motion**

Run:
```bash
npx agent-browser set media reduced-motion && \
npx agent-browser reload && \
npx agent-browser wait --load networkidle && \
npx agent-browser wait 4000 && \
npx agent-browser screenshot ./screenshots/task8-reduced-a.png && \
npx agent-browser wait 4000 && \
npx agent-browser screenshot ./screenshots/task8-reduced-b.png && \
npx agent-browser set media light
```
Expected: drift particles render but DO NOT MOVE between A and B (positions stay put because `useDrift` returns early under reduced motion).

- [ ] **Step 7: Commit**

```bash
git add components/hero-orb/orb-scene.tsx
git commit -m "feat(orb): Layer 3 — 120 drift particles behind orb, reduced-motion safe"
```

---

### Task 9: End-to-end verification + final screenshot pass

All layers landed. Final pass to confirm nothing regressed and the design hits the spec.

- [ ] **Step 1: Multi-viewport screenshots**

Run:
```bash
npx agent-browser set viewport 375 812 && \
npx agent-browser reload && \
npx agent-browser wait --load networkidle && \
npx agent-browser wait 2500 && \
npx agent-browser screenshot --full ./screenshots/final-mobile.png

npx agent-browser set viewport 1440 900 && \
npx agent-browser reload && \
npx agent-browser wait --load networkidle && \
npx agent-browser wait 2500 && \
npx agent-browser screenshot ./screenshots/final-1440.png

npx agent-browser set viewport 2560 1080 && \
npx agent-browser reload && \
npx agent-browser wait --load networkidle && \
npx agent-browser wait 2500 && \
npx agent-browser screenshot ./screenshots/final-2560.png
```
Expected per viewport:
- **375 mobile:** copy stack on top, orb below at 60vh, no horizontal scroll, scroll chevron at bottom of left/upper column
- **1440 laptop:** 60/40 grid, H1 on 3 lines, blockquote outweighs body lead, ASCII glyphs visible, edges with occasional pulses, drift particles in background
- **2560 ultrawide:** section caps at 1600px, copy and orb still coupled, no dead zone

- [ ] **Step 2: Hex literal scan**

Run: `grep -nE '#[0-9A-Fa-f]{3,}' components/sections/hero.tsx`
Expected: empty output.

`orb-scene.tsx` is exempt — Three.js scenes routinely require hex literals for `THREE.Color`, sprite material colors, etc. The decorative HUD CSS in `globals.css` is also exempt.

- [ ] **Step 3: Inline-style scan**

Run: `grep -n 'style={{' components/sections/hero.tsx`
Expected: empty output.

- [ ] **Step 4: Final build**

Run: `pnpm build`
Expected: clean.

- [ ] **Step 5: Update memory**

Update the project memory file at `~/.claude/projects/-Users-zephyr-Claude-Workspace-projects-mb-website/memory/project-metaborong-website.md`:

In the "Build state" → "Done" section, add a bullet under "Hero Orb":

```markdown
- **Hero (2026-05-02):** Refactored — short-phrase H1 ("Web3 protocols. AI agents. Shipped."), promoted AEO blockquote with cite=/about, scroll-down chevron, mobile single-column collapse below lg, scan-order documented. Orb Phase 2: ASCII glyph filler (280 nodes), edge pulse animation, 120 drift particles, prefers-reduced-motion honored, keyboard access on service nodes. See `docs/superpowers/specs/2026-05-02-section-hero-redesign.md`.
```

- [ ] **Step 6: Final commit**

```bash
git add docs/ screenshots/
git commit -m "docs(hero): final verification screenshots + memory update"
```

---

## Out of scope (do NOT do in this plan)

- Trust bar, problem section, or any subsequent homepage section
- Refactor of `<Section>` primitive's stale `px-6 md:px-[80px]` scale
- Full mobile design pass (we land only the stop-gap collapse rule)
- Performance optimization beyond the stated "disable drift first if FPS regresses" fallback
- Visual mockups in Figma — work directly from the spec

## Rollback notes

Each task is one commit. To roll back any single layer (e.g., drift particles look wrong) while keeping the others, `git revert <task-N-commit-sha>`. Phase 2's three layers are intentionally isolated for this reason.
