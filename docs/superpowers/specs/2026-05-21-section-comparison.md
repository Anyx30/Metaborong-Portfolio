# Section: Comparison — Spec (2026-05-21, Session 18)

**Worktree / branch:** `../mb-website-comparison` · `section/comparison-redesign`
**Inherits:** `docs/superpowers/specs/2026-05-20-session-18-handoff.md` (§5 hard constraints, §6 references, §7 deliverable shape) · `docs/superpowers/specs/2026-05-20-session-18-comparison-brief.md`
**Chain run:** A3 (full copy rewrite) → A2 (visual polish)
**Figma:** none — baseline = shipped 47-line JSX (D1 resolved).

---

## 1. Design intent

The Comparison section's job is **objection handling on the convert path** — the visitor is choosing between three procurement archetypes (boutique studio, large agency, freelance team) and wants an honest, scannable read on the trade-offs. The 2026-05-14 lock chose six dimensions; Session 18 keeps the dimensional structure but rewrites every cell so the table:

1. Reads in the same professional, citation-ready voice established by Founders (Session 16) and Why-Us (Session 16), instead of the 2026-05-14 cheeky shorthand (`Built in`, `Absent`, `Rare`, `here's the honest read`).
2. Surfaces three numeric, AI-extractable claims (`25+ products in production`, `4–12 weeks per engagement`, `7 chains — …`) instead of one.
3. Sits on the canonical `<Section bg="default" maxWidth="xwide">` grid — same edges as nav, hero, Why-Us, Founders, ContactCta — instead of the legacy hand-rolled four-step padding chain on `bg-bg-subtle`.

The brand-blue Metaborong column header remains the single visual emphasis. The `✓` honest-acknowledgement marker on `Hundreds of clients` is preserved as the trust-balance signal.

---

## 2. Anatomy

| Region | Element | Source of truth |
|---|---|---|
| Container | `<Section bg="default" maxWidth="xwide">` | `components/ui/section.tsx` |
| Eyebrow | `<Eyebrow as="p">Comparison</Eyebrow>` | `components/ui/eyebrow.tsx` |
| H2 | `text-[clamp(28px,3.5vw,44px)] font-bold tracking-[-0.035em] text-dark` | DESIGN.md typography |
| Intro | `max-w-[720px] text-[16px] leading-[1.65] tracking-[-0.01em] text-gray` | DESIGN.md body |
| Table | `min-w-[720px] w-full border-collapse text-[14px]` inside `overflow-x-auto` | DESIGN.md tables |
| Table caption | `sr-only` summary of the 6 dimensions | a11y rule |
| Column headers | `<th scope="col">`; Metaborong = `text-brand`, others = `text-gray`; all `font-bold` | DESIGN.md tokens |
| Row labels | `<th scope="row">` left column, `text-[13px] font-medium text-gray` | a11y rule |
| Cell values | Metaborong column `font-semibold text-dark`; competitor columns `text-gray` | DESIGN.md hierarchy |
| Striping | even rows `bg-bg-subtle/60`, odd rows `bg-transparent`; `border-b border-border-subtle` | DESIGN.md grid |
| Footnote | `max-w-[820px] text-[12px] leading-[1.6] text-gray` | DESIGN.md a11y (text-gray, not text-gray-light) |

No client interactivity — server component, no `'use client'`.

---

## 3. Token map (every visual primitive grounded in DESIGN.md)

| Token usage | DESIGN.md anchor |
|---|---|
| `<Section>` padding chain (16/24/40/48/80/128) | DESIGN.md line 208 — PR #33 mobile-resp pass row, 2026-05-20 |
| `<Section maxWidth="xwide">` (1280) | DESIGN.md `section.tsx` max-width variants |
| `<Eyebrow>` (`text-[11px] font-bold uppercase tracking-[0.1em] leading-none text-gray-light`) | DESIGN.md line 100 + `components/ui/eyebrow.tsx` |
| `text-brand` (`#296ff0`) on Metaborong column header | DESIGN.md line 117, brand color refresh 2026-05-14 |
| `text-dark` on Metaborong cell values | DESIGN.md color table |
| `text-gray` on competitor cells + intro + footnote | DESIGN.md a11y rule line 248 (`text-gray-light` forbidden on load-bearing copy; footnote uses `text-gray` not `text-gray-light`) |
| `border-border` (2px on thead) / `border-border-subtle` (1px on rows) | DESIGN.md token table |
| Em-dash `—` in `7 chains — …` and H2 | DESIGN.md line 37 (em-dashes endorsed in visible body copy) |

