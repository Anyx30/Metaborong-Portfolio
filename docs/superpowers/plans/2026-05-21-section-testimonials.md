# Plan — Section Testimonials redesign (2026-05-21)

**Branch:** `section/testimonials-redesign` (worktree `../mb-website-testimonials`)
**Dev port:** `:3097`
**Predecessor:** `design-revamp` @ `3fa4e68`

---

## Phase 1 — A2 visual prep

### Step 1 — impeccable critique
- **File:** `components/sections/testimonials.tsx`
- **Action:** inline critique against DESIGN.md + brief's named checks
- **Verify:** P0/P1 list produced
- **Expected:** 4 P0 + 8 P1 findings (logged in spec §7)

### Step 2 — impeccable layout (rhythm vs neighbors)
- **Files inspected:** `components/sections/{why-us,founders,work-preview,comparison,faq,contact-cta,problem,services}.tsx`
- **Verify:** Testimonials = subtle alternates correctly with WorkPreview (default) and Founders (default)
- **Expected:** alternation pattern preserved; `<Section bg="subtle" maxWidth="xwide">` confirmed

### Step 3 — Migrate `<section>` → `<Section>`
- **File:** `components/sections/testimonials.tsx`
- **Edit:** replace hand-rolled `<section className="bg-bg-subtle px-[16px] py-[56px] sm:px-[24px] md:px-[48px] md:py-[72px] lg:px-[96px] lg:py-[80px] xl:px-[128px]">` with `<Section bg="subtle" maxWidth="xwide">`
- **Verify:** `pnpm exec tsc --noEmit` exit 0
- **Expected:** clean

### Step 4 — Pre-build Clutch widget shell
- **Files:** `components/sections/clutch-widget.tsx`, `components/sections/testimonials.tsx`
- **Edit a:** parameterise `<ClutchWidget>` with `widgetType` / `height` / `reviews` / `className` props (Why-Us defaults preserved)
- **Edit b:** in `testimonials.tsx`, add `sr-only` outbound link with rating + count text, followed by `<ClutchWidget widgetType="8" height={300} reviews="..." />` in a bordered container
- **Verify:** `pnpm exec tsc --noEmit` exit 0
- **Expected:** clean

---

## Phase 2 — A3 content fill

### Step 1 — seo-content-auditor baseline
- **File created:** `docs/superpowers/specs/2026-05-21-testimonials-copy-audit.md`
- **Verify:** baseline composite computed
- **Expected:** **3.4 / 10** (placeholder-heavy)

### Step 2 — User-input gate
- **User pivoted: pull from Clutch directly** (rather than paste)
- **Action:** `WebFetch` `https://clutch.co/profile/metaborong-technologies-private`
- **Verify:** rating + count + 3 verbatim short quotes + 3 role/company attributions extracted
- **Expected:** 4.9 / 5, 9 reviews, Sedax / Digital Financial Aid / SBS data captured

### Step 3 — Edit `homepage.md` §[TESTIMONIALS]
- **File:** `docs/content/homepage.md`
- **Edit:** replace `USER_INPUT` markers + `[Clutch logo]` ASCII strip with: official widget config block, the 3 verbatim quote blocks (project type + reviewer attribution + Clutch profile CTA), lede sentence, Deviation 1 WHY note
- **Verify:** no `<!-- USER_INPUT` markers remain in §[TESTIMONIALS]
- **Expected:** clean — 0 USER_INPUT markers, 0 TODO markers

### Step 4 — seo-aeo-landing-page-writer (scoped: lede + section CTA microcopy)
- **Action:** inline scoped pass; lede chosen as "Nine verified clients have rated our work on Clutch. Three of them, in their own words."
- **Verify:** ≤2 sentences, source-named, extractable
- **Expected:** clean

### Step 5 — seo-content-auditor re-score
- **File:** `docs/superpowers/specs/2026-05-21-testimonials-copy-audit.md`
- **Verify:** composite > baseline
- **Expected:** **8.0 / 10** (Δ +4.6)

