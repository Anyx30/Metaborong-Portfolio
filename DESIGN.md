# Design System — Metaborong Website

## Mission
Single source of truth for visual decisions on metaborong.com. Token-driven, extracted
from shipped state, optimized for consistency across sections built session-by-session.
Read this file before any UI change. If a section deviates, log it under
`docs/superpowers/specs/<date>-<section>.md` per the override rule below.

## Brand
- **Product:** Metaborong (metaborong.com)
- **Audience:** Web3 / AI / SaaS founders evaluating a senior dev studio
- **Surface:** Marketing site
- **Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4
- **Position:** Boutique studio between large agencies and freelancer marketplaces

## Aesthetic Direction
- **Direction:** Swiss-engineered modernism with technical/blueprint accents.
- **Decoration level:** Intentional — typography and structure carry most of the load;
  signature visuals (hero orb, services trefoil) carry the rest. No ambient blobs, no
  decorative gradients.
- **Mood:** Senior team, real engineering, no posturing. Tight grid, deliberate negative
  space, one signature visual per section, motion that happens once and stops.
- **Posture:** "Designed, not assembled." Every line in the SVGs has a structural job.
  Every spacing value comes from the scale below.

## Writing Tone
Direct, confident, technically precise. No marketing inflation — no "revolutionary",
"game-changing", or "best-in-class". Every claim verifiable. Body copy speaks to
engineers, not procurement. Section intros are citation-ready (130+ words for AEO
targets where applicable).

### Copy density rules
- **Primary CTAs must be ≤3 words.** Verb-first, action hints at outcome. Avoid the
  `Start | See | Explore | View` family — passive marketing verbs. Prefer
  `Get | Open | Read | Email | Talk | Ship`.
- **Section feature bullets must be ≤16 words.**
- **Default sentence target: 12–14 words.** Use em-dashes and colons in place of
  connective phrases. Telegraphic > flowery.
- **AEO blockquote: 40–60 words** with at least two verifiable facts (numerical,
  geographic, or organizational). Open with the entity-definition pattern
  (`X is a Y that Z`).

---

## Accessibility

- **Target:** WCAG 2.2 AA across all interactive surfaces.
- **Keyboard-first.** Every interactive element must be reachable and operable via
  keyboard alone. Tab order must follow visual reading order.
- **Focus-visible required.** Every interactive primitive must render a focus ring on
  `:focus-visible` (token below).
- **Contrast.** Body copy must meet AA (≥4.5:1). The `color.text.tertiary` token (`#999`)
  must never carry body copy — it is reserved for tertiary labels, disabled states, and
  decorative text where contrast is not load-bearing.
- **Reduced motion.** `prefers-reduced-motion: reduce` must short-circuit every
  non-essential animation. See Motion section.

### Focus ring token
```
focus.ring   = 2px solid var(--color-brand)
focus.offset = 2px
```
Applied via `:focus-visible` only — never `:focus`. Mandatory on `<Button>`, `<Card>`
(when interactive), `<a>`, accordion tabs, form controls.

---

## Typography

Loaded via Fontshare + Google Fonts in `app/globals.css:2-6`.

- **Display + Body:** Satoshi (300, 400, 500, 700, 900) — `--font-brand`.
- **Mono / data / eyebrows:** JetBrains Mono 400 — `--font-mono`.
- **Fallback:** Space Grotesk (system fallback only — never specify directly).

CSS vars (`globals.css:40-41`):
```css
--font-brand: 'Satoshi', 'Space Grotesk', sans-serif;
--font-mono:  'JetBrains Mono', 'Courier New', monospace;
```

Applied globally on `html` (`globals.css:79`). Must not add a second
`html { @apply font-sans }` elsewhere — Tailwind's default sans stack overrides Satoshi.

### Type scale

