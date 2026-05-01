# Section Spec — Hero Redesign

Supersedes the typography-only refactor in `2026-05-02-section-hero.md`. Inherits the master plan (`2026-05-01-homepage-restructure-master-design.md`).

## Why this exists

The Session 3 token-migration produced a technically-correct hero that visually broke at every viewport: H1 wrapped to 5 lines on a 1440 laptop (text width starved by `max-w-[680px]` minus `xl:px-[128px]` = ~424px usable area), copy and orb floated in disconnected tracks on ultrawide, blockquote and body lead were visually identical, and the right column had no semantic anchor.

This spec rewrites the hero in two phases:

- **Phase 1 — Layout, typography, copy.** Self-contained refactor of `components/sections/hero.tsx`. Independent of orb work.
- **Phase 2 — Orb density (ASCII filler glyphs).** Modifies `components/hero-orb/orb-scene.tsx`. Service nodes + HUD untouched.

Phases can ship in the same session or sequentially. Phase 2 is deferrable.

## Phase 1 — Layout, typography, copy

### Layout strategy

- **Section wrapper:** `min-h-screen grid grid-cols-[60fr_40fr] bg-bg-subtle`. Section caps at `max-w-[1600px] mx-auto` so ultrawide doesn't open a dead zone between columns.
- **Grid shift 55/45 → 60/40:** the copy is the load-bearing element; the orb is a companion. Giving copy more room fixes the H1 wrap *and* tightens the visual coupling between sides.
- **No `max-w-[680px]` on the inner copy stack.** The track itself does the constraining. Inside the column, content uses the full width minus padding.
- **Horizontal padding scale (left column):** `px-[24px] md:px-[48px] lg:px-[96px] xl:px-[128px]` — the master-plan global scale, unchanged. The H1 fits because the inner stack drops `max-w-[680px]` (60% of the capped 1600 = 960px column, minus 128px×2 padding = 704px content area at xl). Aligns hero copy left-edge with the nav logo for a clean vertical line down the page.
- **Vertical:** `py-[96px]`. With `min-h-screen` + the column being a flex column with `justify-center`, the 96px sets a floor and excess viewport height becomes breathing room.
- **Right column (orb):** `relative overflow-hidden flex items-center justify-center min-h-screen`. **Divider line removed** — the contrasting empty space + the orb's own gravity are enough; a faint border was doing no work.
- **Mobile stop-gap (`< lg` / `< 1024px`):** the 60/40 grid collapses to a single column. Orb stacks below the copy at `60vh` height (instead of `min-h-screen`), preserving the interaction without crushing it. Section becomes `flex flex-col` with copy on top, orb below. Holds the line until the dedicated mobile-pass session does a real responsive design.

### Scan order

The hero has multiple high-contrast elements. Intended scan path:

**H1 → AEO blockquote → primary CTA → orb → eyebrow chip → body lead → micro-copy.**

The eyebrow is a *label*, not an entry point — it sits below the H1's apparent weight despite being the topmost element. Body lead is intentionally quieter than the blockquote because the blockquote is the load-bearing definition. Implementation should preserve this order; if visual hierarchy starts competing (e.g., eyebrow chip becomes too saturated), the eyebrow loses, not the H1.

### Typography hierarchy (revised)

| Role | Treatment |
|---|---|
| Eyebrow chip | `bg-bg`, `border border-border`, `rounded-sm`, `px-3 py-[5px]`. Inside: 7px brand-blue dot + `<Eyebrow>` text. Unchanged from Session 3. |
| H1 | `text-[clamp(40px,5vw,72px)] font-bold tracking-[-0.04em] leading-[1.02] text-dark`. **Deviation from master plan** (locked at `clamp(36px,4.5vw,64px)`): the new H1 is 3 short period-terminated phrases instead of one long phrase, so it earns the bigger ceiling without overflowing. Floor lifted 36→40px because the smaller phrases need presence at mobile-ish widths. Document here so future section refactors don't propagate the bump — H1 stays a hero-only treatment. |
| AEO blockquote | **Promoted.** `border-l-[3px] border-brand pl-5 py-1`. Inner `<p>`: `text-base font-medium text-dark leading-[1.6] tracking-[-0.015em] max-w-[560px]`. **16px text-dark + weight-500 + 3px brand rail** outweighs the body lead without introducing a new size to the locked type scale. Carries the `cite` attribute pointing to `/about` for AEO/GEO semantic credit. |
| Body lead | **Demoted.** `text-sm text-gray-light leading-[1.6] tracking-[-0.005em] max-w-[480px]`. Smaller, lighter, less weight competing with the blockquote. |
| CTA row | Unchanged: `flex items-center gap-3`. |
| Micro-copy | Unchanged: `text-xs text-gray-light tracking-[-0.01em]`. |

