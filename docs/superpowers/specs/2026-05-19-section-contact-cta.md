# ContactCta Section — Redesign Spec & Deviation Log

**Date:** 2026-05-19
**Section:** Contact CTA (`components/sections/contact-cta.tsx`)
**Master spec:** `DESIGN.md`
**Figma source:** file `mQsbMuw0spVgIu7jXirr3o`, node `233:261`
(`https://www.figma.com/design/mQsbMuw0spVgIu7jXirr3o/Metaborong-Portfolio?node-id=233-261`)
**Copy chain (A3 re-run):** `docs/superpowers/specs/2026-05-19-contact-footer-copy-audit.md`
**Workflow:** A1 redesign + A3 copy chain woven in (Session 17, **direct on
`design-revamp`** — no worktree; ContactCta then Footer, sequential).

## Design intent

Flip the dark placeholder CTA to the light, Figma-faithful **final conversion
moment**: centered `Eyebrow`-free stack — uppercase H2 → A3 sub → one brand-blue
**split-arrow primary** button — over a **full-width ASCII-hills raster anchored
to the section bottom**. One sentence: *the last thing the visitor reads should
make emailing a founder feel low-risk and obvious.*

`#contact` anchor + nav wiring **unchanged**. Component export stays
`ContactCtaSection`; `app/page.tsx`/`nav.tsx` untouched.

**Anchor wiring:** the `#contact` scroll target is an external
`<span id="contact" class="block scroll-mt-[64px]" aria-hidden>` at
`app/page.tsx:80` **before** `<ContactCtaSection/>`. `app/page.tsx` is out of
scope; `contact-cta.tsx`'s `<Section>` **must NOT** set `id="contact"` (duplicate
id). Section renders with no `id`.

## Anatomy (Figma → project)

- **Container:** canonical `<Section bg="default" maxWidth="xwide">` (the
  Why-Us/Founders precedent) → `bg-bg`, content `max-w-[1280px]`, px chain
  `px-[16px] sm:px-[24px] md:px-[48px] lg:px-[96px] xl:px-[128px]`, default
  vertical padding, auto-`<Reveal>`. (Figma `#fffffc` → `--color-bg`; preceding
  FAQ section governs alternation — verify the bg alternation holds on the live
  page at implementation; switch to `bg="subtle"` only if FAQ is `bg-bg`.)
