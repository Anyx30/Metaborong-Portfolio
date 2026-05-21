import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { pillars } from '@/components/sections/services-data'
import { PillarHub } from '@/components/services/pillar-hub'

type Params = { pillar: string }

// Pillar meta titles and descriptions are pinned in SERVICES_PLAN.md § 4 —
// this map mirrors that table so the hubs ship indexable from day one.
const PILLAR_META: Record<string, { title: string; description: string }> = {
  ai: {
    title: 'AI Development Services — Copilots, Agents, RAG — Metaborong',
    description:
      'Production AI capability: copilots, RAG, agentic systems, integration, and evaluation. Senior team, India + global.',
  },
  web3: {
    title: 'Web3 Development Services — Smart Contracts, DeFi, DID — Metaborong',
    description:
      'Smart-contract, DeFi, NFT, DID, and tokenomics engineering. Multichain protocol studio from India, global delivery.',
  },
  'product-studio': {
    title: 'Product Studio — MVP, SaaS, B2B Product Builds — Metaborong',
    description:
      'Greenfield product builds for founders without a CTO. MVP, SaaS, and B2B multi-tenant platforms, end-to-end.',
  },
}

export async function generateStaticParams(): Promise<Params[]> {
  return pillars.map((p) => ({ pillar: p.id }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { pillar } = await params
  const meta = PILLAR_META[pillar]
  const p = pillars.find((x) => x.id === pillar)
  if (!p || !meta) return { robots: { index: false, follow: false } }
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `https://www.metaborong.com${p.hubHref}` },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `https://www.metaborong.com${p.hubHref}`,
      type: 'website',
    },
  }
}

export default async function PillarHubPage({ params }: { params: Promise<Params> }) {
  const { pillar } = await params
  const p = pillars.find((x) => x.id === pillar)
  if (!p) notFound()
  return <PillarHub pillar={p} />
}
