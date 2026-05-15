// TODO: fill the [TODO: …] placeholders below from the Clutch profile.
//   - clutchProfileUrl: the public Clutch profile (used by the stat strip + section CTA)
//   - rating + reviewCount: current aggregate values
//   - quotes[]: 3 best Clutch reviews with verbatim quote, reviewer name, company, and deep-link to the specific review

const clutchProfileUrl = 'https://clutch.co/profile/metaborong-technologies-private'
const rating = '[TODO: 4.9]'
const reviewCount = '[TODO: 12]'

const quotes = [
  { quote: '[TODO: paste top Clutch quote 1 verbatim]', name: '[TODO: Name]', company: '[TODO: Company]', url: '[TODO: deep-link to this review on Clutch]' },
  { quote: '[TODO: paste top Clutch quote 2 verbatim]', name: '[TODO: Name]', company: '[TODO: Company]', url: '[TODO: deep-link to this review on Clutch]' },
  { quote: '[TODO: paste top Clutch quote 3 verbatim]', name: '[TODO: Name]', company: '[TODO: Company]', url: '[TODO: deep-link to this review on Clutch]' },
]

const Stars = ({ size = 13 }: { size?: number }) => (
  <span aria-label="5 out of 5 stars" style={{ display: 'inline-flex', gap: 2, color: '#F6851B', fontSize: size, lineHeight: 1 }}>
    {'★★★★★'}
  </span>
)

export function TestimonialsSection() {
  return (
    <section style={{ padding: '96px var(--section-px)', background: '#f5f7ff' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#999999', fontWeight: 600, marginBottom: 12 }}>Social proof</p>
          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 700, letterSpacing: '-0.035em', color: '#303030' }}>Reviewed and verified on Clutch</h2>
        </div>

        <a
          href={clutchProfileUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', padding: '20px 28px', marginBottom: 24, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, textDecoration: 'none', color: '#303030' }}
        >
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em', color: '#17313E' }}>Clutch</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>{rating}</span>
            <Stars size={14} />
          </span>
          <span style={{ fontSize: 13, color: '#676767' }}>Based on {reviewCount} verified reviews</span>
          <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#10b981', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
            <span aria-hidden="true">✓</span> Verified
          </span>
        </a>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {quotes.map((q, i) => (
            <a
              key={i}
              href={q.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 28, display: 'flex', flexDirection: 'column', gap: 16, textDecoration: 'none', color: 'inherit' }}
            >
              <Stars />
              <p style={{ fontSize: 15, color: '#303030', lineHeight: 1.7, letterSpacing: '-0.01em', fontStyle: 'italic', flex: 1 }}>&ldquo;{q.quote}&rdquo;</p>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#303030', letterSpacing: '-0.01em' }}>{q.name}</div>
                <div style={{ fontSize: 12, color: '#676767' }}>{q.company}</div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#296ff0', letterSpacing: '-0.005em' }}>Read on Clutch →</span>
            </a>
          ))}
        </div>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <a
            href={clutchProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 14, fontWeight: 600, color: '#296ff0', textDecoration: 'none', letterSpacing: '-0.005em' }}
          >
            View all reviews on Clutch →
          </a>
        </div>
      </div>
    </section>
  )
}
