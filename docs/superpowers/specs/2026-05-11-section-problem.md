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
---

# Problem Section — Redesign Spec

## Intent

Replace the current 22-line "two-bad-options" Problem section with a high-contrast statement block driven by an isometric 3D bar chart. Thesis shifts from quality-framing ("agencies treat you as a ticket; freelancers lack depth") to speed-framing ("Web3 and AI move in windows; most teams can't ship inside them"). Copy lock: `docs/content/sections/problem.md`.

Visual intent: this section is the page's first hard tonal pivot — every section above and below uses the off-white site grammar; Problem is a solid blue surface. The contrast is the message.

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

Single new component: `components/sections/problem.tsx` (replaces current). Optional: extract `components/sections/problem-trend-chart.tsx` if the chart exceeds ~150 lines or needs isolation for SVG sprite hydration.

```tsx
<Section bg="custom" id="problem">   // bg="custom" → no padding-bg, the card itself is the surface
  <div className="problem-card">
    <div className="problem-browser-chrome" aria-hidden>
      <RYGDots />
      <span>THE TREND vs OUTPUT WINDOW</span>
    </div>
    <ProblemTrendChart aria-hidden />   // SVG-based isometric chart, see below
    <div className="problem-content">
      <Chip>THE PROBLEM</Chip>
      <h2>The window opens fast. Most teams aren&apos;t built to move through it.</h2>
      <p className="problem-body">…</p>
      <p className="problem-bridge">…</p>
    </div>
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
- **Decorative noise:** Figma includes a 10%-opacity bitmap noise overlay (`imgF221372010Bbf28B79D77Acbdfcac9100A73Ec944`). Reimplement as inline SVG `<feTurbulence>` filter with `baseFrequency=0.9 numOctaves=2` masked over the chart area.

## Deviations from DESIGN.md (logged per master-spec override rule)

| # | DESIGN.md rule | This section | Why |
|---|---|---|---|
| 1 | Off-white site surface | Solid `#296ff0` card | The blue surface IS the message — high-contrast tonal pivot anchoring the page's emotional center. Reading clarity is preserved by white type. |
| 2 | H2 = Satoshi 56px weight 700 tracking -0.03em | H2 = Space Grotesk Bold 32px uppercase tracking -1.4% | Figma direction; uppercase compressed grotesque reinforces "system instrumentation" framing (matches the browser-chrome chart treatment). Recommend: use Space Grotesk only inside `.problem-card` — keep Satoshi everywhere else. |
| 3 | Eyebrow = JetBrains Mono 11px uppercase tracking 0.1em | Chip = Geist Bold 14px uppercase, 10px×7px padding, translucent white background | Figma chip is a structural element, not an eyebrow per se. Recommend: render with `font-mono` (JetBrains Mono) instead of Geist to keep brand consistent — visual reads nearly identical. |
| 4 | Body line-height 1.5–1.75 | 1.2 line-height for body+bridge | Figma direction; the tighter line height reads more like a system readout than prose. Acceptable inside the card; do not adopt elsewhere. |
| 5 | "One signature visual per section" | Honored — chart is THE signature | No conflict. |
| 6 | Motion: "happens once and stops" | Chart is fully static; bars enter once via stagger animation when section scrolls into view, then stop | Honored. No infinite animations. |

**Net deviation count: 4 (rules 1–4).** Rule 5 and 6 honored.

## Option 1 chart fix (audit-resolved)

Figma's chart visually rewards Freelancer (ships earliest at week 3), undercutting the message. Spec adds a second labelled axis via sub-labels under each bar — `BRITTLE AT SCALE` / `BUILT TO LAST` / `WINDOW CLOSED`. Bar 3 also gets numeric `WEEK 11+` instead of `WEEK 11`. Closed-window zone (4×0% opacity tint after week 6) visually disqualifies Agencies' delivery.

## Responsive plan

| Breakpoint | Layout |
|---|---|
| ≥1280px | Two-column, chart left ~57%, content right ~43% as per Figma reference |
| 1024–1279px | Two-column, chart compressed to ~50%, content right ~50%, font sizes -10% |
| 768–1023px | Stack vertical: chart on top (full width, height auto), content below. Chart scales to maintain aspect ratio. |
| <768px | Stack vertical. Chart switches to simplified front-elevation view (no isometric — flat bars with the same labels) to remain legible. Browser-chrome bar drops the label, keeps RYG dots. |

## Accessibility

- Section is decorative wrapper around a textual claim. The chart is `aria-hidden="true"` — the message lives in the H2 + body + bridge text, all server-rendered.
- Chart labels (FREELANCER / METABORONG / AGENCIES / WEEK 0 / WEEK 06 / sub-labels) are visible to sighted users; a screen-reader-accessible summary lives below the chart inside a `.sr-only` div:
  > "Chart: three teams ship at week three, week five, and week eleven. Only Metaborong's week-five delivery lands inside the six-week trend window."
- H2 keeps `<h2>` semantic role; preserves heading order from Hero's H1.
- Color contrast: white on `#296ff0` measures 4.66:1 (passes AA body). White-80%-opacity on `#296ff0` measures 3.73:1 — fails AA body. Bridge line (smaller, 80% opacity) is a stylistic deviation; recommend bumping to 90% to clear AA. Flagged for plan-design-review.
- Focus: section is non-interactive. No focus targets.

## Reduced motion

- Entry animation (bars rise into place) → instant render at `prefers-reduced-motion: reduce`.
- Noise filter is static (no `<animate>` tags), so no reduced-motion treatment needed.

## SEO / AEO targets

- Primary search intent: "why is building in Web3 and AI hard" (per copy lock §7 Q1).
- AEO blockquote (`docs/content/sections/problem.md §6`) renders as `<blockquote>` in the DOM with `cite` attribute referencing the page.
- Four AEO Q&A pairs (Q1–Q4) render inside an `aria-labelledby="problem-faq"` section below the visual block, visually styled minimally to keep them part of Problem rather than a separate FAQ. *Decision pending plan-design-review:* keep visible vs JSON-LD-only.
- Trend-window term ownership: Q4 ("What is a trend window in Web3 and AI?") makes this section the canonical source. If we publish a Schema.org `DefinedTerm` for it, this is where it lives.

## Open questions for plan-design-review

1. **Q4 visibility:** render Q&A pairs as on-page accordion vs JSON-LD-only schema? Visible is better for AEO/E-E-A-T but doubles the section's vertical footprint.
2. **Font deviations (rules 2–3):** adopt Space Grotesk + Geist inside the card, or remap to Satoshi + JetBrains Mono? My recommendation: keep brand fonts.
3. **Bridge-line opacity:** 80% fails AA — bump to 90% or accept as decorative subtext?
4. **Chart entry animation:** stagger bars rising? Or instant render + a single 1-second "trend window" highlight sweep? My recommendation: instant + sweep; cheaper, more readable.
5. **Mobile chart simplification:** flat front-elevation OR drop the chart entirely on mobile and substitute a single line of stat copy ("Week 0 → Week 6 → Window closes. Metaborong ships week 5.")? My recommendation: flat front-elevation.
