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

/**
 * Children are ordered so the first 5 entries are the section's curated "top 5"
 * (see docs/superpowers/specs/2026-05-11-section-services-redesign.md, deviation #3).
 * Entries 6+ remain reachable via the pillar hub page and noindex stub pages.
 */
export const pillars: Pillar[] = [
  {
    id: 'web3',
    num: '01',
    label: 'Web3 / Blockchain',
    color: '#204AF8',
    headline: 'Decentralised protocol engineering',
    body: 'DeFi protocols, NFT marketplaces, wallets, and DAO systems — smart-contract engineering across EVM, Solana, and Cosmos.',
    hubHref: '/services/web3/',
    hubCta: 'Open Web3',
    children: [
      { name: 'DeFi Protocol Development', description: "Lending, AMM, perp-DEX, and yield infrastructure spec'd for third-party audit.", slug: 'defi-protocol-development' },
      { name: 'Smart Contract Security', description: 'Specs, audits, and post-deploy monitoring for production smart contracts.', slug: 'smart-contract-security' },
      { name: 'NFT Marketplace Development', description: 'Custom marketplaces with royalties, lazy-mint, and curated drops.', slug: 'nft-marketplace-development' },
      { name: 'Crypto Wallet Development', description: 'Custodial and self-custody wallets across EVM, Solana, and Cosmos.', slug: 'crypto-wallet-development' },
      { name: 'Token Launchpad', description: 'Token sales, vesting schedules, and distribution infrastructure end to end.', slug: 'token-launchpad' },
      { name: 'Liquid Staking Vaults', description: 'LST and LRT vault systems with restaking and risk controls.', slug: 'liquid-staking-vaults' },
      { name: 'DAO & Governance Systems', description: 'On-chain governance, treasury management, and voting tooling for live DAOs.', slug: 'dao-governance-systems' },
    ],
  },
  {
    id: 'ai-agents',
    num: '02',
    label: 'AI Agents',
    color: '#10b981',
    headline: 'AI agents that ship to production',
    body: 'Agentic pipelines, RAG systems, voice agents, generative products, and workflow automation — production-grade, not demos.',
    hubHref: '/services/ai-agents/',
    hubCta: 'Open AI',
    children: [
      { name: 'Agentic AI Systems', description: 'Multi-step autonomous agents that plan, use tools, and report results.', slug: 'agentic-ai-systems' },
      { name: 'RAG & Knowledge Systems', description: 'Retrieval pipelines that ground LLMs in your proprietary data.', slug: 'rag-knowledge-systems' },
      { name: 'Generative AI Development', description: 'Custom GenAI products engineered beyond ChatGPT wrappers.', slug: 'generative-ai-development' },
      { name: 'Voice Agent Integration', description: 'Real-time voice agents for support, sales, and operations workflows.', slug: 'voice-agent-integration' },
      { name: 'AI Workflow Automation', description: 'Trigger-driven AI flows wired into your existing software stack.', slug: 'ai-workflow-automation' },
      { name: 'AI Systems Integration', description: 'Embedding LLMs into existing software, infrastructure, and internal tooling.', slug: 'ai-systems-integration' },
    ],
  },
  {
    id: 'product-studio',
    num: '03',
    label: 'Product Studio',
    color: '#F6851B',
    headline: 'The full technical team for your SaaS',
    body: 'Web2 product builds for founders without a CTO — architecture, engineering, design, deployment.',
    hubHref: '/services/product-studio/',
    hubCta: 'Open Studio',
    children: [
      { name: 'SaaS Product Development', description: 'Web2 product builds — architecture, engineering, design, and deployment.', slug: 'saas-product-development' },
    ],
  },
]
