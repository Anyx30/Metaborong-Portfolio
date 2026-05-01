# Homepage Restructure — Master Plan

## Context

The homepage renders all 12 sections (nav + 10 sections + footer) but visual quality is "broken" because every section uses inline `style={{}}` and reimplements its own padding, card shape, and type scale. The `@theme` tokens in `app/globals.css` are defined but unused. A previous "premium iteration" spec was attempted and retired (commit `3611209`) because it specified visual changes without fixing the underlying inconsistency-vector.

**This plan does two things:**
1. Locks a small set of design primitives that enforce consistency by construction.
2. Defines the section narrative arc + per-section responsibilities, so each future session refactors one section against the primitives without needing to rediscover the system.

**Inspiration reference:** supermemory.ai — used for the *consistency posture* (one card system, one rhythm, restrained motion), not the palette. Metaborong keeps blue `#204AF8` + orange `#F6851B` + a third color for AI Agents.

**Narrative arc (locked):** Hero → Trust bar → Problem → Services → Why Us → Work → Comparison → Testimonials → Founders → FAQ → Contact CTA → Footer. Reorders current page to "problem-led narrative" so each section has a clear job.

---

## Concrete inconsistencies the plan fixes

| Drift | Where | Fix |
|---|---|---|
| Inline styles only; tokens unused | All 13 components | All sections move to Tailwind classes referencing `@theme` tokens |
| Stray emerald `#10b981` | nav, services, why-us, work-preview | Add `--color-ai: #10b981` token; replace literals with `text-ai`, `bg-ai`, etc. |
| Two H2 scales | services/why-us vs others | One display H2: `clamp(32px, 4vw, 52px)`, weight 700, tracking `-0.035em` |
| Card padding drift (`44/36`, `36/32`, `32/28`, `32`) | services, why-us, work, founders, testimonials | One `<Card>` primitive: `p-9` (36px) on default, `p-10` (40px) on featured |
| Card radius drift (4/8/12/16/20) | hero eyebrow, work thumbs, cards, services wrapper | Two radii only: `rounded-md` (8px) for chips/thumbs, `rounded-lg` (12px) for cards |
| Header→content margin drift (16/48/56) | every section | One value: 48px (`mb-12`) below `<SectionHeader>` |
| Hero padding deviates (`96 64 96 80` vs `96 80`) | hero only | Hero conforms to `<Section>` defaults; left-column padding handled inside |
| Eyebrow size drift (11 vs 12) | hero vs others | One eyebrow: 11px, 700 weight, `0.1em` tracking, uppercase, `text-gray-light` |

---

## Design System (the primitives)

### Tokens

**Add to `app/globals.css` `@theme`:**
```
--color-ai: #10b981;           /* third pillar */
--color-border: #e5e7eb;
--color-border-subtle: #f3f4f6;
```

The existing tokens (`--color-brand`, `--color-accent`, `--color-dark`, `--color-gray`, `--color-gray-light`, `--color-bg`, `--color-bg-subtle`, `--color-canvas`, spacing 1–10, radii sm/md/lg/xl) stay as-is.

### Type scale (locked)

| Role | Size | Weight | Tracking | Line | Color |
|---|---|---|---|---|---|
| Display H1 (hero) | `clamp(36px, 4.5vw, 64px)` | 700 | `-0.04em` | 1.02 | `text-dark` (brand accent on highlighted span) |
| Display H2 (section) | `clamp(32px, 4vw, 52px)` | 700 | `-0.035em` | 1.05 | `text-dark` |
| H3 (card title) | 20px | 700 | `-0.025em` | 1.2 | `text-dark` |
| Body lead (intro) | 16px | 400 | `-0.01em` | 1.65 | `text-gray` |
| Body | 14px | 400 | `-0.005em` | 1.75 | `text-gray` |
| Eyebrow | 11px | 700 | `0.1em` uppercase | 1 | `text-gray-light` |
| Micro | 12px | 400 | `-0.01em` | 1.4 | `text-gray-light` |

### Spacing rhythm (locked)

