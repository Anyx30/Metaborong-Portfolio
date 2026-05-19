import type { ReactNode } from 'react'
import { Eyebrow } from '@/components/ui/eyebrow'

const companyLinks = [
  { label: 'Work', href: '/#work' },
  { label: 'About', href: '/#founders' },
  { label: 'Blog', href: '/blog' },
  { label: 'FAQ', href: '/#faq' },
  { label: 'Contact', href: '/#contact' },
]

const serviceLinks = [
  { label: 'Web3 / Blockchain', href: '/#services' },
  { label: 'AI Agents', href: '/#services' },
  { label: 'Product Studio', href: '/#services' },
]

const offices = [
  { country: 'India', address: '117, Rajyadharpur Govt Colony, Mallickpara, Serampore, West Bengal' },
  { country: 'United Arab Emirates', address: 'Sharjah Media City, Sharjah, UAE, Al Batayih, 000000' },
  { country: 'USA', address: '16192 Coastal Hwy, Lewes, DE 19958' },
]

// LinkedIn + X are real verified profiles (rel="me"). Behance/Medium/Discord
// are a deliberate TEMPORARY homepage redirect — real URLs pending; NO rel="me"
// on temp links (would assert a false identity). See spec Deviation 5.
const socials: { label: string; href: string; me: boolean; icon: ReactNode }[] = [
  { label: 'LinkedIn', href: 'https://linkedin.com/company/metaborong-technologies', me: true,
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg> },
  { label: 'X', href: 'https://x.com/Metaborong', me: true,
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
  { label: 'Behance', href: '/', me: false,
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22 7h-7V5h7v2zM8.5 12.5c1.1 0 2-.4 2-1.7 0-1.4-1-1.8-2.2-1.8H4v3.5h4.5zM4 17h4.6c1.3 0 2.4-.5 2.4-2 0-1.6-1.2-2-2.6-2H4v4zm-2 2V7h6.7c2.7 0 4.3 1 4.3 3.3 0 1.4-.7 2.3-1.9 2.8 1.6.4 2.4 1.5 2.4 3.1C13.5 18 11.7 19 9 19H2zm14.7-3.6c.1 1.4 1 2.1 2.3 2.1 1 0 1.7-.4 2-1h2.6c-.6 2.1-2.4 3.1-4.7 3.1-3.1 0-5-2-5-5.1 0-3 2-5.2 5-5.2 3.3 0 4.9 2.5 4.7 5.7l-6.9.4zm4.2-1.7c-.1-1.2-.8-1.9-2-1.9s-2 .7-2.1 1.9h4.1z"/></svg> },
  { label: 'Medium', href: '/', me: false,
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 12a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0zm7.1 0c0 3.4-1.5 6.1-3.2 6.1-1.8 0-3.2-2.7-3.2-6.1s1.4-6.1 3.2-6.1c1.7 0 3.2 2.7 3.2 6.1zM24 12c0 3-.5 5.5-1.2 5.5-.6 0-1.1-2.5-1.1-5.5s.5-5.5 1.1-5.5c.7 0 1.2 2.5 1.2 5.5z"/></svg> },
  { label: 'Discord', href: '/', me: false,
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4.4A19 19 0 0 0 15.3 3l-.3.5a14 14 0 0 0-6 0L8.7 3A19 19 0 0 0 4 4.4 19.7 19.7 0 0 0 .5 17.8a19 19 0 0 0 5.8 2.9l.8-1.3c-.6-.2-1.2-.5-1.7-.8l.4-.3a13.6 13.6 0 0 0 11.6 0l.4.3c-.5.3-1.1.6-1.7.8l.8 1.3a19 19 0 0 0 5.8-2.9A19.7 19.7 0 0 0 20 4.4zM8.7 14.7c-1.1 0-2-1-2-2.3s.9-2.3 2-2.3 2 1 2 2.3-.9 2.3-2 2.3zm6.6 0c-1.1 0-2-1-2-2.3s.9-2.3 2-2.3 2 1 2 2.3-.9 2.3-2 2.3z"/></svg> },
]

// Repeated 4x (3 nav columns + the contact email). Constant, not abstraction —
// one string to keep the columns in lockstep.
const linkCls =
  'inline-flex min-h-[44px] items-center text-[15px] tracking-[-0.01em] text-gray no-underline transition-[color] duration-[var(--duration-instant)] hover:text-dark'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-border bg-bg px-[16px] py-[64px] sm:px-[24px] md:px-[48px] lg:px-[96px] xl:px-[128px]">
      <div className="mx-auto max-w-[1280px]">
        {/* Row 1 — positioning + giant wordmark */}
        <div className="mb-[48px]">
          <p className="max-w-[560px] text-[16px] leading-[1.5] tracking-[-0.01em] text-gray">
            Metaborong builds and ships Web3 protocols, AI agents, and SaaS products — a small, senior, founder-led team.
          </p>
          <p
            aria-hidden="true"
            className="mt-[24px] select-none whitespace-nowrap text-[clamp(40px,15vw,200px)] font-black uppercase leading-none tracking-[-0.04em] text-gray-light/40"
          >
            Metaborong
          </p>
        </div>

        {/* Row 2 — sitemap grid */}
        <div className="grid grid-cols-1 gap-[1px] border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
          <nav aria-label="Company" className="bg-bg p-[24px]">
            <Eyebrow as="p" className="mb-[16px] font-mono text-[12px]! text-dark!">Company</Eyebrow>
            <ul className="space-y-[12px]">
              {companyLinks.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className={linkCls}>{label}</a>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Services" className="bg-bg p-[24px]">
            <Eyebrow as="p" className="mb-[16px] font-mono text-[12px]! text-dark!">Services</Eyebrow>
            <ul className="space-y-[12px]">
              {serviceLinks.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className={linkCls}>{label}</a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="bg-bg p-[24px]">
            <Eyebrow as="p" className="mb-[16px] font-mono text-[12px]! text-dark!">Offices</Eyebrow>
            <div className="space-y-[16px]">
              {offices.map(({ country, address }) => (
                <address key={country} className="not-italic">
                  <span className="block text-[14px] font-bold uppercase tracking-[-0.01em] text-dark">{country}</span>
                  <span className="mt-[4px] block text-[14px] leading-[1.5] tracking-[-0.01em] text-gray">{address}</span>
                </address>
              ))}
            </div>
          </div>
          <nav aria-label="Contact and social" className="bg-bg p-[24px]">
            <Eyebrow as="p" className="mb-[16px] font-mono text-[12px]! text-dark!">Get in touch</Eyebrow>
            <a href="mailto:contact@metaborong.com" className={linkCls}>contact@metaborong.com</a>
            <div className="mt-[16px] flex flex-wrap gap-[12px]">
              {socials.map(({ label, href, me, icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel={me ? 'me noopener noreferrer' : 'noopener noreferrer'}
                  className="inline-flex h-[44px] w-[44px] items-center justify-center text-gray transition-[color] duration-[var(--duration-instant)] hover:text-dark"
                >
                  {icon}
                </a>
              ))}
            </div>
          </nav>
        </div>

        {/* Row 3 — bottom bar */}
        <div className="mt-[32px] flex flex-col gap-[12px] text-[13px] tracking-[-0.01em] text-gray sm:flex-row sm:items-center sm:justify-between">
          <span>© {year} Metaborong Technologies</span>
          <div className="flex gap-[20px]">
            <a href="https://linkedin.com/company/metaborong-technologies" target="_blank" rel="me noopener noreferrer" className="no-underline text-gray transition-[color] duration-[var(--duration-instant)] hover:text-dark">LinkedIn</a>
            <a href="https://x.com/Metaborong" target="_blank" rel="me noopener noreferrer" className="no-underline text-gray transition-[color] duration-[var(--duration-instant)] hover:text-dark">X</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