| Role             | Alias                 | Size  | Weight | Tracking | Use                             |
|------------------|-----------------------|-------|--------|----------|---------------------------------|
| Hero H1          | `font.size.display`   | 96px  | 900    | -0.04em  | Page-driver                     |
| Section H2       | `font.size.h2`        | 56px  | 700    | -0.03em  | "What we build", "The problem"  |
| Card / Panel H3  | `font.size.h3`        | 20px  | 700    | -0.025em | Pillar headlines, FAQ           |
| Body large       | `font.size.lg`        | 18px  | 400    | -0.01em  | Lede paragraphs                 |
| Body             | `font.size.base`      | 16px  | 400    | -0.005em | Default                         |
| Small / meta     | `font.size.sm`        | 14px  | 400    | -0.005em | Card body, child link descriptions |
| Caption          | `font.size.xs`        | 13px  | 400    | -0.005em | Description text                |
| Eyebrow / number | `font.size.eyebrow`   | 11–13px font-mono, uppercase, `tracking-[0.10em]` to `tracking-[0.18em]`     |
| Body line-height | —                     | 1.5–1.75 (1.75 for prose blocks)                                              |

The `Eyebrow` primitive (`components/ui/eyebrow.tsx`) is the canonical eyebrow style:
`text-[11px] font-bold uppercase tracking-[0.1em] leading-none text-gray-light`.

---

## Color

Tokens defined in `@theme` block, `globals.css:17-37`. Must reference by token (alias or
CSS var), never raw hex.

### Semantic alias layer

Use the alias when speaking about role; map to the CSS var when writing code. Both are
canonical.

#### Brand
| Alias                 | CSS var          | Hex       | Use                                          |
|-----------------------|------------------|-----------|----------------------------------------------|
| `color.brand.primary` | `--color-brand`  | `#296ff0` | Web3 pillar, primary CTA, hub                |
| `color.brand.accent`  | `--color-accent` | `#F6851B` | Product Studio pillar, HUD                   |
| `color.brand.ai`      | `--color-ai`     | `#10b981` | AI Agents pillar (only)                      |

#### Text
| Alias                  | CSS var               | Hex       | Use                                       |
|------------------------|-----------------------|-----------|-------------------------------------------|
| `color.text.primary`   | `--color-dark`        | `#303030` | Body, headings                            |
| `color.text.secondary` | `--color-gray`        | `#676767` | Secondary text                            |
| `color.text.tertiary`  | `--color-gray-light`  | `#999999` | Tertiary, disabled — never body copy      |
| `color.text.divider`   | `--color-gray-subtle` | `#D9D9D9` | Quiet dividers                            |
| `color.text.inverse`   | `--color-off-white`   | `#FEFEFE` | Text on dark surfaces                     |

#### Surface
| Alias                  | CSS var               | Hex       | Use                                       |
|------------------------|-----------------------|-----------|-------------------------------------------|
| `color.surface.base`   | `--color-bg`          | `#ffffff` | Default canvas                            |
| `color.surface.subtle` | `--color-bg-subtle`   | `#f5f7ff` | Section alternation, secondary buttons    |
| `color.surface.raised` | `--color-bg-raised`   | `#fafbff` | Elevated cards on subtle backgrounds *(NEW — add to `globals.css` when first consumed)* |
| `color.surface.dark`   | `--color-canvas`      | `#0a0a0a` | Hero canvas, contact CTA                  |

#### Border
| Alias                   | CSS var                 | Hex       | Use                                     |
|-------------------------|-------------------------|-----------|-----------------------------------------|
| `color.border.default`  | `--color-border`        | `#e5e7eb` | 1px borders, card outlines              |
| `color.border.subtle`   | `--color-border-subtle` | `#f3f4f6` | Internal dividers, hover backgrounds    |

### Pillar color rule
Pillars own their color globally — Web3 is brand-blue, AI is `#10b981`, Product Studio
is `#F6851B`. Must not introduce new pillar-tinted UI without updating `services-data.ts`.

### Inactive / structural slate
Used for inactive glyphs and dashed spokes in `services-glyphs.tsx`. Component-local,
not global tokens:
- Stroke: `#cbd5e1` · Fill: `#e2e8f0` · Dot/accent: `#94a3b8`

### Dark mode
A `.dark` token block exists (`globals.css:303-335`) but is not currently activated. The
site ships light-only. If reintroduced, surfaces must be redesigned — must not just
invert.

---

## Spacing

Custom scale defined in `@theme`, `globals.css:43-53`. Must use these tokens via
`gap-[Npx]`, `p-[Npx]`, `mb-[Npx]` etc. Must not invent intermediate values.