The locked **values** (not class names) are authoritative. The project's `@theme` defines a custom `--spacing-N` scale (slot 9 = 96px, slot 7 = 48px, etc.) that does not align with Tailwind's default `p-N`/`py-N`/`mb-N` numeric mapping. To keep the rhythm unambiguous, primitives use **arbitrary value classes** (`py-[96px]`, `mb-[48px]`, `p-[36px]`) rather than scale-dependent shorthand. Section refactors should follow the same convention.

- Section vertical padding: 96px → `py-[96px]`.
- Horizontal padding scale (apply to **nav, sections, footer** uniformly): `px-[24px] md:px-[48px] lg:px-[96px] xl:px-[128px]` — 24px mobile, 48px tablet (≥768), 96px desktop (≥1024), 128px large desktop (≥1280). Gives the premium breathing room on standard monitors and avoids the prior 80px-only step that felt tight at 1440px+.
- Section content max-width: 1280px wide; 960px for narrative-heavy (comparison, problem, founders intro); 760px for FAQ.
- Nav stays full-bleed (no `max-w`) — chrome layer hugs viewport edges. Sections cap content at the `max-width` above. The two intentionally don't align on wide monitors; this matches Linear/Vercel/Stripe convention.
- `<SectionHeader>` → content: 48px → `mb-[48px]`.
- Card grid gap: 24px → `gap-6` (this one is unambiguous since 24px is also default `gap-6`).
- Card internal vertical rhythm: eyebrow 18px → title → 14px → body → 28px → CTA.

### Card system (one primitive, three variants)

