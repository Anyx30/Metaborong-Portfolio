---
section: problem
date: 2026-05-11
status: in-flight
authority: plan
spec: docs/superpowers/specs/2026-05-11-section-problem.md
copy: docs/content/sections/problem.md
---

# Problem Section — Implementation Plan

## Goal

Replace the current 22-line `components/sections/problem.tsx` with the high-contrast blue card + isometric chart design, per spec.

## Files

| File | Action | Lines (est.) |
|---|---|---|
| `components/sections/problem.tsx` | Rewrite | ~80 |
| `components/sections/problem-trend-chart.tsx` | Create | ~120 |
| `components/sections/problem-aeo-accordion.tsx` | Create | ~50 |
| `app/globals.css` | Add ~30 lines under a new `/* problem section */` block | scoped to `.problem-card`, no global token changes |
| `components/ui/section.tsx` | **Do NOT modify.** Use existing `bg="default"`. The blue card is an inner element, not the section surface. |

## Section integration approach

Decision: keep `<Section bg="default" maxWidth="wide">` for outer wrapper. The off-white site surface frames the blue card and visually separates it from neighboring sections. The blue card is an INNER `<div className="problem-card">` constrained by the section's `maxWidth="wide"` (1120px).

`<Section>` wraps children in `<Reveal>` which does a 400ms opacity+translateY fade on viewport entry. This is fine — it animates the WHOLE card, not the chart bars. The trend-window sweep happens AFTER Reveal completes, triggered by a second IntersectionObserver inside `ProblemTrendChart`.

## Implementation order

### 1. `components/sections/problem-trend-chart.tsx`

Self-contained SVG component. Props: none (decorative). Internal state: `swept: boolean`.

Structure:
```tsx
'use client'   // for IntersectionObserver + useState

export function ProblemTrendChart() {
  // refs + IntersectionObserver to trigger swept=true on 50% visibility
  // honor prefers-reduced-motion via window.matchMedia
  return (
    <svg viewBox="0 0 617 470" aria-hidden="true" className="problem-chart">
      <defs>
        <filter id="problem-noise">…</filter>   {/* feTurbulence */}
      </defs>
      <g className="problem-chart-bg">
        {/* baseline + closed-window zone */}
      </g>
      <g className="problem-chart-bars">
        <ChartBar x={…} h={short}  color="#ffba08" label="FREELANCER" week="WEEK 3" subLabel="BRITTLE AT SCALE" />
        <ChartBar x={…} h={medium} color="#38b000" label="METABORONG" week="WEEK 5" subLabel="BUILT TO LAST" emphasis />
        <ChartBar x={…} h={tall}   color="#fffffc" label="AGENCIES"   week="WEEK 11+" subLabel="WINDOW CLOSED" />
      </g>
      <g className="problem-chart-axis">
        <text>WEEK 0 / [ TREND STARTS ]</text>
        <text>WEEK 06 / [ TREND DISSOLVES ]</text>
      </g>
      <rect className="problem-chart-sweep" data-active={swept} />
    </svg>
  )
}

function ChartBar({ x, h, color, label, week, subLabel, emphasis }) {
  // three rects per bar: top-face, side-faces, front-face (isometric prism)
  // text labels with -rotate-15 transform
}
```

CSS sweep (in globals.css):
```css
.problem-chart-sweep {
  fill: rgba(255,255,252,0.3);
  transform: translateX(-100%);
  opacity: 0;
}
.problem-chart-sweep[data-active="true"] {
  animation: problem-sweep 1s ease-out forwards;
}
@keyframes problem-sweep {
  0%   { transform: translateX(-100%); opacity: 0; }
  20%  { opacity: 1; }
  80%  { opacity: 1; }
  100% { transform: translateX(100%); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .problem-chart-sweep[data-active="true"] { animation: none; opacity: 0; }
}
```

### 2. `components/sections/problem-aeo-accordion.tsx`

Server component (no JS needed — native `<details>`).

