# Footer — Redesign Spec & Deviation Log

**Date:** 2026-05-19
**Surface:** Footer (`components/layout/footer.tsx`) — site layout chrome,
rendered in `app/page.tsx:84` **outside** `<main>`. Not a `<Section>`.
**Master spec:** `DESIGN.md`
**Figma source:** file `mQsbMuw0spVgIu7jXirr3o`, node `237:359`
(`https://www.figma.com/design/mQsbMuw0spVgIu7jXirr3o/Metaborong-Portfolio?node-id=237-359`)
**Copy chain (A3 create):** `docs/superpowers/specs/2026-05-19-contact-footer-copy-audit.md`
**Workflow:** A1 redesign + A3 copy chain woven in (Session 17, **direct on
`design-revamp`**, after ContactCta).

## Design intent

Replace today's single compact dark row with the Figma-faithful **light,
expanded sitemap footer**: positioning line + giant `METABORONG` text wordmark,
a multi-column nav/offices grid in the Figma bordered-cell treatment, and a
bottom bar. One sentence: *a credible standard footer that gives crawlers the
NAP + the site map, and humans every way to find or reach the studio.* The
Figma placeholder "ARNAB RAY ×4" card grid is **dropped** (user decision — the
Founders section already carries the team; avoids publishing personal mobiles).

## Anatomy (Figma → project)

Footer is **chrome**, not a `<Section>`: it is **SSR-visible** (NAP + links must
be in the DOM at first paint for crawlers) and **NOT** `<Reveal>`/IO-gated
(Deviation 6). It keeps the site edge grid exactly as the current footer +
nav/sections do: outer `px-[16px] sm:px-[24px] md:px-[48px] lg:px-[96px]
xl:px-[128px]`, inner `max-w-[1280px]`, light `bg-bg`, top hairline
`border-t border-border`.

- **Layout order (top→bottom):** (1) positioning line + giant `METABORONG`
  wordmark row (full-width), (2) the bordered-cell column grid, (3) bottom bar
  (full-width). Wordmark/positioning and bottom bar are **not** inside the
  column grid.
- **Bordered-cell grid** (Figma `#e5e5e5` → `--color-border`): explicit
  responsive column count — **1-col stacked `< md`**, **2-col `md`**, **4-col
  `lg+`** (Company | Services | Offices | Get in touch), mirroring the Founders
  breakpoint discipline (substantial columns do not sit side-by-side below
  `lg`). Columns:
  - **Company** — heading + links: Work `/#work` · About `/#founders` · Blog
    `/blog` · FAQ `/#faq` · Contact `/#contact`.
  - **Services** — heading + Web3 / Blockchain · AI Agents · Product Studio,
    **all → `/#services`** (service pillar/leaf pages are
    `robots:noindex,nofollow`; the homepage anchor is the only indexable target
    — copy-audit §C).
  - **Offices** — heading + three address blocks (user-verified 2026-05-19,
    verbatim): **India** 117, Rajyadharpur Govt Colony, Mallickpara, Serampore,
    West Bengal · **United Arab Emirates** Sharjah Media City, Sharjah, UAE,
    Al Batayih, 000000 · **USA** 16192 Coastal Hwy, Lewes, DE 19958. Marked up
    with `<address>` semantics.
  - **Get in touch** — heading + `contact@metaborong.com` (mailto) + the social
    row.
- **Headings** — uppercase, DESIGN.md mono/eyebrow grammar (terse utility
  labels), `text-dark`.
- **Wordmark** — `METABORONG` as **live text** (not the Figma raster —
  Deviation 3): oversized, faint (`--color-gray-light` / low-opacity), one line,
  must not cause horizontal overflow at 375 (scale down / clip predictably).
