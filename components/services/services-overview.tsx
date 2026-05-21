import { Section } from '@/components/ui/section'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Button } from '@/components/ui/button'
import { pillars, type Pillar, type ChildService } from '@/components/sections/services-data'
import { TrustBar } from '@/components/sections/trust-bar'
import { ClutchWidget } from '@/components/sections/clutch-widget'
import { ContactCtaSection } from '@/components/sections/contact-cta'

// 130–180 word AEO-eligible hero lede. Entity-definition opener
// (`Metaborong is a…`) per SERVICES_PLAN.md § 3 Template A and DESIGN.md
// § Writing Tone. Body sentence target 12–14 words. No marketing inflation
// (`revolutionary`, `cutting-edge`, etc.).
const HERO_LEDE =
  'Metaborong is a boutique engineering studio that builds production AI systems, on-chain protocols, and greenfield SaaS products for founders and crypto-native teams. We sell three engagements — AI capability added to existing products, decentralised protocol work across smart contracts and DeFi, and end-to-end product builds from scope through launch. One senior team owns each engagement: architecture, engineering, security, and deployment, from the first call to production. We engage from India and deliver globally, staying accountable as co-builders rather than billed contractors. Every claim on this site maps to a shipped engagement — agentic AI in production at PredictRAM and SunsetML, an Aadhaar-integrated DID stack live at GovTech scale, and DeFi protocols audited and shipped across EVM, Solana, and Cosmos. The three pillars below describe what we sell. The outcome strip routes by problem, not capability.'

type Outcome = {
  title: string
  clarifier: string
  href: string
}

// Four outcome cards per SERVICES_PLAN.md § 7. Routes a problem-thinking
// buyer to the canonical v1 destination. The DID card carries the GovTech
// credential without making it a pillar.
const OUTCOMES: Outcome[] = [
  {
    title: 'Launch a new product',
    clarifier: 'Zero-to-launch builds for founders without an in-house CTO.',
    href: '/services/product-studio/mvp-development/',
  },
  {
    title: 'Add AI to your product',
    clarifier: 'Architect and harden LLMs inside your existing product stack.',
    href: '/services/ai/llm-integration-architecture/',
  },
  {
    title: 'Launch a token or DeFi protocol',
    clarifier: 'Tokenomics, smart contracts, and audit-ready protocol engineering.',
    href: '/services/web3/',
  },
  {
    title: 'Build a verified-identity / DID system',
    clarifier: 'Aadhaar-integrated DID stacks and UIDAI-aware credentials.',
    href: '/services/web3/decentralized-identity-did-integration/',
  },
]

type EngagementPhase = {
  num: string
  title: string
  duration: string
  body: string
}

// Three-panel engagement model strip. Anchors the vocabulary across pillars
// so leaf pages can echo `Discovery / Build / Operate` without re-explaining.
const ENGAGEMENT_PHASES: EngagementPhase[] = [
  {
    num: '01',
    title: 'Discovery',
    duration: '1–2 wks',
    body: 'A scoped sprint — problem framing, technical feasibility, written approach, milestone plan.',
  },
  {
    num: '02',
    title: 'Build',
    duration: '4–16 wks',
    body: 'One senior team owns architecture, engineering, security, and deployment. Reviewed every two weeks.',
  },
  {
    num: '03',
    title: 'Operate',
    duration: 'Ongoing',
    body: 'Post-launch retainers for AI evals, protocol upgrades, and product engineering — only when wanted.',
  },
]

type OverviewFaq = { q: string; a: string }

