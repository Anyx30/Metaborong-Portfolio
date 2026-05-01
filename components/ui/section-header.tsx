import { type ReactNode } from 'react'
import { Eyebrow } from './eyebrow'

interface SectionHeaderProps {
  eyebrow?: string
  title: ReactNode
  intro?: ReactNode
  align?: 'left' | 'center'
  trailing?: ReactNode
  className?: string
}

export function SectionHeader({
  eyebrow,
  title,
  intro,
  align = 'left',
  trailing,
  className = '',
}: SectionHeaderProps) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : ''
  const introMaxWidth = align === 'center' ? 'max-w-[640px] mx-auto' : 'max-w-[640px]'

  return (
    <header className={`mb-[48px] ${className}`}>
      <div className={`flex items-end justify-between gap-6 ${align === 'center' ? 'flex-col' : ''}`}>
        <div className={alignClass}>
          {eyebrow && (
            <Eyebrow as="div" className="mb-3">
              {eyebrow}
            </Eyebrow>
          )}
          <h2 className="font-bold text-dark leading-[1.05] tracking-[-0.035em] text-[clamp(32px,4vw,52px)]">
            {title}
          </h2>
          {intro && (
            <p className={`mt-4 text-[16px] leading-[1.65] tracking-[-0.01em] text-gray ${introMaxWidth}`}>
              {intro}
            </p>
          )}
        </div>
        {trailing && <div className="shrink-0">{trailing}</div>}
      </div>
    </header>
  )
}