```tsx
import { Q_AND_A } from '@/components/sections/problem-qa-data'

export function ProblemAEOAccordion() {
  return (
    <details className="problem-aeo">
      <summary>Common questions about the trend window</summary>
      <div className="problem-aeo-body">
        {Q_AND_A.map((qa) => (
          <div key={qa.q} className="problem-aeo-pair">
            <h3 className="problem-aeo-q">{qa.q}</h3>
            <p className="problem-aeo-a">{qa.a}</p>
          </div>
        ))}
      </div>
    </details>
  )
}
```

`problem-qa-data.ts` holds the four Q&A pairs from `docs/content/sections/problem.md §7`. Q&A text is exact-string-matched against the copy lock.

### 3. `components/sections/problem.tsx` (rewrite)

```tsx
import Script from 'next/script'
import { Section } from '@/components/ui/section'
import { ProblemTrendChart } from './problem-trend-chart'
import { ProblemAEOAccordion } from './problem-aeo-accordion'

const definedTermJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'DefinedTerm',
  'name': 'Trend window in Web3 and AI',
  'description': 'A trend window is the period between a market shift opening and the same shift dissolving — a new chain launch, a new agent paradigm, or a regulatory change. In Web3 and AI, these windows typically last four to eight weeks.',
  'inDefinedTermSet': 'https://metaborong.com/#defined-terms',
}

export function ProblemSection() {
  return (
    <Section bg="default" maxWidth="wide" id="problem">
      <Script
        id="problem-defined-term"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermJsonLd) }}
      />
      <div className="problem-card">
        <div className="problem-chrome" aria-hidden="true">
          <span className="problem-chrome-dot bg-[#d90429]" />
          <span className="problem-chrome-dot bg-[#ffba08]" />
          <span className="problem-chrome-dot bg-[#38b000]" />
          <span className="problem-chrome-label">THE TREND vs OUTPUT WINDOW</span>
        </div>

        <div className="problem-grid">
          <ProblemTrendChart />
          <div className="problem-content">
            <span className="problem-chip">THE PROBLEM</span>
            <h2 className="problem-h2">
              The window opens fast. Most teams aren&apos;t built to move through it.
            </h2>
            <p className="problem-body">
              Web3 and AI move in windows, not roadmaps. By the time most teams are ready to build, the window has already closed.
            </p>
            <p className="problem-bridge">
              We ship inside the window — and build to last past it.
            </p>
          </div>
        </div>

        <span className="sr-only">
          Chart: three teams ship at week three, week five, and week eleven. Only Metaborong&apos;s week-five delivery lands inside the six-week trend window.
        </span>

        <ProblemAEOAccordion />
      </div>
    </Section>
  )
}
```

### 4. `app/globals.css` — add at the end, under a new comment block

