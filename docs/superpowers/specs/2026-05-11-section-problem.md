---
section: problem
date: 2026-05-11
status: in-flight
authority: spec
master_spec: DESIGN.md
copy_lock: docs/content/sections/problem.md
figma_file: mQsbMuw0spVgIu7jXirr3o
figma_node: '83:762'
figma_url: https://www.figma.com/design/mQsbMuw0spVgIu7jXirr3o/Metaborong-Portfolio?node-id=83-762
supersedes: components/sections/problem.tsx (current shipped 22-line version)
design_review: passed 2026-05-11 (plan-design-review, compressed 7-pass)
---

# Problem Section — Redesign Spec

## Intent

Replace the current 22-line "two-bad-options" Problem section with a high-contrast statement block driven by an isometric 3D bar chart. Thesis shifts from quality-framing ("agencies treat you as a ticket; freelancers lack depth") to speed-framing ("Web3 and AI move in windows; most teams can't ship inside them"). Copy lock: `docs/content/sections/problem.md`.

Visual intent: this section is the page's first hard tonal pivot — every section above and below uses the off-white site grammar; Problem is a solid blue surface. The contrast is the message.

## Eye-flow declaration

This section uses dual anchoring (intentional, not accidental):

- **Primary visual entry** = the isometric chart (left, ~57% width). F-pattern scanning lands here first.
- **Primary content entry** = the H2 (right column, vertically centered). Reading lands here second.

The two work together: chart provides the evidence, H2 provides the claim. Neither should be relegated to "decoration." Implementation must keep them at near-equal visual weight at desktop (chart wider, H2 bolder + heavier color).

## User journey storyboard

| Time | What the user sees | What the user feels |
|---|---|---|
| **0–5 sec (visceral)** | Blue block scrolls in. Eye hits the chart's bright bars first, then "THE PROBLEM" chip, then the all-caps H2. | "Something different. Urgency. There's a closing window." |
| **5–30 sec (behavioral)** | Reads H2 → body → bridge. Glances back at the chart, registers Metaborong's green bar is the only one inside the window. | "OK, they're claiming they can ship inside the window. The chart is the proof." |
| **30+ sec (reflective)** | Scrolls past. The blue block is the memory anchor for "the speed problem." | "These guys understand the problem. Let me see what they actually do." |

## Layout (matches Figma 83:762)

Two-column horizontal split inside a single bordered card.

```
+----------------------------------------------------------+
| [BROWSER CHROME — "THE TREND vs OUTPUT WINDOW" + RYG] | |
+-------------------------------+--------------------------+
|                               |                          |
|   ISOMETRIC 3D BAR CHART      |   [THE PROBLEM] chip     |
|                               |                          |
|   ┌─────┐ ┌──────┐            |   THE WINDOW OPENS FAST. |
|   │FREE │ │META  │ ┌──────┐   |   MOST TEAMS AREN'T      |
|   │LANCE│ │BORONG│ │AGENC │   |   BUILT TO MOVE THROUGH  |
|   └─────┘ └──────┘ │IES   │   |   IT                     |
|    W3       W5     └──────┘   |                          |
|                       W11+    |   Web3 and AI move in    |
|   week 0 ────────── week 6    |   windows, not roadmaps. |
|   trend starts  trend closes  |   …                      |
|                               |                          |
|                               |   We ship inside the     |
|                               |   window — and build to  |
|                               |   last past it.          |
+-------------------------------+--------------------------+
```

- **Outer card:** rounded 1px corner, 1px white border, full-bleed inside `<Section>`.
- **Background:** solid `#296ff0` (Figma brand blue). Inset top white shadow `0 80px 200px rgba(255,255,255,0.24)` for subtle volumetric lift.
- **Inner chart panel:** absolutely positioned inside the card, occupies left ~57%, top offset 38px, w=617 h=470 at desktop reference.
- **Right column:** vertically centered against the chart, ~475px wide, top: 50% / translate-Y: -50%.

## Component plan

Single new component: `components/sections/problem.tsx` (replaces current). Optional: extract `components/sections/problem-trend-chart.tsx` if the chart exceeds ~150 lines or needs isolation.