| Alias       | Token | px  | Use                                         |
|-------------|-------|-----|---------------------------------------------|
| `space.1`   | `1`   | 4   | Tight inner gaps                            |
| `space.2`   | `2`   | 8   | Icon-to-text gap                            |
| `space.3`   | `3`   | 12  | Tight rhythm                                |
| `space.4`   | `4`   | 16  | Default body spacing                        |
| `space.5`   | `5`   | 24  | Section internal padding                    |
| `space.6`   | `6`   | 32  | Card padding, large gap                     |
| `space.7`   | `7`   | 48  | Section column gaps                         |
| `space.8`   | `8`   | 64  | Major block separators                      |
| `space.9`   | `9`   | 96  | Section vertical padding (default)          |
| `space.10`  | `10`  | 128 | XL breakpoint horizontal padding            |

## Radii

| Alias        | Token       | px  | Use                    |
|--------------|-------------|-----|------------------------|
| `radius.sm`  | `radius-sm` | 4   | Small chips, inputs    |
| `radius.md`  | `radius-md` | 8   | Buttons, panels, boxes |
| `radius.lg`  | `radius-lg` | 12  | Default cards          |
| `radius.xl`  | `radius-xl` | 20  | Featured cards         |

**Card radius rule.** `<Card variant="default">` and `<Card variant="quote">` must use
`radius.lg`. `<Card variant="featured">` must use `radius.xl`. No exceptions.

## Elevation / Shadow

Use sparingly — Swiss-engineering posture is borders-first. Shadows are reserved for
surfaces that genuinely lift off the canvas (hover affordance on cards, overlays, modals).
*(Tokens to be added to `globals.css` when first consumed.)*

| Alias       | Value                                                                          | Use                          |
|-------------|--------------------------------------------------------------------------------|------------------------------|
| `shadow.sm` | `0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)`                 | Card hover                   |
| `shadow.md` | `0 4px 12px -2px rgb(0 0 0 / 0.08), 0 2px 6px -1px rgb(0 0 0 / 0.04)`          | Dropdown menus, popovers     |
| `shadow.lg` | `0 12px 32px -8px rgb(0 0 0 / 0.12), 0 6px 16px -4px rgb(0 0 0 / 0.06)`        | Modals, mega-menu            |

---

## Layout

- **Section primitive:** `components/ui/section.tsx` — wraps every section.
  - Vertical padding: `py-[96px]` (`space.9`).
  - Horizontal padding: `px-[24px] md:px-[48px] lg:px-[96px] xl:px-[128px]`.
  - Max-width variants: `wide` (1120), `xwide` (1280), `narrow` (880), `prose` (720).
  - Auto-wraps children in `<Reveal>`.
- **Canonical horizontal padding token:** `var(--section-px)` (`app/globals.css`).
  Same value as the Section primitive's responsive class chain (24 → 48 → 96 → 128 at
  sm/md/lg/xl). Inline-style sections and any surface that can't consume the Tailwind
  class **must** use this CSS variable — never a hardcoded `padding: '96px 80px'`.
- **Two-column sections** (services, founders, contact) use
  `grid-cols-1 lg:grid-cols-2 gap-[48px]`.
- **Mobile breakpoint discipline.** Mobile fallbacks must render server-side. Must not
  use `display:none` to hide content that has SEO value. See `services.tsx` — `<Card>`
  list shown on mobile while `services-trefoil.tsx` shows on lg+.

---

## Motion

Locked grammar. Originally specified in (now archived)
`archive/specs/2026-05-04-session-5.5-global-motion.md`.

### Core rules
1. **One-shot.** Must not loop indefinitely outside three approved exceptions:
   the trust-bar marquee, the orb HUD label cursor blink, and the hero scroll-cue
   bounce (auto-fades at `scrollY > 100`, so effectively at-top-only).
2. **IntersectionObserver-gated first paint.** Sections must be invisible at SSR and
   fade in once viewport enters them. Pattern lives in `components/ui/reveal.tsx` (used
   everywhere via `<Section>`) and in `phrase-stamp.tsx` for staggered text reveals.
3. **`prefers-reduced-motion: reduce` always honored.** Reveal must short-circuit to
   visible. SVG sections must kill animations via
   `@media (prefers-reduced-motion: reduce)`.
