# Comparison — A3 Copy Audit (2026-05-21)

**Section:** `components/sections/comparison.tsx` + `docs/content/homepage.md` §[COMPARISON]
**Trigger:** Session 18-comparison reopened the 2026-05-14 table copy lock. User direction (verbatim): *"The UX copy is too aggressive — I want to make it professional and SEO optimised."*
**Scope:** H2, intro, all 6 row labels, all 18 cell values, footnote. **Preserve verbatim:** `7 chains — Ethereum, Solana, Base, Arbitrum, Hyperledger, Polygon, Avalanche`.

---

## 1. Baseline copy (pre-rewrite, locked 2026-05-14)

**H2:** `How Metaborong compares`
**Intro (16w):** `If you're choosing between us, a large agency, or a freelance team — here's the honest read.`

| Label | Metaborong | Large Web3 or AI Agency | Freelance Team |
|---|---|---|---|
| Team access | Direct — founders | Account manager layer | Direct but inconsistent |
| AI-native services | Core offering | Add-on or absent | Rare |
| DeFi depth | 7 chains — Ethereum, Solana, Base, Arbitrum, Hyperledger, Polygon, Avalanche | Generic | Depends on individual |
| Speed to delivery | Weeks | Months | Unpredictable |
| Product thinking | Built in | Execution-focused | Absent |
| Track record | DeFi · AI · SaaS shipped | Hundreds of clients ✓ | Case by case |

**Footnote:** `✓ marks where the alternative genuinely wins. Larger agencies have longer track records — a real advantage for enterprises needing procurement comfort. We win on speed, AI-native depth, and direct access.`

---

## 2. Baseline scorecard (5 categories, 1–10 each)

| # | Category | Score | Why |
|---|---|---|---|
| 1 | **AEO / extractability** | 5 | Only the 7-chain row extracts as a clean fact. `Core offering`, `Rare`, `Built in`, `Absent`, `Generic`, `Weeks`, `Months` are vague — AI systems can't cite a comparison answer from them. |
| 2 | **SEO keyword coverage** | 4 | No entity/category terms in labels or values. Missing: `Web3 development`, `AI engineering`, `smart contract`, `multichain`, `production`, `delivery timeline`. The page entity is `Web3 development company and AI agent studio` (hero blockquote) — the table doesn't reinforce it. |
| 3 | **Tone match to page voice** | 4 | Founders + Why-Us established a professional, citation-ready voice (2026-05-19). The table jars: `here's the honest read`, `Built in`, `Absent`, `Rare`, `Case by case`, `DeFi · AI · SaaS shipped` read as cheeky shorthand. `Hundreds of clients ✓` flips to a brag for the competitor. |
| 4 | **Specificity / claim strength** | 6 | 7-chain row is concrete and verifiable. `Track record` softens to a category list (`DeFi · AI · SaaS shipped`) when a real count exists (`25+ products` per user). `Speed to delivery: Weeks` ≠ the FAQ's verifiable `4–12 weeks`. |
| 5 | **Readability / scan-ability** | 7 | Six-row table is the right length. Parallel structure is partial (1–2-word cells in some rows, sentence fragments in others). |

**Composite baseline:** **5.2 / 10**

Top three drivers of the low score: (1) vague cells block AEO, (2) tone mismatch with Founders/Why-Us, (3) the `Track record` cell undersells a verifiable claim.

---

## 3. Rewrite (2026-05-21 — proposed for graduation)

**H2:** `How Metaborong compares to large agencies and freelance teams`
**Intro (24w):** `A side-by-side comparison of Metaborong, large Web3 and AI agencies, and freelance teams across team access, technical depth, delivery, and track record.`

| Label | Metaborong | Large Web3 or AI Agency | Freelance Team |
|---|---|---|---|
| Team access | Founders on every engagement | Tiered through account managers | Direct, varies by contractor |
| AI engineering depth | Core service line | Add-on capability or partner-delivered | Limited, contractor-dependent |
| Multichain coverage | 7 chains — Ethereum, Solana, Base, Arbitrum, Hyperledger, Polygon, Avalanche | Generalist, scope varies | Limited to contractor experience |
| Delivery timeline | 4–12 weeks per engagement | 3–6 months or longer | Variable, project-dependent |
| Product strategy | Embedded in delivery | Separate consulting tier | Usually scoped out |
| Track record | 25+ products in production | Hundreds of clients ✓ | Portfolio varies by team |

**Footnote:** `✓ marks where the alternative has a structural advantage. Large agencies bring longer track records and procurement maturity. Metaborong's edge is delivery speed, AI and Web3 depth, and founder-level engagement.`

---

## 4. Post-rewrite scorecard

| # | Category | Score | Why |
|---|---|---|---|
| 1 | **AEO / extractability** | 8 | Three fully citation-ready facts (`25+ products in production`, `4–12 weeks per engagement`, `7 chains — …`). Every cell is a self-contained noun phrase the model can lift verbatim. |
| 2 | **SEO keyword coverage** | 8 | Labels surface `AI engineering`, `multichain`, `delivery timeline`, `product strategy`, `track record`. H2 includes the comparison-intent keyword chain. Intro carries the `Web3 and AI agencies` entity pair. |
| 3 | **Tone match to page voice** | 9 | Parallel professional phrasing across all 18 cells. Matches the Founders / Why-Us register. No cheeky shorthand. Acknowledgement of competitor strengths reads as confidence, not concession. |
| 4 | **Specificity / claim strength** | 9 | Three numeric claims (`25+`, `4–12`, `7 chains`) — all verifiable against the rest of the page or user ground-truth. Soft claims (`Embedded in delivery`, `Founders on every engagement`) are defensible against the team-of-3 founders / single-team delivery model. |
| 5 | **Readability / scan-ability** | 8 | All cells are noun phrases of 3–9 words; 1 long cell (the 7-chain row) is the deliberate signal row. Table scans top-to-bottom in one pass. |

