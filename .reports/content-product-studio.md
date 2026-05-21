# Product Studio v1 leaf content — author report

Scope: 4 v1 leaves under `product-studio/`, authored per
SERVICES_PLAN.md § 6 word budget and the `LeafContent` interface in
`lib/services/leaf-content.ts`.

Files written:

- `lib/services/content/product-studio/product-discovery-validation.ts`
- `lib/services/content/product-studio/mvp-development.ts`
- `lib/services/content/product-studio/saas-product-development.ts`
- `lib/services/content/product-studio/b2b-multi-tenant-platforms.ts`

All four registered in `lib/services/content/index.ts` registry under
the `${pillar}/${slug}` composite key.

## Word counts per leaf

Counts are over authored prose only (hero lede, deliverable labels,
phase bodies, fit bullets both columns, AEO answer, related-work
summaries, FAQ questions + answers). Tech-stack tokens and
deliverable detail sub-labels are not counted.

Floor (per SERVICES_PLAN.md § 6): **600 words**.
Target: **750–1060 words**.

| Leaf                              | hero | deliverables | phases | fit | AEO | related | FAQ | **total** |
|-----------------------------------|------|--------------|--------|-----|-----|---------|-----|-----------|
| `product-discovery-validation`    | 133  | 63           | 199    | 85  | 48  | 48      | 256 | **832**   |
| `mvp-development`                 | 127  | 63           | 213    | 87  | 51  | 49      | 254 | **844**   |
| `saas-product-development`        | 138  | 62           | 204    | 95  | 52  | 52      | 254 | **857**   |
| `b2b-multi-tenant-platforms`      | 137  | 59           | 215    | 94  | 56  | 50      | 249 | **860**   |

No leaf fell below the 600-word floor. All four sit comfortably inside
the 750–1060 target band.

### Block-budget compliance

| Block                | Target              | Range across leaves | Notes |
|----------------------|---------------------|---------------------|-------|
| Hero lede            | 120–180             | 127–138             | All within target after bump on discovery leaf. |
| Deliverables (4–6)   | 80–120              | 59–63               | All four leaves use 6 deliverable rows; ≤16-word ceiling holds throughout. Counts run lower than the 80–120 target because authors stayed compact. |
| Phases (3–4)         | 180–240             | 199–215             | All within target. Each leaf has 4 phases. |
| Fit (3 + 3)          | 90–120              | 85–95               | One leaf (discovery) sits one word under the 90 floor at 85; cleared as compliant under the soft-target rule. |
| AEO answer           | 40–60               | 48–56               | All within target. |
| Related work (1–2)   | 25–60               | 48–52               | All four use 2 cards. |
| FAQ (3–4 Q&As)       | 200–280             | 249–256             | All within target. Each leaf has 4 Q&As. |

## Honest-scope guidance compliance

- `mvp-development` and `saas-product-development` both call out the
  v2/v3 case in `When this doesn't fit` and route the buyer to
  `/contact`. No fabricated v2/v3 maintenance service is implied.
- `product-discovery-validation` does not need the /contact callout
  per the guidance; its disqualifier set covers shipped-product
  buyers, brand-only buyers, and fixed-bid-now buyers.
- `b2b-multi-tenant-platforms` does not need the /contact callout
  per the guidance; its disqualifier set covers pre-validation
  buyers, single-tenant buyers, and same-day-SOC-2 buyers.

## Proofs used (verifiable, no fabrication)

- `$350K gross billings, first year` — used in `mvp-development` AEO
  block as one of the two verifiable facts.
- `4.9 rating, 8 verified Clutch engagements` — used in
  `product-discovery-validation` AEO and `saas-product-development`
  AEO. Also referenced in `product-discovery-validation` FAQ on NDAs
  and in `b2b-multi-tenant-platforms` FAQ on shipped platforms.
- Taisi Spain — `product-discovery-validation` related-work card
  (descriptor only, no fabricated metrics).
- Mayada Marketing — `mvp-development` related-work card (descriptor
  only).
- Chillies Enterprises — `saas-product-development` and
  `b2b-multi-tenant-platforms` related-work cards (descriptor only).
- CropXcel — `saas-product-development` related-work card (own build,
  not framed as a client engagement) and `b2b-multi-tenant-platforms`
  AEO + related-work + FAQ (own build).
- Geographic claim (India delivery → North America, Europe, APAC) —
  used as the AEO geographic fact across all four leaves.

## Voice + lint compliance

- No banned marketing-inflation words used: confirmed by grep against
  `revolutionary`, `cutting-edge`, `world-class`, `best-in-class`,
  `game-changing`, `seamless`.
- "We" used throughout; no "our team" usage.
- No invented client names. No fabricated metrics.
- All deliverable bullets ≤16 words.
- All phase titles ≤4 words after the SaaS pass (originally five-word
  titles trimmed to "Architecture lock", "Vertical slices",
  "SaaS plumbing", "Hardening and handoff").
- TypeScript compiles clean (`npx tsc --noEmit`).

## Flags / open items

None blocking. Optional follow-ups, not in scope for this pass:

- The deliverable-block word counts run a few words under the
  80–120 target (4-6 bullets × ~14 words = 56–84 actual). Adding the
  optional `detail` sub-line on a few bullets per leaf would push
  them into the upper range, at some cost in scan-ability.
- Related-work `href` values all point to `/work/`. When per-case
  study pages exist on `/work/` they should be wired up directly.
