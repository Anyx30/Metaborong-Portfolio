# Services schema, redirects, sitemap — validation report

Generated: 2026-05-20 (production build on branch `feat/services-section`).

Implements SERVICES_PLAN.md § 2 (redirects) and § 5 (schema, sitemap filtering).

---

## 1. Production build

`npm run build` exits clean. Turbopack compiles `lib/schema.ts`, `app/sitemap.ts`,
and `next.config.ts` without TypeScript errors. All 30 service routes prerender
through `generateStaticParams` (3 pillar hubs + 16 v1 leaves + 11 coming-soon
stubs — the stubs still resolve as noindex pages so old links stay live).

`npm run typecheck` — pass.
`npx vitest run app/sitemap.test.ts` — 4/4 pass (test updated for the new
static-route count of 22).

---

## 2. Sitemap output

`GET /sitemap.xml` against the production server (`PORT=3001 npm run start`)
emits **24 `<loc>` entries**:

| Section | Count | URLs |
|---|---|---|
| Site root | 1 | `https://www.metaborong.com/` |
| Blog index | 1 | `https://www.metaborong.com/blog/` |
| Services overview | 1 | `https://www.metaborong.com/services/` |
| Pillar hubs | 3 | `/services/web3/`, `/services/ai/`, `/services/product-studio/` |
| v1 leaves — Web3 | 6 | tokenomics, NFT marketplace, smart contracts, DeFi, liquid staking, **DID** |
| v1 leaves — AI | 6 | audit, copilots, conversational agents, agentic, RAG, LLM integration |
| v1 leaves — Product Studio | 4 | discovery, MVP, SaaS, B2B multi-tenant |
| Published blog posts | 2 | `this-is-a-test`, `cms-feature-guide` |
| **Total** | **24** | |

**Services-only subtotal: 20** — matches the target (`3 hubs + 16 leaves +
overview = 20 service URLs`).

### Coming-soon URLs absent (spot-checks)

Verified by `grep` against sitemap.xml — none of the 14 coming-soon leaves
appear:

- `/services/ai/ai-adoption-roadmap/` — absent ✓
- `/services/ai/ai-education-workshops/` — absent ✓
- `/services/ai/ai-augmented-customer-journeys/` — absent ✓
- `/services/ai/ai-evaluation-monitoring/` — absent ✓
- `/services/web3/protocol-architecture-review/` — absent ✓
- `/services/web3/web3-product-discovery/` — absent ✓
- `/services/web3/crypto-wallet-development/` — absent ✓
- `/services/web3/dao-governance-systems/` — absent ✓
- `/services/web3/token-launchpad-distribution/` — absent ✓
- `/services/product-studio/technical-architecture-planning/` — absent ✓
- `/services/product-studio/mvp-scoping-roadmapping/` — absent ✓
- `/services/product-studio/frontend-engineering/` — absent ✓
- `/services/product-studio/backend-api-engineering/` — absent ✓
- `/services/product-studio/design-systems-component-libraries/` — absent ✓

Filter source: `getPublishedLeaves(pillar)` in
`components/sections/services-data.ts`, which gates by `status === 'published'`.

---

## 3. Redirects (next.config.ts)

All 9 redirects from SERVICES_PLAN.md § 2 return **HTTP 308 Permanent
Redirect** with the expected `location` header, and every destination
returns **HTTP 200**.

| Source | Destination | Source status | Destination status |
|---|---|---|---|
| `/services/ai-agents` | `/services/ai` | 308 | 200 |
| `/services/ai-agents/agentic-ai-systems` | `/services/ai/agentic-ai-systems` | 308 | 200 |
| `/services/ai-agents/rag-knowledge-systems` | `/services/ai/rag-retrieval-pipelines` | 308 | 200 |
| `/services/ai-agents/generative-ai-development` | `/services/ai/llm-integration-architecture` | 308 | 200 |
| `/services/ai-agents/voice-agent-integration` | `/services/ai/conversational-agents-assistants` | 308 | 200 |
| `/services/ai-agents/ai-systems-integration` | `/services/ai/llm-integration-architecture` | 308 | 200 |
| `/services/ai-agents/ai-workflow-automation` | `/services/ai` | 308 | 200 |
| `/services/product-studio/mvp-software-development` | `/services/product-studio/mvp-development` | 308 | 200 |
| `/services/product-studio/b2b-software-development` | `/services/product-studio/b2b-multi-tenant-platforms` | 308 | 200 |

Order in `next.config.ts` puts the leaf rules before the pillar-level
catch-all so the first match wins inside Next's routing.

---

## 4. Schema.org additions (lib/schema.ts)

### Organization.knowsAbout — 10 entries (was 6)

