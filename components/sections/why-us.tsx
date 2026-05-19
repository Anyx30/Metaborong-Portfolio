import { clutchProfileUrl } from '@/lib/links'
import { Section } from '@/components/ui/section'
import { ClutchWidget } from '@/components/sections/clutch-widget'
import { Zap, CalendarDays } from 'lucide-react'

const ext = (label: string, href: string) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="font-medium text-brand underline decoration-brand/40 decoration-1 underline-offset-[3px]"
  >
    {label}
  </a>
)

const reasons = [
  {
    tag: 'Speed',
    image: '/whyus/speed.webp',
    title: 'First working version in weeks',
    body: (
      <>
        Lean senior team, no account-manager layer. {ext('AbsolveMe', 'https://www.absolveme.ai/')} needed its launch site live before the liquidity window closed. Site, content, and design support shipped in 2 days. The Solana–NEAR cross-chain layer followed in 5 more.
      </>
    ),
  },
  {
    tag: 'Product thinking',
    image: '/whyus/product-thinking.webp',
    title: 'We stress-test the brief before we build',
    body: (
      <>
        Spec gaps get named. Simpler approaches get raised. {ext('SunsetML', 'https://www.sunsetml.com/')} came to us with an AI writing-tool concept. We iterated the architecture with the founder across multiple planning rounds, and stayed on as equity co-founders.
      </>
    ),
  },
  {
    tag: 'Niche depth',
    image: '/whyus/niche-depth.webp',
    title: 'Multichain Web3 and production-grade AI agents',
    body: (
      <>
        Smart contracts shipped on Ethereum, Solana, Base, Arbitrum, Hyperledger, Polygon, and Avalanche, including {ext('OrbitXPay', 'https://orbitxpay.com/')}&rsquo;s DeFi-banking module with multi-layer orchestration. AI agent orchestration in production at {ext('SunsetML', 'https://www.sunsetml.com/')} and {ext('PredictRAM', 'https://predictram.com/')}.
      </>
    ),
  },
]

const chip =
  'inline-flex min-h-[44px] items-center gap-[8px] border border-border bg-bg px-[16px] text-[14px] tracking-[-0.005em]'

const stats = [
  { Icon: Zap, label: 'Reply within 12h' },
  { Icon: CalendarDays, label: '4–12 weeks to ship' },
]

export function WhyUsSection() {
  return (
    <Section bg="subtle" maxWidth="xwide">
      <div className="flex flex-col gap-[48px] lg:flex-row lg:items-end lg:justify-between lg:gap-[48px]">
        <div className="flex max-w-[720px] flex-col gap-[24px]">
          <span className="inline-flex w-fit items-center border border-border bg-bg px-[12px] py-[8px] font-mono text-[12px] font-medium uppercase leading-none tracking-[0.1em] text-gray">
            Why us
          </span>
          <h2 className="text-[clamp(32px,4vw,52px)] font-bold uppercase leading-[1.05] tracking-[-0.035em] text-dark">
            Why founders choose <span className="text-brand">Metaborong</span>
          </h2>
          <p className="max-w-[640px] text-[16px] leading-[1.65] tracking-[-0.01em] text-gray">
            Founders pick Metaborong over larger Web3 and AI agencies for three reasons: shorter time to a first working version, sharper push-back on the brief, and the specialist depth — multichain protocols and AI agent orchestration — most studios don&apos;t have.
          </p>
        </div>

        <div className="flex flex-col lg:items-end">
          <a href={clutchProfileUrl} target="_blank" rel="noopener noreferrer" className="sr-only">
            Metaborong is rated 4.9 out of 5 on Clutch
          </a>
          <div className="flex flex-col gap-[16px] border-t border-border pt-[24px] lg:items-end">
            <ClutchWidget />
            <div className="flex w-full flex-wrap gap-[12px] lg:w-auto lg:flex-nowrap lg:justify-end">
              {stats.map(({ Icon, label }) => (
                <span key={label} className={`${chip} w-full justify-center font-semibold tabular-nums text-dark lg:w-auto lg:shrink-0 lg:justify-start`}>
                  <Icon aria-hidden="true" className="size-[16px] shrink-0 text-gray" strokeWidth={2} />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-[48px] grid grid-cols-1 border border-border divide-y divide-border md:mt-[64px] md:grid-cols-3 md:divide-x md:divide-y-0">
        {reasons.map(r => (
          <div key={r.tag} className="relative flex flex-col bg-bg">
            <div className="relative aspect-square w-full">
              <img
                src={r.image}
                alt=""
                loading="lazy"
                decoding="async"
                width={800}
                height={800}
                className="absolute inset-0 size-full object-contain p-[32px]"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-bg to-transparent" />
            </div>
            <div className="flex flex-col gap-[16px] px-[24px] pb-[32px] lg:px-[32px]">
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-gray">{r.tag}</span>
              <h3 className="text-balance text-[clamp(20px,1.6vw,24px)] font-bold uppercase leading-[1.15] tracking-[-0.025em] text-dark">{r.title}</h3>
              <p className="text-[14px] leading-[1.7] tracking-[-0.005em] text-gray">{r.body}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
