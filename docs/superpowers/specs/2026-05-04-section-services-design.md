# Section 5 — Services: Design Spec

**Date:** 2026-05-04 (Session 7)
**Inherits:** `docs/superpowers/specs/2026-05-01-homepage-restructure-master-design.md` (Section 5 entry, Design System primitives, Visual temperament).
**Reference visual:** supermemory.ai "The Context Stack" — interactive layered visual + numbered accordion with click-to-sync. Adapted from 5 dependent layers to 3 peer pillars via a hub-and-spoke topology.

---

## Context & intent

Section 5 is the **heaviest body-section signature** in the homepage lineup. It carries three jobs:

1. **Bridge from Problem.** Problem ends on the agency-vs-freelancer trap. Services has to land Metaborong as the third option in the next visible H2 + body — the bridge function dropped from the Problem section in Session 5.
2. **Surface the 3 pillars.** Web3 / Blockchain, AI Agents, Product Studio — peers, not a dependency chain.
3. **Surface the 14 child services** for SEO + AEO. Internal links from the homepage to all 14 service pages, with anchor text containing target keywords, is the highest-leverage SEO move on the homepage.

Calibrated against the shipped Problem signature: at-rest typographic/visual state IS the signature; motion is complementary.

---

## Locked decisions

### Pattern
Click-to-sync hub-and-spoke. Two columns on `lg+`: trefoil visual on the left, numbered accordion on the right. Clicking a node OR an accordion row activates that pillar on both sides. Click-only — no hover preview.

