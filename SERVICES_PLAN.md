# SERVICES_PLAN.md

Implementation plan for the Metaborong services section, modelled on labrys.io's
pillar / sub-group / leaf architecture but adapted to Metaborong's four-pillar reality
and Indian + global market posture.

Status: **awaiting user approval before scaffolding**. After approval, the route
templates in `app/services/**` and the data layer in `components/sections/services-data.ts`
will be rewritten to match this plan.

---

## 1. Final taxonomy

Four pillars. Three sub-groups per pillar. Three to four leaf services per sub-group.
First three pillars use the labrys-style `Strategy / Product / Engineering` triad;
IT Services swaps the middle group to `Operations` because managed services and SRE
don't fit a "Product" frame. Total: **39 leaf services**.

```
services
├── ai/                              Production AI capability
│   ├── strategy/
│   │   ├── ai-audit-opportunity-assessment
│   │   ├── ai-adoption-roadmap
│   │   └── ai-education-workshops
│   ├── product/
│   │   ├── ai-copilots-internal-tools
│   │   ├── conversational-agents-assistants
│   │   └── ai-augmented-customer-journeys
│   └── engineering/
│       ├── agentic-ai-systems
│       ├── rag-retrieval-pipelines
│       ├── llm-integration-architecture
│       └── ai-evaluation-monitoring
│
├── web3/                            Decentralised protocol engineering
│   ├── strategy/
│   │   ├── web3-tokenomics-design
│   │   ├── protocol-architecture-review
│   │   └── web3-product-discovery
│   ├── product/
│   │   ├── nft-marketplace-development
│   │   ├── crypto-wallet-development
│   │   └── dao-governance-systems
│   └── engineering/
│       ├── smart-contract-development
│       ├── defi-protocol-development
│       ├── token-launchpad-distribution
│       └── liquid-staking-vaults
│
├── product-studio/                  Greenfield product engineering
│   ├── strategy/
│   │   ├── product-discovery-validation
│   │   ├── technical-architecture-planning
│   │   └── mvp-scoping-roadmapping
│   ├── product/
│   │   ├── mvp-development
│   │   ├── saas-product-development
│   │   └── b2b-multi-tenant-platforms
│   └── engineering/
│       ├── frontend-engineering
│       ├── backend-api-engineering
│       └── design-systems-component-libraries
│
└── it-services/                     Cloud, modernization & operations
    ├── strategy/
    │   ├── cloud-strategy-migration-assessment
    │   ├── legacy-modernization-assessment
    │   └── security-compliance-audit
    ├── operations/
    │   ├── application-managed-services
    │   ├── devops-sre-as-a-service
    │   └── infrastructure-monitoring-incident-response
    └── engineering/
        ├── cloud-migration-re-platforming
        ├── legacy-system-modernization
        ├── enterprise-system-integrations
        └── cybersecurity-compliance-implementation
```

### Pillar identity

| Pillar         | Slug             | Color (hex)  | Token alias                | One-line position                                                |
|----------------|------------------|--------------|----------------------------|------------------------------------------------------------------|
| AI             | `ai`             | `#10b981`    | `color.brand.ai` (existing)| We add production AI capability to existing products and teams. |
| Web3           | `web3`           | `#296ff0`    | `color.brand.primary` (existing) | We design and ship the protocols, wallets, and on-chain systems. |
| Product Studio | `product-studio` | `#F6851B`    | `color.brand.accent` (existing) | We build the first version of your product, end-to-end.        |
| IT Services    | `it-services`    | `#475569`    | `color.brand.it` (**new**) | We modernize, operate, and harden the systems you already run.  |

**Color note.** A fourth pillar color is required. `#475569` (slate-600) is proposed
because it (a) reads as operational/enterprise vs the brand-blue-coded greenfield work,
(b) extends the structural slate family already in `services-glyphs.tsx`
(`#94a3b8` / `#cbd5e1` / `#e2e8f0`), (c) maintains AA contrast on white. The token
`--color-brand-it` must be added to `app/globals.css` and registered in `DESIGN.md`
before any IT pillar UI ships.

### Exclusions (do not author leaves for these)

