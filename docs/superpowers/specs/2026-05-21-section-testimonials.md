# Section spec — Testimonials (2026-05-21)

**Worktree:** `../mb-website-testimonials` · **Branch:** `section/testimonials-redesign` · **Dev port:** `:3097`
**Component:** `components/sections/testimonials.tsx` (was 131 lines → 152 lines after A2/A3 → 51 lines after user-directed simplification 2026-05-21; `'use client'` preserved)
**Chain:** A2 (visual prep + padding-chain migration) + A3 (content fill from Clutch profile) + user-directed simplification (cards removed, widget-only)
**Predecessor:** Session 17 graduations (`design-revamp` @ `3fa4e68`); padding chain canonical per PR #33 (2026-05-20).

---

## 1. Design intent

Replace a placeholder-laden static badge strip + 3 stub cards with the official Clutch type-8 reviews widget as the sole review surface. SSR-crawlable trust content is satisfied by an `sr-only` outbound link carrying the rating + count + profile target — same Why-Us pattern, widget-only application.

The section reads: H2 (verb-led, names the source) → 1-sentence lede ("Nine verified clients have rated our work on Clutch.") → `sr-only` SEO/a11y outbound link → official Clutch widget framed in a white card with neutral border + 12px radius → section-level "View all reviews on Clutch →".

**Section primitive:** `<Section bg="subtle" maxWidth="wide">` — narrows to 1120 from the page-wide 1280 because the Clutch type-8 iframe self-caps internal grid at ~1100. Matching the Section content width to that cap keeps H2 / lede / widget / CTA aligned on a single left edge with no dead right-side whitespace inside the widget.

**User-directed simplification (2026-05-21):** the earlier A2+A3 iteration kept 3 hand-rolled SSR-fallback quote cards beneath the widget. User dropped them because (a) they repeated the same content the widget already surfaces, and (b) the per-card "Read on Clutch →" affordance was the original visual idiom we're moving away from. The widget is now the only review surface; SEO/a11y coverage moves to the `sr-only` outbound text.

---

## 2. Anatomy (final, post-simplification)

| Region | Element | Source |
|---|---|---|
| Section shell | `<Section bg="subtle" maxWidth="wide">` | `components/ui/section.tsx:36` (canonical 6-step padding chain) |
| Eyebrow | `<Eyebrow as="p">Social proof</Eyebrow>` | `components/ui/eyebrow.tsx` |
| H2 | `text-[clamp(28px,3.5vw,44px)] font-bold tracking-[-0.035em]` | matches site H2 grammar (Why-Us, Founders, Comparison) |
| Lede | `text-[16px] leading-[1.65] tracking-[-0.01em] text-gray` | matches Why-Us lede |
| SR-only outbound | `<a className="sr-only">Metaborong is rated 4.9 out of 5 on Clutch, based on 9 verified reviews.</a>` | Why-Us pattern (DESIGN.md Decisions Log 2026-05-19) |
| Widget card container | `rounded-[12px] border border-border bg-white` (no inner padding — widget has its own internal spacing) | local |
| Clutch widget | `<ClutchWidget widgetType="8" height={420} reviews="…" />` | `components/sections/clutch-widget.tsx` (parameterised; defaults preserve Why-Us behavior) |
| Section CTA | `inline-block py-[8px]` (AAA tap-target) "View all reviews on Clutch →" | local |

**Removed in user-directed simplification (2026-05-21):** drag-scroll card carousel (`'use client'` + `useRef`), 3 SSR-fallback quote cards, swipe-hint chevrons, `<Stars>` helper, `'use client'` is preserved only because the `<ClutchWidget>` child is a client component (the widget shell itself uses `next/script` `afterInteractive`); the parent section no longer hosts client state.

---

## 3. Token map (final)

| Visual primitive | DESIGN.md token | Notes |
|---|---|---|
| Section bg | `bg-bg-subtle` (via `<Section bg="subtle">`) | alternation pattern: Testimonials = subtle, Founders = default |
| Section max-width | `1120px` (via `maxWidth="wide"`) | narrower than xwide (1280) — matches Clutch type-8 iframe natural content width; Deviation 4 |
| Section padding | `px-[16px] sm:px-[24px] md:px-[40px] lg:px-[48px] xl:px-[80px] 2xl:px-[128px]` | canonical chain from `<Section>` |
| Body text | `text-dark` (`#0a0a0a`), `text-gray` (`#4a4a4a`) | WCAG AA on subtle bg |
| Widget card border | `border border-border` | canonical neutral border |
| Widget card bg | `bg-white` | on subtle section, white card pops |
| Widget card radius | `rounded-[12px]` | matches Why-Us reasons cards |
| Brand color | `text-brand` (var `--color-brand`) on section CTA | tokenised |
| Clutch wordmark / stars | rendered inside the iframe by Clutch's own assets — not Metaborong's tokens to set | external |
| Eyebrow primitive | `<Eyebrow>` with `tone="default"` (`text-gray-light`) | canonical |

---

## 4. Deviations

