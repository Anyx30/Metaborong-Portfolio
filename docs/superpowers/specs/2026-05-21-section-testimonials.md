# Section spec — Testimonials (2026-05-21)

**Worktree:** `../mb-website-testimonials` · **Branch:** `section/testimonials-redesign` · **Dev port:** `:3097`
**Component:** `components/sections/testimonials.tsx` (was 131 lines, now 138 lines; `'use client'` preserved)
**Chain:** A2 (visual prep + padding-chain migration) + A3 (content fill from Clutch profile)
**Predecessor:** Session 17 graduations (`design-revamp` @ `3fa4e68`); padding chain canonical per PR #33 (2026-05-20).

---

## 1. Design intent

Replace a placeholder-laden static badge strip + 3 stub cards with a section that earns its trust marker by SSR-ing the same verifiable signal the official Clutch widget renders dynamically. The 3 cards become the no-JS / SSR-crawlable fallback; the official Clutch widget (type 8, h=300, 6 curated review IDs) is the always-on visual surface. Section follows the canonical `<Section bg="subtle" maxWidth="xwide">` grammar (matches Why-Us / Services / Comparison alternation).

The section reads: H2 (verb-led, names the source) → 1-sentence lede ("Nine verified clients have rated our work on Clutch. Three of them, in their own words.") → official widget container → 3 SSR-fallback cards (horizontal-snap carousel below `lg`, 3-up grid above) → section-level "View all reviews on Clutch →".

---

## 2. Anatomy

| Region | Element | Source |
|---|---|---|
| Section shell | `<Section bg="subtle" maxWidth="xwide">` | `components/ui/section.tsx:36` (canonical 6-step padding chain) |
| Eyebrow | `<Eyebrow as="p">Social proof</Eyebrow>` | `components/ui/eyebrow.tsx` |
| H2 | `text-[clamp(28px,3.5vw,44px)] font-bold tracking-[-0.035em]` | matches site H2 grammar (Why-Us, Founders, Comparison) |
| Lede | `text-[16px] leading-[1.65] tracking-[-0.01em] text-gray` | matches Why-Us lede |
| SR-only outbound | `<a className="sr-only">Metaborong is rated 4.9 out of 5 on Clutch, based on 9 verified reviews.</a>` | Why-Us pattern (DESIGN.md Decisions Log 2026-05-19) |
| Clutch widget | `<ClutchWidget widgetType="8" height={300} reviews="…" />` | `components/sections/clutch-widget.tsx` (parameterised; defaults preserve Why-Us behavior) |
| Card carousel container | `role="region" aria-label="Client reviews" tabIndex={0}` with `snap-x snap-mandatory` (mobile) / `lg:grid lg:grid-cols-3` | local |
| Card | `<a>` whole-link to `clutchProfileUrl`; flex column with stars row + verified-eyebrow + italic quote + role-company-project block + decorative "Read on Clutch →" affordance | local |
| Section CTA | `inline-block py-[8px]` (AAA tap-target) "View all reviews on Clutch →" | local |
| Swipe-hint chevrons | `aria-hidden="true"`, `pointer-events: none`, `motion-safe:animate-pulse` | local |

---

## 3. Token map

| Visual primitive | DESIGN.md token | Notes |
|---|---|---|
| Section bg | `bg-bg-subtle` (via `<Section bg="subtle">`) | alternation pattern: Testimonials = subtle, Founders = default |
| Section max-width | `1280px` (via `maxWidth="xwide"`) | matches every other section |
| Section padding | `px-[16px] sm:px-[24px] md:px-[40px] lg:px-[48px] xl:px-[80px] 2xl:px-[128px]` | canonical chain from `<Section>` |
| Body text | `text-dark` (`#0a0a0a`), `text-gray` (`#4a4a4a`) | WCAG AA on subtle bg |
| Card border | `border border-border` | canonical neutral border |
| Card bg | `bg-white` | on subtle section, white card pops |
| Card radius | `rounded-[12px]` | matches Why-Us reasons cards |
| Brand color | `text-brand` (var `--color-brand`) on per-card "Read on Clutch →" + section CTA | tokenised |
| Clutch wordmark / stars | `#17313E` (Clutch ink) intentionally absent now (widget renders its own); `#F6851B` (Clutch orange) on hand-rolled card stars | Deviation 2 |
| Eyebrow primitive | `<Eyebrow>` with `tone="default"` (`text-gray-light`) | canonical |
| Focus ring | `focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2` | both on carousel container and each card link |