- **Bottom bar** — left `© {new Date().getFullYear()} Metaborong Technologies`
  (dynamic — fixes Figma's static `@2026` bug); right LinkedIn + X text links.
- **Social row** — LinkedIn `https://linkedin.com/company/metaborong-technologies`
  · X `https://x.com/Metaborong` (real) · Behance · Medium · Discord → `/`
  (TEMPORARY homepage redirect, real URLs pending — Deviation 5). All
  `target="_blank" rel="noopener noreferrer"`; real profiles only get
  `rel="me"` — temp homepage links must **not** (would assert false identity).
  Each social control has an `aria-label`.

### Figma → project token map (Deviation 1)

| Figma | Project token |
|-------|---------------|
| Space Grotesk Bold / Medium | Satoshi 700/500 (`--font-brand`) |
| Geist Regular | Satoshi 400 |
| `#040404` / black | `--color-dark` |
| `#6c757d` | `--color-gray` |
| `#e5e5e5` | `--color-border` |
| `#fffffc` | `--color-bg` |

## A3-locked copy (verbatim sync target for `footer.tsx`)

Source of truth = `docs/content/homepage.md` §[FOOTER — light, expanded
sitemap]. *Create* (footer copy was minimal/stale 3.0 → complete IA);
copywriting gate **PASS** (user-verified offices + restated claims), guardrails
**PASS** (genuine three-pillar list, no banned words/inflation/-ing tail).

- **Positioning line (16w):** `Metaborong builds and ships Web3 protocols, AI agents, and SaaS products — a small, senior, founder-led team.`
- **Column headings:** `Company` · `Services` · `Offices` · `Get in touch`
- **Company links / hrefs:** Work `/#work` · About `/#founders` · Blog `/blog` · FAQ `/#faq` · Contact `/#contact`
- **Services links:** Web3 / Blockchain · AI Agents · Product Studio → `/#services`
- **Offices:** India / United Arab Emirates / USA (addresses above, verbatim)
- **Get in touch:** `contact@metaborong.com`
- **Bottom bar:** `© {dynamic year} Metaborong Technologies` · LinkedIn · X
- **No legal row** — no Privacy/Terms pages exist (user-confirmed); omitting
  beats a dead link.

**Claim provenance:** "founder-led" / "small, senior team" restate the published
TRUST SIGNALS + Services-H2 lines (not new claims); offices user-verified
2026-05-19; `Dribbble` dropped (never a real channel).

## Deviations from master plan

1. **Figma type/values → project tokens** (table above). Proportion/hierarchy
   preserved; raw values not reproduced.
2. **Placeholder "ARNAB RAY ×4" card grid DROPPED** (user decision). Structural
   deviation from the Figma frame; replaced by the standard sitemap columns.
   Founders section already carries the team; avoids personal-mobile exposure.
3. **`METABORONG` wordmark = live text, not the Figma raster.** SSR/SEO-crawlable
   brand token, crisp at any DPI, responsive — mirrors the Founders "drop the
   raster, do it on-grammar" precedent. Fewer assets, on DESIGN.md restraint.
4. **Three office address blocks added (real NAP).** New content not in the old
   footer; user-verified. Pairs with the deferred schema work (Deviation 7).
5. **Social row expanded with temporary targets.** LinkedIn/X real; Behance,
   Medium, Discord → `/` as a *deliberate, tracked* temporary homepage redirect
   (user instruction — not a guessed/dead link; valid live target). Follow-up
   to swap real URLs; no `rel="me"` until then.
6. **Footer is SSR-visible and NOT `<Reveal>`/IO-gated.** DESIGN.md mandates
   sections be invisible-at-SSR + IO-gated; the footer is layout chrome, not a
   section — its NAP/links/positioning must be in the DOM at SSR for crawlers.
   Intentional; no first-paint reveal on the footer.
7. **[DEFERRED — shared surface, follow-up] `lib/schema.ts` NAP.** Highest-value
   entity lever = add `address`/`PostalAddress` (×3) to the `Organization`
   JSON-LD, byte-consistent with the footer text. `lib/schema.ts` is a shared
   surface; mirrors the Founders `sameAs` deferral. **Not implemented in this
   redesign** — handed to a follow-up (logged in copy-audit §C2).

## Hard constraints (non-negotiable)

- **SSR/SEO:** positioning line, every link + label, all three addresses, and
  the bottom bar render server-side as crawlable static markup. Wordmark text is
  real text (not an image, not `aria-hidden` only).
- **Semantics/ARIA:** wrap link groups in `<nav aria-label="…">`; addresses in
  `<address>`; social controls have `aria-label`s; the bottom-bar copyright is
  plain text. Heading hierarchy: footer column labels are not page headings
  (use non-heading or appropriately-leveled elements — do not inject `h2`s that
  fight the page outline).
- **Mobile:** columns stack to 1-col below `lg`; no horizontal overflow at 375;
  the oversized wordmark scales/clips without overflow; link tap targets ≥44px.
- **prefers-reduced-motion:** footer has **no** animation at all (safest;
  nothing to gate). Link hovers use the 150ms `--duration-instant` color
  transition only.
- **Brand color discipline:** any accent only via `--color-brand`; borders via
  `--color-border`; no raw hex.
- **Focus-visible:** every link/social control shows the global
  `2px --color-brand` ring @2px offset (lands on the light footer bg → visible).

---

## GRADUATION DRAFT — apply at end of session on `design-revamp` (single author)

### → `DESIGN.md` Decisions Log (new row, 2026-05-19)

| 2026-05-19 | Footer redesigned (Figma `mQsbMuw0spVgIu7jXirr3o`/`237:359`): single dark row → **light expanded sitemap footer** on the site edge grid (`px` chain + `max-w-[1280px]`, same as nav/sections). Standard IA — Company / Services / Offices / Get-in-touch columns + 16-word positioning line + giant **`METABORONG` as live text** (not raster) + dynamic-year bottom bar. Figma placeholder "ARNAB RAY ×4" card grid dropped (user); Dribbble dropped; offices = user-verified NAP; Behance/Medium/Discord → `/` temp (tracked). Footer is SSR-visible chrome, not IO-gated. Deviations 1–7 in `docs/superpowers/specs/2026-05-19-section-footer.md`; schema NAP (`lib/schema.ts`) deferred. | The footer finally carries the sitemap + NAP + positioning a credible studio footer needs, on the same edge grammar as the rest of the page, without inventing the Figma placeholder content. |

### → `CHANGELOG.md` (Session 17 — consolidate with ContactCta)

```
### Footer — Figma-driven redesign (single row → expanded sitemap)
- components/layout/footer.tsx rebuilt to the Figma sitemap structure on the
  site edge grid: light, Company/Services/Offices/Get-in-touch columns, 16-word
  positioning line, METABORONG as live text (not raster), dynamic-year bottom
  bar, LinkedIn/X real + Behance/Medium/Discord temp homepage redirect.
- Copy via A3 create (homepage.md): claim-gate + guardrails PASS; offices
  user-verified; Dribbble + placeholder card grid removed.
- Deferred follow-up: lib/schema.ts Organization PostalAddress ×3 (NAP
  consistency); real Behance/Medium/Discord URLs.
```

### → copy-audit scorecard row

`| 2026-05-19 | Footer | create (was 3.0) → complete IA | claim-gate PASS · guardrails PASS · authority-builder skipped (utility, per A3 gating) · schema NAP deferred |`
