# Metaborong Website — Changelog

All major decisions, milestones, and changes to this project.

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
