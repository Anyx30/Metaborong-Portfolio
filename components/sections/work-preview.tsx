const projects = [
  { name: 'KGeN — Web3 infrastructure for digital economies', category: 'Web3 · Gaming', color: '#204AF8' },
  { name: 'DATA3 AI — data-driven AI systems',                category: 'AI · Data',     color: '#10b981' },
  { name: 'Bionic — decentralized finance platform',          category: 'Web3 · DeFi',   color: '#204AF8' },
  { name: 'Bayan — AI chatbot and voice system',              category: 'AI · Voice',    color: '#10b981' },
]

export function WorkPreviewSection() {
  return (
    <section style={{ padding: '96px 80px', background: '#fff' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48 }}>
          <div>
            <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#999999', fontWeight: 600, marginBottom: 12 }}>Systems we’ve built</p>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700, letterSpacing: '-0.035em', color: '#303030' }}>Production systems across AI and blockchain</h2>
          </div>
          <a href="/work/" style={{ fontSize: 14, fontWeight: 600, color: '#204AF8', textDecoration: 'none' }}>View Case Studies →</a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          {projects.map(p => (
            <div key={p.name} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ height: 80, background: '#f5f7ff', borderRadius: 8, marginBottom: 8 }} />
              <div style={{ fontSize: 11, fontWeight: 600, color: p.color, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{p.category}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.025em', color: '#303030' }}>{p.name}</h3>
              <a href="/work/" style={{ fontSize: 13, color: '#204AF8', fontWeight: 500, textDecoration: 'none', marginTop: 'auto' }}>View Case Study →</a>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 15, color: '#676767', lineHeight: 1.65, letterSpacing: '-0.01em', textAlign: 'center' }}>
          These systems are used in real environments with active users and ongoing workloads.
        </p>
      </div>
    </section>
  )
}
