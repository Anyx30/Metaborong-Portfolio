export function IndustriesSection() {
  const industries = [
    'Fintech and decentralized finance (DeFi)',
    'AI-powered SaaS products',
    'Data-intensive platforms',
    'Web3 ecosystems and crypto-native products',
  ]

  return (
    <section style={{ padding: '96px 80px', background: '#fff' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', gap: 80, alignItems: 'center' }}>
        <div style={{ flex: 1, maxWidth: 560 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#999999', fontWeight: 600, marginBottom: 12 }}>Industries we work with</p>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.05, color: '#303030', marginBottom: 16 }}>AI systems and blockchain infrastructure for high-demand environments</h2>
          <p style={{ fontSize: 16, color: '#676767', lineHeight: 1.65, letterSpacing: '-0.01em', marginBottom: 32 }}>
            We build systems for:
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {industries.map(ind => (
              <li key={ind} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 16, color: '#303030', fontWeight: 500 }}>
                <span style={{ width: 6, height: 6, background: '#204AF8', borderRadius: '50%' }} />
                {ind}
              </li>
            ))}
          </ul>
        </div>
        <div style={{ flex: 1, height: 400, background: '#f5f7ff', borderRadius: 16, border: '1px solid #e5e7eb' }}>
          {/* Placeholder for visual or illustration */}
        </div>
      </div>
    </section>
  )
}
