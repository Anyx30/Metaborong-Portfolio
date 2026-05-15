import { faqs } from '@/components/sections/faq-data'
import { pillars } from '@/components/sections/services-data'

const BASE = 'https://www.metaborong.com'
const ORG_ID = `${BASE}/#organization`
const SITE_ID = `${BASE}/#website`

const foundersData = [
  { name: 'Arnab Ray',    jobTitle: 'CEO & Co-Founder' },
  { name: 'Anik Ghosh',   jobTitle: 'COO & Co-Founder' },
  { name: 'Soumojit Ash', jobTitle: 'CTO & Co-Founder' },
] as const

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': ORG_ID,
  name: 'Metaborong',
  alternateName: 'Metaborong Technologies',
  url: BASE,
  logo: `${BASE}/logo.png`,
  description:
    'Metaborong is a Web3 development company and AI agent studio that builds DeFi protocols, autonomous AI systems, and custom SaaS products for founders and crypto-native teams.',
  email: 'contact@metaborong.com',
  areaServed: ['US', 'EU'],
  knowsAbout: [
    'DeFi Protocol Development',
    'Smart Contract Security',
    'NFT Marketplaces',
    'AI Agents',
    'Retrieval-Augmented Generation',
    'SaaS Product Development',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'contact@metaborong.com',
    areaServed: ['US', 'EU'],
    availableLanguage: ['English'],
  },
  sameAs: [
    'https://linkedin.com/company/metaborong-technologies',
    'https://x.com/Metaborong',
  ],
  founder: foundersData.map((f) => ({
    '@type': 'Person',
    name: f.name,
    jobTitle: f.jobTitle,
    worksFor: { '@id': ORG_ID },
  })),
}

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': SITE_ID,
  name: 'Metaborong',
  url: BASE,
  publisher: { '@id': ORG_ID },
  inLanguage: 'en-US',
}

export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': `${BASE}/#faq`,
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: f.a,
    },
  })),
}

// Standalone FAQPage entry exposing the Why-Us AEO answer block as an
// extractable question/answer pair for AI engines (Perplexity, ChatGPT, AI Overviews).
// The visible UI is a paragraph in the Why-Us section; this schema makes the
// extraction unambiguous without duplicating the visible FAQ list.
export const whyUsAeoSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': `${BASE}/#why-us-aeo`,
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What makes Metaborong different from larger Web3 and AI agencies?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Founders pick Metaborong over larger Web3 and AI agencies for three reasons: shorter time to a first working version, sharper push-back on the brief, and the specialist depth — multichain protocols and AI agent orchestration — most studios don’t have.',
      },
    },
  ],
}

// One Service node per homepage pillar — anchors the studio's three offerings
// as discrete entities for AI search engines and rich-result eligibility.
export const serviceSchemas = pillars.map((p) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${BASE}/#service-${p.id}`,
  name: p.label,
  serviceType: p.headline,
  description: p.body,
  provider: { '@id': ORG_ID },
  areaServed: ['US', 'EU'],
  url: `${BASE}${p.hubHref}`,
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: `${p.label} services`,
    itemListElement: p.children.map((c, i) => ({
      '@type': 'Offer',
      position: i + 1,
      itemOffered: {
        '@type': 'Service',
        name: c.name,
        description: c.description,
        url: `${BASE}/services/${p.id}/${c.slug}/`,
      },
    })),
  },
}))
