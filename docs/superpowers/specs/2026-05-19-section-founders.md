# Founders Section — Redesign Spec & Deviation Log

**Date:** 2026-05-19
**Section:** Founders / "Team" (`components/sections/founders.tsx`)
**Master spec:** `DESIGN.md`
**Figma source:** file `mQsbMuw0spVgIu7jXirr3o`, node `142:516`
(`https://www.figma.com/design/mQsbMuw0spVgIu7jXirr3o/Metaborong-Portfolio?node-id=142-516`)
**Reference screenshot:** `docs/superpowers/assets/2026-05-19-founders-figma.png`
**Copy audit (A3 chain):** `docs/superpowers/specs/2026-05-19-founders-copy-audit.md`
**Workflow:** A1 redesign + A3 copy chain woven in (Terminal B worktree
`section/founders-redesign`).

## Design intent

Replace the current black-background placeholder Founders block with the light,
Figma-faithful **team E-E-A-T anchor**: eyebrow + H2 + A3 lede, then a 3-up row of
founder cards — a square portrait in a dashed **blueprint frame** above name, role
chip, bio, and a brand-blue square LinkedIn button. One sentence: *prove the work is
done by named, reachable, technical co-founders, not a sales layer.*

`#founders` anchor and nav "Team" label are **unchanged** (no rename). Component
export stays `FoundersSection`; `app/page.tsx` and `nav.tsx` are not touched.

**Anchor wiring (design-review correction):** the `#founders` scroll target is an
external `<span id="founders" class="block scroll-mt-[64px]" aria-hidden>` in
`app/page.tsx:75` **before** `<FoundersSection/>`. `app/page.tsx` is out of scope and
untouched, so `founders.tsx`'s `<Section>` **must NOT** set `id="founders"` (it would
duplicate the ID). The Section renders with no `id`.

## Anatomy (Figma → project)

- **Container:** canonical `<Section bg="default" maxWidth="xwide">` → `bg-bg`,
  `max-w-[1280px]`, `px-[16px] sm:px-[24px] md:px-[48px] lg:px-[96px] xl:px-[128px]`,
  `py-[48/64/72]`, auto-`<Reveal>`. (Figma is a light `#fffffc` frame → `--color-bg`;
  next section Comparison is `bg-bg-subtle`, so alternation holds.)
