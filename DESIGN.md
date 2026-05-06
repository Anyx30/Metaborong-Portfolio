# Design System — Metaborong Website

Single source of truth for visual decisions. Extracted from the shipped codebase, not aspirational.
Read this file before making any UI change. If a section asks for an override, log it in
`docs/superpowers/specs/<date>-<section>.md` under a "Deviations" heading.

---

## Product Context
- **What this is:** Metaborong's portfolio site (metaborong.com).
- **Who it's for:** Web3 / AI / SaaS founders evaluating a senior dev studio.
- **Space:** Boutique studio sitting between large agencies and freelancer marketplaces.
- **Project type:** Marketing site — Next.js 16 App Router, React 19, TypeScript, Tailwind v4.

## Aesthetic Direction
- **Direction:** Swiss-engineered modernism with technical/blueprint accents.
- **Decoration level:** Intentional — typography and structure carry most of the load; signature
  visuals (hero orb, services trefoil) carry the rest. No ambient blobs, no decorative gradients.
- **Mood:** Senior team, real engineering, no posturing. Tight grid, deliberate negative space,
  one signature visual per section, motion that happens once and stops.
- **Posture:** "Designed, not assembled." Every line in the SVGs has a structural job. Every
  spacing value comes from the scale below.

## Typography

Loaded via Fontshare + Google Fonts in `app/globals.css:2-6`.

- **Display + Body:** Satoshi (300, 400, 500, 700, 900) — `--font-brand`.
- **Fallback:** Space Grotesk (system fallback only — never specify directly).
- **Mono / data / eyebrows:** JetBrains Mono 400 — `--font-mono`.

CSS variables (`globals.css:40-41`):
```css
--font-brand: 'Satoshi', 'Space Grotesk', sans-serif;
--font-mono:  'JetBrains Mono', 'Courier New', monospace;
```

Applied globally on `html` (`globals.css:79`). Do NOT add a second `html { @apply font-sans }`
elsewhere — Tailwind's default font-sans stack will override Satoshi.

**Type scale (used across sections):**

| Role               | Size  | Weight | Tracking  | Notes                              |
|--------------------|-------|--------|-----------|------------------------------------|
| Hero H1            | 96px  | 900    | -0.04em   | Drives the page                    |
| Section H2         | 56px  | 700    | -0.03em   | "What we build", "The problem"     |
| Card / Panel H3    | 20px  | 700    | -0.025em  | Pillar headlines, FAQ              |
| Body large         | 18px  | 400    | -0.01em   | Lede paragraphs                    |
| Body               | 16px  | 400    | -0.005em  | Default                            |
| Small / meta       | 14px  | 400    | -0.005em  | Card body, child link descriptions |
| Caption            | 13px  | 400    | -0.005em  | Description text                   |
| Eyebrow / number   | 11-13px font-mono, uppercase, `tracking-[0.16em]` to `tracking-[0.18em]` |
| Body line-height   | 1.5–1.75 (1.75 for prose blocks)                                          |

The `Eyebrow` primitive (`components/ui/eyebrow.tsx`) is the canonical eyebrow style:
`text-[11px] font-bold uppercase tracking-[0.1em] leading-none text-gray-light`.

## Color

Tokens defined in `@theme` block, `globals.css:17-37`. Always reference by token, never raw hex.

### Brand
| Token              | Hex       | Use                                            |
|--------------------|-----------|------------------------------------------------|
| `--color-brand`    | `#204AF8` | Primary accent — Web3 pillar, primary CTA, hub |
| `--color-accent`   | `#F6851B` | Secondary accent — Product Studio pillar, HUD  |
| `--color-ai`       | `#10b981` | AI Agents pillar (only)                        |

### Neutrals
| Token                  | Hex       | Use                              |
|------------------------|-----------|----------------------------------|
| `--color-dark`         | `#303030` | Body text, headings              |
| `--color-gray`         | `#676767` | Secondary text                   |
| `--color-gray-light`   | `#999999` | Tertiary text, disabled          |
| `--color-gray-subtle`  | `#D9D9D9` | Quiet dividers                   |
| `--color-off-white`    | `#FEFEFE` | Surface near-white               |

### Semantic surfaces
| Token                    | Hex       | Use                                      |
|--------------------------|-----------|------------------------------------------|
| `--color-bg`             | `#ffffff` | Default canvas                           |
| `--color-bg-subtle`      | `#f5f7ff` | Section alternation, secondary buttons   |
| `--color-canvas`         | `#0a0a0a` | Dark sections (hero canvas, contact)     |
| `--color-border`         | `#e5e7eb` | Default 1px borders, card outlines       |
| `--color-border-subtle`  | `#f3f4f6` | Internal dividers, hover backgrounds     |

