// TODO: replace [TODO: …] segments with one concrete project, credential, or stack detail per founder.
const founders = [
  { name: 'Arnab Ray',    role: 'CEO & Co-Founder', bio: 'Runs strategy and go-to-market for the studio. [TODO: one specific past project or Web3-/AI-ecosystem credential Arnab personally led.]',                                     linkedin: 'https://linkedin.com/in/arnab-ray' },
  { name: 'Anik Ghosh',   role: 'COO & Co-Founder', bio: 'Owns project delivery. Every engagement ships on schedule because Anik says no when it can’t. [TODO: one operational signal — prior company, delivery record, or domain.]', linkedin: 'https://linkedin.com/in/anik-ghosh' },
  { name: 'Soumojit Ash', role: 'CTO & Co-Founder', bio: 'Designs the architecture under every protocol and AI system we ship. [TODO: chains or frameworks Soumojit has shipped on.]',                                                   linkedin: 'https://linkedin.com/in/soumojit-ash' },
]

export function FoundersSection() {
  return (
    <section style={{ padding: '96px var(--section-px)', background: '#fff' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#999999', fontWeight: 600, marginBottom: 12 }}>The team</p>
          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 700, letterSpacing: '-0.035em', color: '#303030' }}>The team behind the work</h2>
        </div>
        <p style={{ fontSize: 16, color: '#676767', lineHeight: 1.65, letterSpacing: '-0.01em', maxWidth: 560, marginBottom: 48 }}>
          Three founders, hands-on in every engagement. The portfolio above was built by us — not by a contracting layer we manage. You&apos;ll be in Slack with the people writing your code.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {founders.map(f => (
            <div key={f.name} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: '32px 28px' }}>
              <div style={{ width: 56, height: 56, borderRadius: 12, background: '#f5f7ff', border: '1px solid rgba(41, 111, 240,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#296ff0', marginBottom: 20 }}>
                {f.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', color: '#303030', marginBottom: 4 }}>{f.name}</h3>
              <p style={{ fontSize: 12, color: '#296ff0', fontWeight: 600, letterSpacing: '0.02em', marginBottom: 14 }}>{f.role}</p>
              <p style={{ fontSize: 13, color: '#676767', lineHeight: 1.7, letterSpacing: '-0.005em', marginBottom: 20 }}>{f.bio}</p>
              <a href={f.linkedin} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#296ff0', fontWeight: 500, textDecoration: 'none' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#296ff0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                LinkedIn
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