- Hardware, IoT, firmware, embedded systems.
- Novel ML model training from scratch (computer vision research, custom foundation
  models). We integrate, fine-tune, and adapt off-the-shelf models — leaves and copy
  must reflect that, not imply we run an ML lab.

### Subsidiary treatment

Deoxys and CropXcel are **not** services. They surface in a dedicated `Ventures` strip
(future addition, not in scope for this plan) and appear as case studies on relevant
pillar / leaf pages once we have real metrics to publish. The services taxonomy stays
pure: it describes what we sell as engagements, not what we operate as products.

### Renames from current `services-data.ts`

The current scaffolding uses `PillarId = 'web3' | 'ai-agents' | 'product-studio'`.
This plan changes that to `'ai' | 'web3' | 'product-studio' | 'it-services'`. The
`ai-agents` → `ai` rename loses no SEO value (current routes are `robots: { index: false }`).
A redirect `from /services/ai-agents` → `/services/ai` should be added to `next.config`
for safety in case anything internal still links it.

---

## 2. URL structure

Pattern preserved from current scaffolding (`/services/{pillar}/{leaf}/`) rather than
adopting labrys' flat `/services-{pillar}/` because (a) `/services/` already exists in
the codebase, (b) nested IA cleanly supports a single `/services` overview page, and
(c) trailing-slash discipline already configured in Next.js routing.

All routes end in a trailing slash (Next.js 16 default; matches existing pattern).

### Hub-level

| URL                              | Purpose                                              |
|----------------------------------|------------------------------------------------------|
| `/services/`                     | Services overview — outcome strip + 4 pillar cards. |
| `/services/ai/`                  | AI pillar hub.                                       |
| `/services/web3/`                | Web3 pillar hub.                                     |
| `/services/product-studio/`      | Product Studio pillar hub.                           |
| `/services/it-services/`         | IT Services pillar hub.                              |

### Leaf-level (full list, 39 URLs)

**AI (10):**
- `/services/ai/ai-audit-opportunity-assessment/`
- `/services/ai/ai-adoption-roadmap/`
- `/services/ai/ai-education-workshops/`
- `/services/ai/ai-copilots-internal-tools/`
- `/services/ai/conversational-agents-assistants/`
- `/services/ai/ai-augmented-customer-journeys/`
- `/services/ai/agentic-ai-systems/`
- `/services/ai/rag-retrieval-pipelines/`
- `/services/ai/llm-integration-architecture/`
- `/services/ai/ai-evaluation-monitoring/`

**Web3 (10):**
- `/services/web3/web3-tokenomics-design/`
- `/services/web3/protocol-architecture-review/`
- `/services/web3/web3-product-discovery/`
- `/services/web3/nft-marketplace-development/`
- `/services/web3/crypto-wallet-development/`
- `/services/web3/dao-governance-systems/`
- `/services/web3/smart-contract-development/`
- `/services/web3/defi-protocol-development/`
- `/services/web3/token-launchpad-distribution/`
- `/services/web3/liquid-staking-vaults/`

**Product Studio (9):**
- `/services/product-studio/product-discovery-validation/`
- `/services/product-studio/technical-architecture-planning/`
- `/services/product-studio/mvp-scoping-roadmapping/`
- `/services/product-studio/mvp-development/`
- `/services/product-studio/saas-product-development/`
- `/services/product-studio/b2b-multi-tenant-platforms/`
- `/services/product-studio/frontend-engineering/`
- `/services/product-studio/backend-api-engineering/`
- `/services/product-studio/design-systems-component-libraries/`

**IT Services (10):**
- `/services/it-services/cloud-strategy-migration-assessment/`
- `/services/it-services/legacy-modernization-assessment/`
- `/services/it-services/security-compliance-audit/`
- `/services/it-services/application-managed-services/`
- `/services/it-services/devops-sre-as-a-service/`
- `/services/it-services/infrastructure-monitoring-incident-response/`
- `/services/it-services/cloud-migration-re-platforming/`
- `/services/it-services/legacy-system-modernization/`
- `/services/it-services/enterprise-system-integrations/`
- `/services/it-services/cybersecurity-compliance-implementation/`

### Redirects