### Inactive / structural slate (services trefoil)
Used for inactive glyphs and dashed spokes in `services-glyphs.tsx`:
- Stroke: `#cbd5e1`
- Fill: `#e2e8f0`
- Dot / accent: `#94a3b8`

### Pillar color rule
Pillars own their color globally — Web3 is brand-blue, AI is `#10b981`, Product Studio is
`#F6851B`. Do not introduce new pillar-tinted UI without updating `services-data.ts`.

### Dark mode
A `.dark` token block exists (`globals.css:303-335`) but is not currently activated. The site
ships light-only. If dark mode is reintroduced, redesign surfaces — do not just invert.

---

## Spacing
Custom scale defined in `@theme`, `globals.css:43-53`. **Use these tokens via `gap-[Npx]`,
`p-[Npx]`, `mb-[Npx]` etc. — do not invent intermediate values.**

| Token | px  | Common use                                  |
|-------|-----|---------------------------------------------|
| `1`   | 4   | Tight inner gaps                            |
| `2`   | 8   | Icon-to-text gap                            |
| `3`   | 12  | Tight rhythm                                |
| `4`   | 16  | Default body spacing                        |
| `5`   | 24  | Section internal padding                    |
| `6`   | 32  | Card padding, large gap                     |
| `7`   | 48  | Section column gaps                         |
| `8`   | 64  | Major block separators                      |
| `9`   | 96  | Section vertical padding (default)          |
| `10`  | 128 | XL breakpoint horizontal padding            |

## Radii
| Token        | px  | Use                    |
|--------------|-----|------------------------|
| `radius-sm`  | 4   | Small chips, inputs    |
| `radius-md`  | 8   | Buttons, panels, boxes |
| `radius-lg`  | 12  | Cards                  |
| `radius-xl`  | 20  | Featured cards         |

## Layout
- **Section primitive:** `components/ui/section.tsx` — wraps every section.
  - Vertical padding: `py-[96px]`.
  - Horizontal padding: `px-[24px] md:px-[48px] lg:px-[96px] xl:px-[128px]`.
  - Max-width variants: `wide` (1120), `narrow` (880), `prose` (720).
  - Auto-wraps children in `<Reveal>`.
- **Two-column sections** (services, founders, contact) use `grid-cols-1 lg:grid-cols-2 gap-[48px]`.
- **Mobile breakpoint discipline:** mobile fallbacks render server-side (no `display:none` SEO loss).
  See `services.tsx` for the `<Card>` list shown on mobile while `services-trefoil.tsx` shows on lg+.

---

## Motion
Locked grammar from `docs/superpowers/specs/2026-05-04-session-5.5-global-motion.md`.

### Core rules
1. **One-shot.** No infinite loops outside the trust-bar marquee and orb HUD label cursor blink.
2. **IntersectionObserver-gated first paint.** Sections are invisible at SSR, fade in once the
   viewport enters them. Pattern lives in `components/ui/reveal.tsx` (used everywhere via
   `<Section>`) and in `components/sections/phrase-stamp.tsx` for staggered text reveals.
3. **`prefers-reduced-motion: reduce` always honored.** Reveal short-circuits to visible.
   SVG sections kill animations via `@media (prefers-reduced-motion: reduce)` blocks.
4. **No JS for `matchMedia` if a CSS media query suffices.** SVG sections use inline
   `<style precedence="default">` blocks to avoid hydration cost.

### Easing + duration
| Curve                                     | Use                                 | Duration   |
|-------------------------------------------|-------------------------------------|------------|
| `cubic-bezier(0.16, 1, 0.3, 1)` (out-expo) | Reveal, halo-in, hero scroll         | 350–500ms |
| `cubic-bezier(0.32, 0, 0.16, 1)` (s-curve) | Spoke transitions, pulse travel      | 350–900ms |
| `cubic-bezier(0.65, 0, 0.35, 1)` (in-out)  | Stroke-draw on glyph activation      | 620ms     |
| `ease-out`                                 | Atmospheric backdrop fade            | 600ms     |
| `linear`                                   | Trust-bar marquee, orb scan          | 2–24s     |

### Patterns currently in use
- **Reveal** (`components/ui/reveal.tsx`): `opacity 0→1` + `translateY(8px→0)` over 400ms when
  the element enters the viewport. Optional `delay` for staggered reveals.
- **phrase-stamp** (`components/sections/phrase-stamp.tsx`): per-word stagger, gated by IO,
  600ms after entry; calibration reference for any first-paint-with-delay pattern.
- **Services trefoil** (`components/sections/services-trefoil.tsx`):
  - Atmospheric backdrop opacity fade (`0→1`, 600ms ease-out) on first activation.
  - Stroke-draw on glyph activation (`stroke-dashoffset` per `[data-draw]` element, 620ms).
  - Halo behind active node (`opacity 0→0.10`, `scale 0.7→1`, 500ms with 200ms delay).
  - Pulse dot travels hub→active-node via `transform: translate(var(--dx), var(--dy))`, 900ms.
  - Spoke style transition (color, opacity, width) 350ms.
