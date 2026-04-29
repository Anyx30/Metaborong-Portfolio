# Metaborong Website — Changelog

All major decisions, milestones, and changes to this project.

---

## [Unreleased] — Active development

### In progress
- Content writing for service hub pages and 14 individual service pages
- Visual polish pass on remaining homepage sections
- Case studies (pending client-provided details for KGeN, Bionic, DATA3 AI, Defiverse, GET Smart, SEDAX, Bayan, Memestakes Vault)

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

### Superseded / dead code (kept, not deleted)
- `components/genesis-cube/` — original ASCII canvas renderer, no longer used by any page
- `components/sections/isometric-lattice.tsx` — SVG lattice attempt, no longer imported

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
| Clean up dead code | Pending | `components/genesis-cube/` and `isometric-lattice.tsx` unused |
