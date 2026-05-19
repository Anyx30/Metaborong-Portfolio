# Metaborong Website — Changelog

All major decisions, milestones, and changes to this project.

---

## 2026-05-19 — Session 17: ContactCta + Footer Figma redesigns (sequential, direct on design-revamp)

### Decision log
- **Execution model.** ContactCta then Footer redesigned sequentially in one session directly on `design-revamp` (two adjacent, non-overlapping components — no parallel worktrees needed). Both copy treatments = full A3 chain (user choice).
- **ContactCta — Figma `233:261`, dark → light.** Rebuilt on the canonical `<Section bg=default maxWidth=xwide>` grid. H2 + 3-word "Email us" CTA kept (Figma's generic "Got a project in mind?" / 4-word "Start a conversation" rejected — DESIGN.md ≤3-word cap + the Session-15 WHY). Brand-blue **split-arrow `<Button>` primitive** (replaced a hand-rolled split-arrow that had a hover-direction + transition bug). A3 copy re-run **7.6 → 8.1 / 10** (added founder-reachability E-E-A-T + Web3/AI topical; "straight from a founder" user-verified literally true 2026-05-19); claim-gate + guardrails PASS. ASCII-hills signature = Figma raster exported → 204KB webp; rendered as a **normal-flow bottom band** after a live-QA P1 (an absolute backdrop blanketed the H2 at desktop → dark-on-green, failed AA). `homepage.md` "[dark section]"/`#0a0a0a` notes + `DESIGN.md` surface.dark table reconciled to light; `section.tsx` doc gains `xwide`.
- **Footer — Figma `237:359`, single row → expanded sitemap.** Light footer on the site edge grid: Company / Services / Offices / Get-in-touch columns (canonical `<Eyebrow>` headings, `linkCls` const), 16-word positioning line, giant `METABORONG` as live text (not raster), dynamic-year bottom bar. Figma placeholder "ARNAB RAY ×4" card grid **dropped** (user — Founders already carries the team; avoids personal-mobile exposure); Dribbble dropped; offices = user-verified NAP (verbatim); LinkedIn/X real (`rel=me`), Behance/Medium/Discord → `/` temp redirect (no `rel=me`, follow-up to swap). Footer copy = A3 *create*; claim-gate + guardrails PASS. Small `<Logo>` M-mark dropped (Figma frame has only the text wordmark).
- **Review chain.** plan-design-review **9.0 (ContactCta) / 8.8 (Footer)**; impeccable critique fixed a11y (#999 → text-gray on load-bearing copy) + the `<Button>` primitive + raster bleed; design-review live QA found+fixed FINDING-001 (desktop raster contrast) and confirmed the footer clean at 1440/375; simplify adopted the `Eyebrow` primitive + `linkCls` const + `decoding=async`. Verification posture: `tsc` exit 0 + dev QA (no Vitest for presentational sections); `npm run build` still expected to fail at `/blog/rss.xml` (PR-#26 env hold, not a regression).
- **Deferred follow-ups.** `lib/schema.ts` Organization `PostalAddress` ×3 (NAP consistency — shared surface, mirrors Founders `sameAs` deferral); real Behance/Medium/Discord URLs. SEO advisory (noindex service pages are the real lever, not footer links) recorded in the copy-audit doc.
- **Pre-existing flag (not fixed, REPO_MODE collaborative).** The site-global privacy/consent banner is a fixed overlay covering bottom content — same item the Session-16 design-review handed to the main session; not introduced by this redesign.

### Build state changes
- **NEW:** `public/contact/ascii-hills.webp` (1600×900, 204KB; raw 9.7MB Figma capture kept local-only, not committed).
- **UPDATED:** `components/sections/contact-cta.tsx` (Figma redesign + A3 + `<Button>` primitive + normal-flow raster); `components/layout/footer.tsx` (expanded sitemap, `Eyebrow`/`linkCls`); `docs/content/homepage.md` (ContactCta + Footer blocks, A3-synced; dark→light notes reconciled).
- **NEW:** `docs/superpowers/specs/2026-05-19-section-{contact-cta,footer}.md`, `…/2026-05-19-contact-footer-copy-audit.md`; `docs/superpowers/plans/2026-05-19-section-{contact-cta,footer}.md`.
- **UPDATED:** `DESIGN.md` — two Decisions Log rows + `section.tsx` `xwide` doc + `--color-canvas` surface usage (contact CTA removed); `CHANGELOG.md` — this entry.

---

## 2026-05-19 — Session 16: Why-Us + Founders Figma redesigns (parallel worktrees)

### Decision log
- **Parallel-worktree execution model.** Why-Us and Founders were redesigned simultaneously in two isolated git worktrees (`section/why-us-redesign`, `section/founders-redesign`) off `design-revamp`, one Claude session each, this session coordinating. Zero file overlap by construction (`why-us.tsx` vs `founders.tsx`); both merged `--no-ff` with zero conflicts (Why-Us first, Founders rebased then merged). Reconfirms the Session-13 worktree pattern for taste-driven section work.
- **Why-Us — Figma `112:1787`, copy-frozen.** Redesigned onto the canonical `<Section>` grid; every visible copy string preserved (SSR-verified diff). New `clutch-widget.tsx` introduces the site's **first third-party embed** (official Clutch widget) replacing the static 4.9 badge; an `sr-only` link ("Metaborong is rated 4.9 out of 5 on Clutch") + `.clutch-widget` mount keep the trust signal crawlable/a11y without altering visible prose. Isometric illustrations as 800px WebP (`public/whyus/`). Section deviations logged in its spec.
- **Founders — Figma `142:516`, A3 copy chain.** Black placeholder → light team E-E-A-T anchor on the canonical grid. Copy rewritten via the full A3 chain (audit → `homepage.md` → writer → re-score → authority-builder → copywriting gate → guardrails): **2.7 → 8.0 / 10**, claim-gate PASS, guardrails PASS. DiceBear avatars dropped for portrait/monogram blueprint-frame cards + role chips + brand-blue square LinkedIn/X buttons (X re-added at user request 2026-05-19; Figma was LinkedIn-only). `#founders` anchor + nav "Team" label preserved. Deviations 1–7 logged in its spec.
- **Coordinator verification.** Both branches `tsc` clean (integrated tree too), all 3 illustrations + founder media load (lazy — verified scrolled-in), all 3 co-founders represented, A3 artifacts present. Two interim "defects" were coordinator verification errors (below-the-fold lazy-image false negatives), not real regressions — nothing broken was merged.

### Build state changes
- **NEW:** `components/sections/clutch-widget.tsx`; `public/whyus/{speed,product-thinking,niche-depth}.webp`.
- **UPDATED:** `components/sections/why-us.tsx` (Figma redesign, copy-frozen); `components/sections/founders.tsx` (Figma redesign + A3 copy); `docs/content/homepage.md` (Founders block, A3-synced).
- **NEW:** `docs/superpowers/specs/2026-05-19-section-why-us.md`, `…/2026-05-19-section-founders.md`, `…/2026-05-19-founders-copy-audit.md`; `docs/superpowers/plans/2026-05-19-section-{why-us,founders}.md`; `docs/superpowers/assets/2026-05-19-founders-figma.png`.
- **UPDATED:** `DESIGN.md` — two Decisions Log rows (this session); `CHANGELOG.md` — this entry.

### Known follow-ups
- Founders bios are generic-but-true placeholders — real per-founder proof specifics pending USER_INPUT.
- `lib/schema.ts` per-founder `sameAs` deferred (no JSON-LD change this session).
- Branches `section/{why-us,founders}-redesign` left intact; worktrees removed; **not pushed** (push on explicit request only).
- Carried, still open: build env (`/blog/rss.xml` MONGODB_URI / PR-#26 hold; posture = `tsc` + dev QA); DESIGN.md approved-infinite-count inconsistency; `2026-05-10-section-hero.md` §1a stale; site-wide chain-count inconsistency (Why-Us copy now frozen at its existing chain figure).

---

## 2026-05-19 — Session 15: Hero + Nav grid alignment, eyebrow dot, card reseat, cleanup

### Decision log
- **Hero + Nav adopt the canonical `<Section>` grid.** Both were bespoke: hero `max-w-[1600px]` with a self-padded left column + a centered ASCII column; nav full-viewport-width content (`px-[24px]…`, no `max-w`, no 16px base). At ≥1280px the hero copy hung ~160px left of every section and the ASCII never reached the right grid line; the nav logo/CTA sat outside the section content edges. Both now cap content to `max-w-[1280px]` inside the `px-[16px] sm:px-[24px] md:px-[48px] lg:px-[96px] xl:px-[128px]` chain — identical left/right negative space across nav, hero, and every section at 1440/1280/375. `<header>` bg/borders and the mega-menu **strip surface** stay full-bleed (signature preserved); only content is capped. Hero ASCII right-pinned with `lg:justify-end` so its right edge meets the grid line (= nav CTA = section content). Mobile gutter unified 24→16px. Supersedes the 2026-05-14 DESIGN.md hero rows (`var(--section-px)` / `xl:px-[144px]→128` / inset-from-right) and the nav greptile spec's full-width-content/24px-base detail (logged as that spec's deviation #4).
- **Hero eyebrow green dot removed in code.** Session-14 Addendum-2 graduated this, but the dot was still present on `design-revamp` (doc↔branch drift). Now actually removed from `hero.tsx` (the `hero-live-dot`/`hero-live-pulse` hooks; globals.css already carried no matching CSS). Copy unchanged: `Web3 & AI development studio`.
- **Hero overlay card 3 reseated.** Was parked off-plant at the right edge (`74%/34.8%`); user picked `66%/34%` from a 4-candidate montage — now on the rightmost ASCII bloom, matching how cards 1 & 2 sit on theirs. (Pixel auto-detection on the bloomed ASCII proved unreliable; memory pointer added.)
- **Codebase cleanup.** Removed stray `./ign-revamp` (an accidental `less`/man help-text dump, untracked). Reindented `nav.tsx` children under the new wrapper `<div>`s (whitespace-only; the surgical grid-align edits had left them at the old depth).

### Build state changes
- **UPDATED:** `components/sections/hero.tsx` — grid-align (max-w-1280 + padding chain, mobile 16px), eyebrow dot hooks removed, overlay card 3 → 66%/34%, ASCII `lg:justify-end`. (Grid+eyebrow+card3 shipped earlier as `d3787d9`; `lg:justify-end` is the follow-up.)
- **UPDATED:** `components/layout/nav.tsx` — content capped to max-w-1280 + padding chain (bar, mega columns, mobile menu); header/strip surfaces full-bleed; children reindented.
- **UPDATED:** `DESIGN.md` — Decisions Log entry (this).
- **UPDATED:** `docs/superpowers/specs/2026-05-10-section-nav-greptile-restyle.md` — deviation #4 logged.
- **UPDATED:** `CLAUDE.md` — rewritten by `/init` (overview/architecture/commands now reflect the MongoDB CMS; was stale "single-page marketing site"). Committed separately.
- **REMOVED:** `./ign-revamp` (stray artifact).

### Known follow-ups
- `npm run build` still fails at `/blog/rss.xml` export — the documented MONGODB_URI-at-build / PR-#26 env hold; verification posture stays `tsc` + dev-server QA (pre-existing, not a regression).
- Carried from Session 14, still open: DESIGN.md approved-infinite count inconsistency (lines ~229-231 vs 275 vs 385); `2026-05-10-section-hero.md` §1a stale (PNG+SVG-filter vs the shipped MP4); site-wide chain inconsistency (`services-data.ts` 3 / Comparison+Why-Us 7 / hero 0). Each wants a dedicated reconcile session.
- `docs/Gemini_Generated_Image_i6ni71i6ni71i6ni.png` is untracked and predates this session — left as-is (not this session's to triage).

---

## 2026-05-17 — Session 14: Context A3 codified + Hero copy reconcile (first A3 run)

### Decision log
- **Context A3 ("the copy chain") codified in `SESSIONS.md`.** Copy-only changes were only *implied* via the cheat-sheet ("Copy change → SEO chain"), never a first-class context. Named it: `seo-content-auditor + copywriting` (audit first) → edit `docs/content/homepage.md` → `seo-aeo-landing-page-writer` (scoped) → `seo-content-auditor` (re-score) → `seo-authority-builder` (trust-heavy only) → `copywriting` gate → `writing-guardrails.md` vet → sync JSX → verify → graduate. Added the two missing cheat-sheet rows (`copywriting`, `writing-guardrails.md`); header bumped Four→Five contexts. Memory pointer `workflow-copy-chain-a3` added (mirrors the A2 pointer). Committed separately as `8782c9a`.
- **Hero copy re-opened (was locked/"already-optimised").** User explicitly re-opened it as a copy-only change; routed through the new A3 chain. The visual system (typewriter, ASCII video, overlay cards) stayed untouched and locked per `2026-05-10-section-hero.md`.
- **H1 kept verbatim, grounded in keyword research.** `seo-aeo-keyword-research` (scoped) surfaced a homepage↔hub cannibalization risk: `/services/web3/` is purpose-built for the head term "web3 development company"; the homepage hard-targeting it too splits traffic. Resolution: H1 stays voice-led ("Web3 protocols. / AI agents. / Shipped."); the primary keyword is recovered in the blockquote's first 6 words ("Metaborong is a Web3 development company and AI agent studio") + the existing title tag. Voice-vs-SEO was a false binary.
- **Blockquote rewritten.** Sentence 2 was a 29-word 7-item colon dump; tightened to a parallel 3-pillar clause with equal Web3/AI specificity ("DeFi on Ethereum and Solana" balanced by "production AI agents with RAG"). 43 words, in the 40–60 AEO band. Re-score beat baseline on all axes (E-E-A-T 5→8, AEO 5→9, readability 6→8, keyword fail→pass). `seo-authority-builder` skipped per A3 gating (Hero is not an E-E-A-T anchor).
- **Geo unified to remote-first/global, site-wide.** User decision (2026-05-16): "remote-first / globally distributed" is canonical, replacing every "US and Europe" mention rather than changing Hero to match FAQ. Reconciled across `hero.tsx`, `faq-data.ts` (×2), `app/llms.txt/route.ts` (×2), and `lib/schema.ts` `areaServed` (×3 → `'Worldwide'`). Verified 0 "US and Europe" leftovers in rendered homepage HTML.
- **`docs/content/homepage.md` was stale vs shipped JSX.** The Hero block documented an old H1, old eyebrow, old CTAs, plus a subheading and a trust line ("No pitch decks. No retainers. Direct from founders.") that never shipped. Reconciled doc → shipped reality; trust line dropped per user (read as poetic/unprofessional); AEO checklist word-count corrected 38→43. WHY block added to the Hero section for traceability.

### Build state changes
- **UPDATED:** `docs/superpowers/SESSIONS.md` — new Context A3 block + cheat-sheet rows + header (commit `8782c9a`).
- **UPDATED:** `docs/content/homepage.md` — Hero block reconciled to shipped + new blockquote + WHY; 2 FAQ answers + 1 brief-comment geo unified; AEO checklist word-count fixed; status/date bumped.
- **UPDATED:** `components/sections/hero.tsx` — blockquote rewritten (keyword-front-loaded, tightened, equal-pillar).
- **UPDATED:** `components/sections/faq-data.ts` — "What is Metaborong?" + "Where are you based?" geo → remote-first/global.
- **UPDATED:** `app/llms.txt/route.ts` — intro definition + key-fact line geo-unified (static strings only; route still 500s locally on the known MONGODB_URI gate — pre-existing, not a regression).
- **UPDATED:** `lib/schema.ts` — `areaServed: ['US','EU']` → `'Worldwide'` (Organization, contactPoint, Service ×3 all covered by the shared literal).

### Known follow-ups
- `/llms.txt` static-string edits are unverifiable locally (DB-gated 500, expected). Confirm render on the first preview deploy where `MONGODB_URI` is set (the env work that PR #26 is held on).
- Pre-existing drift, flagged not fixed: `homepage.md` AEO checklist says "FAQ: 8 Q&As" but the doc body + `faq-data.ts` have 7 (post 2026-05-14 cut). Out of scope for this copy change.
- The 2026-05-14 copy-audit spec scoped Hero out as "already optimised"; that statement is now superseded by this entry (audit doc annotated with a pointer, not rewritten — per the SESSIONS.md no-contradicting-versions rule).

### Addendum (2026-05-17, same session) — Hero blockquote revision

- **User flagged the A3 output under-sold capability + carried an em-dash.** An Explore pass confirmed the Session-14 blockquote ("DeFi protocols on Ethereum and Solana, production AI agents with RAG") was the *narrowest* capability claim on the site vs the canonical `services-data.ts` pillars (full AI suite incl. generative + agentic workflows; broader Web3 incl. smart-contract audits).
- **Blockquote re-revised (A3, copy-only).** Final locked text (iterated within the session): *"Metaborong is a Web3 development company and AI agent studio. A remote-first team of senior engineers, globally distributed. We ship DeFi protocols and smart contract audits across EVM chains and Solana, AI agents spanning RAG, agentic workflows, and generative systems, and full-stack SaaS for founders and early-stage startups. Spec to production, fast."* — 52 words (AEO band), zero em-dashes, all claims traced to `services-data.ts`/`schema.ts`. Synced verbatim to `hero.tsx`, `llms.txt:29`, `homepage.md` (block + WHY + 43→52 checklist). RAG re-added (high-signal AI term) and "EVM chains and Solana" added back (canonical superordinate, no count claim) after a keyword-coverage review.
- **Scope decisions (user):** em-dash removal is blockquote-only (no standing rule, no retro-sweep). Hero uses the superordinate "EVM chains and Solana" (no chain-count claim) — the site-wide 3-vs-7 chain inconsistency (`services-data.ts` 3 / Comparison + Why-Us 7) is unchanged and stays deferred to its own session.

### Addendum 2 (2026-05-18, same session) — Hero eyebrow redesign

- **Eyebrow copy → entity-category line.** After a `/seo-aeo-keyword-research` pass (scoped to the eyebrow) + competitive WebSearch, the honest finding: an eyebrow has ~zero ranking/AEO value; its *only* search-adjacent lever is entity consistency. Locked copy: `Web3 & AI development studio` — verbatim the title tag, so title ↔ hero ↔ blockquote opening ↔ `Organization` schema all assert one entity. Equal-pillar; does not cannibalize the `/services/web3/` head term (broader brand/category phrase, not the hub's exact term). Replaces `Accepting new work · Reply in 12h`; the 12h/availability promise still lives in Contact CTA + FAQ. User was given the honest counter-rec (eyebrow SEO≈0, keeping the conversion line may be the better trade) and chose the entity line.
- **Pulsing green dot removed.** `heroLivePulse` was an *undocumented* infinite — never in DESIGN.md's approved-infinite exceptions nor the `2026-05-10-section-hero.md` deviation log. Removing it is a **net DESIGN.md motion-rule-#1 compliance gain** (one fewer untracked violation), plus an a11y/perf win (less motion for all users). Orphaned `.hero-live-pulse` rule + `@keyframes heroLivePulse` + the reduced-motion override removed from `globals.css`.
- **Structural redesign attempted, then reverted (same session, user direction).** A `/impeccable layout` + `/impeccable polish` pass dropped the bordered pill, aligned the eyebrow flush-left, replaced the dot with a static 1px brand hairline, and bumped tracking `0.12 → 0.14em`. The user clarified the intent was **content + dot-removal only, not a structural redesign**, and asked to revert to the original visual. Final shipped state: **original bordered chip retained** (`bg-bg border border-border rounded-sm px-3 py-[6px]`), original `0.12em` tracking, **no dot, no hairline**, content = "Web3 & AI development studio". Net visual delta vs pre-session = dot removed only.
- **Synced/graduated:** `hero.tsx`, `globals.css` (dead CSS), `homepage.md` (eyebrow line + superseding WHY bullet + status), `2026-05-10-section-hero.md` (deviation log updated). Eyebrow copy is hero-only — not in `llms.txt`/`schema.ts`/`faq-data.ts`, so no further sync.
- **Pre-existing issues flagged, not fixed (out of scope):** (1) DESIGN.md internal inconsistency on approved-infinite count — line 229-231 says three (marquee + orb-blink + scroll-cue), lines 275 + 385 say marquee-only / marquee+orb-blink. (2) `2026-05-10-section-hero.md` §1a is stale (describes a PNG + SVG-turbulence filter; the hero now uses an MP4 video). Both warrant a dedicated motion-grammar reconcile session.
- **Deferred, not fixed:** site-wide chain inconsistency (`services-data.ts` 3 / Comparison + Why-Us 7 / hero now 0) — own follow-up session. `schema.ts` Org description (different string, no geo) left as-is.

---

## 2026-05-13 — Session 13: Parallel section redesigns + C1 SEO baseline (graduate)

### Decision log
- **First true parallel-session execution.** Three feature branches developed concurrently — `section/problem-redesign` and `section/what-we-build-redesign` on isolated git worktrees, `seo/c1-baseline` on a third worktree off `design-revamp`. Zero file overlap discovered at merge time; zero conflicts. Worktree pattern proved out as the right primitive for multi-terminal Claude sessions on the same repo (single-shared `.git/HEAD` collisions are the real risk, not file conflicts).
- **Problem section redesign (A1 full chain).** Replaced the 22-line "two-bad-options" Problem block with a high-contrast `#296ff0` blue card featuring an isometric → horizontal-timeline chart and a sibling content column. Thesis shifted from quality-framing ("agencies treat you as a ticket") to speed-framing ("Web3 and AI move in trend windows that close in weeks; most teams can't ship inside them"). Copy locked at 91/100 citability with FAQPage JSON-LD wrapping 5 AEO Q&A pairs and a `DefinedTerm` schema owning the phrase "trend window." Chart a11y via `<figure>`/`<figcaption>` + `role="img"` + `aria-labelledby`. Desktop pointer devices get a `cursor: zoom-in` hover state scaling the chart to 1.10 for label legibility; mobile uses a flat front-elevation fallback. Forced-colors mode honored. Section is a documented deviation from the off-white site grammar (logged in `docs/superpowers/specs/2026-05-11-section-problem.md`).
- **Services / "What we build" redesign (A1 full chain).** Replaced the trefoil + glyphs + mobile fallback (377 lines deleted across `services-trefoil.tsx`, `services-glyphs.tsx`, `services-mobile.tsx`) with a pure-CSS isometric canvas + split-rail layout unified via an inset-card pattern. Header rhythm tightened, divider weights normalized, inset-card radius locked. Pillar copy refreshed; AI Agents children reordered (top-5 curation per spec deviation #3). Per-pillar `hubCta` shifted to action verbs (`Open Web3` / `Open AI` / `Open Studio`) replacing the passive `Web3 services` / `AI services` / `Product studio` family.
- **C1 SEO baseline (Context C).** `robots.ts` now disallows `/services/` for every named AI crawler (GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot, ChatGPT-User, anthropic-ai, Google-Extended, CCBot) — previously these explicit allow rules omitted the disallow, leaving 18 thin "Coming soon" stub pages exposed to retrieval-index ingestion. `lib/schema.ts` rebuilt as an `@id`-linked entity graph: Organization, WebSite, FAQPage, and Service × 3 (one per homepage pillar) with `hasOfferCatalog` enumerating child services. Founder records reference the Organization `@id` instead of duplicating it. Organization gains `logo`, `knowsAbout`. Dynamic OG card via `next/og` `ImageResponse` at `app/opengraph-image.tsx` — Next.js auto-wires the metadata, no asset upload needed. Twitter site/creator handles added.
- **Workflow doc cleanup.** `docs/superpowers/SESSIONS.md` carried `codex /` references from the original template into the A1/A2/B rewrite even though codex was never explicitly named as a tool by the user. Removed from cheat sheet + chain step 14 / 8 / 11. Step 14 / 8 are now `requesting-code-review (optional)` with explicit gating: skip for small section work already covered by impeccable + design-review. Independent code review remains available via ad-hoc skill invocation when the diff warrants it.
- **Codex CLI broken on local install** (vendor binary ENOENT in node_modules). Substituted a Claude subagent as the independent voice for the C1 audit; documented as a fallback pattern but did not block the workflow.

### Build state changes
- **NEW:** `components/sections/problem-trend-chart.tsx`, `problem-aeo-accordion.tsx`, `problem-qa-data.ts` (sectioned chart + AEO accordion + Q&A data source).
- **REWROTE:** `components/sections/problem.tsx` (22 → 79 lines; full redesign).
- **NEW:** `components/sections/services-iso-canvas.tsx`, `services-pillars.tsx`.
- **DELETED:** `components/sections/services-trefoil.tsx`, `services-glyphs.tsx`, `services-mobile.tsx`.
- **REWROTE:** `components/sections/services.tsx` (trefoil orchestrator → split-rail composer).
- **UPDATED:** `app/globals.css` — added `.problem-card` + child class block (~335 lines, scoped) with forced-colors + reduced-motion + hover-zoom CSS.
- **UPDATED:** `lib/schema.ts` — `@id` graph + `serviceSchemas` array (~50 lines added).
- **UPDATED:** `app/robots.ts` — `STUB_DISALLOW` constant applied to all AI bot rules.
- **UPDATED:** `app/layout.tsx` — twitter site/creator + OG comment pointing at the new image module.
- **UPDATED:** `app/page.tsx` — `serviceSchemas.map` wiring into JSON-LD scripts.
- **NEW:** `app/opengraph-image.tsx` — edge-rendered 1200×630 brand card via `next/og`.
- **NEW:** `docs/content/sections/problem.md`, `docs/content/sections/services.md` (locked copy).
- **NEW:** specs + plans under `docs/superpowers/{specs,plans}/2026-05-1{1,2}-section-{problem,services}-*.md`.

### New deviations from DESIGN.md
- **Problem section:** solid `#296ff0` surface (off-white site grammar), Space Grotesk Bold 32px uppercase H2 (vs Satoshi 56px), JetBrains Mono chip with translucent fill, 1.4 line-height for body+bridge (vs 1.5+). Logged in `docs/superpowers/specs/2026-05-11-section-problem.md`. Recommend DESIGN.md add a "High-contrast statement card" pattern entry if this becomes a repeated pattern; left as section-only deviation for now.
- **Services section:** Inset-card + split-rail unification pattern (canvas + header rail share a single inset shell). Logged in `docs/superpowers/specs/2026-05-11-section-services-redesign.md` and `2026-05-12-section-services-canvas-css-rebuild.md`. Could graduate to DESIGN.md as a layout primitive if reused elsewhere.

### Known follow-ups
- DESIGN.md grammar additions (statement-card, inset-card) deferred to a dedicated graduate pass — patterns shipped but not yet promoted to canonical UI grammar.
- 18 `/services/*` stub pages stay triple-blocked (noindex + robots-disallow + sitemap-excluded). Document a gate condition for relaxing each pillar's blocks as it ships real content.
- One Problem-chart P1 finding from `/impeccable` deferred: `'use client'` boundary for the IntersectionObserver-driven sweep animation could move to a CSS-only scroll-driven animation, eliminating the client-component overhead for a decorative flourish. Browser support gaps make the refactor not worth the bundle savings today; revisit in 12 months.
- One Problem-section keyword research recommendation deferred: cross-section reinforcement of the "trend window" term into the hero subhead and at least one service page intro to compound entity authority.
- Codex CLI install needs repair (`npm install -g @openai/codex` or reinstall) before the `codex` skill is usable again. Workflow doesn't depend on it; flagged so it doesn't surprise the next session.
- Hero section deviation re-polish (A2) and remaining homepage sections (Why Us, Work Preview, Testimonials, Founders, Comparison, FAQ, Contact CTA) still queued.

---

## 2026-05-11 — Session 12: Nav full polish pass (correctness → layout → sharpness)

### Decision log
- **First multi-skill stacking experiment: `/impeccable critique` → `/impeccable layout` → `/impeccable polish` → `/frontend-design` for execution at each step.** Workflow proved out — each impeccable subcommand produced a distinct lens (correctness / spacing / visual sharpness) with concrete proposals, and frontend-design executed against a locked spec without exploration overhead. Faster than a single open-ended review.
- **Three nav passes shipped on a single branch:**
  - **Pass 1 — Correctness.** Removed dead `nav-dot-pulse` animation reference, removed `role="presentation"` from mega-menu H3, full mobile tap targets, full mega keyboard semantics (roving tabindex, Up/Down/Left/Right/Home/End, no type-ahead), mobile pillars wrapped in `<details>/<summary>` collapsed by default with custom rotating chevron, unified pillar markers (9×9 outlined squares everywhere — no more rounded-full mobile divergence), underline easing synced to 150ms, scroll-feedback border (dashed→solid at scrollY>0), non-Services nav-link underline switched from brand-blue to dark to kill pillar-color bleed.
  - **Pass 2 — Layout.** Mega-menu pillar rhythm rescaled to 4-value system (12/6/20/10/32), ul→hub-CTA gap promoted to 32px so hub CTA reads as a separate group, mobile pillar headline moved out of `<summary>` into expanded panel (collapsed state now 2 lines per pillar instead of 4), asymmetric mega padding (`pt-32 pb-40`), `touch-action: manipulation` on hamburger and `<summary>` to kill iOS Safari 300ms delay, underline animation rewritten from `width` to `transform: scaleX` (compositor-friendly).
  - **Pass 3 — Sharpness.** Solid 1px top hairline added to header (structural frame; bottom border keeps dashed→solid scroll-feedback). Cell-grid hairlines distributed between every desktop nav item (`Logo │ Services │ Work │ Team │ FAQ │ CTA` — 5 dividers, 6 cells). Mega-menu column hairlines via `border-r` on first two pillars with `pr-[24px]` content padding (Web3 / AI / Studio now read as measured cells).
- **Eyebrow strip on mega-menu proposed and shipped, then removed same session.** The "Three pillars · 14 services · 01/03" sheet header read as paginator-style chrome that made no sense when all 3 pillars were simultaneously visible. Faux-instrumentation pattern flagged. Direction A (column hairlines) shipped without B (eyebrow strip).
- **Focus-management bug fixed.** Initial keyboard nav implementation called `.focus()` programmatically on mega open + close, which triggers `:focus-visible` indiscriminately — mouse users saw a persistent brand-blue ring on the first menu item (and on the trigger after close). Fixed with `keyboardOpenRef` that gates the auto-focus / focus-restore to keyboard interactions only (`onKeyDown` ArrowDown/Enter/Space sets true; `onMouseDown` and `onMouseEnter` set false). Mouse users never see the focus ring; keyboard users still get the full a11y contract.
- **Per-item cell-grid (5 dividers) chosen over category-boundary cell-grid (2 dividers).** Original logic was "hairlines mark category boundaries" — Services has dropdown depth, the trio is flat, CTA is anchored by `flex-1` push. User feedback: reads as inconsistent (why does Services get bracketed but the others don't?). Locked: every nav item is its own cell, ledger-grid posture.
- **Skipped: numbering Services in the top bar, asymmetric mega-menu column ratios, DESIGN.md off-scale token cleanup.** All flagged as out-of-scope for this pass.

### Build state changes
- **REWROTE:** `components/layout/nav.tsx` — every nav slot now an explicit cell with 1px vertical hairline divider. Local `<Divider />` component (1px × 34px, 60% nav height, vertically centered, `bg-border`, `aria-hidden`). Desktop cluster is a single `hidden lg:flex items-center gap-[24px] ml-auto` container; structure is Logo → Divider → Services → Divider → Work → Divider → Team → Divider → FAQ → Divider → CTA. Header has solid `border-t-gray-subtle` always, plus `border-b-border` with `[border-bottom-style:dashed]` toggling to solid via scroll listener. Mobile menu uses `<details>` collapsed by default; pillar headline lives inside expanded panel.
- **UPDATED:** `app/globals.css` — added `.nav-summary { list-style: none }` + `::-webkit-details-marker { display: none }` to hide the native `<details>` triangle so the custom rotating `ChevronDown` carries open-state signal.
- **No new deviations.** All nav work fits inside `DESIGN.md` grammar. The 2026-05-10 hero deviation spec is unchanged.
- **No tokens added.** Existing `--color-border`, `--color-gray-subtle`, `--duration-instant`, etc. cover the whole pass.

### Known follow-ups
- Off-scale spacing values (6, 10, 14, 20 px) still leak in `nav.tsx`. Flagged not fixed — repo-wide drift, not nav-specific.
- `role="menu"` on the mega panel is now an honest contract (full roving-tabindex keyboard semantics implemented). Type-ahead intentionally skipped per user.
- Cell-every-item ledger-grid is now the nav posture. If this gets graduated to `DESIGN.md` as a project-wide pattern, the Card / Section primitives may want hairline-cell variants too.

---

## 2026-05-10 — Session 11: Hero deviation log + reduced-motion + H1 overflow

### Decision log
- **Two new infinite animations approved with deviation log.** The SVG turbulence shimmer on the ASCII image and the overlay-card loading/result cycle violate `DESIGN.md` motion rule #1 (three approved infinites only). Logged as section-level deviations in `docs/superpowers/specs/2026-05-10-section-hero.md` rather than cut — both carry the "alive system" signal the Three.js orb used to, both are IO-gated (pause out of view), both honor `prefers-reduced-motion`.
- **AEO blockquote: 44-word version accepted as new lock.** Session 10 had locked a 56-word version with 5 verifiable facts. Current copy is 44 words and drops co-founders / eight products / 4–12 week timeline / US+Europe geo. Trade-off accepted: tighter voice over fact density.
- **H1 clamp min 40px → 32px.** Prevents overflow at 320px viewport with `whitespace-nowrap` on "Web3 protocols.".

### Build state changes
- **NEW:** `docs/superpowers/specs/2026-05-10-section-hero.md` — section-level deviation log.
- **UPDATED:** `app/globals.css` — `prefers-reduced-motion: reduce` block now sets `filter: none` on `.hero-ascii-image`, killing the SVG shimmer (the inner `<animate>` tags have no visual effect once the filter chain is removed).
- **UPDATED:** `components/sections/hero.tsx` — H1 `clamp(40px,4.8vw,72px)` → `clamp(32px,4.8vw,72px)`.

---

## 2026-05-06 — Session 10: Button primitive + visual signature + copy edge

### Decision log
- **Visual identity benchmarked against supermemory.ai live, not just their `DESIGN.md`.** Pulled computed CSS via agent-browser. Their edge is *Bauhaus restraint*, not premium-SaaS polish: zero border-radius, zero box-shadow, flat fills, transitions ≤150ms, single signature mark (split-arrow). My earlier proposal (inset highlights, colored shadows, translate-y hover) was the wrong direction.
- **Adopted square corners (`radius: 0`) and split-arrow primary as our signature.** No insets, no gradients, no shadows on default state. The split-arrow is now Metaborong's distinctive button mark — it appears only on primary CTAs that opt in via the `arrow` prop. Ghost and secondary stay clean.
- **Copy density rules locked in `DESIGN.md`.** Primary CTAs ≤3 words, verb-first, banned `Start | See | Explore | View` family. Sentence target 12–14 words. AEO blockquote 40–60 words with ≥2 verifiable facts. Telegraphic over flowery.
- **Hero AEO blockquote rewritten via `seo-aeo-landing-page-writer` skill** (not freestyled this time). 56 words. 5 verifiable facts: three pillars, three co-founders, eight products, four-to-twelve-week timeline, US+Europe geo. Voice + facts blend.
- **Button primitive fully rewritten** from inline-styled raw hex (Session 8 follow-up debt) to a token-driven Tailwind component with the seven-state matrix. Square corners. Split-arrow opt-in. Tabular numerals on all buttons. Loading state with spinner. Disabled state. Real `:hover` and `:active` (previously `transition: opacity 0.15s` only).
- **Nav CTA hover changed from brand-glow effect to flat hover-darken.** The `0_8px_24px_rgba(32,74,248,0.35)` glow violated the new restraint posture.
- **Nav label "About" → "Team"** for honesty (link goes to `#founders`, not a real /about/ page).

### Build state changes
- **REWROTE:** `components/ui/button.tsx` — token-driven, Tailwind classes, square corners, split-arrow signature (opt-in via `arrow` prop), seven-state matrix (default/hover/focus-visible/active/disabled/loading/error-via-disabled), tabular-nums, 150ms ease-in-out transitions on color properties only.
- **UPDATED:** `DESIGN.md` — added Copy density rules under Writing Tone; added new "Visual signature" subsection under Components covering button finish (Bauhaus restraint, split-arrow signature, tabular numerals, micro-interaction discipline benchmarked against supermemory.ai).
- **UPDATED:** `components/sections/hero.tsx` — AEO blockquote rewritten (56 words, 5 facts), `py-1` → `py-2`, CTAs `Start a Project` → `Get a scope` (+ split-arrow), `See Our Work` → `See the work`, micro-copy now `font-mono text-[11px] tracking-[0.02em]` (telemetry/blueprint aesthetic).
- **UPDATED:** `components/layout/nav.tsx` — `About` → `Team`, Let's Talk CTA now uses split-arrow primary, removed brand-glow hover wrapper.
- **UPDATED:** `components/sections/work-preview.tsx` — `View All Work` → `Talk to us`, `View Case Study` → `Read more`.
- **UPDATED:** `components/sections/contact-cta.tsx` — `Start a Conversation` → `Email us`, restructured as split-arrow inline-styled (this section still uses raw hex inline-styles; full token migration deferred to its eventual signature pass).
- **UPDATED:** `components/sections/services-data.ts` — `Explore Web3 Services` → `Web3 services`, `Explore AI Agent Services` → `AI services`, `Explore Product Studio` → `Product studio`.

### Known follow-ups
- **Inline-styled section components** (`work-preview.tsx`, `contact-cta.tsx`, `founders.tsx`, `faq.tsx`, etc.) still use raw hex. Migration to token-driven classes happens during each section's signature pass.
- **OG image, logo asset, founder LinkedIn URLs** — still pending from Session 9.
- **`Button` component supports `arrow` prop on primary only.** If consumers misuse on ghost/secondary, the prop is silently ignored. Could add a dev-time warning, but YAGNI for now.

---

## 2026-05-06 — Session 9: SEO + GEO baseline (Context C1)

### Decision log
- **First Context-C1 site-wide pass.** Per `SESSIONS.md` ordering, ran the SEO + GEO baseline before any further section work. Findings fixed inline; no spec/plan ceremony per C1 rules.
- **Routing strategy: single-page anchors, no sub-pages yet.** Nav, hero CTAs, footer, and contact CTA all routed to homepage anchors (`#services`, `#work`, `#founders`, `#faq`, `#contact`) instead of broken `/work/`, `/about/`, `/blog/`, `/contact/`. `/blog/` removed from nav until content exists. `Start a Conversation` CTA now opens `mailto:contact@metaborong.com` directly — no managed contact form, consistent with "no pitch decks" positioning.
- **AI crawler stance: opt-in to citation, allow training selectively.** Robots.txt explicitly allows GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, anthropic-ai, PerplexityBot, Google-Extended, and CCBot. No training crawlers blocked — early-stage marketing site, citation visibility outweighs training-data hygiene.
- **`/llms.txt` is dynamically generated from the same data as the homepage.** `pillars` (services-data.ts) and `faqs` (faq-data.ts) drive both rendered components and the `/llms.txt` route handler. Single source of truth — content edits flow to AI crawlers without a manual sync step.
- **FAQ data extracted to shared module (`faq-data.ts`)** so `faq.tsx` (renderer) and `lib/schema.ts` (FAQPage JSON-LD) consume the same source. Same pattern as `services-data.ts`.

### Build state changes
- **NEW:** `app/robots.ts` — site allow + AI crawler explicit allows + sitemap reference.
- **NEW:** `app/sitemap.ts` — homepage only; hub/service stubs are noindex and excluded.
- **NEW:** `app/llms.txt/route.ts` — dynamic, force-static; pulls from `pillars` + `faqs`.
- **NEW:** `components/sections/faq-data.ts` — shared FAQ source.
- **UPDATED:** `components/sections/faq.tsx` — imports from shared data module.
- **UPDATED:** `lib/schema.ts` — added `FAQPage` schema; enriched `Organization` with `contactPoint`; replaced `founders` array (deprecated singular form) with proper `founder` Person[] including `worksFor`. Removed `logo` field until asset exists (follow-up).
- **UPDATED:** `app/page.tsx` — added `<span id>` anchors before `#services`, `#work`, `#founders`, `#faq`, `#contact`; added `<script type="application/ld+json">` for FAQPage schema.
- **UPDATED:** `components/layout/nav.tsx` — nav links and Let's Talk CTA point to homepage anchors; FAQ added to nav; Blog removed.
- **UPDATED:** `components/layout/footer.tsx` — footer links route to homepage anchors; Blog removed.
- **UPDATED:** `components/sections/hero.tsx` — CTAs route to anchors; AEO blockquote `cite="/about"` → `cite="/#founders"`.
- **UPDATED:** `components/sections/work-preview.tsx` — "View All Work" + "View Case Study" → `/#contact` (real action) until case-study pages exist.
- **UPDATED:** `components/sections/contact-cta.tsx` — primary CTA opens `mailto:contact@metaborong.com?subject=New%20project%20inquiry`.

### Known follow-ups
- **OG image missing.** Layout has no `openGraph.images` — Twitter/LinkedIn/Slack share previews fall back to platform defaults. Needs design (1200×630 PNG/WebP) at `/opengraph-image.tsx` (Next.js native) or a static asset.
- **Logo asset missing.** Removed from Organization schema. Add `/public/logo.png` (or .svg) when available, then restore the `logo` field.
- **Founder LinkedIn URLs missing.** Person schema has no `sameAs` — add real URLs when supplied.
- **Section answer-block lengths.** Services intro is at 134 words ✓ (Session 7). Problem and Why Us section intros are shorter than the AEO-recommended 134–167 word range. Tighten during Why Us redesign in Session 10.
- **Question-based H2s.** Why Us ("Why founders choose Metaborong") and Work Preview ("What we've built") are statement-form. Could be tightened to question form for AI citation. Defer to per-section content lock (Context A step 2).
- **FAQ uses `<button>+<div>` instead of native `<details>/<summary>`.** Out of scope for this pass; flagged.

---

## 2026-05-06 — Session 8: Cleanup, design-system polish, Nav + Hero token compliance

### Decision log
- **Codebase cleanup.** Archived 16 specs/plans → `docs/superpowers/archive/`. Deleted local artifacts (`screenshots/`, `.next/`, `.worktrees/`, `tsconfig.tsbuildinfo`, `.superpowers/`). `DESIGN.md` is now the only authoritative UI doc; `CHANGELOG.md` is the only authoritative decision log. Specs/plans are inputs, not parallel sources of truth.
- **Authoring discipline locked.** Added `docs/superpowers/SESSIONS.md` with three context templates (A: existing section pass / B: net-new page / C: site-wide one-off) and a skill-by-skill cheat sheet. Replaces ad-hoc per-session approach.
- **DESIGN.md polish pass benchmarked against supermemory.ai.** Added Mission, Brand context, Writing Tone, Accessibility (WCAG 2.2 AA + focus-visible token), Required Component States (seven-state matrix), Edge cases (long-content / empty / keyboard / pointer / touch), Rules: Do/Don't with `must`/`should` discipline, Authoring workflow, QA checklist. Added semantic alias layer (`color.text.primary` → `--color-dark`). Added duration tokens, shadow scale, surface-raised, Card radius rule. Zero visual identity drift.
- **Token additions to `globals.css`:** `--color-bg-raised`, `--shadow-{sm,md,lg}`, `--duration-{instant,fast,base,slow,deliberate}`. Global `:focus-visible` rule applies the brand-blue ring to every interactive element.
- **Third infinite animation approved:** hero scroll-cue bounce. Auto-fades past `scrollY > 100`, so effectively at-top-only. Documented in DESIGN.md core motion rules.

### Build state changes
- **NEW:** `docs/superpowers/SESSIONS.md`, `docs/superpowers/README.md`.
- **MOVED:** `docs/superpowers/specs/` and `plans/` → `docs/superpowers/archive/`.
- **REWROTE:** `DESIGN.md` (semantic aliases, A11y, motion durations, shadow scale, state matrix, Do/Don't, QA checklist).
- **UPDATED:** `app/globals.css` — new tokens + global focus-visible rule.
- **UPDATED:** `components/layout/nav.tsx` — focus-visible on all interactive elements (via global rule), shadow tokens replace hardcoded values, duration tokens replace hardcoded ms, mobile menu pillars now render in their actual pillar colors (Web3=brand, AI=`#10b981`, Product Studio=`#F6851B`), Esc-to-close on dropdown + mobile menu, hamburger hover state, mobile menu now includes "Explore all services" link parity with desktop.
- **UPDATED:** `components/sections/hero.tsx` — H1 weight `font-bold` (700) → `font-black` (900) per DESIGN.md spec, H1 max size in clamp 72px → 96px, body lede `text-sm` → `text-base` for readability.

### Known follow-ups
- **Button primitive (`components/ui/button.tsx`)** uses inline-style raw hex values (`#204AF8`, `#303030`). Direct DESIGN.md violation but out of scope for this token-compliance pass — every section consumes it. Should be refactored to token-driven Tailwind classes with the seven-state matrix in a dedicated session.
- Add `--color-bg-raised`-consuming surface (likely featured-card hover on subtle backgrounds) when next visual pattern needs it.

---

## [Unreleased] — Active development

### In progress
- Content writing for service hub pages and 14 individual service pages
- Body-section signature moments (4–13) — Section 4 Problem shipped 2026-05-04 (Session 6); Section 5 Services shipped 2026-05-04 (Session 7); Section 6 Why Us up next
- Case studies (pending client-provided details for KGeN, Bionic, DATA3 AI, Defiverse, GET Smart, SEDAX, Bayan, Memestakes Vault)

---

## 2026-05-04 — Session 7: Services Section Signature (Hub-and-Spoke Trefoil)

### Decision log
- **Second body-section signature shipped.** Section 5 (Services) replaces the inline-styled 1px-gap-bordered three-column hack with a click-to-sync hub-and-spoke trefoil paired with a numbered accordion. Topology (planar/sparse/static-at-rest) deliberately differentiates from the Hero orb (spherical/dense/spinning).
- **Approved variant: C — "Atmospheric Depth"** (stroke + faint translucent fills + soft drop-shadows + radial-gradient ground tint). Per-pillar SVG glyphs: Web3 = 7-hex lattice, AI Agents = halo + concentric rings + 5 outer dots + faint arcs, Product Studio = 3 stacked iso parallelograms.
- **Workflow chain (reversed):** brainstorming → writing-plans → /plan-design-review (8/10 → 9.5/10 after 14 fixes baked in) → /design-shotgun → implementation. For structurally heavy plans (≥6 tasks) reversing review-before-shotgun is cheaper — review on a flawed plan is a markdown edit, shotgun on a flawed plan is wasted API spend.
- **Visual exploration tool: visual-companion HTML/CSS** (hand-authored SVG), not the gstack design binary. Same fallback rationale as Problem (Session 6): sub-pixel SVG geometry needs real-CSS fidelity. Second occurrence — pattern confirmed: default to visual-companion for typography + geometry sections.
- **State + first-paint sequencing:** `activePillar` starts `null`; IntersectionObserver flips it to `'web3'` 600ms after section enters viewport. Mirrors phrase-stamp pattern — prevents assembly animation from being swallowed by parent `<Reveal>` fade-in.
- **ARIA pattern:** accordion is canonical tablist (`role="tab"` + `aria-selected` + `aria-controls`). Visual nodes are redundant entry-points (button + `aria-label`, no `aria-pressed` — would conflict with tablist's `aria-selected`).
- **Mobile (<lg):** 3 stacked `<Card variant="featured">`, fully server-rendered, all 14 child links + 3 hub CTAs in static markup. Mobile DOM is canonical SEO source.
- **Dead-link policy:** 17 noindex stub pages added (3 pillar hubs + 14 child services) to prevent 404 traps + soft-404 SEO penalty until real content lands.

### Build state changes
- **NEW:** `components/sections/services-data.ts` — pillar config + types (single source of truth for content + routes).
- **NEW:** `components/sections/services-glyphs.tsx` — 3 SVG glyph components (approved C-variant geometry baked in). Per-glyph `<defs>` for soft-shadow filter survives `<foreignObject>` document boundary.
- **NEW:** `components/sections/services-trefoil.tsx` — client component. 50/50 grid (trefoil left, accordion right). Owns `activePillar`, IntersectionObserver-gated first paint, ARIA tablist, keyboard nav (Arrow/Home/End), reduced-motion support, inline `<style precedence="default">` for spoke-flow loop + assembly animation.
- **NEW:** `components/sections/services-mobile.tsx` — server component. 3 expanded cards, all child links + descriptions visible.
- **REPLACED:** `components/sections/services.tsx` — full rewrite. Now `<Section bg="subtle" maxWidth="wide" id="services">` + centered header + `<ServicesTrefoil className="hidden lg:grid" />` + `<ServicesMobile className="lg:hidden" />`. Export name preserved.
- **NEW:** `app/services/[pillar]/page.tsx` — pillar hub stub (3 routes via `generateStaticParams`), `robots: { index: false, follow: false }`.
- **NEW:** `app/services/[pillar]/[slug]/page.tsx` — individual service stub (14 routes), same noindex pattern.
- **NEW:** `docs/superpowers/specs/2026-05-04-section-services-design.md` — section-level spec.
- **NEW:** `docs/superpowers/plans/2026-05-04-section-services.md` — 11-task plan + self-review + GSTACK REVIEW REPORT (plan-design-review 8/10 → 9.5/10).
- gstack approved.json: `~/.gstack/projects/Anyx30-Metaborong-Portfolio/designs/section-services-trefoil-20260504/approved.json`.

### Verification notes
- `pnpm tsc --noEmit` passes across all new and modified files.
- `pnpm build` blocked by a pre-existing missing `tw-animate-css` dependency in `app/globals.css` (present at commit 894eb5e, before this session). Not in scope of Section 5; flagged for follow-up.

---

## 2026-05-04 — Session 6: Problem Section Signature (Phrase Stamp)

### Decision log
- **First body-section signature shipped.** Per the locked direction from the prior session: each body section (4–13) earns one signature visual moment + supporting motion. Problem went first as the calibration data point.
- **Signature: typographic phrase stamp.** Bridge phrase `treats the project like a ticket in a queue` carries a 1px brand-blue baseline-flush hairline underline + weight 400→500 + color gray→dark. The phrase is the load-bearing line of the agency-vs-freelancer trap; the stamp marks it visually.
- **Motion: subtle scroll-triggered, complementary not headline.** Section enters via existing global `<Reveal>` (whole-section fade+rise, 400ms). ~600ms later the stamp animates: color/weight over 350ms, underline draw L→R over 500ms (lands last as typographic punctuation). Split timing locked as default.
- **Visual exploration tool: visual-companion HTML/CSS, not `/design-shotgun` AI image generation.** Sub-pixel typography decisions need real-CSS fidelity; AI raster output hallucinates text and anti-aliases hairlines inconsistently. V1 of 6 finishes (V2 offset, V3 brand color shift, V4 2px, V5 leading bar, V6 dotted) selected. Approved.json saved to gstack taste profile.
- **Master plan amended** with "Visual temperament (locked 2026-05-04)" section calibrated against this shipped example. Documents chrome restraint above Trust bar, signature personality + supporting motion below, and rejected directions (terminal/IDE chrome, D-trimmed chassis, page-wide motion grammar, internal stagger).

### Build state changes
- **NEW:** `components/sections/phrase-stamp.tsx` (~58 lines). Client component, owns its own IntersectionObserver, `box-decoration-clone` for multi-line wrap, respects `prefers-reduced-motion: reduce`, non-interactive (no hover, no focus).
- **MODIFIED:** `components/sections/problem.tsx` — `<strong>` swapped for `<PhraseStamp>` on the bridge phrase. Layout, copy, accent rule, eyebrow, H2, body unchanged.
- **MODIFIED:** `docs/superpowers/specs/2026-05-01-homepage-restructure-master-design.md` — added "Visual temperament" section between Design System and Section inventory; Section 4 entry updated with signature details; Session 6 entry appended to Execution Model.
- **NEW:** `docs/superpowers/specs/2026-05-04-section-problem-signature.md` — section-level spec.
- **NEW:** `docs/superpowers/plans/2026-05-04-section-problem-signature.md` — implementation plan with 5 tasks + self-review + GSTACK REVIEW REPORT (plan-design-review brought it from 7.5/10 to 9.5/10 across 7 dimensions).

### Workflow chain run end-to-end
`superpowers:brainstorming` → `superpowers:writing-plans` → `/design-shotgun` (V1 approved) → `/plan-design-review` (9.5/10) → implementation.

---

## 2026-04-29 — Hero Visual: Three.js Orb (Phase complete)

### Decision log
- **ASCII Genesis Cube replaced** — original wireframe renderer was edge-only (no filled surfaces). Attempted canvas rewrite with donut.c-style lighting; visual still insufficient. Abandoned.
- **Isometric SVG lattice attempted** — `components/sections/isometric-lattice.tsx` created as a hex-prism lattice in pure SVG. Rejected: not visually compelling enough for the hero.
- **Three.js Hero Orb chosen** — reference: right panel of ausdata.ai. Node-graph sphere on light background with M-mark centered and interactive service labels. Approved after canvas 2D mockup shown.
- **Light background kept** — hero right panel stays `#f5f7ff`, no dark panel. Nodes readable in blue/orange/green on light bg.

### Added
- **`components/hero-orb/hero-orb.tsx`** — Canvas wrapper, lazy-loaded via `next/dynamic` with `ssr: false`. Camera at `[0,0,5.5]`, fov 48, dpr `[1,2]`, transparent bg.
- **`components/hero-orb/orb-scene.tsx`** — Full Three.js scene:
  - 214 nodes distributed on a Fibonacci sphere (mathematically uniform, no polar clustering)
  - 200 blue nodes (`#204AF8`) as InstancedMesh — 1 draw call
  - 14 interactive service nodes color-coded by pillar: WEB3 = orange `#F6851B`, AI = green `#4dff9a`, PRODUCT = blue `#204AF8`
  - ~530 edges (5-nearest neighbours per node) as LineSegments — 1 draw call, opacity 0.16
  - Metaborong M-mark SVG centered via `@react-three/drei` `Html`
  - **Custom orbit controller** replacing OrbitControls — proper click-vs-drag detection (>5px threshold). Drag overrides auto-rotate; releases damp back to auto-speed. Fixes OrbitControls interference with page interactions.
  - Auto-rotation: `0.058 rad/s` (≈ OrbitControls speed 0.55) on Y axis
  - **HUD floating label on hover** — `onPointerEnter` on service nodes (core + halo) triggers futuristic label:
    - Dark glass background `rgba(2,6,26,0.94)` with colored glow border + box-shadow
    - L-shaped corner brackets in category color
    - Glowing dot indicator + service name in monospace uppercase + blinking `_` cursor
    - Scan-line animation overlay
    - CSS keyframes injected at runtime (avoids Tailwind purge in Three.js Html portals)
    - **Hemisphere-aware anchoring**: right hemisphere (`worldX > 0`) → `translateX(-100%) translateY(-100%)`, bottom-right corner at node, label extends left. Left hemisphere → `translateX(0%) translateY(-100%)`, bottom-left corner at node, label extends right. No slide — label materialises at final position via scale+blur fade only.
    - 3.6s auto-expire; label persists on pointer-leave so user can read as sphere rotates

### Technical decisions
- **Stack additions:** `three@0.184`, `@react-three/fiber@9.6`, `@react-three/drei@10.7`, `@types/three@0.184`
- **`JetBrains Mono`** added to `globals.css` via Google Fonts — used in HUD label text
- **`app/globals.css`** — HUD label CSS keyframes (`_orbIn`, `_orbCur`, `_orbScn`) added
- **`hero.tsx`** marked `'use client'` — required for `next/dynamic` with `ssr: false`
- **InstancedMesh + LineSegments** — entire orb is 2 WebGL draw calls regardless of node count; 60fps on any modern GPU
- **Geometry built at module load time** — Fibonacci sphere, edge graph, and mesh objects computed once on first import; no per-render allocation

### Removed (cleanup 2026-04-30)
- `components/genesis-cube/` — deleted; original ASCII canvas renderer, never used in production
- `components/sections/isometric-lattice.tsx` — deleted; SVG lattice attempt, never used
- `docs/superpowers/specs/2026-04-30-orb-robot-icon-design.md` — deleted; robot icon brainstorm, abandoned in favour of keeping M-mark
- `screenshots/` — deleted; dev-session captures, not production assets (now gitignored)
- `.superpowers/brainstorm/` — deleted; brainstorm session artifacts (now gitignored)

---

## 2026-04-28 — Homepage Complete

### Added
- **Full homepage build** — all 10 sections live and rendering at `http://localhost:3001`
- **ASCII Genesis Cube** — pure-math 3D renderer (`renderer.ts`) with cube → torus → dodecahedron → cube morph loop, luminance ramp using `' 0123456789'`, Bresenham line draw, z-buffer, perspective projection. Runs in a `requestAnimationFrame` loop via `useGenesisCube` hook. Lazy-loaded into the hero right panel.
- **Hero section** — 55/45 split layout, single H1, AEO extraction blockquote (38-word AI-citation sentence), dual CTAs, micro-copy trust signal
- **Trust bar** — infinite CSS scroll marquee: KGeN · Bionic · DATA3 AI · Defiverse · GET Smart · SEDAX · Bayan · Memestakes Vault
- **Services section** — 3-pillar grid (Web3/Blockchain, AI Agents, Product Studio), each linking to hub page
- **Why Us section** — 3 differentiator cards: Speed, Product Thinking, Niche Depth
- **Work Preview section** — 4 project cards (placeholder visuals, case study content deferred)
- **Testimonials section** — 4 named client quotes (Siddharth Banerjee, Dr. Josh, Abhishek Krishna, Girish Ahirwar)
- **Founders section** — 3 founder cards with initials, role, bio, LinkedIn links (Arnab Ray CEO, Anik Ghosh COO, Soumojit Ash CTO)
- **Comparison table** — Metaborong vs Large Web3 Agency vs Freelance, with honest competitor acknowledgement
- **FAQ accordion** — 8 Q&As, all self-contained for AI extraction (GEO/AEO compliant)
- **Contact CTA** — dark `#0a0a0a` section
- **Footer** — logo, nav links, social icons (LinkedIn, X), copyright
- **JSON-LD schema** — Organization + WebSite schema injected via Next.js `dangerouslySetInnerHTML`
- **SEO metadata** — title tag (43 chars), meta description (157 chars), canonical, OpenGraph tags via Next.js Metadata API
- **Design system tokens** — full CSS custom properties in `app/globals.css` via Tailwind v4 `@theme` block
- **Base UI components** — Logo (real M-mark SVG), Button (primary/ghost/secondary), Badge
- **Nav** — sticky frosted-glass, Services dropdown with 3 pillars, mobile hamburger

### Technical decisions
- **Stack:** Next.js 16 (App Router) + TypeScript + Tailwind v4 + pnpm
- **Font:** Satoshi via Fontshare CDN, fallback Space Grotesk
- **Colors:** `#204AF8` brand blue, `#F6851B` UT Orange, `#0a0a0a` canvas dark, `#f5f7ff` subtle hero bg
- **Icons:** Lucide React (inline SVGs where needed for Linkedin/Twitter)
- **No component library** — built from scratch against the Claude Design export
- **Worktree workflow:** feature branch `feature/homepage` in `.worktrees/homepage`, merged to `main`

---

## 2026-04-28 — Content Architecture Locked

### Decisions
- **Site architecture:** Category Hub + Individual Pages (3 hub pages + 14 service pages)
  - `/services/web3/` — hub targeting `web3 development company` (720/mo)
  - `/services/ai-agents/` — hub targeting `ai agent development` (480/mo)
  - `/services/product-studio/` — hub
  - 14 individual service pages at `/services/[pillar]/[service]/`
- **Navbar:** Simple dropdown — `Services ▾ | Work | About | Blog | Let's Talk`
- **Service naming:** Hybrid format — service name + subtitle in muted text
- **Hero direction:** Light/tinted (`#f5f7ff`), two-column 55/45 split
- **Hero right panel:** ASCII Genesis Cube (decided during visual design phase)
- **Homepage content** written to `docs/content/homepage.md` — SEO/AEO compliant

### SEO/GEO strategy (from `docs/metaborong-seo-strategy.pdf`)
- Both competitors (SoluLab DA 34, Antier DA 35) are declining (-52% and -26% traffic)
- First-mover opportunity: AI Agents in Web3 — neither competitor covers this niche
- Target KPIs: DA 22-28, 5k-8k organic traffic, 2k-3.5k ranking keywords by Month 12

---

## 2026-04-28 — Project Initiated

### Context
- Metaborong (metaborong.com) current site scores: SEO D, GEO F, Usability A, Performance D
- Zero organic traffic, DA 2
- Decision: Full content + design rebuild (not a patch)
- SEO audit from The HOTH identified: 5 H1 tags, 10-char title, 37-char meta, no schema, no sitemap

### Company profile locked
- **Identity:** Full-stack Web3 development + AI agent development + Product Studio
- **Founders:** Arnab Ray (CEO), Anik Ghosh (COO), Soumojit Ash (CTO)
- **Primary clients:** Startups & founders, then crypto-native projects, then enterprises
- **Differentiators:** Speed, product thinking, niche depth
- **Markets:** US & Europe

### Design system ingested
- Source: Claude Design export (`https://api.anthropic.com/v1/design/h/-dqN6IowSBC2XjS4hrRmAw`)
- Extracted to `/tmp/metaborong-design-system/` (session-local; re-fetch URL if needed)
- Full token set documented in `app/globals.css`

---

## Deferred / Upcoming

| Item | Status | Notes |
|------|--------|-------|
| Hero visual | ✅ Done | Three.js Fibonacci orb with HUD labels — see 2026-04-29 entry |
| Homepage visual polish pass | Pending | Other sections reviewed but not all adjusted yet |
| Service hub pages (3) | Pending | Content skeleton in `docs/content/`; no pages built yet |
| Individual service pages (14) | Pending | Keyword targets in strategy doc |
| About page | Pending | Founders + E-E-A-T |
| Contact page | Pending | Form + email |
| Case studies | Blocked | Awaiting client details (KGeN, Bionic, DATA3 AI, Defiverse, GET Smart, SEDAX, Bayan, Memestakes Vault) |
| Blog infrastructure | Phase 2 | 16 posts planned per strategy doc |
| `llms.txt` | Pending | GEO compliance |
| `robots.txt` + `sitemap.xml` | Pending | Technical SEO |
| Google Search Console setup | Pending | Phase 1 quick win |
| GA4 with conversion events | Pending | Phase 1 quick win |
| LinkedIn provider pages audit | Pending | |
| OG image (`/assets/og/og-home.webp`) | Pending | 1200×630; referenced in metadata but file missing |
| Mobile responsiveness pass | Pending | Breakpoints: 320/768/1024/1440; hero built desktop-first |
| Core Web Vitals audit | Pending | LCP < 2.5s, INP < 200ms, CLS < 0.1 |
| Founders LinkedIn URLs | Pending | Placeholders in `components/sections/founders.tsx` |
| Clean up dead code | ✅ Done | Deleted `genesis-cube/`, `isometric-lattice.tsx`, screenshots, brainstorm artifacts |