4. **CSS over JS for media queries.** Must not use `matchMedia` if a CSS query suffices.
   SVG sections use inline `<style precedence="default">` blocks to avoid hydration cost.

### Duration tokens

| Alias                         | Value    | Use                                  |
|-------------------------------|----------|--------------------------------------|
| `motion.duration.instant`     | 150ms    | Hover state changes, tooltip in/out  |
| `motion.duration.fast`        | 250ms    | Button press, accordion expand       |
| `motion.duration.base`        | 400ms    | Reveal, default transitions          |
| `motion.duration.slow`        | 620ms    | Stroke-draw, halo-in                 |
| `motion.duration.deliberate`  | 900ms    | Pulse-dot travel, spoke s-curve      |
| `motion.duration.marquee`     | 24000ms  | Trust-bar (linear, infinite)         |

### Easing palette

| Curve                                       | Use                                  | Typical duration  |
|---------------------------------------------|--------------------------------------|-------------------|
| `cubic-bezier(0.16, 1, 0.3, 1)` (out-expo)  | Reveal, halo-in, hero scroll         | base–slow         |
| `cubic-bezier(0.32, 0, 0.16, 1)` (s-curve)  | Spoke transitions, pulse travel      | base–deliberate   |
| `cubic-bezier(0.65, 0, 0.35, 1)` (in-out)   | Stroke-draw on glyph activation      | slow              |
| `ease-out`                                  | Atmospheric backdrop fade            | slow              |
| `linear`                                    | Trust-bar marquee, orb scan          | marquee           |

### Patterns currently in use
- **Reveal** (`components/ui/reveal.tsx`): `opacity 0→1` + `translateY(8px→0)` over
  `motion.duration.base` on viewport entry. Optional `delay` for staggered reveals.
- **phrase-stamp** (`components/sections/phrase-stamp.tsx`): per-word stagger, IO-gated,
  600ms after entry; reference for any first-paint-with-delay pattern.
- **Services trefoil** (`components/sections/services-trefoil.tsx`):
  - Atmospheric backdrop opacity fade (`0→1`, slow ease-out) on first activation.
  - Stroke-draw on glyph activation (`stroke-dashoffset` per `[data-draw]`, slow in-out).
  - Halo behind active node (`opacity 0→0.10`, `scale 0.7→1`, base with 200ms delay).
  - Pulse dot travels hub→active-node via `transform: translate(var(--dx), var(--dy))`,
    deliberate s-curve.
  - Spoke style transition (color, opacity, width), instant.
- **Trust-bar marquee** (`globals.css:62-67`): `translateX(0 → -50%)` linear marquee
  infinite. Only approved infinite animation.

---

## Components

### Primitives (`components/ui/`)

| File                  | Variants                                     | Notes                                                                                              |
|-----------------------|----------------------------------------------|----------------------------------------------------------------------------------------------------|
| `section.tsx`         | bg: default/subtle/dark; mw: wide/narrow/prose | Wraps every section. Auto-Reveal.                                                                  |
| `card.tsx`            | default / featured / quote                   | `featured` adds 3px left border, takes `accentColor` prop. Hover: -0.5 translate, brand/30 border, `shadow.sm`. |
| `button.tsx`          | primary / ghost / secondary; sm / md / lg    | Inline-style. Brand-blue primary.                                                                  |
| `eyebrow.tsx`         | as: span/div/p                               | 11px bold uppercase 0.1em tracking, gray-light.                                                    |
| `reveal.tsx`          | optional `delay`                             | The IO+motion gate. Used by `<Section>`.                                                           |
| `section-header.tsx`  | —                                            | Eyebrow + H2 + lede composition.                                                                   |
| `logo.tsx`            | sm / md                                      | Brand-blue square + wordmark.                                                                      |
| `badge.tsx`           | —                                            | Pill chips.                                                                                        |

### Required component states
Every interactive primitive must document and implement these seven states:

