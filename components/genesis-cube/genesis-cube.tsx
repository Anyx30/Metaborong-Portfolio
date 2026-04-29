'use client'

import { useGenesisCube } from './use-genesis-cube'
import { CANVAS_W, CANVAS_H } from './renderer'

export function GenesisCube({ className = '' }: { className?: string }) {
  const canvasRef = useGenesisCube()

  return (
    <div
      className={className}
      aria-hidden="true"
      style={{
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        width:           '100%',
        height:          '100%',
        overflow:        'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        style={{
          display:   'block',
          width:     'auto',
          height:    '80%',
          maxWidth:  '90%',
        }}
      />
    </div>
  )
}