- `/services/ai-agents/` → `/services/ai/` (308)
- `/services/ai-agents/{old-slug}/` → `/services/ai/{new-slug}/` (308) — current `ai-agents`
  leaves map cleanly to the new `ai/engineering/` sub-group; full mapping table below.

| Old leaf (`ai-agents`)        | New leaf (`ai`)                              |
|-------------------------------|----------------------------------------------|
| `agentic-ai-systems`          | `engineering/agentic-ai-systems`             |
| `rag-knowledge-systems`       | `engineering/rag-retrieval-pipelines`        |
| `generative-ai-development`   | `engineering/llm-integration-architecture` (closest fit; flag if you want a separate leaf) |
| `voice-agent-integration`     | `product/conversational-agents-assistants`   |
| `ai-workflow-automation`      | `product/ai-augmented-customer-journeys`     |
| `ai-systems-integration`      | `engineering/llm-integration-architecture`   |

Web3 and Product Studio existing leaves keep their slugs and move into the new
sub-group structure — no redirects needed.

---

## 3. Page templates

Three templates total. Each one is a server component that reads from `services-data.ts`,
uses the existing `<Section>` primitive, and short-circuits motion under
`prefers-reduced-motion: reduce`.

### Template A — Services overview (`/services/`)

| Block                  | Purpose                                                                                       |
|------------------------|-----------------------------------------------------------------------------------------------|
| **Hero**               | Eyebrow `SERVICES`, H1 `What we build`, 130–180 word AEO-eligible lede with entity-definition opener (`Metaborong is a…`). Primary CTA `Talk to us` (≤3 words). |
| **Outcome strip**      | Compact horizontal row of 4 outcome cards: `Launch a new product`, `Add AI to your product`, `Modernize a legacy system`, `Launch a token or DeFi protocol`. Each card has a single line of clarifier copy + a "Open" arrow link deep-linking to the most relevant leaf or pillar hub. Above the pillar grid; visually distinct (small/compact, not large pillar tiles) to avoid a second pillar mental model. |
| **Pillar grid**        | 2×2 grid (lg) / 1-col (mobile) of pillar cards. Each card: pillar number `01`, eyebrow color bar, label, one-line headline, 2-sentence body, 3 sub-group bullet rows showing the leaf names (max 3 per sub-group on this card, "+N more" if overflow), pillar CTA `Open {pillar}`. |
| **Engagement model strip** | 3 small panels: `Discovery (1–2 wks)` / `Build (4–16 wks)` / `Operate (ongoing)`. Anchors the engagement vocabulary across all four pillars. Plain text, no signature visual. |
| **Trust band**         | Reuses `components/sections/clutch-widget.tsx` + `trust-bar.tsx`. Already-shipped components. |
| **FAQ**                | 5 services-overview FAQs: how engagements start, typical engagement length, where the team is based, who owns IP, retainer vs. fixed-bid. Reuses `faq.tsx` pattern. |
| **Contact CTA**        | Reuses `components/sections/contact-cta.tsx`. |

### Template B — Pillar hub (`/services/{pillar}/`)

Direct adaptation of the labrys pillar-page structure.

| Block                          | Purpose                                                                          |
|--------------------------------|----------------------------------------------------------------------------------|
| **Breadcrumb**                 | `Home > Services > {Pillar}`. Renders as visible breadcrumb AND `BreadcrumbList` schema. |
| **Hero**                       | Pillar-numbered eyebrow `01 · AI`, H1 (pillar headline, e.g., `Production AI capability`), 200–300 word intro that opens with the entity-definition pattern and lists what's inside the pillar. Primary CTA `Talk to us`, secondary `Read case studies`. |
| **Sub-group sections (×3)**    | Numbered `01` / `02` / `03`. Each section has: section header (number + name + 1-paragraph description), one case study card (anonymized stub linking to `/work`), and a grid of 3–4 leaf cards. Each leaf card: name, 1-sentence description, `Open` link. Mirrors labrys' "Section 01: Consulting & Strategy" structure. |
| **Engagement model strip**     | Same 3-panel strip as overview, but tailored vocabulary to the pillar (e.g., AI: `Audit → Build → Operate & Govern`). |
| **Cross-pillar links**         | Small "Adjacent capabilities" row at the bottom: links to the 3 other pillar hubs. Helps both buyers and crawlers traverse. |
| **FAQ**                        | 5–6 pillar-specific FAQs (e.g., AI FAQs differ from Web3 FAQs). |
| **Contact CTA**                | Reuses `contact-cta.tsx`. |