| State              | Trigger             | Visual                                                                       |
|--------------------|---------------------|------------------------------------------------------------------------------|
| **default**        | Idle                | Token-driven base                                                            |
| **hover**          | Pointer over        | Token-driven hover (e.g., card `-0.5 translate + brand/30 border + shadow.sm`)|
| **focus-visible**  | Keyboard focus      | `2px solid var(--color-brand)` ring, `2px` offset                            |
| **active**         | Pressed             | Pressed-down feel (slight scale or darker fill)                              |
| **disabled**       | `disabled` attr     | Opacity ~0.5, `cursor: not-allowed`, no hover                                |
| **loading**        | Async work          | Spinner or pulsing skeleton; trigger disabled                                |
| **error**          | Validation/failure  | Brand-coded error fill or border, screen-reader-announced message            |

### Edge cases (must document per component)
- Long-content overflow (truncation or wrap rule)
- Empty state (placeholder text or skeletal layout)
- Keyboard interaction (Tab, Enter, Space, Esc, Arrow as applicable)
- Pointer interaction (click, hover, drag if applicable)
- Touch interaction (tap target ≥44×44px on mobile)

### Visual signature

Decisions that give the system its specific edge. Restraint-driven, benchmarked against
supermemory.ai (live computed CSS, 2026-05-06).

**Button finish — Bauhaus restraint, single signature mark.**
- Radius: `0` (square corners). No rounding on any button variant.
- No box-shadow on default state. No inset highlights. No gradients. Flat fills only.
- Transition: `var(--duration-instant)` (150ms) on `background-color`, `border-color`,
  `color` only. No `transform` on hover. No shadow growth.
- Hover: bg darkens (~10%) on primary; bg/border tint shift on ghost/secondary. No motion.
- Active: bg darkens further (~15%). No transform.
- Focus-visible: brand ring via global `:focus-visible` rule.
- Type: `15px / weight 600 / -0.01em tracking` (md and lg). `13px` for sm.

**Split-arrow primary signature.** Primary CTAs that include an arrow must use the
two-span split-button pattern: text span (solid brand bg) + arrow span (`bg: rgba(255,255,255,0.10)` overlay) separated by `border-left: 1px solid rgba(255,255,255,0.15)`. The arrow span has its own padding. This is our single distinctive button mark — do not apply to ghost or secondary.

**Tabular numerals.** All buttons (and any numeric UI: counters, prices, tables, stats)
must use `font-feature-settings: 'tnum'` (Tailwind: `tabular-nums`). Numerical alignment
is part of the technical-blueprint posture.

**Micro-interaction discipline.** Buttons and inline links transition at 150ms
(`var(--duration-instant)`). Card hover at 250ms (`var(--duration-fast)`). Reveal /
section enter at 400ms (`var(--duration-base)`). Signature visuals (orb, trefoil) at
620–900ms. Above 900ms is reserved for one-shot signature moments — never on text or buttons.

### Section patterns
- **Services boxing pattern** (`services-trefoil.tsx`, panel column): right-side accordion
  lives in a `rounded-md border border-border bg-white` box. Top eyebrow row shows
  `THREE PILLARS [01 / 03]` with the active number in the active pillar's hue. Each tab
  row gets a `border-b border-border`. The pillar-colored 3px bar lives **inside the
  active panel only**, starting at the H2
  (`absolute left-0 top-[4px] bottom-[24px] w-[3px]`). Inspired by supermemory.ai's
  section enclosure.
- **Card variants:** `default` for grids (`why-us.tsx`, `comparison.tsx`); `featured`
  with `accentColor` for highlighted single cards (mobile services fallback,
  active-pillar hint); `quote` for testimonials.
- **Phrase stamp** (`phrase-stamp.tsx`): used in hero and problem sections for
  high-impact per-word reveals.

### SVG signature visuals
- **Hero orb:** `app/globals.css:115-183` (label HUD) + canvas component. Brand-blue +
  accent orange "instrumented" reveal label.
- **Services trefoil:** `services-trefoil.tsx` + `services-glyphs.tsx`. Hub-and-spoke
  topology, per-pillar SVG glyphs (Web3 hex lattice, AI Agents halo+rings+dots, Product
  Studio stacked iso-planes), `<foreignObject>`-wrapped buttons. Inactive uses two-tone
  slate.

---

## Rules

### Do
- **Must** reference tokens (alias or CSS var), never raw hex/px values.
- **Must** document all seven states for every interactive primitive.
- **Must** render mobile fallbacks server-side when content has SEO value.
- **Must** honor `prefers-reduced-motion: reduce`.
- **Must** apply the focus-visible ring on every interactive primitive.
- **Must** keep tap targets ≥44×44px on touch surfaces.
- **Should** prefer borders over shadows for separation.
- **Should** prefer CSS over JS where a media query suffices.
- **Should** add a section-level deviation log entry before breaking master grammar.

