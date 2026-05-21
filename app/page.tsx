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
import {
  organizationSchemaJson,
  websiteSchemaJson,
  faqSchemaJson,
  whyUsAeoSchemaJson,
  serviceSchemasJson,
} from '@/lib/schema'

export const metadata: Metadata = {
  // Title inherits from layout.tsx default — single source of truth.
  description:
    'Metaborong builds DeFi protocols, AI agent systems, and custom SaaS products for founders and crypto-native teams. Fast delivery, product-first thinking.',
  alternates: {
    canonical: 'https://www.metaborong.com',
    // M9-GEO: soft hint that the site exposes an llmstxt.org-format
    // index at /llms.txt. Crawlers that honor the spec discover it
    // here without having to probe well-known paths.
    types: { 'text/plain': '/llms.txt' },
  },
  openGraph: {
    title: 'Web3 Protocols, AI Agents & SaaS Products | Metaborong',
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
        dangerouslySetInnerHTML={{ __html: organizationSchemaJson }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: websiteSchemaJson }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: faqSchemaJson }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: whyUsAeoSchemaJson }}
      />
      {serviceSchemasJson.map(({ id, json }) => (
        <script
          key={id}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: json }}
        />
      ))}

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