### Template C — Leaf service page (`/services/{pillar}/{leaf}/`)

Genuinely substantive page — minimum 600 words of authored content, target 800–1000.

| Block                              | Purpose                                                                                  |
|------------------------------------|------------------------------------------------------------------------------------------|
| **Breadcrumb**                     | `Home > Services > {Pillar} > {Leaf}`. Visible + schema. |
| **Hero**                           | Eyebrow `{PILLAR} · {SUB-GROUP}` (e.g., `AI · ENGINEERING`), H1 = leaf service name (verbatim, keyword-aligned), 120–180 word lede that opens with entity-definition (`{Service} is a {category} that {outcome}.`) and lists 2–3 concrete deliverables. Primary CTA `Talk to us`. |
| **What we deliver**                | 4–6 deliverable bullets or compact cards (≤16 words each per DESIGN.md). Concrete: artefacts, not capabilities. Example for `smart-contract-development`: "Solidity / Vyper contracts, third-party-audit-ready specs, deployment scripts and verification, unit + invariant test suites, post-deploy monitoring hooks". |
| **How we work**                    | 3–4 phase steps specific to this service. Phase title + 1-paragraph (40–60 words) explanation. NOT generic "discovery / build / ship" — must be service-shaped (e.g., for AI Audit: "Inventory → Score → Prioritize → Roadmap"). |
| **Tech / stack**                   | Compact strip of technologies. Restraint: 6–10 items max, no logo soup. Mono font, JetBrains Mono per DESIGN.md eyebrow style. |
| **When this fits / When it doesn't** | Two-column honest-scope block. Three bullets per side. A trust signal in itself — buyers self-disqualify, and that's the point. Example for `mvp-development`: Fits = "founder without an in-house CTO, clear hypothesis to test, 4–12 week target". Doesn't fit = "no defined hypothesis, expects fixed-bid on a moving spec, enterprise procurement with 6-month RFP cycle". |
| **AEO answer block**               | One 40–60 word answer paragraph in the form `{Service name} is a {category} for {audience} that {outcome}. {Verifiable fact 1}. {Verifiable fact 2}.` Targets Perplexity / AI Overviews; surfaced in `FAQPage` schema even when the visible UI is prose. |
| **Related work**                   | 1–2 anonymized case-study cards (linking to `/work` or `/blog`). Card copy uses descriptors not names — e.g., "Series-A DeFi protocol — 6-week smart-contract delivery, third-party audited", "GovTech rollout — Aadhaar-integrated KYC layer". No invented client names, no fabricated metrics. |
| **Related services**               | 3 sibling/cousin leaf links (2 from same pillar + 1 cross-pillar). Improves internal-link graph and gives the buyer the lateral options. |
| **FAQ**                            | 3–4 leaf-specific Q&As. Becomes `FAQPage` schema. |
| **Contact CTA**                    | Reuses `contact-cta.tsx`. |

---

## 4. SEO plan per page

Global English first, India focus secondary (per stated market posture). Slugs and
meta titles avoid geo qualifiers; areaServed and trust copy mention India where it
reinforces credibility.

### Overview (`/services/`)

| Field              | Value                                                                              |
|--------------------|------------------------------------------------------------------------------------|
| Target keyword     | `metaborong services` (brand + transactional)                                      |
| Secondary terms    | `ai and web3 development services`, `boutique software studio`                    |
| Meta title         | `Services — AI, Web3, Product Studio, IT — Metaborong`                            |
| Meta description   | `AI integration, Web3 protocols, greenfield product builds, and cloud modernization from a senior boutique studio. India + global.`  (≤160 chars) |
| Internal links to  | All 4 pillar hubs, top 4 outcome leaves, `/work`, `/blog`, `/contact`              |
| Linked from        | Main nav, footer, all pillar hubs (breadcrumb), every leaf (breadcrumb)            |

### Pillar hubs

