import { notFound } from 'next/navigation'
import { pillars } from '@/components/sections/services-data'
import type { Metadata } from 'next'

type Params = { pillar: string; slug: string }

export async function generateStaticParams(): Promise<Params[]> {
  return pillars.flatMap((p) =>
    p.children.map((c) => ({ pillar: p.id, slug: c.slug }))
  )
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { pillar, slug } = await params
  const p = pillars.find((x) => x.id === pillar)
  const c = p?.children.find((x) => x.slug === slug)
  if (!p || !c) return { robots: { index: false, follow: false } }
  return {
    title: `${c.name} — Metaborong`,
    description: `${c.description} Coming soon.`,
    robots: { index: false, follow: false },
  }
}

export default async function ServicePage({ params }: { params: Promise<Params> }) {
  const { pillar, slug } = await params
  const p = pillars.find((x) => x.id === pillar)
  const c = p?.children.find((x) => x.slug === slug)
  if (!p || !c) notFound()
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-[640px] text-center">
        <p
          className="text-[11px] font-bold tracking-[0.1em] uppercase mb-4"
          style={{ color: p.color }}
        >
          {p.label}
        </p>
        <h1 className="text-[clamp(28px,3.5vw,44px)] font-bold tracking-[-0.03em] leading-[1.1] text-dark mb-6">
          {c.name}
        </h1>
        <p className="text-[16px] text-gray leading-[1.65] mb-8">{c.description}</p>
        <p className="text-[14px] text-gray-light">
          Detailed service page launching soon.{' '}
          <a href={p.hubHref} className="underline hover:text-dark">Back to {p.label}</a>{' · '}
          <a href="/" className="underline hover:text-dark">Home</a>
        </p>
      </div>
    </main>
  )
}
