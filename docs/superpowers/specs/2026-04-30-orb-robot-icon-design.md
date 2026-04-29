# Orb Robot Icon — Design Spec

## Context

The hero orb (`components/hero-orb/orb-scene.tsx`) currently renders the Metaborong M-mark SVG at the centre via `<Html center>`. The M-mark is 52×30px, static, blue fill — functional but understated relative to the animated service nodes surrounding it.

This spec replaces it with a brand-styled robot icon inspired by the aesthetic of `docs/AI_Agent.jpeg` (cyberpunk robot head with split holographic/mechanical face). The icon is world-facing (camera-aligned), fully animated via CSS/SMIL, and integrates into the existing `<Html center>` mount point with zero Three.js changes.

---

## Files Changed

| File | Change |
|---|---|
| `components/hero-orb/orb-robot-icon.tsx` | **Create** — new self-contained component |
| `components/hero-orb/orb-scene.tsx` | **Modify** — replace M-mark block (lines 419–429) with `<OrbRobotIcon />` |

No other files touched.

---

## Component: `OrbRobotIcon`

### Structure

```
OrbRobotIcon
  └── <div> (pointerEvents:none, userSelect:none)
        └── <svg width="90" height="108" viewBox="0 0 90 108">
              ├── <defs> (gradients, clipPaths, filters)
              ├── Head shell path (full silhouette)
              ├── Left half — holographic face
              │     ├── Iridescent fill (linearGradient: blue→pink→cyan→orange)
              │     ├── Shimmer streak (animated diagonal drift)
              │     └── Left eye (soft circle + iris pulse)
              ├── Centre seam (dashed vertical line)
              ├── Right half — exposed mechanical (clipPath)
              │     ├── Hexagonal eye frame (outer + inner polygon)
              │     ├── Eye glow core (radialGradient, animated expand)
              │     ├── Orange circuit trace lines
              │     ├── Travelling dot (animateMotion on orange trace)
              │     ├── Lower circuit module (rect + LED blocks)
              │     └── Neck wire lines (blue + orange)
              ├── Scan-line rect (animateTransform, vertical sweep)
              ├── Antenna (line + tip circle, colour-cycle animate)
              ├── Neck collar arc
              └── Orange accent nodes (left/right flanks)
        └── <style> (CSS @keyframes for outer glow pulse)
```

### Visual Design

**Left half — holographic face**
- Fill: `linearGradient` — `#c8d8ff` → `#e8c0f8` → `#c0f8e8` → `#f8d8c0` at 0.5 opacity. Simulates iridescent sheen from the reference image.
- Shimmer streak: white curved path, animates opacity (0.08→0.32→0.08) and diagonal translate (−4,−6 → +4,+6) over 2.6s.
- Left eye: outer ring at 7r, inner iris at 3.5r (pulses to 4.8r and back over 2.2s), core dot at 1.5r in `#6699ff`.

**Right half — exposed mechanical (clipped to right 45px)**
- Hexagonal eye: outer polygon (stroke `#204AF8`, dark fill), inner polygon (semi-transparent blue, opacity throbbing 0.6→1→0.6 over 1.8s).
- Eye glow core: radialGradient `#204AF8` → transparent, radius pulses 4→5.5→4 over 1.8s. White pupil dot + highlight dot on top.
- Orange circuit trace: line `(71,39)→(78,39)→(78,31)` in `#F6851B`. A glowing dot of r=1.8 travels this path via `<animateMotion>` over 1.4s, fades in/out at path ends.
- Lower module: 24×9 rect with two LED blocks, each blinking on 2s cycle offset by 0.7s.
- Neck wires: 4 vertical lines (3× blue, 1× orange) descending from module to bottom of head.

**Full-icon animations**

| Animation | Mechanism | Duration |
|---|---|---|
| Outer glow pulse (blue→orange→green) | CSS `@keyframes` on `filter: drop-shadow` | 2.4s |
| Left iris expand/fade | SVG `<animate>` r + opacity | 2.2s |
| Right hex ring throb | SVG `<animate>` opacity | 1.8s |
| Right eye core expand | SVG `<animate>` r | 1.8s |
| Circuit dot travel | SVG `<animateMotion>` | 1.4s |
| Scan-line sweep | SVG `<animateTransform>` translate Y | 3.2s |
| Holo shimmer drift | SVG `<animate>` + `<animateTransform>` | 2.6s |
| Antenna colour cycle | SVG `<animate>` fill (blue→orange→green→blue) | 4.0s |
| LED blink (×2, staggered) | SVG `<animate>` opacity, begin offsets 0s / 0.7s | 2.0s |

All durations are prime-ish and deliberately misaligned so no two animations synchronise — same principle as the service node phase offsets in `useGenesisCube`.

### Size & placement

- SVG viewport: `90 × 108` (slightly taller than wide, portrait robot head proportions)
- Wrapper: `div` with `pointerEvents: none`, `userSelect: none` — identical to current M-mark wrapper
- Mounted at: `<Html center zIndexRange={[10,10]}>` — no change to mount point

---

## Integration into `orb-scene.tsx`

**Remove** lines 419–429 (current M-mark Html block):
```tsx
<Html center zIndexRange={[10, 10]}>
  <div style={{ pointerEvents: 'none', userSelect: 'none' }}>
    <svg xmlns="http://www.w3.org/2000/svg" width="52" height="30" …>
      <path d="M 10.421 …" fill="#204AF8" fillRule="evenodd" />
    </svg>
  </div>
</Html>
```

**Replace with:**
```tsx
<Html center zIndexRange={[10, 10]}>
  <OrbRobotIcon />
</Html>
```

**Add import** at top of `orb-scene.tsx`:
```tsx
import { OrbRobotIcon } from './orb-robot-icon'
```

---

## Design Principles Applied

- **No JavaScript animation** — all motion is CSS `@keyframes` or SVG SMIL. Zero `useFrame`, zero `requestAnimationFrame`, zero state updates.
- **Transparent background** — SVG has no background rect; CSS `drop-shadow` glow works cleanly against the `#f5f7ff` hero bg.
- **Echoes orb colour language** — orange accent nodes on the flanks mirror the orb's orange Web3 service nodes. Antenna cycles through all three service colours (blue/orange/green). Visually ties the icon to the network.
- **Performance** — pure declarative SVG + CSS. No layout thrash, no canvas operations, no extra React renders.