```css
/* ============================================================
   PROBLEM SECTION
   Spec: docs/superpowers/specs/2026-05-11-section-problem.md
   Scoped to .problem-card. No global token changes.
   ============================================================ */

.problem-card {
  position: relative;
  border-radius: 1px;
  border: 1px solid #ffffff;
  background: #296ff0;
  box-shadow: inset 0 80px 200px 0 rgba(255, 255, 255, 0.24);
  overflow: clip;
  padding: 0;
}

.problem-chrome {
  height: 22px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 3px;
  background: #fffffc;
  border-bottom: 1px solid #ffffff;
}
.problem-chrome-dot { width: 15px; height: 14px; display: inline-block; }
.problem-chrome-label {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 500;
  color: #040404;
  letter-spacing: -0.3px;
}

.problem-grid {
  display: grid;
  grid-template-columns: 57% 43%;
  align-items: center;
  gap: 0;
  min-height: 470px;
  padding: 38px 32px;
}

.problem-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-left: 24px;
}

.problem-chip {
  display: inline-flex;
  align-self: flex-start;
  background: rgba(255, 255, 252, 0.08);
  padding: 7px 10px;
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #fffffc;
  line-height: 1;
}

.problem-h2 {
  font-family: 'Space Grotesk', var(--font-brand);
  font-weight: 700;
  font-size: 32px;
  line-height: 1;
  letter-spacing: -0.014em;
  text-transform: uppercase;
  color: #fffffc;
  margin: 0;
}

.problem-body {
  font-family: var(--font-brand);
  font-size: 16px;
  line-height: 1.4;
  letter-spacing: -0.02em;
  color: rgba(255, 255, 252, 1);
  margin: 0;
}

.problem-bridge {
  font-family: var(--font-brand);
  font-size: 14px;
  line-height: 1.4;
  letter-spacing: -0.01em;
  color: rgba(255, 255, 252, 0.9);   /* 90% — AA-passing */
  margin: 0;
}

.problem-aeo {
  border-top: 1px solid rgba(255, 255, 252, 0.15);
  margin-top: 16px;
  padding: 16px 32px 32px;
  color: #fffffc;
}
.problem-aeo > summary {
  font-family: 'Geist', var(--font-brand);
  font-size: 14px;
  color: rgba(255, 255, 252, 0.8);
  cursor: pointer;
  list-style: none;
  min-height: 44px;
  display: flex;
  align-items: center;
}
.problem-aeo > summary::after {
  content: '+';
  margin-left: auto;
  font-size: 18px;
}
.problem-aeo[open] > summary::after { content: '–'; }
.problem-aeo-body {
  margin-top: 16px;
  display: grid;
  gap: 16px;
}
.problem-aeo-q {
  font-size: 14px;
  font-weight: 700;
  margin: 0 0 4px 0;
}
.problem-aeo-a {
  font-size: 14px;
  line-height: 1.5;
  color: rgba(255, 255, 252, 0.9);
  margin: 0;
}

/* Responsive: tablet + mobile */
@media (max-width: 1023px) {
  .problem-grid {
    grid-template-columns: 1fr;
    min-height: auto;
    padding: 24px 16px;
  }
  .problem-content { padding-left: 0; margin-top: 24px; }
}

@media (max-width: 767px) {
  .problem-card .problem-chart-iso { display: none; }
  .problem-card .problem-chart-flat { display: block; }
  .problem-h2 { font-size: 24px; }
}

/* Forced colors (Windows high-contrast) */
@media (forced-colors: active) {
  .problem-card {
    background: Canvas;
    border-color: CanvasText;
    box-shadow: none;
  }
  .problem-h2,
  .problem-body,
  .problem-bridge,
  .problem-chip { color: CanvasText; }
  .problem-chart-bars rect { fill: Canvas; stroke: Highlight; }
}
```

(The chart's flat/iso toggle classes live inside the SVG component.)

## Verification checklist (run after step 8 implementation)

```bash
npx tsc --noEmit                                          # typecheck
npm run build                                             # production build, no errors
npm run dev &                                              # dev server
open http://localhost:3000/#problem                       # eyeball
```

Visual checks:
- [ ] Blue card centered inside `<Section>` off-white padding
- [ ] Browser chrome strip across top (RYG dots + label)
- [ ] Chart left, content right at ≥1024px
- [ ] Trend-window sweep plays once on scroll into view
- [ ] H2 reads white-on-blue, uppercase Space Grotesk
- [ ] Bridge line readable (90% white, AA-passing)
- [ ] AEO accordion collapsed by default; opens to show 4 Q&A pairs
- [ ] Stack vertical at <1024px; chart switches to flat bars at <768px
- [ ] `prefers-reduced-motion: reduce` disables sweep + Reveal fade
- [ ] No CLS on FCP — chart is inline SVG

Accessibility checks:
- [ ] Tab order: AEO accordion summary is the only focusable element in section
- [ ] Screen-reader summary div hidden visually but accessible
- [ ] H2 preserves heading order (h1 from Hero → h2 here)
- [ ] DevTools "Emulate forced-colors" → text remains readable

SEO/AEO checks:
- [ ] `<blockquote>` for AEO block renders in DOM (server-side)
- [ ] `<details>` content renders in DOM even when collapsed (visible to crawlers)
- [ ] JSON-LD `DefinedTerm` block present and valid (test in Google Rich Results)
- [ ] H2 + body + bridge text indexable (no `aria-hidden` on them)

## Out of scope (deferred)

- DESIGN.md update for "high-contrast statement card" pattern → graduates after What-we-build also lands
- CHANGELOG entry → graduates serially with What-we-build (per parallel-session rule)
- Light/dark theme variant of the blue card → site is single-mode; not needed now
- Animating the closed-window zone tint → static is fine; honors "motion happens once and stops"
- Server-component analytics on AEO accordion expand → no analytics pipeline yet
