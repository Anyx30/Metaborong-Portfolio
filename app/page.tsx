import type { Metadata } from 'next'
import { Nav } from '@/components/layout/nav'
import { Footer } from '@/components/layout/footer'
import { HeroSection } from '@/components/sections/hero'
import { TrustBar } from '@/components/sections/trust-bar'
import { ServicesSection } from '@/components/sections/services'
import { WhyUsSection } from '@/components/sections/why-us'
import { WorkPreviewSection } from '@/components/sections/work-preview'
import { TestimonialsSection } from '@/components/sections/testimonials'
import { FoundersSection } from '@/components/sections/founders'
import { ComparisonSection } from '@/components/sections/comparison'
import { FaqSection } from '@/components/sections/faq'
import { ContactCtaSection } from '@/components/sections/contact-cta'
import { organizationSchema, websiteSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Web3 & AI Development Studio | Metaborong',
  description:
    'Metaborong builds DeFi protocols, AI agent systems, and custom SaaS products for founders and crypto-native teams. Fast delivery, product-first thinking.',
  alternates: { canonical: 'https://www.metaborong.com' },
  openGraph: {
    title: 'Web3 & AI Development Studio | Metaborong',
    description:
      'Metaborong builds DeFi protocols, AI agent systems, and custom SaaS products for founders and crypto-native teams.',
    url: 'https://www.metaborong.com',
  },
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      <Nav />

      <main>
        <HeroSection />
        <TrustBar />
        <ServicesSection />
        <WhyUsSection />
        <WorkPreviewSection />
        <TestimonialsSection />
        <FoundersSection />
        <ComparisonSection />
        <FaqSection />
        <ContactCtaSection />
      </main>

      <Footer />
    </>
  )
}
