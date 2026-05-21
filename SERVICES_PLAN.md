# SERVICES_PLAN.md

Implementation plan for the Metaborong services section, modelled on labrys.io's
pillar / sub-group / leaf architecture but adapted to Metaborong's three-pillar reality
and Indian + global market posture.

Status: **awaiting user approval before scaffolding**. After approval, the route
templates in `app/services/**` and the data layer in `components/sections/services-data.ts`
will be rewritten to match this plan.

### v2 changes (2026-05-20)

Locked after first review:

- **Three pillars only.** IT Services dropped as a public pillar. Cloud, managed-ops,
  and modernization work is sold via direct conversation — not surfaced as marketing
  pages.
- **v1 leaf set (16 authored pages).** Only the v1 leaves below ship full templates.
  Remaining leaves stay in the data layer as `status: 'coming-soon'` placeholders so
  the taxonomy is complete but the content commitment stays bounded.
- **New leaf: `decentralized-identity-did-integration`** under Web3 / Engineering. This
  is the headline GovTech credential — anchors UIDAI / Aadhaar / DID work. AEO answer
  block must explicitly reference Aadhaar-scale deployment.

---

## 1. Final taxonomy

Three pillars. Three sub-groups per pillar. Three to four leaf services per sub-group.
All three pillars use the labrys-style `Strategy / Product / Engineering` triad. Total:
**30 leaf services in the taxonomy** (10 AI, 11 Web3, 9 Product Studio). Of these,
**16 ship as v1 authored pages**; the remaining 14 are coming-soon stubs in the data
layer.

Legend: leaves marked **[v1]** ship full authored pages. Unmarked leaves are
`status: 'coming-soon'` — present in the taxonomy and reachable as noindex stubs,
not authored.

```
services
├── ai/                              Production AI capability
│   ├── strategy/
│   │   ├── ai-audit-opportunity-assessment             [v1]
│   │   ├── ai-adoption-roadmap
│   │   └── ai-education-workshops
│   ├── product/
│   │   ├── ai-copilots-internal-tools                  [v1]
│   │   ├── conversational-agents-assistants            [v1]
│   │   └── ai-augmented-customer-journeys
│   └── engineering/
│       ├── agentic-ai-systems                          [v1]
│       ├── rag-retrieval-pipelines                     [v1]
│       ├── llm-integration-architecture                [v1]
│       └── ai-evaluation-monitoring
│
├── web3/                            Decentralised protocol engineering
│   ├── strategy/
│   │   ├── web3-tokenomics-design                      [v1]
│   │   ├── protocol-architecture-review
│   │   └── web3-product-discovery
│   ├── product/
│   │   ├── nft-marketplace-development                 [v1]
│   │   ├── crypto-wallet-development
│   │   └── dao-governance-systems
│   └── engineering/
│       ├── smart-contract-development                  [v1]
│       ├── defi-protocol-development                   [v1]
│       ├── liquid-staking-vaults                       [v1]
│       ├── decentralized-identity-did-integration      [v1] ★ new
│       └── token-launchpad-distribution
│
└── product-studio/                  Greenfield product engineering
    ├── strategy/
    │   ├── product-discovery-validation                [v1]
    │   ├── technical-architecture-planning
    │   └── mvp-scoping-roadmapping
    ├── product/
    │   ├── mvp-development                             [v1]
    │   ├── saas-product-development                    [v1]
    │   └── b2b-multi-tenant-platforms                  [v1]
    └── engineering/
        ├── frontend-engineering
        ├── backend-api-engineering
        └── design-systems-component-libraries
```

### Pillar identity

| Pillar         | Slug             | Color (hex) | Token alias                       | One-line position                                                |
|----------------|------------------|-------------|-----------------------------------|------------------------------------------------------------------|
| AI             | `ai`             | `#10b981`   | `color.brand.ai` (existing)       | We add production AI capability to existing products and teams. |
| Web3           | `web3`           | `#296ff0`   | `color.brand.primary` (existing)  | We design and ship the protocols, wallets, and on-chain systems. |
| Product Studio | `product-studio` | `#F6851B`   | `color.brand.accent` (existing)   | We build the first version of your product, end-to-end.        |

