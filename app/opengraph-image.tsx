import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Metaborong — Web3 & AI Development Studio'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px',
          background: '#ffffff',
          fontFamily: 'system-ui, sans-serif',
          color: '#0a0a0a',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              background: '#204AF8',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '32px',
              fontWeight: 900,
              letterSpacing: '-0.02em',
            }}
          >
            M
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-0.02em' }}>
            Metaborong
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div
            style={{
              fontSize: '88px',
              fontWeight: 900,
              lineHeight: 1.02,
              letterSpacing: '-0.04em',
              maxWidth: '960px',
            }}
          >
            Web3 protocols. AI agents. Shipped.
          </div>
          <div
            style={{
              fontSize: '28px',
              fontWeight: 400,
              color: '#676767',
              maxWidth: '880px',
              lineHeight: 1.35,
            }}
          >
            A senior engineering studio building DeFi systems, autonomous agents, and SaaS products end-to-end.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '20px',
            color: '#676767',
            fontFamily: 'ui-monospace, "JetBrains Mono", monospace',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          <div>metaborong.com</div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>Web3</span>
            <span style={{ color: '#cbd5e1' }}>·</span>
            <span>AI</span>
            <span style={{ color: '#cbd5e1' }}>·</span>
            <span>SaaS</span>
          </div>
        </div>
      </div>
    ),
    size,
  )
}
