# Session 18 — Handoff Brief

**Date:** 2026-05-20
**Scope:** Comparison + FAQ + Social-Proof (Testimonials) sections, **redesigned in parallel**.
**Branch state:** `design-revamp` @ `8a870ca` (pushed to origin). Tree clean except untracked `docs/FAQReference.jpeg` (visual ref for FAQ; not yet committed).
**Predecessors:** Session 17 (ContactCta + Footer Figma redesigns, graduated 2026-05-19) → Session 17 follow-up (2026-05-20 ContactCta refit to Figma landscape + footer wordmark reorder + PR #33 mobile-resp pass graduated).
**This doc is the source-of-truth seed for the next session — read first, before anything else.**

---

## 0. TL;DR

Three homepage sections need a Session-17-style redesign + copy pass, **in parallel** (three worktrees, three contexts). Each section gets the same gstack chain we've now run six times in a row: A1 (redesign) and/or A3 (copy chain), then plan-design-review → writing-plans → executing-plans → impeccable critique → design-review → simplify → graduate.

**Sections:**
1. **Comparison** (`components/sections/comparison.tsx`, 47 lines) — user kept it after explicit pushback (Session 17 close). Most likely an A1 visual redesign + light A3 polish on one row (Track record).
2. **FAQ** (`components/sections/faq.tsx` + `faq-data.ts`, 7 Q&As) — design ref dropped at `docs/FAQReference.jpeg` (untracked, 1898×898 JPEG). A1 + likely no copy change (7 answers already gated through writing-guardrails on 2026-05-14).
3. **Social Proof / Testimonials** (`components/sections/testimonials.tsx`, 131 lines) — **A3 create-shaped: 7 `[TODO: …]` Clutch placeholders block the section.** Copy is the unlock; visual redesign happens after the Clutch content arrives. **Cannot ship without USER_INPUT** (rating, review count, 3 quotes verbatim + reviewer names + deep-links).

---

## 1. Pre-work the user owes the next session

Don't open Session 18 without these. Save a turn by collecting them now.

### 1a. Figma node IDs (or "no Figma — use existing JSX as baseline")

The locked Figma file is `mQsbMuw0spVgIu7jXirr3o` (Metaborong-Portfolio) — same file used for Hero, Why-Us, Founders, ContactCta, Footer. Confirm whether Comparison / FAQ / Testimonials have target frames in there:

- **Comparison:** node id = `?` (or `no Figma — keep current JSX structure, just visual polish pass`)
- **FAQ:** node id = `?` (the `docs/FAQReference.jpeg` is presumably an export from this — confirm the source frame id so we can pull live design context)
- **Testimonials:** node id = `?` (or "keep the shipped Clutch-strip + 3-card layout")

If a section has no Figma frame, that's fine — the existing JSX is the baseline. The chain becomes A2-polish-shaped rather than A1-redesign-shaped (see §3 below).

### 1b. Clutch content (Testimonials blocker)

The shipped testimonials section is full of `[TODO: …]` placeholders. Pull from the Clutch profile (`@/lib/links` exports `clutchProfileUrl`):

- **Aggregate rating** (e.g. `4.9`)
- **Verified review count** (current count today)
- **Top 3 review quotes verbatim** + reviewer name, company, deep-link URL per review

Without this, Testimonials cannot be graduated. Comparison + FAQ can ship in parallel and Testimonials lands when the Clutch content arrives.

### 1c. Comparison "Track record" row decision

Track record row currently reads `DeFi · AI · SaaS shipped`. It's the only vague row in an otherwise concrete table. Three options the user should pre-decide so Session 18 doesn't stall:

- **A)** Drop the row entirely (6 → 5 rows).
- **B)** Replace with a number (e.g. `8+ products in production` from existing TRUST SIGNALS).
- **C)** Keep as-is.

---

## 2. Section-by-section current state

### 2.1 Comparison

