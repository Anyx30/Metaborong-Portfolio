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

## Rejected directions

- Hub-and-spoke / orbital / trefoil topology — the read it currently has.
- Accordion-gated child services — kills scan + GEO citability.
- Flat 9-card grid (3 pillars × 3 services) — collapses hierarchy, loses pillar voice.
- Multi-tab carousel — interaction tax on a passive-scan section.
- Ambient gradient / glow backdrops — violates DESIGN.md "no decorative gradients" rule.
- Per-child illustrations or icons — slop risk + maintenance burden across 14 children.

## Locked content shape

Source: `docs/content/sections/services.md`.

- 1 eyebrow + 1 H2 + 1 lede (above pillars, centered or left-aligned per Figma).
- 1 AEO blockquote — must render in SSR HTML, must not be hidden behind toggle.
- 3 pillars (`01 / 02 / 03`), each with: num, label, headline (≤8 words), body (1 sentence, ≤22 words), hubCta button (≤3 words verb-first), hubHref.
- Child services rendered inline per pillar (7 Web3 + 6 AI + 1 Product Studio = 14 entries), each with name + description (≤16 words).
- 3 AEO Q&A blocks — render decision deferred to step 7 (plan). Possibilities: (a) visible after pillars; (b) JSON-LD only; (c) both. **Default if undecided at impl time: emit as JSON-LD only to keep section visual tight; visible FAQ ships on dedicated FAQ section.**

## Hard constraints (DESIGN.md, non-negotiable)

- Tokens only — no raw hex, no raw px outside the scale. Section uses `<Section bg="subtle" maxWidth="wide">`.
- Pillar colors locked to `services-data.ts`: Web3 `#204AF8`, AI `#10b981`, Product Studio `#F6851B`.
- `color.text.tertiary` (`#999`) not allowed for body copy or child-service descriptions.
- Borders over shadows. Card hover follows DESIGN.md card hover spec.
- One-shot motion only — no infinite animations introduced. Reveal via `<Section>` IO gate.
- `prefers-reduced-motion: reduce` short-circuits any introduced animation.
- Tap targets ≥44×44px on all clickable rows.
- Mobile fallback renders the same IA in SSR HTML (no `display:none` on SEO-relevant child links).
- Focus-visible ring on every interactive element (pillar hub CTAs, child-service links if interactive).
- Buttons: Bauhaus signature — `radius: 0`, flat fills, 150ms transitions, no transform on hover. Primary hub CTAs may use the split-arrow pattern (text + arrow span with 1px white-15 divider).

## Open decisions (resolve at step 7 — plan)

1. **Pillar layout** — three equal columns vs. stacked rows vs. primary+two-secondaries. Resolve from Figma at step 8.
2. **Child-service interaction** — clickable rows to stub pages now (driving traffic to noindex stubs is fine — they have value as crawlable depth) OR text-only until pages are deindexed-promoted. Recommend: clickable links rendered to existing slugs in `services-data.ts`.
3. **Signature accent** — exactly one. Candidates: oversized index numerals (`01/02/03`), structural rule between pillars, single typographic mark in the eyebrow row. Locked from Figma at step 8.
4. **AEO Q&A render** — visible vs. JSON-LD only (see Locked content shape).
5. **Mobile layout** — keep current `services-mobile.tsx` `<Card>` list pattern with new copy, or unify into a single component that responsive-shifts? Recommend unify if Figma's mobile layout is structurally similar to desktop; keep split if mobile diverges (e.g., desktop is grid, mobile is stack with disclosure).

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

## Deviations from master plan

None introduced by this spec. The redesign is an exercise in *removing* a deviation (the trefoil's atmospheric backdrop, traveling pulse dot, halo-on-active, and slate inactive scheme — all section-level DESIGN.md additions logged in the now-archived 2026-05-04 spec) and returning the section to the master grammar plus one new signature accent. The single new signature accent will be logged below once locked from Figma at step 8.

### Pending deviation log (filled at step 8)

- _Reserved: signature accent description._
- _Reserved: any motion deviation introduced (must be one-shot)._
- _Reserved: any spacing/layout deviation from the standard `<Section maxWidth="wide">` two-column or three-column grammar._

## QA checklist (carried into step 11)

- [ ] All values use tokens (no raw hex/px outside scale).
- [ ] Seven states implemented for pillar hub CTA and child-service links.
- [ ] Focus-visible ring renders on keyboard nav for every interactive element.
- [ ] Tab order: eyebrow → H2 → lede → AEO blockquote → pillar 01 (CTA → child 1 → child 2 …) → pillar 02 → pillar 03.
- [ ] Body copy contrast ≥4.5:1 (AA).
- [ ] `color.text.tertiary` used only for tertiary/disabled.
- [ ] Mobile fallback renders all child-service names + descriptions in SSR HTML.
- [ ] `prefers-reduced-motion: reduce` short-circuits any new motion.
- [ ] No infinite animations.
- [ ] Tap targets ≥44×44px on touch.
- [ ] Pillar colors match `services-data.ts`.
- [ ] AEO blockquote in initial SSR HTML, not hidden behind interaction.
- [ ] Deviations logged below (filled at step 8 once Figma is pulled).

## Parallel-session note

This branch (`section/what-we-build-redesign`) runs in parallel with `section/problem-redesign`. Per session rules: must not edit `CHANGELOG.md`, `DESIGN.md`, `app/globals.css` beyond section-scoped styles, or `MEMORY.md` in this session. Those graduate serially once both sections land on `design-revamp`.
