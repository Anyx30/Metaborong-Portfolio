import { faqs } from '@/components/sections/faq-data'

const foundersData = [
  { name: 'Arnab Ray',    jobTitle: 'CEO & Co-Founder' },
  { name: 'Anik Ghosh',   jobTitle: 'COO & Co-Founder' },
  { name: 'Soumojit Ash', jobTitle: 'CTO & Co-Founder' },
] as const

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Metaborong',
  alternateName: 'Metaborong Technologies',
  url: 'https://www.metaborong.com',
  description:
    'Metaborong is a Web3 development company and AI agent studio that builds DeFi protocols, autonomous AI systems, and custom SaaS products for founders and crypto-native teams.',
  email: 'contact@metaborong.com',
  areaServed: ['US', 'EU'],
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
    worksFor: { '@type': 'Organization', name: 'Metaborong' },
  })),
}

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Metaborong',
  url: 'https://www.metaborong.com',
}

export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: f.a,
    },
  })),
}