- **JSX:** `components/sections/comparison.tsx` (47 lines, server component — no `'use client'`). Module-const `rows[]` of 6 objects (`label`, `mb`, `large`, `free`); rendered as a `<table>`. Wired into `app/page.tsx:77` (`<ComparisonSection />` rendered AFTER `<TestimonialsSection />`).
- **Copy:** lives in JSX (rows[] array) AND in `docs/content/homepage.md` §[COMPARISON] (lines ~367–397). Both are A3-locked as of 2026-05-14 (homepage copy audit). H2: `How Metaborong compares`. Section intro: 16w "If you're choosing between us, a large agency, or a freelance team — here's the honest read."
- **Locked concrete claim:** `7 chains — Ethereum, Solana, Base, Arbitrum, Hyperledger, Polygon, Avalanche`. This is the ONLY place on the homepage where the chain list lives in full. Do not touch.
- **Pre-existing flag:** there is a site-wide 7-chains-vs-4-chains drift (Hero blockquote says "EVM chains and Solana"; TRUST SIGNALS says "Ethereum, Solana, Base, Arbitrum (confirm with team)"; Comparison says 7). Was deferred during Session 17. Decide whether to resolve in Session 18 (touches `lib/schema.ts`, FAQ, Hero blockquote) or keep deferred.
- **DESIGN.md status:** no row in the Decisions Log yet. Will be added at graduation.
- **Likely shape:** A1 visual redesign + tiny A3 (Track-record row only). Audit should be quick — table copy was already gated.

### 2.2 FAQ

- **JSX:** `components/sections/faq.tsx` (41 lines, `'use client'` — uses `useState` for accordion expand/collapse) + `components/sections/faq-data.ts` (data file with 7 Q&As). Wired into `app/page.tsx:79`.
- **Copy:** `docs/content/homepage.md` §[FAQ] (lines ~413–449). 7 Q&As, each answer ≤50 words, self-contained for AI extraction. Sentence-start variety locked 2026-05-14 (only 1/7 starts with `A Web3…`). All under 50 words. Cut from 8 to 7 on 2026-05-14.
- **Visual ref:** `docs/FAQReference.jpeg` (1898×898, untracked) — drop this into the spec asset folder when starting (move to `docs/superpowers/assets/2026-05-21-faq-figma.png` or similar, do NOT ship in `public/`).
- **Pre-existing drift to fix in passing:** the AEO checklist at `homepage.md:558` still says `FAQ: 8 Q&As`; doc body has 7. Flag-only since 2026-05-17; resolve at graduation.
- **AEO note:** FAQ has the highest extract-rate potential of the page tail — answers must stay ≤50w and self-contained (no "as above" / "see Services" backrefs).
- **Hard constraints:** `FAQPage` JSON-LD lives in `lib/schema.ts` (`faqSchema`) and mirrors `faq-data.ts` — keep them byte-consistent at all times. Schema drift breaks rich results.

### 2.3 Social Proof / Testimonials

