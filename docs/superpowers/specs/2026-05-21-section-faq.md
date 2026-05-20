# Section spec — FAQ (Session 18-faq)

**Date:** 2026-05-21
**Branch:** `section/faq-redesign`
**Files:** `components/sections/faq.tsx` (rewritten, now server) · `components/sections/faq-accordion.tsx` (new, client) · `components/sections/faq-data.ts` (data rewrite — same shape).
**Visual reference (non-canonical):** `docs/superpowers/assets/2026-05-20-faq-reference.jpeg` (1898×898 JPEG, no Figma node — D2 confirmed at session-18 handoff).
**Chain:** A2 (visual polish layered on top of A3 copy rewrite) — `docs/superpowers/specs/2026-05-20-session-18-faq-brief.md` for the full chain.

---

## Design intent

A founder reads the FAQ near the end of the page tail, *after* the work has been described and right before Contact CTA. They're scanning for the one objection or detail that decides whether to email. The section needs to do two jobs at once:

1. Make every answer **citation-ready for AI search engines** (Perplexity, ChatGPT, AI Overviews) — every Q is a real third-person search query, every A leads with the entity definition, ≤50 words, self-contained.
2. Visually settle the reader into a **two-column hierarchy** matching the JPEG: a left rail that grounds the section (eyebrow, H2, a quiet "still have questions? — email the team" card) and a right rail that lets the eye scan the question list.

The accordion stays — it's the established AEO pattern for this section type and the JPEG keeps it. The change is the **left rail** (which the current build doesn't have at all) and the **a11y / SSR upgrade** to the accordion (focus-visible ring, `aria-controls`, `hidden` attribute instead of conditional render so every answer renders in the static HTML).

---

## Anatomy

```
<Section bg="default" maxWidth="xwide" id="faq">           (consumes the PR #33 six-step padding chain;
                                                            auto-wraps in <Reveal>)
  <div grid 1-col / md:[360px | 1fr]>
    ┌─ LEFT (sticky on md+) ────────────────────────┐
    │  <Eyebrow>FAQ</Eyebrow>                       │
    │  <h2>Frequently asked questions</h2>          │
    │  ┌─ helper card (hidden on mobile) ────────┐  │
    │  │ "Don't see your question?"              │  │
    │  │ "Email the founders directly…"          │  │
    │  │ contact@metaborong.com →                │  │
    │  └─────────────────────────────────────────┘  │
    └───────────────────────────────────────────────┘
    ┌─ RIGHT (client component: <FaqAccordion>) ────┐
    │  border-t                                     │
    │  ┌─ Q1 (default open) ──────────────────────┐ │
    │  │ button: Q + chevron(rotate-180 if open)  │ │
    │  │ panel(role=region): A                    │ │
    │  └──────────────────────────────────────────┘ │
    │  ┌─ Q2 … Q7 (collapsed) ────────────────────┐ │
    │  │ button: Q + chevron                      │ │
    │  │ panel(hidden=true): A still in HTML      │ │
    │  └──────────────────────────────────────────┘ │
    │  border-b on each row                         │
    └───────────────────────────────────────────────┘
</Section>
```

### JPEG → project mapping

| JPEG element | Project equivalent |
|---|---|
| "FAQS" eyebrow with circle-question icon | `<Eyebrow>FAQ</Eyebrow>` — icon dropped; eyebrow primitive is text-only by DESIGN.md grammar |
| Bold serif/sans display H2 "Frequently Asked Questions!" | H2 `text-[clamp(28px,3.5vw,44px)] font-bold tracking-[-0.035em]` — Satoshi, no exclamation (matches site voice; the JPEG exclamation reads as agency-cheery) |
| Left CTA card "Can't Find Your Answer Here? — Schedule a Call" | Helper card "Don't see your question? — contact@metaborong.com →" (text + underlined email link, no button — avoids competing with the Contact CTA section directly below) |
| Right-column accordion with rounded card per row, light-tan fill, "+ / ×" toggle icons | Right-column accordion with `border-b`-separated rows, white fill, `ChevronDown` rotated on open. Radius-0 to match DESIGN.md card grammar (the 2026-05-19 Why-Us "flush zero-radius" row in the Decisions Log). |
| First item visibly expanded | `useState<number \| null>(0)` — first item open on mount |

---

## Token map

Every value below traces to DESIGN.md.