No new color tokens needed (the 4th-pillar slate is dropped along with IT Services).
All three pillar colors are already in `globals.css` and registered in `DESIGN.md`.

### Exclusions (do not author leaves for these)

- Hardware, IoT, firmware, embedded systems.
- Novel ML model training from scratch (computer vision research, custom foundation
  models). We integrate, fine-tune, and adapt off-the-shelf models — leaves and copy
  must reflect that, not imply we run an ML lab.
- Cloud migration, managed services, DevOps/SRE retainers, and security-compliance
  programs — handled via direct conversation, not surfaced as services pages.

### Subsidiary treatment

Deoxys and CropXcel are **not** services. They surface in a dedicated `Ventures` strip
(future addition, not in scope for this plan) and appear as case studies on relevant
pillar / leaf pages once we have real metrics to publish. The services taxonomy stays
pure: it describes what we sell as engagements, not what we operate as products.

### Renames from current `services-data.ts`

The current scaffolding uses `PillarId = 'web3' | 'ai-agents' | 'product-studio'`.
This plan keeps the union at three IDs but renames `ai-agents` → `ai`. Current routes
are `robots: { index: false }`, so the rename has no SEO impact. Redirect rules below
preserve any inbound links.

| Old route                                       | New route                                          |
|-------------------------------------------------|----------------------------------------------------|
| `/services/ai-agents/`                          | `/services/ai/`                                    |
| `/services/ai-agents/agentic-ai-systems/`       | `/services/ai/agentic-ai-systems/` (v1)            |
| `/services/ai-agents/rag-knowledge-systems/`    | `/services/ai/rag-retrieval-pipelines/` (v1)       |
| `/services/ai-agents/generative-ai-development/`| `/services/ai/llm-integration-architecture/` (v1)  |
| `/services/ai-agents/voice-agent-integration/`  | `/services/ai/conversational-agents-assistants/` (v1) |
| `/services/ai-agents/ai-systems-integration/`   | `/services/ai/llm-integration-architecture/` (v1)  |
| `/services/ai-agents/ai-workflow-automation/`   | `/services/ai/` (pillar hub — target leaf is coming-soon) |

Product Studio leaf slugs change slightly to better match SEO targets:

| Old route                                              | New route                                          |
|--------------------------------------------------------|----------------------------------------------------|
| `/services/product-studio/mvp-software-development/`   | `/services/product-studio/mvp-development/` (v1)   |
| `/services/product-studio/b2b-software-development/`   | `/services/product-studio/b2b-multi-tenant-platforms/` (v1) |

Web3 leaf slugs are preserved from current `services-data.ts`. The new
`decentralized-identity-did-integration` leaf has no predecessor.

---

## 2. URL structure

Pattern preserved from current scaffolding (`/services/{pillar}/{leaf}/`). Trailing
slash on every route (Next.js 16 default; matches existing pattern).

### Hub-level

| URL                              | Purpose                                              |
|----------------------------------|------------------------------------------------------|
| `/services/`                     | Services overview — outcome strip + 3 pillar cards. |
| `/services/ai/`                  | AI pillar hub.                                       |
| `/services/web3/`                | Web3 pillar hub.                                     |
| `/services/product-studio/`      | Product Studio pillar hub.                           |

### Leaf-level — v1 authored pages (16)

**AI v1 (6):**
- `/services/ai/ai-audit-opportunity-assessment/`
- `/services/ai/ai-copilots-internal-tools/`
- `/services/ai/conversational-agents-assistants/`
- `/services/ai/agentic-ai-systems/`
- `/services/ai/rag-retrieval-pipelines/`
- `/services/ai/llm-integration-architecture/`

**Web3 v1 (6):**
- `/services/web3/smart-contract-development/`
- `/services/web3/defi-protocol-development/`
- `/services/web3/web3-tokenomics-design/`
- `/services/web3/nft-marketplace-development/`
- `/services/web3/liquid-staking-vaults/`
- `/services/web3/decentralized-identity-did-integration/` ★ new

**Product Studio v1 (4):**
- `/services/product-studio/product-discovery-validation/`
- `/services/product-studio/mvp-development/`
- `/services/product-studio/saas-product-development/`
- `/services/product-studio/b2b-multi-tenant-platforms/`

### Leaf-level — coming-soon stubs (14, noindex)