1. **~~Per-review Clutch deep-links not used~~** ~~(was relevant when 3 fallback cards existed)~~ — moot after card removal. The widget surfaces the per-review carousel client-side; no per-review affordance exposed by Metaborong's DOM.
2. **~~Clutch-foreign brand colors retained~~** ~~(was relevant when hand-rolled card stars were `text-[#F6851B]`)~~ — moot after card removal. Stars are now rendered inside the iframe by Clutch's own assets.
3. **~~Reviewer personal names absent~~** ~~(was relevant when hand-rolled cards displayed attribution)~~ — moot after card removal. The widget shows whatever attribution Clutch surfaces (role + company, per their anonymity policy).
4. **Padding chain migrated from hand-rolled 4-step to canonical 6-step via `<Section>`.** Resolves handoff §2.3 drift. Vertical padding tightens from `py-[56/72/80]` to `py-[48/64/72]` to match neighbor sections.
5. **Section narrows to `maxWidth="wide"` (1120) instead of page-wide `xwide` (1280).** The Clutch type-8 iframe self-caps its internal grid at ~1100. Matching the Section content width to that cap keeps H2 / lede / widget / CTA aligned on a single left edge with no dead right-side whitespace inside the widget. Trade-off: testimonials' content left-edge sits 80px further right than neighbors' (Why-Us, Founders) at ≥xl viewports — accepted as a focused trust-marker block.

---

## 5. Hard constraints preserved

