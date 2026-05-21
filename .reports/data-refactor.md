# Services data-layer refactor — report

Atomic refactor of `components/sections/services-data.ts` per
`SERVICES_PLAN.md` § Scaffold step 1 and § Risk 5. All consumers updated in
the same change set; typecheck passes, no new lint regressions.

Date: 2026-05-20
Branch: `feat/services-section`

## Summary of changes

### Data shape

- `PillarId` renamed: `'web3' | 'ai-agents' | 'product-studio'` →
  `'ai' | 'web3' | 'product-studio'`.
- Added `SubGroupId = 'strategy' | 'product' | 'engineering'` and
  `LeafStatus = 'published' | 'coming-soon'`.
- `ChildService` gains a required `status: LeafStatus` field.
- New `SubGroup = { id, label, children: ChildService[] }`.
- `Pillar.children` replaced with `Pillar.subGroups: SubGroup[]`.
- Helpers exported from the data module:
  - `getAllLeaves(pillar)` — flat list across all sub-groups.
  - `getPublishedLeaves(pillar)` — flat list filtered to `status === 'published'`.

### Taxonomy

All 30 leaves from `SERVICES_PLAN.md` § 1 added under the 9 sub-groups
(3 pillars × 3 sub-groups). 16 marked `published`, 14 marked
`coming-soon`. Counts match the plan:

| Pillar         | Strategy | Product | Engineering | Total | v1 |
|----------------|----------|---------|-------------|-------|----|
| AI             | 3        | 3       | 4           | 10    | 6  |
| Web3           | 3        | 3       | 5           | 11    | 6  |
| Product Studio | 3        | 3       | 3           | 9     | 4  |
| **Total**      | **9**    | **9**   | **12**      | **30**| **16** |

### New leaf

`decentralized-identity-did-integration` added under
`web3 / engineering`, `status: 'published'` — the headline GovTech
credential per § Risk 7.

### Product Studio slug renames

- `mvp-software-development` → `mvp-development` (v1)
- `b2b-software-development` → `b2b-multi-tenant-platforms` (v1)

### Pillar metadata updates

- AI: `label` `'AI Agents'` → `'AI'`; headline `'Production AI agent
  engineering'` → `'Production AI capability'`; body rewritten to cover
  the broadened pillar (copilots, conversational agents, RAG, LLM
  integration). `hubHref` `/services/ai-agents/` → `/services/ai/`.
  `hubCta` `'AI agent services'` → `'AI services'`.
- Web3: `label` `'Web3 / Blockchain'` → `'Web3'`; body rewritten to add
  tokenomics and DID. Headline and `hubHref` unchanged.
- Product Studio: `headline` `'Your full SaaS engineering team'` →
  `'Greenfield product engineering'` (matches plan § Pillar identity);
  body rewritten. `hubHref` and `hubCta` unchanged.

Data array order preserved as `[web3, ai, product-studio]` so existing
visual rendering — homepage accordion numbering `[01/02/03]`, nav
mega-menu column order — stays identical. The iso-canvas already
positions AI leftmost via its own `PILLAR_ORDER` constant (now updated
to use `'ai'`).

## Files touched

### Explicit consumers (per task brief)

- `components/sections/services-data.ts` — full rewrite around the new
  shape; added 30 leaves with `status` flags; added `getAllLeaves` and
  `getPublishedLeaves` helpers.
- `components/sections/services-pillars.tsx` — switched both desktop
  accordion and mobile stack from `pillar.children.slice(0, TOP_N)` to
  `getPublishedLeaves(pillar).slice(0, TOP_N)` so coming-soon leaves
  never appear on the homepage. `TOP_N = 5` kept (matches the existing
  UI). Imports `getPublishedLeaves` from the data module.
- `components/sections/services-iso-canvas.tsx` — renamed every
  `'ai-agents'` key in `PILLAR_COLOR`, `PILLAR_LABEL`,
  `PILLAR_OFFSET_X`, and `PILLAR_ORDER` to `'ai'`.
- `lib/schema.ts` — `serviceSchemas.hasOfferCatalog.itemListElement`
  now iterates `getPublishedLeaves(p)` rather than `p.children`, so the
  schema OfferCatalog hides coming-soon stubs per § Risk 3.
