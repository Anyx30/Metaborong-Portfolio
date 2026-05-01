const pillars = [
  { color: '#204AF8', label: 'Blockchain Development', headline: 'Decentralised systems built for real usage', body: 'We design and develop DeFi platforms, smart contracts, crypto wallets, token systems, and DAO infrastructure across multiple chains. Our blockchain development focuses on security, performance, and scalability under real network conditions.', href: '/services/web3/', cta: 'Explore Web3 Services →' },
  { color: '#10b981', label: 'AI Agent Development', headline: 'AI systems that perform tasks, not just respond', body: 'We build AI agents, generative AI applications, and Retrieval-Augmented Generation (RAG) systems. These AI systems automate workflows, process data, and operate continuously in production environments.', href: '/services/ai-agents/', cta: 'Explore AI Agent Services →' },
  { color: '#F6851B', label: 'Product Engineering', headline: 'Systems built for users, not just launch', body: 'We build full-stack products including SaaS platforms, dashboards, and data systems. From architecture to deployment, every product is designed for stability and growth.', href: '/services/product-studio/', cta: 'Explore Product Studio →' },
]

export function ServicesSection() {
  return (
    <section style={{ padding: '96px 80px', background: '#fff' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ marginBottom: 56 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#999999', fontWeight: 600, marginBottom: 12 }}>What we build</p>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.05, color: '#303030', maxWidth: 820 }}>AI systems, blockchain development, and product engineering — built as infrastructure</h2>
          <p style={{ marginTop: 16, fontSize: 16, color: '#676767', lineHeight: 1.65, letterSpacing: '-0.01em', maxWidth: 700 }}>
            Metaborong operates across three core areas: AI agent development, blockchain development, and product engineering. Each system is designed for real-world usage, not controlled environments.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: '#e5e7eb', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden' }}>
          {pillars.map(p => (
            <div key={p.label} style={{ background: '#fff', padding: '44px 36px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, color: p.color, marginBottom: 20 }}>⬡ {p.label}</div>
              <h3 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.2, color: '#303030', marginBottom: 14 }}>{p.headline}</h3>
              <p style={{ fontSize: 14, color: '#676767', lineHeight: 1.75, letterSpacing: '-0.005em', flex: 1, marginBottom: 28 }}>{p.body}</p>
              <a href={p.href} style={{ fontSize: 14, fontWeight: 600, color: p.color, textDecoration: 'none', letterSpacing: '-0.01em' }}>{p.cta}</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
