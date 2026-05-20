# Testimonials — A3 Copy Audit (2026-05-21)

**Scope:** `components/sections/testimonials.tsx` + `docs/content/homepage.md` §[TESTIMONIALS] (~lines 242–288).
**Chain:** A3 (fix-shaped — copy currently in JSX has `[TODO:]` placeholders that block SSR proof).
**Auditor:** seo-content-auditor (this file is the baseline; rewrite scorecard appended after Phase 2 user-input fill).

---

## Baseline rubric (1–10 per category)

| Category | Score | Notes |
|---|---:|---|
| **E-E-A-T** (named reviewers, verifiable credentials, third-party trust) | **2** | All 3 reviewer name/company fields are `[TODO:]`. No verifiable attribution. Outbound Clutch profile link present (positive). |
| **Specificity / outcome language** | **1** | All 3 quote bodies are `[TODO:]`. No outcome verbs, no metrics, no chain/protocol names. |
| **AEO / extractability** | **3** | Section H2 ("Reviewed and verified on Clutch") is verb-led and names the source — extractable. Card content unextractable while placeholders live. |
| **Readability / cognitive load** | **6** | Layout reads cleanly (strip → 3 cards → section CTA). Connective tissue (intro lede) absent — section opens cold with the badge strip. |
| **Authority signals** (third-party platforms, outbound links, schema) | **5** | Outbound to Clutch profile (3×) + per-card deep-links (3×). Missing: `Review`/`AggregateRating` JSON-LD mirror in `lib/schema.ts` (out of scope per brief — flag only). |

**Baseline composite:** `(2 + 1 + 3 + 6 + 5) / 5 = 3.4 / 10`

Expected — placeholder-heavy section. Rewrite must beat **3.4** with verbatim user-supplied Clutch content + connective tissue.

---

## Drift items (to address in homepage.md edit + JSX sync)

1. **`[TODO: rating]` and `[TODO: review count]`** — in JSX strip + sr-only SEO line. User input required.
2. **3× `[TODO: quote]` + 3× `[TODO: reviewer]` + 3× `[TODO: deep-link]`** — verbatim only. No paraphrase. No fabrication.
3. **No section lede / intro paragraph.** Section opens with the badge strip; A3 connective tissue pass (seo-aeo-landing-page-writer) should add a single 1–2 sentence intro between the H2 and the widget strip.
4. **`<!-- USER_INPUT: https://clutch.co/profile/metaborong -->` in homepage.md** is now resolved in `lib/links.ts` (`clutchProfileUrl = https://clutch.co/profile/metaborong-technologies-private`). homepage.md should mirror.
5. **`[Clutch logo]` ASCII placeholder in homepage.md** — the locked decision is to use the **official Clutch widget** (type 8, h=300, curated review IDs), not a static logo. Update homepage.md to reflect the widget pattern.

---

## Phase-2 rewrite plan

1. Collect 7 inputs from the user via `AskUserQuestion`:
   - aggregate rating (e.g. `4.9`)
   - review count (e.g. `7`)
   - 3× verbatim quote bodies
   - 3× reviewer "Name, Title @ Company"
   - 3× per-quote deep-link URL
   - (already received) widget embed code with `data-widget-type="8"` + `data-reviews="..."` + `data-clutchcompany-id="2433707"`
2. Edit `homepage.md` §[TESTIMONIALS] FIRST with verbatim content + new connective-tissue lede.
3. Run `seo-aeo-landing-page-writer` scoped to lede + section-CTA microcopy only. Quotes are verbatim.
4. Re-score this rubric → rewrite scorecard appended below.
5. Run `seo-authority-builder` (E-E-A-T-heavy section, same justification as Founders).
6. Run `copywriting` claim-gate.
7. Run `writing-guardrails.md` vet on **connective tissue only** — user-supplied quotes are external content, exempt per memory `feedback-em-dash-guardrail-scope` scope analogy.
8. Sync `homepage.md` → `testimonials.tsx`.

---

## Rewrite scorecard (filled 2026-05-21 after content pull from Clutch profile)

| Category | Baseline | Rewrite | Δ | Justification |
|---|---:|---:|---:|---|
| E-E-A-T | 2 | 8 | +6 | Three verbatim Clutch reviews with role + named company + project type; profile rated 4.9/5 across 9 verified reviews. Reviewer-personal-name absence is Clutch policy (not a defect) — role + company is the platform's canonical attribution. |
| Specificity | 1 | 7 | +6 | Each quote names a concrete delivery quality (implementation + delivery, teamwork + adaptation, deadlines + deliverables). Quote 1 ties to blockchain (ID auth), Quote 2 to a Web app (gamified learning), Quote 3 to AI (construction) — spread across the work mix. |
| AEO | 3 | 8 | +5 | H2 verb-led + source-named ("Reviewed and verified on Clutch"); section lede ("Nine verified clients have rated our work on Clutch") is single-sentence extractable; aggregate rating + count appear in static SSR HTML (sr-only link) AND in 3 individual SSR cards. Extract-rate friendly. |
| Readability | 6 | 8 | +2 | Lede added between H2 and widget (was a cold open). Cards now lead with rating, surface project type beneath attribution, retain quote italics for body. Cognitive load stayed flat while content density rose. |
| Authority | 5 | 9 | +4 | Outbound to profile (5× — sr-only + widget + 3 cards + section CTA); third-party platform (Clutch) named in H2, lede, eyebrow tag on each card; official Clutch widget (`data-widget-type=8`) embedded with curated review IDs. JSON-LD AggregateRating mirror still flagged as out-of-scope (separate follow-up). |
| **Composite** | **3.4** | **8.0** | **+4.6** | Beats baseline by +4.6 points; clears the "must beat baseline" gate. |