Vertical rhythm between blocks: eyebrow → 28px → H1 → 24px → blockquote → 24px → body lead → 32px → CTAs → 20px → micro-copy. Use arbitrary-value `mb-[Npx]` per master-plan convention.

### Copy (SEO + AEO + GEO)

**Eyebrow** (unchanged):
> Web3 Development · AI Agents · Product Studio

**H1** (locked):
> Web3 protocols.\
> AI agents.\
> Shipped.

Rendered as three lines, each its own period-terminated phrase. Last word "Shipped." in `text-brand` for the highlight (replaces the old "& AI Agent Studio" highlight). The verb at the end carries the brand voice ("ships, not just consults") and gives the H1 its rhythm.

**AEO blockquote** (rewritten — single sentence, entity-led, citation-friendly):
> Metaborong is a Web3 and AI agent development studio that ships DeFi protocols, autonomous AI systems, and custom SaaS products for founders and crypto-native teams across the US and Europe.

Why this works for AEO/GEO:
- Names "Metaborong" once at sentence-start — strong entity signal for `What is Metaborong?` queries
- Categories enumerated cleanly (`Web3 development studio`, `AI agent studio`) — answers `who builds X` queries
- Outputs enumerated (`DeFi protocols`, `autonomous AI systems`, `SaaS products`) — gets cited on `companies that build [Y]` queries
- Audience + geography in one clause — answers `for [Z] in [region]` queries
- Single sentence, ~35 words, no hedge phrases — optimal for LLM chunking

**Body lead** (trimmed, demoted role):
> For founders who need a technical partner that ships — not an agency that pitches.

One sentence, sets the human voice, picks up "ships, not just consults" positioning from the locked competitive frame.

**Micro-copy** (unchanged):
> No pitch decks. No retainers. Direct from founders.

**CTAs** (unchanged):
> [Start a Project →] [See Our Work]

### Inline visual polish notes

- The H1 highlight word "Shipped." is `text-brand` only — no underline, no slash, no decoration. Color does the work.
- Blockquote is *not* a `<Card variant="quote">` — that primitive is reserved for testimonials with italic body and 32px padding. The hero blockquote is an AEO definition: upright, dark text, brand left-rail. Master-plan card-quote convention does not apply here.
- Eyebrow chip dot bumped 7px → 8px, brand-blue, `rounded-sm`. Makes the chip feel anchored.

### Interaction states

- **Orb load** — `<HeroOrb />` is dynamically imported with `loading: () => null`. The right column is empty for ~200–800ms after first paint. Acceptable; no skeleton needed (the empty `bg-bg-subtle` track is visually quiet).
- **Scroll-down affordance** — at the bottom of the left column, a small chevron (`lucide-react ChevronDown`, 16px, `text-gray-light`) above the word "Scroll" (10px, `tracking-[0.15em]`, uppercase, `text-gray-light`). 8px vertical bounce loop, 1.6s cubic-bezier. Fades to `opacity-0` (300ms) when `window.scrollY > 100`. Tells users there's content below the fold without visual noise.
- **CTA hover/focus** — inherited from `<Button>` primitive; not overridden. Focus ring follows primitive convention (`focus-visible:ring-2 ring-brand ring-offset-2`).
- **Eyebrow chip** — static; not interactive.

