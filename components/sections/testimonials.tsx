const testimonials = [
  { quote: 'Impressive DevOps & backend support by Metaborong, their expertise made a real difference. Highly recommend!', name: 'Siddharth Banerjee', role: 'Client' },
  { quote: 'Excited to team up with Metaborong! Strong reference and previous quality work made them the perfect fit.',    name: 'Dr. Josh',            role: 'Client' },
  { quote: 'Metaborong took Create Protocol to the next level with their Web3 and Web2 skills. Impressive work!',          name: 'Abhishek Krishna',    role: 'Create Protocol' },
  { quote: 'Metaborong really put their effort to write smart contracts for Create Protocol & their web 2.0 team support was exceptional!', name: 'Girish Ahirwar', role: 'Create Protocol' },
]

export function TestimonialsSection() {
  return (
    <section style={{ padding: '96px 80px', background: '#f5f7ff' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#999999', fontWeight: 600, marginBottom: 12 }}>Social proof</p>
          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 700, letterSpacing: '-0.035em', color: '#303030' }}>Voices of trust</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
          {testimonials.map(t => (
            <div key={t.name} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 32 }}>
              <p style={{ fontSize: 16, color: '#303030', lineHeight: 1.7, letterSpacing: '-0.01em', marginBottom: 24, fontStyle: 'italic' }}>&ldquo;{t.quote}&rdquo;</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#204AF8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{t.name[0]}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#303030', letterSpacing: '-0.01em' }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: '#676767' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
