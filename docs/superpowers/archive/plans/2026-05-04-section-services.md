# Section 5 Services Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current `components/sections/services.tsx` (inline-styled 1px-gap-bordered hack) with a click-to-sync hub-and-spoke trefoil visual paired with a numbered accordion, surfacing all 14 child services as anchor-text links from the homepage. Mobile (<lg) falls back to 3 stacked expanded cards. The signature is the trefoil's at-rest visual fact + brief assembly motion on activation.

**Architecture:** Five new/replaced files plus a Next.js dynamic route for stub service pages. A top-level server component (`services.tsx`) renders the section header + responsive children: a client `<ServicesTrefoil>` (desktop, owns `activePillar` state, paired ARIA tablist for visual ↔ accordion sync) and a server `<ServicesMobile>` (3 expanded `<Card variant="featured">`). Glyphs are isolated SVG components with `{ active, primed, reducedMotion }` interface; the approved C-variant ("Atmospheric Depth") SVG geometry is baked in directly — `/design-shotgun` ran before this plan, output lives at `~/.gstack/projects/Anyx30-Metaborong-Portfolio/designs/section-services-trefoil-20260504/approved.json`.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4 arbitrary-value classes (project convention). SVG + CSS animations (no Three.js, no Framer Motion).

**Spec:** `docs/superpowers/specs/2026-05-04-section-services-design.md`

**Master plan reference:** `docs/superpowers/specs/2026-05-01-homepage-restructure-master-design.md` (Section 5, Visual temperament, Design System primitives).

**Calibration reference:** `components/sections/phrase-stamp.tsx` (Problem signature — same posture: at-rest visual fact + complementary motion + reduced-motion respect).

---

## File Structure

| File | Status | Responsibility |
|---|---|---|
| `components/sections/services-data.ts` | **create** | Pillar config (id, label, color, headline, body, href, cta) and child-services array. Pure data + TypeScript types. Imported by both `services-trefoil.tsx` and `services-mobile.tsx`. |
| `components/sections/services-glyphs.tsx` | **create** | Three SVG glyph components (`Web3Glyph`, `AIAgentsGlyph`, `ProductStudioGlyph`). Each takes `{ active, primed, reducedMotion }` and renders state via class toggle. SVG geometry is the approved C-variant from `/design-shotgun` (Atmospheric Depth: stroke + faint translucent fills + soft drop-shadows). Per-glyph `<defs>` carries the shared filter — see locked decision #15. |
| `components/sections/services-trefoil.tsx` | **create** | Client component. Owns `activePillar` state. Renders 50/50 grid: trefoil SVG (hub + 3 spokes + 3 nodes) on the left, numbered accordion on the right. Implements ARIA tablist semantics + keyboard nav. Reads `prefers-reduced-motion` once at mount. |
| `components/sections/services-mobile.tsx` | **create** | Server component. Below `lg`. Renders 3 stacked `<Card variant="featured">`, each always-expanded with full pillar content + child links + CTA. No state, no interactivity. |
| `components/sections/services.tsx` | **modify (full rewrite)** | Top-level server component. Renders `<Section bg="subtle" maxWidth="wide" id="services">` containing the section header (eyebrow + h2 + body lead), then `<ServicesTrefoil className="hidden lg:block">` and `<ServicesMobile className="lg:hidden">`. Existing default export name `ServicesSection` retained — no change needed in `app/page.tsx`. |
| `app/services/[pillar]/page.tsx` | **create** | Pillar hub page (3 routes: `web3`, `ai-agents`, `product-studio`). Static-generated via `generateStaticParams` from the same `pillars` array. `<h1>{label}</h1>` + body + back-to-home link. `metadata.robots: { index: false, follow: false }` to prevent soft-404 SEO penalty until real content lands. |
| `app/services/[pillar]/[slug]/page.tsx` | **create** | Individual service page (14 routes — slugs from `pillars[].children[].slug`). Same noindex stub pattern as the pillar hub. Resolves `{pillar, slug}` against the data module; `notFound()` if either is invalid (build-time guarantee since `generateStaticParams` enumerates the valid set). |

**No `app/globals.css` change.** All styling is Tailwind arbitrary-value classes per project convention. Inline `<style>` blocks for the few CSS-keyframe animations live inside `services-trefoil.tsx` (see Task 6 rationale).

---

## Decisions locked in this plan

1. **State model:** single `activePillar: 'web3' | 'ai-agents' | 'product-studio' | null` `useState`, lifted to `<ServicesTrefoil>`. Initial value `null` (no pillar active on hydration); flipped to `'web3'` 600ms after the section's `IntersectionObserver` fires (matches the phrase-stamp.tsx pattern from Session 6 — prevents the assembly animation from being swallowed by the parent `<Reveal>`'s opacity 0→1 fade). Once flipped, never returns to `null`.
2. **Component interface for glyphs:** `<PillarGlyph active={boolean} primed={boolean} />`. Three render states: `primed=false` (pre-mount, opacity 0 — invisible), `primed=true active=false` (inactive, opacity 0.4, ghosted), `primed=true active=true` (active, opacity 1 + assembly animation). `primed` flips true at the same moment activeId leaves null. Prevents flicker on first paint; ensures all 3 glyphs cross-fade in together rather than the inactive two appearing first.
3. **Click-only:** clicks on nodes (whole 80px hit zone) and on accordion rows both call `setActivePillar(id)`. No hover preview. No double-tap. No drag.
4. **ARIA pattern:** the **accordion is the canonical tablist**. Each accordion row's button has `role="tab"`, `aria-selected`, `aria-controls`. The expanded panel has `role="tabpanel"`. Each visual node is a redundant entry-point — implemented as a `<button>` with `aria-label` matching the pillar (e.g., `"Activate Web3 / Blockchain pillar"`) but **not** in the tablist (avoids duplicate tab-stops; nodes stay reachable via Tab but are announced as supplementary controls). Node buttons do **not** carry `aria-pressed` (would conflict with the tablist's `aria-selected` for the same conceptual state — AT users would hear the same selection announced via two different idioms). Trefoil SVG container has `aria-hidden="true"` on the decorative ground-plane / hub / spokes; only the node `<button>` elements are interactive.
5. **Keyboard nav:**
   - Tab into the accordion → focus lands on the active row's button.
   - ArrowDown / ArrowRight → activate next pillar (wraps).
   - ArrowUp / ArrowLeft → activate previous pillar (wraps).
   - Enter / Space on a row → no-op when already active; activates if not (redundant with arrow keys, but standard tab behavior).
   - Tab again → moves into the active panel's content (child links, CTA).
   - Visual node buttons reachable via Tab in source order but trigger the same `setActivePillar` on Enter/Space.
