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
  sameAs: [
    'https://linkedin.com/company/metaborong-technologies',
    'https://x.com/Metaborong',
  ],
  founders: [
    { '@type': 'Person', name: 'Arnab Ray',    jobTitle: 'CEO & Co-Founder' },
    { '@type': 'Person', name: 'Anik Ghosh',   jobTitle: 'COO & Co-Founder' },
    { '@type': 'Person', name: 'Soumojit Ash', jobTitle: 'CTO & Co-Founder' },
  ],
}

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Metaborong',
  url: 'https://www.metaborong.com',
}
