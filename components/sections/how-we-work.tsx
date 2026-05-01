export function HowWeWorkSection() {
  const steps = [
    { name: 'Discovery', desc: 'Define use cases, constraints, and risks' },
    { name: 'System Design', desc: 'Scalable AI and blockchain architecture' },
    { name: 'Development', desc: 'Production-ready implementation' },
    { name: 'Deployment', desc: 'Optimization for performance and reliability' },
  ]

  return (
    <section style={{ padding: '96px 80px', background: '#f5f7ff' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ marginBottom: 56, maxWidth: 600 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#999999', fontWeight: 600, marginBottom: 12 }}>How we work</p>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.05, color: '#303030', marginBottom: 16 }}>Structured engineering, not ad-hoc development</h2>
          <p style={{ fontSize: 16, color: '#676767', lineHeight: 1.65, letterSpacing: '-0.01em' }}>
            Every system follows a clear process:
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
          {steps.map((s, i) => (
            <div key={s.name} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '36px 32px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#204AF8', marginBottom: 18 }}>Step {i + 1}</div>
              <h3 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2, color: '#303030', marginBottom: 14 }}>{s.name}</h3>
              <p style={{ fontSize: 14, color: '#676767', lineHeight: 1.75, letterSpacing: '-0.005em' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
