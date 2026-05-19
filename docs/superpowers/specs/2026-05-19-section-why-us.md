# Section spec — Why-Us redesign (Figma-driven, copy FROZEN)

- **Date:** 2026-05-19
- **Section:** `components/sections/why-us.tsx` (`WhyUsSection`)
- **Context:** SESSIONS.md Context A1 (redesign precedent, Session 13), copy steps removed.
- **Workflow source:** `~/.claude/plans/i-want-to-work-virtual-eclipse.md` →
  "Workflow — Why-Us (Terminal A): A1 redesign, **copy FROZEN**".
- **Master spec:** `DESIGN.md` (this spec logs deviations under the override rule).
- **Figma node:** `https://www.figma.com/design/mQsbMuw0spVgIu7jXirr3o/Metaborong-Portfolio?node-id=112-1787`
  (fileKey `mQsbMuw0spVgIu7jXirr3o`, node `112:1787`).

## Hard constraint — Copy: FROZEN — no text changes

Every copy string in `why-us.tsx` is **final** and must render **verbatim** in static
(crawlable) markup. **Zero text changes.** The Step-8 verification includes an explicit
copy-diff assertion. Frozen inventory (the contract the diff asserts against):

- **Eyebrow:** `Why us`
- **H2:** `Why founders choose Metaborong` (the word `Metaborong` is a styled span; the
  text node content is unchanged)
- **Lede:** `Founders pick Metaborong over larger Web3 and AI agencies for three reasons:
  shorter time to a first working version, sharper push-back on the brief, and the
  specialist depth — multichain protocols and AI agent orchestration — most studios
  don't have.`
- **Clutch badge:** `4.9`, `★★★★★` (with `aria-label="5 out of 5 stars"`), `on Clutch`,
  linked to `clutchProfileUrl`
- **Meta stats:** `Reply within 12h`, `4–12 weeks to ship`
- **`reasons[]` (verbatim, incl. `tag`):**
  - `tag: Speed` · `title: First working version in weeks` · body incl. `AbsolveMe`
    link → `https://www.absolveme.ai/`
  - `tag: Product thinking` · `title: We stress-test the brief before we build` · body
    incl. `SunsetML` link → `https://www.sunsetml.com/`
  - `tag: Niche depth` · `title: Multichain Web3 and production-grade AI agents` · body
    incl. `OrbitXPay` → `https://orbitxpay.com/`, `SunsetML` → `https://www.sunsetml.com/`,
    `PredictRAM` → `https://predictram.com/`

`text-transform: uppercase` is presentational only — the source string and rendered DOM
text node are unchanged, so it does **not** constitute a copy change.

## Decisions (brainstorming, user-confirmed 2026-05-19)

1. **Frozen tag labels** → kept as a small uppercase **mono kicker above each card title**.
   Honors frozen copy verbatim; matches DESIGN.md eyebrow grammar.
2. **Isometric illustrations** → adopt the Figma raster assets. Downloaded (Figma asset
   URLs expire 7 days) and committed to `public/whyus/`:
   - `speed.png` (rocket) → card "Speed / First working version in weeks"
   - `product-thinking.png` (magnifier+doc) → card "Product thinking / We stress-test…"
   - `niche-depth.png` (robot+chain) → card "Niche depth / Multichain Web3…"
   1254×1254 transparent PNG, isometric line-art with green accents.
   **Serving (review D1 decision):** resize each to ~800px longest edge (2× retina
   headroom over the ~400px render) and convert to **WebP**, replacing the files in
   `public/whyus/` (extensions become `.webp`). Keep the project's plain `<img>`
   convention (no `next/image`). Visually identical at render size; cuts ~2MB of
   homepage weight (speed.png 940KB → ~tens of KB). Conversion is an implementation
   action (Step 6), verified at Step 8.
3. **Type/chrome fidelity** → adopt Figma wholesale: UPPERCASE headings (CSS transform),
   bordered eyebrow chip, staggered stat-chip cascade. Logged as deviations below.

## Layout

Adopt the **canonical `<Section>` grid** (DESIGN.md Decisions Log 2026-05-19):

- Wrapper: `<Section bg="subtle" maxWidth="xwide">` — gives
  `bg-bg-subtle`, content `max-w-[1280px] mx-auto`, padding
  `py-[48px] md:py-[64px] lg:py-[72px] px-[16px] sm:px-[24px] md:px-[48px] lg:px-[96px] xl:px-[128px]`,
  auto-`<Reveal>`. Replaces the current hand-rolled `<section>`/`<div>` wrapper.
