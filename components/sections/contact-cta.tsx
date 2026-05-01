export function ContactCtaSection() {
  return (
    <section style={{ background: '#0a0a0a', padding: '96px 80px', textAlign: 'center' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 700, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.03, marginBottom: 18 }}>
          Build something that works
        </h2>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.5)', letterSpacing: '-0.01em', lineHeight: 1.65, maxWidth: 500, margin: '0 auto 36px' }}>
          If you’re looking for an AI and Blockchain Development Company that builds systems beyond demos, we should talk.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
          <a href="/contact/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#204AF8', color: '#fff', fontSize: 16, fontWeight: 600, padding: '14px 28px', borderRadius: 8, textDecoration: 'none', letterSpacing: '-0.01em' }}>
            Start a Conversation →
          </a>
          <a href="mailto:contact@metaborong.com" style={{ display: 'inline-flex', alignItems: 'center', fontSize: 15, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', letterSpacing: '-0.01em', padding: '14px 0' }}>
            contact@metaborong.com
          </a>
        </div>
      </div>
    </section>
  )
}