| Pillar         | Target keyword                              | Meta title                                                | Meta description target (≤160 chars)                                                                          |
|----------------|---------------------------------------------|-----------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|
| AI             | `ai development services`                   | `AI Development Services — Copilots, Agents, RAG — Metaborong` | `Production AI capability: copilots, RAG, agentic systems, integration, and governance. Senior team, India + global.` |
| Web3           | `web3 development services`                 | `Web3 Development Services — Smart Contracts, DeFi, NFT — Metaborong` | `Smart-contract, DeFi, NFT, wallet, and DAO engineering. Multichain protocol studio from India, global delivery.` |
| Product Studio | `mvp development services` / `saas product studio` | `Product Studio — MVP, SaaS, B2B Product Builds — Metaborong` | `Greenfield product builds for founders without a CTO. MVP, SaaS, and B2B multi-tenant platforms, end-to-end.` |
| IT Services    | `cloud and legacy modernization services`   | `IT Services — Cloud, Modernization, Managed Ops — Metaborong` | `Cloud migration, legacy modernization, DevOps/SRE retainers, and security & compliance. Operate what we (or you) built.` |

Internal-link policy on every pillar hub: all of its own leaves, 1 link to each of the
other 3 pillar hubs, 2–3 case studies in `/work`, the services overview.

### Leaf pages — keyword strategy

Each leaf targets one long-tail intent. Slug is the canonical phrase, H1 echoes it
verbatim (case-styled), meta title puts the keyword first, meta description includes
a verb (`build`, `audit`, `modernize`) and an outcome.

Full per-leaf table appears in **§ 4b** below (kept separate to avoid cluttering this
overview). Spot examples:

| Slug                                         | Target keyword                            | Meta title                                                            |
|----------------------------------------------|-------------------------------------------|-----------------------------------------------------------------------|
| `ai/agentic-ai-systems`                      | `agentic ai development`                  | `Agentic AI Systems Development — Metaborong`                         |
| `ai/rag-retrieval-pipelines`                 | `rag pipeline development`                | `RAG & Retrieval Pipeline Development — Metaborong`                   |
| `web3/smart-contract-development`            | `smart contract development services`     | `Smart Contract Development Services — Metaborong`                    |
| `web3/defi-protocol-development`             | `defi protocol development`               | `DeFi Protocol Development — Lending, AMM, Vaults — Metaborong`       |
| `product-studio/mvp-development`             | `mvp development services`                | `MVP Development Services — Founder-Led Builds — Metaborong`          |
| `it-services/cloud-migration-re-platforming` | `cloud migration services`                | `Cloud Migration & Re-Platforming Services — Metaborong`              |
| `it-services/legacy-system-modernization`    | `legacy system modernization services`    | `Legacy System Modernization Services — Metaborong`                   |

#### 4b. Per-leaf keyword table

The full 39-row keyword map will live in `lib/services/seo-map.ts` once scaffolded
(typed as `Record<leafSlug, { keyword: string; title: string; description: string }>`)
so meta exports stay co-located with the data and never drift from the leaf list.
Initial draft in this plan; user reviews and refines before scaffold. (Table omitted
here for brevity — will be added inline before scaffold if requested.)

---

## 5. Schema.org markup plan

Existing `lib/schema.ts` already ships `Organization`, `WebSite`, `FAQPage`, and a
`serviceSchemas` array. Extending, not replacing.

### Per page

| Page                 | Schema emitted                                                                                                                                  |
|----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| `/services/`         | `BreadcrumbList` (Home → Services), `ItemList` of `Service` references for the 4 pillars                                                        |
| `/services/{pillar}/`| `BreadcrumbList` (Home → Services → Pillar), `Service` node for the pillar with `hasOfferCatalog` listing its leaves (extends existing pattern), `FAQPage` if FAQ block present |
| `/services/{leaf}/`  | `BreadcrumbList` (Home → Services → Pillar → Leaf), `Service` node for the leaf with `provider: { @id: ORG_ID }` and `areaServed: "Worldwide"`, `FAQPage` from the FAQ block + AEO answer |

