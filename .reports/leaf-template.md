# Leaf service template — report

Template C (`components/services/leaf-service.tsx`) and Template D
(coming-soon stub) per `SERVICES_PLAN.md` § 3. Content authoring is
**not** in scope for this stream; this stream ships the rendering surface
and the typed content contract.

Date: 2026-05-20
Branch: `feat/services-section`

## Files added

| Path | Purpose |
|------|---------|
| `lib/services/leaf-content.ts` | `LeafContent` type — the contract content streams author against. |
| `lib/services/content/index.ts` | Registry. Empty today; content streams register one `LeafContent` per published slug. |
| `components/services/leaf-service.tsx` | Server-component leaf template (Template C). |

## Files modified

| Path | Change |
|------|--------|
| `app/services/[pillar]/[slug]/page.tsx` | Branches on `leaf.status` (and content presence). Published + content → `LeafServicePage`. Coming-soon (or published-but-unauthored) → noindex `ComingSoonStub` (Template D). |

## Template C blocks (in render order)

The template renders these blocks for a published leaf with authored content:

1. **Breadcrumb** — visible `<nav aria-label="Breadcrumb">` with `Home > Services > {Pillar} > {Leaf}`. Schema emission deferred to a later stream (route-level concern).
2. **Hero** — pillar+sub-group eyebrow (e.g., `AI · ENGINEERING`), H1 verbatim from `leaf.name`, authored 120–180 word lede, primary CTA `Talk to us`.
3. **What we deliver** — 4–6 deliverable cards with pillar-tinted left rule. `LeafDeliverable.label` ≤ 16 words.
4. **How we work** — numbered phase grid (3–4 phases × ~50 words). Authored per leaf, not generic.
5. **Tech stack strip** — JetBrains Mono chips, 6–10 items, optional category eyebrow per chip.
6. **When this fits / when it doesn't** — two-column honest-scope block. Three bullets each side. Fits column carries the pillar color; doesn't-fit column uses the inactive slate.
7. **AEO answer block** — `What is {leaf}?` heading + pillar-tinted blockquote with the 40–60 word answer. DID leaf must reference Aadhaar-scale deployment as a verifiable fact (enforced by content review, not by code).
8. **Related work** — 1–2 anonymized case-study cards. Block disappears if `relatedWork` is empty.
9. **Related services** — 3 sibling/cousin leaf cards, **filtered to v1 published only** by the resolver. Coming-soon refs are dropped silently, so authors can list 3–4 candidates safely. Block disappears if no resolved entries.
10. **FAQ** — native `<details>`/`<summary>` accordion. Server-rendered, zero JS. Block disappears if `faqs` is empty.
11. **Contact CTA** — reuses the existing `ContactCtaSection`.

## LeafContent type signature

Authoritative type lives at `lib/services/leaf-content.ts`. Reproduced here for content streams:

```ts
import type { PillarId } from '@/components/sections/services-data'

export type { PillarId }

export interface LeafDeliverable {
  label: string         // ≤ 16 words
  detail?: string       // optional supporting line, 12–14 words
}

export interface LeafPhase {
  title: string         // ≤ 4 words
  body: string          // 40–60 words
}

export interface LeafTechItem {
  name: string          // verbatim, e.g., "OpenAI", "pgvector"
  category?: string     // short eyebrow, e.g., "Models", "Vector"
}

export type LeafFitBullet = string  // ~18 words each

export interface LeafFitBlock {
  fits:        readonly [LeafFitBullet, LeafFitBullet, LeafFitBullet]
  doesNotFit:  readonly [LeafFitBullet, LeafFitBullet, LeafFitBullet]
}

export interface LeafRelatedWork {
  descriptor: string    // 4–8 words, anonymized
  summary:    string    // ~25 words, one sentence preferred
  href:       string    // typically /work or /blog/<slug>/
}

export interface LeafRelatedServiceRef {
  pillar: PillarId
  slug:   string
}

export interface LeafFaq {
  question: string
  answer:   string      // 50–80 words, one paragraph
}

export interface LeafContent {
  pillar: PillarId
  slug:   string

  /** 120–180 words. Entity-definition opener + 2–3 deliverables. AEO-eligible. */
  heroLede: string

  deliverables:    readonly LeafDeliverable[]      // 4–6
  phases:          readonly LeafPhase[]            // 3–4
  techStack:       readonly LeafTechItem[]         // 6–10
  fit:             LeafFitBlock                    // 3 + 3 bullets

  /** 40–60 words. `{Service} is a {category} for {audience} that {outcome}. {Fact 1}. {Fact 2}.` */
  aeoAnswer: string

  relatedWork:     readonly LeafRelatedWork[]      // 1–2 (or empty)
  relatedServices: readonly LeafRelatedServiceRef[] // 3–4 candidates; template filters to v1
  faqs:            readonly LeafFaq[]              // 3–4
}
```

