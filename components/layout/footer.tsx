import { Logo } from '@/components/ui/logo'

const footerLinks = ['Services','Work','About','Blog','Contact']

export function Footer() {
  return (
    <footer style={{ background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '36px 80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
      <Logo showWordmark wordmarkColor="rgba(255,255,255,0.85)" />
      <nav style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {footerLinks.map(label => (
          <a key={label} href={`/${label.toLowerCase()}/`} style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', letterSpacing: '-0.01em' }}>{label}</a>
        ))}
      </nav>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <a href="https://linkedin.com/company/metaborong-technologies" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
        </a>
        <a href="https://x.com/Metaborong" target="_blank" rel="noopener noreferrer" aria-label="X / Twitter">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.35)"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </a>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', letterSpacing: '-0.01em' }}>© 2026 Metaborong Technologies</span>
      </div>
    </footer>
  )
}