| Style | Token / value | Source |
|---|---|---|
| Section bg | `bg-bg` (white) | Surface alias `color.surface.base`. |
| Section padding (h) | `px-[16px] sm:px-[24px] md:px-[40px] lg:px-[48px] xl:px-[80px] 2xl:px-[128px]` | PR #33 six-step chain (DESIGN.md decisions log 2026-05-20). Inherited via `<Section>`. |
| Section padding (v) | `py-[48px] md:py-[64px] lg:py-[72px]` | `<Section>` default. |
| Max width | `max-w-[1280px]` | `xwide` per `<Section>` variants. |
| Eyebrow | `Eyebrow` primitive | DESIGN.md eyebrow row. |
| H2 | `clamp(28px,3.5vw,44px) / 700 / -0.035em / leading-1.05` | Same scale used in why-us, services, comparison. |
| Body Q (button label) | `16–17px / 600 / -0.02em / leading-1.3` | `font.size.base`/h3-step typography. |
| Body A | `15px / 400 / -0.01em / leading-1.7` | `font.size.sm` + prose line-height per DESIGN.md typography section. |
| Card (helper) | `border border-border p-[24px]`, radius-0 | DESIGN.md border-default; flush zero-radius per Why-Us 2026-05-19 deviation. |
| Helper email link | `text-[13px] / 600 / underline / underline-offset-3` + brand on hover | Inline anchor pattern (no Button primitive — Button reserved for primary CTAs). |
| Accordion row border | `border-b border-border` | `color.border.default`. |
| Accordion chevron | `lucide-react/ChevronDown 18px / text-gray` + `transition-transform duration-200 rotate-180 when open` | `motion.duration.fast` (~250ms) applies on accordion-expand per DESIGN.md motion section. |
| Button tap target | `min-h-[56px] / py-[20px]` | DESIGN.md ≥44×44px tap target rule. |
| Focus ring | `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand` | DESIGN.md focus.ring token. |
| Grid cols | `md:grid-cols-[minmax(0,360px)_1fr]` + `md:gap-[64px] lg:gap-[96px]` | Two-column section pattern (services, founders) extended. |
| Sticky left | `md:sticky md:top-[96px] md:self-start` | Below the sticky nav (~80px) with breathing room. |

---

## Hard constraints (enforced)

- **`lib/schema.ts` `faqSchema` mirrors `faq-data.ts` byte-for-byte** — already true by construction (`mainEntity: faqs.map(...)`), so editing `faq-data.ts` is sufficient. **No edit to `lib/schema.ts` required.**
- **Em-dashes endorsed in visible body** per DESIGN.md:37 / memory `feedback-em-dash-guardrail-scope` — preserved.
- **Web3 AND AI equal pillar** per memory `positioning-web3-and-ai-equal` — Q5 and Q7 explicitly carry both with equal weight.
- **D6 7-vs-4-chains drift stays deferred** — no chain count in answers.
- **Brand color discipline** — no raw hex; the only color-bearing styles inherit from tokens (`text-dark`, `text-gray`, `text-gray-light`, `border-border`, `bg-bg`).
- **Mobile fallback renders server-side** — accordion answers are in the DOM via `hidden` attribute (not conditional render) so SEO/AEO/SSR see all 7 Q&As whether the row is open or closed.

---

## Deviations from master plan

| # | Deviation | Why |
|---|---|---|
| 1 | **Two-column layout** with sticky title rail (md+) — currently sections that aren't services/founders/contact use single-column. | Matches the JPEG layout intent. The sticky title rail solves a tail-of-page scrollbore problem — the title disappears as soon as the reader is two questions in; sticky keeps the "you are reading: FAQ" anchor visible. |
| 2 | **Default-open first item** instead of all-closed. | JPEG matches. Also surfaces Q1 (the definition of a Web3 development company) in the visual first-fold of the section — the highest AEO-value answer. |
| 3 | **Helper card on left rail (md+ only)** instead of a section-level "still have questions?" line. | Mobile gets the accordion and nothing else (helper would push the accordion below the fold on small screens). The card is `hidden md:block`. |
| 4 | **`hidden` attribute on collapsed answer panels** instead of conditional `{open === i && (...)}` rendering. | All 7 answers ship in the static HTML — better AEO extraction (Perplexity et al don't need to execute JS to see Q4's answer). The Web Accessibility-Initiative pattern for disclosure widgets explicitly endorses this. |
| 5 | **Split into `faq.tsx` (server) + `faq-accordion.tsx` (client)**. | The Section primitive is server-side (auto-wraps in Reveal); the accordion needs `'use client'` for `useState`. Splitting lets the static shell (title + helper card) render via SSR and benefit from `<Reveal>`, while the accordion stays client-only. Standard Next.js 16 App Router pattern. |

---

## A11y acceptance criteria

- [x] Each accordion trigger is a `<button type="button">` with `aria-expanded` reflecting state, `aria-controls` pointing to the panel `id`, and an `id` for `aria-labelledby` back-reference.
- [x] Each panel has `role="region"` + `aria-labelledby` + `hidden` toggled by state.
- [x] Chevron icon has `aria-hidden="true"`.
- [x] `focus-visible` outline (brand ring, 2px, 2px offset) on every trigger.
- [x] Tap target ≥56px tall (>44px floor).
- [x] Keyboard: Tab moves between triggers; Enter/Space toggles. No Arrow/Home/End binding — this is a *disclosure* pattern (each row independent), not a *single-select accordion* composite widget, per WAI-ARIA Authoring Practices 1.2.

---

## Plan-design-review scorecard (pre-execution)

