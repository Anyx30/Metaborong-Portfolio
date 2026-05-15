const clutchProfileUrl = 'https://clutch.co/profile/metaborong-technologies-private'

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
    <section style={{ padding: '96px var(--section-px)', background: '#f5f7ff' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ marginBottom: 56, maxWidth: 720 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#999999', fontWeight: 600, marginBottom: 12 }}>Why us</p>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.05, color: '#303030', marginBottom: 20 }}>Why founders choose Metaborong</h2>
          <p style={{ fontSize: 16, color: '#676767', lineHeight: 1.65, letterSpacing: '-0.01em', maxWidth: 640, marginBottom: 24 }}>
            Founders pick Metaborong over larger Web3 and AI agencies for three reasons: shorter time to a first working version, sharper push-back on the brief, and the specialist depth — multichain protocols and AI agent orchestration — most studios don&apos;t have.
          </p>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', fontSize: 13, letterSpacing: '-0.005em' }}>
            <a
              href={clutchProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#303030', textDecoration: 'none', fontWeight: 600 }}
            >
              <span>4.9</span>
              <span aria-label="5 out of 5 stars" style={{ color: '#F6851B', letterSpacing: 1, fontSize: 12 }}>★★★★★</span>
              <span style={{ color: '#676767', fontWeight: 500 }}>on Clutch</span>
            </a>
            <span aria-hidden="true" style={{ color: '#d4d4d8' }}>·</span>
            <span style={{ color: '#303030', fontWeight: 600 }}>Reply within 12h</span>
            <span aria-hidden="true" style={{ color: '#d4d4d8' }}>·</span>
            <span style={{ color: '#303030', fontWeight: 600 }}>4–12 weeks to ship</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {reasons.map(r => (
            <div key={r.tag} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '36px 32px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: r.color, marginBottom: 18 }}>{r.tag}</div>
              <h3 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2, color: '#303030', marginBottom: 14 }}>{r.title}</h3>
              <p style={{ fontSize: 14, color: '#676767', lineHeight: 1.75, letterSpacing: '-0.005em' }}>{r.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
