# Plan: Comparison redesign — Session 18 (2026-05-21)

**Branch:** `section/comparison-redesign`  ·  **Worktree:** `../mb-website-comparison`  ·  **Dev:** `PORT=3099 pnpm dev`
**Chain:** A3 (copy) → A2 (visual). Inherits hard constraints from `docs/superpowers/specs/2026-05-20-session-18-handoff.md` §5.

This plan is the as-executed record; each step lists the file, the change, the verification, and what should result.

---

## Phase 1 — A3 copy chain (audit → rewrite → vet → sync)

### Step 1 — A3 baseline audit
- **File created:** `docs/superpowers/specs/2026-05-21-comparison-copy-audit.md`
- **Action:** Score the 2026-05-14 locked table copy on 5 categories (AEO, SEO, tone, specificity, readability), 1–10 each.
- **Verify:** Composite ≤6.0 reflects the "too aggressive" complaint.
- **Result:** Baseline = **5.2/10**. Tone (4), SEO keyword coverage (4), AEO extractability (5) drive the low score. Specificity (6) and readability (7) are the saved categories.

### Step 2 — Edit source of truth (homepage.md) before JSX
- **File edited:** `docs/content/homepage.md` §[COMPARISON] (lines ~367–397)
- **Action:** Rewrite H2, intro, 6 row labels + 18 cell values, footnote. Preserve `7 chains — Ethereum, Solana, Base, Arbitrum, Hyperledger, Polygon, Avalanche` verbatim. Replace `DeFi · AI · SaaS shipped` → `25+ products in production` (D5). Update the WHY block with the 2026-05-21 decision log.
- **Verify:** `grep -n "25+ products in production\|7 chains — Ethereum" docs/content/homepage.md` — both land.
- **Result:** Doc is the source of truth; JSX sync will mirror.

### Step 3 — Re-score the rewrite + claim-gate + writing-guardrails vet
- **File appended:** `docs/superpowers/specs/2026-05-21-comparison-copy-audit.md` §§4, 5, 6
- **Action:** Score the rewrite against the same 5-category rubric. Walk each new claim through the claim-gate ledger (source / verification). Walk every new line through `docs/writing-guardrails.md` (banned words, significance inflation, -ing tails, false ranges, em-dash scope, Web3+AI equal weighting).
- **Verify:** Composite ≥7.0 (target). Every claim has a source. Every guardrail-row reads `Pass`.
- **Result:** Composite = **8.4/10** (+3.2). All claims verified. All guardrails pass. `seo-authority-builder` skipped per A3 gating (Comparison is not a trust-heavy E-E-A-T section).

### Step 4 — Sync homepage.md → `components/sections/comparison.tsx`
- **File rewritten:** `components/sections/comparison.tsx`
- **Action:** Mirror `rows[]` + H2 + intro + footnote into the JSX. Also collapse Phase-2 A2 work into the same rewrite (Section primitive, Eyebrow primitive, table a11y, striping fix) — single file, single commit.
- **Verify:** `curl -s localhost:3099/ | grep -o "25+ products in production"` returns the string; `grep -o "7 chains — Ethereum"` returns the string; `grep -o "How Metaborong compares to large agencies and freelance teams"` returns the string.
- **Result:** Doc and JSX byte-consistent on every cell.

---

## Phase 2 — A2 visual polish (consumed inline in Step 4)

### Step 5 — impeccable critique resolutions (applied in Step 4)
- **File edited:** `components/sections/comparison.tsx`
- **Action:** Resolve P0 + P1 + P2 findings from §7 of the spec — `scope`, `<caption>`, `<Eyebrow>`, `<Section>`, `text-gray` (not `text-gray-light`), striping bg, empty-th sr-only label, column-header `font-bold` parity.
- **Verify:** All 8 findings in spec §7 mapped to specific lines of the new file.
- **Result:** P0/P1/P2 cleared.

### Step 6 — Verification gate
- **Commands:**
  - `cd ../mb-website-comparison && npx tsc --noEmit` → expect exit 0.
  - `curl -s http://localhost:3099/ | grep -oF "<expected string>"` for each of 7 new claims.
- **Result:** `tsc` exit 0; all 7 strings land in SSR HTML.

### Step 7 — design-review (live diff)
- **Tool:** Playwright via system Chrome at viewports 1440 / 1280 / 375.
- **Action:** Screenshot the rendered section, log observations in spec §8.
- **Result:** No regressions; striping refresh required (Step 8); no other issues.

### Step 8 — Striping fix (only visual change after first pass)
- **File edited:** `components/sections/comparison.tsx`
- **Diff:** `bg-white` (even rows) → `bg-bg-subtle/60`; `bg-transparent` (odd rows) unchanged.
- **Why:** Section bg moved to `bg-bg` (white) per the alternation contract; old `bg-white` striping was invisible against it.
- **Verify:** Re-screenshot at 1440; alternation now reads as a soft warm tint.

### Step 9 — simplify pass
- **Action:** Walk the diff; remove anything that doesn't trace to a finding or to the A3 rewrite. Outcome: every added line is justified; the file is 56 lines.
- **Result:** No removable lines.

### Step 10 — Commit
- **Branch:** `section/comparison-redesign`
- **Files:**
  - `components/sections/comparison.tsx`
  - `docs/content/homepage.md` (§[COMPARISON] block + WHY)
  - `docs/superpowers/specs/2026-05-21-comparison-copy-audit.md`
  - `docs/superpowers/specs/2026-05-21-section-comparison.md`
  - `docs/superpowers/plans/2026-05-21-section-comparison.md`
- **Commit message:** `section(comparison): A3 rewrite + A2 polish (Session 18)`
- **Do NOT push** per `feedback-no-push-after-every-change` and the brief §"Do NOT" — orchestrator pushes at end-of-session.

---

## Self-review (per writing-plans format)

- Hard constraints honored: 7-chain string verbatim ✓ · `25+ products in production` applied to Track record ✓ · em-dashes preserved in visible body copy ✓ · no DESIGN.md / CHANGELOG.md / other-section edits ✓ · no push ✓ · `npm run build` not invoked (PR #26 env hold) ✓.
- Cross-file edits limited to: `docs/content/homepage.md` (expected per brief §"Definition of done") + the three deliverable docs.
- Drift flagged but NOT edited: `homepage.md:458` `8+ products` → `25+` for orchestrator graduation.
- Em-dash guardrail: visible body em-dashes retained; no alt/aria copy in section, so no stripping required.
- Brand color discipline: no raw hex / no THREE.Color / no SVG fill bypass introduced.