### Service node shape per leaf (new addition to `lib/schema.ts`)

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
  isRelatedTo: [<2–3 sibling leaf @ids>],
}
```

### Organization update

`organizationSchema.knowsAbout` to be extended from the current 6 items to a curated
10–12 covering the new pillar headlines. `areaServed` already `Worldwide` — kept.

### Caveats

- One `Service` node per leaf, one per pillar (extending existing `serviceSchemas`
  array). The existing pillar `OfferCatalog` already lists children; this stays.
- BreadcrumbList must use absolute URLs (`https://www.metaborong.com/...`) per current
  schema convention.
- `FAQPage` per leaf is rate-limited to its own questions — don't duplicate across pages
  (Google penalizes near-duplicate FAQ schema).

---

## 6. Content depth per leaf

Target: **800 words ± 200** of substantive, authored content per leaf page. Floor of
600 to stay out of thin-content territory. No leaf ships as a stub. Word budget allocation:

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
  organizational).
- Bullets ≤16 words.
- Eyebrow uses `<Eyebrow>` primitive.
- Tech-stack strip uses JetBrains Mono, restrained list, no logo soup.

---

## 7. UX considerations

### Primary navigation

`Services` becomes a top-level nav item (already exists in the route tree). On hover/tap
it opens a mega-menu with 4 pillar columns × 3 sub-group rows, each row showing 1–3 leaf
links — labrys-style. Mobile collapses to a stacked accordion. (Mega-menu spec is a
separate scope item — flagged but not blocking the page work.)

### Less-technical buyer entry

The **outcome strip** on `/services/` is the dedicated entry for buyers who think in
problems, not capabilities. Four outcomes (from user interview):

1. `Launch a new product` → `/services/product-studio/mvp-development/`
2. `Add AI to your product` → `/services/ai/llm-integration-architecture/`
3. `Modernize a legacy system` → `/services/it-services/legacy-system-modernization/`
4. `Launch a token or DeFi protocol` → `/services/web3/`

Each outcome card is a single tap target with a one-sentence clarifier. Visually
distinct from the pillar grid (smaller, denser, no signature visual) to prevent
buyers from treating outcomes as a second pillar taxonomy.

### Technical buyer entry

The pillar grid + leaf depth handles this audience. They scan the grid, click the
pillar that matches their stack, scan sub-groups on the pillar hub, and land on a
leaf — three clicks max from `/services/` to a leaf page.

### Primary and secondary CTAs

DESIGN.md mandates ≤3 words for primary CTAs and bans the `Start | See | Explore | View`
family. Selected verbs:

| Tier              | Primary CTA       | Secondary CTA            | Tertiary affordance       |
|-------------------|-------------------|--------------------------|----------------------------|
| Overview          | `Talk to us`      | `Read case studies`      | Outcome strip cards: `Open` |
| Pillar hub        | `Talk to us`      | `Read case studies`      | Per sub-group: leaf list links |
| Leaf              | `Talk to us`      | `Read related work`      | Related-services row links |

`Talk to us` is the canonical site-wide CTA. `Read case studies` replaces the banned
`See/View case studies`. Leaf-card links use `Open` (3-letter primitive, no marketing
weight).

### Accessibility

- All breadcrumbs render server-side with `<nav aria-label="Breadcrumb">`.
- All accordion sub-groups (if accordion-stylized on mobile) operable via Enter/Space,
  with `aria-expanded`.
- Tap targets ≥44×44px on leaf cards.
- Tab order: hero → outcome strip → pillar grid → trust band → FAQ → CTA.
- `prefers-reduced-motion: reduce` short-circuits reveal animations (already handled
  by the `<Section>` / `<Reveal>` primitives).

---

## 8. Trust signals integration

| Surface                 | Trust elements                                                                                                              |
|-------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| `/services/`            | `trust-bar.tsx` client-logo marquee at top (existing). `clutch-widget.tsx` after the pillar grid. Engagement model strip (re-iterates seniority/process). |
| `/services/{pillar}/`   | One anonymized case study card per sub-group section (3 per pillar hub). `clutch-widget.tsx` in the lower trust band. No client logos on pillar pages — case-study cards carry the signal, matching labrys' restraint. |
| `/services/{leaf}/`     | 1–2 anonymized "Related work" cards. `clutch-widget.tsx` in the lower trust band. AEO answer block doubles as a "what we deliver" credibility marker. Tech-stack strip signals technical depth. |
| Site-wide               | Founders, why-us, FAQ already live on home — not duplicated in services to avoid SEO content collisions.                    |