| Dimension | Score / 10 | Notes |
|---|---|---|
| Hierarchy / scannability | 9 | Two-column with sticky title; right column reads as a single vertical scan list. |
| AEO surface area | 9 | All 7 Qs are real search queries; all 7 As are in SSR HTML; FAQPage JSON-LD intact. |
| Accessibility | 9 | Focus-visible, aria-controls, hidden attribute, tap targets, no overloaded keyboard pattern. |
| Token discipline | 9 | All values trace to DESIGN.md; no raw hex/px outside the established clamp pattern. |
| Voice / claim discipline | 9 | A3 audit baseline 6.4 → rewrite 8.8 (copy-audit doc). |
| Cohesion with shipped sections | 8 | Matches services / founders / contact-cta two-column language; flush zero-radius helper card matches Why-Us decisions log row. |
| **Composite** | **8.8** | ≥8.5 — proceed to execution. |

---

## impeccable critique entry

(post-execution — to fill in after running through the critique step)

**Critique pass — 2026-05-21:** standard accordion a11y pass against the WAI-ARIA disclosure pattern. Findings:

- **P0:** Original `faq.tsx` rendered the panel via `{open === i && (...)}` — collapsed answers were absent from static HTML, hurting AEO extraction. **Fixed:** use `hidden` attribute on always-rendered panel.
- **P0:** No `aria-controls` linking trigger to panel; no panel `role="region"` / `aria-labelledby`. **Fixed:** added `id` / `aria-controls` / `role="region"` / `aria-labelledby` quartet.
- **P1:** No `focus-visible` outline on the trigger button. **Fixed:** `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand`.
- **No-op:** Section `id="faq"` is owned by the `<span id="faq" class="block scroll-mt-[64px]" aria-hidden="true" />` anchor in `app/page.tsx` (project-wide pattern for every navigable section). Don't add a duplicate id on the Section.
- **P1:** Chevron icon was decorative but not marked. **Fixed:** `aria-hidden="true"`.
- **P2:** Section used the 4-step horizontal padding chain (`md:px-[48px] lg:px-[96px] xl:px-[128px]`) — drifted from PR #33 six-step lock. **Fixed:** migrated to `<Section>` primitive.
- **Skip:** Arrow / Home / End keys not bound (single-disclosure pattern, not strict accordion composite widget — WAI-ARIA APG endorses either).

---

## design-review entry

(post-execution — to fill in after live QA at 1440 / 1280 / 375)

**design-review pass — 2026-05-21:**

- **1440:** Two-column grid renders with left rail ~360px sticky to `top: 96px`. Helper card sits below the H2. Accordion right column hits the 720px effective inner width with comfortable line-length on answer prose. First Q open by default; chevron rotates on click. ✅
- **1280:** Same grid; slightly tighter gap. ✅
- **375 (iPhone SE):** Helper card hidden; left rail collapses into a 1-col stack above the accordion. Accordion rows full-width; tap targets 56px tall. ✅
- **Keyboard:** Tab cycles through 7 triggers; Enter/Space toggles; focus ring visible (brand-blue 2px) on each trigger. No traps. ✅
- **Reduced motion:** chevron rotation runs at 200ms; honoring `prefers-reduced-motion: reduce` via global Reveal short-circuit. ✅
- **SSR HTML:** `curl -s localhost:3098 | grep -c '<p class="text-\[15px\]'` returns 7 — all 7 answer paragraphs present in static HTML. ✅

---

## GRADUATION DRAFT

(post-merge — copy into DESIGN.md decisions log + CHANGELOG.md at end-of-session graduation by orchestrator)

**DESIGN.md row (2026-05-21):**

> FAQ section redesigned (A2 visual polish layered on A3 copy rewrite, Session 18-faq). Single-column accordion → **two-column layout with sticky title rail + md+ helper card**, consuming the canonical `<Section bg=default maxWidth=xwide>` primitive (PR #33 six-step padding chain). All 7 Q&As rewritten as real third-person AEO search queries; A3 audit 6.4 → 8.8. Accordion a11y hardened: `focus-visible` outline, `aria-controls`/`aria-labelledby`/`role="region"` quartet, panels rendered with `hidden` attribute (all 7 answers in SSR HTML for AEO extraction), tap target 56px. Deviations 1–5 in `docs/superpowers/specs/2026-05-21-section-faq.md`. `lib/schema.ts` `faqSchema` mirror auto-honored via existing `.map()` derivation (no edit). `homepage.md:558` AEO checklist count corrected 8 → 7.

**CHANGELOG.md sub-bullet (under the 2026-05-21 Session-18 entry):**

> **FAQ** — two-column redesign + full A3 copy rewrite. Every Q is now a real search-form query (AEO target); every A ≤50 words, self-contained. Layout: sticky title rail (md+) + helper card with founders' email + accordion right column with first item default-open. A11y: focus-visible ring, full ARIA disclosure quartet, panels in SSR HTML. Split into `faq.tsx` (server, uses `<Section>`) + `faq-accordion.tsx` (client). Schema mirror auto-honored.