// Five services-overview FAQs per SERVICES_PLAN.md § 3 Template A. Covers
// engagement entry, length, location, IP, and pricing model. Answers obey
// DESIGN.md § Writing Tone — verifiable facts, no marketing inflation.
const OVERVIEW_FAQS: OverviewFaq[] = [
  {
    q: 'How do engagements typically start?',
    a: 'A 30-minute call to scope the problem, then a written approach you can read or leave. No pitch deck, no discovery gauntlet. We hold NDAs until scoping gets concrete — not before the first conversation. Most teams hear back within 12 hours of the first email.',
  },
  {
    q: 'What is a typical engagement length?',
    a: 'Four to twelve weeks for most builds. Smart-contract delivery and AI integrations usually land in four to six. DeFi protocols, full SaaS platforms, and DID rollouts run longer — eight to sixteen weeks, milestoned and reviewed every two weeks. We scope to deliverables, not billed hours.',
  },
  {
    q: 'Where is the team based?',
    a: 'Remote-first and globally distributed, with senior engineering anchored in India. We deliver across EVM, Solana, and Cosmos for global Web3 clients, and run UIDAI- and Aadhaar-integrated DID work for Indian GovTech engagements. No single head office — contact@metaborong.com reaches a founder.',
  },
  {
    q: 'Who owns the IP and the code?',
    a: 'You do, on delivery. Code, models, deployment infrastructure, and credentials transfer to your team or organisation. We keep no claim beyond the right to reference anonymised case studies — and even those wait for explicit sign-off from the engagement owner.',
  },
  {
    q: 'Do you work on retainer or fixed-bid?',
    a: 'Both. Fixed-bid for scoped deliverables — smart-contract suites, MVP builds, audit response, DID rollouts. Retainer for ongoing work — production AI monitoring, protocol upgrades, post-launch product engineering. We default to fixed-bid for first engagements so the brief is forced into clarity.',
  },
]

// Group v1 (published) leaves by sub-group, capped at 3 per group. Sub-groups
// with zero v1 leaves drop out of the pillar card entirely. Overflow is
// surfaced as `+N more on the hub`. Coming-soon leaves never appear here.
type PillarV1Group = {
  id: string
  label: string
  visible: ChildService[]
  overflow: number
}

function getPillarV1Groups(pillar: Pillar): PillarV1Group[] {
  return pillar.subGroups
    .map((sg) => {
      const v1 = sg.children.filter((c) => c.status === 'published')
      const visible = v1.slice(0, 3)
      return {
        id: sg.id,
        label: sg.label,
        visible,
        overflow: v1.length - visible.length,
      }
    })
    .filter((g) => g.visible.length > 0)
}

export function ServicesOverview() {
  return (
    <>
      <HeroBlock />
      <OutcomeStrip />
      <PillarGrid />
      <EngagementStrip />
      <TrustBand />
      <FaqBlock />
      <ContactCtaSection />
    </>
  )
}

/* ------------------------------- HERO ------------------------------- */

function HeroBlock() {
  return (
    <Section bg="default" maxWidth="xwide" aria-labelledby="services-overview-heading">
      <div className="max-w-[880px]">
        <Eyebrow as="p" className="mb-[16px]">
          Services
        </Eyebrow>
        <h1
          id="services-overview-heading"
          className="text-[clamp(40px,5.2vw,72px)] font-bold leading-[1.03] tracking-[-0.04em] text-dark"
        >
          What we build
        </h1>
        <p className="mt-[24px] text-[17px] leading-[1.65] tracking-[-0.005em] text-gray md:text-[18px]">
          {HERO_LEDE}
        </p>
        <div className="mt-[32px] flex flex-wrap items-center gap-[12px]">
          <Button
            href="mailto:contact@metaborong.com?subject=New%20project%20inquiry"
            variant="primary"
            size="lg"
            arrow="→"
          >
            Talk to us
          </Button>
          <Button href="/#work" variant="ghost" size="lg">
            Read case studies
          </Button>
        </div>
      </div>
    </Section>
  )
}

/* --------------------------- OUTCOME STRIP -------------------------- */

