import Link from 'next/link'
import { Section } from '@/components/ui/section'
import { Eyebrow } from '@/components/ui/eyebrow'
import { ContactCtaSection } from '@/components/sections/contact-cta'
import {
  pillars,
  type Pillar,
  type PillarId,
  type SubGroup,
  type ChildService,
} from '@/components/sections/services-data'
import { pillarHubCopy, type PillarHubCopy, type SubGroupCopy } from '@/lib/services/pillar-hub-content'

const BASE = 'https://www.metaborong.com'

/* ---------- TOP-LEVEL ---------- */

export function PillarHub({ pillar }: { pillar: Pillar }) {
  const copy = pillarHubCopy[pillar.id]
  const otherPillars = pillars.filter((p) => p.id !== pillar.id)
  const breadcrumbSchema = buildBreadcrumbSchema(pillar)
  const faqSchema = buildFaqSchema(pillar, copy)

  return (
    <main id="main" aria-labelledby="pillar-hub-heading">
      <Breadcrumb pillar={pillar} />
      <PillarHero pillar={pillar} copy={copy} />
      {pillar.subGroups.map((sg, i) => (
        <SubGroupSection
          key={sg.id}
          pillar={pillar}
          subGroup={sg}
          copy={copy.subGroups.find((s) => s.id === sg.id)!}
          index={i + 1}
        />
      ))}
      <EngagementStrip pillar={pillar} copy={copy} />
      <CrossPillarLinks current={pillar} others={otherPillars} />
      <PillarFaq pillar={pillar} copy={copy} />
      <ContactCtaSection />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </main>
  )
}

/* ---------- BREADCRUMB ---------- */

function Breadcrumb({ pillar }: { pillar: Pillar }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="bg-bg px-[16px] pt-[24px] sm:px-[24px] md:px-[48px] lg:px-[96px] xl:px-[128px]"
    >
      <ol className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-x-[8px] gap-y-[4px] text-[12px] tracking-[-0.005em] text-gray-light">
        <li>
          <Link href="/" className="hover:text-dark">Home</Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link href="/services/" className="hover:text-dark">Services</Link>
        </li>
        <li aria-hidden="true">/</li>
        <li aria-current="page" className="text-dark">{pillar.label}</li>
      </ol>
    </nav>
  )
}

/* ---------- HERO ---------- */

function PillarHero({ pillar, copy }: { pillar: Pillar; copy: PillarHubCopy }) {
  return (
    <Section bg="default" maxWidth="xwide" className="pt-[28px] md:pt-[36px] lg:pt-[44px]!">
      <div className="grid gap-[40px] md:gap-[56px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-[64px]">
        <div>
          <div className="flex items-center gap-[12px]">
            <span
              className="font-mono text-[11px] font-bold tracking-[0.12em]"
              style={{ color: pillar.color }}
            >
              {pillar.num}
            </span>
            <span aria-hidden="true" className="h-[1px] w-[24px]" style={{ backgroundColor: pillar.color }} />
            <Eyebrow tone={pillar.id}>{pillar.label}</Eyebrow>
          </div>
          <h1
            id="pillar-hub-heading"
            className="mt-[20px] text-[clamp(34px,4.8vw,60px)] font-bold leading-[1.04] tracking-[-0.035em] text-dark"
          >
            {pillar.headline}
          </h1>
          <p className="mt-[20px] text-[16px] font-medium leading-[1.55] tracking-[-0.01em] text-dark md:text-[17px]">
            {copy.positioning}
          </p>
        </div>
        <div className="space-y-[16px] md:space-y-[20px]">
          {copy.heroParagraphs.map((para, i) => (
            <p
              key={i}
              className="text-[15px] leading-[1.7] tracking-[-0.005em] text-gray md:text-[16px]"
            >
              {para}
            </p>
          ))}
          <div className="flex flex-col items-stretch gap-[12px] pt-[8px] sm:flex-row sm:items-center">
            <a
              href="mailto:contact@metaborong.com?subject=New%20project%20inquiry"
              className="inline-flex min-h-[44px] items-stretch justify-center bg-brand text-[14px] font-semibold tracking-[-0.005em] text-white no-underline"
            >
              <span className="px-[20px] py-[12px]">Talk to us</span>
              <span aria-hidden="true" className="border-l border-white/15 bg-white/10 px-[14px] py-[12px]">→</span>
            </a>
            <Link
              href="/work"
              className="inline-flex min-h-[44px] items-center justify-center border border-border bg-white px-[18px] py-[10px] text-[14px] font-semibold tracking-[-0.005em] text-dark no-underline hover:border-dark"
            >
              Read case studies
            </Link>
          </div>
        </div>
      </div>
    </Section>
  )
}