---

## 4. Deviations

1. **Per-review Clutch deep-links not used.** Clutch's URL surface does not expose per-review permalinks (`?review_id=<id>` and `#review-<id>` both redirect to profile root, tested via WebFetch). All 3 cards + section CTA + sr-only link target `clutchProfileUrl`; the official type-8 widget surfaces the live per-review carousel client-side. Brief's per-review affordance is satisfied dynamically by the widget.
2. **Clutch-foreign brand colors retained.** `text-[#F6851B]` on card stars. Not a `--color-brand` bypass; intentional third-party brand identity per memory `feedback-brand-color-caveats`.
3. **Reviewer personal names absent.** Clutch policy publishes role + company only ("Executive at Sedax Data Solutions"). Mirrors Clutch's canonical attribution; not a placeholder leak.
4. **Padding chain migrated from hand-rolled 4-step to canonical 6-step via `<Section>`.** Resolves handoff §2.3 drift. Vertical padding tightens from `py-[56/72/80]` to `py-[48/64/72]` to match neighbor sections.

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

- **Visible content redundancy between widget and fallback cards.** The Clutch widget surfaces the same review pull-quotes that the 3 SSR cards render statically. This is by design: the widget is the live dynamic surface (authority signal + always-current); the cards are the SSR-crawlable / no-JS fallback (E-E-A-T + AEO extractability for visitors and crawlers with JS disabled / for AI extractors that don't render iframes). Mirrors the Why-Us pattern (widget + `sr-only` text). Future polish could consider visually hiding the cards once the widget loads (CSS `:has(iframe)` or hydration-driven `data-` attribute) — out of Session 18 scope.
- **Privacy-preferences popup overlaps the widget on mobile.** The geo-consent UI ("PRIVACY PREFERENCES" with Accept/Reject buttons) lives at the page level (proxy.ts geo consent flow) and is unrelated to the testimonials section. Not a section regression.
- **H2 ducks under the nav on `scrollIntoView` test.** Cosmetic artifact of `block: 'start'` against the fixed nav — H2 is in the SSR HTML and visible when the user lands on the section naturally (via `scroll-mt` accommodations elsewhere on the page). No section-level change needed.

### 8.3 Verdict

**Pass.** No blocking regressions. Section visually consistent with Why-Us, Founders, and the rest of the page; trust marker upgraded from static placeholder strip to live Clutch widget; SSR fallback satisfies SEO/a11y; carousel a11y'd; tap-targets AAA.

---

## 9. GRADUATION DRAFT (for DESIGN.md Decisions Log + CHANGELOG.md — owned by orchestrator, not this worker)

> **DESIGN.md Decisions Log row (proposed):**
>
> | 2026-05-21 | **Testimonials migrated to canonical `<Section bg=subtle maxWidth=xwide>` grid; static placeholder strip replaced by the official Clutch widget (type 8, h=300, 6 curated review IDs) on the Why-Us-pattern always-on / `sr-only` SEO-fallback / `aria-hidden` visual triplet (DESIGN.md Decisions Log 2026-05-19); 3 SSR-crawlable verbatim quote cards from `clutch.co/profile/metaborong-technologies-private` (4.9 / 5, 9 reviews; Executive at Sedax Data Solutions / President at Digital Financial Aid Corp / Executive at SBS Construction). `<ClutchWidget>` parameterised (`widgetType`, `height`, `reviews`, `className`) — Why-Us defaults preserved. Drag-scroll lane (PR #33) gained `role=region` + `aria-label` + `tabIndex` + focus ring. Section CTA tap-target raised to AAA. Deviations 1–4 in `docs/superpowers/specs/2026-05-21-section-testimonials.md`. A3 baseline 3.4 → rewrite 8.0 in `docs/superpowers/specs/2026-05-21-testimonials-copy-audit.md`. | Replaces seven `[TODO:]` placeholders with real verifiable trust content; mirrors the agency's full work spread (Web3 / Web app / AI) per `positioning-web3-and-ai-equal`; satisfies a11y/SEO without depending on client-side JS; consolidates with the Why-Us Clutch widget pattern. |
>
> **CHANGELOG.md entry (proposed sub-bullet under Session 18):**
>
> - **testimonials**: Migrated to canonical `<Section>` grid; replaced placeholder strip with official Clutch widget (type 8) + 3 verbatim quote cards sourced from Clutch profile; drag-scroll lane gained keyboard + ARIA parity; A3 baseline 3.4 → 8.0.