```json
[
  "AI Audit & Opportunity Assessment",
  "AI Copilots & Internal Tools",
  "Agentic AI Systems",
  "RAG & Retrieval Pipelines",
  "Smart Contract Development",
  "DeFi Protocol Development",
  "Tokenomics Design",
  "Decentralized Identity & DID Integration",
  "MVP Development",
  "SaaS Product Development"
]
```

Exact 10 headline terms from SERVICES_PLAN.md § 5.

### Service nodes — 3 pillar + 16 v1 leaf

`serviceSchemas` (existing) — 3 pillar nodes with `hasOfferCatalog` listing
v1 published leaves only.

`leafServiceSchemas` (new) — 16 per-leaf Service nodes, one per v1 published
leaf. Coming-soon leaves are NOT in the array.

Leaf @ids (excerpt):

```
https://www.metaborong.com/#service-web3-smart-contract-development
https://www.metaborong.com/#service-web3-defi-protocol-development
https://www.metaborong.com/#service-web3-decentralized-identity-did-integration
https://www.metaborong.com/#service-ai-agentic-ai-systems
https://www.metaborong.com/#service-ai-rag-retrieval-pipelines
https://www.metaborong.com/#service-product-studio-mvp-development
...
```

### BreadcrumbList builders

Three exported helpers, each emits absolute URLs (per § 5 caveat):

- `buildServicesOverviewBreadcrumb()` — Home → Services.
- `buildPillarBreadcrumb(pillar)` — Home → Services → {Pillar}.
- `buildLeafBreadcrumb(pillar, leaf)` — Home → Services → {Pillar} → {Leaf}.

---

## 5. Rich Results validation (DID leaf — mock)

The v1 leaf template (`app/services/[pillar]/[slug]/page.tsx`) is still the
noindex stub from SERVICES_PLAN.md § 3 Template D. The new
`leafServiceSchemas` and `buildLeafBreadcrumb()` helpers are wired into
`lib/schema.ts` but not yet emitted from the leaf page — that happens when
Template C lands. A live Rich Results Test would therefore not see the new
leaf JSON-LD on the rendered page yet.

To verify the **schema shape itself** ahead of template work, the generated
output for `/services/web3/decentralized-identity-did-integration/` was
dumped through vitest:

### Service node

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://www.metaborong.com/#service-web3-decentralized-identity-did-integration",
  "name": "Decentralized Identity & DID Integration",
  "serviceType": "Web3 Engineering",
  "description": "Verifiable credentials, Aadhaar-integrated DID stacks, and UIDAI-aware identity systems.",
  "provider": { "@id": "https://www.metaborong.com/#organization" },
  "areaServed": "Worldwide",
  "url": "https://www.metaborong.com/services/web3/decentralized-identity-did-integration/",
  "category": "Web3",
  "isRelatedTo": [
    { "@id": "https://www.metaborong.com/#service-web3-web3-tokenomics-design" },
    { "@id": "https://www.metaborong.com/#service-web3-nft-marketplace-development" },
    { "@id": "https://www.metaborong.com/#service-web3-smart-contract-development" }
  ]
}
```

### BreadcrumbList

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home",     "item": "https://www.metaborong.com/" },
    { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://www.metaborong.com/services/" },
    { "@type": "ListItem", "position": 3, "name": "Web3",     "item": "https://www.metaborong.com/services/web3/" },
    { "@type": "ListItem", "position": 4, "name": "Decentralized Identity & DID Integration",
      "item": "https://www.metaborong.com/services/web3/decentralized-identity-did-integration/" }
  ]
}
```

### Schema validity (offline checks)

- All required `Service` fields present: `@type`, `name`, `provider`,
  `serviceType`, `areaServed`, `url`, `description`.
- `provider` references the existing `#organization` @id — no orphan node.
- All `isRelatedTo` @ids match real `leafServiceSchemas` entries — no
  dangling references.
- `BreadcrumbList` items are sequentially positioned, each has an absolute
  `item` URL, all four levels resolve to live routes.
- JSON-LD is well-formed (validates as JSON; `@context` is the canonical
  schema.org URL).

**Status: schema shape ready; Rich Results Test deferred to leaf-template
landing.** Once `app/services/[pillar]/[slug]/page.tsx` emits the leaf
template and serialises `leafServiceSchemas` + `buildLeafBreadcrumb()` into
the page head, a real Rich Results Test run against the staging URL will
confirm rendering.

---

## 6. Files changed

- `lib/schema.ts` — Organization.knowsAbout extended; added
  `leafServiceSchemas`, `buildServicesOverviewBreadcrumb`,
  `buildPillarBreadcrumb`, `buildLeafBreadcrumb`.
- `next.config.ts` — added 9 `redirects()` entries (308 permanent).
- `app/sitemap.ts` — emits `/services/` overview, 3 pillar hubs, and
  v1 published leaves; filters by `status === 'published'`.
- `app/sitemap.test.ts` — test count updated; added assertions for the
  new service URLs and explicit exclusion of two coming-soon slugs.
