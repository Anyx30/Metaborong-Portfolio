import { faqs } from '@/components/sections/faq-data'
import {
  pillars,
  getPublishedLeaves,
  type Pillar,
  type ChildService,
  type SubGroup,
} from '@/components/sections/services-data'

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
  areaServed: 'Worldwide',
  // v1 leaf headline terms per SERVICES_PLAN.md § 5 — kept in pillar order
  // (AI, Web3, Product Studio) so the entity-graph reads consistently with
  // the rest of the site. Coming-soon leaves are excluded.
  knowsAbout: [
    'AI Audit & Opportunity Assessment',
    'AI Copilots & Internal Tools',
    'Agentic AI Systems',
    'RAG & Retrieval Pipelines',
    'Smart Contract Development',
    'DeFi Protocol Development',
    'Tokenomics Design',
    'Decentralized Identity & DID Integration',
    'MVP Development',
    'SaaS Product Development',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'contact@metaborong.com',
    areaServed: 'Worldwide',
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
// OfferCatalog lists v1 published leaves only; coming-soon stubs are
// withheld from schema until they're authored (SERVICES_PLAN.md § Risk 3).
export const serviceSchemas = pillars.map((p) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${BASE}/#service-${p.id}`,
  name: p.label,
  serviceType: p.headline,
  description: p.body,
  provider: { '@id': ORG_ID },
  areaServed: 'Worldwide',
  url: `${BASE}${p.hubHref}`,
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: `${p.label} services`,
    itemListElement: getPublishedLeaves(p).map((c, i) => ({
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

// Pre-stringified variants: serialised once at module init instead of on every
// React render. The home page emits these via dangerouslySetInnerHTML, so the
// cost of stringifying the OfferCatalog graph (3 pillars × ~25 leaves) does
// not repeat on every RSC pass.
export const organizationSchemaJson = JSON.stringify(organizationSchema)
export const websiteSchemaJson = JSON.stringify(websiteSchema)
export const faqSchemaJson = JSON.stringify(faqSchema)
export const whyUsAeoSchemaJson = JSON.stringify(whyUsAeoSchema)
export const serviceSchemasJson: ReadonlyArray<{ id: string; json: string }> =
  serviceSchemas.map((s) => ({ id: s['@id'], json: JSON.stringify(s) }))

// ─── v1 leaf-level Service nodes ──────────────────────────────────────────────
//
// SERVICES_PLAN.md § 5 — one Service node per *published* v1 leaf. Coming-soon
// stubs are excluded; they're noindex pages and get no schema until authored.
// `isRelatedTo` lists up to 3 v1 siblings under the same pillar (excluding the
// leaf itself) — provides the entity-graph cross-links Google/Perplexity use
// to cluster the studio's offerings.

const leafServiceId = (pillarId: string, leafSlug: string): string =>
  `${BASE}/#service-${pillarId}-${leafSlug}`

const leafServiceUrl = (pillarId: string, leafSlug: string): string =>
  `${BASE}/services/${pillarId}/${leafSlug}/`

// "AI Engineering", "Web3 Strategy", "Product Studio Engineering" — used as
// serviceType per SERVICES_PLAN.md § 5 example ("AI Engineering").
const subGroupServiceType = (pillar: Pillar, subGroup: SubGroup): string =>
  `${pillar.label} ${subGroup.label}`

interface PublishedLeafContext {
  pillar: Pillar
  subGroup: SubGroup
  leaf: ChildService
}

const publishedLeafContexts: readonly PublishedLeafContext[] = pillars.flatMap(
  (pillar) =>
    pillar.subGroups.flatMap((subGroup) =>
      subGroup.children
        .filter((leaf) => leaf.status === 'published')
        .map((leaf) => ({ pillar, subGroup, leaf })),
    ),
)

export const leafServiceSchemas = publishedLeafContexts.map(
  ({ pillar, subGroup, leaf }) => {
    const siblingIds = publishedLeafContexts
      .filter((c) => c.pillar.id === pillar.id && c.leaf.slug !== leaf.slug)
      .slice(0, 3)
      .map((c) => ({ '@id': leafServiceId(c.pillar.id, c.leaf.slug) }))

    return {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': leafServiceId(pillar.id, leaf.slug),
      name: leaf.name,
      serviceType: subGroupServiceType(pillar, subGroup),
      description: leaf.description,
      provider: { '@id': ORG_ID },
      areaServed: 'Worldwide',
      url: leafServiceUrl(pillar.id, leaf.slug),
      category: pillar.label,
      isRelatedTo: siblingIds,
    }
  },
)

// ─── BreadcrumbList builders ──────────────────────────────────────────────────
//
// Absolute URLs per SERVICES_PLAN.md § 5 caveat. Used by:
//   - app/services/page.tsx                  → buildServicesOverviewBreadcrumb()
//   - app/services/[pillar]/page.tsx         → buildPillarBreadcrumb(pillar)
//   - app/services/[pillar]/[slug]/page.tsx  → buildLeafBreadcrumb(pillar, leaf)

interface BreadcrumbItem {
  '@type': 'ListItem'
  position: number
  name: string
  item: string
}

interface BreadcrumbListSchema {
  '@context': 'https://schema.org'
  '@type': 'BreadcrumbList'
  itemListElement: BreadcrumbItem[]
}

const breadcrumbList = (items: BreadcrumbItem[]): BreadcrumbListSchema => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items,
})

export function buildServicesOverviewBreadcrumb(): BreadcrumbListSchema {
  return breadcrumbList([
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE}/` },
    { '@type': 'ListItem', position: 2, name: 'Services', item: `${BASE}/services/` },
  ])
}

export function buildPillarBreadcrumb(pillar: Pillar): BreadcrumbListSchema {
  return breadcrumbList([
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE}/` },
    { '@type': 'ListItem', position: 2, name: 'Services', item: `${BASE}/services/` },
    {
      '@type': 'ListItem',
      position: 3,
      name: pillar.label,
      item: `${BASE}${pillar.hubHref}`,
    },
  ])
}

export function buildLeafBreadcrumb(
  pillar: Pillar,
  leaf: ChildService,
): BreadcrumbListSchema {
  return breadcrumbList([
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE}/` },
    { '@type': 'ListItem', position: 2, name: 'Services', item: `${BASE}/services/` },
    {
      '@type': 'ListItem',
      position: 3,
      name: pillar.label,
      item: `${BASE}${pillar.hubHref}`,
    },
    {
      '@type': 'ListItem',
      position: 4,
      name: leaf.name,
      item: leafServiceUrl(pillar.id, leaf.slug),
    },
  ])
}
