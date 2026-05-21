// Leaf service page template (Template C in SERVICES_PLAN.md § 3).
//
// Server component. Renders the 11-block leaf surface for v1 published
// leaves. Authored content arrives as a typed `LeafContent` value; the
// taxonomy lookup (pillar label, sub-group label, leaf name, related-leaf
// filtering) is done here so content authors never repeat what the data
// layer already knows.
//
// The template never imports MDX or markdown — every block is structured
// data. Motion is delegated to the `<Section>` primitive's built-in
// `<Reveal>`, which short-circuits under `prefers-reduced-motion: reduce`.
// The FAQ accordion uses native `<details>` so the surface stays fully
// server-rendered with zero JS hydration cost for this template.

import Link from 'next/link'
import { Section } from '@/components/ui/section'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Button } from '@/components/ui/button'
import { ContactCtaSection } from '@/components/sections/contact-cta'
import {
  pillars,
  getAllLeaves,
  type Pillar,
  type SubGroup,
  type ChildService,
} from '@/components/sections/services-data'
import type { LeafContent, LeafRelatedServiceRef } from '@/lib/services/leaf-content'

interface LeafServicePageProps {
  pillar: Pillar
  subGroup: SubGroup
  leaf: ChildService
  content: LeafContent
}

export function LeafServicePage({ pillar, subGroup, leaf, content }: LeafServicePageProps) {
  const relatedLeaves = resolveRelatedServices(content.relatedServices)

  return (
    <main className="bg-bg">
      <Breadcrumb pillar={pillar} leaf={leaf} />
      <Hero pillar={pillar} subGroup={subGroup} leaf={leaf} lede={content.heroLede} />
      <WhatWeDeliver pillar={pillar} deliverables={content.deliverables} />
      <HowWeWork phases={content.phases} />
      <TechStackStrip items={content.techStack} />
      <FitBlock pillar={pillar} fit={content.fit} />
      <AeoAnswer pillar={pillar} leaf={leaf} answer={content.aeoAnswer} />
      <RelatedWork pillar={pillar} items={content.relatedWork} />
      {relatedLeaves.length > 0 && <RelatedServices items={relatedLeaves} />}
      <FaqBlock faqs={content.faqs} />
      <ContactCtaSection />
    </main>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Breadcrumb — visible nav + ARIA semantics. Schema emission is the route's
// job, not the template's (it composes with other JSON-LD).
// ─────────────────────────────────────────────────────────────────────────────

function Breadcrumb({ pillar, leaf }: { pillar: Pillar; leaf: ChildService }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="bg-bg border-b border-border-subtle px-[16px] py-[16px] sm:px-[24px] md:px-[48px] lg:px-[96px] xl:px-[128px]"
    >
      <div className="mx-auto max-w-[1120px]">
        <ol className="flex flex-wrap items-center gap-x-[8px] gap-y-[4px] text-[12px] font-medium text-gray-light">
          <li>
            <Link href="/" className="hover:text-dark transition-colors duration-[var(--duration-instant)]">Home</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/services/" className="hover:text-dark transition-colors duration-[var(--duration-instant)]">Services</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={pillar.hubHref} className="hover:text-dark transition-colors duration-[var(--duration-instant)]">{pillar.label}</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-dark">{leaf.name}</li>
        </ol>
      </div>
    </nav>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Hero — pillar+sub-group eyebrow, H1 verbatim from data, authored lede.
// ─────────────────────────────────────────────────────────────────────────────

function Hero({
  pillar,
  subGroup,
  leaf,
  lede,
}: {
  pillar: Pillar
  subGroup: SubGroup
  leaf: ChildService
  lede: string
}) {
  return (
    <Section maxWidth="narrow">
      <Eyebrow tone={pillar.id} as="p" className="mb-[16px]">
        {pillar.label} · {subGroup.label}
      </Eyebrow>
      <h1 className="text-[clamp(32px,4.5vw,56px)] font-bold tracking-[-0.035em] leading-[1.05] text-dark mb-[24px]">
        {leaf.name}
      </h1>
      <p className="text-[17px] md:text-[18px] leading-[1.65] tracking-[-0.01em] text-gray mb-[32px]">
        {lede}
      </p>
      <Button href="/#contact" variant="primary" size="lg" arrow="→">
        Talk to us
      </Button>
    </Section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// What we deliver — 4–6 concrete artefact cards. Pillar-tinted left rule
// signals which pillar owns the engagement without going logo-noisy.
// ─────────────────────────────────────────────────────────────────────────────

function WhatWeDeliver({
  pillar,
  deliverables,
}: {
  pillar: Pillar
  deliverables: readonly LeafContent['deliverables'][number][]
}) {
  return (
    <Section bg="subtle" maxWidth="wide">
      <div className="mb-[32px] md:mb-[40px]">
        <Eyebrow as="p" className="mb-[12px]">What we deliver</Eyebrow>
        <h2 className="text-[clamp(28px,3.5vw,44px)] font-bold tracking-[-0.03em] text-dark">
          Concrete artefacts, not capabilities
        </h2>
      </div>
      <ul role="list" className="grid grid-cols-1 gap-[16px] sm:grid-cols-2 lg:grid-cols-3">
        {deliverables.map((d, i) => (
          <li
            key={i}
            className="border border-border bg-bg p-[24px] border-l-[3px]"
            style={{ borderLeftColor: pillar.color }}
          >
            <p className="text-[15px] font-bold tracking-[-0.015em] leading-[1.35] text-dark">
              {d.label}
            </p>
            {d.detail && (
              <p className="mt-[8px] text-[14px] leading-[1.6] text-gray">{d.detail}</p>
            )}
          </li>
        ))}
      </ul>
    </Section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// How we work — numbered phases, ~50-word body each. NOT generic process —
// authored per leaf.
// ─────────────────────────────────────────────────────────────────────────────

function HowWeWork({ phases }: { phases: readonly LeafContent['phases'][number][] }) {
  return (
    <Section maxWidth="wide">
      <div className="mb-[32px] md:mb-[40px]">
        <Eyebrow as="p" className="mb-[12px]">How we work</Eyebrow>
        <h2 className="text-[clamp(28px,3.5vw,44px)] font-bold tracking-[-0.03em] text-dark">
          Engagement phases
        </h2>
      </div>
      <ol role="list" className="grid grid-cols-1 gap-[32px] md:grid-cols-2 lg:grid-cols-4">
        {phases.map((phase, i) => (
          <li key={i} className="flex flex-col gap-[12px]">
            <span className="font-mono text-[12px] font-bold tracking-[0.06em] text-gray-light">
              {String(i + 1).padStart(2, '0')}
            </span>
            <h3 className="text-[20px] font-bold tracking-[-0.025em] leading-[1.2] text-dark">
              {phase.title}
            </h3>
            <p className="text-[15px] leading-[1.65] text-gray">{phase.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tech / stack strip — JetBrains Mono, restrained list, no logo soup.
// ─────────────────────────────────────────────────────────────────────────────

function TechStackStrip({ items }: { items: readonly LeafContent['techStack'][number][] }) {
  return (
    <Section bg="subtle" maxWidth="wide">
      <div className="mb-[24px] md:mb-[32px]">
        <Eyebrow as="p" className="mb-[12px]">Tech stack</Eyebrow>
        <h2 className="text-[clamp(24px,3vw,36px)] font-bold tracking-[-0.025em] text-dark">
          What we build on
        </h2>
      </div>
      <ul role="list" className="flex flex-wrap gap-[8px]">
        {items.map((tech, i) => (
          <li
            key={i}
            className="font-mono inline-flex items-center gap-[8px] border border-border bg-bg px-[12px] py-[8px] text-[12px] font-medium tracking-[0.02em] text-dark"
          >
            {tech.category && (
              <span className="text-[10px] uppercase tracking-[0.1em] text-gray-light">
                {tech.category}
              </span>
            )}
            <span>{tech.name}</span>
          </li>
        ))}
      </ul>
    </Section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// When this fits / when it doesn't — two-column honest-scope block.
// Buyers self-disqualify here.
// ─────────────────────────────────────────────────────────────────────────────

function FitBlock({ pillar, fit }: { pillar: Pillar; fit: LeafContent['fit'] }) {
  return (
    <Section maxWidth="wide">
      <div className="mb-[32px] md:mb-[40px]">
        <Eyebrow as="p" className="mb-[12px]">Scope</Eyebrow>
        <h2 className="text-[clamp(28px,3.5vw,44px)] font-bold tracking-[-0.03em] text-dark">
          When this fits — and when it doesn&apos;t
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-[24px] md:grid-cols-2 md:gap-[48px]">
        <div className="border border-border bg-bg p-[24px] border-t-[3px]" style={{ borderTopColor: pillar.color }}>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-dark mb-[16px]">
            This fits when
          </p>
          <ul role="list" className="space-y-[12px]">
            {fit.fits.map((bullet, i) => (
              <li key={i} className="flex gap-[10px] text-[15px] leading-[1.55] text-dark">
                <span aria-hidden="true" className="mt-[8px] block h-[6px] w-[6px] shrink-0" style={{ backgroundColor: pillar.color }} />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="border border-border bg-bg p-[24px] border-t-[3px] border-t-gray-subtle">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-dark mb-[16px]">
            This doesn&apos;t fit when
          </p>
          <ul role="list" className="space-y-[12px]">
            {fit.doesNotFit.map((bullet, i) => (
              <li key={i} className="flex gap-[10px] text-[15px] leading-[1.55] text-gray">
                <span aria-hidden="true" className="mt-[8px] block h-[6px] w-[6px] shrink-0 bg-gray-subtle" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// AEO answer block — 40–60 word answer paragraph. Quoted treatment so
// crawlers + screen-readers recognise it as the canonical short answer.
// Schema (`FAQPage` / answer-text) is the route's responsibility.
// ─────────────────────────────────────────────────────────────────────────────

function AeoAnswer({
  pillar,
  leaf,
  answer,
}: {
  pillar: Pillar
  leaf: ChildService
  answer: string
}) {
  return (
    <Section bg="subtle" maxWidth="narrow">
      <Eyebrow as="p" className="mb-[12px]">In short</Eyebrow>
      <h2 className="text-[clamp(22px,2.5vw,30px)] font-bold tracking-[-0.025em] text-dark mb-[20px]">
        What is {leaf.name}?
      </h2>
      <blockquote
        className="border-l-[3px] pl-[20px] py-[4px] text-[17px] md:text-[18px] leading-[1.65] tracking-[-0.005em] text-dark"
        style={{ borderLeftColor: pillar.color }}
      >
        <p>{answer}</p>
      </blockquote>
    </Section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Related work — 1–2 anonymized case-study cards. No invented client names,
// no fabricated metrics.
// ─────────────────────────────────────────────────────────────────────────────

function RelatedWork({
  pillar,
  items,
}: {
  pillar: Pillar
  items: readonly LeafContent['relatedWork'][number][]
}) {
  if (items.length === 0) return null
  return (
    <Section maxWidth="wide">
      <div className="mb-[32px] md:mb-[40px]">
        <Eyebrow as="p" className="mb-[12px]">Related work</Eyebrow>
        <h2 className="text-[clamp(28px,3.5vw,44px)] font-bold tracking-[-0.03em] text-dark">
          Shipped engagements
        </h2>
      </div>
      <ul role="list" className="grid grid-cols-1 gap-[16px] md:grid-cols-2">
        {items.map((work, i) => (
          <li key={i}>
            <Link
              href={work.href}
              className="group flex h-full flex-col gap-[12px] border border-border bg-bg p-[24px] no-underline transition-colors duration-[var(--duration-fast)] hover:border-[color:var(--pillar-color)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              style={{ '--pillar-color': pillar.color } as React.CSSProperties}
            >
              <p
                className="font-mono text-[11px] font-bold uppercase tracking-[0.1em]"
                style={{ color: pillar.color }}
              >
                {work.descriptor}
              </p>
              <p className="text-[15px] leading-[1.6] text-dark">{work.summary}</p>
              <span className="mt-auto text-[13px] font-medium text-brand">Read more →</span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Related services — 3 sibling/cousin leaf links, filtered to v1 only.
// Coming-soon references are dropped silently by the resolver.
// ─────────────────────────────────────────────────────────────────────────────

interface ResolvedRelated {
  pillar: Pillar
  leaf: ChildService
}

function resolveRelatedServices(refs: readonly LeafRelatedServiceRef[]): ResolvedRelated[] {
  const resolved: ResolvedRelated[] = []
  for (const ref of refs) {
    const pillar = pillars.find((p) => p.id === ref.pillar)
    if (!pillar) continue
    const leaf = getAllLeaves(pillar).find((c) => c.slug === ref.slug)
    if (!leaf || leaf.status !== 'published') continue
    resolved.push({ pillar, leaf })
  }
  return resolved
}

function RelatedServices({ items }: { items: readonly ResolvedRelated[] }) {
  return (
    <Section bg="subtle" maxWidth="wide">
      <div className="mb-[32px] md:mb-[40px]">
        <Eyebrow as="p" className="mb-[12px]">Related services</Eyebrow>
        <h2 className="text-[clamp(24px,3vw,36px)] font-bold tracking-[-0.025em] text-dark">
          Adjacent engagements
        </h2>
      </div>
      <ul role="list" className="grid grid-cols-1 gap-[16px] md:grid-cols-3">
        {items.map(({ pillar, leaf }) => (
          <li key={`${pillar.id}/${leaf.slug}`}>
            <Link
              href={`${pillar.hubHref}${leaf.slug}/`}
              className="group flex h-full flex-col gap-[12px] border border-border bg-bg p-[20px] no-underline transition-colors duration-[var(--duration-fast)] hover:border-[color:var(--pillar-color)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              style={{ '--pillar-color': pillar.color } as React.CSSProperties}
            >
              <span
                className="font-mono text-[11px] font-bold uppercase tracking-[0.1em]"
                style={{ color: pillar.color }}
              >
                {pillar.label}
              </span>
              <h3 className="text-[16px] font-bold tracking-[-0.02em] leading-[1.3] text-dark">
                {leaf.name}
              </h3>
              <p className="text-[14px] leading-[1.6] text-gray">{leaf.description}</p>
              <span className="mt-auto text-[13px] font-medium" style={{ color: pillar.color }}>
                Open →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// FAQ — native <details>/<summary> accordion. Server-rendered, keyboard-
// accessible by the platform, no client JS. Schema (`FAQPage`) is emitted
// by the route from the same data.
// ─────────────────────────────────────────────────────────────────────────────

function FaqBlock({ faqs }: { faqs: readonly LeafContent['faqs'][number][] }) {
  if (faqs.length === 0) return null
  return (
    <Section maxWidth="narrow">
      <div className="mb-[32px] md:mb-[40px]">
        <Eyebrow as="p" className="mb-[12px]">FAQ</Eyebrow>
        <h2 className="text-[clamp(28px,3.5vw,44px)] font-bold tracking-[-0.03em] text-dark">
          Frequently asked questions
        </h2>
      </div>
      <div className="border-t border-border">
        {faqs.map((faq, i) => (
          <details
            key={i}
            className="group border-b border-border [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex min-h-[56px] cursor-pointer items-center justify-between gap-[16px] py-[16px] pr-[8px] text-left text-[16px] font-semibold leading-[1.3] tracking-[-0.02em] text-dark sm:py-[20px]">
              <span>{faq.question}</span>
              <ChevronIcon />
            </summary>
            <div className="pb-[20px] pr-[8px] sm:pr-[32px]">
              <p className="text-[15px] leading-[1.7] tracking-[-0.01em] text-gray">{faq.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </Section>
  )
}

function ChevronIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
      className="shrink-0 text-gray transition-transform duration-[var(--duration-fast)] group-open:rotate-180"
    >
      <path d="M4.5 7L9 11.5L13.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  )
}
