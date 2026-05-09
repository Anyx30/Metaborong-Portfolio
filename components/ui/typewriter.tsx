'use client'

type Line = { text: string; className?: string }

type Props = {
  lines: Line[]
  /** Per-line reveal duration in ms. Default 700. */
  durationMs?: number
  /** Delay before the first line starts revealing in ms. Default 200. */
  startDelayMs?: number
  className?: string
}

/**
 * CSS-driven smooth typewriter. Renders all text in the DOM (SSR/SEO-safe);
 * a clip-path mask sweeps left-to-right per line. Honours reduced-motion.
 */
export function Typewriter({
  lines,
  durationMs = 700,
  startDelayMs = 200,
  className = '',
}: Props) {
  return (
    <span className={`typewriter ${className}`}>
      {lines.map((line, i) => {
        const delay = startDelayMs + i * durationMs
        return (
          <span key={i} className="typewriter-line">
            <span
              className={`typewriter-text ${line.className ?? ''}`}
              style={{
                animationDuration: `${durationMs}ms`,
                animationDelay: `${delay}ms`,
              }}
            >
              {line.text}
            </span>
          </span>
        )
      })}
    </span>
  )
}