- **JSX:** `components/sections/testimonials.tsx` (131 lines, `'use client'` — adds drag/scroll lane via `useRef` per PR #33). Wired into `app/page.tsx:74` (BEFORE Comparison).
- **Padding-chain drift (2026-05-20):** this section's `<section>` still hand-rolls the old four-step chain (`sm:px-[24px] md:px-[48px] lg:px-[96px] xl:px-[128px]`) instead of consuming `<Section>` or the new PR #33 six-step chain. Likely should migrate to `<Section bg="subtle" maxWidth="xwide">` at redesign time. Flag.
- **Copy:** `docs/content/homepage.md` §[TESTIMONIALS] (lines ~242–288). Heavy `USER_INPUT:` markers — rating, review count, profile URL, 3 quotes, deep-links. Section is **blocked on Clutch content** until those arrive.
- **Locked decisions:** (a) Section uses the **official Clutch widget** as primary trust marker (Session 16 lock, see DESIGN.md Decisions Log 2026-05-19 Why-Us row); a static text/badge fallback with `sr-only` SEO content is the a11y/SEO pair. (b) Each card whole-link to Clutch; `target="_blank" rel="noopener"`. (c) Per-quote deep-link as `Read on Clutch →`. (d) Section-level `View all reviews on Clutch →` below the grid.
- **Heading:** `## Reviewed and verified on Clutch` (locked 2026-05-14; replaces previous "Voices of trust" agency-speak).

---

## 3. Methodology — which context per section

Reference: `docs/superpowers/SESSIONS.md` for the full per-context skill chain. The skeleton:

### A1 — new homepage section, from scratch (or full redesign)
brainstorming → frontend-design / design-shotgun → plan-design-review (spec gate) → writing-plans → executing-plans → impeccable critique → design-review → simplify → graduate (DESIGN.md + CHANGELOG.md + scorecard).

### A2 — polish iteration on a shipped section (the Session-12 nav flow)
critique → layout → polish → frontend-design — for existing-section polish passes. **Default for the Comparison + Testimonials visual redesigns** if there's no Figma frame.

### A3 — copy-only change on a shipped section (the copy chain)
seo-content-auditor (audit FIRST) → write to `homepage.md` → seo-aeo-landing-page-writer (rewrite) → seo-content-auditor (re-score — must beat the baseline) → seo-authority-builder (only on trust-heavy pages — Founders, Testimonials yes; Comparison/FAQ no) → copywriting (claim-gate) → writing-guardrails vet (AI-slop / em-dash / banned words).

### Per-section recipe

| Section | Context | Notes |
|---|---|---|
| **Comparison** | A2 (visual polish) + tiny A3 (Track-record row only, if user picks B from §1c) | Copy table mostly locked since 2026-05-14; skip full audit; targeted single-row rewrite. |
| **FAQ** | A1 if `FAQReference.jpeg` is a real Figma redesign; A2 if it's just a layout polish brief | Copy already gated; do NOT re-run A3 unless a question's answer is being rewritten. Mirror any answer edit into `lib/schema.ts` `faqSchema`. |
| **Testimonials** | A3 (create — Clutch content fill) **plus** A1 (visual redesign if Figma frame exists; else A2 polish) | Cannot start without Clutch content (§1b). Visual + copy interleave — quote content shapes card aspect, so do A3 first, A1 after. |

---

## 4. Parallel execution model (three worktrees)

Memory `feedback-coordinator-preview-and-verify` says the parallel-worktree merge-back pattern worked in Session 16 (Why-Us + Founders in parallel). Reuse it.

### Setup

```bash
# From /Users/zephyr/Claude-Workspace/projects/mb-website (main checkout)
git fetch origin
git worktree add ../mb-website-comparison  -b section/comparison-redesign  design-revamp
git worktree add ../mb-website-faq         -b section/faq-redesign         design-revamp
git worktree add ../mb-website-testimonials -b section/testimonials-redesign design-revamp
```

### Dev ports (memory `feedback-parallel-worktree-dev-ports`)

`:3000` / `:3001` are taken by other terminals. Each worktree starts its dev server on a **free** port:

```bash
PORT=3099 pnpm dev    # comparison worktree
PORT=3098 pnpm dev    # faq worktree
PORT=3097 pnpm dev    # testimonials worktree
```

Confirm served HTML contains your changes before calling QA done (memory: don't trust the file edit — verify SSR).

### Merge-back (Session 16 proven pattern)

When each worktree's chain is green (tsc 0, design-review PASS, simplify done):

```bash
# In main checkout, on design-revamp
git fetch . section/<branch>
git merge --no-ff section/<branch> -m "Merge section/<branch>: <one-line>"
# Run tsc + curl SSR smoke against the merged tree before moving to the next branch
```

Merge order suggestion: **Comparison first** (smallest surface), **FAQ second** (data file + schema mirror), **Testimonials last** (largest surface + cross-file Clutch wiring). Each merge gets a `tsc --noEmit` + SSR string-grep before the next.

### Graduate once at the end

Don't graduate three times. After all three are merged into `design-revamp`, write a **single Session-18 graduation commit**:
- DESIGN.md Decisions Log: 3 rows (one per section) for 2026-05-21 (or whatever the merge date is).
- CHANGELOG.md: one `## 2026-05-21 — Session 18` entry covering all three.
- Copy-audit scorecard: rows for sections that ran A3 (likely Testimonials + maybe one Comparison row).
- Each section's spec + plan + (if A3) copy-audit committed in its worktree before merge.

---

## 5. Hard constraints (do not violate without explicit user approval)

These are project locks — every Session-17 prompt enforced them, every Session 18 prompt must too.

### 5.1 DESIGN.md

- **Always read `DESIGN.md` before any visual/UI decision.** Fonts, colors, spacing, motion grammar, primitive variants, section patterns. (CLAUDE.md rule.)
- **Section primitive padding chain (post PR #33 graduation 2026-05-20):** `px-[16px] sm:px-[24px] md:px-[40px] lg:px-[48px] xl:px-[80px] 2xl:px-[128px]`. Six steps. Full `128` only at `2xl ≥1536px`. Source of truth = `components/ui/section.tsx:36`. CSS variable `--section-px` is **drifted** (still 24/48/72/96 at sm/md/lg/xl) — flagged in DESIGN.md Layout section; class chain wins.
- **Section primitive max-width variants:** `wide` (1120), `xwide` (1280), `narrow` (880), `prose` (720). Default to `xwide` unless content demands otherwise.
- **`<Button>` primitive** (`components/ui/button.tsx`): variants `primary | ghost | secondary`, sizes `sm | md | lg`, `arrow` prop = split-arrow Bauhaus signature. Hover = `bg-[#1a3fdb]`. **Radius-0.** Never hand-roll a split-arrow.
- **`<Eyebrow>` primitive** (`components/ui/eyebrow.tsx`): `text-[11px] font-bold uppercase tracking-[0.1em] leading-none text-gray-light`. `!`-override convention for size/color tweaks (e.g. `text-[12px]! text-dark!` — see footer.tsx).
- **DESIGN.md a11y rule:** `#999` / `text-gray-light` is **forbidden on load-bearing copy** (only tertiary labels, disabled state, decorative `aria-hidden`). WCAG AA contrast everywhere else.

### 5.2 Copy guardrails

- **Em-dashes are ENDORSED in visible body copy** per `DESIGN.md:37`. The "no em-dash" voice in gstack writing-skills (seo-aeo-landing-page-writer, copywriting) is **overridden by DESIGN.md** per CLAUDE.md instruction priority. The guardrail is **alt/ARIA-scoped only** — strip em-dashes from screen-reader-announced text (`alt`, `aria-label`) but keep them in visible prose. Memory `feedback-em-dash-guardrail-scope`. **Don't over-correct.**
- **Positioning is Web3 AND AI, equal.** Memory `positioning-web3-and-ai-equal`. Never frame Metaborong as "Web3-first" or competition as "Web3 agencies" alone. Every claim line carries both pillars when both are relevant.
- **Brand color discipline.** Memory `feedback-brand-color-caveats`. Flag any raw `#296ff0` / `#204AF8` hex, R3F `new THREE.Color()`, or SVG `fill=` that bypasses `--color-brand` at write time — not at the next refresh.

### 5.3 Process

- **Don't push after every change.** Memory `feedback-no-push-after-every-change`. Commit locally to `design-revamp` (or the worktree branch) in logical units; push only when the user explicitly says so.
- **Subjective visual placement → candidate-pick.** Memory `feedback-visual-placement-candidates`. Render 2–3 labeled variants on the live page and let the user choose. Don't burn reject cycles on pixel-detection or eyeballing.
- **Never `rm -rf .next` while the dev server is running.** Memory `feedback-dev-server-next-cache`. Corrupts served CSS with no error.
- **`.env.local` `$` escapes.** Escape every `$` as `\$` — Next dotenv-expand substitutes `$token` with empty string, silently mangling secrets. Backslash is the only escape (single quotes do nothing).
- **`/figma-use` skill is absent.** Memory `feedback-figma-use-skill-absent`. Call Figma MCP read tools directly (`get_design_context`, `get_screenshot`). Retry on first rejection. Figma text ≠ authoritative copy (always go through A3).

### 5.4 Verification posture

- Section components are **visually QA'd**, not unit-tested. `tsc --noEmit` exit 0 + dev QA at **1440 / 1280 / 375** is the bar. **No Vitest** for presentational sections.
- `npm run build` is **expected to fail at `/blog/rss.xml`** — that's the PR #26 env hold (memory `project-cms-merge-and-build-env`), NOT a regression.
- SSR smoke: `curl -s localhost:30XX | grep -o '<expected-string>'` — confirm the change is in the server HTML before declaring done. Memory `feedback-coordinator-preview-and-verify` warns about the "first dev-server poll too short" trap.

### 5.5 Schema mirror

- `lib/schema.ts` is the **JSON-LD source of truth**: `Organization` (homepage), `FAQPage` (FAQ), `Question/Answer` (Why-Us standalone AEO block). Any answer edit in `faq-data.ts` MUST mirror into `faqSchema` in the same commit. Drift breaks rich results.

---

## 6. Files / memories to load on Session 18 start

Read in this order:

1. **`docs/superpowers/specs/2026-05-20-session-18-handoff.md`** (this doc).
2. **`CLAUDE.md`** (project root) — agentic gotchas: Next 16 → `proxy.ts`, `.env.local` `$` escapes, no `rm -rf .next` mid-dev.
3. **`DESIGN.md`** — full read. Pay attention to the new Decisions Log rows for 2026-05-19 (Why-Us, Founders, Hero+Nav, ContactCta, Footer) and 2026-05-20 (ContactCta refit, footer wordmark order, PR #33 chain re-tune).
4. **`docs/superpowers/SESSIONS.md`** — context skeletons + skill cheat sheet.
5. **`docs/content/homepage.md`** §§ COMPARISON, TESTIMONIALS, FAQ (current locked copy).
6. **`docs/writing-guardrails.md`** — the A3 step-7 vet criteria.
7. **MEMORY.md** entries (auto-loaded via the session-start memory pointer):
   - `visual-direction-and-workflow` (2026-05-04 lock + Session-15 hero supersession)
   - `workflow-impeccable-frontend-design-stack` (Session-12 proven chain)
   - `workflow-copy-chain-a3` (A3 routing)
   - `project-metaborong-website` (all locked decisions, services, competitor intel)
   - `feedback-em-dash-guardrail-scope`
   - `feedback-brand-color-caveats`
   - `positioning-web3-and-ai-equal`
   - `feedback-visual-placement-candidates`
   - `feedback-parallel-worktree-dev-ports`
   - `feedback-coordinator-preview-and-verify`
   - `feedback-no-push-after-every-change`
   - `feedback-dev-server-next-cache`
   - `feedback-figma-use-skill-absent`
   - `project-cms-merge-and-build-env`

Reference docs (read selectively as the task requires):

- `db/README.md` (only if a section starts to need data-layer changes — none planned).
- `lib/schema.ts` (FAQ schema mirror; will be edited).
- `lib/links.ts` (Clutch profile URL constant).
- `app/page.tsx` (render order — `TestimonialsSection` → `ComparisonSection` → `FaqSection` → `ContactCtaSection`).

---

## 7. Deliverable shape per section (the artifact set)

For each section, the chain produces these files (mirrors Sessions 15–17):

- **Spec:** `docs/superpowers/specs/YYYY-MM-DD-section-<name>.md`
  - Design intent (1–2 paragraphs)
  - Anatomy (Figma node → project component mapping)
  - Token map (every visual primitive grounded in DESIGN.md)
  - Deviations 1–N (each explicitly logged with WHY)
  - Hard constraints
  - plan-design-review scorecard (≥8.5 to proceed)
  - impeccable critique entry (added later)
  - design-review entry (added later)
  - GRADUATION DRAFT (added at the end, copy-pasted into DESIGN.md row + CHANGELOG.md entry)
- **Plan:** `docs/superpowers/plans/YYYY-MM-DD-section-<name>.md`
  - Tasks broken to 2–5-minute steps (writing-plans skill format)
  - Each step has: file, exact code/command, verification, expected result
  - Self-review section at the end
- **(A3 only) Copy audit:** `docs/superpowers/specs/YYYY-MM-DD-<section>-copy-audit.md`
  - Baseline score with rubric (5 categories, 1–10 each)
  - Drift items
  - A3 Scorecard table (added at graduation)
- **Asset capture:** `docs/superpowers/assets/YYYY-MM-DD-<section>-figma.png` (raw Figma export, **local-only, do NOT ship**; provenance is the Figma node id).

Optimized assets (webp from raw PNG via `sharp`) go to `public/<section>/<asset>.webp`. Target ≤500 KB, q=80–86, 2000–2400 px wide.

---

## 8. Open decisions for the user (resolve before Session 18 opens)

| # | Decision | Why it matters |
|---|---|---|
| D1 | **Comparison Figma node id** (or `no Figma`) | Determines A1 vs A2 chain. |
| D2 | **FAQ Figma node id** (the `docs/FAQReference.jpeg` source) | Same. |
| D3 | **Testimonials Figma node id** (or `keep current layout`) | Same. |
| D4 | **Clutch content** (rating, review count, 3 quotes verbatim + reviewer names + deep-links) | Blocks Testimonials. |
| D5 | **Comparison "Track record" row** — drop / replace with `8+ products` / keep | Pre-empts a mid-A3 question. |
| D6 | **7-vs-4-chains site-wide drift** — resolve in Session 18 (touches `lib/schema.ts` + Hero blockquote + FAQ + TRUST SIGNALS) OR keep deferred | Cross-cutting; affects Comparison + FAQ + maybe Testimonials simultaneously. |
| D7 | **Execution model** — three parallel worktrees (Session 16 pattern) vs. sequential like Session 17 | Parallel is faster + isolates conflicts; sequential is simpler if scope shifts mid-session. Memory `feedback-coordinator-preview-and-verify` flags coordinator gotchas. Recommend parallel since the three sections are non-overlapping. |
| D8 | **Push cadence** — push per merge or push once at end-of-session | Default = end-of-session per `feedback-no-push-after-every-change`. |

---

## 9. Out-of-scope reminders

Don't let these sneak into Session 18:

- PR #26 (CMS merge → main) is still **open / held on env**. Memory `project-cms-merge-and-build-env`. Don't act on it without explicit instruction.
- `lib/schema.ts` Organization `PostalAddress` ×3 (NAP from footer offices) is deferred from Session 17. Not Session 18 scope unless a section explicitly needs it.
- `--section-px` CSS variable drift (24/48/72/96 vs. the new 16/24/40/48/80/128) — flagged, not Session 18 scope unless something breaks.
- Real Behance / Medium / Discord URLs for footer (currently `/` redirects) — deferred.
- 17 MB repo bloat (raw Figma PNG + Gemini PNG committed upstream by `5a41d7e`) — pre-existing, no history rewrite planned (collaborative repo).
- Service-page noindex strategy / reindexing — separate follow-up, not Session 18.

---

## 10. Tone reminders

- **Keep responses short and concise** (user's global preference). No trailing recaps.
- **No emojis** unless explicitly requested.
- **Push back when warranted.** This session's Comparison-keep decision came from honest pushback — repeat the pattern.
- **Match existing voice.** Don't soften concrete claims to be "safer" — the page already chose to be specific (7 chains, named clients, named founders).

---

## 11. Session-open command (suggested first message to paste into the new session)

> Start Session 18 — Comparison + FAQ + Testimonials redesign in parallel. Read `docs/superpowers/specs/2026-05-20-session-18-handoff.md` first, then check the open decisions in §8. My answers to §8: [D1=…, D2=…, D3=…, D4=…, D5=…, D6=…, D7=…, D8=…]. Begin with the parallel-worktree setup in §4, then Figma pulls for the three frames, then per-section chains per §3. Don't push until I ask.