- **Content stack:** centered column, ~`max-w-[640px]`, `text-center`,
  vertical rhythm on the locked space scale (no one-off px gaps).
  - **H2** — uppercase, Satoshi 900, `font.size.h2` clamp, `-0.03em`,
    `text-dark`. (Figma 48px Space Grotesk Bold → project scale; px = proportion,
    project scale wins — Deviation 1.)
  - **Sub** — base copy, `text-gray`, A3-locked (below).
  - **Primary button** — brand-blue **split-arrow** signature, radius-0
    (DESIGN.md §"Split-arrow primary signature" + Bauhaus radius-0 — keep the
    existing two-span pattern, **not** Figma's plain filled button; Deviation 2):
    text span (solid `bg-brand`) + arrow span (`bg-white/10`, `border-l
    border-white/15`), ≥44px hit area, `[font-feature-settings:'tnum']`. Seven
    states: default brand fill; **hover** ~10% darken (150ms `--duration-instant`,
    no transform); **active** ~15%; **focus-visible** global `2px --color-brand`
    ring @2px offset; disabled/loading/error N/A (static mailto — documented N/A).
  - **Risk reducer** — small `text-gray-light`, below the button.
  - **Secondary** — plain `contact@metaborong.com` text link.
- **ASCII-hills raster** — full-width, anchored to the section bottom (Figma
  `237:341`, 1240×~698 at the section foot, `object-cover`, decorative).
  Project-sourced asset (Deviation 4); **static** (no animation — DESIGN.md
  infinite-animation rule); `<img alt="" loading="lazy" aria-hidden="true">`;
  must not introduce horizontal overflow at 375 and must not sit behind/occlude
  the button hit area or reduce text contrast below AA.

### Figma → project token map (Deviation 1 — values mapped, not literal)

| Figma | Project token | Note |
|-------|---------------|------|
| Space Grotesk Bold | Satoshi 900 (`--font-brand`) | H2 |
| Geist Regular | Satoshi 400 (sub) / JetBrains Mono (micro) | |
| `#040404` | `--color-dark` | H2 |
| `#6c757d` | `--color-gray` | sub |
| `#fffffc` | `--color-bg` | section bg (was dark — Deviation 5) |
| `#296ff0` | `--color-brand` | button — exact match |
| 48px H2 | `font.size.h2` (clamp) | px = proportion; project scale wins |

## A3-locked copy (verbatim sync target for `contact-cta.tsx`)

Source of truth = `docs/content/homepage.md` §[CONTACT CTA — light section].
Audit baseline **7.6/10 → rewrite 8.1/10** (beats the A3 step-4 gate);
copywriting gate **PASS**, guardrails **PASS**.

- **H2:** `Tell us the build. We'll send the approach.`
- **Sub (19w):** `No pitch deck, no discovery-call gauntlet — a written approach to your Web3 or AI build, straight from a founder.`
- **Primary CTA (2w, ≤3 cap):** `Email us →` → `mailto:contact@metaborong.com?subject=New%20project%20inquiry`
- **Risk reducer:** `Most teams hear back within 12 hours.`
- **Secondary:** `contact@metaborong.com` → `mailto:contact@metaborong.com`

**Claim provenance:** "straight from a founder" — **user confirmed 2026-05-19
this is literally true** (a founder personally writes the approach reply); it
also aligns with the published TRUST SIGNALS line ("Founders reachable directly
— no account manager layer"). Copywriting gate: PASS (user-verified literal).
H2 + CTA unchanged from the Session-15 lock (scored highest; audit said preserve
single-action discipline).

## Deviations from master plan

Master grammar is `DESIGN.md`. Each deviation is required to render the
Figma-faithful redesign / honor project grammar, logged per the override rule.

1. **Figma type/values → project tokens** (table above). Visual proportion and
   hierarchy preserved; raw px/fonts/hex not reproduced. Rationale: DESIGN.md is
   master; the Figma MCP output itself mandates converting to the target system.
2. **Button = project split-arrow Bauhaus primary, not Figma's plain filled
   button; CTA copy "Email us", not Figma's "Start a conversation".** DESIGN.md
   mandates the split-arrow signature for arrow primaries and a ≤3-word CTA cap
   ("Start a conversation" = 4 words, soft). The A3-locked copy + project button
   signature win over the Figma frame. (Project grammar > Figma.)
3. **Copy: Figma frame text is NOT a copy source.** The Figma sub is the *old
   generic copy this section already replaced* (and is itself corrupted —
   `"…Web3 protocols, ATell us…"`). Authoritative copy = `homepage.md` A3 block
   (Figma text ≠ source — project memory rule).
4. **ASCII-hills raster = exported Figma asset, optimized (D1 → option A).**
   Captured 2026-05-19 from Figma node `237:341` (4096×2305, 9.7 MB raw —
   **local-only working file, NOT committed**; provenance = the Figma node id,
   not a repo binary). MUST NOT ship as-is.
   **Implementation hard requirement:** resize to a sensible max (~1600px wide
   for retina at the ~1240px render box) + convert to **webp**, place in
   `public/` (follow the `public/whyus/` precedent, e.g.
   `public/contact/ascii-hills.webp`); target well under ~250 KB so it does not
   regress LCP on the final CTA. Decorative `alt=""` `aria-hidden`,
   `loading="lazy"`, **static** (no animation — DESIGN.md motion rule #1
   untouched). Final crop/placement still chosen via labeled live-page
   candidates at implementation (project memory: subjective placement →
   candidate-pick, never blind-iterate).
5. **Dark → light (grammar change).** `DESIGN.md` color table currently lists
   "contact CTA" under `--color-canvas` (`#0a0a0a`, surface.dark, line ~136).
   The redesign moves the section to `--color-bg`. Logged here; **DESIGN.md
   line ~136 + Decisions Log updated at graduation** (this session, single
   author). `homepage.md` "[dark section]" label + "Notes for Visual Design"
   `#0a0a0a` line already reconciled to light in the A3 pass.

## Hard constraints (non-negotiable regardless of deviations)

- **SSR/SEO:** H2, sub, CTA label, and `contact@metaborong.com` render
  server-side as crawlable static markup (no client-only text). The raster is
  decorative and must not carry SEO text.
- **ARIA:** button has a discernible accessible name ("Email us"); the arrow
  glyph is `aria-hidden`; the ASCII raster is `alt=""` + `aria-hidden`. Heading
  level `h2`.
- **Mobile:** centered stack, no horizontal overflow at 375; button ≥44×44;
  raster scales without pushing width.
- **prefers-reduced-motion:** only motion is `<Section>`'s `<Reveal>` (already
  short-circuits to visible under reduce). Raster is static. No new infinite
  animation.
- **Brand color discipline:** brand blue only via `--color-brand` (button); no
  raw hex; no pillar colors here.
- **Focus-visible:** button shows the global `2px --color-brand` ring at `2px`
  offset (lands on the light section bg → visible ≥3:1; if the button overlaps
  the raster, verify ring contrast at implementation).

## plan-design-review (2026-05-19) — spec gate

Calibrated against `DESIGN.md` + the locked Figma frame `233:261`. **No mockups
generated** — visual is locked to the user-provided Figma source of truth; AI
variants would contradict the Figma-faithful workflow (legitimate skip, the
Session-13/16 precedent). `REPO_MODE=collaborative`.

| Pass | Dimension | Score | Outcome |
|------|-----------|-------|---------|
| 1 | Information architecture | 9/10 | Hierarchy explicit (H2→sub→split-arrow→risk reducer→secondary); anchor wiring documented. |
| 2 | Interaction state coverage | 7→9/10 | Button 7-state spec'd. **Fixed inline:** (a) secondary `contact@metaborong.com` link gets the same hover (150ms `--duration-instant` color) + global focus-visible ring as any inline link; (b) **raster load-failure degrades gracefully** — `alt=""` + the section is fully functional/legible on `--color-bg` without it (no layout shift; no min-height reserved that would collapse). |
| 3 | User journey / emotional arc | 9/10 | Final convert moment; A3 founder-reachability lowers risk exactly at the decision point. No issue. |
| 4 | AI-slop risk | 8.5/10 | Centered layout is **not** slop here: terminal single-action CTA → centered is the convention (Krug), Figma-locked, and consistent with the existing contact-cta + the rest of the site's CTA treatment. Distinctive ASCII-hills raster + split-arrow Bauhaus button keep it off the generic-hero pattern. Logged so a future reviewer doesn't mis-flag. |
| 5 | Design-system alignment | 9/10 | Full token map + 5 deviations per the override rule; split-arrow/radius-0/≤3-word-CTA all cite DESIGN.md; `<Section bg=default maxWidth=xwide>` **verified against `section.tsx:5,21`**. (DESIGN.md variant list omits `xwide` — stale; → graduation cleanup.) |
| 6 | Responsive & accessibility | 8→9/10 | **Fixed inline:** raster at mobile = `object-cover object-bottom`, predictable bottom-anchored crop, **no `min-height`** that would blow out 375; content stack stays centered + ≥44px button; reduced-motion via `<Section>` Reveal (short-circuits) + static raster; SSR text crawlable. |
| 7 | Unresolved decisions | resolved | **D1 RESOLVED (user, 2026-05-19): option A** — export the Figma raster, optimize to sized webp (Deviation 4). Asset captured. Bg-alternation is a stated deterministic conditional (verify FAQ bg at impl), not a haunting ambiguity. |

**Initial 8.0/10 → 9.0/10** after inline fixes + D1 resolved; zero decisions
deferred. Spec is design-complete; run `/design-review` after implementation
for live visual QA.

---

## GRADUATION DRAFT — apply at end of session on `design-revamp` (single author)

### → `DESIGN.md` doc-drift cleanup (at graduation)

The `section.tsx` row/prose in DESIGN.md lists `mw: wide/narrow/prose` but the
real component (`section.tsx:5`) also has **`xwide` (`max-w-[1280px]`)** — used
by Why-Us, Founders, and now ContactCta. Add `xwide` to the documented variant
list so the doc matches the shipped API.

### → `DESIGN.md` color table (line ~136) — edit at graduation

`| color.surface.dark | --color-canvas | #0a0a0a | Hero canvas, ~~contact CTA~~ |`
— remove "contact CTA" (it is now a light section). Confirm no other section
relies on that row's "contact CTA" wording.

### → `DESIGN.md` Decisions Log (new row, 2026-05-19)

| 2026-05-19 | ContactCta redesigned (Figma `mQsbMuw0spVgIu7jXirr3o`/`233:261`): **dark `#0a0a0a` → light `--color-bg`** on the canonical `<Section bg=default maxWidth=xwide>` grid; centered uppercase H2 + A3 sub + brand-blue **split-arrow** primary (project signature kept over Figma's plain button; CTA "Email us" kept over Figma's 4-word "Start a conversation") + a project-sourced static ASCII-hills raster anchored bottom. A3 copy re-run 7.6→8.1 (founder-reachability E-E-A-T + Web3/AI topical added; H2/CTA unchanged). Deviations 1–5 in `docs/superpowers/specs/2026-05-19-section-contact-cta.md`. `--color-canvas` "contact CTA" usage removed from the color table. | Page tail now matches the light Section grammar of every other section; the convert moment leverages founder-reachability; dark-surface grammar updated to match what shipped. |

### → `CHANGELOG.md` (Session 17 — consolidate with Footer)

```
### ContactCta — Figma-driven redesign (dark → light)
- components/sections/contact-cta.tsx rebuilt on the canonical <Section> grid:
  light bg, centered uppercase H2 + A3 sub + brand-blue split-arrow primary,
  full-width project-sourced static ASCII-hills raster anchored bottom.
- Copy via A3 re-run (homepage.md): 7.6 → 8.1/10; H2 + "Email us" CTA kept,
  sub adds founder-reachability + Web3/AI topical; gates + guardrails PASS.
- homepage.md "[dark section]"/#0a0a0a notes + DESIGN.md surface.dark table
  reconciled to light.
```

### → copy-audit scorecard row

`| 2026-05-19 | ContactCta | 7.6 → 8.1 / 10 | claim-gate PASS · guardrails PASS · authority-builder skipped (CTA, per A3 gating) |`