- `'use client'` retained (PR #33 drag-scroll lane).
- Drag-scroll lane behavior preserved; carousel container gained `role="region" aria-label="Client reviews" tabIndex={0}` + focus-visible ring.
- Em-dashes ENDORSED in visible copy (DESIGN.md:37); none used here but no over-correction. Alt/aria-scoped strip rule unaffected.
- Web3 AND AI equally — quote spread (blockchain / Web app / AI) reads as the agency's full work mix; positioning balance preserved.
- Brand-color token discipline: `text-brand` (token-linked) on every brand-blue interactive affordance; Clutch-foreign colors logged as Deviation 2.
- Outbound `target="_blank" rel="noopener noreferrer"` on every Clutch link.

---

## 6. plan-design-review scorecard (≥8.5 to proceed)

| Dimension | Score | Reasoning |
|---|---:|---|
| Hierarchy | 9 | H2 → lede → widget → cards → section CTA is one clear vertical descent; eyebrow + verified tag are subordinate. |
| Spacing rhythm | 9 | Canonical `<Section>` padding; `mb-[24px] md:mb-[32px]` on header; `gap-[16px]/[20px]` carousel; `mt-[24px]` section CTA. Matches Why-Us / Founders neighbors. |
| Type system | 9 | H2 clamp matches site; `<Eyebrow>` primitive used; body 15/16px italic for quotes. |
| Color | 8 | Card stars use Clutch orange (intentional). Brand-blue links token-tied. Verified tag uses tertiary gray. |
| A11y | 9 | Carousel `role=region`/labelled/tabbable; sr-only outbound fallback; aria-hidden on widget shell + decorative stars + swipe hints + "Read on Clutch" span; focus rings on carousel + each card. |
| Copy / authority | 9 | All visible content sourced from Clutch profile or factual aggregate; lede single-sentence-extractable; outbound to Clutch 5×. |
| Motion | 9 | Snap-mandatory carousel; pulse on swipe hints gated by `motion-safe:`. |
| **Composite** | **8.9** | Passes the 8.5 gate. |

---

## 7. impeccable critique entry (Phase 1)

P0 fixes applied:

- Nested-interactive-elements ambiguity → "Read on Clutch →" span now `aria-hidden`; the card itself is the link target. Whole-card link is the honest affordance.
- Padding-chain drift → migrated to `<Section bg="subtle" maxWidth="xwide">`.
- Static badge strip replaced with official `<ClutchWidget widgetType="8" height={300} reviews="…" />` + `sr-only` SEO outbound fallback (Why-Us pattern, DESIGN.md Decisions Log 2026-05-19).
- `[TODO:]` placeholders eliminated (Phase 2 content fill from Clutch profile).

P1 polish applied:

- Drag-scroll lane: `role="region" aria-label="Client reviews" tabIndex={0}` + focus-visible ring → keyboard parity restored.
- Decorative star spans inside cards `aria-hidden` (the section-level rating in `sr-only` carries the explicit "5 out of 5" announcement); SR no longer hears 4 redundant "5 out of 5 stars" labels.
- Eyebrow migrated to canonical `<Eyebrow>` primitive.
- Section CTA tap-target bumped via `inline-block py-[8px]` (≥24px AAA).
- Swipe-hint chevrons `aria-hidden="true"` explicit.
- Dead `useEffect` (was a planned infinite-scroll jump-to-middle never wired up) removed; `useRef` retained for future a11y/scroll-controls extensibility.

---

## 8. design-review entry (Phase 3, post-verification)

Live QA via headless Chromium against `:3097`, captured at 1440, 1280, 375. Screenshots stored at `/tmp/mb-test-{desktop-1440,laptop-1280,mobile-375}.png` (local, not committed).

### 8.1 What worked

- **Section primitive migration is clean.** Padding chain matches the rest of the page; no edge inconsistencies. Subtle background alternates correctly with WorkPreview (default) above and Founders (default) below.
- **Eyebrow "SOCIAL PROOF" + lede + H2 stack** reads at all three breakpoints. Lede single-sentence visible on mobile without truncation.
- **Official Clutch widget loads client-side** at all viewports. Renders as 3-col-x-2-row (6 reviews) on desktop/laptop, falls back to single-review carousel with `< 1 of 3 >` pagination + "Powered by Clutch" footer on mobile. Widget self-styles using Clutch's brand colors; container shell (white card, 12px radius, border) reads as a Metaborong-native primitive.
- **SSR-fallback cards** render below the widget with stars + "VERIFIED · CLUTCH" eyebrow + italic quote + `Role, Company` bold + `Project` subline + brand-blue "Read on Clutch →" affordance. 3-col grid above `lg`, drag-scroll lane below — both confirmed.
- **Section CTA** "View all reviews on Clutch →" centered, single line, tap-target ≥24px (verified via `inline-block py-[8px]`).
- **No `[TODO:]` leakage** in any viewport.
- **No em-dash leak** in alt/aria.
- **Drag-scroll lane visible** at 375 — first card centered with snap-mandatory; swipe-hint chevrons (decorative, aria-hidden) visible at the edges.

### 8.2 Trade-offs noted (intentional, not regressions)

- **~~Visible content redundancy between widget and fallback cards.~~** Resolved 2026-05-21 — cards removed by user direction. Widget is now the only review surface; SSR/a11y coverage moves to the `sr-only` outbound text + lede.
- **Section narrows from xwide to wide (1120 vs 1280) at testimonials only.** Trade-off: testimonials' content left-edge sits 80px further right than Why-Us / Founders / Comparison neighbors at ≥xl viewports. Accepted as a focused trust-marker block; the widget reads as a clean integrated primitive rather than a centered island in a wider container.
- **Privacy-preferences popup overlaps the widget on mobile.** The geo-consent UI ("PRIVACY PREFERENCES" with Accept/Reject buttons) lives at the page level (proxy.ts geo consent flow) and is unrelated to the testimonials section. Not a section regression.

### 8.3 Verdict

**Pass.** No blocking regressions. Section visually consistent with Why-Us, Founders, and the rest of the page; trust marker upgraded from static placeholder strip to live Clutch widget; SSR fallback satisfies SEO/a11y; carousel a11y'd; tap-targets AAA.

---

## 9. GRADUATION DRAFT (for DESIGN.md Decisions Log + CHANGELOG.md — owned by orchestrator, not this worker)

> **DESIGN.md Decisions Log row (proposed):**
>
> | 2026-05-21 | **Testimonials rebuilt as a widget-only trust block on `<Section bg="subtle" maxWidth="wide">`** — the official Clutch type-8 reviews widget (h=420, 6 curated review IDs from data-reviews="457842,454740,453781,439014,438481,437747") in a white card with neutral border + 12px radius is the only review surface; an `sr-only` outbound link carries the SSR-crawlable rating/count fallback (Why-Us pattern, DESIGN.md Decisions Log 2026-05-19). `<ClutchWidget>` parameterised (`widgetType`, `height`, `reviews`, `className`) — Why-Us defaults preserved. **Section narrowed to `wide` (1120)** to match the Clutch type-8 iframe's natural ~1100 content cap and avoid dead right-side whitespace at ≥xl viewports. Earlier A2+A3 iteration kept 3 SSR-fallback quote cards + drag-scroll lane — dropped by user 2026-05-21 because they duplicated the widget's content and reintroduced the per-card "Read on Clutch →" idiom we're moving away from. Padding chain migrated from hand-rolled 4-step to canonical 6-step. Deviations 4–5 in `docs/superpowers/specs/2026-05-21-section-testimonials.md`. A3 audit baseline 3.4 → rewrite 8.0 in `docs/superpowers/specs/2026-05-21-testimonials-copy-audit.md`. | Replaces seven `[TODO:]` placeholders with a single verifiable live trust marker; eliminates content duplication between SSR cards and the widget; consolidates with the Why-Us Clutch widget pattern; the narrower Section is a deliberate cost paid to keep the widget reading as a clean integrated primitive instead of a centered island. |
>
> **CHANGELOG.md entry (proposed sub-bullet under Session 18):**
>
> - **testimonials**: Rebuilt as widget-only trust block on `<Section bg="subtle" maxWidth="wide">` — official Clutch type-8 reviews widget (h=420, 6 curated review IDs) is the only review surface; `sr-only` outbound carries the SSR rating/count fallback; padding chain migrated to canonical 6-step. Earlier hand-rolled fallback cards + drag-scroll lane dropped per user direction. A3 baseline 3.4 → 8.0.
