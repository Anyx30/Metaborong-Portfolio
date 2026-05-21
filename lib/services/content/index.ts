// Authored-content registry for v1 leaf service pages.
//
// One `LeafContent` per published slug. Each content stream drops its file
// into `lib/services/content/<pillar>/<slug>.ts` (default export a
// `LeafContent`) and registers it in the map below. Keep the keys in the
// `${pillar}/${slug}` composite form so the lookup matches route params
// directly.
//
// When a slug is published in `services-data.ts` but absent from this
// registry, the route falls back to the noindex coming-soon stub. This
// lets the data layer, SEO map, and authored content land in any order
// without coupling.

import type { LeafContent } from '@/lib/services/leaf-content'
import {
  aiAuditOpportunityAssessment,
  aiCopilotsInternalTools,
  conversationalAgentsAssistants,
  agenticAiSystems,
  ragRetrievalPipelines,
  llmIntegrationArchitecture,
} from './ai'
import productDiscoveryValidation from './product-studio/product-discovery-validation'
import mvpDevelopment from './product-studio/mvp-development'
import saasProductDevelopment from './product-studio/saas-product-development'
import b2bMultiTenantPlatforms from './product-studio/b2b-multi-tenant-platforms'
import {
  smartContractDevelopment,
  defiProtocolDevelopment,
  web3TokenomicsDesign,
  nftMarketplaceDevelopment,
  liquidStakingVaults,
  decentralizedIdentityDidIntegration,
} from './web3'

const registry: Record<string, LeafContent> = {
  'ai/ai-audit-opportunity-assessment': aiAuditOpportunityAssessment,
  'ai/ai-copilots-internal-tools': aiCopilotsInternalTools,
  'ai/conversational-agents-assistants': conversationalAgentsAssistants,
  'ai/agentic-ai-systems': agenticAiSystems,
  'ai/rag-retrieval-pipelines': ragRetrievalPipelines,
  'ai/llm-integration-architecture': llmIntegrationArchitecture,
  'web3/smart-contract-development': smartContractDevelopment,
  'web3/defi-protocol-development': defiProtocolDevelopment,
  'web3/web3-tokenomics-design': web3TokenomicsDesign,
  'web3/nft-marketplace-development': nftMarketplaceDevelopment,
  'web3/liquid-staking-vaults': liquidStakingVaults,
  'web3/decentralized-identity-did-integration': decentralizedIdentityDidIntegration,
  'product-studio/product-discovery-validation': productDiscoveryValidation,
  'product-studio/mvp-development': mvpDevelopment,
  'product-studio/saas-product-development': saasProductDevelopment,
  'product-studio/b2b-multi-tenant-platforms': b2bMultiTenantPlatforms,
}

/**
 * Look up authored content for a leaf. Returns `undefined` when the slug
 * has no registered content — the route is expected to fall back to the
 * noindex stub in that case.
 */
export function getLeafContent(pillar: string, slug: string): LeafContent | undefined {
  return registry[`${pillar}/${slug}`]
}
