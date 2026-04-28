const projects = ['KGeN','Bionic','DATA3 AI','Defiverse','GET Smart','SEDAX','Bayan','Memestakes Vault']

export function TrustBar() {
  const doubled = [...projects, ...projects]
  return (
    <div style={{ borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', background: '#fff', padding: '14px 0', overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 80, zIndex: 2, background: 'linear-gradient(to right, #fff, transparent)' }} />
      <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 80, zIndex: 2, background: 'linear-gradient(to left, #fff, transparent)' }} />
      <div style={{ display: 'flex', gap: 48, animation: 'trustBarScroll 24s linear infinite', width: 'max-content' }}>
        {doubled.map((name, i) => (
          <span key={i} style={{ fontSize: 13, fontWeight: 500, color: '#676767', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>{name}</span>
        ))}
      </div>
      <style>{`@keyframes trustBarScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  )
}