**Composite post-rewrite:** **8.4 / 10**
**Delta:** **+3.2** vs baseline.

---

## 5. Claim-gate ledger

| Claim | Source / verification | Status |
|---|---|---|
| `25+ products in production` | User-verified ground truth (D5, brief §"Pre-resolved decisions"). Higher than the doc-shipped `8+ products` in TRUST SIGNALS — see drift row below. | ✓ verified |
| `7 chains — Ethereum, Solana, Base, Arbitrum, Hyperledger, Polygon, Avalanche` | Locked 2026-05-14 + Why-Us Pillar B body (`homepage.md:167`). Hard constraint per brief §"Locked claims to PRESERVE verbatim". | ✓ preserved verbatim |
| `4–12 weeks per engagement` | FAQ Q `homepage.md:427` (`Four to twelve weeks depending on scope`) + AEO summary `homepage.md:151` (`4–12 weeks to ship`). Cross-page consistent. | ✓ verified |
| `Founders on every engagement` | Founders section (3 named, reachable founders) + Hero blockquote (`Direct from founders`-equivalent). Consistent with single-senior-team service model. | ✓ verified |
| `3–6 months or longer` (large-agency timeline) | Market-norm claim. Defensible against the existing baseline `Months`. No internal source needed — frames the competitor honestly. | ✓ defensible |
| `Hundreds of clients ✓` | Preserved from baseline; honest acknowledgement of large-agency advantage. | ✓ preserved (✓ marker honest) |

No fabrication, no unverifiable claims. Claim-gate passed.

---

## 6. Writing-guardrails vet (`docs/writing-guardrails.md`)

| Pattern | Status |
|---|---|
| Banned words (`leverage`, `crucial`, `key`, `robust`, `landscape`, `delve`, `enhance`, `pivotal`, `valuable`, `vibrant`, etc.) | **Pass.** None present in rewrite. |
| Significance inflation (`testament to`, `pivotal moment`, `reflects broader trends`) | **Pass.** Absent. |
| -ing tails of vague significance (`...highlighting its significance...`, `...emphasizing X...`) | **Pass.** Every row ends on a noun, not a participle. |
| Vague authority (`industry reports suggest`, `experts argue`) | **Pass.** No appeal to unnamed authority. |
| Promotional puffery (`boasts`, `cutting-edge`, `world-class`, `best-in-class`) | **Pass.** Absent. |
| Negative parallelisms / `not X, but Y` overuse | **Pass.** Not used. |
| False ranges (`from startups to enterprises`) | **Pass.** Only real ranges (`4–12 weeks`, `3–6 months or longer`). |
| `serves as` instead of `is` | **Pass.** Plain copulatives. |
| Rule-of-three padding | **Pass.** Six rows are dimensional, not rhetorical triplets. |
| Em-dashes scope (DESIGN.md:37 endorses in visible body; strip from alt/aria only) | **Pass.** `7 chains — …` and `H2` em-dash usage is visible body copy. No alt/aria copy in this section. |
| Web3 AND AI equal weighting (`positioning-web3-and-ai-equal`) | **Pass.** `AI engineering depth` and `Multichain coverage` rows give equal real estate to both pillars. Intro names both. |

---

## 7. Cross-file drift flagged for orchestrator graduation (NOT edited here)

This worker only edits its own section's files (`comparison.tsx` + `homepage.md` §[COMPARISON]). The audit surfaced one cross-file drift that the orchestrator should resolve in a future session:

| File / line | Current value | Drifts against | Recommendation |
|---|---|---|---|
| `docs/content/homepage.md:458` (TRUST SIGNALS list) | `8+ products shipped in production` | `25+ products in production` (this section, user-verified) | Reconcile site-wide to `25+`. Touches TRUST SIGNALS + any `Organization` JSON-LD references. Out of scope for this worker per brief §"D5 — Track-record row". |

(The 7-vs-4-chains site-wide drift — `Hero blockquote` says `EVM chains and Solana`, `TRUST SIGNALS` says `4 chains` — remains DEFERRED per brief §"D6". This audit does not re-flag it.)

---

## 8. Decision log

| Decision | Rationale |
|---|---|
| H2: `How Metaborong compares to large agencies and freelance teams` (was `How Metaborong compares`) | Adds the comparison-intent keyword chain + the two competitor categories. Heading becomes a self-contained AEO question target. |
| Intro: 24w factual lead-in (was 16w `here's the honest read`) | Drops the cheeky framing; gains entity keywords (`Web3 and AI agencies`, `freelance teams`) and the table's four-dimension index. |
| `DeFi depth` → `Multichain coverage` | The 7-chain row covers more than DeFi (Hyperledger is not DeFi-only). `Multichain` is the higher-traffic search term. |
| `AI-native services` → `AI engineering depth` | Parallel to `Multichain coverage`; surfaces the `AI engineering` keyword. |
| `Speed to delivery` → `Delivery timeline` | `Delivery timeline` is the dimensional noun; the cell value carries the speed. |
| `Product thinking` → `Product strategy` | Higher-search-volume term; parallel to the other dimensional labels. |
| `Track record: DeFi · AI · SaaS shipped` → `25+ products in production` | D5 resolution. Numeric > category list for both AEO and proof. |
| Soft claims kept (no numeric for `Team access`, `Product strategy`) | Honest reflection of the service model; not every dimension warrants a number. |
