import { clutchProfileUrl } from '@/lib/links'
import { Section } from '@/components/ui/section'
import { Zap, CalendarDays } from 'lucide-react'

const projectLinkStyle: React.CSSProperties = {
  color: '#296ff0',
  textDecoration: 'underline',
  textUnderlineOffset: '3px',
  textDecorationThickness: '1px',
  textDecorationColor: 'rgba(41, 111, 240, 0.4)',
  fontWeight: 500,
}

const ext = (label: string, href: string) => (
  <a href={href} target="_blank" rel="noopener noreferrer" style={projectLinkStyle}>
    {label}
  </a>
)

const reasons = [
  {
    tag: 'Speed',
    color: '#296ff0',
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
    color: '#296ff0',
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
    color: '#296ff0',
    image: '/whyus/niche-depth.webp',
    title: 'Multichain Web3 and production-grade AI agents',
    body: (
      <>
        Smart contracts shipped on Ethereum, Solana, Base, Arbitrum, Hyperledger, Polygon, and Avalanche, including {ext('OrbitXPay', 'https://orbitxpay.com/')}&rsquo;s DeFi-banking module with multi-layer orchestration. AI agent orchestration in production at {ext('SunsetML', 'https://www.sunsetml.com/')} and {ext('PredictRAM', 'https://predictram.com/')}.
      </>
    ),
  },
]

export function WhyUsSection() {
  return (
    <Section bg="subtle" maxWidth="xwide">
      <div className="flex flex-col gap-[48px] lg:flex-row lg:items-start lg:justify-between lg:gap-[48px]">
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

        <div className="flex flex-col gap-[12px] sm:flex-row sm:flex-wrap lg:flex-col lg:items-end lg:gap-[16px]">
          <a
            href={clutchProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center gap-[8px] border border-border bg-bg px-[16px] text-[14px] tracking-[-0.005em] no-underline lg:translate-x-[-64px]"
          >
            <span className="font-semibold text-dark tabular-nums">4.9</span>
            <span aria-label="5 out of 5 stars" className="text-[12px] leading-none tracking-[1px] text-[#F6851B]">★★★★★</span>
            <span className="font-medium text-gray">on Clutch</span>
          </a>
          <span className="inline-flex min-h-[44px] items-center gap-[8px] border border-border bg-bg px-[16px] text-[14px] font-semibold tracking-[-0.005em] text-dark lg:translate-x-[-24px]">
            <Zap aria-hidden="true" className="size-[16px] shrink-0 text-gray" strokeWidth={2} />
            Reply within 12h
          </span>
          <span className="inline-flex min-h-[44px] items-center gap-[8px] border border-border bg-bg px-[16px] text-[14px] font-semibold tracking-[-0.005em] text-dark lg:translate-x-[-12px]">
            <CalendarDays aria-hidden="true" className="size-[16px] shrink-0 text-gray" strokeWidth={2} />
            4–12 weeks to ship
          </span>
        </div>
      </div>

      <div className="mt-[48px] grid grid-cols-1 border border-border md:mt-[64px] md:grid-cols-3">
        {reasons.map((r, i) => (
          <div
            key={r.tag}
            className={`relative flex flex-col bg-bg ${i > 0 ? 'border-t border-border md:border-l md:border-t-0' : ''}`}
          >
            <div className="relative aspect-square w-full">
              <img
                src={r.image}
                alt=""
                loading="lazy"
                width={800}
                height={800}
                className="absolute inset-0 size-full object-contain p-[32px]"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-bg to-transparent" />
            </div>
            <div className="flex flex-col gap-[16px] px-[24px] pb-[32px] lg:px-[32px]">
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-gray">{r.tag}</span>
              <h3 className="text-[clamp(20px,1.6vw,24px)] font-bold uppercase leading-[1.15] tracking-[-0.025em] text-dark">{r.title}</h3>
              <p className="text-[14px] leading-[1.7] tracking-[-0.005em] text-gray">{r.body}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