```tsx
<Section bg="custom" id="problem">   // bg="custom" → no padding-bg, the card itself is the surface
  <div className="problem-card">
    <div className="problem-browser-chrome" aria-hidden>
      <RYGDots />
      <span>THE TREND vs OUTPUT WINDOW</span>
    </div>
    <ProblemTrendChart aria-hidden />   // SVG-based isometric chart
    <div className="problem-content">
      <Chip>THE PROBLEM</Chip>
      <h2>The window opens fast. Most teams aren&apos;t built to move through it.</h2>
      <p className="problem-body">…</p>
      <p className="problem-bridge">…</p>
    </div>
    <ProblemAEOAccordion />   // default-collapsed Q&A block, see SEO/AEO section
  </div>
</Section>
```

## Chart implementation

The Figma assets are rasterized PNG faces — those don't survive responsive scaling, dark/light contexts, or theming. Reimplement as SVG.

- **Approach:** SVG with three extruded prisms (top + side + front faces), positioned via `transform: skew + rotate + scale` to match Figma's isometric projection (skew-x-60, rotate-15, scale-y-50 — already in Figma reference code, extract values).
- **Bars:**
  - Freelancer (`#ffba08`) — height representing "ships at week 3", short
  - Metaborong (`#38b000`) — height "ships at week 5", medium
  - Agencies (`#fffffc` 100%) — height "ships at week 11+", tallest
- **Axis baseline:** thin white line from week 0 to week 6, plus an extended "closed window" zone after week 6 rendered at 40% opacity. Bar 3 (Agencies) sits in the closed zone — the visual proof of the message.
- **Labels:** all from `docs/content/sections/problem.md` §5. Two labels per bar (top: name + WEEK N, side: trade-off label).
- **Decorative noise:** Figma's 10%-opacity bitmap noise overlay → reimplement as inline SVG `<feTurbulence>` filter with `baseFrequency=0.9 numOctaves=2` masked over the chart area.
- **Entry animation (locked):** instant render of bars + a single 1-second "trend window" highlight sweep crossing left-to-right when section enters viewport. Honors `prefers-reduced-motion: reduce` (no sweep). No staggered bar rise.

## Deviations from DESIGN.md (locked per master-spec override rule)

| # | DESIGN.md rule | This section | Locked decision |
|---|---|---|---|
| 1 | Off-white site surface | Solid `#296ff0` card | **Locked deviation.** The blue surface IS the message — high-contrast tonal pivot anchoring the page's emotional center. Reading clarity preserved by white type. |
| 2 | H2 = Satoshi 56px weight 700 tracking -0.03em | H2 = **Space Grotesk Bold 32px uppercase tracking -1.4% INSIDE the card only** | **Locked deviation.** Uppercase compressed grotesque visually weights ≈ 48-52px Satoshi sentence-case; the typography shift reinforces the "system instrumentation" framing (matches browser-chrome chart treatment). Confined to `.problem-card` — Satoshi remains canonical everywhere else. |
| 3 | Eyebrow = JetBrains Mono 11px uppercase tracking 0.1em | Chip = **JetBrains Mono Bold 11px uppercase**, 10×7 padding, translucent white background | **Resolved to system.** Figma showed Geist; we keep JetBrains Mono. Visual reads near-identical; brand consistency preserved. |
| 4 | Body line-height 1.5–1.75 | Body + bridge = **1.4** | **Locked compromise.** Tighter than DESIGN.md (1.5) but looser than Figma (1.2). Reads as system-readout while remaining legible across multi-line wraps. Confined to `.problem-card` — does not alter the global body line-height. |

