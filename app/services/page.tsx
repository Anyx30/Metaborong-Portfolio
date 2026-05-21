import type { Metadata } from 'next'
import { Nav } from '@/components/layout/nav'
import { Footer } from '@/components/layout/footer'
import { ServicesOverview } from '@/components/services/services-overview'

// Meta values per SERVICES_PLAN.md § 4. Description is 158 chars.
export const metadata: Metadata = {
  title: 'Services — AI, Web3, Product Studio — Metaborong',
  description:
    'AI integration, Web3 protocols, and greenfield product builds from a senior boutique studio. India + global delivery.',
  alternates: { canonical: 'https://www.metaborong.com/services/' },
  openGraph: {
    title: 'Services — AI, Web3, Product Studio — Metaborong',
    description:
      'AI integration, Web3 protocols, and greenfield product builds from a senior boutique studio. India + global delivery.',
    url: 'https://www.metaborong.com/services/',
  },
}

export default function ServicesOverviewPage() {
  return (
    <>
      <Nav />
      <main>
        <ServicesOverview />
      </main>
      <Footer />
    </>
  )
}
