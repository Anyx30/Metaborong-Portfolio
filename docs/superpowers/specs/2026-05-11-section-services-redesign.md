# Services Section — Redesign Spec

**Date:** 2026-05-11
**Section:** Services / "What we build" (`components/sections/services.tsx` + `services-trefoil.tsx` + `services-glyphs.tsx` + `services-mobile.tsx` + `services-data.ts`)
**Master spec:** `DESIGN.md`
**Copy lock:** `docs/content/sections/services.md`
**Figma reference:** https://www.figma.com/design/mQsbMuw0spVgIu7jXirr3o/Metaborong-Portfolio?node-id=112-289 — Frame `1707481126` (fileKey `mQsbMuw0spVgIu7jXirr3o`, nodeId `112:289`). Pulled and adapted at step 8 of Context A1.
**Branch:** `section/what-we-build-redesign`
**Supersedes:** archived deviation logs `docs/superpowers/archive/specs/2026-05-04-section-services-design.md` (trefoil polish #1 + #2).

## Intent

Replace the trefoil hub-and-spoke topology and accordion-gated children with a **hybrid index**: clean scan-first structure carrying the three pillars and their children inline, with a single signature accent providing visual identity. Pillars must read in two seconds; child services must be skimmable without interaction; pillar hub CTAs must be primary visible affordances.

**Information posture.** Three pillars are co-equal categories. The section must not present them as a ranked list (primary+two-secondaries) — Metaborong is a multi-pillar studio, not a Web3-first studio with side practices. Layout treatment must reflect equal weight (three equal columns, or three sibling rows, not a hero pillar plus subordinates).

**Time-horizon read:**
- **First 5 seconds (visceral):** Eyebrow + H2 + pillar labels visible. The reader knows this is a studio that does three things and what they are.
- **5 minutes (behavioral):** Reader scans child services within the pillar they care about, sees the hub CTA, clicks through to the pillar hub.
- **5-year (reflective):** This section reads as the studio's catalog — must not date by referencing temporary trends (no "Web3 winter recovery", no specific model names).

## Rejected directions

- Hub-and-spoke / orbital / trefoil topology — the read it currently has.
- Accordion-gated child services — kills scan + GEO citability.
- Flat 9-card grid (3 pillars × 3 services) — collapses hierarchy, loses pillar voice.
- Multi-tab carousel — interaction tax on a passive-scan section.
- Ambient gradient / glow backdrops — violates DESIGN.md "no decorative gradients" rule.
- Per-child illustrations or icons — slop risk + maintenance burden across 14 children.
- **3-column feature grid (icon-in-colored-circle + bold title + 2-line description × 3)** — most recognized AI-generated layout. The pillars must not render as this pattern even if the column count matches.
- **Centered-everything composition** — text-align center on every heading + body. Hierarchy collapses; reads as template.
- **Colored-left-border cards as the pillar treatment** — directly conflicts with `Card variant="featured"` which already owns the 3px left-border accent for highlighted single cards. Re-using it here would dilute the featured-card signature.
- **System-ui / default font stacks for display copy** — DESIGN.md mandates Satoshi for display. No falling back to system fonts as a "minimalist" choice.

## Locked content shape

Source: `docs/content/sections/services.md`.

- 1 eyebrow + 1 H2 + 1 lede (above pillars, centered or left-aligned per Figma).
- 1 AEO blockquote — **renders as semantic `<blockquote>` after the lede and before pillar 01**. Must render in initial SSR HTML, must not be hidden behind toggle, must not depend on hydration to be readable.
- 3 pillars (`01 / 02 / 03`), each with: num, label, headline (≤8 words), body (1 sentence, ≤22 words), hubCta button (≤3 words verb-first), hubHref.
- Child services rendered inline per pillar (7 Web3 + 6 AI + 1 Product Studio = **14 entries**), each with name + description (≤16 words). **Locked: rendered as clickable links to existing slugs in `services-data.ts` (`/services/<pillar>/<slug>/`)**. The 17 noindex stub pages exist for crawl depth; not linking from this section wastes that depth.
- 3 AEO Q&A blocks — **locked: JSON-LD only at this section.** Emit as `FAQPage` schema embedded via `<Script type="application/ld+json">`. Do NOT render as visible HTML. Rationale: visible FAQ at section bottom would create a competing focal point against the index pattern; visible FAQ ships in its own dedicated section per project CHANGELOG.

## Hard constraints (DESIGN.md, non-negotiable)

- Tokens only — no raw hex, no raw px outside the scale. Section uses `<Section bg="subtle" maxWidth="wide" id="services">`. The `id="services"` is a deep-link target — must preserve.
- Pillar colors locked to `services-data.ts`: Web3 `#204AF8`, AI `#10b981`, Product Studio `#F6851B`.
- `color.text.tertiary` (`#999`) not allowed for body copy or child-service descriptions.
- Borders over shadows. Card hover follows DESIGN.md card hover spec.
- One-shot motion only — no infinite animations introduced. Reveal via `<Section>` IO gate.
- `prefers-reduced-motion: reduce` short-circuits any introduced animation.
- Tap targets ≥44×44px on all clickable rows (child-service links and pillar hub CTAs).
- Mobile fallback renders the same IA in SSR HTML (no `display:none` on SEO-relevant child links).
- Focus-visible ring on every interactive element (pillar hub CTAs, all 14 child-service links).
- Buttons: Bauhaus signature — `radius: 0`, flat fills, 150ms transitions, no transform on hover. Primary hub CTAs may use the split-arrow pattern (text + arrow span with 1px white-15 divider).
- **Typography:** no new `--font-*` introduced. Display copy uses `--font-brand` (Satoshi); the eyebrow + index numerals use `--font-mono` (JetBrains Mono) per existing eyebrow primitive.
- **Semantics:** section uses `aria-labelledby` pointing at the H2's `id`. Each pillar grouping uses `<section aria-labelledby="pillar-<id>-heading">` so screen readers expose three pillars as navigable landmarks. Child-service lists use `<ul role="list">` (Tailwind reset re-adds the role).
- **Card variant choice:** if pillars render as card-like containers, use `<Card variant="default">` per DESIGN.md (`radius.lg`, no left-border). The `featured` variant is reserved for single-card highlights and may not be repurposed here.

### Per-element interaction states (DESIGN.md seven-state matrix)

| Element | default | hover | focus-visible | active | disabled | loading | error |
|---|---|---|---|---|---|---|---|
| Pillar hub CTA (`<Button variant="primary" size="md">`) | brand fill / off-white text | bg darkens ~10% (150ms) | brand 2px ring, 2px offset | bg darkens ~15%, no transform | n/a (always enabled) | n/a (links not async) | n/a |
| Child-service row link | dark text + gray-light description | text shifts to pillar color (150ms); subtle bg shift `bg-subtle → bg-raised` if rendered as boxed row | brand 2px ring, 2px offset | text darker pillar tone | n/a | n/a | n/a |
| Eyebrow / H2 / lede / blockquote | static (non-interactive) | — | — | — | — | — | — |

## Open decisions (resolve at step 7 — plan)

1. **Pillar layout shape** — three equal columns vs. three sibling rows (full-width per pillar). Both honor the "co-equal" posture. Resolve from Figma at step 8. **Topology constraint locked:** pillars render as **containers** (each pillar owns its children visually as a column/row container), not as section-dividers above a single shared index. This isolates pillar identity, supports scan-by-pillar, and keeps the hub CTA legible per pillar. Pillar 03 (Product Studio, 1 child) needs a treatment that doesn't read as empty — see plan.
2. **Signature accent** — exactly one. Candidates: oversized index numerals (`01/02/03` in display-size mono), structural rule between pillars (1px hairline with pillar-color tick), or a single typographic mark in the eyebrow row. Locked from Figma at step 8.
3. **Mobile layout** — keep current `services-mobile.tsx` `<Card>` list pattern with new copy, or unify into a single component that responsive-shifts? Recommend unify if Figma's mobile layout is structurally similar to desktop; keep split if mobile diverges (e.g., desktop is row, mobile is collapsed list with inline expansion).

### Resolved at this gate (no longer open)

- ~~Child-service interaction~~ — **locked: clickable links to existing slugs.** (No real design tradeoff; crawl depth is load-bearing.)
- ~~AEO Q&A render~~ — **locked: JSON-LD only.** (Visible FAQ would compete; dedicated FAQ section owns visible Q&A.)

## Component graph (post-redesign target)

| File | Role | Change |
|---|---|---|
| `components/sections/services.tsx` | Section wrapper | Replace trefoil/mobile-fork with new layout component. |
| `components/sections/services-data.ts` | Pillar + child data | Update strings to match `docs/content/sections/services.md`. Keep slugs stable. |
| `components/sections/services-trefoil.tsx` | Trefoil visual | **Delete** after migration. |
| `components/sections/services-glyphs.tsx` | Per-pillar SVG glyphs | **Delete** unless a glyph is reused as the signature accent (decided at step 8). |
| `components/sections/services-mobile.tsx` | Mobile fallback | Either delete (if unified) or rewrite to match new IA. |
| `components/sections/services-pillars.tsx` *(new)* | New layout component | Render 3 pillars + inline children + hub CTAs. |

## Content gaps (do NOT fabricate, defer to other sections)

Flagged by step-3 audits:

1. **Entity disambiguation** — no founding year, location, or founder names in section copy. Both audits flagged for GEO citation strength. **Decision:** intentionally deferred to Founders section. Section copy stays capability-dense.
2. **Proof anchors for "audit-ready" / "senior team" / "production-grade"** — these claims need verification from Trust/Founders sections (audit-partner logos, named founders, shipped client work). **Decision:** record dependency; no edits in this section.
3. **Footnote/proof links on pillar bodies** — out of scope for the redesign. Revisit when Trust section ships.

## Deviations from master plan (locked at step 8 from Figma frame 1707481126)

The Figma direction is a **scroll-driven sticky-stack** with a 3D isometric signature visual. This *supersedes* the step-5 "pillars-as-containers, all-children-inline" decision after explicit user sign-off. Recorded deviations below.

### 1. Layout — sticky-rail + scroll-stacked pillar panels (NOT three side-by-side containers)

- **Desktop (≥lg):** two-column grid. Left column is a `position: sticky` nav rail showing `[01] WEB3/BLOCKCHAIN`, `[02] AI AGENTS`, `[03] PRODUCT STUDIO`. Right column is three vertically-stacked pillar panels (one per pillar). As the visitor scrolls, an IntersectionObserver per panel toggles the active state on the matching rail item at ~30% viewport-from-top threshold. **No scroll-jacking; no scroll-snap; free-flow page.**
- **Mobile (<lg):** left rail collapses inline as bracket-number badges above each pillar's H3 (`[01]`, `[02]`, `[03]`). No stickiness, no IntersectionObserver-driven active state. Panels stack naturally. 3D block visualization renders statically (no animation) or simplified.
- **Conflict with step-5 lock:** This direction supersedes the locked "pillars-as-containers" topology after user review of the Figma frame. The "scan-by-pillar" intent is preserved — visitor sees all three pillars by scrolling, no clicks required. The "all 14 children inline" intent is partially relaxed (see #3).

### 2. Signature accent — 3D isometric block visualization, one-shot animation per pillar

- Each pillar panel contains a self-contained SVG isometric scene of three shapes (one per pillar). The active pillar's shape is rendered as a **raised cube** in that pillar's brand color; the other two are **flat diamonds** in DESIGN.md inactive-slate (`#cbd5e1` stroke / `#e2e8f0` fill).
- **Motion:** on viewport entry (IO-gated, one-shot), the active pillar's cube animates from flat-diamond position to raised-cube position over `motion.duration.slow` (620ms) with `cubic-bezier(0.16, 1, 0.3, 1)` (out-expo). Honors `prefers-reduced-motion: reduce` (renders raised immediately, no animation).
- **No infinite animation introduced.** Each pillar's scene animates exactly once when its panel enters the viewport.
- **Pillar color usage:** the raised cube's fill is the pillar's brand color (`#204AF8` / `#10b981` / `#F6851B`). Diamond shapes for the other two pillars stay slate.

### 3. Child-service rendering — truncated top-5 per pillar + hub link (NOT all 14 inline)

- Each pillar panel renders the **top 5 children** (user-curated, see Plan task 0). Web3 7→5, AI 6→5, Product Studio 1→1.
- A `See all <pillar> services →` link below the truncated grid points to `pillar.hubHref` (existing routes). This becomes the pillar's primary hub CTA — **replacing the standalone `Open Web3 / Open AI / Open Studio` button pattern from the copy lock.**
- **SEO impact:** 3 child names (Liquid Staking Vaults, DAO & Governance Systems, AI Systems Integration) drop out of this section's SSR HTML. They remain reachable via:
  - The pillar hub page at `/services/<pillar>/`.
  - Their existing noindex stub pages at `/services/<pillar>/<slug>/`.
  - The footer / sitemap / internal-linking refresh (Context C2 in SESSIONS.md).
- **Conflict with step-5 lock:** This direction supersedes the locked "child services as clickable links to existing slugs (all 14 inline)" decision after user review of the Figma frame.

### 4. Hub CTA pattern — text-link with arrow, not Bauhaus split-button

- Per Figma, the pillar hub CTA renders as a text-link (`See all <pillar> services →`) inside the panel, not as the standalone Bauhaus split-arrow primary button per DESIGN.md's button signature.
- The split-arrow primary button signature is preserved for **other sections** (hero, contact CTA). This section's hub CTAs are intentionally lighter to keep visual weight on the 3D iso-block accent.
- **The 3-word verb-first hubCta strings in `services-data.ts`** (`Open Web3`, `Open AI`, `Open Studio`) are **not used** by this section in its current incarnation. They remain in the data file for use by other section consumers (mobile menu, etc.).

### 5. Eyebrow treatment — boxed pill above H2

- Per Figma, the section-intro eyebrow `WHAT WE BUILD` renders inside a 1px-bordered pill (`border-border`, `rounded-md`, `px-[12px] py-[6px]`) above the centered H2. This is a section-local treatment; the Eyebrow primitive itself is not changed.

### 7. AEO blockquote removed; lede absorbs entity-definition surface (2026-05-13)

- **Removed:** the visible `<blockquote>` between lede and pillar 01. Was a 58-word entity-definition paragraph; restated content already carried by H2 + lede + FAQ JSON-LD.
- **Lede word-count relaxed:** ≤28 → ≤45 words. The lede now absorbs the entity-definition opener, the EVM/Solana/Cosmos ecosystem fact, the single-team accountability claim, and the "for founders without an in-house CTO" buyer-persona phrase that previously lived only in the blockquote.
- **AEO surface preservation:** Hero retains its `<blockquote>` for site-wide AEO grammar — one visible extraction surface remains. The Services FAQ JSON-LD (3 Q&A blocks) remains the primary structured-data AEO surface for this section.
- **SSR/SEO impact:** lede word-count grows by ~17 words; entity definition + ecosystem fact + accountability claim still render in initial SSR HTML, now inside the lede `<p>` rather than a separate `<blockquote>`. No content loss for crawlers or LLM scrapers.
- **Tab order updated:** eyebrow → H2 → lede → pillar 01 (no blockquote stop).
- **QA checklist:** the "AEO blockquote in initial SSR HTML" item no longer applies to Services; replaced by "Lede contains entity-definition opener + ecosystem fact + accountability claim".
- **Supersedes:** locked-content-shape line 40 ("1 AEO blockquote — renders as semantic `<blockquote>`…") and the blockquote row in the seven-state matrix (line 67) — both no longer apply to Services. Hero spec unaffected.
- **Rationale:** the four-layer header (eyebrow + H2 + lede + blockquote) had H2 + lede + blockquote restating the same three pillars in three voices; reads as generic. Single tightened lede earns its space; the section's heavy lifting moves to the canvas+accordion experience below, which is the real demonstration of "three pillars, end to end".

### 6. Hard constraints honored

- SSR/SEO: H2, lede, all 11 visible child names + descriptions, all 3 hub-CTA links, all FAQ JSON-LD render server-side. (Blockquote removed per deviation #7.)
- ARIA: section uses `aria-labelledby="services-heading"`. Each pillar panel uses `<section aria-labelledby="pillar-<id>-heading">`. The sticky rail is `<nav aria-label="Service pillars">` with an `<ol>` of links anchoring to `#pillar-<id>`.
- Mobile fallback: renders all 11 visible child names + descriptions in SSR HTML at every viewport.
- `prefers-reduced-motion: reduce`: short-circuits the iso-block raise animation; all content visible immediately.
- Brand color discipline: only the three locked pillar colors used as fills. No new tinted UI introduced.
- Focus-visible: brand ring on every interactive element (rail items, child links, hub links).

## Active-pillar deep-link behavior

Sticky rail items are anchor links to `#pillar-web3`, `#pillar-ai-agents`, `#pillar-product-studio`. Clicking a rail item scrolls smoothly (`scroll-behavior: smooth`) to the corresponding panel. This gives keyboard-only and screen-reader users a fast way to jump between pillars without scrolling through. The IntersectionObserver active-state syncs after the scroll lands.

## QA checklist (carried into step 11)

- [ ] All values use tokens (no raw hex/px outside scale).
- [ ] Seven states implemented for pillar hub CTA and child-service links.
- [ ] Focus-visible ring renders on keyboard nav for every interactive element.
- [ ] Tab order: eyebrow → H2 → lede → pillar 01 (CTA → child 1 → child 2 …) → pillar 02 → pillar 03.
- [ ] Body copy contrast ≥4.5:1 (AA).
- [ ] `color.text.tertiary` used only for tertiary/disabled.
- [ ] Mobile fallback renders all child-service names + descriptions in SSR HTML.
- [ ] `prefers-reduced-motion: reduce` short-circuits any new motion.
- [ ] No infinite animations.
- [ ] Tap targets ≥44×44px on touch.
- [ ] Pillar colors match `services-data.ts`.
- [x] Lede contains entity-definition opener + ecosystem fact (EVM/Solana/Cosmos) + accountability claim. _(Replaces the deleted-blockquote AEO surface — see deviation #7.)_
- [ ] Deviations logged below (filled at step 8 once Figma is pulled).

## Parallel-session note

This branch (`section/what-we-build-redesign`) runs in parallel with `section/problem-redesign`. Per session rules: must not edit `CHANGELOG.md`, `DESIGN.md`, `app/globals.css` beyond section-scoped styles, or `MEMORY.md` in this session. Those graduate serially once both sections land on `design-revamp`.
