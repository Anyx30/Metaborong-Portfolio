'use client'

import { useGenesisCube } from './use-genesis-cube'
import { DEFAULT_CONFIG } from './renderer'

interface GenesisCubeProps {
  className?: string
}

export function GenesisCube({ className = '' }: GenesisCubeProps) {
  const frame = useGenesisCube()

  return (
    <div
      className={className}
      aria-hidden="true"
      style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', width: '100%', height: '100%' }}
    >
      <pre style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 'clamp(7px, 1.1vw, 11px)',
        lineHeight: 1.25,
        letterSpacing: '0.05em',
        color: '#204AF8',
        userSelect: 'none',
        whiteSpace: 'pre',
        opacity: 0.85,
      }}>
        {frame || Array(DEFAULT_CONFIG.rows).fill(' '.repeat(DEFAULT_CONFIG.cols)).join('\n')}
      </pre>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, transparent 40%, #f5f7ff 100%)',
      }} />
    </div>
  )
}