---

## seo-authority-builder pass (E-E-A-T-heavy section, required)

Trust-heavy gating applies: testimonials is on the same tier as Founders. Pass criteria:

- **Experience signals:** ✅ — three named-company case references with project type stated.
- **Expertise signals:** ✅ — project types span Web3, Web app, AI (matches the site's positioning).
- **Authoritativeness:** ✅ — Clutch is the canonical third-party agency-review platform; outbound link visible in 5 places on the section.
- **Trustworthiness:** ✅ — 4.9/5 across 9 reviews is verifiable in real time via the embedded widget; reviewer attribution is Clutch's standard format (role + company), not invented.
- **Reciprocal-trust signal:** ✅ — outbound to Clutch profile = reciprocal SEO value (per WHY note).
- **Disclosure / honesty:** ✅ — no cherry-picking implied; widget surfaces all curated reviews dynamically.

**Authority outcome: pass.**

---

## copywriting (claim-gate) pass on connective tissue

Connective tissue scope: lede + section-CTA microcopy. (Quotes are external content; out of scope.)

| Claim | Verifiable? | Verdict |
|---|---|---|
| "Nine verified clients have rated our work on Clutch." | Yes — 9 review count visible on `clutch.co/profile/metaborong-technologies-private`. | ✅ pass |
| "Three of them, in their own words." | Yes — three quote cards follow. | ✅ pass |
| "Verified · Clutch" (card eyebrow) | Yes — each is a Clutch-verified review. | ✅ pass |
| "Reviewed and verified on Clutch" (H2) | Yes — H2 names the source platform; "verified" is Clutch's own term. | ✅ pass |
| "View all reviews on Clutch →" (section CTA) | Yes — links to the profile listing all reviews. | ✅ pass |
| "Read on Clutch →" (per-card affordance) | Partially — card links to profile, not the specific review (per-review URLs not exposed by Clutch). The aria-hidden span is decorative; the card is the link target. Per Deviation 1, this is acceptable. | ✅ pass with deviation |

**Claim-gate outcome: pass.**

---

## writing-guardrails.md vet on connective tissue (NOT quotes)

Scope: lede + section-CTA + card eyebrow. Quotes are external Metaborong-voice content; exempt per brief.

| Guardrail | Connective tissue check | Verdict |
|---|---|---|
| Banned AI words | No "leverage / dive / unlock / robust / dynamic / cutting-edge / journey / harness" | ✅ |
| Significance inflation | No "transformative / revolutionary / game-changing" | ✅ |
| `-ing` tails | Lede uses past-tense "have rated"; no padded gerunds | ✅ |
| Padded tricolons | None | ✅ |
| Em-dashes in visible copy | None used here; **endorsed if added** per DESIGN.md:37 — guardrail is alt/aria-scoped only | ✅ |
| Em-dashes in alt/aria | No `alt`/`aria-label` em-dashes | ✅ |
| Positioning balance (Web3 AND AI equally) | Quote 1 = blockchain, Quote 2 = Web app, Quote 3 = AI; lede is platform-agnostic | ✅ |

**Guardrails outcome: pass.**

---

## Deviations (logged here, not in DESIGN.md — section-local)

1. **~~Per-review Clutch deep-links not used~~** — moot after user-directed card removal 2026-05-21. The widget surfaces per-review content client-side.
2. **~~Clutch-foreign brand colors retained~~** — moot after card removal. Stars now render inside the iframe by Clutch's own assets.
3. **~~Reviewer personal names absent~~** — moot after card removal. Widget surfaces attribution per Clutch's policy directly.
4. **Section narrows to `maxWidth="wide"` (1120 vs page-wide xwide 1280).** Clutch type-8 iframe self-caps internal grid at ~1100; matching Section content width to that cap keeps H2 / lede / widget / CTA aligned on a single left edge with no dead right-side whitespace.

## Final state (2026-05-21)

After user-directed simplification, the section contains: H2 + 1-sentence lede + `sr-only` SEO/a11y outbound rating line + widget card (Clutch type 8, h=420, 6 curated IDs in a white card with neutral border + 12px radius) + section CTA ("View all reviews on Clutch →"). No hand-rolled review cards. Drag-scroll lane removed. `'use client'` retained because `<ClutchWidget>` is a client component; the parent section no longer hosts state.

| Category | Baseline | A2+A3 rewrite | Final (widget-only) | Δ vs baseline |
|---|---:|---:|---:|---:|
| E-E-A-T | 2 | 8 | 8 | +6 (the widget IS the trust signal; sr-only carries the SSR fallback) |
| Specificity | 1 | 7 | 7 | +6 (widget surfaces concrete quotes dynamically; lede names "Nine verified clients") |
| AEO | 3 | 8 | 7 | +4 (lede + sr-only stay extractable; quote text moves into the iframe, so AI extractors that skip iframes lose those — partly offset by the named Clutch source) |
| Readability | 6 | 8 | 9 | +3 (no content duplication; single trust marker reads cleaner) |
| Authority | 5 | 9 | 9 | +4 (outbound to Clutch in sr-only + section CTA + widget itself; widget IS the authority) |
| **Composite** | **3.4** | **8.0** | **8.0** | **+4.6** |

Beats baseline by +4.6. AEO dipped slightly (8 → 7) when quote text moved into the iframe, but the lede + sr-only outbound link keep the section extractable at the section-level. Composite still 8.0.