### Accessibility

- **Reduced motion** (`@media (prefers-reduced-motion: reduce)`):
  - Kill orb auto-rotate (set `AUTO_SPEED = 0` in `orb-scene.tsx` when reduced-motion preferred)
  - Kill Phase 2 edge pulse + drift particles entirely
  - Keep service node pulse (small ±7% scale loop) — it's a visual signal that *those nodes are interactive*, not pure decoration. Removing it would degrade discoverability.
  - HUD label entrance keeps its 200ms fade-in but loses any decorative scan-line/glitch animation
  - Scroll-down chevron bounce → static (still visible, just doesn't bounce)
- **Service node keyboard access** — service nodes get `tabIndex={0}` and a focus ring (1px brand-blue glow at 0.6 alpha). Pressing Enter/Space triggers the same HUD label as hover. Implementation: add a keyboard handler that calls the existing `onHover` callback. Keyboard users get the same disclosure as pointer users.
- **Color contrast** — verify before ship: `text-gray` (`#676767`) on `bg-bg-subtle` (`#f5f7ff`) ≈ 4.95:1, passes AA for 14px body. `text-gray-light` (`#999`) on `bg-bg-subtle` ≈ 2.85:1, **fails AA** — only acceptable for the 12px micro-copy if it's decorative/non-essential. Document the failure or bump micro-copy to `text-gray`.
- **Blockquote semantics** — `<blockquote cite="/about">` for AEO/GEO entity link; visually unchanged but gives crawlers a structured pointer.

## Phase 2 — Orb polish stack (ASCII glyphs + edge pulse + drift particles)

Reference: `components/hero-orb/orb-scene.tsx`. Existing scene has 214 total nodes — 14 interactive service nodes + ~200 decorative filler dots, all rendered as point geometries on a Fibonacci sphere. Center has an "M" mark, color-coded service nodes (`#F6851B` Web3, `#4dff9a` AI, `#204AF8` Product) trigger an HTML HUD label on hover.

Phase 2 stacks three additive layers. Each is independent; if any layer regresses FPS or reads wrong, it can be disabled via a config constant without affecting the others.

### Layer 1 — Goal: ASCII glyph filler

Replace **only the ~200 filler dots** with ASCII glyphs rendered as `THREE.Sprite`s. The 14 service nodes stay as glowing dots. HUD label feature is untouched.

### Glyph treatment

- Glyph alphabet: `·`, `+`, `*`, `◦`, `╳`, `█` (weighted toward `·` and `+` so the cloud reads as a soft particle field, with denser glyphs as accent)
- Each filler node:
  - `THREE.Sprite` with material from a per-glyph canvas texture (rendered offscreen at mount, cached)
  - Color: `#c8d8ff` (dim blue-white) at ~0.55 opacity — sits behind service nodes in apparent depth
  - Size: 14–22px on screen, varied by glyph (denser glyphs render larger)
  - Font: `JetBrains Mono` 700 — matches existing HUD label typography
- Filler count: 200 → **280** for denser cloud. The Fibonacci distribution stays the same, just more samples. Drop back to 200 only if 4K FPS regresses (see performance budget).

### Layer 2 — Edge pulse animation

The existing edge `LineSegments` mesh draws ~1000 connection lines between nearby Fibonacci points (each point connects to its 5 nearest neighbours). Adds a subtle "pulse" that travels along a random subset of edges to make the network feel alive.

- **Frequency:** ~1 pulse fires every 4s (sample interval, not strict)
- **Selection:** each pulse picks a random connected chain of 3–5 edges starting from a random vertex
- **Color:** brand-blue (`#204AF8`) at `0.6` alpha at peak
- **Timing:** 800ms total — `200ms` ease-in fade-up to peak alpha, `600ms` ease-out fade-down
- **Implementation:** override per-vertex color in the existing edge `BufferGeometry` `color` attribute for the pulsing edges only, restore baseline on cycle end. Uses an additional `Float32Array` overlay rather than mutating the depth-shaded baseline.
- **Reduced motion:** disabled entirely

### Layer 3 — Background drift particles

A separate, sparse field of tiny dots living *behind* the orb's depth-bounded sphere — gives the right column ambient atmosphere and frames the orb without competing with it.

- **Count:** 120 particles
- **Geometry:** `THREE.Points` with `PointsMaterial`, size `0.008` units (smaller than blue filler nodes)
- **Distribution:** uniform random within a box `2.4 × 2.4 × 2` units, *behind* the sphere on the z-axis (z range biased to `[-1.0, 0.2]` so most sit behind the orb)
- **Color:** `#c8d8ff` at `0.3` alpha
- **Motion:** each particle drifts at `0.02` units/s along a fixed random direction; wraps to opposite side of the box when it leaves bounds
- **Render order:** `renderOrder = -1`, depth-write off, sits behind the orb group
- **Reduced motion:** disabled entirely (not even visible — pure atmosphere, not signal)

### Service node treatment (unchanged)

- Color-coded glowing `THREE.Points` particles (Layer 1 doesn't touch them)
- Hover/keyboard focus → existing HUD label `.orb-label` HTML element
- Auto-rotate + drag interaction unchanged
- Pulse animation (small scale loop) preserved even under `prefers-reduced-motion` because it signals *interactivity*, not decoration

### What does NOT change

- Sphere geometry, Fibonacci distribution, rotation, drag controls
- Service node count, colors, HUD label, animations in `globals.css`
- Center M-mark
- The `<HeroOrb />` API consumed by `hero.tsx`

### Performance budget

- Sprite textures generated once at scene init (one canvas per unique glyph, not per node) — ~6 textures total, cached
- Edge pulse uses no new geometry — overlay-only on the existing color buffer
- Drift particles: 120 verts, single draw call — negligible
- Re-evaluate FPS on 4K viewports; if degraded, disable drift first, then drop ASCII count back to 200, edge pulse last (cheapest of the three)

## Verification

**Phase 1:**
- `pnpm build` clean
- `pnpm dev` at 1440×900: H1 renders on 3 clean lines, no wrapping mid-phrase. Copy and orb visually coupled.
- `pnpm dev` at 2560×1080: section caps at 1600px, copy and orb stay near each other, no dead zone
- `pnpm dev` at 375×812 (mobile viewport): grid collapses to single column, orb stacks below copy at 60vh, no horizontal scroll
- Scroll-down chevron visible at bottom of left column on first viewport, fades after scrolling 100px
- Tab order through hero: eyebrow → H1 (skip, not focusable) → blockquote (skip) → primary CTA → ghost CTA. Service nodes reachable after CTAs; Enter/Space opens HUD.
- `prefers-reduced-motion: reduce` (DevTools emulation): orb stops auto-rotating, scroll chevron static, service node pulse remains
- `grep 'style={{' components/sections/hero.tsx` → empty
- `grep '#[0-9A-Fa-f]\{3,\}' components/sections/hero.tsx` → empty
- Blockquote visually outweighs body lead (dark + medium-weight + brand rail)

**Phase 2:**
- `pnpm dev`: ASCII glyphs visible as characters at viewport scale, service nodes still glow distinctly, hover/keyboard HUD still triggers, no console errors
- Edge pulse fires every ~4s, brand-blue, 800ms total, smooth fade — not jittery
- Drift particles visible behind orb, slow drift, never occlude service nodes
- `pnpm build` clean
- 60fps on a 1440×900 laptop, ≥45fps on 4K
- `prefers-reduced-motion: reduce`: edge pulse and drift particles disabled, ASCII filler still visible (static glyphs are not motion)

## Out of scope

- `<Section>` primitive horizontal-padding update (separate cleanup task — the primitive is stale relative to Session 2 nav refactor)
- Full mobile design pass for the hero (only the stop-gap collapse rule lands here; real mobile design is its own session)
- Three.js orb structural rewrite — only filler material, edge color overlay, and a new drift-particle layer change; sphere + service nodes + HUD are untouched
- Trust bar, problem section, or any subsequent section
