// SEO metadata for v1 service leaf pages.
//
// One entry per published leaf. Coming-soon leaves are NOT in this map — their
// route renders a noindex stub with a generic title (see
// SERVICES_PLAN.md § 4 and § Risk 3).
//
// Each entry pins three SEO surfaces:
//   - keyword:     the canonical long-tail query the leaf is engineered to
//                  answer. Matches the slug; H1 echoes it verbatim.
//   - title:       <title> tag. ≤60 chars where possible; truncated by Google
//                  at ~60 chars desktop / ~78 mobile. Always ends with
//                  ` — Metaborong` for brand consistency.
//   - description: <meta name="description">. 130–160 chars, verb-first,
//                  includes one concrete deliverable. No marketing inflation
//                  (`revolutionary`, `cutting-edge`, etc. are banned per
//                  DESIGN.md § Writing Tone).
//
// Pillar IDs and sub-group IDs are imported from the data layer
// (services-data.ts) — single source of truth after the v2 refactor.

import type { PillarId, SubGroupId } from '@/components/sections/services-data'

export type { PillarId, SubGroupId }

export type LeafSeoEntry = {
  pillar: PillarId
  subGroup: SubGroupId
  slug: string
  keyword: string
  title: string
  description: string
}

export const v1LeafSeo: readonly LeafSeoEntry[] = [
  // ── AI ──────────────────────────────────────────────────────────────────────
  {
    pillar: 'ai',
    subGroup: 'strategy',
    slug: 'ai-audit-opportunity-assessment',
    keyword: 'ai audit and opportunity assessment',
    title: 'AI Audit & Opportunity Assessment — Metaborong',
    description:
      'Inventory AI opportunities across your product and operations, score by impact and feasibility, ship a 90-day roadmap. Senior AI team, India + global.',
  },
  {
    pillar: 'ai',
    subGroup: 'product',
    slug: 'ai-copilots-internal-tools',
    keyword: 'ai copilots and internal tools development',
    title: 'AI Copilots & Internal Tools Development — Metaborong',
    description:
      'Custom AI copilots and internal tools for support, sales, and ops teams. Grounded in your data, wired into your stack, shipped in weeks not quarters.',
  },
  {
    pillar: 'ai',
    subGroup: 'product',
    slug: 'conversational-agents-assistants',
    keyword: 'conversational ai agent development',
    title: 'Conversational AI Agents & Assistants — Metaborong',
    description:
      'Voice and chat agents that handle real workflows — discovery, support, scheduling. Built on production-grade LLM and retrieval infrastructure.',
  },
  {
    pillar: 'ai',
    subGroup: 'engineering',
    slug: 'agentic-ai-systems',
    keyword: 'agentic ai development services',
    title: 'Agentic AI Systems Development — Metaborong',
    description:
      'Multi-step autonomous agents that plan, use tools, and report results. Production-grade orchestration, evaluations, and guardrails included.',
  },
  {
    pillar: 'ai',
    subGroup: 'engineering',
    slug: 'rag-retrieval-pipelines',
    keyword: 'rag pipeline development',
    title: 'RAG & Retrieval Pipeline Development — Metaborong',
    description:
      'Retrieval pipelines that ground LLMs in your proprietary data. Embeddings, vector stores, reranking, and evaluations — production-tuned, not demoware.',
  },
  {
    pillar: 'ai',
    subGroup: 'engineering',
    slug: 'llm-integration-architecture',
    keyword: 'llm integration and architecture services',
    title: 'LLM Integration & Architecture — Metaborong',
    description:
      'Architect, integrate, and harden LLMs inside your existing product and stack. Auth, routing, fallback, cost controls, and observability included.',
  },

  // ── Web3 ────────────────────────────────────────────────────────────────────
  {
    pillar: 'web3',
    subGroup: 'engineering',
    slug: 'smart-contract-development',
    keyword: 'smart contract development services',
    title: 'Smart Contract Development Services — Metaborong',
    description:
      'Solidity, Vyper, and Move smart contracts engineered for third-party audit. Specs, tests, deployment, and post-deploy monitoring all included.',
  },
  {
    pillar: 'web3',
    subGroup: 'engineering',
    slug: 'defi-protocol-development',
    keyword: 'defi protocol development services',
    title: 'DeFi Protocol Development — Lending, AMM, Vaults — Metaborong',
    description:
      'Lending, AMM, perp-DEX, and yield protocols engineered for audit and on-chain volume. Multichain across EVM, Solana, and Cosmos.',
  },
  {
    pillar: 'web3',
    subGroup: 'strategy',
    slug: 'web3-tokenomics-design',
    keyword: 'tokenomics design and consulting',
    title: 'Web3 Tokenomics Design & Consulting — Metaborong',
    description:
      'Token supply, distribution, emissions, and governance modelling for launch. Stress-tested against real on-chain behaviour, not slide-deck theory.',
  },
  {
    pillar: 'web3',
    subGroup: 'product',
    slug: 'nft-marketplace-development',
    keyword: 'nft marketplace development',
    title: 'NFT Marketplace Development — Metaborong',
    description:
      'Custom NFT marketplaces with royalties, lazy-mint, curated drops, and multi-chain support. From storefront to settlement, fully owned by you.',
  },
  {
    pillar: 'web3',
    subGroup: 'engineering',
    slug: 'liquid-staking-vaults',
    keyword: 'liquid staking and vault development',
    title: 'Liquid Staking & Vault Systems — Metaborong',
    description:
      'LST and LRT vault systems with restaking, risk controls, and validator routing. Built for production yields and third-party audit readiness.',
  },
  {
    // GovTech / UIDAI / Aadhaar headline leaf. India-explicit by design — see
    // SERVICES_PLAN.md § Risk 7. AEO answer block on the page references
    // Aadhaar-scale deployment as a verifiable fact.
    pillar: 'web3',
    subGroup: 'engineering',
    slug: 'decentralized-identity-did-integration',
    keyword: 'decentralized identity and aadhaar did integration',
    title: 'Decentralized Identity & DID Integration — Metaborong',
    description:
      'Verifiable credentials, Aadhaar-integrated DID stacks, and UIDAI-aware identity systems for GovTech and regulated products. Production-scale deployments.',
  },

  // ── Product Studio ──────────────────────────────────────────────────────────
  {
    pillar: 'product-studio',
    subGroup: 'strategy',
    slug: 'product-discovery-validation',
    keyword: 'product discovery and validation services',
    title: 'Product Discovery & Validation — Metaborong',
    description:
      'Tight-loop discovery sprints for founders: problem framing, hypothesis tests, technical feasibility, and a shipped clickable prototype in weeks.',
  },
  {
    pillar: 'product-studio',
    subGroup: 'product',
    slug: 'mvp-development',
    keyword: 'mvp development services',
    title: 'MVP Development Services — Founder-Led Builds — Metaborong',
    description:
      'Zero-to-launch product builds for founders without an in-house CTO. Architecture, engineering, design, and deployment from one senior team.',
  },
  {
    pillar: 'product-studio',
    subGroup: 'product',
    slug: 'saas-product-development',
    keyword: 'saas product development services',
    title: 'SaaS Product Development Services — Metaborong',
    description:
      'End-to-end SaaS builds with multi-tenancy, billing, and observability baked in. Senior team owns architecture through deployment, no vendor fragmentation.',
  },
  {
    pillar: 'product-studio',
    subGroup: 'product',
    slug: 'b2b-multi-tenant-platforms',
    keyword: 'b2b multi-tenant platform development',
    title: 'B2B Multi-Tenant Platform Development — Metaborong',
    description:
      'Multi-tenant B2B platforms with SSO, role-based access, audit trails, and admin tooling — built for enterprise procurement from day one.',
  },
] as const

// Pre-built key for O(1) lookup by `${pillar}/${slug}` (the canonical
// pillar-leaf composite identifier used in route params and BreadcrumbList).
const byCompositeKey = new Map<string, LeafSeoEntry>(
  v1LeafSeo.map((e) => [`${e.pillar}/${e.slug}`, e]),
)

/**
 * Look up SEO meta for a v1 leaf. Returns `undefined` for coming-soon
 * leaves, unknown pillars, and unknown slugs — callers must handle the
 * undefined case (typically by emitting a noindex stub).
 *
 * Used by `app/services/[pillar]/[slug]/page.tsx` inside `generateMetadata`.
 */
export function getLeafSeo(pillar: string, slug: string): LeafSeoEntry | undefined {
  return byCompositeKey.get(`${pillar}/${slug}`)
}

/**
 * Iterate every v1 entry filtered to a single pillar — useful for the
 * pillar-hub page's related-services rail and for schema OfferCatalog
 * generation.
 */
export function getV1LeavesForPillar(pillar: PillarId): readonly LeafSeoEntry[] {
  return v1LeafSeo.filter((e) => e.pillar === pillar)
}