These exist in the taxonomy and resolve to a noindex "coming soon" stub. They are
not in the sitemap, not in the schema `OfferCatalog`, and not in the mega-menu —
filtered out by `status === 'published'`.

- `/services/ai/ai-adoption-roadmap/`
- `/services/ai/ai-education-workshops/`
- `/services/ai/ai-augmented-customer-journeys/`
- `/services/ai/ai-evaluation-monitoring/`
- `/services/web3/protocol-architecture-review/`
- `/services/web3/web3-product-discovery/`
- `/services/web3/crypto-wallet-development/`
- `/services/web3/dao-governance-systems/`
- `/services/web3/token-launchpad-distribution/`
- `/services/product-studio/technical-architecture-planning/`
- `/services/product-studio/mvp-scoping-roadmapping/`
- `/services/product-studio/frontend-engineering/`
- `/services/product-studio/backend-api-engineering/`
- `/services/product-studio/design-systems-component-libraries/`

### Redirects (next.config)

```
/services/ai-agents                                  → /services/ai                                  (308)
/services/ai-agents/agentic-ai-systems               → /services/ai/agentic-ai-systems               (308)
/services/ai-agents/rag-knowledge-systems            → /services/ai/rag-retrieval-pipelines          (308)
/services/ai-agents/generative-ai-development        → /services/ai/llm-integration-architecture     (308)
/services/ai-agents/voice-agent-integration          → /services/ai/conversational-agents-assistants (308)
/services/ai-agents/ai-systems-integration           → /services/ai/llm-integration-architecture     (308)
/services/ai-agents/ai-workflow-automation           → /services/ai                                  (308)
/services/product-studio/mvp-software-development    → /services/product-studio/mvp-development      (308)
/services/product-studio/b2b-software-development    → /services/product-studio/b2b-multi-tenant-platforms (308)
```

---

## 3. Page templates

Three templates total. Each one is a server component that reads from
`components/sections/services-data.ts`, uses the existing `<Section>` primitive, and
short-circuits motion under `prefers-reduced-motion: reduce`.

### Template A — Services overview (`/services/`)

| Block                       | Purpose                                                                                       |
|-----------------------------|-----------------------------------------------------------------------------------------------|
| **Hero**                    | Eyebrow `SERVICES`, H1 `What we build`, 130–180 word AEO-eligible lede with entity-definition opener (`Metaborong is a…`). Primary CTA `Talk to us` (≤3 words). |
| **Outcome strip**           | Compact horizontal row of 4 outcome cards (see § 7 for the four). Each card: single line of clarifier copy + an `Open` arrow link deep-linking to the most relevant v1 leaf or pillar hub. Visually distinct from the pillar grid. |
| **Pillar grid**             | 3 pillar cards in a 1-col mobile / 3-col lg layout. Each card: pillar number `01/02/03`, eyebrow color bar, label, one-line headline, 2-sentence body, sub-group bullets showing **v1-only** leaf names (max 3 per sub-group; "+N more on the hub" if overflow), pillar CTA `Open {pillar}`. |
| **Engagement model strip**  | 3 small panels: `Discovery (1–2 wks)` / `Build (4–16 wks)` / `Operate (ongoing)`. Anchors the engagement vocabulary across pillars. Plain text, no signature visual. |
| **Trust band**              | Reuses `components/sections/clutch-widget.tsx` + `trust-bar.tsx`. Already-shipped components. |
| **FAQ**                     | 5 services-overview FAQs: how engagements start, typical engagement length, where the team is based, who owns IP, retainer vs. fixed-bid. Reuses `faq.tsx` pattern. |
| **Contact CTA**             | Reuses `components/sections/contact-cta.tsx`. |

### Template B — Pillar hub (`/services/{pillar}/`)

Direct adaptation of the labrys pillar-page structure.