/* ---------- SUB-GROUP SECTION ---------- */

function SubGroupSection({
  pillar,
  subGroup,
  copy,
  index,
}: {
  pillar: Pillar
  subGroup: SubGroup
  copy: SubGroupCopy
  index: number
}) {
  const numLabel = String(index).padStart(2, '0')
  const sectionBg = index % 2 === 0 ? 'subtle' : 'default'
  return (
    <Section
      bg={sectionBg}
      maxWidth="xwide"
      aria-labelledby={`sg-${pillar.id}-${subGroup.id}-heading`}
    >
      <div className="grid gap-[40px] md:gap-[48px] lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:gap-[64px]">
        {/* Section header — number + name + 1-paragraph description */}
        <div>
          <div className="flex items-center gap-[10px]">
            <span
              className="font-mono text-[12px] font-bold tracking-[0.12em]"
              style={{ color: pillar.color }}
            >
              [{numLabel}]
            </span>
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-gray-light">
              {pillar.label} · {subGroup.label}
            </span>
          </div>
          <h2
            id={`sg-${pillar.id}-${subGroup.id}-heading`}
            className="mt-[16px] text-[clamp(26px,3.2vw,40px)] font-bold leading-[1.1] tracking-[-0.03em] text-dark"
          >
            {subGroup.label}
          </h2>
          <p className="mt-[16px] text-[15px] leading-[1.7] tracking-[-0.005em] text-gray">
            {copy.description}
          </p>
        </div>

        <div className="space-y-[20px] md:space-y-[24px]">
          {/* Case study card — anonymized placeholder linking to /work */}
          <CaseStudyCard pillar={pillar} caseStudy={copy.caseStudy} subGroupLabel={subGroup.label} />

          {/* Grid of leaf cards — branches on status */}
          <ul role="list" className="grid gap-[12px] sm:grid-cols-2">
            {subGroup.children.map((leaf) => (
              <li key={leaf.slug}>
                <LeafCard pillar={pillar} leaf={leaf} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  )
}

function CaseStudyCard({
  pillar,
  caseStudy,
  subGroupLabel,
}: {
  pillar: Pillar
  caseStudy: SubGroupCopy['caseStudy']
  subGroupLabel: string
}) {
  return (
    <Link
      href={caseStudy.href}
      className="group block border border-border bg-white p-[20px] no-underline transition-colors duration-[var(--duration-instant)] hover:border-dark md:p-[24px]"
      style={{ '--pillar-color': pillar.color } as React.CSSProperties}
    >
      <div className="flex items-center gap-[10px]">
        <span
          className="font-mono text-[10px] font-bold uppercase tracking-[0.12em]"
          style={{ color: pillar.color }}
        >
          Case study
        </span>
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-gray-light">
          {subGroupLabel}
        </span>
      </div>
      <p className="mt-[10px] text-[15px] font-semibold tracking-[-0.01em] text-dark md:text-[16px]">
        {caseStudy.descriptor}
      </p>
      <p className="mt-[8px] text-[14px] leading-[1.65] tracking-[-0.005em] text-gray">
        {caseStudy.outcome}
      </p>
      <span className="mt-[14px] inline-flex items-center gap-[8px] text-[13px] font-semibold tracking-[-0.005em] text-dark group-hover:text-[var(--pillar-color)]">
        Read related work
        <ArrowRight />
      </span>
    </Link>
  )
}

/* ---------- LEAF CARD — BRANCHES ON STATUS ---------- */

function LeafCard({ pillar, leaf }: { pillar: Pillar; leaf: ChildService }) {
  // Published — clickable card with Open link.
  if (leaf.status === 'published') {
    return (
      <Link
        href={`${pillar.hubHref}${leaf.slug}/`}
        className="group flex h-full flex-col justify-between gap-[14px] border border-border bg-white p-[18px] no-underline transition-colors duration-[var(--duration-instant)] hover:border-dark md:p-[20px]"
        style={{ '--pillar-color': pillar.color } as React.CSSProperties}
      >
        <div>
          <p className="text-[15px] font-semibold leading-[1.3] tracking-[-0.01em] text-dark">
            {leaf.name}
          </p>
          <p className="mt-[8px] text-[13px] leading-[1.6] tracking-[-0.005em] text-gray">
            {leaf.description}
          </p>
        </div>
        <span className="inline-flex items-center gap-[6px] text-[12px] font-semibold tracking-[-0.005em] text-dark group-hover:text-[var(--pillar-color)]">
          Open
          <ArrowUpRight />
        </span>
      </Link>
    )
  }

  // Coming soon — dimmed card, aria-disabled, NO href.
  return (
    <div
      role="group"
      aria-disabled="true"
      className="flex h-full flex-col justify-between gap-[14px] border border-dashed border-border bg-bg-subtle p-[18px] opacity-70 md:p-[20px]"
    >
      <div>
        <p className="text-[15px] font-semibold leading-[1.3] tracking-[-0.01em] text-dark">
          {leaf.name}
        </p>
        <p className="mt-[8px] text-[13px] leading-[1.6] tracking-[-0.005em] text-gray">
          {leaf.description}
        </p>
      </div>
      <span className="inline-flex w-fit items-center border border-border bg-white px-[8px] py-[4px] font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-gray">
        Coming soon
      </span>
    </div>
  )
}

/* ---------- ENGAGEMENT STRIP ---------- */

function EngagementStrip({ pillar, copy }: { pillar: Pillar; copy: PillarHubCopy }) {
  return (
    <Section bg="default" maxWidth="xwide" aria-labelledby={`engagement-${pillar.id}-heading`}>
      <div className="mb-[24px] md:mb-[32px]">
        <Eyebrow as="p" tone={pillar.id}>How we engage</Eyebrow>
        <h2
          id={`engagement-${pillar.id}-heading`}
          className="mt-[10px] text-[clamp(22px,2.6vw,32px)] font-bold leading-[1.15] tracking-[-0.025em] text-dark"
        >
          {phaseHeadline(pillar.id, copy)}
        </h2>
      </div>
      <ol className="grid gap-[12px] md:grid-cols-3 md:gap-[16px]">
        {copy.engagement.map((phase, i) => (
          <li
            key={phase.label}
            className="border border-border bg-white p-[20px] md:p-[24px]"
          >
            <div className="flex items-center gap-[10px]">
              <span
                className="font-mono text-[11px] font-bold tracking-[0.12em]"
                style={{ color: pillar.color }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-gray-light">
                {phase.duration}
              </span>
            </div>
            <p className="mt-[10px] text-[16px] font-semibold tracking-[-0.01em] text-dark">
              {phase.label}
            </p>
            <p className="mt-[8px] text-[13px] leading-[1.65] tracking-[-0.005em] text-gray">
              {phase.body}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  )
}

function phaseHeadline(id: PillarId, copy: PillarHubCopy): string {
  const labels = copy.engagement.map((p) => p.label).join(' → ')
  switch (id) {
    case 'ai':
      return `${labels} — production AI, not demoware.`
    case 'web3':
      return `${labels} — audit-ready by default.`
    case 'product-studio':
      return `${labels} — one senior team, end to end.`
  }
}

/* ---------- CROSS-PILLAR LINKS ---------- */

function CrossPillarLinks({ current, others }: { current: Pillar; others: Pillar[] }) {
  return (
    <Section bg="subtle" maxWidth="xwide" aria-labelledby={`cross-${current.id}-heading`}>
      <div className="mb-[20px] md:mb-[28px]">
        <Eyebrow as="p">Adjacent capabilities</Eyebrow>
        <h2
          id={`cross-${current.id}-heading`}
          className="mt-[10px] text-[clamp(20px,2.4vw,28px)] font-bold leading-[1.15] tracking-[-0.025em] text-dark"
        >
          The other two pillars
        </h2>
      </div>
      <ul role="list" className="grid gap-[12px] md:grid-cols-2 md:gap-[16px]">
        {others.map((p) => (
          <li key={p.id}>
            <Link
              href={p.hubHref}
              className="group flex items-center justify-between gap-[16px] border border-border bg-white p-[20px] no-underline transition-colors duration-[var(--duration-instant)] hover:border-dark md:p-[24px]"
              style={{ '--pillar-color': p.color } as React.CSSProperties}
            >
              <div>
                <div className="flex items-center gap-[10px]">
                  <span
                    className="font-mono text-[11px] font-bold tracking-[0.12em]"
                    style={{ color: p.color }}
                  >
                    {p.num}
                  </span>
                  <Eyebrow as="span" tone={p.id}>{p.label}</Eyebrow>
                </div>
                <p className="mt-[8px] text-[16px] font-semibold tracking-[-0.01em] text-dark md:text-[17px]">
                  {p.headline}
                </p>
                <p className="mt-[6px] text-[13px] leading-[1.6] tracking-[-0.005em] text-gray">
                  {p.body}
                </p>
              </div>
              <span
                aria-hidden="true"
                className="shrink-0 text-gray-light group-hover:text-[var(--pillar-color)]"
              >
                <ArrowUpRight />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  )
}

/* ---------- FAQ ---------- */

function PillarFaq({ pillar, copy }: { pillar: Pillar; copy: PillarHubCopy }) {
  return (
    <Section bg="default" maxWidth="narrow" aria-labelledby={`faq-${pillar.id}-heading`}>
      <div className="mb-[24px] md:mb-[32px]">
        <Eyebrow as="p" tone={pillar.id}>FAQ</Eyebrow>
        <h2
          id={`faq-${pillar.id}-heading`}
          className="mt-[10px] text-[clamp(26px,3.2vw,40px)] font-bold leading-[1.1] tracking-[-0.03em] text-dark"
        >
          {pillar.label} questions
        </h2>
      </div>
      <dl className="border-t border-border">
        {copy.faqs.map((faq, i) => (
          <div key={i} className="border-b border-border py-[18px] md:py-[22px]">
            <dt className="text-[15px] font-semibold leading-[1.35] tracking-[-0.01em] text-dark md:text-[16px]">
              {faq.q}
            </dt>
            <dd className="mt-[10px] text-[14px] leading-[1.7] tracking-[-0.005em] text-gray md:text-[15px]">
              {faq.a}
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  )
}

/* ---------- SCHEMA HELPERS ---------- */

function buildBreadcrumbSchema(pillar: Pillar) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE}/` },
      { '@type': 'ListItem', position: 2, name: 'Services', item: `${BASE}/services/` },
      { '@type': 'ListItem', position: 3, name: pillar.label, item: `${BASE}${pillar.hubHref}` },
    ],
  }
}

function buildFaqSchema(pillar: Pillar, copy: PillarHubCopy) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${BASE}${pillar.hubHref}#faq`,
    mainEntity: copy.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
}

/* ---------- ICONS ---------- */

function ArrowUpRight() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 11L11 3M11 3H4.5M11 3V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  )
}

function ArrowRight() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 7H12M12 7L7.5 2.5M12 7L7.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  )
}
