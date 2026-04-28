import { type ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'ghost' | 'secondary'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  href?: string
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary:   { background: '#204AF8', color: '#fff' },
  ghost:     { background: 'transparent', color: '#303030', border: '1px solid #e5e7eb' },
  secondary: { background: '#f5f7ff', color: '#204AF8', border: '1px solid #dde4fe' },
}

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: { padding: '8px 16px', fontSize: 13, borderRadius: 6 },
  md: { padding: '10px 20px', fontSize: 14, borderRadius: 6 },
  lg: { padding: '14px 28px', fontSize: 16, borderRadius: 8 },
}

export function Button({
  variant = 'primary',
  size = 'md',
  href,
  children,
  style,
  ...props
}: ButtonProps) {
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontWeight: 600,
    letterSpacing: '-0.01em',
    cursor: 'pointer',
    textDecoration: 'none',
    border: 'none',
    fontFamily: 'var(--font-brand)',
    transition: 'opacity 0.15s',
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...style,
  }

  if (href) {
    return <a href={href} style={baseStyle}>{children}</a>
  }

  return (
    <button style={baseStyle} {...props}>
      {children}
    </button>
  )
}