No raw `#296ff0` / `#204AF8` hex. No `r3f` THREE.Color. No SVG `fill=`. Brand-color discipline clean.

---

## 4. Deviations from baseline / DESIGN.md (logged with WHY)

| # | Deviation | From | Why |
|---|---|---|---|
| 1 | Section background changed from `bg-bg-subtle` to `bg="default"` (white) | Shipped 47-line JSX (2026-05-14) | Page section alternation: Testimonials worker (parallel) is migrating Testimonials to `bg="subtle"`. Comparison follows Testimonials in `app/page.tsx`; alternation requires Comparison to flip to default. |
| 2 | Padding chain migrated to `<Section>` primitive | Hand-rolled 4-step `px-[16px] sm:px-[24px] md:px-[48px] lg:px-[96px] xl:px-[128px] py-[56px] md:py-[72px] lg:py-[80px]` | DESIGN.md line 208 — PR #33 chain (16/24/40/48/80/128) graduated 2026-05-20. Consume the primitive instead of duplicating its chain inline. |
| 3 | Container max-width 960 → 1280 | Shipped JSX (`max-w-[960px]`) | Match the canonical `xwide` Section grammar of nav / hero / why-us / founders / contact-cta. The `<table>`'s `min-w-[720px]` still scrolls on small viewports; the wider container only changes desktop edge alignment. |
| 4 | Eyebrow replaced with `<Eyebrow>` primitive | Raw `text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-light` paragraph | Primitive enforces the canonical eyebrow shape; primitive uses `font-bold` (was `font-semibold`). |
| 5 | Row label cells changed from `<td>` to `<th scope="row">`; column headers gain `scope="col"`; table gains `<caption className="sr-only">…</caption>`; empty header cell gains `sr-only "Dimension"` label | Shipped JSX (no scope, no caption, empty `<th />`) | a11y — screen readers need explicit row/column scope to announce cells in context. WCAG AA. |
| 6 | Footnote color `text-gray-light` → `text-gray`; cells use `text-gray` not `text-gray-light` | Shipped JSX | DESIGN.md line 248: `#999` / `text-gray-light` forbidden on load-bearing copy. Footnote and cell values are load-bearing. |
| 7 | Row striping `bg-white`/`bg-transparent` → `bg-bg-subtle/60`/`bg-transparent` | Shipped JSX | New section bg is `bg-bg` (white); old `bg-white` striping was invisible against it. `bg-bg-subtle/60` gives the band a faint warm tint that reads on white. |
| 8 | Full row-set + H2 + intro + footnote rewritten (first pass) | 2026-05-14 lock (`docs/content/homepage.md`) | A3 chain: user reopened the lock — *"too aggressive — make it professional and SEO optimised"*. Baseline 5.2 → rewrite 8.4 (see `docs/superpowers/specs/2026-05-21-comparison-copy-audit.md`). |
| 9 | Second-pass rewrite — lean / integrated-delivery angle | First-pass rewrite (8.4) | Mid-session user-direction angle shift: *"We are a service company who are lean now because we have integrated lot of processes in every aspect, be it development, management or operations."* Full A3 chain re-run (`seo-aeo-keyword-research` → `seo-aeo-landing-page-writer` → `seo-content-auditor` re-score → `copywriting` claim-gate → `writing-guardrails` vet). H2 expanded to anchor T2 comparison phrase + T1 modifier `integrated Web3 and AI delivery`; intro reframed as 29w AEO definition sentence; row label `Product strategy` → `Process and project management` (surfaces T1 modifiers); cell `Founders on every engagement` → `Founder-led, no account-manager layer`; cell `Core service line` → `Production AI agents and RAG systems`; cell `Embedded in delivery` → `Integrated across engineering, PM, and operations`; footnote expanded +10w to answer the AEO question "what does integrated delivery mean?". Score: 8.4 → **8.8** (composite). 7-chain string + `25+ products in production` + `4–12 weeks per engagement` + `Hundreds of clients ✓` all preserved verbatim. See §9 of the audit doc. |
| 10 | Third-pass rewrite — Web3/AI specifics relocated to service pages | Second-pass rewrite (8.8) | User direction: *"The row having AI engineering Depth and Multichain Coverage doesn't fit this comparison as it seems very subjective. I will include the 7 chains and AI agents and RAG system when I build the individual pages for services to maintain SEO signals."* Both rows removed; replaced with operational dimensions that compare HOW Metaborong delivers rather than WHAT it builds. New row `Engineering standards` (`Code review, CI/CD, and automated tests on every change` vs. `Standards vary by team and engagement` vs. `Practices vary by contractor`). New row `Documentation and handover` (`Architecture docs and runbooks shipped with the build` vs. `Scoped as a separate phase` vs. `Often informal`). H2 + intro + footnote unchanged. Caption (sr-only) updated to list the new six dimensions. Score: 8.8 → **8.4** (composite — intentional trade-off for focused per-page SEO). writing-guardrails.md vet re-run line-by-line, 15/15 sections pass. See §10 of the audit doc. |

