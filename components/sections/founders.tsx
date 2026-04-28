import { Linkedin } from 'lucide-react'

const founders = [
  { name: 'Arnab Ray',    role: 'CEO & Co-Founder', bio: 'Leads strategy, client relationships, and business direction. Background in technology entrepreneurship and Web3 ecosystem development.',                linkedin: 'https://linkedin.com/in/arnab-ray' },
  { name: 'Anik Ghosh',   role: 'COO & Co-Founder', bio: 'Oversees operations, project delivery, and go-to-market execution. Ensures every project ships on time and to spec.',                                linkedin: 'https://linkedin.com/in/anik-ghosh' },
  { name: 'Soumojit Ash', role: 'CTO & Co-Founder', bio: 'Leads technical architecture across Web3 and AI systems. Deep expertise in blockchain protocols, smart contracts, and AI agent design.',               linkedin: 'https://linkedin.com/in/soumojit-ash' },
]

export function FoundersSection() {
  return (
    <section style={{ padding: '96px 80px', background: '#fff' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#999999', fontWeight: 600, marginBottom: 12 }}>The team</p>
          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 700, letterSpacing: '-0.035em', color: '#303030' }}>The team behind the work</h2>
        </div>
        <p style={{ fontSize: 16, color: '#676767', lineHeight: 1.65, letterSpacing: '-0.01em', maxWidth: 560, marginBottom: 48 }}>
          A technical co-founding team with hands-on delivery experience across Web3 and AI. When you work with Metaborong, you work directly with the people who built the portfolio above.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {founders.map(f => (
            <div key={f.name} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: '32px 28px' }}>
              <div style={{ width: 56, height: 56, borderRadius: 12, background: '#f5f7ff', border: '1px solid rgba(32,74,248,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#204AF8', marginBottom: 20 }}>
                {f.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', color: '#303030', marginBottom: 4 }}>{f.name}</h3>
              <p style={{ fontSize: 12, color: '#204AF8', fontWeight: 600, letterSpacing: '0.02em', marginBottom: 14 }}>{f.role}</p>
              <p style={{ fontSize: 13, color: '#676767', lineHeight: 1.7, letterSpacing: '-0.005em', marginBottom: 20 }}>{f.bio}</p>
              <a href={f.linkedin} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#204AF8', fontWeight: 500, textDecoration: 'none' }}>
                <Linkedin size={14} /> LinkedIn
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