Case-study cards in this plan are **placeholders** with anonymized descriptors only.
Examples authored at scaffold time:

- "Series-A DeFi protocol — 6-week smart-contract delivery, third-party audited"
- "GovTech rollout — Aadhaar-integrated KYC layer"
- "Mid-market SaaS — RAG copilot over 2.4M support tickets"

These map to real Metaborong engagements only after user-supplied case-study content
lands. No invented client names. No fabricated metrics.

---

## 9. Honest risk assessment

### Risk 1 — Pillar cannibalization

The four pillars overlap on common buyer questions:

- **"Add AI to my SaaS product"** could land on AI (Engineering / LLM Integration),
  Product Studio (Engineering / Backend), or IT Services (Enterprise Integrations).
- **"Build a SaaS"** could land on Product Studio (zero-to-one) or IT Services (if
  legacy system replacement).
- **"Web3 + AI"** (e.g., AI auditor for smart contracts) sits in neither pillar cleanly.

**Mitigation.** Hero copy on every pillar hub leads with a positioning sentence that
draws the line: AI = "we add AI to your product"; Web3 = "we ship on-chain systems";
Product Studio = "we build the first version from zero"; IT Services = "we modernize
and operate what you already run". The outcome strip on `/services/` routes each
ambiguous query to the canonical pillar.

### Risk 2 — Thin content likely on these leaves

The following sub-groups have high internal-overlap risk and will be hard to write at
800 words without repetition:

- **Product Studio / Strategy** — `Product Discovery & Validation`, `Technical
  Architecture Planning`, `MVP Scoping & Roadmapping` are three slices of the same
  pre-engineering phase. Genuine differentiation requires three distinct lenses.
- **IT Services / Operations** — `Application Managed Services`, `DevOps & SRE`,
  `Infrastructure Monitoring` overlap in tooling and team composition. The honest
  differentiator is engagement shape (incident-driven vs. proactive vs. observability-only),
  which has to be stated explicitly in each "When this fits" block.
- **AI / Strategy** — `Adoption Roadmap` and `Audit & Opportunity Assessment` are
  adjacent. The split is: Audit = "what could AI do here?"; Roadmap = "how do we
  sequence the work?". Must be stated explicitly in lede.

If the user wants to consolidate any of these, the cleanest cuts are: Product Studio
Strategy → 2 leaves (merge Discovery + MVP Scoping); IT Services Operations → 2 leaves
(merge Managed Services + Monitoring).

### Risk 3 — Content volume commitment

39 leaves × ~800 words = **~31,000 words** of authored marketing content the team
must keep current. At 1 leaf/week of revision (realistic for a 3-founder team),
that's a 10-month full-rotation cycle. **Implication:** any leaf with stale stack
names, expired keyword targets, or rotted case study references will silently degrade
SEO. Recommendation: add a "last reviewed" frontmatter to each leaf-data entry and
surface it in a dashboard view internally.

### Risk 4 — Outcome strip becomes a second taxonomy

If the outcome strip is styled too prominently, buyers will treat outcomes as
parallel pillars and ignore the pillar grid. Mitigation: outcome row sits ABOVE the
pillar grid, occupies less vertical space (compact card row, no signature visuals),
and uses smaller type than pillar headings. Outcome cards deep-link into the
canonical taxonomy, not parallel landing pages.

### Risk 5 — Color discipline

DESIGN.md currently locks 3 pillar colors. Adding a 4th (slate `#475569` for IT Services)
needs:

- A new `--color-brand-it` token added to `globals.css`.
- A new row in `DESIGN.md` § Color → Brand table.
- A `DESIGN.md` decision log entry.
- Updated trefoil glyphs (or an alternate signature visual) if IT Services is added to
  the homepage trefoil. If not added there, the homepage trefoil stays 3-pillar and the
  4th appears only on `/services/`. **Recommendation:** keep the homepage trefoil at
  3 pillars (the original 3 are the brand bet) and let `/services/` carry the full
  4-pillar IA. This is itself a deviation worth logging.

