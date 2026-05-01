import { type HTMLAttributes } from 'react'

type SectionBg = 'default' | 'subtle' | 'dark'
type SectionMaxWidth = 'wide' | 'narrow' | 'prose'

interface SectionProps extends HTMLAttributes<HTMLElement> {
  bg?: SectionBg
  maxWidth?: SectionMaxWidth
  as?: 'section' | 'div'
}

const bgClass: Record<SectionBg, string> = {
  default: 'bg-bg',
  subtle: 'bg-bg-subtle',
  dark: 'bg-canvas text-white',
}

const maxWidthClass: Record<SectionMaxWidth, string> = {
  wide: 'max-w-[1280px]',
  narrow: 'max-w-[960px]',
  prose: 'max-w-[760px]',
}

export function Section({
  bg = 'default',
  maxWidth = 'wide',
  as: Tag = 'section',
  className = '',
  children,
  ...props
}: SectionProps) {
  return (
    <Tag
      className={`${bgClass[bg]} py-[96px] px-6 md:px-[80px] ${className}`}
      {...props}
    >
      <div className={`${maxWidthClass[maxWidth]} mx-auto`}>{children}</div>
    </Tag>
  )
}