- **Header** — two-column on `lg+`, stacked below:
  - **Left column** (`max-w-[720px]`, vertical gap 20px):
    - Eyebrow chip: bordered pill, `bg-bg`/`border-border`, JetBrains-Mono 11–13px
      uppercase `tracking-[0.1em]` `text-gray`, the literal text `Why us`.
    - H2: `font-brand` bold, existing responsive clamp `clamp(32px,4vw,52px)`,
      `leading-[1.05] tracking-[-0.035em] uppercase text-dark`; `Metaborong` wrapped in
      `text-brand` span. (Figma fixes 32px at one breakpoint; site is fluid — keep the
      responsive clamp, adopt the uppercase + blue-accent treatment. Font adapts
      Space Grotesk → Satoshi per DESIGN.md type lock.)
    - Lede: `font-brand` 16px `leading-[1.65] tracking-[-0.01em] text-gray`, frozen text.
  - **Right column** — 3 staggered bordered **stat-chips**, reusing frozen strings:
    - `4.9 ★★★★★ on Clutch` — anchored to `clutchProfileUrl` (frozen markup, restyled
      container only; stars stay as the `★★★★★` text node, not SVG).
    - `Zap` icon + `Reply within 12h` (icon additive, no string change).
    - `CalendarDays` icon + `4–12 weeks to ship` (icon additive).
    - Icons from `lucide-react` (project convention, see `nav.tsx`).
    - **DOM order = source order = tab order** (Clutch → Reply → weeks). The cascade
      is achieved with margin/`translate` offsets only — never absolute positioning
      that reorders the visual sequence away from DOM/tab order, and never CSS that
      moves Reply/weeks ahead of Clutch visually.
    - Staggered offset cascade per Figma; exact x/y offsets are subjective → **render
      labeled candidates on the live page, user picks** (memory rule). Below `lg`
      the chips wrap to a simple row/stack (no SEO content hidden, no `display:none`).
- **Cards row** — 3 flush full-bleed bordered columns (`grid-cols-1 md:grid-cols-3`,
  **no gap, no radius**, shared 1px `border-border`, Figma grammar). These are a
  **bespoke section treatment, NOT the `<Card>` primitive** — do not force
  `components/ui/card.tsx` (its radius/hover/shadow grammar does not apply here).
  Each column:
  - Isometric illustration (`<img>`, `public/whyus/*.png`, `alt=""` decorative,
    `loading="lazy"`, `object-contain`), centered near top. **Intrinsic `width`/
    `height` attrs + a fixed aspect-ratio box** so there is zero layout shift (CLS)
    while the image loads; if the image 404s the card still reads fully (title + body
    are real content, not in the image). At `375` the image is `max-w-full`,
    contained, never overflows the gutter.
  - Bottom **gradient fade** from the card surface to transparent over the lower image
    band — fades to `--color-bg` (the card surface token; Figma `#fffffc` → `--color-bg`).
  - Text block anchored toward the lower third:
    - Mono kicker = frozen `tag` (uppercase, `text-gray`, JetBrains Mono).
    - H3 = frozen `title`, `font-brand` bold ~`clamp(20px,1.6vw,24px)` uppercase
      `leading-[1.15] text-dark`.
    - Body = frozen `body` (incl. `<a>` client links via existing `projectLinkStyle`),
      `font-brand` 14–16px `leading-[1.7] text-gray`.
  - Mobile (`<md`): single column, illustration scales down, no `display:none`.

### Token mapping (Figma raw → DESIGN.md token)

