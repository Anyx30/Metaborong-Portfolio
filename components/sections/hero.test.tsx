// @vitest-environment happy-dom

import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// next/image → plain <img> in happy-dom. Strip Next-only props (fill/priority/
// sizes) which are invalid on a bare <img>; pass everything else through —
// including the component's own data-testid — so we assert the REAL element,
// not a mock-injected attribute.
vi.mock('next/image', () => ({
  default: ({ src, alt, fill, priority, sizes, ...rest }: Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img src={src as string} alt={alt as string} {...(rest as Record<string, unknown>)} />
  ),
}))

import { HeroSection } from './hero'

describe('HeroSection — full-bleed structure', () => {
  it('renders the SSR copy verbatim (A3-locked)', () => {
    render(<HeroSection />)
    // Eyebrow + blockquote are static text → verbatim A3 copy is pinned here.
    // H1 uses the timer-based Typewriter (full text not present synchronously
    // in happy-dom), so assert its presence, not its progressive text.
    expect(screen.getByText('Web3 & AI development studio')).toBeInTheDocument()
    expect(screen.getByText(/A remote-first team of senior engineers/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('uses an optimized image background, not the ASCII video', () => {
    const { container } = render(<HeroSection />)
    expect(container.querySelector('video, [src*="hero-ascii"]')).toBeNull()
    const bg = screen.getByTestId('hero-bg') as HTMLImageElement
    expect(bg.getAttribute('src')).toContain('/hero-bg.jpg')
    expect(bg.getAttribute('alt')).toBe('')
  })

  it('keeps exactly three decorative glass cards', () => {
    const { container } = render(<HeroSection />)
    const cards = container.querySelectorAll('[data-hero-card]')
    expect(cards).toHaveLength(3)
    cards.forEach((c) => expect(c).toHaveAttribute('aria-hidden', 'true'))
  })
})
