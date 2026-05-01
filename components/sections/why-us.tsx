const reasons = [
  { tag: 'Speed that respects your runway', color: '#204AF8', title: 'Speed that respects your runway', body: 'Fast delivery without compromising system quality.' },
  { tag: 'Product thinking before development', color: '#F6851B', title: 'Product thinking before development', body: 'We validate what should exist before building it.' },
  { tag: 'Depth in AI systems and blockchain development', color: '#10b981', title: 'Depth in AI and blockchain', body: 'From AI agents to DeFi infrastructure.' },
  { tag: 'Direct access to builders', color: '#8b5cf6', title: 'Direct access to builders', body: 'No communication gaps, no execution layers.' },
]

export function WhyUsSection() {
  return (
    <section style={{ padding: '96px 80px', background: '#f5f7ff' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ marginBottom: 56, maxWidth: 600 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#999999', fontWeight: 600, marginBottom: 12 }}>Why Metaborong</p>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.05, color: '#303030', marginBottom: 16 }}>Built for production, not presentation</h2>
          <p style={{ fontSize: 16, color: '#676767', lineHeight: 1.65, letterSpacing: '-0.01em' }}>
            Most AI and blockchain development teams optimize for speed or visual output. We focus on systems that hold under real usage.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
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