| Block                          | Purpose                                                                          |
|--------------------------------|----------------------------------------------------------------------------------|
| **Breadcrumb**                 | `Home > Services > {Pillar}`. Renders as visible breadcrumb AND `BreadcrumbList` schema. |
| **Hero**                       | Pillar-numbered eyebrow `01 · AI`, H1 (pillar headline, e.g., `Production AI capability`), 200–300 word intro that opens with the entity-definition pattern and lists what's inside the pillar. Primary CTA `Talk to us`, secondary `Read case studies`. |
| **Sub-group sections (×3)**    | Numbered `01` / `02` / `03`. Each section: section header (number + name + 1-paragraph description), one case study card (anonymized placeholder linking to `/work`), and a grid of leaf cards. Each card: name, 1-sentence description, `Open` link (v1 leaves) OR `Coming soon` tag (non-v1 leaves, no link, dimmed). Mirrors labrys' "Section 01: Consulting & Strategy" structure. |
| **Engagement model strip**     | Same 3-panel strip as overview, but tailored vocabulary to the pillar (e.g., AI: `Audit → Build → Operate & Govern`). |
| **Cross-pillar links**         | Small "Adjacent capabilities" row at the bottom: links to the 2 other pillar hubs. |
| **FAQ**                        | 5–6 pillar-specific FAQs (AI FAQs differ from Web3 FAQs). |
| **Contact CTA**                | Reuses `contact-cta.tsx`. |

### Template C — Leaf service page (`/services/{pillar}/{leaf}/`) — v1 only

Genuinely substantive page — minimum 600 words of authored content, target 800–1000.

| Block                              | Purpose                                                                                  |
|------------------------------------|------------------------------------------------------------------------------------------|
| **Breadcrumb**                     | `Home > Services > {Pillar} > {Leaf}`. Visible + schema. |
| **Hero**                           | Eyebrow `{PILLAR} · {SUB-GROUP}` (e.g., `AI · ENGINEERING`), H1 = leaf service name (verbatim, keyword-aligned), 120–180 word lede that opens with entity-definition (`{Service} is a {category} that {outcome}.`) and lists 2–3 concrete deliverables. Primary CTA `Talk to us`. |
| **What we deliver**                | 4–6 deliverable bullets or compact cards (≤16 words each per DESIGN.md). Concrete artefacts, not capabilities. |
| **How we work**                    | 3–4 phase steps specific to this service. Phase title + 1-paragraph (40–60 words) explanation. NOT generic "discovery / build / ship" — must be service-shaped. |
| **Tech / stack**                   | Compact strip of technologies. Restraint: 6–10 items max, no logo soup. Mono font, JetBrains Mono per DESIGN.md eyebrow style. |
| **When this fits / When it doesn't** | Two-column honest-scope block. Three bullets per side. Buyers self-disqualify. |
| **AEO answer block**               | One 40–60 word answer paragraph in the form `{Service} is a {category} for {audience} that {outcome}. {Verifiable fact 1}. {Verifiable fact 2}.` Targets Perplexity / AI Overviews; surfaced in `FAQPage` schema. **For the DID leaf, must reference Aadhaar-scale deployment as a verifiable fact.** |
| **Related work**                   | 1–2 anonymized case-study cards (linking to `/work` or `/blog`). Card copy uses descriptors, not names. No invented client names, no fabricated metrics. |
| **Related services**               | 3 sibling/cousin leaf links (2 from same pillar + 1 cross-pillar), **filtered to v1 only**. |
| **FAQ**                            | 3–4 leaf-specific Q&As. Becomes `FAQPage` schema. |
| **Contact CTA**                    | Reuses `contact-cta.tsx`. |

### Template D — Coming-soon stub (for non-v1 leaves)

The existing noindex stub in `app/services/[pillar]/[slug]/page.tsx` stays for leaves
where `status !== 'published'`. Same component selects template by status.

---

## 4. SEO plan per page

Global English first, India focus secondary. Slugs and meta titles avoid geo qualifiers;
`areaServed` and trust copy mention India where it reinforces credibility. The DID leaf
is the one exception — it leans India-explicit because Aadhaar is the keyword anchor.

### Overview (`/services/`)

| Field              | Value                                                                              |
|--------------------|------------------------------------------------------------------------------------|
| Target keyword     | `ai and web3 development services` (head term, brand-adjacent)                     |
| Secondary terms    | `boutique software studio`, `mvp development studio india`                         |
| Meta title         | `Services — AI, Web3, Product Studio — Metaborong`                                 |
| Meta description   | `AI integration, Web3 protocols, and greenfield product builds from a senior boutique studio. India + global delivery.` (≤160 chars) |
| Internal links to  | All 3 pillar hubs, top 4 outcome leaves, `/work`, `/blog`, `/contact`              |
| Linked from        | Main nav, footer, all pillar hubs (breadcrumb), every leaf (breadcrumb)            |

