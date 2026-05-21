import { Section } from '@/components/ui/section'
import { ServicesPillarsLazy } from '@/components/sections/services-pillars-lazy'

const FAQ_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What does Metaborong build?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Metaborong is a boutique engineering studio building three product categories: Web3 protocols (DeFi, NFT marketplaces, DAOs); AI agents (agentic pipelines, RAG, voice); and full-stack SaaS products (MVP and B2B builds). One senior team owns architecture, engineering, security, and deployment across EVM, Solana, and Cosmos.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does Metaborong differ from a freelancer marketplace?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Metaborong is a single accountable studio where one senior team owns the engagement end-to-end. Engineering, design, and architecture stay on the project from specification through production deployment. Freelancer marketplaces fragment ownership across roles and re-bid talent per phase; Metaborong runs one continuous team instead.',
      },
    },
    {
      '@type': 'Question',
      name: 'What blockchain ecosystems does Metaborong support?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Metaborong builds across the three primary smart-contract ecosystems: EVM chains including Ethereum and Layer-2 rollups, where the studio ships Solidity protocols; Solana, including SPL tokens and Anchor programs; and Cosmos, including CosmWasm modules. Categories covered: DeFi, NFT, wallets, liquid staking, and DAO systems.',
      },
    },
  ],
}

export function ServicesSection() {
  return (
    <Section bg="subtle" maxWidth="xwide" className="services-section-bridge" id="services" aria-labelledby="services-heading">
      <div className="lg:rounded-lg lg:border lg:border-border lg:bg-white">
        <div className="lg:border-b lg:border-border lg:pt-[64px] lg:pb-[48px] lg:px-[48px]">
          <div className="max-w-[720px] mx-auto text-center">
            <span className="inline-block border border-border bg-white rounded-md px-[12px] py-[6px] text-[11px] font-bold uppercase tracking-[0.1em] leading-none text-dark font-mono">
              What we build
            </span>
            <h2
              id="services-heading"
              className="mt-[24px] text-[clamp(32px,4.4vw,56px)] font-bold tracking-[-0.035em] leading-[1.05] text-dark"
            >
              A small, senior team.<br />Three pillars. End to end.
            </h2>
            <p className="mt-[20px] text-[16px] text-gray leading-[1.65] tracking-[-0.01em]">
              A boutique studio for founders without a CTO. We ship Web3 protocols, production AI agents, and full SaaS products with one senior team that owns the work from architecture to deployment. Every build is engineered for production, not stopped at a demo.
            </p>
          </div>
        </div>

        <ServicesPillarsLazy />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: FAQ_JSONLD_JSON }}
      />
    </Section>
  )
}

const FAQ_JSONLD_JSON = JSON.stringify(FAQ_JSONLD)
