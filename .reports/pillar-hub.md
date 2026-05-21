# Pillar Hub — Template B build report

Scope: SERVICES_PLAN.md § 3 Template B. Builds the shared pillar-hub
template and wires `app/services/[pillar]/page.tsx` to render it for
all three pillars.

## Files changed / added

- **NEW** `components/services/pillar-hub.tsx` — single server-component
  template rendered by the route for all three pillars. Blocks: visible
  breadcrumb (+ `BreadcrumbList` JSON-LD), pillar hero, three numbered
  sub-group sections (each with one anonymized case-study card and a
  grid of leaf cards), pillar-tailored engagement-model strip,
  cross-pillar links, pillar FAQ (+ `FAQPage` JSON-LD), and a
  `ContactCtaSection` reuse.
- **NEW** `lib/services/pillar-hub-content.ts` — authored copy. Three
  pillar entries × { positioning sentence, 200–300 word hero (two
  paragraphs), three sub-group descriptions, three case-study
  placeholders, three engagement phases, 6 FAQs }. Total: **18 FAQs**
  (6 per pillar), 9 anonymised case-study cards, 18 authored
  paragraphs for hero copy.
- **MODIFIED** `app/services/[pillar]/page.tsx` — drops the inline
  placeholder; calls `<PillarHub pillar={p} />`. `generateMetadata`
  now emits the SERVICES_PLAN § 4 meta titles and descriptions, sets
  `alternates.canonical`, and adds `openGraph`. **Removes the blanket
  `robots: { index: false }`** so the hubs are indexable (per the
  plan's intent — pillar hubs are v1 content, not stubs).

## Hero copy — entity-definition opener (per pillar)

- **AI** — "AI development at Metaborong is the work of adding
  production-grade language-model, retrieval, and agentic capability
  to products and teams that already exist." 235 words across two
  paragraphs.
- **Web3** — "Web3 development at Metaborong is decentralised protocol
  engineering — smart contracts, DeFi systems, NFT infrastructure,
  tokenomics, and decentralised identity." 226 words across two
  paragraphs. References Aadhaar-integrated DID stacks as the
  GovTech anchor without leaning India-only.
- **Product Studio** — "Product Studio at Metaborong is greenfield
  product engineering for founders building from zero." 224 words
  across two paragraphs. Explicitly disowns modernisation /
  managed-services to mitigate the SERVICES_PLAN § Risk 6 cannibalisation
  vector.

All hero counts fit the 200–300 word band.

## Leaf-card status branching (CRITICAL)

`LeafCard` in `components/services/pillar-hub.tsx` switches on
`leaf.status`:

- `status === 'published'` → `<Link href={`${pillar.hubHref}${leaf.slug}/`}>`
  with explicit `Open ↗` affordance, full hover state, and pillar-color
  accent on hover. **16 published leaves render as clickable cards.**
- `status === 'coming-soon'` → `<div role="group" aria-disabled="true">`
  with **no href**, dashed border, `bg-bg-subtle`, `opacity-70`, and a
  monospace `Coming soon` chip. **14 coming-soon leaves render as
  dimmed cards.**

Production-build smoke test confirms the counts on every hub:

| Pillar          | Published (Open) | Coming-soon (aria-disabled) | FAQs |
|-----------------|------------------|------------------------------|------|
| AI              | 6                | 4                            | 6    |
| Web3            | 6                | 5                            | 6    |
| Product Studio  | 4                | 5                            | 6    |
| **Total**       | **16**           | **14**                       | **18** |

Counts match the SERVICES_PLAN § 1 taxonomy (10 AI, 11 Web3, 9 Product
Studio = 30 leaves).

## Engagement-model vocabulary (pillar-tailored)

Each pillar gets its own phase labels rather than the generic
`Discovery / Build / Operate`:

- **AI** — `Audit (1–2 wks)` → `Build (4–16 wks)` → `Operate & Govern (ongoing)`.
- **Web3** — `Design (1–3 wks)` → `Engineer (6–16 wks)` → `Audit & Operate (ongoing)`.
- **Product Studio** — `Discover (1–2 wks)` → `Build (6–16 wks)` → `Ship & Iterate (ongoing)`.

A `phaseHeadline` helper composes the section title from the labels
(e.g., "Audit → Build → Operate & Govern — production AI, not demoware.").

## Schema emitted per hub

Two inline `<script type="application/ld+json">` tags per page:

1. `BreadcrumbList` (Home → Services → Pillar), absolute URLs.
2. `FAQPage` with the 6 pillar-specific Q&A entries.

The pillar-level `Service` node with `hasOfferCatalog` already lives in
`lib/schema.ts` and is unchanged by this work.

## SEO

- Per SERVICES_PLAN § 4: meta titles and descriptions are now wired
  into `generateMetadata`. Titles, descriptions, and the canonical URL
  match the spec table verbatim.
- Hubs are indexable (no `robots: noindex`). Only coming-soon **leaves**
  remain noindex (handled by the existing `[slug]/page.tsx`).

## Accessibility

- Breadcrumb uses `<nav aria-label="Breadcrumb">` + `<ol>` with
  `aria-current="page"` on the active crumb.
- Each section has an `aria-labelledby` pointing at its heading.
- Coming-soon cards expose `aria-disabled="true"` on `role="group"`
  with no link — assistive tech announces them as disabled (not just
  visually dimmed). Matches the SERVICES_PLAN § 7 requirement.
- FAQ block uses `<dl>` / `<dt>` / `<dd>` — semantic, no JS needed,
  no `aria-expanded` because it's always-open (matches the
  hub-page reading mode; the homepage FAQ keeps its accordion).
- Primary CTA `Talk to us` and secondary `Read case studies` both
  use the approved verb list (Talk, Read).

## Verification

- `npx tsc --noEmit` — clean.
- `npx eslint components/services/pillar-hub.tsx app/services/[pillar]/page.tsx lib/services/pillar-hub-content.ts` — clean.
- `npm run build` — succeeded; all three pillar routes prerendered as
  static HTML (SSG via `generateStaticParams`). Build output shows
  `/services/web3`, `/services/ai`, `/services/product-studio` under
  the `[pillar]` segment.
- Production smoke test on `next start`: every hub returns 200, the
  H1 renders verbatim from the pillar headline, both schema blocks
  emit, and the leaf counts match the taxonomy.

## Risks / follow-ups

- Trailing slashes: SERVICES_PLAN § 2 specifies trailing slashes on
  every route, but the project's Next 16 config redirects
  `/services/ai/` → `/services/ai` (308). Inbound links from the
  homepage accordion and nav already use trailing slashes — they
  resolve via the redirect. Decide whether to add `trailingSlash: true`
  in `next.config` or update internal links to omit the slash. **Out
  of scope** for this task.
- The cross-pillar block surfaces the two other pillars without
  filtering: this is exactly what the plan calls for.
- Leaf-page template (Template C) is unbuilt — coming-soon and v1
  leaves both still resolve through the existing `[slug]/page.tsx`
  placeholder. That is the next task.
