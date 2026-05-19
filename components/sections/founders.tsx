import { Section } from '@/components/ui/section'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Reveal } from '@/components/ui/reveal'

type Founder = {
  name: string
  role: string
  bio: string
  /** Real photo path, or null → monogram fallback (spec Deviation 5). */
  image: string | null
  /** Verified LinkedIn URL, or null → no button (spec Deviation 6). */
  linkedin: string | null
}

// Copy synced verbatim from the A3-locked block in
// docs/superpowers/specs/2026-05-19-founders-copy-audit.md. Do not edit here —
// edit homepage.md + re-run the A3 chain, then re-sync.
const founders: Founder[] = [
  {
    name: 'Arnab Ray',
    role: 'CEO & Co-Founder',
    bio: 'Co-founded Metaborong and sets its direction across Web3 and AI engagements.',
    image: null,
    linkedin: 'https://linkedin.com/in/arnab-ray',
  },
  {
    name: 'Anik Ghosh',
    role: 'COO & Co-Founder',
    bio: 'Co-founded the studio; owns delivery and the scope discipline that keeps timelines honest.',
    image: '/anikfounderimage.png',
    linkedin: 'https://www.linkedin.com/in/anik-ghosh-01a985208/',
  },
  {
    name: 'Soumojit Ash',
    role: 'CTO & Co-Founder',
    bio: 'Co-founded the studio and owns the architecture under every Web3 protocol and AI system it ships.',
    image: null,
    linkedin: null,
  },
]

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function FounderCard({ founder }: { founder: Founder }) {
  return (
    <div className="flex flex-col">
      {/* Photo tile is non-interactive by design — only the LinkedIn button links. */}
      <div className="relative aspect-square border border-border bg-white shadow-[0_12px_32px_-8px_rgba(0,0,0,0.12),0_6px_16px_-4px_rgba(0,0,0,0.06)]">
        {/* 4 dashed edge accents (Figma blueprint ticks) */}
        <span aria-hidden className="pointer-events-none absolute left-[8%] right-[8%] top-0 border-t border-dashed border-gray" />
        <span aria-hidden className="pointer-events-none absolute left-[8%] right-[8%] bottom-0 border-b border-dashed border-gray" />
        <span aria-hidden className="pointer-events-none absolute top-[8%] bottom-[8%] left-0 border-l border-dashed border-gray" />
        <span aria-hidden className="pointer-events-none absolute top-[8%] bottom-[8%] right-0 border-r border-dashed border-gray" />

        {/* Inset dashed frame holding the portrait/monogram */}
        <div className="absolute inset-[8%] border border-dashed border-gray overflow-hidden">
          {founder.image ? (
            <img
              src={founder.image}
              alt={`${founder.name}, ${founder.role}`}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              role="img"
              aria-label={founder.name}
              className="flex h-full w-full items-center justify-center bg-bg-subtle"
            >
              <span aria-hidden className="text-[56px] font-bold tracking-[-0.02em] text-gray">
                {initials(founder.name)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Name + role chip — chip never shrinks; stack on narrow to avoid collision */}
      <div className="mt-[24px] flex flex-col gap-[12px] sm:flex-row sm:items-center sm:justify-between sm:gap-[12px]">
        <h3 className="text-[20px] font-bold tracking-[-0.025em] text-dark">
          {founder.name}
        </h3>
        <div className="inline-flex shrink-0 items-center bg-bg-subtle border border-border rounded-sm px-3 py-[6px] w-fit">
          <Eyebrow as="span" className="text-[11px]! tracking-[0.1em]! text-gray!">
            {founder.role}
          </Eyebrow>
        </div>
      </div>

      {/* Bio */}
      <p className="mt-[12px] text-[16px] leading-[1.6] tracking-[-0.01em] text-gray">
        {founder.bio}
      </p>

      {/* LinkedIn — brand-blue square button, 7 states. No URL → no button.
          focus-visible ring comes from the global :where(a,…):focus-visible rule
          in globals.css (2px brand outline, 2px offset → lands on the white
          section bg, not the blue fill). Do not add outline-none here. */}
      {founder.linkedin && (
        <a
          href={founder.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${founder.name} on LinkedIn`}
          className="mt-[16px] inline-flex h-[44px] w-[44px] items-center justify-center border border-white bg-brand text-white transition-colors duration-[150ms] hover:bg-[#1f5fd0] active:bg-[#1a52b8]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zM8.34 18.34V9.94H5.56v8.4h2.78zM6.95 8.7a1.61 1.61 0 1 0 0-3.22 1.61 1.61 0 0 0 0 3.22zm11.39 9.64v-4.6c0-2.47-1.32-3.62-3.08-3.62a2.66 2.66 0 0 0-2.41 1.33h-.04V9.94H9.95c.04.79 0 8.4 0 8.4h2.78v-4.69c0-.25.02-.5.09-.68.2-.5.66-1.02 1.42-1.02 1 0 1.4.76 1.4 1.88v4.51h2.78z" />
          </svg>
        </a>
      )}
    </div>
  )
}

export function FoundersSection() {
  return (
    <Section bg="default" maxWidth="xwide">
      {/* Header */}
      <div className="flex flex-col gap-[24px] items-start">
        {/* Eyebrow chip — matched token-for-token to hero.tsx:50-54 (spec Deviation 2) */}
        <div className="inline-flex items-center bg-bg border border-border rounded-sm px-3 py-[6px] w-fit">
          <Eyebrow className="text-[12px]! tracking-[0.12em]!">The team</Eyebrow>
        </div>

        {/* H2 — "the work" in brand blue (Figma) */}
        <h2 className="text-[clamp(30px,4vw,56px)] font-bold tracking-[-0.03em] leading-[1.05] text-dark uppercase">
          The team behind <span className="text-brand">the work</span>
        </h2>

        {/* A3 lede */}
        <p className="max-w-[640px] text-[16px] leading-[1.65] tracking-[-0.01em] text-gray">
          Metaborong&apos;s three co-founders are hands-on in every Web3 and AI
          engagement. The work in our portfolio was built by us, not by a contracting
          layer we manage. You&apos;ll be in Slack with the people writing your code.
        </p>
      </div>

      {/* Card row */}
      <div className="mt-[48px] grid grid-cols-1 lg:grid-cols-3 gap-[48px]">
        {founders.map((founder, i) => (
          <Reveal key={founder.name} delay={i * 80}>
            <FounderCard founder={founder} />
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
