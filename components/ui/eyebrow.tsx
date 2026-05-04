import { type HTMLAttributes } from 'react'

interface EyebrowProps extends HTMLAttributes<HTMLSpanElement> {
  as?: 'span' | 'div' | 'p'
}

export function Eyebrow({
  as: Tag = 'span',
  className = '',
  children,
  ...props
}: EyebrowProps) {
  return (
    <Tag
      className={`text-[11px] font-bold uppercase tracking-[0.1em] leading-none text-gray-light ${className}`}
      {...props}
    >
      {children}
    </Tag>
  )
}
