const projects = [
  { name: 'KGeN',               category: 'Web3 · Gaming', color: '#204AF8' },
  { name: 'DATA3 AI',           category: 'AI · Data',     color: '#10b981' },
  { name: 'Bionic',             category: 'Web3 · DeFi',   color: '#204AF8' },
  { name: 'Bayan — AI Chatbot', category: 'AI · Voice',    color: '#10b981' },
]

export function WorkPreviewSection() {
  return (
    <section style={{ padding: '96px 80px', background: '#fff' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48 }}>
          <div>
            <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#999999', fontWeight: 600, marginBottom: 12 }}>Our work</p>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700, letterSpacing: '-0.035em', color: '#303030' }}>What we&apos;ve built</h2>
          </div>
          <a href="/#contact" style={{ fontSize: 14, fontWeight: 600, color: '#204AF8', textDecoration: 'none' }}>Talk to us →</a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {projects.map(p => (
            <div key={p.name} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ height: 80, background: '#f5f7ff', borderRadius: 8, marginBottom: 8 }} />
              <div style={{ fontSize: 11, fontWeight: 600, color: p.color, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{p.category}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.025em', color: '#303030' }}>{p.name}</h3>
              <a href="/#contact" style={{ fontSize: 13, color: '#204AF8', fontWeight: 500, textDecoration: 'none', marginTop: 'auto' }}>Read more →</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
