import { notFound } from 'next/navigation'
import { pillars } from '@/components/sections/services-data'
import type { Metadata } from 'next'

type Params = { pillar: string }

export async function generateStaticParams(): Promise<Params[]> {
  return pillars.map((p) => ({ pillar: p.id }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { pillar } = await params
  const p = pillars.find((x) => x.id === pillar)
  if (!p) return { robots: { index: false, follow: false } }
  return {
    title: p.label,
    description: `${p.headline}. Coming soon.`,
    robots: { index: false, follow: false },
  }
}

export default async function PillarHubPage({ params }: { params: Promise<Params> }) {
  const { pillar } = await params
  const p = pillars.find((x) => x.id === pillar)
  if (!p) notFound()
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-[640px] text-center">
        <p
          className="text-[11px] font-bold tracking-[0.1em] uppercase mb-4"
          style={{ color: p.color }}
        >
          {p.label}
        </p>
        <h1 className="text-[clamp(32px,4vw,52px)] font-bold tracking-[-0.035em] leading-[1.05] text-dark mb-6">
          {p.headline}
        </h1>
        <p className="text-[16px] text-gray leading-[1.65] mb-8">{p.body}</p>
        <p className="text-[14px] text-gray-light">
          Detailed service pages launching soon.{' '}
          <a href="/" className="underline hover:text-dark">Back to home</a>
        </p>
      </div>
    </main>
  )
}
