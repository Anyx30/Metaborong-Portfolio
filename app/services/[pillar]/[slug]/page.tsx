import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { pillars, getAllLeaves, type Pillar, type SubGroup, type ChildService } from '@/components/sections/services-data'
import { getLeafSeo } from '@/lib/services/seo-map'
import { getLeafContent } from '@/lib/services/content'
import { LeafServicePage } from '@/components/services/leaf-service'

type Params = { pillar: string; slug: string }

export async function generateStaticParams(): Promise<Params[]> {
  return pillars.flatMap((p) =>
    getAllLeaves(p).map((c) => ({ pillar: p.id, slug: c.slug })),
  )
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { pillar, slug } = await params
  const resolved = resolveLeaf(pillar, slug)
  if (!resolved) return { robots: { index: false, follow: false } }

  // Authored v1 leaf with published status → use SEO map entry.
  const isPublished = resolved.leaf.status === 'published'
  const hasContent = Boolean(getLeafContent(pillar, slug))
  if (isPublished && hasContent) {
    const seo = getLeafSeo(pillar, slug)
    if (seo) {
      return {
        title: seo.title,
        description: seo.description,
      }
    }
  }

  // Coming-soon (or published-but-unauthored) → noindex stub.
  return {
    title: resolved.leaf.name,
    description: `${resolved.leaf.description} Coming soon.`,
    robots: { index: false, follow: false },
  }
}

export default async function ServicePage({ params }: { params: Promise<Params> }) {
  const { pillar, slug } = await params
  const resolved = resolveLeaf(pillar, slug)
  if (!resolved) notFound()

  const { pillar: p, subGroup, leaf } = resolved

  if (leaf.status === 'published') {
    const content = getLeafContent(pillar, slug)
    if (content) {
      return <LeafServicePage pillar={p} subGroup={subGroup} leaf={leaf} content={content} />
    }
    // Published in the taxonomy but content not yet authored → render the
    // coming-soon stub. Keeps the route alive for build-time `generateStaticParams`
    // while content streams catch up. See SERVICES_PLAN.md § Risk 3 + § Risk 4.
  }

  return <ComingSoonStub pillar={p} leaf={leaf} />
}

// ─────────────────────────────────────────────────────────────────────────────
// Resolver — finds the pillar, sub-group, and leaf for a given route param
// pair. Returns undefined when either segment is unknown so the caller can
// 404 cleanly.
// ─────────────────────────────────────────────────────────────────────────────

interface ResolvedLeaf {
  pillar: Pillar
  subGroup: SubGroup
  leaf: ChildService
}

function resolveLeaf(pillarId: string, slug: string): ResolvedLeaf | undefined {
  const pillar = pillars.find((p) => p.id === pillarId)
  if (!pillar) return undefined
  for (const subGroup of pillar.subGroups) {
    const leaf = subGroup.children.find((c) => c.slug === slug)
    if (leaf) return { pillar, subGroup, leaf }
  }
  return undefined
}

// ─────────────────────────────────────────────────────────────────────────────
// Template D — coming-soon stub. noindex; minimal surface with the leaf
// name and a contact CTA. See SERVICES_PLAN.md § 3 Template D.
// ─────────────────────────────────────────────────────────────────────────────

function ComingSoonStub({ pillar, leaf }: { pillar: Pillar; leaf: ChildService }) {
  return (
    <main className="min-h-screen flex items-center justify-center px-[16px] py-[64px] sm:px-[24px]">
      <div className="max-w-[640px] text-center">
        <p
          className="text-[11px] font-bold tracking-[0.1em] uppercase mb-[16px]"
          style={{ color: pillar.color }}
        >
          {pillar.label}
        </p>
        <h1 className="text-[clamp(28px,3.5vw,44px)] font-bold tracking-[-0.03em] leading-[1.1] text-dark mb-[24px]">
          {leaf.name}
        </h1>
        <p className="text-[16px] leading-[1.65] text-gray mb-[32px]">{leaf.description}</p>
        <div className="flex flex-col items-stretch justify-center gap-[12px] sm:flex-row sm:items-center">
          <a
            href="mailto:contact@metaborong.com?subject=New%20project%20inquiry"
            className="inline-flex min-h-[44px] items-stretch justify-center bg-brand text-[15px] font-semibold tracking-[-0.01em] text-white no-underline [font-feature-settings:'tnum']"
          >
            <span className="px-[22px] py-[12px]">Talk to us</span>
            <span aria-hidden="true" className="border-l border-white/15 bg-white/10 px-[16px] py-[12px]">→</span>
          </a>
        </div>
        <p className="mt-[32px] text-[13px] text-gray-light">
          <Link href={pillar.hubHref} className="underline hover:text-dark">Back to {pillar.label}</Link>
          {' · '}
          <Link href="/" className="underline hover:text-dark">Home</Link>
        </p>
      </div>
    </main>
  )
}