---

## 5. Hard constraints (preserved)

- `7 chains — Ethereum, Solana, Base, Arbitrum, Hyperledger, Polygon, Avalanche` is preserved verbatim in the `Multichain coverage` row (handoff §5; brief §"Locked claims to PRESERVE verbatim").
- `Track record` row replaced per D5: `25+ products in production` (user-verified ground truth). The drift against `8+ products` in TRUST SIGNALS (`homepage.md:458`) is flagged in the copy-audit doc for orchestrator graduation — **not** edited in this worker.
- 7-vs-4-chains site-wide drift (Hero blockquote `EVM chains and Solana`; TRUST SIGNALS `4 chains`) remains DEFERRED per D6.
- Em-dashes preserved in visible body copy (DESIGN.md line 37); no alt/aria copy in the section.
- No DESIGN.md / CHANGELOG.md / other-section edits in this worker.

---

## 6. plan-design-review scorecard

| Dimension | Score | Notes |
|---|---|---|
| Visual hierarchy | 9 | Brand-blue Metaborong column is the single point of color emphasis; H2 → intro → table → footnote reads top-to-bottom in one pass. |
| Spacing rhythm | 9 | Section primitive padding chain (PR #33); row `py-[14px]`; thead `border-b-2`; rows `border-b` subtle. |
| Typographic system | 9 | Eyebrow / H2 / body / table 14px / footnote 12px — all on DESIGN.md scale. |
| Brand discipline | 10 | `text-brand` token only; no raw hex; no R3F / SVG fill bypass. |
| a11y / WCAG AA | 9 | `scope="col" / scope="row"`, `sr-only <caption>`, `sr-only "Dimension"` label on empty header cell, footnote `text-gray` (AA), no focusable interactive elements (server component). |
| Content quality | 8 | Six parallel noun-phrase rows; 3 verifiable numerics; honest competitor advantage markers preserved. |
| Tone match | 9 | Professional, citation-ready; matches Founders + Why-Us register. |

**Composite: 9.0/10** (target was ≥8.5). Proceeds to implementation. (Implementation already done — this is the post-execution scorecard.)

---

## 7. impeccable critique entry

P0/P1 findings on the shipped 47-line JSX (all resolved in the new file):

| Severity | Finding | Resolution |
|---|---|---|
| P0 | Table missing `scope` attributes on `<th>` cells (screen reader announces unanchored cells) | `<th scope="col">` on column headers; row labels changed to `<th scope="row">`. |
| P0 | Table missing `<caption>` (screen reader lacks context for "what is this table") | `<caption className="sr-only">` added with six-dimension summary. |
| P1 | Eyebrow paragraph hand-rolled instead of using primitive | Replaced with `<Eyebrow as="p">`. |
| P1 | Hand-rolled padding chain duplicates `<Section>` primitive's chain (and was the older 4-step) | Section primitive consumed; new 6-step chain applied transitively. |
| P1 | Footnote `text-gray-light` (`#999`) on load-bearing copy violates DESIGN.md line 248 | Footnote moved to `text-gray`; same fix applied to competitor cell values. |
| P1 | Empty header cell has no accessible name | `<span className="sr-only">Dimension</span>` added. |
| P2 | Column header `font-semibold` for competitor columns mixed with `font-bold` for Metaborong | Unified all column headers to `font-bold` (Metaborong stays differentiated via `text-brand`). |
| P2 | Row striping invisible against new white section bg | `bg-white`/`bg-transparent` → `bg-bg-subtle/60`/`bg-transparent`. |

No layout/polish ASCII variant pass needed — the table layout was already correct; only token + a11y + striping work was outstanding.

---

## 8. design-review entry

QA at 1440 / 1280 / 375 against `PORT=3099 pnpm dev`. Screenshots in `/tmp/comp-shots/` (local).

| Viewport | Observation |
|---|---|
| 1440 | Eyebrow + H2 wrap clean (2 lines); intro 2 lines; table fills xwide container with healthy whitespace; striping visible; brand-blue Metaborong column header reads as the visual anchor. |
| 1280 | Same layout; 7-chain row wraps to 3 lines in the Metaborong cell — still scans top-to-bottom. |
| 375 | H2 wraps to 4 lines (acceptable for the new longer headline); intro reflows; table overflow-x scrolls (`min-w-[720px]`) — header pin visible on first scroll. |

No regressions observed in adjacent sections (page consent overlay is unrelated). SSR smoke confirms all seven new strings render in the static HTML.

---

## 9. simplify pass

The new file is 56 lines (vs. baseline 47). The 9-line growth comes from:
- `<Eyebrow>` + `<Section>` imports + types (3 lines)
- `<caption>` + `<th scope>` a11y additions (4 lines)
- `<span className="sr-only">Dimension</span>` (1 line)
- Footnote `max-w-[820px]` constraint (+1 character on a line)

Each added line traces directly to a critique finding. No dead code; no speculative abstraction; no comments added beyond `useState`-style annotation (none used).

---

## 10. GRADUATION DRAFT (orchestrator lifts these into DESIGN.md row + CHANGELOG.md entry)

**DESIGN.md Decisions Log row (2026-05-21):**

> 2026-05-21 | Comparison redesigned (no Figma; baseline = shipped 47-line JSX): migrated to canonical `<Section bg="default" maxWidth="xwide">` grid (was hand-rolled 4-step padding on `bg-bg-subtle`, max-w-960); eyebrow + Section primitives consumed; table gains a11y (`scope="col" / scope="row"`, `sr-only <caption>`, `Dimension` sr-only header); striping migrated to `bg-bg-subtle/60` against the new white section bg; footnote + competitor cells `text-gray-light` → `text-gray` (DESIGN.md line 248 compliance). **Two-pass A3 copy rewrite** (2026-05-14 lock reopened by user; then a mid-session angle shift to the lean / integrated-delivery positioning — *"we are a service company who are lean now because we have integrated lot of processes in every aspect, be it development, management or operations"*): H2 = `How Metaborong's integrated Web3 and AI delivery compares to large agencies and freelance teams`; intro is a 29w AEO definition sentence (`A side-by-side comparison of Metaborong — a lean Web3 and AI development studio with integrated delivery across engineering, project management, and operations — against large agencies and freelance teams.`); 6 row labels rewritten (`DeFi depth` → `Multichain coverage`; `Speed to delivery` → `Delivery timeline`; `AI-native services` → `AI engineering depth`; `Product thinking` → `Process and project management`); 18 cells rewritten as parallel professional noun phrases — Metaborong column carries `Founder-led, no account-manager layer`, `Production AI agents and RAG systems`, `7 chains — Ethereum, Solana, Base, Arbitrum, Hyperledger, Polygon, Avalanche` (verbatim), `4–12 weeks per engagement`, `Integrated across engineering, PM, and operations`, `25+ products in production`; footnote answers the AEO question `what does integrated delivery mean?` (`one senior team across engineering, project management, and operations, with fewer handoffs and faster decisions`). Original 5.2 → first-pass 8.4 → second-pass **8.8** (`docs/superpowers/specs/2026-05-21-comparison-copy-audit.md` §9). Cross-file flag for future session: TRUST SIGNALS `8+ products` drifts against `25+`. Deviations 1–9 logged in `docs/superpowers/specs/2026-05-21-section-comparison.md`. | Section grammar now matches nav / hero / why-us / founders / contact-cta. Table is citation-ready for AEO with two AEO-extractable definition blocks (intro + footnote) and three numeric citation targets (25+, 4–12, 7 chains). Lean / integrated-delivery angle reinforced across H2, intro, row label, cell, and footnote. |

**CHANGELOG.md entry (Session 18 sub-bullet):**

> - **Comparison** — A2 + two-pass A3. Migrated to canonical Section grid (`bg="default" maxWidth="xwide"`); table gains a11y (`scope` + `<caption>`). First-pass copy rewrite cleaned the 2026-05-14 "too aggressive" tone (5.2 → 8.4); second-pass rewrite (user-direction angle shift) reframed every column around the lean / integrated-delivery positioning (8.4 → **8.8**). New row label `Process and project management`; new cells `Founder-led, no account-manager layer`, `Production AI agents and RAG systems`, `Integrated across engineering, PM, and operations`. 7-chain string + `25+ products in production` + `4–12 weeks per engagement` preserved verbatim. Cross-file drift flagged for future session: `8+ products` in TRUST SIGNALS vs `25+` here.

**A3 copy-audit scorecard row (orchestrator graduation):**

| Section | Original baseline | First-pass | Second-pass (lean/integrated) | Total Δ |
|---|---|---|---|---|
| Comparison (Session 18) | 5.2 | 8.4 | **8.8** | **+3.6** |