### Step 6 — seo-authority-builder
- **Verify:** E-E-A-T pass criteria all green (Experience / Expertise / Authority / Trust / Reciprocal / Disclosure)
- **Expected:** pass

### Step 7 — copywriting claim-gate
- **Verify:** 6 connective-tissue claims (lede, "Three of them in their own words", verified eyebrow, H2, section CTA, "Read on Clutch") all verifiable
- **Expected:** pass with deviation 1 noted

### Step 8 — writing-guardrails vet on connective tissue
- **Verify:** banned words / significance inflation / `-ing` tails / padded tricolons / em-dash scope / Web3 AND AI balance — all green
- **Expected:** pass

### Step 9 — Sync `homepage.md` → `testimonials.tsx`
- **File:** `components/sections/testimonials.tsx`
- **Edit:** quotes[] array filled with verbatim content; rating + reviewCount = '4.9' / '9'; per-card layout updated to render `{name}, {company}` + `{project}` subline
- **Verify:** `pnpm exec tsc --noEmit` exit 0
- **Expected:** clean

---

## Phase 3 — Final polish + verification

### Step 1 — impeccable polish
- **Decision:** no subjective placement decisions arose (no ASCII candidate-pick needed)
- **Skipped:** per A2 gating rule (jump 1 → 4 when polish theatre not needed)

### Step 2 — frontend-design surgical execution
- **Action:** add card top-row (stars + "Verified · Clutch" eyebrow) and reformat reviewer block to use `{name}, {company}` + `{project}` two-line attribution
- **Verify:** `pnpm exec tsc --noEmit` exit 0
- **Expected:** clean

### Step 3 — verification-before-completion
- **Run:** `pnpm exec tsc --noEmit` (exit 0)
- **Run:** `PORT=3097 pnpm dev` background; `curl -s localhost:3097`
- **Verify:** SSR HTML contains:
  - `Sedax Data Solutions` × 1
  - `Digital Financial Aid` × 1
  - `SBS Construction` × 1
  - `clutch-widget` × 1
  - `Metaborong is rated 4.9 out of 5 on Clutch` × 1
  - `View all reviews on Clutch` × 1
  - `Nine verified clients have rated` × 1
  - `[TODO:` × 0
- **Expected:** all green
- **Result:** ✅ all checks passed (`/tmp/mb-test-ssr.html` 349,172 bytes; 200 OK)

### Step 4 — design-review live QA
- **Action:** screenshot at 1440 / 1280 / 375 via headless browser
- **Verify:** drag-scroll lane scrollable on 375; 3-col grid on ≥1024; Clutch widget renders client-side; deep-links open new tab; focus rings visible on TAB
- **Result:** _logged inline below after capture._

### Step 5 — simplify pass + commit
- **Run:** review of diff for stale imports, dead code, redundant classes
- **Action:** commit on `section/testimonials-redesign` (no push)
- **Expected:** clean diff, single commit

---

## Self-review

- ✅ All P0 critique items resolved.
- ✅ Padding chain migrated to `<Section>`.
- ✅ Clutch widget integrated via parameterised shared component.
- ✅ All `[TODO:]` and `USER_INPUT` markers replaced with sourced content.
- ✅ A3 baseline 3.4 → 8.0 (Δ +4.6).
- ✅ Drag-scroll lane preserved + a11y'd (role/region/tabindex/focus-visible).
- ✅ `'use client'` preserved.
- ✅ Em-dashes endorsed (none added; existing rule respected).
- ✅ Web3 AND AI balance preserved (quote spread: blockchain / Web app / AI).
- ⚠️ Deviation 1 (per-review deep-links → profile root): logged in spec §4.
- ⚠️ Deviation 2 (Clutch-foreign brand colors): logged in spec §4.
- ⚠️ Deviation 3 (no reviewer personal names — Clutch policy): logged in spec §4.
- ⏳ Design-review screenshot pass (Phase 3 step 4) → executing next.
- ⏳ Final commit + SHA → executing last.