### Pillar hubs

| Pillar         | Target keyword                              | Meta title                                                        | Meta description target (≤160 chars)                                                                          |
|----------------|---------------------------------------------|-------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|
| AI             | `ai development services`                   | `AI Development Services — Copilots, Agents, RAG — Metaborong`     | `Production AI capability: copilots, RAG, agentic systems, integration, and evaluation. Senior team, India + global.` |
| Web3           | `web3 development services`                 | `Web3 Development Services — Smart Contracts, DeFi, DID — Metaborong` | `Smart-contract, DeFi, NFT, DID, and tokenomics engineering. Multichain protocol studio from India, global delivery.` |
| Product Studio | `mvp development services`                  | `Product Studio — MVP, SaaS, B2B Product Builds — Metaborong`     | `Greenfield product builds for founders without a CTO. MVP, SaaS, and B2B multi-tenant platforms, end-to-end.` |

Internal-link policy on every pillar hub: all of its **v1** leaves linked normally,
**coming-soon** leaves shown as dimmed cards with no link, 1 link to each of the other
2 pillar hubs, 2–3 case studies in `/work`, the services overview.

### Leaf pages — keyword strategy

Each leaf targets one long-tail intent. Slug is the canonical phrase, H1 echoes it
verbatim (case-styled), meta title puts the keyword first, meta description includes
a verb (`build`, `audit`, `engineer`) and an outcome.

Full per-v1-leaf table lives in **`lib/services/seo-map.ts`** so meta exports stay
co-located with the data and never drift. The file ships **before scaffold begins**
for review (per user instruction). Coming-soon leaves are NOT in the SEO map — their
stubs use `robots: { index: false, follow: false }` and a generic title.

---

## 5. Schema.org markup plan

Existing `lib/schema.ts` already ships `Organization`, `WebSite`, `FAQPage`, and a
`serviceSchemas` array. Extending, not replacing.

### Per page

| Page                     | Schema emitted                                                                                                                                  |
|--------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| `/services/`             | `BreadcrumbList` (Home → Services), `ItemList` of `Service` references for the 3 pillars                                                        |
| `/services/{pillar}/`    | `BreadcrumbList` (Home → Services → Pillar), `Service` node for the pillar with `hasOfferCatalog` listing **only v1 leaves** (coming-soon excluded), `FAQPage` if FAQ block present |
| `/services/{leaf}/` (v1) | `BreadcrumbList` (Home → Services → Pillar → Leaf), `Service` node with `provider: { @id: ORG_ID }` and `areaServed: "Worldwide"`, `FAQPage` from the FAQ block + AEO answer |
| `/services/{leaf}/` (coming-soon) | No schema beyond breadcrumb (page is noindex)                                                                                          |

### Service node shape per v1 leaf

```ts
{
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${BASE}/#service-${pillar}-${leafSlug}`,
  name: '<Leaf service name verbatim>',
  serviceType: '<Sub-group label, e.g., "AI Engineering">',
  description: '<H1-anchored 130–160 char service description>',
  provider: { '@id': ORG_ID },
  areaServed: 'Worldwide',
  url: `${BASE}/services/${pillar}/${leafSlug}/`,
  category: '<Pillar label>',
  isRelatedTo: [<2–3 sibling v1 leaf @ids>],
}
```

### Organization update

`organizationSchema.knowsAbout` to be extended to include the v1 leaf headline terms:
- AI Audit & Opportunity Assessment
- AI Copilots & Internal Tools
- Agentic AI Systems
- RAG & Retrieval Pipelines
- Smart Contract Development
- DeFi Protocol Development
- Tokenomics Design
- Decentralized Identity & DID Integration
- MVP Development
- SaaS Product Development

`areaServed` already `Worldwide` — kept.

### Caveats

- One `Service` node per **v1** leaf, one per pillar (extending existing `serviceSchemas`
  array). Coming-soon leaves are NOT added to schema until they're authored.
- BreadcrumbList must use absolute URLs (`https://www.metaborong.com/...`).
- `FAQPage` per leaf is rate-limited to its own questions — don't duplicate across pages.

