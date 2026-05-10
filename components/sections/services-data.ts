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

export const pillars: Pillar[] = [
  {
    id: 'web3',
    num: '01',
    label: 'Web3 / Blockchain',
    color: '#204AF8',
    headline: 'Decentralised protocol engineering',
    body: 'DeFi protocols, NFT marketplaces, crypto wallets, token launches, liquid staking, and DAO systems — built multichain.',
    hubHref: '/services/web3/',
    hubCta: 'Web3 services',
    children: [
      { name: 'DeFi Protocol Development', description: 'Lending, AMM, perp-DEX, and yield infrastructure built audit-ready.', slug: 'defi-protocol-development' },
      { name: 'Smart Contract Security', description: 'Specs, audits, and post-deploy monitoring for production contracts.', slug: 'smart-contract-security' },
      { name: 'NFT Marketplace Development', description: 'Custom marketplaces with royalties, lazy-mint, and curation.', slug: 'nft-marketplace-development' },
      { name: 'Crypto Wallet Development', description: 'Custodial and self-custody wallets across EVM, Solana, Cosmos.', slug: 'crypto-wallet-development' },
      { name: 'Token Launchpad', description: 'Token sales, vesting schedules, and distribution infrastructure.', slug: 'token-launchpad' },
      { name: 'Liquid Staking Vaults', description: 'LST/LRT vault systems with restaking and risk controls.', slug: 'liquid-staking-vaults' },
      { name: 'DAO & Governance Systems', description: 'On-chain governance, treasury, and voting tooling.', slug: 'dao-governance-systems' },
    ],
  },
  {
    id: 'ai-agents',
    num: '02',
    label: 'AI Agents',
    color: '#10b981',
    headline: 'AI agents that ship to production',
    body: 'Agentic pipelines, RAG applications, voice agents, generative AI, and workflow automation — production-grade, not demos.',
    hubHref: '/services/ai-agents/',
    hubCta: 'AI services',
    children: [
      { name: 'Agentic AI Systems', description: 'Multi-step autonomous agents that plan, tool-use, and report.', slug: 'agentic-ai-systems' },
      { name: 'Generative AI Development', description: 'Custom GenAI products beyond ChatGPT wrappers.', slug: 'generative-ai-development' },
      { name: 'AI Workflow Automation', description: 'Trigger-driven AI flows across your existing stack.', slug: 'ai-workflow-automation' },
      { name: 'Voice Agent Integration', description: 'Real-time voice agents for support, sales, and operations.', slug: 'voice-agent-integration' },
      { name: 'RAG & Knowledge Systems', description: 'Retrieval pipelines that ground LLMs in your data.', slug: 'rag-knowledge-systems' },
      { name: 'AI Systems Integration', description: 'Embedding LLMs into existing software and infrastructure.', slug: 'ai-systems-integration' },
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
    hubCta: 'Product studio',
    children: [
      { name: 'SaaS Product Development', description: 'Web2 product builds — architecture, engineering, design, deployment.', slug: 'saas-product-development' },
    ],
  },
]