## Word-budget targets

Per `SERVICES_PLAN.md` § 6. Floor 600 words; target 800 ± 200.

| Block            | Words   | Field(s)                          |
|------------------|---------|-----------------------------------|
| Hero lede        | 120–180 | `heroLede`                        |
| What we deliver  | 80–120  | `deliverables` (4–6 × ~14 words)  |
| How we work      | 180–240 | `phases` (3–4 × ~55 words)        |
| Fit block        | 90–120  | `fit` (6 × ~18 words)             |
| AEO answer       | 40–60   | `aeoAnswer`                       |
| Related work     | 25–60   | `relatedWork` (1–2 × ~25 words)   |
| FAQ              | 200–280 | `faqs` (3–4 × ~70 words)          |
| **Total**        | **735–1060** |                              |

## Authoring workflow (for content streams)

1. Create `lib/services/content/<pillar>/<slug>.ts` exporting a default `LeafContent`.
2. Register it in `lib/services/content/index.ts`:

   ```ts
   import aiAuditContent from './ai/ai-audit-opportunity-assessment'

   const registry: Record<string, LeafContent> = {
     'ai/ai-audit-opportunity-assessment': aiAuditContent,
   }
   ```

3. The route picks it up automatically — no template changes required.
4. While content is not yet registered, the slug renders as the noindex
   coming-soon stub (Template D) so the page never 500s mid-authoring.

## Design system conformance

- All sections wrap in `<Section>` (auto-Reveal, `prefers-reduced-motion: reduce` short-circuit, canonical horizontal padding via the responsive class chain).
- Eyebrows via `<Eyebrow tone={pillarId}>` primitive.
- Primary CTA uses `<Button variant="primary" arrow="→">` — split-arrow signature.
- No raw hex in classNames; pillar color comes from `services-data.ts` via inline `style` (per existing services-pillars pattern; data-driven, not hardcoded).
- Tap targets ≥ 44×44 on cards, breadcrumb links, summary rows.
- Card radius `0` (Bauhaus restraint, matches button + cards in `services-pillars.tsx`).
- Focus ring on every interactive primitive via `focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2`.
- FAQ accordion uses native `<details>` — platform-handled keyboard semantics, no client JS.

## Coming-soon stub (Template D) — what changed

Existing stub kept and lightly modernized:

- Tokenized spacing (`px-[16px]/sm:px-[24px]`, `mt-[32px]`) replacing the old `px-6` shorthand.
- CTA upgraded to the split-arrow signature pattern (`Talk to us` + arrow span) for consistency with the contact CTA.
- Back-links rewritten as `<Link>` instead of `<a>` for client-side nav.
- Metadata still emits `robots: { index: false, follow: false }` for both coming-soon leaves AND published-but-unauthored leaves.

## Verification

- `npm run typecheck` → clean.
- `npm run lint` → no new errors or warnings in the four added/modified files.

## Out of scope (next streams)

- Authored `LeafContent` files for the 16 v1 slugs (one stream per pillar or per leaf).
- BreadcrumbList + Service + FAQPage JSON-LD emission at the route level.
- next.config 308 redirects for the `ai-agents` → `ai` slug renames.
- Template B (pillar hub) and Template A (services overview).