### Don't
- **Must not** introduce one-off spacing or typography exceptions.
- **Must not** hardcode horizontal section padding in inline styles (e.g., `padding: '96px 80px'`). Use the Section primitive or `var(--section-px)`.
- **Must not** use `color.text.tertiary` (#999) for body copy — only tertiary/disabled.
- **Must not** add a second `html { @apply font-sans }` — Tailwind override breaks Satoshi.
- **Must not** use `display:none` to hide content that has SEO value.
- **Must not** introduce new pillar-tinted UI without updating `services-data.ts`.
- **Must not** ship infinite animations outside the trust-bar marquee and orb HUD blink.
- **Must not** invert dark mode — surfaces must be redesigned if reintroducing dark.
- **Must not** use `oklab()` or other non-hex notations — use hex via tokens.

---

## Per-section override rule

The master grammar above locks the design baseline. Sections may deviate when a signature
visual demands it (e.g., the trefoil's atmospheric backdrop is a section-level addition,
not a global pattern). When deviating:

1. Add a `## Deviations from master plan` heading to the section's spec at
   `docs/superpowers/specs/<date>-section-<name>.md` and list each change with rationale.
2. Reference this file (`DESIGN.md`) as the master spec.
3. Honor hard constraints regardless: SSR/SEO viability, ARIA semantics, mobile fallback,
   `prefers-reduced-motion`, brand color discipline, focus-visible.

Historical deviation logs (now archived):
- `docs/superpowers/archive/specs/2026-05-04-section-services-design.md` — services
  trefoil polish #1, #2.
- `docs/superpowers/archive/specs/2026-05-02-section-hero-redesign.md` — hero orb HUD.

---

## Authoring workflow

When adding a new section, primitive, or rule to this doc:

1. Restate design intent in one sentence.
2. Define foundations and tokens (use the alias layer).
3. Define component anatomy, variants, interactions, and the seven states.
4. Add accessibility acceptance criteria with pass/fail checks.
5. Add anti-patterns and edge-case handling.
6. End the addition with a QA checklist entry where appropriate.

---

## QA checklist

Run before marking a section shipped.

- [ ] All values use tokens (no raw hex/px)
- [ ] Seven states implemented for every interactive primitive
- [ ] Focus-visible ring renders on keyboard nav
- [ ] Tab order matches visual reading order
- [ ] Body copy contrast ≥4.5:1 (AA)
- [ ] `color.text.tertiary` used only for tertiary/disabled
- [ ] Mobile fallback renders server-side if SEO-relevant
- [ ] `prefers-reduced-motion: reduce` short-circuits all non-essential motion
- [ ] No infinite animations introduced
- [ ] Tap targets ≥44×44px on touch
- [ ] Pillar colors match `services-data.ts`
- [ ] Long-content / empty / error states defined
- [ ] Deviations logged in section spec

---

## Decisions Log

| Date       | Decision                                                                                                                                                  | Rationale                                                                                  |
|------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------|
| 2026-05-19 | **Why-Us redesigned to Figma `mQsbMuw0spVgIu7jXirr3o`/`112:1787`** on the canonical `<Section>` grid; visible copy frozen (SSR-verified diff). Section deviations logged in `docs/superpowers/specs/2026-05-19-section-why-us.md` (raster isometric illustrations + gradient fade, UPPERCASE headings, bordered eyebrow chip, flush zero-radius 3-column card grid, mono kicker = frozen tag). Adds the site's **first third-party embed**: official Clutch widget (always-on, `sr-only` SEO/a11y fallback, `aria-hidden` visual) replacing the static 4.9 badge. | Figma-faithful redesign; Clutch text→widget user-directed; the `sr-only` fallback satisfies the copy-frozen + a11y hard constraints; deviations sanctioned via the override rule. |
| 2026-05-19 | Founders section redesigned (Figma `mQsbMuw0spVgIu7jXirr3o` / `142:516`): black placeholder → light team E-E-A-T anchor on the canonical `<Section bg=default maxWidth=xwide>` grid. Hero-consistent eyebrow chip; H2 with brand-blue "the work"; A3 lede kept; 3 founder cards = square portrait/monogram in a pure-CSS dashed **blueprint frame** + name + bordered role chip + bio + a social row of brand-blue **square (radius-0)** LinkedIn + X buttons (shared `SocialButton`; X uses the same `bg-brand`, no X-black; per-button graceful no-URL degrade). DiceBear avatars removed; monogram fallback (`role="img"`) for founders without a photo. Deviations 1–7 logged in `docs/superpowers/specs/2026-05-19-section-founders.md`. | Founders now follows the same Section grammar as nav/hero/every section (edges 128/1312 @1440, 128/1152 @1280, 16/359 @375, no overflow). The team/trust section finally carries real E-E-A-T (named, reachable, technical co-founders) instead of placeholder copy. |
| 2026-05-19 | Hero + Nav adopt the canonical `<Section>` grid: content capped to `max-w-[1280px]` inside the `px-[16px] sm:px-[24px] md:px-[48px] lg:px-[96px] xl:px-[128px]` chain. Hero ASCII right-pinned with `lg:justify-end`; eyebrow green dot removed; overlay card 3 reseated `74%/34.8%`→`66%/34%` onto the rightmost bloom. `<header>` + mega-menu strip surfaces stay full-bleed (signature preserved) — only content is capped. **Supersedes the 2026-05-14 hero row below** (`var(--section-px)` / `xl:px-[144px]→128` / ASCII inset-from-right). | Left/right negative space is now identical across nav, hero, and every section at all breakpoints; mobile gutter unified to 16px. Nav/hero follow the same Section grammar as the rest of the page instead of bespoke full-width/inset math. |
| 2026-05-14 | Homepage edge alignment fix — introduced `var(--section-px)` token (24/48/96/128 at sm/md/lg/xl). Migrated 7 inline-style sections + footer from hardcoded `padding: '96px 80px'`. Hero left copy column reduced from `xl:px-[144px]` to `xl:px-[128px]` for alignment with the rest of the page. Hero right column (ASCII video) now inset by `var(--section-px)` from viewport-right edge. | Inline-style sections were rendering 80px on both mobile and desktop (mobile bug + desktop staircase). Aligning all outer edges + reducing mobile to 24px per DESIGN.md. |
| 2026-05-14 | Brand blue refreshed from `#204AF8` → `#296ff0` (Figma source: file `mQsbMuw0spVgIu7jXirr3o`, node `60:910`, "Let's Talk" button + 1px outer ring). Token `--color-brand` updated; Web3 pillar follows. Replaces all hardcoded `#204AF8` hex and matching `rgba(32,74,248,*)` occurrences across components, globals.css, OG image. | Align live build to current Figma source-of-truth. New blue is lighter, more cyan-leaning. Web3 pillar stays unified with brand. |
| 2026-05-06 | DESIGN.md polish pass — semantic alias layer, A11y section, motion duration tokens, shadow scale, surface-raised, focus-visible token, seven-state matrix, Do/Don't rules, Card radius rule, QA checklist, authoring workflow. | Doc craft upgrade benchmarked against supermemory.ai; tightens authoring discipline without visual drift. |
| 2026-05-06 | DESIGN.md created from shipped state                                                                                                                      | Single source of truth was missing; consolidated tokens, primitives, motion grammar.        |
| 2026-05-05 | Services right column adopts boxing pattern (1px grey + colored bar from H2)                                                                              | supermemory.ai-style enclosure for sharpness; pillar accent moves into panel only.          |
| 2026-05-05 | Trefoil polish #2 — 120px glyphs, atmospheric backdrop, halo, traveling pulse dot                                                                         | Original 80px glyphs + 0.10 spokes read as toy diagram at section scale.                    |
| 2026-05-04 | Trefoil polish #1 — Swiss-engineering motion grammar, two-tone slate inactive                                                                             | Dashed-particle/scale-up-assembly looked cheap; one-shot motion locked.                     |
| 2026-04-28 | Project-wide design baseline locked                                                                                                                       | Master plan: Satoshi + JetBrains Mono, brand `#204AF8`, accent `#F6851B`, AI `#10b981`.     |