### Risk 6 — Subsidiaries pulled in later

If CropXcel or Deoxys generate strong leads via the parent brand, there will be
pressure to thread them through services. The clean path is to keep them in a
`Ventures` strip and use them only as case-study evidence under existing leaves —
not as their own services. Re-opening this decision later means restructuring the
URL graph; prefer holding the line.

### Risk 7 — Existing `services-data.ts` is multi-consumer

The current `pillars` array is consumed by `services-pillars.tsx`,
`services-trefoil.tsx`, `services.tsx`, `services-iso-canvas.tsx`, and `lib/schema.ts`.
A rename of `ai-agents` → `ai` and addition of a 4th pillar must update all
consumers atomically — or split the data into `homepageServices` (the 3 brand
pillars for the trefoil/hero) vs `fullServices` (4 pillars for the `/services` IA).
The split is the safer move; the plan adopts that approach at scaffold time.

### Risk 8 — Greenfield-only Product Studio means lost leads

The hard line "Product Studio = zero-to-one only" means a buyer who comes in with
"we have a v1 SaaS, need v2 features" gets routed to IT Services
(Enterprise Integrations) — which may feel wrong to them. **Mitigation.** Add an
explicit "When this doesn't fit" line on Product Studio leaves pointing at the right
IT Services leaf. Cross-link prominently.

---

## Open decisions before scaffold

1. **4th pillar color.** `#475569` (slate-600) proposed. Alternative: tertiary blue
   like `#1e3a8a` (navy) to stay in the brand-blue family. User confirms.
2. **Per-leaf SEO map table.** Full 39-row keyword map omitted from this plan for
   brevity; will be authored as `lib/services/seo-map.ts` at scaffold or pre-scaffold
   per user preference.
3. **`generative-ai-development` leaf retirement.** Current `ai-agents` pillar has
   this leaf; the exclusion (no novel ML model training) suggests it should redirect
   to `llm-integration-architecture` rather than survive as its own leaf. User confirms.
4. **Homepage trefoil**: stays 3-pillar (brand bet) or adopt 4-pillar (mirrors IA)?
   Plan recommends staying at 3 — IT Services appears only on `/services/`.
5. **Mega-menu**: in scope for this work, or separate ticket? Plan treats it as
   separate (the nav refactor touches every page).

---

## Scaffold plan (post-approval, condensed)

1. Add `--color-brand-it` token; update DESIGN.md decision log.
2. Refactor `components/sections/services-data.ts` into `lib/services/data.ts` with
   `pillars` (4 entries) + `homepagePillars` (3 of the 4 for the trefoil). Update all
   consumers atomically.
3. Build three template components under `components/services/`:
   `services-overview.tsx`, `pillar-hub.tsx`, `leaf-service.tsx`.
4. Rewrite `app/services/page.tsx` (overview), `app/services/[pillar]/page.tsx`
   (hub), `app/services/[pillar]/[slug]/page.tsx` (leaf) — remove `robots: index:false`.
5. Add `lib/services/seo-map.ts` and wire into `generateMetadata`.
6. Extend `lib/schema.ts` with leaf-level `Service` nodes and per-page
   `BreadcrumbList` builders.
7. Add `next.config` redirect rules from old `ai-agents` paths to new `ai` paths.
8. Stub case-study cards with anonymized descriptors only.
9. QA per DESIGN.md checklist + Lighthouse + manual screen-reader pass on one of each
   template type.

---

## Acceptance criteria

- All 4 pillars and 39 leaves resolve at the URLs in § 2.
- Every leaf page has ≥600 authored words (no lorem, no invented client names).
- All schema validates (Rich Results Test on one of each template type).
- DESIGN.md tokens used throughout — no raw hex, no off-grid spacing.
- `prefers-reduced-motion: reduce` short-circuits all motion in the new templates.
- Mobile-first: every block readable and interactive at 375×667 viewport.
- Brand palette only: blue / white / slate / accent / AI green — no new colors except
  the agreed slate-600.
- All primary CTAs use the approved verb list (`Talk`, `Open`, `Read`, `Get`, `Ship`).
- No marketing-inflation copy (lint pass for the banned words).