**Net deviation count: 2 surface-level (#1, #2) + 2 confined-token (#3, #4). All four logged.** Motion (one-shot sweep, no infinite) and "one signature visual per section" rules honored.

## Option 1 chart fix (audit-resolved)

Figma's chart visually rewards Freelancer (ships earliest at week 3), undercutting the message. Spec adds a second labelled axis via sub-labels under each bar — `BRITTLE AT SCALE` / `BUILT TO LAST` / `WINDOW CLOSED`. Bar 3 also gets numeric `WEEK 11+` instead of `WEEK 11`. Closed-window zone (40% opacity tint after week 6) visually disqualifies Agencies' delivery.

## Interaction states

| State | Trigger | Visual |
|---|---|---|
| Initial render (above-fold) | Page load | Card visible, chart inert, no animation. Server-side rendered. |
| Scroll into viewport (>50%) | IntersectionObserver fires `data-active="true"` | Trend-window highlight sweep plays once (1s ease-out). |
| Scroll out of viewport | IntersectionObserver fires `data-active="false"` | Static; no animation re-triggers on re-entry. |
| Reduced motion | `prefers-reduced-motion: reduce` | Sweep never plays. Chart renders fully static. |
| No JavaScript | JS disabled | SVG chart renders identically (no interactive deps). Sweep simply omitted. |
| Slow connection (FCP impact) | Pre-hydration paint | The chart SVG is server-rendered inline (no external image fetch). Bridge line and body render in same paint. No CLS. |
| Forced-colors mode | `forced-colors: active` (Windows high-contrast) | Background falls back to `Canvas`; text falls back to `CanvasText`; bars become outlined rects with `Highlight` border. Chart legibility preserved. |
| Hover (any element) | n/a | Section is non-interactive at desktop. No hover states. |
| Touch (any element) | n/a | Same — non-interactive. AEO accordion is the only interactive surface; see below. |

## Responsive plan

| Breakpoint | Layout |
|---|---|
| ≥1280px | Two-column, chart left ~57%, content right ~43% as per Figma reference |
| 1024–1279px | Two-column, chart compressed to ~50%, content right ~50%, font sizes -10% |
| 768–1023px | Stack vertical: chart on top (full width, height auto), content below. Chart scales to maintain aspect ratio. |
| <768px | Stack vertical. **Locked: chart switches to flat front-elevation** (no isometric — vertical bars, ~120px tall, same labels). Browser-chrome bar drops the long label, keeps RYG dots. Maintains the metaphor without crushing legibility. |

## Accessibility

- Section is a decorative wrapper around a textual claim. The chart is `aria-hidden="true"` — the message lives in the H2 + body + bridge text, all server-rendered.
- Chart labels are visible to sighted users; a screen-reader-only summary lives below the chart in a `.sr-only` div:
  > "Chart: three teams ship at week three, week five, and week eleven. Only Metaborong's week-five delivery lands inside the six-week trend window."
- H2 keeps `<h2>` semantic role; preserves heading order from Hero's H1.
- Color contrast (`#296ff0` background):
  - White on `#296ff0` = 4.66:1 — passes AA body ✓
  - White 90% on `#296ff0` = 4.20:1 — passes AA body ✓ (bridge line uses this; **locked from 80%**)
  - White 80% on `#296ff0` = 3.73:1 — fails AA body. Reserved for chart sub-labels only (decorative text, not body).
- Focus: AEO accordion summary is focusable. All other elements non-interactive.
- Touch targets: AEO accordion summary ≥44px tap area.
- Reduced data: no large media; chart is SVG ~5KB inline. No degradation needed.

## SEO / AEO targets

- Primary search intent: "why is building in Web3 and AI hard" (per copy lock §7 Q1).
- AEO blockquote (`docs/content/sections/problem.md §6`) renders as `<blockquote>` in the DOM, server-rendered.
- **Four AEO Q&A pairs (Q1–Q4) render as a default-collapsed on-page `<details>` accordion** below the visual block. Locked treatment:
  - `<details>` summary: "Common questions about the trend window" (Geist 14px, white 80%, with chevron indicator)
  - Each `<details>` child: a Q/A pair
  - Server-rendered open content for AI crawlers and JS-disabled clients
  - Visual styling: minimal, matches the system-readout tone; lives inside the blue card, indented from the H2/body
  - Keyboard: native `<details>` keyboard semantics
- Trend-window term ownership (Q4): emit a Schema.org `DefinedTerm` JSON-LD block inline:
  ```json
  { "@type": "DefinedTerm", "name": "Trend window in Web3 and AI", "description": "...", "inDefinedTermSet": "https://metaborong.com/#defined-terms" }
  ```

## Resolved design decisions (from plan-design-review, 2026-05-11)

| Decision | Resolution |
|---|---|
| Eye-flow primacy | Dual anchor — chart (visual) + H2 (content), near-equal weight |
| H2 font deviation #2 | Lock Space Grotesk Bold 32px uppercase inside card |
| Eyebrow chip font deviation #3 | Resolve to JetBrains Mono (system) |
| Body line-height deviation #4 | Lock 1.4 compromise |
| Bridge line opacity | 90% (AA-passing) — bumped from Figma's 80% |
| Chart entry animation | Instant + 1s trend-window sweep (no staggered bars) |
| Mobile chart treatment | Flat front-elevation (vertical bars, same labels) |
| AEO Q&A visibility | Default-collapsed on-page accordion inside card |
| Forced-colors mode | Canvas/CanvasText fallback, outlined bars |
| Interaction state coverage | Full state table added |
| User journey storyboard | 5-sec / 30-sec / 30+-sec arc documented |

## Open questions

None. All decisions locked. Implementation can proceed.