- **Header:** `Eyebrow` "THE TEAM" → H2 "The team behind the work" (the words **"the
  work"** in `text-brand`) → A3 lede (`text-gray`, ~`max-w-[640px]`).
- **Card row:** `grid grid-cols-1 lg:grid-cols-3 gap-[48px]` (space.7). Three cards.
  **Breakpoint correctness (design-review fix):** 3 substantial cards (~350px content
  width + 48px gaps) cannot sit side-by-side below ~1130px. Use `lg:` (1024px+) for the
  3-up, matching DESIGN.md's two-column-section `lg:` grammar — **not** `md:`
  (cramped/overflowing at 768px). One column below `lg`.
- **Card** (the photo tile is **non-interactive/decorative** — only the LinkedIn
  button is a link; decided 2026-05-19, matches Figma, avoids duplicate-link a11y):
  - **Photo tile** — square (`aspect-square`), `border border-border`; inset **dashed
    `--color-border`/gray frame** + four dashed edge ticks, pure CSS (Figma "blueprint"
    treatment). One `shadow.lg`-class lift (Figma `0 3.5px 26.25px rgba(0,0,0,.12)`).
    Anik → `<img src="/anikfounderimage.png">` (`object-cover`, `loading="lazy"`,
    `alt="Anik Ghosh, COO & Co-Founder"`).
  - **Monogram tile** (Arnab, Soumojit — full spec): same frame/shadow; centered
    initials ("AR", "SA") in Satoshi 700 at the H1-ish display weight, `text-gray`
    (≥4.5:1 on `bg-bg-subtle` fill — AA), no brand tint (keeps brand discipline);
    container `role="img"` `aria-label="<Name>"`, initials `aria-hidden`. Reads as a
    deliberate placeholder, swappable to a real photo via one data field.
  - **Name** — `h3`, Satoshi 700, ~20px (`font.size.h3`), `-0.025em`, `text-dark`.
  - **Role chip** — bordered pill: `bg-bg-subtle border border-border`, mono uppercase
    ~11–12px `text-gray`. **Overflow rule:** chip is `shrink-0` (never compresses);
    name may wrap. On narrow widths name + chip **stack** (name above chip) rather than
    collide on one justified row — long names (>~16 chars) must not overlap the chip.
  - **Bio** — base copy, `text-gray`, from the A3 chain. Long-content: wraps freely
    (no clamp); cards are not height-locked to each other (natural height).
  - **LinkedIn** — brand-blue **square** button (radius 0, Bauhaus), **≥44×44** hit
    area (Figma 40 bumped to 44 for touch), white 1px inner border,
    `rel="noopener noreferrer" target="_blank"`, accessible name
    `"<Name> on LinkedIn"`. **Seven states (DESIGN.md mandate):** default brand fill;
    **hover** bg darkens ~10% (no transform, 150ms `--duration-instant`); **active**
    darkens ~15%; **focus-visible** global `2px --color-brand` ring at 2px offset;
    disabled/loading/error N/A (static external link — documented as N/A).
    **Degrades gracefully:** no verified URL (Soumojit) → render **no button**
    (no `#`/guessed/404 link — a dead profile link is a negative Trust signal).
  - **Tab order:** matches visual reading order — card 1 LinkedIn → card 2 → card 3
    (photo/monogram are not focusable). Section heading `h2`, names `h3`.

## A3-locked copy (verbatim sync target for `founders.tsx`)

- **Eyebrow:** `The team`  (renders `THE TEAM`)
- **H2:** `The team behind the work`  (emphasis span: `the work` → `--color-brand`)
- **Lede:** `Metaborong's three co-founders are hands-on in every Web3 and AI engagement. The work in our portfolio was built by us, not by a contracting layer we manage. You'll be in Slack with the people writing your code.`
- **Arnab Ray** · `CEO & Co-Founder` · `Co-founded Metaborong and sets its direction across Web3 and AI engagements.` · `https://linkedin.com/in/arnab-ray`
- **Anik Ghosh** · `COO & Co-Founder` · `Co-founded the studio; owns delivery and the scope discipline that keeps timelines honest.` · `https://www.linkedin.com/in/anik-ghosh-01a985208/`
- **Soumojit Ash** · `CTO & Co-Founder` · `Co-founded the studio and owns the architecture under every Web3 protocol and AI system it ships.` · LinkedIn **pending** (no verified URL → no button on this card until provided)

Source of truth = `docs/content/homepage.md` Founders block. Bios are **generic-but-true
placeholders** (user decision 2026-05-19: build generic now, swap real specifics later);
`USER_INPUT` markers retained in `homepage.md`. Copy score **8.0/10** (baseline 2.7),
claim-discipline gate PASS, anti-AI guardrails PASS.

## Deviations from master plan

Master grammar is `DESIGN.md`. Each deviation below is required to render the
Figma-faithful redesign and is logged per the per-section override rule.

### 1. Figma type/values mapped to project tokens (not reproduced literally)

The Figma frame is built in **Space Grotesk Bold + Geist Regular** at literal pixel
sizes (H2 32px, name 24px, body 16px). `DESIGN.md` locks **Satoshi + JetBrains Mono**
and a fixed type scale, and forbids one-off typography/spacing exceptions. Mapping:

| Figma | Project token | Note |
|-------|---------------|------|
| Space Grotesk Bold | Satoshi 700/900 (`--font-brand`) | H2/name |
| Geist Regular | Satoshi 400 (body) / JetBrains Mono (eyebrow, chip) | |
| `#040404` | `--color-dark` (#303030) | headings/name |
| `#6c757d` / `#495057` | `--color-gray` (#676767) | bio / chip text |
| `#f8f9fa` | `--color-bg-subtle` (#f5f7ff) | chip fill |
| `#e5e5e5` | `--color-border` (#e5e7eb) | borders, dashed frame |
| `#fffffc` | `--color-bg` (#ffffff) | section bg |
| `#296ff0` | `--color-brand` | LinkedIn, "the work" — **exact match** |
| H2 32px / name 24px | `font.size.h2` (clamp) / `font.size.h3` | Figma px treated as proportion; project scale wins (no one-off type). |

Rationale: `DESIGN.md` is the master; the Figma MCP output itself mandates converting
to the target system. Visual proportion/hierarchy preserved; raw values are not.

### 2. Eyebrow + role rendered as bordered chips (not the canonical borderless `Eyebrow`)

`DESIGN.md`'s canonical `Eyebrow` primitive is borderless
(`text-[11px] font-bold uppercase tracking-[0.1em] text-gray-light`). The Figma uses a
bordered pill chip for both the section eyebrow and the per-founder role. Adopting the
bordered chip — consistent with the **retained hero eyebrow chip** (2026-05-18 hero
decision) — keeps Founders visually aligned with the hero rather than introducing a
third eyebrow style. Logged as a deviation. **Match the hero chip token-for-token**
for true consistency (`hero.tsx:50-54`): wrapper `inline-flex items-center bg-bg
border border-border rounded-sm px-3 py-[6px] w-fit` + `<Eyebrow
className="text-[12px]! tracking-[0.12em]!">`. Per-founder **role chip** = same
structure on `bg-bg-subtle` (nested/secondary read). Figma's `#f8f9fa` fill maps to
this hero-consistent convention (project convention > literal Figma fill, per
Deviation 1).

### 3. Figma 8%-opacity raster texture overlay dropped

Each Figma photo tile has a faint (opacity ~8%) raster texture background image. No
such asset exists in the repo, and `DESIGN.md` is borders-first / restraint-driven.
The **dashed blueprint frame** (pure CSS, on-brand technical-blueprint posture) is
reproduced; the raster texture is **not**. Net: fewer assets, on-grammar.

### 4. Section keeps the A3 lede — Figma has none

The Figma frame is eyebrow + H2 + cards only (no section intro). The redesign **keeps**
the 38-word A3 lede (user decision 2026-05-19). Founders is the E-E-A-T anchor and the
lede is its strongest standalone trust/AEO statement; dropping it to match Figma would
hollow the section's purpose. Structural deviation from the Figma source, intentional.

### 5. Founder photos — monogram fallback for two of three

Figma shows real headshots for all three. Repo has only `/anikfounderimage.png`.
Arnab & Soumojit render a **monogram/initials tile inside the same blueprint frame**
(user decision 2026-05-19) — deliberate, not broken; DiceBear cartoon avatars (current
code) are removed as they undercut an E-E-A-T trust section. One data-field swap moves
a founder to a real photo later.

### 6. LinkedIn graceful degradation; X affordance dropped

Figma is LinkedIn-only. Current code's `x` field (mostly `'#'`) is dropped. A card with
no verified LinkedIn URL (Soumojit) renders **no** LinkedIn button rather than a `#`
anchor or guessed profile — a 404/dead profile link is a negative Trust signal
(`copy-audit` step e).

### 7. [DEFERRED — out of worktree scope] per-founder schema `sameAs`

Highest-value entity-authority lever is adding `sameAs: [linkedin]` to the
`Organization.founder[]` `Person` objects in `lib/schema.ts`. That file is a **shared
surface owned by the main session** (Terminal B owns only `founders.tsx` + the
homepage.md Founders block). Implementing it here would re-create the cross-worktree
conflict the master plan's merge-back section avoids. → **Follow-up handed to the main
session at/after merge.** Not implemented in this worktree.

## Hard constraints honored (non-negotiable regardless of deviations)

- **SSR/SEO:** eyebrow, H2, lede, every name/role/bio render server-side as crawlable
  static markup (no `display:none` on SEO content; no client-only text). The section
  is the E-E-A-T anchor — its text must be in the DOM at SSR.
- **ARIA:** photo `alt` = `"<Name>, <Role>"` (comma, **not** em dash — reconciled
  2026-05-19 per impeccable critique: the project no-em-dash guardrail wins over the
  spec's original em-dash draft; `alt` is announced/rendered copy). Monogram has
  `role="img"` + `aria-label="<Name>"`, decorative initials `aria-hidden`. LinkedIn
  link has a discernible accessible name; heading levels: section `h2`, names `h3`.
- **Mobile fallback:** `grid-cols-1` stacks server-side; no overflow at 375; tap
  targets ≥44×44.
- **prefers-reduced-motion:** only motion is `<Section>`'s `<Reveal>` (already
  short-circuits to visible under reduce). Optional per-card stagger uses `Reveal
  delay` which inherits the same gate. No new infinite animations (DESIGN.md motion
  rule #1 untouched).
- **Brand color discipline:** brand blue only via `--color-brand`
  (LinkedIn button + "the work" emphasis); no raw hex; pillar colors untouched.
- **Focus-visible:** LinkedIn button shows the global `2px --color-brand` ring at
  `2px` offset.

## Design review (plan-design-review, 2026-05-19) — spec gate

Calibrated against `DESIGN.md` + the locked Figma frame. **No mockups generated** —
visual is locked to the user-provided Figma source of truth; AI variants would
contradict the Figma-faithful workflow (legitimate skip).

| Pass | Dimension | Score | Outcome |
|------|-----------|-------|---------|
| 1 | Information architecture | 9/10 | Hierarchy + tab order now explicit in spec. |
| 2 | Interaction state coverage | 6→9/10 | Added LinkedIn 7-state spec; resolved photo-clickability (button-only); name/chip overflow + long-bio rule added. |
| 3 | User journey / emotional arc | 9/10 | E-E-A-T arc intact (kept lede, named/reachable founders). No issue. |
| 4 | AI-slop risk | 8.5/10 | Figma-locked, distinctive blueprint frame + mono chips + Bauhaus button on a technical surface; not a generic icon-circle grid. Execution-critical: the dashed frame must be crisp. |
| 5 | Design-system alignment | 9/10 | Full token map + 7 logged deviations per the override rule. |
| 6 | Responsive & accessibility | 6→9/10 | Fixed 3-up breakpoint `md:`→`lg:` (correctness); monogram AA contrast + `role="img"`; mobile 1-col SSR; ≥44px; reduced-motion via `<Section>`. |
| 7 | Unresolved decisions | resolved | Photo-clickability fork → **button-only** (D1, user). All others fixed inline. |

**Initial 7.5/10 → 9/10** after fixes. One decision made (D1, button-only), zero
deferred design decisions. Remaining ceiling items are content (pending USER_INPUT)
and the cross-worktree schema `sameAs` (Deviation 7), both correctly handed off, not
design gaps. Spec is design-complete; run `/design-review` after implementation for
live visual QA.

## Impeccable critique (2026-05-19, post-implementation)

Two isolated assessments on `founders.tsx`. **Detector (Assessment B): `[]` — zero
findings.** Design review (Assessment A): **34/40 Nielsen, "not AI-slop",
ship-ready after a11y.** Fixes applied (all correctness, not subjective polish — so
no `impeccable layout/polish` pass needed):

- **P3 (AA + spec divergence) FIXED:** role-chip `Eyebrow` defaulted to
  `text-gray-light` (#999) → ~2.6:1 on `bg-bg-subtle` (fails AA) and contradicted the
  Deviation-1 color map. Added `text-gray!` → #676767 ≈ 4.9:1 (AA pass).
- **P2 (guardrail) FIXED + spec reconciled:** em dash in `alt` → comma; spec's
  original `"<Name> — <Role>"` was a no-em-dash-guardrail violation; spec updated.
- **P2 (token discipline) FIXED:** off-scale values snapped to the locked scale —
  `gap-[20px]→24`, `mt-[20px]→24`, `gap-[10px]→12`, `text-[15px]→16`,
  monogram `text-[64px]→56`. `py-[6px]` retained (hero-chip token match,
  Deviation 2). DESIGN.md QA "no raw px" line now passes.
- **P1 (focus-visible) VERIFIED, no code change:** `globals.css:139`
  `:where(a,…):focus-visible { outline:2px solid var(--color-brand);
  outline-offset:2px }` matches the bare `<a>`; the 2px offset lands the ring on the
  white section bg (not the blue fill) → visible (≥3:1). Dependency documented in a
  code comment so a future edit doesn't add `outline-none`.

## Design-review (2026-05-19, live-site QA on :3007)

Live desktop (1280) + mobile (375) pass on the running worktree build.
**AI-slop verdict: PASS** (left-aligned, Satoshi, no gradient/icon-circle/centered
template; blueprint frame + mono chips read as engineered — on DESIGN.md posture).
**Zero defects in the founders redesign**: faithful to the Figma frame, grid/edges
correct, consistent card rhythm, Soumojit no-LinkedIn correct, monograms read as
deliberate. No code changes (step-8 critique already fixed the real issues).

Flag-only (pre-existing, **not** founders.tsx, REPO_MODE=collaborative → not fixed):
the global consent banner (`proxy.ts`/consent) is a fixed overlay that covers
section content on mobile; the sticky `<header>` overlaps mid-scroll content.
Site-global chrome, not introduced by this redesign — handed to the main session.

## Notes / open items

- **Pending USER_INPUT** (does not block this redesign; tracked in `homepage.md`):
  real per-founder proof specifics; Soumojit's verified LinkedIn URL.
- **Deferred to main session:** `lib/schema.ts` per-founder `sameAs` (Deviation 7).
- **Graduation:** canonical `DESIGN.md` Decisions-Log + `CHANGELOG.md` entries +
  copy-audit scorecard row are written **once in the main session at merge** — only a
  draft note is left in this worktree (master plan merge-back rule). Do not graduate
  shared docs here.
- Verification posture: `npx tsc --noEmit` exit 0 + dev QA at 1440/1280/375
  (`npm run build` is expected to fail at `/blog/rss.xml` — pre-existing PR-#26 env
  hold, not a regression).

---

## GRADUATION DRAFT — apply in the COORDINATOR/main session at merge, NOT here

> Terminal B (this worktree) must **not** edit `DESIGN.md` or `CHANGELOG.md`. The
> blocks below are ready-to-paste drafts for the main session to add once, at merge
> (single author of the shared files → zero conflict, per master-plan merge-back).

### → `DESIGN.md` Decisions Log (new row, date 2026-05-19)

| 2026-05-19 | Founders section redesigned (Figma `mQsbMuw0spVgIu7jXirr3o` / `142:516`): black placeholder → light team E-E-A-T anchor on the canonical `<Section bg=default maxWidth=xwide>` grid. Hero-consistent eyebrow chip; H2 with brand-blue "the work"; A3 lede kept; 3 founder cards = square portrait/monogram in a pure-CSS dashed **blueprint frame** + name + bordered role chip + bio + brand-blue **square (radius-0)** LinkedIn button with graceful no-URL degrade. DiceBear avatars removed; monogram fallback (`role="img"`) for founders without a photo. Deviations 1–7 logged in `docs/superpowers/specs/2026-05-19-section-founders.md` (Figma→token map; bordered chip vs canonical Eyebrow; raster texture dropped; lede kept vs Figma; monogram fallback; LinkedIn degrade + X dropped; per-founder schema `sameAs` deferred). | Founders now follows the same Section grammar as nav/hero/every section (edges measured 128/1312 @1440, 128/1152 @1280, 16/359 @375, no overflow). The team/trust section finally carries real E-E-A-T (named, reachable, technical co-founders) instead of placeholder copy. |

### → `CHANGELOG.md` (Session 16 entry — consolidate with Why-Us per master-plan merge-back step 4)

```
### Founders (Team) — Figma-driven redesign
- components/sections/founders.tsx rebuilt on the canonical <Section> grid:
  light section, hero-consistent eyebrow chip, H2 "The team behind the work"
  ("the work" in brand), kept A3 lede, 3 blueprint-framed founder cards
  (portrait/monogram + role chip + bio + square LinkedIn button).
- Copy refreshed via the A3 chain (homepage.md Founders block): score 2.7 → 8.0/10,
  claim-discipline + anti-AI guardrails passed. Bios are generic-but-true
  placeholders (real specifics pending USER_INPUT).
- a11y: monogram role="img", comma (not em-dash) alt, focus-visible via global
  rule, ≥44px LinkedIn target, Soumojit degrades to no link (no 404).
- Deferred to follow-up: lib/schema.ts per-founder sameAs; real proof specifics +
  Soumojit LinkedIn URL.
```

### → copy-audit scorecard row (wherever the project tracks A3 section scores)

`| 2026-05-19 | Founders | 2.7 → 8.0 / 10 | claim-gate PASS · guardrails PASS · seo-authority-builder (sameAs deferred) |`

### Merge-back reminders (master plan §Merge-back)
- This branch `section/founders-redesign` carries: `components/sections/founders.tsx`,
  `docs/content/homepage.md` (Founders block only), and the new
  `docs/superpowers/{specs,plans,assets}` files. **No** `DESIGN.md`/`CHANGELOG.md`/
  `lib/schema.ts`/`app/page.tsx`/`nav.tsx` changes (verified clean).
- Merge order: Why-Us first, then rebase this on updated `design-revamp`
  (component + homepage Founders block only → expected clean).
