import { type HTMLAttributes } from 'react'

type CardVariant = 'default' | 'featured' | 'quote'

interface CardProps extends HTMLAttributes<HTMLElement> {
  variant?: CardVariant
  accentColor?: string
  as?: 'div' | 'article' | 'li'
}

const variantClass: Record<CardVariant, string> = {
  default: 'p-[36px]',
  featured: 'p-[40px] border-l-[3px]',
  quote: 'p-[32px] italic',
}

export function Card({
  variant = 'default',
  accentColor,
  as: Tag = 'div',
  className = '',
  style,
  children,
  ...props
}: CardProps) {
  const featuredStyle =
    variant === 'featured' && accentColor
      ? { borderLeftColor: accentColor, ...style }
      : style

  return (
    <Tag
      className={`bg-white border border-border rounded-lg transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-brand/30 ${variantClass[variant]} ${className}`}
      style={featuredStyle}
      {...props}
    >
      {children}
    </Tag>
  )
}