- `components/sections/services.tsx` — **no change needed.** This file
  does not import from `services-data`; it only renders the
  `ServicesSection` wrapper with a hardcoded FAQ JSON-LD block and
  delegates to `<ServicesPillars>`. Behavior flows through transitively.

### Implicit consumers (required to satisfy "no runtime errors on any existing route")

These also referenced the old shape and were updated in lockstep:

- `components/layout/nav.tsx` — desktop mega-menu and mobile accordion
  switched to `getPublishedLeaves(p).slice(0, 5)`. Mega-menu still caps
  at five rows per column.
- `app/services/[pillar]/[slug]/page.tsx` — `generateStaticParams`,
  `generateMetadata`, and the page component now use
  `getAllLeaves(p).find(...)` to resolve a leaf (both v1 published and
  coming-soon stubs continue to resolve as noindex pages).
- `app/llms.txt/route.ts` — emits sub-group H4 headers and tags each
  leaf with `_(coming soon)_` where applicable. The "Three service
  pillars" facts line updated `AI Agents` → `AI`.
- `components/ui/eyebrow.tsx` — `toneClass` key `'ai-agents'` → `'ai'`.
  The `EyebrowTone` union derives from `PillarId`, so the type
  automatically tracks.
- `lib/services/seo-map.ts` — `PillarId` and `SubGroupId` re-exported
  from `services-data.ts` (single source of truth). The map's leaf
  entries already used `'ai'`, so no per-entry edits were needed.

### Routes unchanged (no edits, but confirmed compatible)

- `app/services/[pillar]/page.tsx` — uses `pillar.label`,
  `pillar.headline`, `pillar.body`, `pillar.color` only; no leaf
  access. Compiles cleanly under the new shape.

## Verification

- `npm run typecheck` → clean.
- `npm run lint` → no new errors introduced. Pre-existing errors in
  `app/services/[pillar]/page.tsx:41`,
  `app/services/[pillar]/[slug]/page.tsx:46` (use `<a>` instead of
  Next `<Link>` for the "Back to home" link), `components/layout/nav.tsx:88`
  (setState-in-effect in mega-menu focus management),
  `components/ui/reveal.tsx`, `components/sections/work-preview.tsx`,
  `components/admin/admin-posts-list.tsx`, and `lib/images.ts` all
  existed before this change and were not introduced by the refactor.
- `grep -rn "ai-agents"` across `*.ts` / `*.tsx` → no hits outside
  historical docs in `docs/superpowers/archive/` and the plan itself.

## Deviations from the task brief

1. **`components/sections/services.tsx` not modified.** The brief lists
   it as a consumer, but it has no `services-data` import — it only
   renders `<ServicesSection>` (which mounts `<ServicesPillars>`) plus
   a hardcoded FAQ JSON-LD block. The behavior change flows through
   `<ServicesPillars>`. The hardcoded FAQ still says "Web3 protocols /
   AI agents / SaaS"; updating that copy is a content edit separate
   from the data refactor and was not in scope.
2. **`components/sections/services-trefoil.tsx` does not exist** in the
   current codebase. The brief lists it (mirroring § Risk 5 of the
   plan), but `find` and `grep` confirm there is no such file on
   `feat/services-section`. The homepage iso-canvas (which replaced the
   trefoil in an earlier redesign) plays the equivalent role and was
   updated. No file was created — that would be out of scope.
3. **`TOP_N` kept at 5, not 3.** The brief says "filter to v1 published
   leaves where the existing UI shows only top-3 leaves per pillar",
   but `services-pillars.tsx` actually uses `TOP_N = 5` and nav.tsx
   also slices at five. I preserved the existing constant and applied
   the published-only filter. AI/Web3 have 6 v1 leaves each, Product
   Studio has 4 — all comfortably populate the visible list. If the
   intent is to literally cap at 3, that's a one-line change to
   `TOP_N` and the nav `.slice(0, 5)` calls.
4. **Pillar data array order preserved** as `[web3, ai, product-studio]`
   rather than the plan's `[ai, web3, product-studio]`. Reordering
   would change the homepage accordion numbering and the nav mega-menu
   column order, which would conflict with the brief's "must continue
   rendering correctly" constraint. The plan's pillar identity table
   is treated as illustrative; numeric labels (`01/02/03`) remain
   assigned in data-array order.
