import type { Metadata } from 'next'
import { Nav } from '@/components/layout/nav'
import { Footer } from '@/components/layout/footer'
import { HeroSection } from '@/components/sections/hero'
import { TrustBar } from '@/components/sections/trust-bar'
import { ProblemSection } from '@/components/sections/problem'
import { ServicesSection } from '@/components/sections/services'
import { WhyUsSection } from '@/components/sections/why-us'
import { WorkPreviewSection } from '@/components/sections/work-preview'
import { TestimonialsSection } from '@/components/sections/testimonials'
import { FoundersSection } from '@/components/sections/founders'
import { ComparisonSection } from '@/components/sections/comparison'
import { FaqSection } from '@/components/sections/faq'
import { ContactCtaSection } from '@/components/sections/contact-cta'
import { organizationSchema, websiteSchema, faqSchema } from '@/lib/schema'

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Nav />

      <main>
        <HeroSection />
        <TrustBar />
        <ProblemSection />
        <span id="services" className="block scroll-mt-[64px]" aria-hidden="true" />
        <ServicesSection />
        <WhyUsSection />
        <span id="work" className="block scroll-mt-[64px]" aria-hidden="true" />
        <WorkPreviewSection />
        <TestimonialsSection />
        <span id="founders" className="block scroll-mt-[64px]" aria-hidden="true" />
        <FoundersSection />
        <ComparisonSection />
        <span id="faq" className="block scroll-mt-[64px]" aria-hidden="true" />
        <FaqSection />
        <span id="contact" className="block scroll-mt-[64px]" aria-hidden="true" />
        <ContactCtaSection />
      </main>

      <Footer />
    </>
  )
}
