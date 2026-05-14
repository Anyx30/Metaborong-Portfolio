const rows = [
  { label: 'Team access',        mb: 'Direct — founders',    large: 'Account manager layer',  free: 'Direct but inconsistent' },
  { label: 'AI-native services', mb: 'Core offering',        large: 'Add-on or absent',       free: 'Rare' },
  { label: 'DeFi depth',         mb: 'Deep, multichain',     large: 'Generic',                free: 'Depends on individual' },
  { label: 'Speed to delivery',  mb: 'Weeks',                large: 'Months',                 free: 'Unpredictable' },
  { label: 'Product thinking',   mb: 'Built in',             large: 'Execution-focused',      free: 'Absent' },
  { label: 'Track record',       mb: '8 shipped products',   large: 'Hundreds of clients ✓',  free: 'Case by case' },
]

export function ComparisonSection() {
  return (
    <section style={{ padding: '96px 80px', background: '#f5f7ff' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#999999', fontWeight: 600, marginBottom: 12 }}>Comparison</p>
          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 700, letterSpacing: '-0.035em', color: '#303030' }}>How Metaborong compares</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: '#999999', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', width: '22%' }} />
                <th style={{ textAlign: 'left', padding: '12px 16px', color: '#296ff0', fontSize: 13, fontWeight: 700, width: '26%' }}>Metaborong</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: '#676767', fontSize: 13, fontWeight: 600, width: '26%' }}>Large Web3 Agency</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: '#676767', fontSize: 13, fontWeight: 600, width: '26%' }}>Freelance Team</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.label} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : 'transparent' }}>
                  <td style={{ padding: '14px 16px', color: '#676767', fontWeight: 500, fontSize: 13 }}>{r.label}</td>
                  <td style={{ padding: '14px 16px', color: '#303030', fontWeight: 600 }}>{r.mb}</td>
                  <td style={{ padding: '14px 16px', color: '#676767' }}>{r.large}</td>
                  <td style={{ padding: '14px 16px', color: '#676767' }}>{r.free}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: 16, fontSize: 12, color: '#999999' }}>✓ denotes where the alternative genuinely wins. Large agencies have longer track records — a real advantage for enterprises needing procurement comfort.</p>
      </div>
    </section>
  )
}
