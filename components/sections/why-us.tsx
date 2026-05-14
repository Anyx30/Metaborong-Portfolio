const reasons = [
  { tag: 'Speed',           color: '#296ff0', title: 'Speed that respects your runway',    body: 'We ship in weeks, not quarters. A lean, senior team means no account managers between you and the people writing code. Direct communication, fast decisions, fewer handoffs.' },
  { tag: 'Product thinking',color: '#F6851B', title: 'Product thinking, not just execution', body: 'We pressure-test assumptions before we write a line of code. If your spec has a gap, we name it. If a simpler approach would do the same job, we say so.' },
  { tag: 'Niche depth',     color: '#10b981', title: 'Niche depth where it counts',        body: 'Multichain Web3 architecture. DeFi primitives. AI agent orchestration. We go deep in the areas where generalist agencies stop.' },
]

export function WhyUsSection() {
  return (
    <section style={{ padding: '96px 80px', background: '#f5f7ff' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ marginBottom: 56, maxWidth: 560 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#999999', fontWeight: 600, marginBottom: 12 }}>Why us</p>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.05, color: '#303030' }}>Why founders choose Metaborong</h2>
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
