interface MMarkProps {
  className?: string
  color?: string
}

export function MMark({ className = '', color = 'currentColor' }: MMarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="52.082"
      height="30.457"
      viewBox="0 0 52.082 30.457"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M 10.421 5.234 C 10.421 2.343 12.754 0 15.631 0 C 18.509 0 20.842 2.343 20.842 5.234 L 20.842 10.326 C 20.842 10.326 21.153 12.766 22.164 13.809 C 23.206 14.886 25.723 15.229 25.723 15.229 L 26.382 15.229 C 26.382 15.229 28.898 14.886 29.941 13.809 C 30.799 12.924 31.153 11.031 31.24 10.48 L 31.24 5.234 C 31.24 2.343 33.573 0 36.451 0 C 39.328 0 41.661 2.343 41.661 5.234 L 41.661 10.326 C 41.661 10.326 41.972 12.766 42.983 13.809 C 44.026 14.886 46.542 15.229 46.542 15.229 L 47.852 15.229 C 50.188 15.229 52.082 17.131 52.082 19.477 L 52.082 30.457 L 41.661 30.457 L 41.661 15.229 L 36.121 15.229 C 36.121 15.229 33.605 15.571 32.562 16.648 C 31.704 17.534 31.35 19.426 31.263 19.977 L 31.263 25.224 C 31.263 28.114 28.93 30.457 26.052 30.457 C 23.175 30.457 20.842 28.114 20.842 25.224 L 20.842 20.131 C 20.842 20.131 20.501 17.604 19.429 16.556 C 18.39 15.541 15.961 15.229 15.961 15.229 L 10.421 15.229 L 10.421 30.457 L 0 30.457 L 0 19.477 C 0 17.131 1.894 15.229 4.23 15.229 L 5.54 15.229 C 5.54 15.229 8.056 14.886 9.099 13.809 C 10.11 12.766 10.421 10.326 10.421 10.326 L 10.421 5.234 Z"
        fill={color}
        fillRule="evenodd"
      />
    </svg>
  )
}

type LogoSize = 'sm' | 'md' | 'lg'

interface LogoProps {
  size?: LogoSize
  showWordmark?: boolean
  wordmarkColor?: string
  href?: string
}

// `sm` is the navbar variant: Figma node 60:951 (file mQsbMuw0spVgIu7jXirr3o).
// Mobile baseline 36px container / 22px wordmark; bumps to 44px / 26px at lg+
// to anchor the nav at desktop widths. md/lg buckets unchanged.
// Pixel-arbitrary values used because the project's @theme spacing scale
// overrides Tailwind defaults (e.g., --spacing-8 = 64px, not 32px).
const containerSizes: Record<LogoSize, string> = {
  sm: 'w-[36px] h-[36px] lg:w-[44px] lg:h-[44px]',
  md: 'w-[36px] h-[36px]',
  lg: 'w-[48px] h-[48px]',
}
const iconSizes: Record<LogoSize, string> = {
  sm: 'w-[20px] h-[12px] lg:w-[25px] lg:h-[14px]',
  md: 'w-5 h-[11px]',
  lg: 'w-7 h-[16px]',
}
const textSizes: Record<LogoSize, string> = {
  sm: 'text-[22px] lg:text-[26px]',
  md: 'text-base',
  lg: 'text-xl',
}
const textWeights: Record<LogoSize, string> = {
  sm: 'font-medium',
  md: 'font-semibold',
  lg: 'font-semibold',
}
const gaps: Record<LogoSize, string> = {
  sm: 'gap-[6px]',
  md: 'gap-2.5',
  lg: 'gap-2.5',
}
const radii: Record<LogoSize, number> = { sm: 5, md: 5, lg: 7 }

export function Logo({
  size = 'md',
  showWordmark = true,
  wordmarkColor = '#303030',
  href = '/',
}: LogoProps) {
  return (
    <a href={href} className={`flex items-center ${gaps[size]} no-underline`} style={{ textDecoration: 'none' }}>
      <div
        className={`${containerSizes[size]} flex items-center justify-center flex-shrink-0 bg-brand`}
        style={{ borderRadius: radii[size] }}
      >
        <MMark className={iconSizes[size]} color="white" />
      </div>
      {showWordmark && (
        <span
          className={`${textSizes[size]} ${textWeights[size]} tracking-[-0.03em] leading-none`}
          style={{ color: wordmarkColor, fontFamily: 'var(--font-brand)' }}
        >
          Metaborong
        </span>
      )}
    </a>
  )
}
