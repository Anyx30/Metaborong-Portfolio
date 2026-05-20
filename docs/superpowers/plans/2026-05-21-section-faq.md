# Plan — Section FAQ (Session 18-faq)

**Date:** 2026-05-21
**Spec:** `docs/superpowers/specs/2026-05-21-section-faq.md`
**Audit:** `docs/superpowers/specs/2026-05-21-faq-copy-audit.md`
**Branch:** `section/faq-redesign`
**Worktree:** `/Users/zephyr/Claude-Workspace/projects/mb-website-faq`
**Dev port:** `PORT=3098 pnpm dev`

---

## Tasks

### 1. Asset move (already done at session start)

- [x] `mv docs/FAQReference.jpeg docs/superpowers/assets/2026-05-20-faq-reference.jpeg` (worktree).
- [x] Confirm not present in `public/` (search returns nothing).

### 2. Edit `docs/content/homepage.md` §[FAQ] (lines ~423–442)

- [ ] Replace the 7 Q/A blocks with the rewritten set from the copy-audit doc.
- [ ] Update the `### [FAQ — H2]` block's WHY footer to reflect the 2026-05-21 reopen + rewrite.
- [ ] Verify: visual diff shows exactly 7 Q+A blocks, each ≤50 words.

### 3. Edit `docs/content/homepage.md:558` AEO checklist line

- [ ] `- [x] FAQ: 8 Q&As, all under 50 words, all self-contained` → `- [x] FAQ: 7 Q&As, all under 50 words, all self-contained`.
- [ ] Verify: `grep -n 'FAQ:' docs/content/homepage.md` returns exactly the updated line.

### 4. Replace `components/sections/faq-data.ts` body

- [ ] `faqs: Faq[] = [ … ]` replaced verbatim from the copy-audit final 7 rows.
- [ ] Verify: `wc -l components/sections/faq-data.ts` returns same shape (header + 9 lines of data + closing).
- [ ] Verify: `lib/schema.ts` is **unchanged** (faqSchema derives via `.map()`).

### 5. Split + redesign `components/sections/faq.tsx`

Action: rewrite `faq.tsx` as a server component that consumes `<Section>`, renders the left-rail (eyebrow + H2 + helper card) and a new client `<FaqAccordion>` for the right rail.

- [ ] Drop `'use client'` directive from `faq.tsx`.
- [ ] Remove the inline `<section>` markup and the four-step padding chain.
- [ ] Render `<Section as="section" id="faq" maxWidth="xwide">` wrapping a 2-col grid.
- [ ] Left rail (sticky on md+): `<Eyebrow>FAQ</Eyebrow>`, H2, helper card (hidden < md).
- [ ] Right rail: `<FaqAccordion />`.

### 6. Add `components/sections/faq-accordion.tsx`

Action: new client component holding the `useState` accordion. Pull `faqs` from `@/components/sections/faq-data`.

- [ ] `'use client'` directive.
- [ ] `useState<number | null>(0)` — first item default-open.
- [ ] For each row:
  - [ ] `<button type="button" aria-expanded={…} aria-controls={…} id={…}>` with chevron + label.
  - [ ] `<div role="region" aria-labelledby={…} hidden={!isOpen}>` panel — always rendered, `hidden` toggles visibility.
- [ ] `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand` on each button.
- [ ] Chevron `<ChevronDown aria-hidden="true">` rotates `180deg` when open with `transition-transform duration-200`.

### 7. Verification — typecheck + SSR smoke

- [ ] `cd /Users/zephyr/Claude-Workspace/projects/mb-website-faq && npx tsc --noEmit` → exit 0.
- [ ] Start dev: `PORT=3098 pnpm dev` (background).
- [ ] Wait for ready, then `curl -s http://localhost:3098 | grep -c 'What is a Web3 development company'` → ≥1.
- [ ] `curl -s http://localhost:3098 | grep -c 'aria-controls="faq-panel-'` → 7 (all triggers).
- [ ] `curl -s http://localhost:3098 | grep -c 'id="faq-panel-'` → 7 (all panels rendered).

### 8. Commit

- [ ] Stage: `faq.tsx`, `faq-accordion.tsx`, `faq-data.ts`, `homepage.md`, spec + plan + audit docs, asset move.
- [ ] Commit message:
  ```
  faq: two-column redesign + A3 AEO rewrite (Session 18-faq)
  
  - 7 Q&As reframed as third-person search queries; all ≤50w, self-contained;
    audit composite 6.4 → 8.8
  - Layout: <Section xwide> + sticky title rail (md+) + helper card +
    client accordion (split: faq.tsx server + faq-accordion.tsx client)
  - a11y: focus-visible ring, aria-controls/aria-labelledby/role=region/hidden
    quartet; tap target 56px
  - Schema invariant: faqSchema auto-derives from faqs, no lib/schema.ts edit
  - Fix: homepage.md:558 AEO checklist FAQ: 8 → 7
  - Asset: docs/FAQReference.jpeg → docs/superpowers/assets/...
  ```
- [ ] Verify: `git log -1 --stat` shows the expected file list.

### 9. Self-review

- [ ] All hard constraints (spec §Hard constraints) honored.
- [ ] All deviations from master plan logged (spec §Deviations).
- [ ] Plan-design-review composite ≥8.5 ✓ (8.8).
- [ ] A3 audit composite beats baseline ✓ (6.4 → 8.8).
- [ ] No push.
- [ ] No `DESIGN.md` / `CHANGELOG.md` / other-section files touched.

---

## Out of scope (deferred / not this session)

- 7-vs-4-chains drift (D6 deferred at session-18 orchestrator).
- `--section-px` CSS variable still on the old 4-step chain (DESIGN.md flag — not Session-18 scope).
- Pricing claims in FAQ (would require user-verified figures; deliberately absent in rewrite).
- Adding a `Schedule a Call` calendar booking button per JPEG (no existing booking system on the site — would be a new feature, not A2 polish).