6. **Mobile cutover:** `hidden lg:block` on the trefoil, `lg:hidden` on the mobile fallback. Pure CSS — both render in DOM (good for SEO; bad for bundle size only by ~3kb). **Mobile layout stability requirement:** no CLS during the section's `<Reveal>` fade-in, no flicker on hydration. The mobile path is fully server-rendered (no client component) so first paint = final paint with no JS-driven changes.
7. **`prefers-reduced-motion: reduce`:** read once via `window.matchMedia('(prefers-reduced-motion: reduce)').matches`. If true, a `data-reduced-motion="true"` attr is set on the trefoil root, which CSS uses to disable all `transition` and `animation` properties (instant state changes, no spoke loop, no assembly). Click → state still flips instantly. The IntersectionObserver-gated first-paint delay still applies (it's a structural sequencing concern, not motion).
8. **Glyph SVG bodies (Task 2) — locked from `/design-shotgun` approved C-variant ("Atmospheric Depth").** Source of truth: `~/.gstack/projects/Anyx30-Metaborong-Portfolio/designs/section-services-trefoil-20260504/approved.json`. Treatment: stroke + faint translucent fills + soft drop-shadows. Web3 = 7 pointy-top hexes (1 center r=14, 6 surrounding r=10 at D=25 with 30°+60°i positioning) with 1px brand-blue stroke + 10–18% fill + 0.5px hairline connectors at 60% opacity. AI Agents = halo radial-gradient (0.7→0 over 14px) + 4px solid center dot + 2 stroked concentric rings (r=13 / r=22) + 5 outer 2.8px filled dots with shadow + 5 hairline curved arcs from center to outer dots at 40% opacity. Product Studio = 3 stacked iso parallelograms with 1px stroke + 12–28% opacity-laddered fills + soft drop-shadow. Integration is front-loaded (Task 10 collapsed to a verification note).
9. **Spoke flow ambient animation:** SVG path with `stroke-dasharray: 4 6` and `stroke-dashoffset` animated 0 → -10 over 3s linear infinite. Disabled under reduced-motion. Lives in the inline `<style precedence="default">` block at top of `services-trefoil.tsx` — `precedence` is required for React 19's hoisting + dedup so the style is hydration-safe and not duplicated on subsequent renders.
10. **No section pagination band** (`[ N/M ]`). Confirmed in spec; do not add.
11. **Hub treatment (locked):** small brand-blue filled circle (8px radius) with a 1px brand-blue glow ring (16px radius, 30% opacity). No M-mark, no later sanity-check — locked here to avoid an implementation-time decision. Visual rhyme with Hero orb's centered M-mark is acceptable since topology already differentiates (sphere/dense/spinning vs planar/sparse/still).
12. **Ground plane treatment — locked from approved C-variant.** SVG `<radialGradient id="services-ground" cx="50%" cy="50%" r="50%">` with stops `0%: #204AF8 @ 0.05` and `60%: #204AF8 @ 0`. Atmospheric tint under the hub; fades to transparent at the figure edges. Lives in the trefoil's main `<svg>` `<defs>` block.
15. **Shared SVG `<defs>` placement — per-glyph, NOT parent-trefoil.** The approved C-variant uses a `<filter id="soft-shadow">` (Gaussian blur stdDeviation=2, dy=2, slope=0.18) and a `<radialGradient id="ai-halo">` (AI only, green 0.7→0 over 14px). These live **inside each glyph's own `<svg>` `<defs>` block**, not the parent trefoil `<svg>`. Reason: glyphs render inside `<foreignObject>` which introduces an HTML/XHTML document boundary; SVG `url(#id)` references do not reliably resolve across that boundary. Per-glyph defs are self-contained and ~30 bytes of duplication per usage. The parent trefoil `<svg>` keeps only the `<radialGradient id="services-ground">` for the ground plane (referenced by the parent's own `<rect>`, not crossing any boundary).
16. **Glyph viewBox is centered: `viewBox="-40 -40 80 80"`.** Approved C-variant SVG bodies use coordinates relative to glyph center (e.g., Web3's center hex polygon points are `12.12,-7 0,-14 -12.12,-7 ...`). Centered viewBox lets the approved geometry drop in unchanged. The `<foreignObject>` placement (`x={node.x - 40} y={node.y - 40} width=80 height=80`) is unchanged — visual rendering is identical, only the inner coordinate origin shifts from top-left to center.
13. **Active spoke styling:** active spoke gets `stroke-opacity: 0.9` AND `stroke-width: 1.5`; inactive spokes get `stroke-opacity: 0.3` AND `stroke-width: 1`. Both transition over 200ms ease-out. Matches spec's "thickens slightly + brightens" language.
14. **Dead-link policy:** all 17 referenced URLs (3 pillar hubs + 14 child services) are stubbed in Task 9 with `<h1>{name}</h1><p>Coming soon</p>` placeholder pages + `metadata: { robots: { index: false, follow: false } }`. Prevents 404 traps + soft-404 SEO penalty. Real content swaps in per service in future sessions.

---

## `/design-shotgun` output (already integrated)

`/design-shotgun` ran 2026-05-04 before this plan was finalized. Approved variant is C ("Atmospheric Depth") — stroke + faint fills + soft drop-shadows + radial-gradient ground tint. SVG geometry is baked directly into Task 2 (glyphs) and Task 4 (ground plane). Reference artifacts:

- `~/.gstack/projects/Anyx30-Metaborong-Portfolio/designs/section-services-trefoil-20260504/approved.json` — full geometry per pillar, plus `<filter>` and `<radialGradient>` definitions.
- `~/.gstack/projects/Anyx30-Metaborong-Portfolio/designs/section-services-trefoil-20260504/visual-companion.html` — 3 hand-authored variants A/B/C side-by-side, retained for posterity.
- Tool used: **visual-companion HTML/CSS** (hand-authored SVG), not the gstack design binary. Same reasoning as Problem signature in Session 6 — sub-pixel geometry needs real-CSS fidelity, AI raster generation hallucinates hairlines and asymmetric angles.

Task 10 collapsed to a one-step verification.

---

## Task 1: Pillar data + types

**Files:**
- Create: `components/sections/services-data.ts`

- [ ] **Step 1: Create the data module**

```ts
export type PillarId = 'web3' | 'ai-agents' | 'product-studio'

export type ChildService = {
  name: string
  description: string
  slug: string
}

export type Pillar = {
  id: PillarId
  num: string
  label: string
  color: string
  headline: string
  body: string
  hubHref: string
  hubCta: string
  children: ChildService[]
}

export const pillars: Pillar[] = [
  {
    id: 'web3',
    num: '01',
    label: 'Web3 / Blockchain',
    color: '#204AF8',
    headline: 'Decentralised protocol engineering',
    body: 'DeFi protocols, NFT marketplaces, crypto wallets, token launches, liquid staking, and DAO systems — built multichain.',
    hubHref: '/services/web3/',
    hubCta: 'Explore Web3 Services',
    children: [
      { name: 'DeFi Protocol Development', description: 'Lending, AMM, perp-DEX, and yield infrastructure built audit-ready.', slug: 'defi-protocol-development' },
      { name: 'Smart Contract Security', description: 'Specs, audits, and post-deploy monitoring for production contracts.', slug: 'smart-contract-security' },
      { name: 'NFT Marketplace Development', description: 'Custom marketplaces with royalties, lazy-mint, and curation.', slug: 'nft-marketplace-development' },
      { name: 'Crypto Wallet Development', description: 'Custodial and self-custody wallets across EVM, Solana, Cosmos.', slug: 'crypto-wallet-development' },
      { name: 'Token Launchpad', description: 'Token sales, vesting, and distribution infrastructure end-to-end.', slug: 'token-launchpad' },
      { name: 'Liquid Staking Vaults', description: 'LST/LRT vault systems with restaking and risk controls.', slug: 'liquid-staking-vaults' },
      { name: 'DAO & Governance Systems', description: 'On-chain governance, treasury, and voting tooling.', slug: 'dao-governance-systems' },
    ],
  },
  {
    id: 'ai-agents',
    num: '02',
    label: 'AI Agents',
    color: '#10b981',
    headline: 'AI systems that work while you sleep',
    body: 'Agentic pipelines, RAG applications, voice agents, generative AI, and workflow automation — from prototype to production.',
    hubHref: '/services/ai-agents/',
    hubCta: 'Explore AI Agent Services',
    children: [
      { name: 'Agentic AI Systems', description: 'Multi-step autonomous agents that plan, tool-use, and report.', slug: 'agentic-ai-systems' },
      { name: 'Generative AI Development', description: 'Custom GenAI products beyond ChatGPT wrappers.', slug: 'generative-ai-development' },
      { name: 'AI Workflow Automation', description: 'Trigger-driven AI flows across your existing stack.', slug: 'ai-workflow-automation' },
      { name: 'Voice Agent Integration', description: 'Real-time voice agents for support, sales, and operations.', slug: 'voice-agent-integration' },
      { name: 'RAG & Knowledge Systems', description: 'Retrieval pipelines that ground LLMs in your data.', slug: 'rag-knowledge-systems' },
      { name: 'AI Systems Integration', description: 'Embedding LLMs into existing software and infrastructure.', slug: 'ai-systems-integration' },
    ],
  },
  {
    id: 'product-studio',
    num: '03',
    label: 'Product Studio',
    color: '#F6851B',
    headline: 'SaaS products built to scale',
    body: 'End-to-end Web2 product builds — architecture, design, development, and deployment for startups that need a full technical team.',
    hubHref: '/services/product-studio/',
    hubCta: 'Explore Product Studio',
    children: [
      { name: 'SaaS Product Development', description: 'End-to-end Web2 product builds, architecture to deployment.', slug: 'saas-product-development' },
    ],
  },
]
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`
Expected: PASS — no errors.

- [ ] **Step 3: Commit**

```bash
git add components/sections/services-data.ts
git commit -m "feat(services): pillar data + types for trefoil and mobile fallback"
```

---

## Task 2: Glyph components (approved C-variant geometry baked in)

**Files:**
- Create: `components/sections/services-glyphs.tsx`

Component interface + SVG bodies are both locked here from `/design-shotgun` approved.json. No follow-up swap-in needed (Task 10 collapses to a verification note).

- [ ] **Step 1: Create the glyph file**

```tsx
type GlyphProps = {
  active: boolean
  primed?: boolean       // false = pre-IntersectionObserver, opacity 0; true = visible per active state
  reducedMotion?: boolean
}

const baseClass =
  'transition-[opacity,transform] duration-300 ease-out'

// Three-state opacity ladder. primed=false → invisible (avoids appearing during <Reveal> fade-in).
// primed=true + active=false → ghosted. primed=true + active=true → full saturation + assembly animation
// (the assembly animation is wired in Task 6's CSS, keyed off `data-active="true"`).
const stateClass = (primed: boolean, active: boolean) => {
  if (!primed) return 'opacity-0'
  return active ? 'opacity-100' : 'opacity-40'
}

// Shared filter id — defined inside each glyph svg to survive the foreignObject document boundary.
const SOFT_SHADOW = (
  <filter id="soft-shadow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
    <feOffset dx="0" dy="2" result="off" />
    <feComponentTransfer><feFuncA type="linear" slope="0.18" /></feComponentTransfer>
    <feMerge>
      <feMergeNode />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>
)

// Web3 / Blockchain — interlocking hex-lattice (7 hexes), C-variant treatment: stroke + 10–18% fill + soft shadow.
export function Web3Glyph({ active, primed, reducedMotion }: GlyphProps) {
  return (
    <svg
      viewBox="-40 -40 80 80"
      width="80"
      height="80"
      className={`${baseClass} ${stateClass(primed ?? false, active)}`}
      data-active={active}
      data-primed={primed ?? false}
      data-reduced-motion={reducedMotion ?? false}
      aria-hidden="true"
    >
      <defs>{SOFT_SHADOW}</defs>
      <g filter="url(#soft-shadow)">
        {/* Center hex (slightly more saturated fill) */}
        <polygon points="12.12,-7 0,-14 -12.12,-7 -12.12,7 0,14 12.12,7" fill="#204AF8" fillOpacity="0.18" stroke="#204AF8" strokeWidth="1" />
        {/* Six surrounding hexes at 30°+60°i positioning (D=25 from center) */}
        <g transform="translate(21.65, 12.5)"><polygon points="8.66,-5 0,-10 -8.66,-5 -8.66,5 0,10 8.66,5" fill="#204AF8" fillOpacity="0.10" stroke="#204AF8" strokeWidth="1" /></g>
        <g transform="translate(0, 25)"><polygon points="8.66,-5 0,-10 -8.66,-5 -8.66,5 0,10 8.66,5" fill="#204AF8" fillOpacity="0.10" stroke="#204AF8" strokeWidth="1" /></g>
        <g transform="translate(-21.65, 12.5)"><polygon points="8.66,-5 0,-10 -8.66,-5 -8.66,5 0,10 8.66,5" fill="#204AF8" fillOpacity="0.10" stroke="#204AF8" strokeWidth="1" /></g>
        <g transform="translate(-21.65, -12.5)"><polygon points="8.66,-5 0,-10 -8.66,-5 -8.66,5 0,10 8.66,5" fill="#204AF8" fillOpacity="0.10" stroke="#204AF8" strokeWidth="1" /></g>
        <g transform="translate(0, -25)"><polygon points="8.66,-5 0,-10 -8.66,-5 -8.66,5 0,10 8.66,5" fill="#204AF8" fillOpacity="0.10" stroke="#204AF8" strokeWidth="1" /></g>
        <g transform="translate(21.65, -12.5)"><polygon points="8.66,-5 0,-10 -8.66,-5 -8.66,5 0,10 8.66,5" fill="#204AF8" fillOpacity="0.10" stroke="#204AF8" strokeWidth="1" /></g>
        {/* Tiny hairline connectors (center hex edge → surrounding hex edge) */}
        <g stroke="#204AF8" strokeWidth="0.5" opacity="0.6">
          <line x1="6.5" y1="3.75" x2="15.15" y2="8.75" />
          <line x1="0" y1="7" x2="0" y2="18" />
          <line x1="-6.5" y1="3.75" x2="-15.15" y2="8.75" />
          <line x1="-6.5" y1="-3.75" x2="-15.15" y2="-8.75" />
          <line x1="0" y1="-7" x2="0" y2="-18" />
          <line x1="6.5" y1="-3.75" x2="15.15" y2="-8.75" />
        </g>
      </g>
    </svg>
  )
}

// AI Agents — radial pulse with halo, concentric rings, 5 outer dots, faint arcs. C-variant treatment.
export function AIAgentsGlyph({ active, primed, reducedMotion }: GlyphProps) {
  return (
    <svg
      viewBox="-40 -40 80 80"
      width="80"
      height="80"
      className={`${baseClass} ${stateClass(primed ?? false, active)}`}
      data-active={active}
      data-primed={primed ?? false}
      data-reduced-motion={reducedMotion ?? false}
      aria-hidden="true"
    >
      <defs>
        {SOFT_SHADOW}
        <radialGradient id="ai-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Halo (sits behind everything else) */}
      <circle cx="0" cy="0" r="14" fill="url(#ai-halo)" />
      {/* Center dot */}
      <circle cx="0" cy="0" r="4" fill="#10b981" />
      {/* 2 thin concentric rings */}
      <circle cx="0" cy="0" r="13" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.7" />
      <circle cx="0" cy="0" r="22" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.5" />
      {/* 5 outer dots (with shadow) at 28px radius, 72° spacing starting at -90° (top) */}
      <g filter="url(#soft-shadow)">
        <circle cx="0" cy="-28" r="2.8" fill="#10b981" />
        <circle cx="26.63" cy="-8.65" r="2.8" fill="#10b981" />
        <circle cx="16.46" cy="22.65" r="2.8" fill="#10b981" />
        <circle cx="-16.46" cy="22.65" r="2.8" fill="#10b981" />
        <circle cx="-26.63" cy="-8.65" r="2.8" fill="#10b981" />
      </g>
      {/* Faint curved arcs from center → each outer dot */}
      <g stroke="#10b981" strokeWidth="0.5" fill="none" opacity="0.4">
        <path d="M 0 0 Q 4 -16 0 -28" />
        <path d="M 0 0 Q 16 -8 26.63 -8.65" />
        <path d="M 0 0 Q 12 14 16.46 22.65" />
        <path d="M 0 0 Q -12 14 -16.46 22.65" />
        <path d="M 0 0 Q -16 -8 -26.63 -8.65" />
      </g>
    </svg>
  )
}

// Product Studio — 3 stacked iso parallelograms with stroke + opacity-laddered fill + soft shadow.
export function ProductStudioGlyph({ active, primed, reducedMotion }: GlyphProps) {
  return (
    <svg
      viewBox="-40 -40 80 80"
      width="80"
      height="80"
      className={`${baseClass} ${stateClass(primed ?? false, active)}`}
      data-active={active}
      data-primed={primed ?? false}
      data-reduced-motion={reducedMotion ?? false}
      aria-hidden="true"
    >
      <defs>{SOFT_SHADOW}</defs>
      <g filter="url(#soft-shadow)">
        {/* Top plane (brightest) */}
        <polygon points="0,-22 22,-14 0,-6 -22,-14" fill="#F6851B" fillOpacity="0.28" stroke="#F6851B" strokeWidth="1" />
        {/* Middle */}
        <polygon points="0,-4 26,6 0,16 -26,6" fill="#F6851B" fillOpacity="0.18" stroke="#F6851B" strokeWidth="1" />
        {/* Bottom (faintest) */}
        <polygon points="0,14 30,26 0,38 -30,26" fill="#F6851B" fillOpacity="0.12" stroke="#F6851B" strokeWidth="1" />
      </g>
    </svg>
  )
}

export function PillarGlyph({ pillarId, active, primed, reducedMotion }: { pillarId: 'web3' | 'ai-agents' | 'product-studio'; active: boolean; primed?: boolean; reducedMotion?: boolean }) {
  if (pillarId === 'web3') return <Web3Glyph active={active} primed={primed} reducedMotion={reducedMotion} />
  if (pillarId === 'ai-agents') return <AIAgentsGlyph active={active} primed={primed} reducedMotion={reducedMotion} />
  return <ProductStudioGlyph active={active} primed={primed} reducedMotion={reducedMotion} />
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/sections/services-glyphs.tsx
git commit -m "feat(services): SVG glyphs per pillar (approved C-variant — Atmospheric Depth)"
```

---

## Task 3: Mobile fallback (server component)

**Files:**
- Create: `components/sections/services-mobile.tsx`

- [ ] **Step 1: Create the mobile fallback component**

```tsx
import { Card } from '@/components/ui/card'
import { pillars } from '@/components/sections/services-data'

type Props = {
  className?: string
}

export function ServicesMobile({ className = '' }: Props) {
  return (
    <ul className={`flex flex-col gap-6 list-none p-0 m-0 ${className}`}>
      {pillars.map((p) => (
        <Card
          key={p.id}
          as="li"
          variant="featured"
          accentColor={p.color}
          // Override Card's hover lift — mobile cards are not whole-card-clickable (only inner links are),
          // so the lift would create a "lying" affordance on narrowed-desktop browsers.
          // ! prefix = Tailwind v4 important modifier to override the base Card classes.
          className="!hover:translate-y-0 !hover:border-border"
        >
          <div
            className="text-[11px] font-bold tracking-[0.1em] uppercase mb-[20px]"
            style={{ color: p.color }}
          >
            {p.label}
          </div>
          <h3 className="text-[20px] font-bold tracking-[-0.025em] leading-[1.2] text-dark mb-[14px]">
            {p.headline}
          </h3>
          <p className="text-[14px] text-gray leading-[1.75] tracking-[-0.005em] mb-[24px]">
            {p.body}
          </p>
          <ul className="flex flex-col gap-[12px] list-none p-0 m-0 mb-[24px]">
            {p.children.map((c) => (
              <li key={c.slug}>
                <a
                  href={`${p.hubHref}${c.slug}/`}
                  className="group flex flex-col gap-[2px] no-underline"
                >
                  <span className="flex items-center gap-[6px] text-[14px] font-semibold text-dark group-hover:text-[var(--hover-color)]" style={{ ['--hover-color' as string]: p.color }}>
                    {c.name}
                    <span aria-hidden="true">→</span>
                  </span>
                  <span className="text-[13px] text-gray leading-[1.5]">
                    {c.description}
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <a
            href={p.hubHref}
            className="text-[14px] font-semibold tracking-[-0.01em] no-underline"
            style={{ color: p.color }}
          >
            {p.hubCta} →
          </a>
        </Card>
      ))}
    </ul>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/sections/services-mobile.tsx
git commit -m "feat(services): mobile fallback — 3 expanded cards, all child links visible"
```

---

## Task 4: Trefoil scaffold (client component, static — no state yet)

**Files:**
- Create: `components/sections/services-trefoil.tsx`

This task ships a desktop-only static trefoil + accordion layout. Web3 hard-coded as active. No interaction. Verifies layout and SVG geometry work before adding state in Task 5.

- [ ] **Step 1: Create the trefoil scaffold**

```tsx
'use client'

import { pillars } from '@/components/sections/services-data'
import { PillarGlyph } from '@/components/sections/services-glyphs'

type Props = {
  className?: string
}

// Trefoil geometry: hub at (250, 250), spoke length 160, angles 270° (top), 30° (lower-right), 150° (lower-left)
// All values in SVG userspace (500x500 viewBox).
const HUB = { x: 250, y: 250 }
const SPOKE_LENGTH = 160
const NODE_OFFSETS = {
  web3: { x: HUB.x, y: HUB.y - SPOKE_LENGTH },                                  // top
  'ai-agents': { x: HUB.x - SPOKE_LENGTH * Math.cos(Math.PI / 6), y: HUB.y + SPOKE_LENGTH * Math.sin(Math.PI / 6) }, // lower-left (~150°)
  'product-studio': { x: HUB.x + SPOKE_LENGTH * Math.cos(Math.PI / 6), y: HUB.y + SPOKE_LENGTH * Math.sin(Math.PI / 6) }, // lower-right (~30°)
}

export function ServicesTrefoil({ className = '' }: Props) {
  // Static placeholder: Web3 active, no state, no clicks.
  const activeId = 'web3'

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-[48px] ${className}`}>
      {/* Left: trefoil visual */}
      <div className="relative aspect-square max-h-[520px] w-full">
        <svg
          viewBox="0 0 500 500"
          className="w-full h-full"
          aria-hidden="true"
        >
          {/* Ground plane */}
          <defs>
            <radialGradient id="services-ground" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#204AF8" stopOpacity="0.04" />
              <stop offset="60%" stopColor="#204AF8" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect x="0" y="0" width="500" height="500" fill="url(#services-ground)" />

          {/* Spokes */}
          {pillars.map((p) => {
            const node = NODE_OFFSETS[p.id]
            return (
              <line
                key={`spoke-${p.id}`}
                x1={HUB.x}
                y1={HUB.y}
                x2={node.x}
                y2={node.y}
                stroke="#204AF8"
                strokeWidth="1"
                strokeDasharray="4 6"
                strokeOpacity={p.id === activeId ? 0.9 : 0.3}
              />
            )
          })}

          {/* Hub: brand-blue dot + glow ring */}
          <circle cx={HUB.x} cy={HUB.y} r="16" fill="#204AF8" fillOpacity="0.15" />
          <circle cx={HUB.x} cy={HUB.y} r="8" fill="#204AF8" />

          {/* Nodes (with glyphs nested via foreignObject for HTML/SVG composition) */}
          {pillars.map((p) => {
            const node = NODE_OFFSETS[p.id]
            const isActive = p.id === activeId
            return (
              <foreignObject
                key={`node-${p.id}`}
                x={node.x - 40}
                y={node.y - 40}
                width="80"
                height="80"
              >
                <PillarGlyph pillarId={p.id} active={isActive} primed={true} />
              </foreignObject>
            )
          })}
        </svg>
      </div>

      {/* Right: accordion (static, Web3 expanded) */}
      <div className="flex flex-col">
        {pillars.map((p) => {
          const isActive = p.id === activeId
          return (
            <div
              key={p.id}
              className={`border-b border-border-subtle last:border-b-0 ${isActive ? 'border-l-[3px] pl-[24px]' : 'border-l-0 pl-[27px]'}`}
              style={isActive ? { borderLeftColor: p.color } : undefined}
            >
              <div className="flex items-center gap-[16px] py-[20px]">
                <span className="text-[12px] font-mono text-gray-light">{p.num}</span>
                <span className="w-[8px] h-[8px] rounded-full" style={{ background: p.color }} />
                <span
                  className={`text-[18px] font-semibold tracking-[-0.02em] ${isActive ? '' : 'text-dark'}`}
                  style={isActive ? { color: p.color } : undefined}
                >
                  {p.label}
                </span>
                <span className="ml-auto text-gray-light">{isActive ? '▴' : '▾'}</span>
              </div>
              {isActive && (
                <div className="pb-[24px] pr-[8px]">
                  <h3 className="text-[20px] font-bold tracking-[-0.025em] leading-[1.2] text-dark mb-[12px]">
                    {p.headline}
                  </h3>
                  <p className="text-[14px] text-gray leading-[1.75] tracking-[-0.005em] mb-[20px]">
                    {p.body}
                  </p>
                  <ul className="flex flex-col gap-[10px] list-none p-0 m-0 mb-[20px]">
                    {p.children.map((c) => (
                      <li key={c.slug}>
                        <a
                          href={`${p.hubHref}${c.slug}/`}
                          className="group flex flex-col gap-[2px] no-underline"
                        >
                          <span className="flex items-center gap-[6px] text-[14px] font-semibold text-dark">
                            {c.name}
                            <span aria-hidden="true">→</span>
                          </span>
                          <span className="text-[13px] text-gray leading-[1.5]">
                            {c.description}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                  <a
                    href={p.hubHref}
                    className="text-[14px] font-semibold tracking-[-0.01em] no-underline"
                    style={{ color: p.color }}
                  >
                    {p.hubCta} →
                  </a>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Wire into `services.tsx` minimally for visual check**

Edit `components/sections/services.tsx` (full rewrite — see Task 8 for final form; this is a stepping stone):

```tsx
import { Section } from '@/components/ui/section'
import { Eyebrow } from '@/components/ui/eyebrow'
import { ServicesTrefoil } from '@/components/sections/services-trefoil'

export function ServicesSection() {
  return (
    <Section bg="subtle" maxWidth="wide" id="services">
      <div className="text-center max-w-[720px] mx-auto mb-[48px]">
        <Eyebrow as="p">What we build</Eyebrow>
        <h2 className="mt-[16px] text-[clamp(32px,4vw,52px)] font-bold tracking-[-0.035em] leading-[1.05] text-dark">
          A small, senior team. Three pillars. End to end.
        </h2>
        <p className="mt-[20px] text-[16px] text-gray leading-[1.65] tracking-[-0.01em]">
          We build what large agencies under-deliver and freelancers can't architect — across Web3 protocols, AI agents, and SaaS products. One team takes you from spec to production.
        </p>
      </div>
      <ServicesTrefoil />
    </Section>
  )
}
```

- [ ] **Step 3: Run dev server and visually verify**

Run: `pnpm dev`
Open: `http://localhost:3000/#services`
Expected:
- Section renders with eyebrow + H2 + body lead centered above.
- Trefoil visual on left at desktop width: hub at center, 3 dashed spokes radiating, 3 glyphs at spoke tips (Web3 top in blue at full opacity, AI lower-left in green at 40% opacity, Product Studio lower-right in orange at 40% opacity).
- Accordion on right: Web3 row expanded with H3 + body + 7 child links + CTA. Other 2 rows collapsed.
- No console errors.

- [ ] **Step 4: Confirm scanning hierarchy on desktop**

What the user sees on first scroll-in (in priority order):
1. **Eyebrow + H2 first** — `What we build` / `A small, senior team. Three pillars. End to end.` Centered, bounded to 720px. The H2 is the load-bearing message; reader-on-autopilot must catch this even if they don't scroll into the trefoil.
2. **Body lead second** — bridge from Problem ("We build what large agencies under-deliver…"). Same column as H2.
3. **Trefoil + active accordion panel third** — left visual + right H3 + body + child links — these compete for attention but the active accordion's H3 reinforces the H2's message at smaller scale, and the visual gives the section its signature.
4. **Inactive accordion rows fourth** — collapsed, low-contrast.
5. **Each child-service link fifth** — only after the user engages with the active panel.

If on visual review the trefoil pulls focus away from the H2 (i.e., the visual reads as the headline rather than supporting it), reduce trefoil saturation 10%. Default ships as-is.

- [ ] **Step 5: Commit**

```bash
git add components/sections/services-trefoil.tsx components/sections/services.tsx
git commit -m "feat(services): trefoil scaffold + accordion (static, Web3 hard-coded active)"
```

---

## Task 5: State + click handlers (sync visual ↔ accordion)

**Files:**
- Modify: `components/sections/services-trefoil.tsx`

- [ ] **Step 1: Add state + click handlers**

Replace the body of `ServicesTrefoil` with:

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { pillars } from '@/components/sections/services-data'
import type { PillarId } from '@/components/sections/services-data'
import { PillarGlyph } from '@/components/sections/services-glyphs'

type Props = {
  className?: string
}

const HUB = { x: 250, y: 250 }
const SPOKE_LENGTH = 160
const NODE_OFFSETS: Record<PillarId, { x: number; y: number }> = {
  web3: { x: HUB.x, y: HUB.y - SPOKE_LENGTH },
  'ai-agents': { x: HUB.x - SPOKE_LENGTH * Math.cos(Math.PI / 6), y: HUB.y + SPOKE_LENGTH * Math.sin(Math.PI / 6) },
  'product-studio': { x: HUB.x + SPOKE_LENGTH * Math.cos(Math.PI / 6), y: HUB.y + SPOKE_LENGTH * Math.sin(Math.PI / 6) },
}

export function ServicesTrefoil({ className = '' }: Props) {
  // activeId starts null so the assembly animation does NOT fire during the parent <Section>'s
  // <Reveal> fade-in (opacity 0→1, 400ms). IntersectionObserver flips it to 'web3' 600ms after
  // the section enters viewport — same pattern as components/sections/phrase-stamp.tsx.
  const [activeId, setActiveId] = useState<PillarId | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            observer.unobserve(entry.target)
            window.setTimeout(() => setActiveId('web3'), 600)
          }
        }
      },
      { rootMargin: '0px 0px -50px 0px', threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // primed = true after the IntersectionObserver fires; controls whether glyphs render visible at all
  // (pre-mount → opacity 0; primed-but-inactive → opacity 0.4; primed-and-active → opacity 1).
  const primed = activeId !== null

  return (
    <div ref={rootRef} className={`grid grid-cols-1 lg:grid-cols-2 gap-[48px] ${className}`}>
      {/* Left: trefoil visual */}
      <div className="relative aspect-square max-h-[520px] w-full">
        <svg viewBox="0 0 500 500" className="w-full h-full">
          <defs>
            <radialGradient id="services-ground" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#204AF8" stopOpacity="0.04" />
              <stop offset="60%" stopColor="#204AF8" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect x="0" y="0" width="500" height="500" fill="url(#services-ground)" aria-hidden="true" />

          {pillars.map((p) => {
            const node = NODE_OFFSETS[p.id]
            const isActive = p.id === activeId
            return (
              <line
                key={`spoke-${p.id}`}
                x1={HUB.x}
                y1={HUB.y}
                x2={node.x}
                y2={node.y}
                stroke="#204AF8"
                strokeDasharray="4 6"
                className={`services-spoke ${isActive ? 'services-spoke-active' : 'services-spoke-inactive'}`}
                aria-hidden="true"
              />
            )
          })}

          <circle cx={HUB.x} cy={HUB.y} r="16" fill="#204AF8" fillOpacity="0.15" aria-hidden="true" />
          <circle cx={HUB.x} cy={HUB.y} r="8" fill="#204AF8" aria-hidden="true" />

          {pillars.map((p) => {
            const node = NODE_OFFSETS[p.id]
            const isActive = p.id === activeId
            return (
              <foreignObject
                key={`node-${p.id}`}
                x={node.x - 40}
                y={node.y - 40}
                width="80"
                height="80"
                style={{ overflow: 'visible' }}
              >
                <button
                  type="button"
                  onClick={() => setActiveId(p.id)}
                  aria-label={`Activate ${p.label} pillar`}
                  className="services-node-btn w-full h-full bg-transparent border-0 p-0 cursor-pointer focus:outline-none rounded-full"
                >
                  <PillarGlyph pillarId={p.id} active={isActive} primed={primed} />
                </button>
              </foreignObject>
            )
          })}
        </svg>
      </div>

      {/* Right: accordion */}
      <div className="flex flex-col" role="tablist" aria-orientation="vertical">
        {pillars.map((p) => {
          const isActive = p.id === activeId
          const panelId = `services-panel-${p.id}`
          const tabId = `services-tab-${p.id}`
          return (
            <div
              key={p.id}
              className={`border-b border-border-subtle last:border-b-0 ${isActive ? 'border-l-[3px] pl-[24px]' : 'border-l-0 pl-[27px]'}`}
              style={isActive ? { borderLeftColor: p.color } : undefined}
            >
              <button
                type="button"
                role="tab"
                id={tabId}
                aria-selected={isActive}
                aria-controls={panelId}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveId(p.id)}
                className="w-full flex items-center gap-[16px] py-[20px] bg-transparent border-0 cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                <span className="text-[12px] font-mono text-gray-light">{p.num}</span>
                <span className="w-[8px] h-[8px] rounded-full" style={{ background: p.color }} />
                <span
                  className="text-[18px] font-semibold tracking-[-0.02em] text-dark"
                  style={isActive ? { color: p.color } : undefined}
                >
                  {p.label}
                </span>
                <span className="ml-auto text-gray-light" aria-hidden="true">{isActive ? '▴' : '▾'}</span>
              </button>
              {isActive && (
                <div
                  role="tabpanel"
                  id={panelId}
                  aria-labelledby={tabId}
                  className="pb-[24px] pr-[8px]"
                >
                  <h3 className="text-[20px] font-bold tracking-[-0.025em] leading-[1.2] text-dark mb-[12px]">
                    {p.headline}
                  </h3>
                  <p className="text-[14px] text-gray leading-[1.75] tracking-[-0.005em] mb-[20px]">
                    {p.body}
                  </p>
                  <ul className="flex flex-col gap-[10px] list-none p-0 m-0 mb-[20px]">
                    {p.children.map((c) => (
                      <li key={c.slug}>
                        <a
                          href={`${p.hubHref}${c.slug}/`}
                          className="group flex flex-col gap-[2px] no-underline"
                        >
                          <span className="flex items-center gap-[6px] text-[14px] font-semibold text-dark">
                            {c.name}
                            <span aria-hidden="true">→</span>
                          </span>
                          <span className="text-[13px] text-gray leading-[1.5]">
                            {c.description}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                  <a
                    href={p.hubHref}
                    className="text-[14px] font-semibold tracking-[-0.01em] no-underline"
                    style={{ color: p.color }}
                  >
                    {p.hubCta} →
                  </a>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify first-paint sequencing + click sync in browser**

Run: `pnpm dev`
Open: `http://localhost:3000/#services`
Expected on first scroll-in:
- Section fades in via global `<Reveal>` (400ms). All 3 glyphs are at `opacity 0` during this phase.
- ~600ms after the section enters viewport, `activeId` flips from `null` to `'web3'`. All 3 glyphs become visible (Web3 at full saturation, AI + Product Studio at 40% ghosted). Web3's assembly animation plays — but only after the parent fade has settled, so the assembly is visible rather than swallowed by it.
- Click AI Agents node (lower-left green glyph) → AI Agents accordion row expands, Web3 collapses, AI glyph saturates, Web3 glyph desaturates.
- Click Product Studio accordion row → Product Studio panel expands, orange glyph in trefoil saturates.
- All three nodes click correctly. All three rows click correctly. Clicks from either side stay in sync.
- Refresh the page mid-scroll (so Services is below the fold) → glyphs stay invisible until the user scrolls down to the section. First reveal is the only one — subsequent re-scroll-into-view does NOT replay the IntersectionObserver delay.
- No console errors. No `aria-pressed` attribute on node buttons (only `aria-label`).

- [ ] **Step 3: Commit**

```bash
git add components/sections/services-trefoil.tsx
git commit -m "feat(services): activePillar state + IntersectionObserver-gated first-paint sync"
```

---

## Task 6: Motion grammar (CSS animations + reduced-motion)

**Files:**
- Modify: `components/sections/services-trefoil.tsx`

- [ ] **Step 1: Add reduced-motion detection at component top**

Inside `ServicesTrefoil`, alongside the existing `useState` for `activeId`:

```tsx
const [reducedMotion, setReducedMotion] = useState(false)

useEffect(() => {
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
  setReducedMotion(mql.matches)
  const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
  mql.addEventListener('change', handler)
  return () => mql.removeEventListener('change', handler)
}, [])
```

- [ ] **Step 2: Add inline `<style precedence>` block for spoke flow + assembly animations**

At the top of the returned JSX, before the outer `<div ref={rootRef}>`:

```tsx
return (
  <>
    {/*
      precedence is required by React 19 for hoisting + dedup. Without it, the <style> block re-mounts
      on every render and CSS rules race during hydration. With precedence, React inserts the styles into
      <head> once and reuses them. Match the same precedence value across all client-rendered <style>
      blocks if there are others; "default" is fine for one-off section-local CSS.
    */}
    <style precedence="default">{`
      .services-spoke {
        stroke-dasharray: 4 6;
        animation: services-spoke-flow 3s linear infinite;
        transition: stroke-opacity 200ms ease-out, stroke-width 200ms ease-out;
      }
      .services-spoke-active   { stroke-opacity: 0.9; stroke-width: 1.5; }
      .services-spoke-inactive { stroke-opacity: 0.3; stroke-width: 1; }
      @keyframes services-spoke-flow {
        from { stroke-dashoffset: 0; }
        to   { stroke-dashoffset: -10; }
      }
      [data-reduced-motion="true"] .services-spoke { animation: none; }

      /* Assembly animation: only fires when primed=true AND active=true AND not reduced-motion.
         The primed gate keeps the assembly from playing during the parent <Reveal> fade-in. */
      [data-primed="true"][data-active="true"][data-reduced-motion="false"] {
        animation: services-glyph-in 700ms cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes services-glyph-in {
        from { transform: scale(0.92); }
        to   { transform: scale(1); }
      }

      /* Focus-visible fallback: focus ring on a button inside <foreignObject> can clip oddly.
         Apply outline directly to the SVG glyph via the button's :focus-visible pseudo-class. */
      .services-node-btn:focus-visible svg {
        outline: 2px solid var(--color-brand);
        outline-offset: 4px;
        border-radius: 50%;
      }
    `}</style>
    <div
      ref={rootRef}
      data-reduced-motion={reducedMotion}
      className={`grid grid-cols-1 lg:grid-cols-2 gap-[48px] ${className}`}
    >
      {/* ... rest unchanged from Task 5 ... */}
    </div>
  </>
)
```

- [ ] **Step 3: Confirm spoke and node JSX already references the new classes**

Task 5's spoke `<line>` already uses `className={\`services-spoke ${isActive ? 'services-spoke-active' : 'services-spoke-inactive'}\`}` and the node `<button>` uses `className="services-node-btn ..."`. The CSS in Step 2 picks them up. No JSX changes needed in this step — verify by inspection.

- [ ] **Step 4: Pass `reducedMotion` through to glyphs**

In the `<PillarGlyph>` call inside the node `<button>`, add the `reducedMotion` prop:

```tsx
<PillarGlyph pillarId={p.id} active={isActive} primed={primed} reducedMotion={reducedMotion} />
```

- [ ] **Step 5: Verify motion in browser**

Run: `pnpm dev`
Open: `http://localhost:3000/#services`
Expected:
- Spokes have a slow ambient dashed-particle flow (3s loop, very subtle).
- Click any inactive node → previously-active glyph fades to 40% opacity, newly-active glyph saturates and re-mounts with a brief scale-up assembly animation (~600ms).
- Spoke connecting to the active node is at 0.9 opacity; others at 0.3.
- All transitions smooth, no jank.

- [ ] **Step 6: Verify reduced-motion**

In Chrome DevTools → Rendering tab → Emulate CSS prefers-reduced-motion: reduce.
Expected:
- Spoke flow stops (no dashed-particle travel).
- Click any node → state still flips, but no fade/saturate animation, no assembly animation. Instant.
- No console errors.

- [ ] **Step 7: Commit**

```bash
git add components/sections/services-trefoil.tsx
git commit -m "feat(services): motion grammar — spoke flow loop, assembly on activation, reduced-motion respect"
```

---

## Task 7: Accessibility — keyboard navigation

**Files:**
- Modify: `components/sections/services-trefoil.tsx`

- [ ] **Step 1: Add keyboard handler to the tablist**

Inside `ServicesTrefoil`, add a keyboard handler:

```tsx
const handleTabKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
  if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return
  e.preventDefault()
  const idx = pillars.findIndex((p) => p.id === activeId)
  let next = idx
  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (idx + 1) % pillars.length
  if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (idx - 1 + pillars.length) % pillars.length
  if (e.key === 'Home') next = 0
  if (e.key === 'End') next = pillars.length - 1
  setActiveId(pillars[next].id)
  // Move focus to the newly-active tab button
  const newTabId = `services-tab-${pillars[next].id}`
  const el = document.getElementById(newTabId)
  el?.focus()
}
```

Then attach to the tablist `<div>`:

```tsx
<div className="flex flex-col" role="tablist" aria-orientation="vertical" onKeyDown={handleTabKeyDown}>
```

- [ ] **Step 2: Verify keyboard nav**

Run: `pnpm dev`
Tab into the section until focus lands on an accordion row button.
Expected:
- Tab lands on the active row's button (Web3 by default — the only one with `tabIndex=0`).
- ArrowDown → AI Agents activates, focus moves to AI Agents row button.
- ArrowDown → Product Studio activates, focus moves.
- ArrowDown → wraps back to Web3.
- ArrowUp → reverses.
- Home → Web3, End → Product Studio.
- Tab from active row → moves into the panel content (first child link, then through child links + CTA).
- Visual nodes also receive focus when Tab-cycled (one ring per node when focused).

- [ ] **Step 3: Verify with screen reader (manual)**

Enable VoiceOver (macOS: Cmd+F5).
Expected announcements:
- On accordion focus: "Web3 / Blockchain, tab, selected, 1 of 3" or similar.
- On node button focus: "Activate Web3 / Blockchain pillar, button" — **no "pressed" state**, since `aria-pressed` was deliberately omitted (the tablist's `aria-selected` is the canonical state idiom; double-state-via-two-idioms confuses AT users).
- ArrowDown announces newly-active tab.

If not on macOS, skip this step but document it as a known manual verification.

- [ ] **Step 4: Commit**

```bash
git add components/sections/services-trefoil.tsx
git commit -m "feat(services): keyboard nav (arrow keys + Home/End), focus management, ARIA tablist"
```

---

## Task 8: Top-level composition + page integration

**Files:**
- Modify: `components/sections/services.tsx`

- [ ] **Step 1: Final form of `services.tsx`**

```tsx
import { Section } from '@/components/ui/section'
import { Eyebrow } from '@/components/ui/eyebrow'
import { ServicesTrefoil } from '@/components/sections/services-trefoil'
import { ServicesMobile } from '@/components/sections/services-mobile'

export function ServicesSection() {
  return (
    <Section bg="subtle" maxWidth="wide" id="services">
      <div className="text-center max-w-[720px] mx-auto mb-[48px]">
        <Eyebrow as="p">What we build</Eyebrow>
        <h2 className="mt-[16px] text-[clamp(32px,4vw,52px)] font-bold tracking-[-0.035em] leading-[1.05] text-dark">
          A small, senior team. Three pillars. End to end.
        </h2>
        <p className="mt-[20px] text-[16px] text-gray leading-[1.65] tracking-[-0.01em]">
          We build what large agencies under-deliver and freelancers can't architect — across Web3 protocols, AI agents, and SaaS products. One team takes you from spec to production.
        </p>
      </div>
      <ServicesTrefoil className="hidden lg:grid" />
      <ServicesMobile className="lg:hidden" />
    </Section>
  )
}
```

Note: `ServicesTrefoil` uses `hidden lg:grid` (not `hidden lg:block`) because its root is a `grid` container.

- [ ] **Step 2: Verify `app/page.tsx` import unchanged**

Run: `grep -n ServicesSection app/page.tsx`
Expected: existing import line (likely `import { ServicesSection } from '@/components/sections/services'` and a `<ServicesSection />` JSX usage). No change needed since export name is preserved.

- [ ] **Step 3: Visual verify at 3 viewport widths**

Run: `pnpm dev`

At 1440px (desktop):
- 50/50 split visible. Trefoil left, accordion right. Mobile fallback hidden.
- Web3 active on first paint. Spoke flow animating.

At 1023px (just below `lg`):
- Trefoil hidden. 3 stacked cards rendered, each with full content + child links.
- Section header still centered above.

At 375px (mobile):
- 3 stacked cards, comfortable padding (`<Card variant="featured">` gives `p-[40px]` per master plan).
- All child links visible, all tappable.
- No horizontal scroll.

- [ ] **Step 4: Verify all 14 child links present in static HTML (SEO gate)**

The mobile-fallback DOM is the **canonical SEO source**. Reasoning: Google's crawler is mobile-first; it sees the `<ServicesMobile>` markup (display:block on viewports ≤1023px in its rendering pipeline). Both `<ServicesTrefoil>` and `<ServicesMobile>` render server-side; the desktop trefoil is `display:none` to mobile crawlers but the mobile fallback always emits all 14 child links + 3 hub CTAs in static markup with full anchor text and 1-line descriptions. No JS interaction required to discover the URLs.

Run: `curl -s http://localhost:3000/ > /tmp/page.html && grep -oE 'href="/services/[^"]+"' /tmp/page.html | sort -u | wc -l`
Expected: **≥ 17 unique URLs** (3 hub URLs + 14 child URLs).

Then `grep -E '/services/(web3|ai-agents|product-studio)/[a-z-]+/?"' /tmp/page.html | wc -l` — expected ≥ 14 child link occurrences in the body.

In DevTools Elements tab, with viewport at 375px (mobile), search the rendered Services section. Confirm: 3 cards, each fully expanded, all 14 child `<a href>` tags rendered with anchor-text matching the child names (not "Read more" or icon-only).

- [ ] **Step 5: Confirm section background follows master plan rhythm**

Check that the section above (Problem) is white (`bg-bg`) and Services is `bg-bg-subtle`. Confirm next section (Why Us) is white. Visual rhythm holds.

- [ ] **Step 6: Mobile stability check (no CLS, no flicker)**

In Chrome DevTools, set viewport to 375px. Run Performance → Record → reload page. Observe:
- **Cumulative Layout Shift (CLS) on the Services section: 0** during initial load + global `<Reveal>` fade-in. The mobile fallback is fully server-rendered; no client component runs, so no hydration-driven layout change.
- **No flicker** — cards fade in via parent `<Reveal>` (single 400ms opacity transition, no internal stagger).
- All 14 child links visible from first paint.

If CLS > 0.05 on this section: investigate. Most likely cause = images or icons inside child-link rows loading async. Plan ships with no images in this section, so CLS should be 0.

- [ ] **Step 7: Commit**

```bash
git add components/sections/services.tsx
git commit -m "feat(services): top-level composition — desktop trefoil + mobile fallback, page integration"
```

---

## Task 9: Placeholder service pages (17 stubs)

Per the dead-link policy (locked decision #14): all 17 URLs referenced from the Services section get stub pages with `noindex`. Real content swaps in per service in future sessions. Without this task, every link click is a 404 and search engines see soft-404 across 17 URLs.

**Files:**
- Create: `app/services/[pillar]/page.tsx` — pillar hub page (3 hubs)
- Create: `app/services/[pillar]/[slug]/page.tsx` — individual service page (14 services)

Both routes use Next.js dynamic routing + `generateStaticParams` so all 17 pages are statically generated at build time.

- [ ] **Step 1: Create pillar hub page**

```tsx
// app/services/[pillar]/page.tsx
import { notFound } from 'next/navigation'
import { pillars } from '@/components/sections/services-data'
import type { Metadata } from 'next'

type Params = { pillar: string }

export async function generateStaticParams(): Promise<Params[]> {
  return pillars.map((p) => ({ pillar: p.id }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { pillar } = await params
  const p = pillars.find((x) => x.id === pillar)
  if (!p) return { robots: { index: false, follow: false } }
  return {
    title: `${p.label} — Metaborong`,
    description: `${p.headline}. Coming soon.`,
    robots: { index: false, follow: false },
  }
}

export default async function PillarHubPage({ params }: { params: Promise<Params> }) {
  const { pillar } = await params
  const p = pillars.find((x) => x.id === pillar)
  if (!p) notFound()
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-[640px] text-center">
        <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-gray-light mb-4" style={{ color: p.color }}>
          {p.label}
        </p>
        <h1 className="text-[clamp(32px,4vw,52px)] font-bold tracking-[-0.035em] leading-[1.05] text-dark mb-6">
          {p.headline}
        </h1>
        <p className="text-[16px] text-gray leading-[1.65] mb-8">{p.body}</p>
        <p className="text-[14px] text-gray-light">
          Detailed service pages launching soon.{' '}
          <a href="/" className="underline hover:text-dark">Back to home</a>
        </p>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Create individual service page**

```tsx
// app/services/[pillar]/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { pillars } from '@/components/sections/services-data'
import type { Metadata } from 'next'

type Params = { pillar: string; slug: string }

export async function generateStaticParams(): Promise<Params[]> {
  return pillars.flatMap((p) =>
    p.children.map((c) => ({ pillar: p.id, slug: c.slug }))
  )
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { pillar, slug } = await params
  const p = pillars.find((x) => x.id === pillar)
  const c = p?.children.find((x) => x.slug === slug)
  if (!p || !c) return { robots: { index: false, follow: false } }
  return {
    title: `${c.name} — Metaborong`,
    description: `${c.description} Coming soon.`,
    robots: { index: false, follow: false },
  }
}

export default async function ServicePage({ params }: { params: Promise<Params> }) {
  const { pillar, slug } = await params
  const p = pillars.find((x) => x.id === pillar)
  const c = p?.children.find((x) => x.slug === slug)
  if (!p || !c) notFound()
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-[640px] text-center">
        <p className="text-[11px] font-bold tracking-[0.1em] uppercase mb-4" style={{ color: p.color }}>
          {p.label}
        </p>
        <h1 className="text-[clamp(28px,3.5vw,44px)] font-bold tracking-[-0.03em] leading-[1.1] text-dark mb-6">
          {c.name}
        </h1>
        <p className="text-[16px] text-gray leading-[1.65] mb-8">{c.description}</p>
        <p className="text-[14px] text-gray-light">
          Detailed service page launching soon.{' '}
          <a href={p.hubHref} className="underline hover:text-dark">Back to {p.label}</a>{' · '}
          <a href="/" className="underline hover:text-dark">Home</a>
        </p>
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Build + verify all 17 pages generate**

Run: `pnpm build`
Expected output includes (in the build summary):
- `○ /services/web3` static
- `○ /services/ai-agents` static
- `○ /services/product-studio` static
- 14 individual service routes, all static

Run: `pnpm dev` and click through 3-4 random links from the Services section. Each should land on a clean page with the pillar tag, name, "Coming soon" line, and back link. No 404s.

- [ ] **Step 4: Verify noindex headers**

Run: `curl -sI http://localhost:3000/services/web3/defi-protocol-development | grep -i x-robots-tag`
Expected: `X-Robots-Tag: noindex, nofollow` (or equivalent — Next.js may emit via meta tag instead; check page source for `<meta name="robots" content="noindex,nofollow">`).

- [ ] **Step 5: Commit**

```bash
git add app/services/
git commit -m "feat(services): noindex stub pages for all 17 service URLs (3 hubs + 14 children)"
```

---

## Task 10: `/design-shotgun` integration verification (collapsed)

`/design-shotgun` ran before this plan was written; the approved C-variant ("Atmospheric Depth") is already baked into Task 2 (glyph SVG bodies) and Task 4 (ground plane radial-gradient + per-glyph defs). This task is a single verification step.

**Files:** none modified.

- [ ] **Step 1: Confirm approved.json exists and is referenced correctly**

Run: `test -f ~/.gstack/projects/Anyx30-Metaborong-Portfolio/designs/section-services-trefoil-20260504/approved.json && echo OK || echo MISSING`
Expected: `OK`.

Confirm the spec at `docs/superpowers/specs/2026-05-04-section-services-design.md` Reference Artifacts section names this file. If not, add it.

- [ ] **Step 2: Visual diff against the visual-companion**

Open the visual companion: `open ~/.gstack/projects/Anyx30-Metaborong-Portfolio/designs/section-services-trefoil-20260504/visual-companion.html`. Compare Variant C (rightmost panel) against the live `http://localhost:3000/#services` Services section in the desktop view. They should match — same hex lattice, same halo + dots + arcs on AI, same stacked planes on Product Studio, same dashed brand-blue spokes, same hub dot + ring, same radial-gradient ground tint.

If they don't match, investigate which glyph drifted (most likely cause: the soft-shadow filter not resolving across the foreignObject boundary — verify per-glyph `<defs>` is present in each glyph SVG, not just the parent trefoil).

- [ ] **Step 3: No commit needed.** Verification only.

---

## Task 11: Final verification pass

- [ ] **Step 1: Type-check**

Run: `pnpm tsc --noEmit`
Expected: PASS — no errors.

- [ ] **Step 2: Build**

Run: `pnpm build`
Expected: build succeeds. 17 service pages statically generated. No client/server boundary warnings about `services-mobile.tsx` (server) or `services-trefoil.tsx` (client).

- [ ] **Step 3: Lighthouse / DevTools quick check**

In DevTools, on `http://localhost:3000/`:
- Performance tab: section renders without CLS during the global `<Reveal>` enter.
- Accessibility tree: tablist + tab + tabpanel structure is present and labeled correctly.
- No `console` errors / warnings introduced by Services section.

- [ ] **Step 4: Cross-section sanity check**

Scroll the homepage end-to-end:
- Hero orb still works (the new SVG canvas in Services should not interfere).
- Section background rhythm: Hero (subtle) → Trust (white) → Problem (white) → Services (subtle) → Why Us (white). Confirm.
- Problem signature still fires correctly (PhraseStamp still works — touched no shared file).
- Click 3-5 child service links → each lands on a noindex stub page. Back-links work.

- [ ] **Step 5: Update CHANGELOG.md**

Add a Session 7 entry at the top of `CHANGELOG.md` documenting:
- New files: services-data, services-glyphs, services-trefoil, services-mobile, app/services/[pillar]/page.tsx, app/services/[pillar]/[slug]/page.tsx.
- Replaced: services.tsx (full rewrite — was inline-styled 1px-gap-bordered hack).
- Workflow chain (this session ran reversed order): brainstorming → writing-plans → /plan-design-review (8/10 → 9.5+/10 after fixes) → /design-shotgun → implementation.
- Visual exploration tool: **visual-companion HTML/CSS** (hand-authored SVG), not gstack design binary. Same fallback rationale as Problem signature in Session 6 — gstack design binary needs OPENAI_API_KEY which wasn't configured; sub-pixel geometry is better authored directly anyway. Approved C-variant ("Atmospheric Depth") locked.
- gstack approved.json path: `~/.gstack/projects/Anyx30-Metaborong-Portfolio/designs/section-services-trefoil-20260504/approved.json`.
- 17 noindex placeholder pages shipped — real content for hubs + 14 services queued for later sessions.

- [ ] **Step 6: Update memory**

Update `~/.claude/projects/-Users-zephyr-Claude-Workspace-projects-mb-website/memory/project-metaborong-website.md`:
- "Build state" section: add Session 7 entry summarizing Services section signature shipped + noindex stubs in place.

Update `~/.claude/projects/-Users-zephyr-Claude-Workspace-projects-mb-website/memory/visual-direction-and-workflow.md`:
- "Section 5 — DONE" entry for Services with calibration data: hub-and-spoke trefoil, SVG (not Three.js), `/design-shotgun` ran via visual-companion HTML/CSS path (NOT gstack design binary — second time this fallback was used, suggesting hand-authored SVG should be the default for sub-pixel-geometry sections regardless of API key state), IntersectionObserver-gated first-paint pattern (avoids assembly being swallowed by parent `<Reveal>` fade).

- [ ] **Step 7: Final commit**

```bash
git add CHANGELOG.md
git commit -m "docs(services,changelog): log Session 7 — Services trefoil + 17 stub pages shipped"
```

---

## Self-review checklist (run after writing all tasks)

**Spec coverage:**
- ✅ Pattern (click-to-sync hub-and-spoke) — Tasks 4 + 5.
- ✅ Topology (trefoil on iso ground plane, 3 spokes 120°) — Task 4.
- ✅ Per-pillar SVG family (abstract structural) — Tasks 2 + 10.
- ✅ SVG-not-Three.js — locked decision #2 + Task 2.
- ✅ Initial active state (Web3, IntersectionObserver-gated to avoid assembly being swallowed by `<Reveal>`) — Task 5 + locked decision #1.
- ✅ Click-only (no `aria-pressed` on nodes — tablist's `aria-selected` is canonical) — Task 5 + locked decision #4.
- ✅ No section pagination band — locked decision #10.
- ✅ Hub treatment (dot, locked — no implementation-time decision) — locked decision #11.
- ✅ Layout (50/50 grid, max-h-520) — Tasks 4 + 5.
- ✅ Section header (eyebrow + h2 + body lead, centered, 720px) — Tasks 4 + 8.
- ✅ Right column accordion + child links + CTA — Tasks 4 + 5.
- ✅ Child services full list (14) — Task 1.
- ✅ Motion grammar (spoke flow + opacity/width transition + assembly + `<style precedence>` for React 19) — Task 6 + locked decision #9.
- ✅ Mobile fallback (3 expanded cards, hover-lift overridden, no CLS) — Tasks 3 + 8.
- ✅ Reduced-motion (kills loops + transitions, keeps desktop layout) — Task 6 + locked decision #7.
- ✅ Accessibility (ARIA tablist + keyboard nav, focus-ring fallback for foreignObject) — Tasks 5 + 6 + 7.
- ✅ SEO (mobile DOM = canonical source; all 14 child links in static markup) — Task 8 step 4.
- ✅ Dead-link policy (17 noindex stub pages) — Task 9 + locked decision #14.
- ✅ Verification (type-check, build, CLS, cross-section, mobile stability, dev-server) — Tasks 8 + 11.

**Placeholder scan:** No "TBD", no "TODO", no "fill in details", no deferrals.
- Glyph SVG bodies — locked, approved C-variant from `/design-shotgun` baked into Task 2.
- Ground plane treatment — locked, radial gradient (approved C-variant) baked into Task 4.
- Task 10 collapsed to a one-step visual-diff verification.

**Type consistency:** `PillarId` defined in Task 1, used in Tasks 2, 4, 5, 9. `Pillar` shape consistent across `pillars` array, `services-mobile.tsx`, `services-trefoil.tsx`, and the `app/services/` route handlers.

**No missing references:** All imports resolve to files created in earlier tasks. `<Card>`, `<Section>`, `<Eyebrow>` already exist (master plan primitives, Session 1). The `app/services/[pillar]/[slug]/page.tsx` route imports `pillars` from the same `services-data.ts` module that the homepage section uses — single source of truth for content.

---

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | — |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 0 | — | — |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | clean | score: 8/10 → 9.5/10, 14 decisions added or sharpened |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | — |

**Plan-design-review key fixes applied inline:**
- IntersectionObserver-gated first-paint (locked #1) — assembly animation no longer swallowed by parent `<Reveal>` fade.
- `primed` ladder on glyphs (locked #2) — three-state opacity prevents flicker on initial render.
- Dropped `aria-pressed` from node buttons (locked #4) — eliminates double-state announcement vs tablist's `aria-selected`.
- `<style precedence="default">` (locked #9) — React 19 hoisting + dedup safety.
- Active spoke `stroke-width: 1 → 1.5` transition (locked #13) — matches spec's "thickens slightly" language.
- Focus-visible ring fallback to outline-on-SVG (Task 6 CSS) — bypasses `<foreignObject>` clipping risk.
- Mobile Card hover-lift overridden (Task 3) — non-interactive cards no longer "lie" on narrowed-desktop hover.
- Hub treatment locked to dot (locked #11) — removes implementation-time decision.
- Mobile DOM declared canonical SEO source (Task 8 step 4) — explicit reasoning logged.
- Mobile stability check via DevTools Performance (Task 8 step 6) — CLS = 0 gate.
- Dead-link policy (locked #14) — 17 noindex stub pages added as Task 9, prevents 404 traps + soft-404 SEO penalty.
- Scanning hierarchy explicit (Task 4 step 4) — user-sees-first-second-third ordering documented.

**UNRESOLVED:** 0.
**VERDICT:** Design review CLEAR. Ready for `/design-shotgun` (visual exploration of per-pillar SVG variants + ground-plane treatment) → implementation via `/frontend-design` + `/frontend-patterns`. Eng review optional this session — section is structural/visual, no architectural decisions outside the documented primitives.