```
<Card variant="default" | "featured" | "quote">
```
- All variants: `bg-white` (or `bg-bg-subtle` on dark-section variant), `border border-border`, `rounded-lg` (= 12px, existing `--radius-lg` token; the spec's earlier `rounded-xl` was a typo — `--radius-xl` is 20px), hover lift `-translate-y-0.5` + `border-brand/30` (200ms).
- `default`: 36px padding → `p-[36px]`. Used by why-us, work-preview, founders.
- `featured`: 40px padding → `p-[40px]`, 3px accent left-border in pillar color (passed via `accentColor` prop). Used by services pillars.
- `quote`: 32px padding → `p-[32px]`, italic body. Used by testimonials.

No "bordered grid" trick like the current services section — that's a 1px-gap hack and reads inconsistent. Replace with normal grid + uniform cards.

### Motion grammar

- One enter animation: `opacity 0 → 1`, `translateY(8px) → 0`, 400ms cubic-bezier(0.16, 1, 0.3, 1), triggered on intersection (50px before viewport).
- Card hover: 200ms.
- No parallax. No big reveals. The orb keeps its existing animation.

### Primitives to build

1. `components/ui/section.tsx` — `<Section bg="default" | "subtle" | "dark" maxWidth="wide" | "narrow" | "prose">`
2. `components/ui/section-header.tsx` — eyebrow + h2 + optional intro, fixed bottom margin
3. `components/ui/card.tsx` — variants above
4. `components/ui/eyebrow.tsx` — extracted because it appears 11× (and currently drifts)

Existing `Button`, `Logo`, `Badge` stay.

---

## Section inventory

Each section's master responsibility, layout, and what it inherits. Per-session work writes a small section-level spec inheriting these.

### 1. Nav (`components/layout/nav.tsx`) — done in Session 2
- Sticky frosted-glass, 56px tall, **full-bleed** (no `max-w`). Padding follows the global horizontal scale.
- All inline styles migrated to Tailwind; no hex literals; dropdown card mirrors `<Card>` border + radius.
- Flair: nav-link underline indicator, dropdown enter animation + caret, magnetic CTA hover (scale + glow).

### 2. Hero (`components/sections/hero.tsx`)
- 55/45 grid, light bg `bg-bg-subtle`, min-h-screen.
- Left column conforms to section padding rules; eyebrow uses `<Eyebrow>`; H1 uses display-H1 scale unchanged; AEO blockquote keeps brand-blue left border but uses tokens.
- Right column hosts existing Three.js orb — untouched.

### 3. Trust bar (`components/sections/trust-bar.tsx`)
- Thin band between sections. Migrate to Tailwind. Keep marquee animation. 14px font, gray-500.

### 4. Problem (NEW — `components/sections/problem.tsx`)
- Pulls from existing `homepage.md` "Building in Web3 and AI is still too hard" section.
- Layout: narrow prose column (max-w-[760px]), centered eyebrow + H2, two paragraphs body, then a one-line bridge into Services.
- Background: `bg-white`.

### 5. Services (`components/sections/services.tsx`)
- 3-column pillar grid. Replace 1px-gap-bordered hack with normal `gap-6` grid + `<Card variant="featured">`.
- Each pillar card has: pillar tag (eyebrow in pillar color), headline (H3), body, CTA link.
- Background alternates: `bg-bg-subtle`.

### 6. Why Us (`components/sections/why-us.tsx`)
- 3 default cards. Already close to right; just migrate to `<Card variant="default">` and `<SectionHeader>`.
- Background: `bg-white`.

### 7. Work Preview (`components/sections/work-preview.tsx`)
- 4 cards on desktop; 2 on tablet; 1 on mobile.
- Replace flat colored thumbnail with `aspect-[4/3]` placeholder using `bg-bg-subtle` + dotted brand-tinted overlay (until real case-study assets land).
- Section header has trailing "View All Work →" link aligned right (already correct).
- Background: `bg-bg-subtle`.

### 8. Comparison (`components/sections/comparison.tsx`)
- Narrow column (max-w-[960px]), table with token-driven borders.
- Highlight Metaborong column with `bg-bg-subtle` + brand-colored top accent.
- Footnote in micro style.
- Background: `bg-white`.

### 9. Testimonials (`components/sections/testimonials.tsx`)
- 2-column on desktop, 1-column mobile. `<Card variant="quote">`.
- Avatar = initials in token-colored circle (replace inline brand bg with `bg-brand`).
- Background: `bg-bg-subtle`.

### 10. Founders (`components/sections/founders.tsx`)
- Section header + intro paragraph + 3 cards. Fix: `mb-16` after intro is currently `mb-48`-ish drift.
- Founder LinkedIn URL placeholders — flag for user to replace.
- Background: `bg-white`.

### 11. FAQ (`components/sections/faq.tsx`)
- Narrow column (max-w-[760px]), accordion with token-driven borders.
- Already close to right; just migrate styles + use `<SectionHeader>`.
- Background: `bg-bg-subtle`.

### 12. Contact CTA (`components/sections/contact-cta.tsx`)
- `bg-canvas` (dark), centered, max-w-[600px].
- Currently uses inline style for the brand button — switch to `<Button>`.

### 13. Footer (`components/layout/footer.tsx`)
- `bg-canvas`, padding aligned with sections (`py-9 px-20`).
- Migrate styles. No structural change.

---

## Section background rhythm (locked)

The alternation that creates the "weave":

| # | Section | Bg |
|---|---|---|
| 1 | Nav | white-translucent |
| 2 | Hero | `bg-bg-subtle` |
| 3 | Trust bar | white |
| 4 | Problem | white |
| 5 | Services | `bg-bg-subtle` |
| 6 | Why Us | white |
| 7 | Work | `bg-bg-subtle` |
| 8 | Comparison | white |
| 9 | Testimonials | `bg-bg-subtle` |
| 10 | Founders | white |
| 11 | FAQ | `bg-bg-subtle` |
| 12 | Contact CTA | `bg-canvas` (dark) |
| 13 | Footer | `bg-canvas` |

---

## Execution model

The user runs **one section per session.** Each session:
1. Reads this master plan.
2. Writes a small section-level spec at `docs/superpowers/specs/YYYY-MM-DD-section-<name>.md` (inherits the system, only documents section-specific decisions).
3. Writes a small section-level plan at `docs/superpowers/plans/YYYY-MM-DD-section-<name>.md`.
4. Implements the section using **`/frontend-design:frontend-design`** for visual decisions and **`/frontend-patterns`** for React structure. **`/landing-page-generator`** is reserved for any net-new section (Problem) where copy + structure are generated together.
5. Single self-review pass at end.

**Subagents:** Not needed. Each section is small, isolated, and sequential. Subagent dispatch would only add coordination cost.

**Session 1 (DONE — 2026-05-01):** Built the four primitives (`<Section>`, `<SectionHeader>`, `<Card>`, `<Eyebrow>`) at `components/ui/` and added `--color-ai`, `--color-border`, `--color-border-subtle` tokens to `app/globals.css`. Build passes; no visual change yet. Two clarifications were folded back into this spec: (a) cards use `rounded-lg` not `rounded-xl`, (b) primitives use arbitrary-value classes (`py-[96px]` etc.) instead of scale shorthand to bypass the `--spacing-N` ↔ default-Tailwind ambiguity.

**Session 2 (DONE — 2026-05-02):** Refactored `components/layout/nav.tsx` — all inline styles migrated to Tailwind, `#10b981` literals replaced with `text-ai`/`bg-ai`, dropdown restyled to match `<Card>` border/radius, mobile hamburger fixed. Three flair additions per user request: (a) 2px brand-blue underline on nav links via `after:` pseudo-elements, also lit on Services trigger when dropdown is open, (b) dropdown enter animation (`navDropdownIn` keyframe in `globals.css`, 150ms fade+rise) plus an upward caret notch above the card aligned to the trigger, (c) magnetic CTA — wrapper around `<Button>` does `hover:scale-[1.02]` + brand-tinted `box-shadow` glow.

Two structural deviations from the original plan, both driven by user feedback on a wide monitor:
1. **Nav is full-bleed** (no `max-w`) instead of `max-w-[1280px]`. The 1280 cap pulled the CTA toward the middle of wide monitors. Spec section "Spacing rhythm" updated accordingly.
2. **Horizontal padding scale widened** from `px-6 md:px-[80px]` to the 4-step `px-[24px] md:px-[48px] lg:px-[96px] xl:px-[128px]`. Spec section "Spacing rhythm" updated accordingly. **Future section refactors must adopt this scale**, not the original 80px-only value.

**Critical bug fix in `app/globals.css`:** The universal reset `*, *::before, *::after { margin: 0; padding: 0 }` was unlayered, which silently outranks every Tailwind v4 `@layer utilities` rule. Result: `p-*`, `m-*`, `gap-*` — including arbitrary-value forms like `p-[8px]` — were rendering as `0` everywhere. Wrapped the reset in `@layer base` to restore proper precedence. This affected Session 1's primitives too (they were importing fine but their `p-[36px]` etc. were no-ops). All future sessions can now rely on Tailwind utilities working as expected.

**Session 3 onward:** Hero → Trust bar → Problem (new) → Services → Why Us → Work → Comparison → Testimonials → Founders → FAQ → Contact CTA → Footer. Stop after each.

---

## Critical files

**To create:**
- `components/ui/section.tsx`
- `components/ui/section-header.tsx`
- `components/ui/card.tsx`
- `components/ui/eyebrow.tsx`
- `components/sections/problem.tsx` (Session 4 or 5)

**To modify (one per session):**
- `app/globals.css` (Session 1 — token additions)
- `app/page.tsx` (Session 1 — re-order to new arc, add Problem import)
- All 13 section/layout files (one per session)

---

## Verification (per session)

After each section:
- `pnpm dev` → visit `http://localhost:3000` → section renders with no console errors.
- Visual check: card padding, radius, eyebrow, H2 size, header→content margin all match the locked values.
- Scan the section file for any remaining hardcoded hex (`#`) that isn't a brand pillar color used intentionally — if found, replace with token.
- No inline `style={{}}` in the refactored file (except where dynamic computation requires it, e.g., the orb HUD).

After Session 1 (primitives only):
- Primitives type-check and import without breaking the build.
- No visual change yet — page still renders identically.

---

## Out of scope (deferred)

- Content rewrite (sequential, after design pass — using existing `homepage.md` baseline)
- Service hub pages, individual service pages, About, Contact, Blog
- Case study content (blocked on client details)
- `llms.txt`, `sitemap.ts`, `robots.ts`, FAQPage schema
- Mobile responsiveness pass beyond what each section's primitives give for free
- Core Web Vitals audit
- LinkedIn URLs for founders (placeholder still)