---

## 6. Content depth per v1 leaf

Target: **800 words ± 200** of substantive, authored content per v1 leaf page. Floor
of 600 to stay out of thin-content territory. Word budget allocation:

| Block                          | Words   | Notes                                                                  |
|--------------------------------|---------|------------------------------------------------------------------------|
| Hero lede                      | 120–180 | Entity-definition opener, 2–3 deliverables, AEO-eligible.              |
| What we deliver (bullets)      | 80–120  | 4–6 deliverables × 14-word avg.                                        |
| How we work (3–4 phases)       | 180–240 | Each phase 50–60 words.                                                |
| When this fits / doesn't       | 90–120  | 3 bullets × 2 columns × ~18 words.                                     |
| AEO answer block               | 40–60   | One paragraph, two verifiable facts.                                   |
| Related work blurbs            | 40–60   | Two anonymized cards × ~25 words.                                      |
| FAQ                            | 200–280 | 3–4 Q&As × ~70 words combined.                                         |
| **Total**                      | **750–1060** | Comfortably above the 600 floor.                                   |

Constraints (per DESIGN.md):

- Body sentence target 12–14 words. Em-dash and colon over connective phrases.
- No marketing inflation: no `revolutionary`, `game-changing`, `best-in-class`,
  `cutting-edge`, `world-class`. Every claim verifiable.
- AEO blockquote: 40–60 words, two verifiable facts (numerical, geographic,
  organizational). **DID leaf: one of the two facts must reference Aadhaar-scale
  deployment.**
- Bullets ≤16 words.
- Eyebrow uses `<Eyebrow>` primitive.
- Tech-stack strip uses JetBrains Mono, restrained list, no logo soup.

Total v1 content: 16 leaves × ~800 words ≈ **12,800 words** of authored marketing
content. Realistic for a 3-founder team to ship in 2–3 weeks with one founder reviewing.

---

## 7. UX considerations

### Primary navigation

`Services` becomes a top-level nav item (already in the route tree). On hover/tap it
opens a mega-menu with 3 pillar columns × 3 sub-group rows, each row showing **v1
leaves only** (coming-soon hidden from nav). Mobile collapses to a stacked accordion.
Mega-menu spec is **separate scope** — not blocking this work.

### Less-technical buyer entry

The **outcome strip** on `/services/` is the dedicated entry for buyers who think in
problems, not capabilities. Four outcomes — the "Modernize a legacy system" outcome
from the interview is dropped because IT Services is no longer a public pillar; the
GovTech/DID outcome takes its slot:

1. `Launch a new product` → `/services/product-studio/mvp-development/`
2. `Add AI to your product` → `/services/ai/llm-integration-architecture/`
3. `Launch a token or DeFi protocol` → `/services/web3/`
4. `Build a verified-identity / DID system` → `/services/web3/decentralized-identity-did-integration/`

Each outcome card is a single tap target with a one-sentence clarifier. Visually
distinct from the pillar grid (smaller, denser, no signature visual). The DID outcome
deliberately surfaces the GovTech credential without making it a pillar.

### Technical buyer entry

The pillar grid + leaf depth handles this audience. Three clicks max from `/services/`
to any v1 leaf page.

### Primary and secondary CTAs

DESIGN.md mandates ≤3 words for primary CTAs and bans the `Start | See | Explore | View`
family.

| Tier              | Primary CTA       | Secondary CTA            | Tertiary affordance       |
|-------------------|-------------------|--------------------------|----------------------------|
| Overview          | `Talk to us`      | `Read case studies`      | Outcome strip cards: `Open` |
| Pillar hub        | `Talk to us`      | `Read case studies`      | Per sub-group: leaf list links |
| Leaf              | `Talk to us`      | `Read related work`      | Related-services row links |

### Accessibility

- All breadcrumbs render server-side with `<nav aria-label="Breadcrumb">`.
- All accordion sub-groups (mobile) operable via Enter/Space, with `aria-expanded`.
- Tap targets ≥44×44px on leaf cards.
- Tab order: hero → outcome strip → pillar grid → trust band → FAQ → CTA.
- `prefers-reduced-motion: reduce` short-circuits reveal animations.
- Coming-soon leaf cards must use `aria-disabled="true"` (not just visual dimming).