### Topology — trefoil on isometric ground plane
- Iso ground plane sets the "studio floor" stage.
- Glowing M-mark hub at origin (sanity-check at implementation: if it reads as duplicating the Hero orb's M-mark, swap to a glowing brand-blue dot).
- 3 spokes at 120° angles (top, lower-left, lower-right). Each spoke ~140-180px, 1px brand-blue hairline with ambient `stroke-dashoffset` travel loop (~3s).
- 3 nodes at spoke tips, each a custom abstract-structural SVG glyph in its pillar color.

### Differentiation from the Hero orb
Same brand DNA (centered hub, radiating capabilities), different projection.
- Orb: spherical / dense (~394 nodes) / always-spinning.
- Services trefoil: planar / sparse (3 nodes) / static-at-rest, animates briefly on activation.

### Per-pillar SVG family — abstract structural
Custom isometric structural glyphs (not literal industry symbols, not lucide-style icons). Family direction:
- **Web3 / Blockchain** (#204AF8) — interlocking hex-lattice glyph, ~6 hex tiles connected by edges. Echoes orb DNA at small scale.
- **AI Agents** (#10b981) — radial pulse / converging-token cluster, ~5 small dots converging to a central node with faint connecting arcs.
- **Product Studio** (#F6851B) — isometric stack of 3 small planes settling on each other (a la supermemory PROFILES plinth).

Concrete shapes are placeholders — `/design-shotgun` will explore variants per pillar (AI image generation IS the right tool here per Visual Temperament, since this is composition/layout territory, not sub-pixel typography). Spec locks the **family**, not final pixels.

### Implementation tech — SVG + CSS, NOT Three.js
The "isometric" effect is a 2D illusion via SVG transforms. Three.js is the wrong tool here:
- 2D-iso glyphs are illustrations, not real 3D objects with depth.
- SVG renders in HTML markup — crawlers see structure (SEO win); `<canvas>` is invisible to crawlers.
- Hero already runs an R3F scene; adding a second WebGL context costs memory + RAF orchestration.
- `/design-shotgun` AI mockups are 2D and map directly to SVG paths.

Three.js's earned place is the Hero orb. Trefoil stays SVG.

### Initial active state
Web3 active on first paint. Brand color (#204AF8) saturated on first load reinforces brand identity; Web3 is the lead pillar in master plan ordering and the largest SEO surface (7 children).

### Click affordance
Click-only. Tap/click a node OR an accordion row to switch active. No hover preview. Cursor: pointer on nodes (~80px hit zone).

### Section chrome
**No per-section pagination band** (e.g., supermemory's `[ 2/8 ]`). Adding numbered chrome to Services alone while other body sections lack it would feel orphaned, and retrofitting all body sections conflicts with the locked "no chrome retrofits" temperament rule. If section-numbering becomes a global page system later, that is a separate session.

---

## Layout

### Section frame
- `<Section bg="subtle" maxWidth="wide">` — 1120px content cap, `bg-bg-subtle`, `py-[96px]`.
- Inherits global `<Reveal>` enter animation (opacity 0→1 + translateY 8→0, 400ms).
- Anchor: `id="services"`.

### Section header (centered, above the split)
- `<Eyebrow>What we build</Eyebrow>`
- **H2:** `A small, senior team. Three pillars. End to end.`
- **Body lead** (16px, `text-gray`, max-width 720px, centered): `We build what large agencies under-deliver and freelancers can't architect — across Web3 protocols, AI agents, and SaaS products. One team takes you from spec to production.`
- 48px gap below header (`mb-[48px]`).

### Body (50/50 grid on `lg+`)
- `lg:grid-cols-2 gap-[48px]` between columns.
- **Left column:** trefoil visual. Aspect ratio ~1:1, max-height ~520px.
- **Right column:** numbered accordion (3 rows).

---

## Left column — trefoil details

### Ground plane
Subtle iso surface — explored by `/design-shotgun`: candidates are radial gradient (low-saturation brand-blue tint on `bg-bg-subtle`), fine dot grid, sparse iso line grid, or blank with only the figure. Family note: the surface should support the figure, never compete with the SVG glyphs for attention.

### Hub at origin
- Metaborong M-mark glyph in brand blue (#204AF8), ~48px.
- Subtle ambient glow.
- Implementation flag: visually sanity-check against Hero orb's centered M-mark. If duplication is visible at scroll-by, swap to a glowing brand-blue dot.

### Spokes
- 3 spokes at 120° angles. Top → Web3. Lower-left → AI Agents. Lower-right → Product Studio.
- Each spoke: 1px brand-blue hairline, 140–180px length.
- Ambient flow: dashed-particle `stroke-dashoffset` loop traveling outward from hub, ~3s per cycle. Low contrast — must NOT be the eye's first stop.
- On activation: active spoke thickens slightly + brightens (200ms).

### Nodes
- 3 nodes at spoke tips, each a custom SVG glyph in its pillar color (~80px target zone).
- At rest: low saturation (~40% pillar color). Hovered cursor: pointer.
- Active state: full saturation + soft pillar-colored glow + assembly micro-animation plays once.
- Inactive state: ghosted outlines (lower opacity, no fill).

### Glyph family — at-rest treatment
| Pillar | Glyph | Active animation |
|---|---|---|
| Web3 / Blockchain (#204AF8) | Interlocking hex-lattice, ~6 hex tiles + connecting edges | `stroke-dashoffset` line draw-in across edges, ~600ms |
| AI Agents (#10b981) | Radial pulse + ~5 converging dots with faint arcs to central node | Single outward pulse + dot fade-in stagger, ~700ms |
| Product Studio (#F6851B) | Isometric stack of 3 small planes settling | Planes drop-and-settle bottom-up, 80ms stagger between planes, ~600ms total |

`/design-shotgun` will explore concrete variants. Spec locks family direction, not final pixels.

---

## Right column — accordion details

### Row structure (collapsed)
- `01` (gray micro, mono) + filled-circle bullet (in pillar color) + pillar title + chevron-down (right-aligned).
- 1px subtle bottom border between rows (`border-border-subtle`).
- Hit area: full row, cursor pointer.

### Active row (expanded)
- 3px brand-blue (or pillar-color) left border.
- Pillar title in pillar color.
- Chevron rotates to up.
- Expanded content slides + fades in (250ms, height + opacity).

### Active row content
1. **H3 (pillar headline)** — existing approved copy retained:
   - Web3: `Decentralised protocol engineering`
   - AI Agents: `AI systems that work while you sleep`
   - Product Studio: `SaaS products built to scale`
2. **Body paragraph** — existing approved copy retained, lightly trimmed:
   - Web3: `DeFi protocols, NFT marketplaces, crypto wallets, token launches, liquid staking, and DAO systems — built multichain.`
   - AI Agents: `Agentic pipelines, RAG applications, voice agents, generative AI, and workflow automation — from prototype to production.`
   - Product Studio: `End-to-end Web2 product builds — architecture, design, development, and deployment for startups that need a full technical team.`
3. **Child services list** (the SEO/AEO win) — flat list, each row: child name (semibold, 14px) + em-dash + 1-line description (regular, 14px gray) + small arrow `→`. Each child links to `/services/<pillar>/<slug>`. Hover lifts the link to pillar color.
4. **Main pillar CTA** at bottom — pillar-colored link with arrow, e.g., `Explore Web3 Services →` linking to `/services/web3/`.

### Child services — full list with descriptions

#### Web3 / Blockchain (7 — link target `/services/web3/<slug>`)
- **DeFi Protocol Development** — Lending, AMM, perp-DEX, and yield infrastructure built audit-ready.
- **Smart Contract Security** — Specs, audits, and post-deploy monitoring for production contracts.
- **NFT Marketplace Development** — Custom marketplaces with royalties, lazy-mint, and curation.
- **Crypto Wallet Development** — Custodial and self-custody wallets across EVM, Solana, Cosmos.
- **Token Launchpad** — Token sales, vesting, and distribution infrastructure end-to-end.
- **Liquid Staking Vaults** — LST/LRT vault systems with restaking and risk controls.
- **DAO & Governance Systems** — On-chain governance, treasury, and voting tooling.

#### AI Agents (6 — link target `/services/ai-agents/<slug>`)
- **Agentic AI Systems** — Multi-step autonomous agents that plan, tool-use, and report.
- **Generative AI Development** — Custom GenAI products beyond ChatGPT wrappers.
- **AI Workflow Automation** — Trigger-driven AI flows across your existing stack.
- **Voice Agent Integration** — Real-time voice agents for support, sales, and operations.
- **RAG & Knowledge Systems** — Retrieval pipelines that ground LLMs in your data.
- **AI Systems Integration** — Embedding LLMs into existing software and infrastructure.

#### Product Studio (1 — link target `/services/product-studio/<slug>`)
- **SaaS Product Development** — End-to-end Web2 product builds, architecture to deployment.

Slugs to be finalized in writing-plans phase (kebab-case from name unless content team specifies otherwise).

---

## Motion grammar (timing)

| Moment | Behavior |
|---|---|
| Section enter (scroll into viewport) | Inherited `<Section>` `<Reveal>`: opacity 0→1 + translateY 8→0, 400ms `cubic-bezier(0.16, 1, 0.3, 1)`, fires once 50px before viewport. |
| First paint after `<Reveal>` completes | Web3 node renders pre-saturated. ~150ms after `<Reveal>` settles, Web3's SVG plays its assembly animation once (~600ms). Spoke flow loop starts. |
| Spoke flow (ambient, while section is on-screen) | 1px brand-blue dashed hairline; `stroke-dashoffset` loop traveling hub→node, ~3s per cycle, low contrast. |
| Hub ambient | Optional gentle opacity breath on M-mark, ~4s loop, ±5%. Cut if it competes visually with the orb. |
| User clicks a different pillar | Outgoing node desaturates (200ms ease-out) + spoke dims. Incoming node saturates (200ms) + spoke brightens. Incoming SVG plays assembly animation (~600–800ms). Right-side accordion: outgoing item collapses (250ms), incoming expands (250ms). |
| Re-firing on scroll | First-paint assembly fires once per page load. Subsequent scroll-back does NOT replay it. |
| `prefers-reduced-motion: reduce` | All loops killed (spoke flow, hub breath). `<Reveal>` already respects this. State changes still work but render instantly — no transitions, no assembly animations. Click → state flips. |

---

## Mobile fallback (below `lg`, `<1024px`)

- **Trefoil hidden** (`hidden lg:block` on the visual column).
- **Right column also hidden** in its desktop accordion form (`lg:hidden` toggles to mobile stack).
- **Mobile body:** 3 stacked `<Card variant="featured">` (master plan primitive — gives the 3px pillar-color left accent automatically), `gap-6` (24px) between.
- **Each card always-expanded**, rendering the same content as the desktop active state: pillar tag (eyebrow in pillar color) → H3 → body → child-services list → main pillar CTA.
- **No click interaction** — everything is static. Each child service in the list is still a real link.
- **SEO win on mobile:** all 14 child links rendered in static markup, all visible without interaction.

**Reduced-motion on desktop** does NOT fall back to mobile layout — keep the desktop visual intact, just kill animations. Standard accessibility convention; avoids hiding the signature visual from users who can otherwise see it.

---

## Accessibility

- Trefoil + accordion are paired controls. Use ARIA `tablist` semantics: nodes act as tabs, accordion rows act as tabs (alternative entry points), expanded content is the tabpanel.
- Keyboard nav: Tab to enter the tablist, Arrow-Up/Down (or Left/Right) to switch tab, Enter/Space to activate.
- Focus rings on nodes and rows — brand-blue ring, 2px offset.
- Each child-service link has accessible text (the visible name + 1-line description, no icon-only links).
- All node SVGs have `aria-hidden="true"` (decorative); the accordion row title is the accessible label for the pillar.

---

## SEO / AEO posture

- Section is `<section id="services">` for in-page anchoring.
- All 3 pillar headings are real `<h3>` (under section `<h2>`), all 14 child services are real anchor-text links rendered in the static markup (visible by default on mobile, accordion-gated on desktop but still in the DOM on first paint).
- Child link text contains target keywords (e.g., "DeFi Protocol Development" not "Read more").
- The trefoil SVG is `aria-hidden="true"`; the accordion is the canonical content.

---

## Out of scope (deferred)

- ~~Final per-pillar SVG glyph designs~~ — **resolved** via `/design-shotgun` 2026-05-04 (approved C-variant "Atmospheric Depth"; geometry baked into plan Task 2).
- ~~Hub treatment final choice~~ — **resolved** during plan-design-review (locked decision #11: brand-blue dot + glow ring, no implementation-time decision).
- ~~Ground-plane treatment final choice~~ — **resolved** via `/design-shotgun` 2026-05-04 (radial gradient `#204AF8 @ 0.05 → 0` across 60% radius; baked into plan Task 4).
- Service page slug finalization — confirmed in writing-plans phase.
- Service hub pages (3) and individual service pages (14) — out of scope for this section.

---

## Verification (post-implementation)

- Visual: 50/50 split renders cleanly at 1024–1920px. Below `lg`, falls to 3-card stack with all child links visible.
- Click any node → matching accordion row expands; click any row → matching node activates. Synced both directions.
- Web3 active on first paint. Spoke flow visible but unobtrusive. Web3 assembly animation plays once on first scroll-into-view.
- Section background is `bg-bg-subtle`, follows master plan rhythm (Problem white → Services subtle → Why Us white).
- All 14 child links render in DOM on first paint (mobile + desktop). View-source confirms anchor-text.
- `prefers-reduced-motion: reduce` (Chrome DevTools rendering tab) → all loops + transitions killed; clicks still work.
- Keyboard nav: Tab into tablist, arrow keys switch active, Enter/Space activates. Focus rings visible.
- No `console` errors. No CLS during the section's enter animation.

---

## Reference artifacts

- Visual reference screenshots: `screenshots/supermemory-stack-{1,2,full,retrieval,connectors,profiles}.png` (captured 2026-05-04 via `/agent-browser`).
- Master plan: `docs/superpowers/specs/2026-05-01-homepage-restructure-master-design.md` (Section 5 entry, Visual temperament).
- Calibration data point: `components/sections/phrase-stamp.tsx` (Problem signature, Session 6).
- gstack taste profile inputs:
  - Problem signature (Session 6): `~/.gstack/projects/Anyx30-Metaborong-Portfolio/designs/section-problem-stamp-20260504/approved.json` — V1 hairline restraint.
  - Services trefoil (this section, 2026-05-04): `~/.gstack/projects/Anyx30-Metaborong-Portfolio/designs/section-services-trefoil-20260504/approved.json` — C-variant "Atmospheric Depth" (stroke + faint fills + soft drop-shadows + radial-gradient ground tint). Tool used: visual-companion HTML/CSS path (hand-authored SVG), not the gstack design binary — same rationale as Problem signature (sub-pixel geometry needs real-CSS fidelity).
- Visual companion file: `~/.gstack/projects/Anyx30-Metaborong-Portfolio/designs/section-services-trefoil-20260504/visual-companion.html` (3 hand-authored SVG variants A/B/C side-by-side, kept for posterity).

---

## Section 5 deviations from master plan (Session 7.5 polish pass — 2026-05-05)

After initial implementation, the at-rest design felt structurally correct but visually thin. Polish pass deviated from the locked plan in four places. None affected shared primitives, the IntersectionObserver-gated first-paint, reduced-motion behavior, or the SEO-static-markup gate.

1. **Killed the spoke-flow marching-dashes animation** (plan locked decision #9). At ~3s loop the `stroke-dashoffset` travel read as a loading indicator, which violates the Visual temperament rule "motion as punctuation, not page-wide grammar." Spokes are now solid gradient strokes (vivid at hub → soft at glyph perimeter), with a 320ms opacity/width transition on activation. Active = 0.7 opacity + 1.5px; inactive = 0.18 + 1px.
2. **Replaced the rect ground-fill with an iso-projected elliptical glow.** Plan called for `<rect>` filled with a 0.04→0 radial gradient — invisible in practice. Now an `<ellipse cx=250 cy=305 rx=195 ry=42>` with a 0.16→0 radial gradient. Anchors the figure like a stage spotlight; delivers the "Atmospheric Depth" promise the rect didn't.
3. **Layered hub.** Plan locked a flat 8px dot + 16px outer fill (locked decision #11). Replaced with a four-layer hub: 38px breathing radial-gradient glow + 14px hairline ring + 6.5px solid core + 2.5px white pinhole highlight. Hub now reads as the gravitational anchor at any zoom level. Breathing animation is 7s ease-in-out (opacity 0.85↔1, scale 1↔1.04) — much slower than a heartbeat, well below the loading-indicator threshold; still off under `prefers-reduced-motion`.
4. **Glyph SVG bodies** (plan locked decision #8 baked the approved C-variant geometry directly). Each glyph was redrawn as a confident mark instead of a wireframe diagram:
   - Web3: nested dual-hex with 45°-rotated diamond core (3 elements). Replaces the 7-hex lattice + hairline connectors that read as a CAD diagram.
   - AI Agents: ambient halo + faint outer ring + broken inner ring (intentional gap) + asymmetric satellite pair + gradient core with white pinhole (6 elements, asymmetric placement). Replaces the 5-fold-symmetric halo + 2 rings + 5 dots + 5 arcs (13 competing elements).
   - Product Studio: real iso cube with three-face gradient shading (lit top, mid-tone right, shadow left) + a single craft-highlight stroke on the lit face. Replaces three flat opacity-laddered parallelograms with no volumetric shading.
   - Glyph render size bumped 80px → 104px to give the marks proper presence relative to the 500px trefoil canvas. Spoke length shortened 160 → 150 to bring the glyphs into a tighter visual relationship with the hub.

The locked decisions in question (#8, #9, #11) were all "decided here so we don't relitigate at implementation time" calls. The plan's risk model treated them as cheap to lock; the visual outcome treated them as expensive. Future sections: implementation-time visual review remains a load-bearing gate even when the plan thinks geometry is settled.

Reference artifacts updated:
- New baseline screenshot: `/tmp/services-after-v3.png` (web3 active), `/tmp/services-ai-active.png`, `/tmp/services-ps-active.png`.
- Original `~/.gstack/projects/.../section-services-trefoil-20260504/approved.json` retained for historical reference but no longer the source of truth for shipped geometry.

---

## Section 5 deviations — Session 7.6 3D rebuild (2026-05-05)

After the 7.5 polish pass, the user reviewed live and called out:
- Hub still reads as "broken" — the 38px breathing radial glow looks like a render artifact, not a designed center.
- Spoke gradient (vivid-at-hub fade-to-node) makes the lines appear to stop short of the glyphs.
- The SVG glyphs read as static ornaments — no premium dimensionality.
- Glyph concept assignment wasn't right: Web3 should be the cube (block), Product Studio should be layered slabs (matching the nav dropdown's `Layers` icon), AI should be a neural network.

**Rebuild:**

1. **Glyphs moved off SVG to WebGL via react-three-fiber + drei.** Each glyph is now its own 104×104 R3F `<Canvas>` inside the trefoil's `<foreignObject>`. R3F + drei already in deps (hero-orb uses them); no new packages.
2. **Web3 → beveled iso cube.** `RoundedBox` (drei), `MeshStandardMaterial` (metalness 0.3, roughness 0.42, env-map intensity 0.6), orthographic camera, two directional lights (key from upper-front-right + cool fill from lower-back-left). Auto-rotates only when active. Reads as a blockchain block.
3. **AI Agents → neural network.** 4 spheres at varied 3D positions (top, left-front, right-back, bottom) connected by 5 `TubeGeometry` edges along quadratic bezier curves with a slight inward-bowed midpoint offset for organic feel. Emissive green nodes (intensity 0.18) for inner glow. Perspective camera. Slow Y-rotation always (0.15 rad/s inactive, 0.45 active) plus subtle X-axis nod via `Math.sin(t)`.
4. **Product Studio → stacked layered slabs.** 3 thin `RoundedBox` slabs (1.55×0.18×1.15) stacked with Y offset (0.42 / 0 / -0.42), three orange tones (#FFB068, #F6851B, #C56612), ascending metalness/roughness. Iso pose via `rotation={[π/7, -π/5, 0]}`. `ContactShadows` from drei underneath (opacity 0.32, blur 2.2) for real grounding. Mirrors the lucide `Layers` icon used in the nav dropdown's Product Studio entry.
5. **All marks respect `prefers-reduced-motion: reduce`** — rotation skipped when matched.
6. **Hub rebuilt.** Killed the 38px breathing radial-gradient glow + 7s breath animation entirely. Hub is now 3 layers: 11px hairline ring (0.35 opacity) + 6px solid #204AF8 core + 2px white pinhole highlight. Precise center, no smudge.
7. **Spokes rebuilt.** Killed the linear gradient (vivid-at-hub→fade-at-node, was the source of the "lines stop short" perception). Spokes are now solid #204AF8 stroke, 0.4 opacity inactive / 0.85 active, 1px / 1.5px width, full-length from hub center to node center. The 3D glyph mass covers the endpoint cleanly.
8. **Mobile fallback unchanged.** Mobile (<lg) keeps the SVG `services-glyphs.tsx` path because three R3F canvases on mobile is the wrong perf trade. SVG glyphs there were already reasonable as visual anchors at small scale.

**Lessons added to the file:**
- For sub-pixel-typography sections (Problem, glyphs as marks), hand-authored SVG remains the right call.
- For sections where the signature element is a *form/object* the user perceives spatially (cube, network, layered solid), Three.js earns its weight even at small scale — the dimensional reading carries the premium feel that flat SVG cannot deliver.
- Visual review post-implementation is load-bearing. Plan-locked decisions about geometry and motion are best treated as defaults, not contracts. The user looked at the shipped result and corrected the direction in two places (geometry + render technology); both corrections were correct.

---

## Section 5 deviations from master plan (2026-05-04, post-impl polish pass)

After implementation Tasks 1–11 shipped the plan's "Atmospheric Depth" geometry verbatim, the user reviewed the live result and called the in-canvas animations cheap. A `/frontend-design` polish pass reframed the section's aesthetic as **Swiss-engineering / technical-drawing** — the trefoil reads as an engineered diagram, not an atmospheric mood. Per-section overrides allowed under the policy locked in this session.

### Dropped (master plan said to ship; we removed)
- **Radial-gradient ground rect** (`<radialGradient id="services-ground">` over a `<rect>`). The 5%→0% blue tint was decorative, not architectural.
- **Infinite spoke-flow animation** (`stroke-dasharray: 4 6` + `stroke-dashoffset: 0 → -10` 3s linear infinite). Marching-ants ambient loops read as "loading" not "engineered."
- **`<filter id="soft-shadow">`** on every glyph. 2px Gaussian blur at 80×80 made hairlines fuzzy. Premium technical illustrations use crisp lines, not drop-shadows on small geometry.
- **Scale-up assembly animation** (`transform: scale(0.92 → 1)` 700ms). Generic "thing pops in" — replaced with stroke-draw.
- **AI Agents radial halo gradient** (`<radialGradient id="ai-halo">`). Cheap green smear; constellation reads cleaner without it.
- **Hex hairline connectors** (6 × 0.5px lines between center hex and surrounding hexes). Visual noise at glyph scale.
- **AI Agents inner ring at r=13.** 14 elements competing in 80×80 — cut to 9 with hierarchy.
- **AI Agents curved arcs** (5 × `Q`-curve paths from center to outer dots). Replaced with straight rays. Arcs imply motion which clashed with restrained-at-rest posture.
- **JS `useState` + `matchMedia` for reduced-motion.** Replaced with native `@media (prefers-reduced-motion: reduce)` block in inline `<style>`. Same outcome, no hydration cost, no client-side state.

### Added / changed (locked in this polish pass)
- **Datum baseline** — single 1px horizontal line across the full width at y=250, `#303030` stroke at 5% opacity. Reads as a technical drawing baseline.
- **Hub cluster** — outer ring (r=24, 1px brand-blue, 40% opacity) + inner ring (r=12, 1px brand-blue, 60% opacity) + 4 cardinal-axis tick marks (1px, 30% opacity, 8px arms from r=28 to r=36) + 3px solid brand-blue center dot. Reads as an engineered coordinate origin.
- **One-shot energy pulse** — separate `<line>` overlay with `stroke-dasharray: 14 486` slides hub→active-node over 720ms `cubic-bezier(0.32, 0, 0.16, 1)`, fades on exit. Re-mounts via key-bump on each activation. Single-shot, never infinite.
- **Stroke draw-on activation** — each `[data-draw]` element inside an active glyph reveals via `stroke-dashoffset` (length→0) over 620ms `cubic-bezier(0.65, 0, 0.35, 1)`. Per-element `--draw-len` CSS variable carries the path length.
- **Inactive glyph treatment** — strokes stay full-opacity but the color shifts to neutral `#9ca3af` and fills go to `none`. Active = colored + filled. Inactive = monochrome wireframe. Replaces the previous uniform `opacity 0.4` ghosting which read washed-out.
- **Web3 inner concentric hex** — at apothem ~6, 1px stroke. Locks lattice density without adding member count. Hairline connectors removed.
- **Web3 stroke weight bump** — center hex now 1.25px (was 1px). Center anchor dot 1.5r solid.
- **AI Agents instrumented points** — each of 5 outer dots paired with a 4px perpendicular tick mark along the radius normal. Reads as "instrumented sensors" rather than floating particles. Center solid dot bumped 4r → 5r.
- **Product Studio center-axis weld** — 1px vertical hairline through center from y=-22 to y=38, ties the 3 stacked planes along one structural axis.
- **Product Studio opacity ladder** — top/middle/bottom now 35%/22%/14% (was 28/18/12). More dimensional separation; top plane stroke 1.25px.
- **Spoke color discipline** — spokes are neutral `#303030` at 10% opacity at rest; the active spoke transitions to its pillar color at 85% opacity, 1.5px width. Previously all spokes were brand-blue regardless of which pillar was active, which biased the visual toward Web3.

### Why this stuck
The locked C-variant's "Atmospheric Depth" treatment (drop shadows + radial tint + dashed flow) read as ambient/decorative when shipped. The Swiss-engineering reframe reads as designed: every line carries a structural job, motion happens once and stops, and the inactive state is a legible schematic rather than a faded version of the active state. Hard constraints honored — SVG-only, ARIA tablist unchanged, IntersectionObserver-gated first paint unchanged, mobile fallback untouched, brand colors unchanged.

### Workflow lesson
`/frontend-design` should run during implementation, not just during planning. Tasks 1–11 shipped plan geometry verbatim; the polish pass that should have happened during the build instead happened post-ship. For future sections, invoke `/frontend-design` at Task scaffold time and again at Task final verification — not just to lock the plan.