function OutcomeStrip() {
  return (
    <Section bg="subtle" maxWidth="xwide" aria-labelledby="services-outcomes-heading">
      <div className="flex flex-col gap-[8px] md:flex-row md:items-end md:justify-between md:gap-[32px]">
        <div>
          <Eyebrow as="p" className="mb-[12px]">
            By outcome
          </Eyebrow>
          <h2
            id="services-outcomes-heading"
            className="text-[clamp(24px,3vw,36px)] font-bold leading-[1.1] tracking-[-0.03em] text-dark"
          >
            Pick by problem, not capability
          </h2>
        </div>
        <p className="max-w-[420px] text-[14px] leading-[1.6] tracking-[-0.005em] text-gray">
          Each outcome routes to the closest v1 service or pillar hub.
        </p>
      </div>

      <ul
        role="list"
        className="mt-[32px] grid grid-cols-1 gap-[12px] sm:grid-cols-2 lg:grid-cols-4 lg:gap-[16px]"
      >
        {OUTCOMES.map((o) => (
          <li key={o.title}>
            <a
              href={o.href}
              className="group flex h-full min-h-[44px] flex-col justify-between gap-[16px] border border-border bg-bg p-[20px] no-underline transition-[border-color,background-color] duration-[var(--duration-instant)] hover:border-brand/40 hover:bg-bg-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              <div>
                <p className="text-[15px] font-bold leading-[1.25] tracking-[-0.015em] text-dark">
                  {o.title}
                </p>
                <p className="mt-[8px] text-[13px] leading-[1.5] tracking-[-0.005em] text-gray">
                  {o.clarifier}
                </p>
              </div>
              <span className="inline-flex items-center gap-[6px] font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-gray-light transition-colors duration-[var(--duration-instant)] group-hover:text-brand">
                Open
                <ArrowRight />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </Section>
  )
}

/* ---------------------------- PILLAR GRID --------------------------- */

function PillarGrid() {
  return (
    <Section bg="default" maxWidth="xwide" aria-labelledby="services-pillars-heading">
      <div className="max-w-[720px]">
        <Eyebrow as="p" className="mb-[12px]">
          Three pillars
        </Eyebrow>
        <h2
          id="services-pillars-heading"
          className="text-[clamp(28px,3.6vw,44px)] font-bold leading-[1.05] tracking-[-0.035em] text-dark"
        >
          AI, Web3, and Product Studio
        </h2>
        <p className="mt-[16px] text-[16px] leading-[1.65] tracking-[-0.005em] text-gray">
          Each pillar runs a Strategy / Product / Engineering triad — the same shape across all three, so engagements compose cleanly.
        </p>
      </div>

      <ul
        role="list"
        className="mt-[48px] grid grid-cols-1 gap-[16px] lg:grid-cols-3 lg:gap-[20px]"
      >
        {pillars.map((p) => (
          <PillarCard key={p.id} pillar={p} />
        ))}
      </ul>
    </Section>
  )
}

function PillarCard({ pillar }: { pillar: Pillar }) {
  const groups = getPillarV1Groups(pillar)
  return (
    <li
      className="relative flex flex-col border border-border bg-bg"
      style={{ '--pillar-color': pillar.color } as React.CSSProperties}
    >
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 h-full w-[3px]"
        style={{ backgroundColor: pillar.color }}
      />
      <div className="flex flex-col gap-[16px] p-[24px] md:p-[28px]">
        <div className="flex items-center justify-between">
          <span
            className="font-mono text-[12px] font-bold tracking-[0.06em]"
            style={{ color: pillar.color }}
          >
            [{pillar.num}]
          </span>
          <span
            className="font-mono text-[11px] font-bold uppercase tracking-[0.12em]"
            style={{ color: pillar.color }}
          >
            {pillar.label}
          </span>
        </div>
        <h3 className="text-[22px] font-bold leading-[1.15] tracking-[-0.025em] text-dark">
          {pillar.headline}
        </h3>
        <p className="text-[14px] leading-[1.6] tracking-[-0.005em] text-gray">
          {pillar.body}
        </p>
      </div>

      <div className="flex-1 border-t border-border-subtle px-[24px] py-[20px] md:px-[28px]">
        <ul role="list" className="flex flex-col gap-[18px]">
          {groups.map((g) => (
            <li key={g.id}>
              <p className="mb-[8px] font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-gray-light">
                {g.label}
              </p>
              <ul role="list" className="flex flex-col gap-[4px]">
                {g.visible.map((leaf) => (
                  <li key={leaf.slug}>
                    <a
                      href={`${pillar.hubHref}${leaf.slug}/`}
                      className="group flex min-h-[32px] items-center justify-between gap-[12px] -mx-[6px] px-[6px] py-[4px] text-[13px] leading-[1.35] tracking-[-0.005em] text-dark no-underline transition-colors duration-[var(--duration-instant)] hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                    >
                      <span>{leaf.name}</span>
                      <ArrowUpRight className="shrink-0 text-gray-light transition-colors duration-[var(--duration-instant)] group-hover:text-[var(--pillar-color)]" />
                    </a>
                  </li>
                ))}
                {g.overflow > 0 && (
                  <li>
                    <a
                      href={pillar.hubHref}
                      className="inline-block py-[4px] text-[12px] tracking-[-0.005em] text-gray-light no-underline hover:text-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                    >
                      +{g.overflow} more on the hub
                    </a>
                  </li>
                )}
              </ul>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-border-subtle p-[20px] md:px-[28px]">
        <a
          href={pillar.hubHref}
          className="inline-flex min-h-[44px] items-center gap-[8px] font-mono text-[12px] font-bold uppercase tracking-[0.12em] no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          style={{ color: pillar.color }}
        >
          <span>Open {pillar.label}</span>
          <ArrowRight />
        </a>
      </div>
    </li>
  )
}

/* ------------------------- ENGAGEMENT STRIP ------------------------- */

function EngagementStrip() {
  return (
    <Section bg="subtle" maxWidth="xwide" aria-labelledby="services-engagement-heading">
      <div className="max-w-[720px]">
        <Eyebrow as="p" className="mb-[12px]">
          Engagement model
        </Eyebrow>
        <h2
          id="services-engagement-heading"
          className="text-[clamp(28px,3.6vw,44px)] font-bold leading-[1.05] tracking-[-0.035em] text-dark"
        >
          Discovery → Build → Operate
        </h2>
        <p className="mt-[16px] text-[16px] leading-[1.65] tracking-[-0.005em] text-gray">
          The same shape across all three pillars. You can stop at any phase.
        </p>
      </div>

      <ol
        role="list"
        className="mt-[40px] grid grid-cols-1 border border-border bg-bg md:grid-cols-3 md:divide-x md:divide-border"
      >
        {ENGAGEMENT_PHASES.map((phase, i) => (
          <li
            key={phase.num}
            className={`flex flex-col gap-[12px] p-[24px] md:p-[28px] ${
              i < ENGAGEMENT_PHASES.length - 1 ? 'border-b border-border md:border-b-0' : ''
            }`}
          >
            <div className="flex items-baseline justify-between gap-[12px]">
              <span className="font-mono text-[12px] font-bold tracking-[0.08em] text-gray-light">
                [{phase.num}]
              </span>
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-gray">
                {phase.duration}
              </span>
            </div>
            <h3 className="text-[20px] font-bold tracking-[-0.025em] text-dark">
              {phase.title}
            </h3>
            <p className="text-[14px] leading-[1.6] tracking-[-0.005em] text-gray">
              {phase.body}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  )
}

/* ----------------------------- TRUST BAND --------------------------- */

function TrustBand() {
  return (
    <>
      <TrustBar />
      <Section bg="default" maxWidth="wide" aria-label="Independently rated on Clutch">
        <div className="flex flex-col items-center gap-[16px] text-center">
          <Eyebrow as="p">Independently rated</Eyebrow>
          <p className="sr-only">Metaborong is rated 4.9 out of 5 on Clutch.</p>
          <ClutchWidget />
        </div>
      </Section>
    </>
  )
}

/* -------------------------------- FAQ ------------------------------- */

function FaqBlock() {
  return (
    <Section bg="subtle" maxWidth="narrow" aria-labelledby="services-faq-heading">
      <div className="mb-[32px] md:mb-[40px]">
        <Eyebrow as="p" className="mb-[12px]">
          FAQ
        </Eyebrow>
        <h2
          id="services-faq-heading"
          className="text-[clamp(28px,3.5vw,44px)] font-bold tracking-[-0.035em] text-dark"
        >
          Frequently asked questions
        </h2>
      </div>
      <div className="border-t border-border">
        {OVERVIEW_FAQS.map((faq, i) => (
          <details
            key={i}
            className="services-faq-item group border-b border-border [&[open]_.services-faq-chevron]:rotate-180"
          >
            <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-[16px] py-[16px] sm:py-[20px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
              <span className="text-[16px] font-semibold leading-[1.3] tracking-[-0.02em] text-dark">
                {faq.q}
              </span>
              <ChevronDown className="services-faq-chevron shrink-0 text-gray transition-transform duration-[var(--duration-fast)]" />
            </summary>
            <div className="pb-[16px] pr-[8px] sm:pb-[20px] sm:pr-[32px]">
              <p className="text-[15px] leading-[1.7] tracking-[-0.01em] text-gray">{faq.a}</p>
            </div>
          </details>
        ))}
      </div>
      <style precedence="default">{`
        @media (prefers-reduced-motion: reduce) {
          .services-faq-chevron { transition: none !important; }
        }
      `}</style>
    </Section>
  )
}

/* ------------------------------ ICONS ------------------------------- */

function ArrowRight({ className = '' }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className={className}>
      <path
        d="M2 7H12M12 7L7.5 2.5M12 7L7.5 11.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </svg>
  )
}

function ArrowUpRight({ className = '' }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className={className}>
      <path d="M3 11L11 3M11 3H4.5M11 3V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  )
}

function ChevronDown({ className = '' }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" className={className}>
      <path d="M4 6.5L9 11.5L14 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  )
}