- **Trust-bar marquee** (`globals.css:62-67`): `translateX(0 → -50%)` linear 24s infinite. Only
  approved infinite animation in marketing flow.

---

## Components

### Primitives (`components/ui/`)
| File              | Variants                          | Notes                                   |
|-------------------|-----------------------------------|-----------------------------------------|
| `section.tsx`     | bg: default/subtle/dark; mw: wide/narrow/prose | Wraps every section. Auto-Reveal. |
| `card.tsx`        | default / featured / quote        | `featured` adds 3px left border, takes `accentColor` prop. Hover: -0.5 translate, brand/30 border. |
| `button.tsx`      | primary / ghost / secondary; sm/md/lg | Inline-style based, brand-blue primary. |
| `eyebrow.tsx`     | as: span/div/p                    | 11px bold uppercase 0.1em tracking, gray-light. |
| `reveal.tsx`      | optional `delay`                  | The IO+motion gate. Used by `<Section>`. |
| `section-header.tsx` | —                              | Eyebrow + H2 + lede composition. |
| `logo.tsx`        | sm/md                             | Brand-blue square + wordmark. |
| `badge.tsx`       | —                                 | Pill chips (used in trust bar etc.). |

### Section patterns
- **Services boxing pattern** (`services-trefoil.tsx`, panel column): right-side accordion lives
  inside a `rounded-md border border-border bg-white` box. Top eyebrow row shows
  `THREE PILLARS [01 / 03]` with the active number in the active pillar's hue. Each tab row gets
  a `border-b border-border`. The pillar-colored 3px bar lives **inside the active panel only**,
  starting at the H2 (`absolute left-0 top-[4px] bottom-[24px] w-[3px]`). Inspired by
  supermemory.ai's section enclosure.
- **Card variants:** `default` for cards in a grid (`why-us.tsx`, `comparison.tsx`),
  `featured` with an `accentColor` for highlighted single cards (mobile services fallback,
  active-pillar hint), `quote` for testimonials.
- **Phrase stamp** (`phrase-stamp.tsx`): used in hero and problem section for high-impact
  per-word reveals.

### SVG signature visuals
- **Hero orb:** `app/globals.css:115-183` (label HUD) + canvas component. Brand-blue + accent
  orange "instrumented" reveal label.
- **Services trefoil:** `services-trefoil.tsx` + `services-glyphs.tsx`. Hub-and-spoke topology,
  per-pillar SVG glyphs (Web3 hex lattice, AI Agents halo+rings+dots, Product Studio stacked
  iso-planes), `<foreignObject>`-wrapped buttons. Inactive uses two-tone slate.

---

## Per-section override rule
The master plan locks the visual grammar above. Sections may deviate when a signature visual
demands it (e.g., the trefoil's atmospheric backdrop is a section-level addition, not a global
pattern). When deviating:

1. Add a `## Deviations from master plan` heading to the section's spec
   (`docs/superpowers/specs/<date>-section-<name>.md`) and list each change with rationale.
2. Reference the master spec it deviates from
   (`docs/superpowers/specs/2026-05-01-homepage-restructure-master-design.md`).
3. Honor hard constraints regardless: SSR/SEO viability, ARIA semantics, mobile fallback,
   `prefers-reduced-motion`, brand color discipline.

Deviation logs already exist for:
- `2026-05-04-section-services-design.md` — services trefoil polish passes #1 and #2.
- `2026-05-02-section-hero-redesign.md` — hero orb HUD.

---

## Decisions Log
| Date       | Decision                                                                | Rationale                                                                            |
|------------|-------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| 2026-05-06 | DESIGN.md created from shipped state                                    | Single source of truth was missing; consolidating tokens, primitives, motion grammar. |
| 2026-05-05 | Services right column adopts boxing pattern (1px grey + colored bar from H2) | supermemory.ai-style enclosure for sharpness; pillar accent moves into panel only. |
| 2026-05-05 | Trefoil polish #2 — 120px glyphs, atmospheric backdrop, halo, traveling pulse dot | Original 80px glyphs + 0.10 spokes read as toy diagram at section scale.       |
| 2026-05-04 | Trefoil polish #1 — Swiss-engineering motion grammar, two-tone slate inactive    | Dashed-particle/scale-up-assembly looked cheap; one-shot motion locked.            |
| 2026-04-28 | Project-wide design baseline locked                                     | Master plan: Satoshi + JetBrains Mono, brand `#204AF8`, accent `#F6851B`, AI `#10b981`. |
