export function ContactCtaSection() {
  return (
    <section style={{ background: '#0a0a0a', padding: '96px 80px', textAlign: 'center' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 700, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.03, marginBottom: 18 }}>
          Got a project in mind?
        </h2>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.5)', letterSpacing: '-0.01em', lineHeight: 1.65, maxWidth: 440, margin: '0 auto 36px' }}>
          Tell us what you are building. We will tell you how we would approach it — no pitch deck, no fluff, no commitment required.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
          <a href="mailto:contact@metaborong.com?subject=New%20project%20inquiry" style={{ display: 'inline-flex', alignItems: 'stretch', background: '#204AF8', color: '#fff', fontSize: 15, fontWeight: 600, textDecoration: 'none', letterSpacing: '-0.01em', fontFeatureSettings: '"tnum"' }}>
            <span style={{ padding: '12px 22px' }}>Email us</span>
            <span aria-hidden="true" style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.10)', borderLeft: '1px solid rgba(255,255,255,0.15)' }}>→</span>
          </a>
          <a href="mailto:contact@metaborong.com" style={{ display: 'inline-flex', alignItems: 'center', fontSize: 15, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', letterSpacing: '-0.01em', padding: '14px 0' }}>
            contact@metaborong.com
          </a>
        </div>
      </div>
    </section>
  )
}