---

## 8. Trust signals integration

| Surface                 | Trust elements                                                                                                              |
|-------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| `/services/`            | `trust-bar.tsx` client-logo marquee at top (existing). `clutch-widget.tsx` after the pillar grid. Engagement model strip (re-iterates seniority/process). |
| `/services/{pillar}/`   | One anonymized case study card per sub-group section (3 per pillar hub). `clutch-widget.tsx` in the lower trust band. No client logos on pillar pages — case-study cards carry the signal. |
| `/services/{leaf}/`     | 1–2 anonymized "Related work" cards. `clutch-widget.tsx` in the lower trust band. AEO answer block + tech-stack strip signal technical depth. |
| Site-wide               | Founders, why-us, FAQ already live on home — not duplicated in services.                                                    |

Case-study cards in this plan are **placeholders** with anonymized descriptors only.
Examples authored at scaffold time:

- "Series-A DeFi protocol — 6-week smart-contract delivery, third-party audited"
- "Aadhaar-integrated DID rollout — verified-identity layer at production scale"
- "Mid-market SaaS — RAG copilot over 2.4M support tickets"

These map to real Metaborong engagements only after user-supplied case-study content
lands. No invented client names. No fabricated metrics.

---

## 9. Honest risk assessment

### Risk 1 — Pillar overlap (cannibalization)

The three pillars still overlap on common buyer questions:

- **"Add AI to my SaaS product"** could land on AI (Engineering / LLM Integration) or
  Product Studio (Engineering / Backend, when scaffolded). Outcome card #2 routes
  unambiguously to LLM Integration.
- **"Build a SaaS"** routes to Product Studio. The only ambiguity is Web3 SaaS,
  which goes to Web3.

**Mitigation.** Hero copy on every pillar hub leads with a positioning sentence:
AI = "we add AI to your product"; Web3 = "we ship on-chain systems";
Product Studio = "we build the first version from zero". The outcome strip routes
each ambiguous query to the canonical pillar.

### Risk 2 — Thin content on AI Strategy leaves

`AI Audit & Opportunity Assessment` (v1) is adjacent to `AI Adoption Roadmap`
(coming-soon). When the roadmap leaf is authored, the differentiation must be
explicit: Audit = "what could AI do here?"; Roadmap = "how do we sequence the work?".
Until then there's no overlap risk because Roadmap is a stub.

### Risk 3 — v1 vs coming-soon discipline

Coming-soon URLs are noindex but reachable. Risk: they leak into nav, sitemap,
schema `OfferCatalog`, or related-services lists — Google sees orphan thin pages.

**Mitigation, must hold throughout scaffold:**

- `next-sitemap` / sitemap generator filters by `status === 'published'`.
- Schema `OfferCatalog` and per-leaf Service nodes filter by `status === 'published'`.
- Mega-menu and `<RelatedServices>` rows filter by `status === 'published'`.
- Pillar-hub sub-group cards SHOW coming-soon leaves but with `aria-disabled` and no
  `href` — they're a roadmap signal, not a navigable target.

### Risk 4 — Content volume commitment

16 v1 leaves × ~800 words ≈ **~13k words** of authored content. Realistic for a
3-founder team in 2–3 weeks with one founder reviewing. Adding the 14 coming-soon
leaves later is a deliberate later-bet, not a v1 blocker.

### Risk 5 — `services-data.ts` is multi-consumer

The current `pillars` array is consumed by `services-pillars.tsx`,
`services-trefoil.tsx`, `services.tsx`, `services-iso-canvas.tsx`, and `lib/schema.ts`.
The atomic refactor must:

- Rename `ai-agents` → `ai` everywhere.
- Update sub-group structure (flatten current `children` array into
  `{ subGroup, leaf, status, ... }` records or nest under `subGroups[]`).
- Add `status: 'published' | 'coming-soon'` per leaf.
- Add the new `decentralized-identity-did-integration` leaf.
- Update product-studio slug renames.
- Keep the homepage trefoil rendering correctly through the change (it uses the top
  3 leaves per pillar — must filter to v1 published only).

Plan: do the data refactor first, in a single commit, with consumers updated in lockstep.

