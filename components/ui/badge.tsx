type BadgeVariant = 'blue' | 'orange' | 'gray' | 'dark'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  blue:   { background: '#eef1fe', color: '#204AF8', border: '1px solid #dde4fe' },
  orange: { background: '#fff4ea', color: '#F6851B', border: '1px solid #fed7aa' },
  gray:   { background: '#f9fafb', color: '#676767', border: '1px solid #e5e7eb' },
  dark:   { background: '#0a0a0a', color: '#fff' },
}

export function Badge({ variant = 'gray', children }: BadgeProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 11px',
        borderRadius: 100,
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: '0.04em',
        ...variantStyles[variant],
      }}
    >
      {children}
    </span>
  )
}