| Figma raw      | Token used                                  |
|----------------|---------------------------------------------|
| bg `#fffffc`   | `--color-bg` (#ffffff) for cards            |
| section bg     | `--color-bg-subtle` (keep alternation role) |
| border `#e5e5e5` | `--color-border` (#e5e7eb)                |
| chip bg `#f8f9fa` | `--color-bg-subtle` / `--color-bg`       |
| text `#040404` | `--color-dark`                              |
| text `#6c757d` / `#495057` | `--color-gray`                  |
| accent `#296ff0` | `--color-brand`                           |
| Space Grotesk / Geist | `--font-brand` (Satoshi) / `--font-mono` (eyebrow/kicker) |

No raw hex/px in code — tokens only (DESIGN.md rule).

## Motion

Inherits the `<Section>` → `<Reveal>` one-shot IO-gated fade (opacity+translateY,
`motion.duration.base`, reduced-motion short-circuits to visible). **No new infinite
animation.** Optional: card image/border `hover` at `motion.duration.fast` only if
`/impeccable` or `/design-review` calls for it — not in baseline scope.

## Accessibility (hard constraints — honored regardless of deviations)

- Illustrations are decorative → `alt=""` (titles carry meaning, frozen text).
- Clutch chip stays a single `<a>` with `target="_blank" rel="noopener noreferrer"` and
  the frozen `aria-label="5 out of 5 stars"` on the stars.
- Client links keep `projectLinkStyle` + `rel="noopener noreferrer"`; visible focus via
  global `:focus-visible` brand ring.
- Body copy contrast ≥ 4.5:1 — `text-gray` (#676767) only; never `text-gray-light`.
- Tab order follows visual reading order; chips/links keyboard-reachable.
- `prefers-reduced-motion: reduce` honored via `<Reveal>`.
- Static SSR markup contains every frozen string + links (no `display:none` on SEO
  content; mobile fallbacks render server-side).
- **Responsive breakpoints (explicit):**
  - `lg+` (≥1024): header two-column (`max-w-[720px]` left + stat-chip cascade right);
    cards 3-up.
  - `md` (768–1023): header collapses to single column — left block then chips as a
    wrapped row beneath the lede; cards stay 3-up (`md:grid-cols-3`).
  - `<md` (≤767, incl. 375): single column throughout; chips stack as a simple
    row/wrap; cards stack 1-up; illustrations scale within the gutter, no overflow.
- **Touch targets ≥44×44px** on the Clutch chip and every client link on touch
  surfaces (pad the hit area; visible text may be smaller).

## Approved visual reference (no speculative mockups)

The locked visual reference for implementation is **Figma node `112:1787`**
(screenshot pulled 2026-05-19) + the 3 committed PNGs in `public/whyus/`. The design
direction was user-approved in brainstorming (3 decisions above). Per the project
candidate-pick rule, the **only** open visual sub-decision is the stat-chip cascade
offsets, resolved live at implementation (labeled candidates, user picks). No gstack
mockup variants are generated — they would compete with the locked Figma source.

## Deviations from master plan

Logged per the `DESIGN.md` override rule. `DESIGN.md` remains the master spec; every
hard constraint above is honored regardless.

1. **Raster illustrations + gradient fade.** DESIGN.md posture is SVG-signature, "no
   decorative gradients", "one signature visual per section". This section adopts 3
   AI-generated isometric **raster** PNGs with a bottom gradient fade, per the approved
   Figma frame and explicit user decision (#2). Rationale: Figma is the source of truth
   for this redesign; the illustrations are the section's signature treatment.
2. **UPPERCASE headings.** DESIGN.md type scale is mixed-case. H2/H3/kicker use
   `text-transform: uppercase` (presentational; copy strings unchanged). Per Figma +
   user decision (#3).
3. **Bordered eyebrow chip.** DESIGN.md canonical eyebrow is plain text (`Eyebrow`
   primitive). This section wraps it in a bordered pill per Figma + decision (#3).
4. **Flush full-bleed card grid.** DESIGN.md card pattern is rounded `radius.lg` with
   `gap-[24px]`. This section uses flush, zero-radius, shared-border columns per Figma.
5. **Staggered stat-chip cascade.** The frozen trust strings move from an inline text
   row to 3 offset bordered chips per Figma + decision (#3).
6. **Mono kicker = frozen `tag`.** The frozen `reasons[].tag` strings (Speed / Product
   thinking / Niche depth), which the Figma frame omits, are retained as a mono kicker
   above each title to satisfy the FROZEN-copy contract (decision #1).

## Out of scope

- No copy changes (hard constraint).
- No edits to `app/page.tsx`, `nav.tsx`, `#why-us`/section anchor, or any other section.
- No canonical `DESIGN.md`/`CHANGELOG.md` edit — only a worktree draft note;
  graduation happens in the coordinator session at merge.

## Verification posture (per project)

- `npx tsc --noEmit` → exit 0.
- `npm run dev`; QA at **1440 / 1280 / 375**: section box left/right edges match nav +
  every other section (128/128/16 left; 1312/1152/gutter right); no horizontal overflow
  at 375; reduced-motion, focus-visible, ARIA, SSR static markup.
- **Copy-diff assertion:** the rendered text content of `WhyUsSection` (all frozen
  strings + link hrefs above) is byte-identical to pre-change; `git diff` shows no
  changed/removed string literal in the `reasons`/header/chip copy.
- **Image weight:** `public/whyus/*.webp` each ≪ original PNG (target ≤ ~80KB,
  ≤ ~800px longest edge); no `<img>` renders an oversized intrinsic; zero CLS
  (intrinsic `width`/`height` + aspect box present).
- **`npm run build` is expected to FAIL at `/blog/rss.xml`** (pre-existing PR-#26 env
  hold) — **not** a regression, not chased. Posture stays `tsc` + dev QA.