### Risk 6 — Greenfield-only Product Studio means lost leads

Buyers who arrive with "we have a v1 SaaS, need v2 features" don't have a clean home
in the public taxonomy (IT Services is no longer marketed). **Mitigation.** Contact CTA
copy and the FAQ on `/services/` explicitly invite "we already have a product, need
help with the next phase" — those leads are handled in conversation. No marketing page
for v2/v3 work means no false promise, and the buyer still has a path in.

### Risk 7 — DID leaf is the only India-explicit leaf

`decentralized-identity-did-integration` leans hard on Aadhaar / UIDAI as the keyword
anchor and AEO fact. Other Web3 leaves stay global. Risk: keyword targeting drives a
mostly-Indian audience to that one leaf, which is desired — but it must not cannibalize
the broader Web3 hub for global queries. **Mitigation.** Pillar-hub meta title includes
"DID" only after "Smart Contracts" and "DeFi" — the hub stays globally-positioned;
the leaf carries the India/Aadhaar weight.

### Risk 8 — Subsidiaries pulled in later

If CropXcel or Deoxys generate strong leads via the parent brand, there will be
pressure to thread them through services. The clean path is to keep them in a
`Ventures` strip and use them only as case-study evidence under existing leaves.

---

## Open decisions before scaffold

1. **`lib/services/seo-map.ts`** to be authored next, before scaffold, for user
   review (per instruction). Contains the 16 v1 entries only.
2. **Mega-menu**: separate ticket; this scaffold leaves the existing nav as-is.

---

## Scaffold plan (post-approval)

1. Refactor `components/sections/services-data.ts`:
   - Rename `ai-agents` → `ai` in `PillarId` and all references.
   - Add new pillar field for sub-groups, e.g.:
     ```ts
     type SubGroup = { id: 'strategy' | 'product' | 'engineering'; label: string; children: ChildService[] }
     type ChildService = { name: string; description: string; slug: string; status: 'published' | 'coming-soon' }
     ```
   - Add `decentralized-identity-did-integration` leaf under Web3 / engineering.
   - Apply Product Studio slug renames.
   - Update all consumers (`services-pillars.tsx`, `services-trefoil.tsx`,
     `services.tsx`, `services-iso-canvas.tsx`, `lib/schema.ts`) atomically.
2. Build three template components under `components/services/`:
   `services-overview.tsx`, `pillar-hub.tsx`, `leaf-service.tsx`.
3. Rewrite `app/services/page.tsx` (overview), `app/services/[pillar]/page.tsx`
   (hub), `app/services/[pillar]/[slug]/page.tsx` (leaf — branches on `status`).
4. Wire `lib/services/seo-map.ts` into `generateMetadata` for v1 leaves; keep
   `robots: { index: false }` for coming-soon.
5. Extend `lib/schema.ts` with v1-leaf `Service` nodes and per-page
   `BreadcrumbList` builders. Filter `OfferCatalog` by `status === 'published'`.
6. Add `next.config` redirect rules per § 2.
7. Stub case-study cards with anonymized descriptors only.
8. Update sitemap generator (if present) to filter coming-soon URLs.
9. QA per DESIGN.md checklist + manual screen-reader pass on one of each
   template type.

---

## Acceptance criteria

- All 3 pillars resolve. All 16 v1 leaves resolve with full templates. All 14
  coming-soon leaves resolve as noindex stubs.
- Every v1 leaf page has ≥600 authored words (no lorem, no invented client names).
- DID leaf AEO answer block explicitly references Aadhaar-scale deployment.
- All schema validates (Rich Results Test on one of each template type). Coming-soon
  leaves do not appear in `OfferCatalog` or sitemap.
- DESIGN.md tokens used throughout — no raw hex, no off-grid spacing.
- `prefers-reduced-motion: reduce` short-circuits all motion in the new templates.
- Mobile-first: every block readable and interactive at 375×667 viewport.
- Brand palette only: blue / white / AI green / accent orange — no new colors.
- All primary CTAs use the approved verb list (`Talk`, `Open`, `Read`, `Get`, `Ship`).
- No marketing-inflation copy (lint pass for the banned words).
- All `ai-agents` → `ai` redirects return 308 and land on the correct destination.
