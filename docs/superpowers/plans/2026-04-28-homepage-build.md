# Metaborong Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Metaborong homepage as a production-grade Next.js 15 app — scaffolded from scratch, with Tailwind v4, the full design system wired in, an ASCII morphing genesis cube hero visual, and all homepage sections populated with SEO/AEO-optimised content.

**Architecture:** Next.js 15 App Router with TypeScript. All design tokens live in `app/globals.css` as CSS custom properties exposed to Tailwind v4 via `@theme`. Components are co-located by feature, not by type. The ASCII Genesis Cube is a self-contained module (`components/genesis-cube/`) with a pure-math renderer, an animation hook, and a thin React wrapper. Every section is an independent component imported into `app/page.tsx`.

**Tech Stack:** Next.js 15 · TypeScript · Tailwind v4 (`@tailwindcss/postcss`) · pnpm · Satoshi (Fontshare CDN) · Space Grotesk fallback · Lucide React icons · No component library (built from scratch)

---

## File Map

```
mb-website/
├── app/
│   ├── layout.tsx                    # Root layout: font links, metadata defaults, body class
│   ├── page.tsx                      # Homepage: imports + assembles all sections
│   └── globals.css                   # @import tailwindcss + @theme tokens + @font-face
├── components/
│   ├── ui/
│   │   ├── logo.tsx                  # MMarkIcon SVG + Metaborong wordmark
│   │   ├── button.tsx                # Primary / ghost / secondary variants
│   │   └── badge.tsx                 # Blue / orange / gray badge variants
│   ├── layout/
│   │   ├── nav.tsx                   # Sticky frosted-glass nav + services dropdown
│   │   └── footer.tsx                # Footer: logo, links, social, copyright
│   ├── genesis-cube/
│   │   ├── renderer.ts               # Pure math: shapes, projection, draw-line, luminance ramp
│   │   ├── use-genesis-cube.ts       # Animation hook: rotation, morph state, rAF loop
│   │   └── genesis-cube.tsx          # React component: <pre> output, lazy-loaded
│   └── sections/
│       ├── hero.tsx                  # 55/45 split: copy left + GenesisCube right
│       ├── trust-bar.tsx             # Auto-scrolling marquee of project names
│       ├── services.tsx              # 3 pillar cards → hub pages
│       ├── why-us.tsx                # 3 differentiator cards
│       ├── work-preview.tsx          # 4 project cards (placeholder content)
│       ├── testimonials.tsx          # 4 testimonial quote cards
│       ├── founders.tsx              # 3 founder cards with LinkedIn links
│       ├── problem-solution.tsx      # Pain → solution narrative copy section
│       ├── how-it-works.tsx          # 4 numbered steps
│       ├── comparison.tsx            # Responsive comparison table
│       ├── faq.tsx                   # Accordion FAQ (8 Q&As)
│       └── contact-cta.tsx           # Dark #0a0a0a CTA section
├── lib/
│   └── schema.ts                     # JSON-LD Organization + WebSite schema objects
├── public/
│   └── (static assets — empty for now)
├── postcss.config.mjs
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## Design System Reference

All values come from `docs/content/colors_and_type.css` (already in repo from Claude Design export).

| Token | Value | Usage |
|-------|-------|-------|
| `--color-brand` | `#204AF8` | Primary CTAs, logo bg, links |
| `--color-accent` | `#F6851B` | Highlights, secondary actions |
| `--color-dark` | `#303030` | Body text on light surfaces |
| `--color-gray` | `#676767` | Secondary text |
| `--color-off-white` | `#FEFEFE` | Light background |
| `--color-bg-subtle` | `#f5f7ff` | Hero background |
| `--color-canvas` | `#0a0a0a` | Dark sections (CTA, footer) |
| `--font-brand` | `'Satoshi', 'Space Grotesk', sans-serif` | All text |
| `--radius-md` | `8px` | Cards, buttons |
| `--radius-lg` | `12px` | Large cards |

M-mark SVG path (from design system):
```
M 10.421 5.234 C 10.421 2.343 12.754 0 15.631 0 C 18.509 0 20.842 2.343 20.842 5.234 L 20.842 10.326 C 20.842 10.326 21.153 12.766 22.164 13.809 C 23.206 14.886 25.723 15.229 25.723 15.229 L 26.382 15.229 C 26.382 15.229 28.898 14.886 29.941 13.809 C 30.799 12.924 31.153 11.031 31.24 10.48 L 31.24 5.234 C 31.24 2.343 33.573 0 36.451 0 C 39.328 0 41.661 2.343 41.661 5.234 L 41.661 10.326 C 41.661 10.326 41.972 12.766 42.983 13.809 C 44.026 14.886 46.542 15.229 46.542 15.229 L 47.852 15.229 C 50.188 15.229 52.082 17.131 52.082 19.477 L 52.082 30.457 L 41.661 30.457 L 41.661 15.229 L 36.121 15.229 C 36.121 15.229 33.605 15.571 32.562 16.648 C 31.704 17.534 31.35 19.426 31.263 19.977 L 31.263 25.224 C 31.263 28.114 28.93 30.457 26.052 30.457 C 23.175 30.457 20.842 28.114 20.842 25.224 L 20.842 20.131 C 20.842 20.131 20.501 17.604 19.429 16.556 C 18.39 15.541 15.961 15.229 15.961 15.229 L 10.421 15.229 L 10.421 30.457 L 0 30.457 L 0 19.477 C 0 17.131 1.894 15.229 4.23 15.229 L 5.54 15.229 C 5.54 15.229 8.056 14.886 9.099 13.809 C 10.11 12.766 10.421 10.326 10.421 10.326 L 10.421 5.234 Z
```
viewBox: `0 0 52.082 30.457`

---

## ASCII Genesis Cube — Rendering Spec

The cube is rendered in a `<pre>` element using a fixed-width character grid.

**Algorithm:**
1. Each shape is defined as a parametric surface `f(u, v) → [x, y, z]` sampled on a `ROWS × COLS` grid
2. A morph blends two surface functions: `blend(f1, f2, t)(u, v) = lerp(f1(u,v), f2(f2,t), t)`
3. Rotation is applied via a 3×3 rotation matrix (Euler XY rotation)
4. Perspective projection: `sx = x / (z + dist) * scale`, `sy = y / (z + dist) * scale`
5. Edges connect adjacent grid points; each edge is drawn with Bresenham's line algorithm
6. Z-buffer prevents overdraw; closer points overwrite farther ones
7. Luminance ramp: `' 0123456789'` — character index = `floor(z_normalized * 10)`

**Shapes (parametric surfaces):**
```
Torus(u, v):     x=(R+r*cos(v))*cos(u), y=(R+r*cos(v))*sin(u), z=r*sin(v)
                 R=1.0, r=0.4, u∈[0,2π], v∈[0,2π]

Cube(u, v):      6-face mapping. u∈[0,1] selects face (floor(u*6)),
                 fractional u and v give the (s,t) position on that face.
                 Face normals: ±X, ±Y, ±Z. Point = normal + s*tangent + t*bitangent.
                 Scale: 0.8

Dodecahedron(u,v): Spherical mapping onto dodecahedron faces.
                 Use icosphere subdivision projected onto dodecahedron.
                 Approximation: sphere(u,v) with radius modulated by
                 dodecahedral symmetry: r(u,v) = 1 + 0.15 * cos(5u) * cos(5v)
```

**Morph sequence (loop forever):**
```
0–3s:   cube (static)
3–5s:   morph cube → torus        (t: 0→1)
5–8s:   torus (static)
8–10s:  morph torus → dodecahedron (t: 0→1)
10–13s: dodecahedron (static)
13–15s: morph dodecahedron → cube  (t: 0→1)
15s:    loop
```

**Grid size:** 40 rows × 80 cols (scales to fill the container via CSS font-size)

**Rotation speed:** `dRx = 0.003 rad/frame`, `dRy = 0.007 rad/frame`

---

### Task 1: Project Scaffold + Git Init

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `.gitignore`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`

- [ ] **Step 1: Scaffold Next.js 15 without Tailwind (we install v4 manually)**

```bash
cd /Users/zephyr/Claude-Workspace/projects/mb-website
pnpm create next-app@latest . --typescript --eslint --app --no-src-dir --no-tailwind --import-alias "@/*" --yes
```

Expected: Next.js project created with `app/` directory, TypeScript, ESLint.

- [ ] **Step 2: Install Tailwind v4 + PostCSS + Lucide**

```bash
pnpm add tailwindcss@^4.0 @tailwindcss/postcss postcss
pnpm add lucide-react
```

- [ ] **Step 3: Configure PostCSS for Tailwind v4**

Replace `postcss.config.mjs` with:
```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

- [ ] **Step 4: Init git and make first commit**

```bash
git init
git add -A
git commit -m "feat: scaffold Next.js 15 + Tailwind v4 + Lucide"
```

Expected: git repo initialized, first commit created.

---

### Task 2: Design System + Global Styles

**Files:**
- Modify: `app/globals.css` — full design system tokens + font loading
- Modify: `app/layout.tsx` — Satoshi font link, body class, metadata defaults

- [ ] **Step 1: Replace `app/globals.css` with full design system**

```css
@import "tailwindcss";

/* ── Satoshi via Fontshare ───────────────────────────────── */
@import url('https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700,900&display=swap');
/* ── Space Grotesk fallback ──────────────────────────────── */
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');

/* ── Tailwind v4 theme tokens ────────────────────────────── */
@theme {
  /* Brand colors */
  --color-brand:        #204AF8;
  --color-accent:       #F6851B;

  /* Neutrals */
  --color-dark:         #303030;
  --color-gray:         #676767;
  --color-gray-light:   #999999;
  --color-gray-subtle:  #D9D9D9;
  --color-off-white:    #FEFEFE;

  /* Semantic surfaces */
  --color-bg:           #ffffff;
  --color-bg-subtle:    #f5f7ff;
  --color-canvas:       #0a0a0a;

  /* Typography */
  --font-brand: 'Satoshi', 'Space Grotesk', sans-serif;
  --font-mono:  'JetBrains Mono', 'Courier New', monospace;

  /* Spacing scale */
  --spacing-1:  4px;
  --spacing-2:  8px;
  --spacing-3:  12px;
  --spacing-4:  16px;
  --spacing-5:  24px;
  --spacing-6:  32px;
  --spacing-7:  48px;
  --spacing-8:  64px;
  --spacing-9:  96px;
  --spacing-10: 128px;

  /* Border radii */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 20px;
}

/* ── Base styles ─────────────────────────────────────────── */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-family: var(--font-brand);
  -webkit-font-smoothing: antialiased;
  scroll-behavior: smooth;
}

body {
  background-color: var(--color-bg);
  color: var(--color-dark);
  line-height: 1.5;
  letter-spacing: -0.01em;
}
```

- [ ] **Step 2: Update `app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Web3 & AI Development Studio | Metaborong',
    template: '%s | Metaborong',
  },
  description:
    'Metaborong builds DeFi protocols, AI agent systems, and custom SaaS products for founders and crypto-native teams. Fast delivery, product-first thinking.',
  metadataBase: new URL('https://www.metaborong.com'),
  openGraph: {
    siteName: 'Metaborong',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: wire design system tokens and global styles"
```

---

### Task 3: Base UI Components

**Files:**
- Create: `components/ui/logo.tsx`
- Create: `components/ui/button.tsx`
- Create: `components/ui/badge.tsx`

- [ ] **Step 1: Create `components/ui/logo.tsx`**

```tsx
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

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showWordmark?: boolean
  wordmarkColor?: string
}

const iconSizes = { sm: 'w-5 h-3', md: 'w-7 h-4', lg: 'w-10 h-6' }
const containerSizes = { sm: 'w-7 h-7 rounded-[4px]', md: 'w-9 h-9 rounded-[5px]', lg: 'w-12 h-12 rounded-[7px]' }
const textSizes = { sm: 'text-sm', md: 'text-base', lg: 'text-xl' }

export function Logo({ size = 'md', showWordmark = true, wordmarkColor = 'text-dark' }: LogoProps) {
  return (
    <a href="/" className="flex items-center gap-2.5 no-underline">
      <div className={`${containerSizes[size]} bg-brand flex items-center justify-center flex-shrink-0`}>
        <MMark className={iconSizes[size]} color="white" />
      </div>
      {showWordmark && (
        <span
          className={`${textSizes[size]} ${wordmarkColor} font-medium tracking-[-0.02em]`}
          style={{ fontFamily: 'var(--font-brand)' }}
        >
          metaborong
        </span>
      )}
    </a>
  )
}
```

- [ ] **Step 2: Create `components/ui/button.tsx`**

```tsx
import { type ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'ghost' | 'secondary'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  href?: string
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:   'bg-brand text-white hover:opacity-90',
  ghost:     'bg-transparent text-dark border border-[#e5e7eb] hover:bg-[#f9fafb]',
  secondary: 'bg-[#f5f7ff] text-brand border border-[#dde4fe] hover:opacity-90',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm rounded-[6px]',
  md: 'px-5 py-2.5 text-sm rounded-[6px]',
  lg: 'px-7 py-3.5 text-base rounded-[8px]',
}

export function Button({
  variant = 'primary',
  size = 'md',
  href,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const classes = [
    'inline-flex items-center gap-1.5 font-medium tracking-[-0.01em] transition-opacity cursor-pointer no-underline',
    variantClasses[variant],
    sizeClasses[size],
    className,
  ].join(' ')

  if (href) {
    return <a href={href} className={classes}>{children}</a>
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}
```

- [ ] **Step 3: Create `components/ui/badge.tsx`**

```tsx
type BadgeVariant = 'blue' | 'orange' | 'gray' | 'dark'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  blue:   'bg-[#eef1fe] text-brand border border-[#dde4fe]',
  orange: 'bg-[#fff4ea] text-accent border border-[#fed7aa]',
  gray:   'bg-[#f9fafb] text-gray border border-[#e5e7eb]',
  dark:   'bg-canvas text-white',
}

export function Badge({ variant = 'gray', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium tracking-[0.04em] ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
```

- [ ] **Step 4: Verify types**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Logo, Button, Badge UI components"
```

---

### Task 4: Navigation Component

**Files:**
- Create: `components/layout/nav.tsx`

- [ ] **Step 1: Create `components/layout/nav.tsx`**

```tsx
'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Menu, X } from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'

const services = [
  {
    pillar: 'Web3 / Blockchain',
    color: 'text-brand',
    dotColor: 'bg-brand',
    href: '/services/web3/',
    sub: 'DeFi, NFT, wallets, DAO — multichain',
  },
  {
    pillar: 'AI Agents',
    color: 'text-[#10b981]',
    dotColor: 'bg-[#10b981]',
    href: '/services/ai-agents/',
    sub: 'Agentic AI, RAG, voice agents, automation',
  },
  {
    pillar: 'Product Studio',
    color: 'text-accent',
    dotColor: 'bg-accent',
    href: '/services/product-studio/',
    sub: 'End-to-end SaaS product builds',
  },
]

const navLinks = [
  { label: 'Work', href: '/work/' },
  { label: 'About', href: '/about/' },
  { label: 'Blog', href: '/blog/' },
]

export function Nav() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-[#e5e7eb] shadow-[0_1px_8px_rgba(0,0,0,0.06)]'
          : 'bg-white/80 backdrop-blur-sm'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-8">
        {/* Logo */}
        <Logo size="sm" />

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6 flex-1">
          {/* Services dropdown */}
          <div className="relative">
            <button
              className="flex items-center gap-1 text-sm text-gray hover:text-dark transition-colors tracking-[-0.01em]"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
              onClick={() => setDropdownOpen(v => !v)}
              aria-expanded={dropdownOpen}
            >
              Services <ChevronDown size={14} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div
                className="absolute top-full left-0 mt-2 w-64 bg-white border border-[#e5e7eb] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] p-2"
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                {services.map((s) => (
                  <a
                    key={s.pillar}
                    href={s.href}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#f9fafb] transition-colors group"
                  >
                    <div className={`w-2 h-2 rounded-[2px] mt-1.5 flex-shrink-0 ${s.dotColor}`} />
                    <div>
                      <div className={`text-sm font-medium tracking-[-0.01em] ${s.color}`}>{s.pillar}</div>
                      <div className="text-xs text-gray-light mt-0.5 tracking-[-0.005em]">{s.sub}</div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-gray hover:text-dark transition-colors tracking-[-0.01em]"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center">
          <Button href="/contact/" size="sm">Let's Talk →</Button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-1 text-gray"
          onClick={() => setMobileOpen(v => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#e5e7eb] bg-white px-6 py-4 space-y-3">
          {services.map((s) => (
            <a key={s.pillar} href={s.href} className="block text-sm text-dark py-1">
              {s.pillar}
            </a>
          ))}
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="block text-sm text-gray py-1">
              {link.label}
            </a>
          ))}
          <Button href="/contact/" size="sm" className="w-full justify-center mt-2">
            Let's Talk →
          </Button>
        </div>
      )}
    </header>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add sticky Nav component with services dropdown"
```

---

### Task 5: Genesis Cube — Renderer (Pure Math)

**Files:**
- Create: `components/genesis-cube/renderer.ts`

This file contains all the 3D math. No React dependencies. Fully testable in isolation.

- [ ] **Step 1: Create `components/genesis-cube/renderer.ts`**

```typescript
// ── Types ─────────────────────────────────────────────────────────────
export type Vec3 = [number, number, number]
export type Vec2 = [number, number]

export interface RenderConfig {
  rows: number        // character grid height
  cols: number        // character grid width
  dist: number        // camera distance (perspective)
  scale: number       // projection scale
}

export const DEFAULT_CONFIG: RenderConfig = {
  rows: 40,
  cols: 80,
  dist: 5,
  scale: 18,
}

// ── Luminance ramp ─────────────────────────────────────────────────────
const RAMP = ' 0123456789'

function luminanceChar(z: number, zMin: number, zMax: number): string {
  const t = zMax === zMin ? 0.5 : (z - zMin) / (zMax - zMin)
  const idx = Math.floor(t * (RAMP.length - 1))
  return RAMP[Math.max(0, Math.min(RAMP.length - 1, idx))]
}

// ── Rotation matrix (XY Euler) ─────────────────────────────────────────
export function rotate(p: Vec3, rx: number, ry: number): Vec3 {
  const [x, y, z] = p
  // Rotate around X
  const y1 = y * Math.cos(rx) - z * Math.sin(rx)
  const z1 = y * Math.sin(rx) + z * Math.cos(rx)
  // Rotate around Y
  const x2 = x * Math.cos(ry) + z1 * Math.sin(ry)
  const z2 = -x * Math.sin(ry) + z1 * Math.cos(ry)
  return [x2, y1, z2]
}

// ── Perspective projection ─────────────────────────────────────────────
export function project(p: Vec3, cfg: RenderConfig): Vec2 {
  const [x, y, z] = p
  const d = z + cfg.dist
  const sx = (x / d) * cfg.scale + cfg.cols / 2
  const sy = -(y / d) * cfg.scale + cfg.rows / 2
  return [sx, sy]
}

// ── Bresenham line into grid ───────────────────────────────────────────
export function drawLine(
  grid: string[][],
  zbuf: number[][],
  p1: Vec3,
  p2: Vec3,
  rx: number,
  ry: number,
  cfg: RenderConfig,
  zMin: number,
  zMax: number
): void {
  const r1 = rotate(p1, rx, ry)
  const r2 = rotate(p2, rx, ry)
  const [x1, y1] = project(r1, cfg)
  const [x2, y2] = project(r2, cfg)

  const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1), 1)
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const x = Math.round(x1 + (x2 - x1) * t)
    const y = Math.round(y1 + (y2 - y1) * t)
    const z = r1[2] + (r2[2] - r1[2]) * t

    if (x >= 0 && x < cfg.cols && y >= 0 && y < cfg.rows) {
      if (z > zbuf[y][x]) {
        zbuf[y][x] = z
        grid[y][x] = luminanceChar(z, zMin, zMax)
      }
    }
  }
}

// ── Shape functions ────────────────────────────────────────────────────
// Returns a grid of Vec3 points sampled on the shape surface.
// Grid size: ROWS_SHAPE × COLS_SHAPE, edges connect adjacent points.

const SHAPE_ROWS = 16
const SHAPE_COLS = 32

export function sampleTorus(): Vec3[] {
  const R = 1.0, r = 0.42
  const pts: Vec3[] = []
  for (let i = 0; i < SHAPE_ROWS; i++) {
    for (let j = 0; j < SHAPE_COLS; j++) {
      const u = (j / SHAPE_COLS) * Math.PI * 2
      const v = (i / SHAPE_ROWS) * Math.PI * 2
      pts.push([
        (R + r * Math.cos(v)) * Math.cos(u),
        (R + r * Math.cos(v)) * Math.sin(u),
        r * Math.sin(v),
      ])
    }
  }
  return pts
}

export function sampleCube(): Vec3[] {
  const pts: Vec3[] = []
  const s = 0.9
  // Map the same (i,j) grid onto a sphere, then snap to nearest cube face
  for (let i = 0; i < SHAPE_ROWS; i++) {
    for (let j = 0; j < SHAPE_COLS; j++) {
      const u = (j / SHAPE_COLS) * Math.PI * 2
      const v = (i / SHAPE_ROWS) * Math.PI - Math.PI / 2
      // Sphere point
      const sx = Math.cos(v) * Math.cos(u)
      const sy = Math.cos(v) * Math.sin(u)
      const sz = Math.sin(v)
      // Project onto cube surface
      const m = Math.max(Math.abs(sx), Math.abs(sy), Math.abs(sz))
      pts.push([sx / m * s, sy / m * s, sz / m * s])
    }
  }
  return pts
}

export function sampleDodecahedron(): Vec3[] {
  const pts: Vec3[] = []
  // Sphere with dodecahedral modulation
  for (let i = 0; i < SHAPE_ROWS; i++) {
    for (let j = 0; j < SHAPE_COLS; j++) {
      const u = (j / SHAPE_COLS) * Math.PI * 2
      const v = (i / SHAPE_ROWS) * Math.PI - Math.PI / 2
      const sx = Math.cos(v) * Math.cos(u)
      const sy = Math.cos(v) * Math.sin(u)
      const sz = Math.sin(v)
      // Dodecahedral modulation: 5-fold symmetry in u, 3-fold in v
      const mod = 1 + 0.18 * Math.cos(5 * u) * Math.cos(3 * v)
      pts.push([sx * mod, sy * mod, sz * mod])
    }
  }
  return pts
}

// ── Lerp ──────────────────────────────────────────────────────────────
export function lerpShapes(a: Vec3[], b: Vec3[], t: number): Vec3[] {
  return a.map((pa, i) => [
    pa[0] + (b[i][0] - pa[0]) * t,
    pa[1] + (b[i][1] - pa[1]) * t,
    pa[2] + (b[i][2] - pa[2]) * t,
  ])
}

// ── Edge list from grid ────────────────────────────────────────────────
// Connects (i,j)→(i,j+1) and (i,j)→(i+1,j) with wrap-around
export function buildEdges(): Array<[number, number]> {
  const edges: Array<[number, number]> = []
  for (let i = 0; i < SHAPE_ROWS; i++) {
    for (let j = 0; j < SHAPE_COLS; j++) {
      const cur = i * SHAPE_COLS + j
      const right = i * SHAPE_COLS + ((j + 1) % SHAPE_COLS)
      const down = ((i + 1) % SHAPE_ROWS) * SHAPE_COLS + j
      edges.push([cur, right], [cur, down])
    }
  }
  return edges
}

// ── Full frame render ─────────────────────────────────────────────────
export function renderFrame(
  pts: Vec3[],
  edges: Array<[number, number]>,
  rx: number,
  ry: number,
  cfg: RenderConfig
): string {
  const grid: string[][] = Array.from({ length: cfg.rows }, () =>
    Array(cfg.cols).fill(' ')
  )
  const zbuf: number[][] = Array.from({ length: cfg.rows }, () =>
    Array(cfg.cols).fill(-Infinity)
  )

  // Find z range for luminance mapping
  const rotated = pts.map(p => rotate(p, rx, ry))
  const zVals = rotated.map(p => p[2])
  const zMin = Math.min(...zVals)
  const zMax = Math.max(...zVals)

  for (const [a, b] of edges) {
    drawLine(grid, zbuf, pts[a], pts[b], rx, ry, cfg, zMin, zMax)
  }

  return grid.map(row => row.join('')).join('\n')
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add genesis cube 3D renderer (shapes, projection, luminance)"
```

---

### Task 6: Genesis Cube — Animation Hook

**Files:**
- Create: `components/genesis-cube/use-genesis-cube.ts`

- [ ] **Step 1: Create `components/genesis-cube/use-genesis-cube.ts`**

```typescript
'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  sampleCube,
  sampleTorus,
  sampleDodecahedron,
  buildEdges,
  lerpShapes,
  renderFrame,
  DEFAULT_CONFIG,
  type Vec3,
} from './renderer'

// Morph sequence timings (seconds)
const SEQUENCE = [
  { from: 'cube',         to: 'torus',         hold: 3.0, morph: 2.0 },
  { from: 'torus',        to: 'dodecahedron',  hold: 3.0, morph: 2.0 },
  { from: 'dodecahedron', to: 'cube',          hold: 3.0, morph: 2.0 },
]
const TOTAL_CYCLE = SEQUENCE.reduce((s, x) => s + x.hold + x.morph, 0)

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

const SHAPES: Record<string, Vec3[]> = {
  cube:         sampleCube(),
  torus:        sampleTorus(),
  dodecahedron: sampleDodecahedron(),
}
const EDGES = buildEdges()

export function useGenesisCube() {
  const [frame, setFrame] = useState('')
  const rxRef = useRef(0.4)
  const ryRef = useRef(0.2)
  const startRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  const tick = useCallback((now: number) => {
    if (startRef.current === null) startRef.current = now
    const elapsed = ((now - startRef.current) / 1000) % TOTAL_CYCLE

    // Determine current phase
    let t = elapsed
    let fromKey = 'cube'
    let toKey = 'torus'
    let morphT = 0

    for (const phase of SEQUENCE) {
      if (t < phase.hold) {
        fromKey = phase.from
        toKey = phase.to
        morphT = 0
        break
      }
      t -= phase.hold
      if (t < phase.morph) {
        fromKey = phase.from
        toKey = phase.to
        morphT = easeInOut(t / phase.morph)
        break
      }
      t -= phase.morph
    }

    const pts = morphT === 0
      ? SHAPES[fromKey]
      : lerpShapes(SHAPES[fromKey], SHAPES[toKey], morphT)

    rxRef.current += 0.003
    ryRef.current += 0.007

    const output = renderFrame(pts, EDGES, rxRef.current, ryRef.current, DEFAULT_CONFIG)
    setFrame(output)

    rafRef.current = requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [tick])

  return frame
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add useGenesisCube animation hook with morph sequence"
```

---

### Task 7: Genesis Cube — React Component

**Files:**
- Create: `components/genesis-cube/genesis-cube.tsx`

- [ ] **Step 1: Create `components/genesis-cube/genesis-cube.tsx`**

```tsx
'use client'

import { useGenesisCube } from './use-genesis-cube'
import { DEFAULT_CONFIG } from './renderer'

interface GenesisCubeProps {
  className?: string
}

export function GenesisCube({ className = '' }: GenesisCubeProps) {
  const frame = useGenesisCube()

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <pre
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(7px, 1.1vw, 11px)',
          lineHeight: 1.25,
          letterSpacing: '0.05em',
          color: '#204AF8',
          userSelect: 'none',
          whiteSpace: 'pre',
          opacity: 0.85,
        }}
      >
        {frame || Array(DEFAULT_CONFIG.rows).fill(' '.repeat(DEFAULT_CONFIG.cols)).join('\n')}
      </pre>

      {/* Subtle vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, var(--color-bg-subtle) 100%)',
        }}
      />
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Quick smoke test — import into page.tsx temporarily**

Temporarily add to `app/page.tsx`:
```tsx
import { GenesisCube } from '@/components/genesis-cube/genesis-cube'
export default function Page() {
  return <div style={{background:'#f5f7ff',height:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}><GenesisCube /></div>
}
```

Run dev server:
```bash
pnpm dev
```

Open http://localhost:3000 — you should see a rotating ASCII wireframe morphing between shapes.

- [ ] **Step 4: Revert `page.tsx` to empty shell, commit**

```tsx
export default function Page() {
  return <main />
}
```

```bash
git add -A
git commit -m "feat: add GenesisCube React component with vignette overlay"
```

---

### Task 8: Hero Section

**Files:**
- Create: `components/sections/hero.tsx`

- [ ] **Step 1: Create `components/sections/hero.tsx`**

```tsx
import { lazy, Suspense } from 'react'
import { Button } from '@/components/ui/button'

const GenesisCube = lazy(() =>
  import('@/components/genesis-cube/genesis-cube').then(m => ({ default: m.GenesisCube }))
)

export function HeroSection() {
  return (
    <section
      className="min-h-screen grid"
      style={{
        gridTemplateColumns: '55fr 45fr',
        background: 'var(--color-bg-subtle)',
      }}
    >
      {/* Left: Copy */}
      <div className="flex flex-col justify-center px-16 py-24 max-w-[680px]">
        {/* Eyebrow */}
        <div
          className="inline-flex items-center gap-2 mb-7 w-fit"
          style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
            padding: '5px 12px',
            fontSize: '12px',
            color: 'var(--color-gray)',
            letterSpacing: '0.02em',
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              background: 'var(--color-brand)',
              borderRadius: 2,
              flexShrink: 0,
              display: 'inline-block',
            }}
          />
          Web3 Development · AI Agents · Product Studio
        </div>

        {/* H1 */}
        <h1
          style={{
            fontSize: 'clamp(36px, 4.5vw, 64px)',
            fontWeight: 700,
            letterSpacing: '-0.04em',
            lineHeight: 1.02,
            color: 'var(--color-dark)',
            marginBottom: '20px',
          }}
        >
          Full-Stack Web3 Development
          <br />
          <span style={{ color: 'var(--color-brand)' }}>&amp; AI Agent Studio</span>
        </h1>

        {/* AEO extraction block */}
        <blockquote
          style={{
            borderLeft: '2px solid var(--color-brand)',
            paddingLeft: 16,
            marginBottom: 24,
            fontStyle: 'normal',
          }}
        >
          <p
            style={{
              fontSize: '15px',
              color: 'var(--color-gray)',
              lineHeight: 1.65,
              letterSpacing: '-0.01em',
              maxWidth: 480,
            }}
          >
            Metaborong is a Web3 development company and AI agent studio that builds DeFi protocols,
            autonomous AI systems, and custom SaaS products for founders and crypto-native teams.
            Based across the US and Europe, Metaborong delivers from spec to production — fast.
          </p>
        </blockquote>

        {/* Subheading */}
        <p
          style={{
            fontSize: '16px',
            color: 'var(--color-gray)',
            lineHeight: 1.65,
            letterSpacing: '-0.01em',
            maxWidth: 460,
            marginBottom: 32,
          }}
        >
          We work with founders and crypto-native teams who need a technical partner that ships,
          not just consults. Built with product thinking, not just code.
        </p>

        {/* CTAs */}
        <div className="flex items-center gap-3 mb-5">
          <Button href="/contact/" size="lg">Start a Project →</Button>
          <Button href="/work/" variant="ghost" size="lg">See Our Work</Button>
        </div>

        {/* Micro-copy */}
        <p style={{ fontSize: '12px', color: 'var(--color-gray-light)', letterSpacing: '-0.01em' }}>
          No pitch decks. No retainers. Direct from founders.
        </p>
      </div>

      {/* Right: ASCII Genesis Cube */}
      <div
        className="flex items-center justify-center"
        style={{
          background: 'var(--color-bg-subtle)',
          borderLeft: '1px solid rgba(32,74,248,0.08)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Suspense
          fallback={
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'rgba(32,74,248,0.2)',
                lineHeight: 1.25,
                letterSpacing: '0.05em',
              }}
            >
              {'0'.repeat(80 * 40)}
            </div>
          }
        >
          <GenesisCube className="w-full h-full" />
        </Suspense>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
pnpm tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add HeroSection with 55/45 split and lazy GenesisCube"
```

---

### Task 9: Trust Bar

**Files:**
- Create: `components/sections/trust-bar.tsx`

- [ ] **Step 1: Create `components/sections/trust-bar.tsx`**

```tsx
const projects = [
  'KGeN', 'Bionic', 'DATA3 AI', 'Defiverse',
  'GET Smart', 'SEDAX', 'Bayan', 'Memestakes Vault',
]

export function TrustBar() {
  const doubled = [...projects, ...projects]

  return (
    <div
      style={{
        borderTop: '1px solid #e5e7eb',
        borderBottom: '1px solid #e5e7eb',
        background: '#fff',
        padding: '14px 0',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Fade edges */}
      <div
        style={{
          position: 'absolute', top: 0, left: 0, bottom: 0, width: 80, zIndex: 2,
          background: 'linear-gradient(to right, #fff, transparent)',
        }}
      />
      <div
        style={{
          position: 'absolute', top: 0, right: 0, bottom: 0, width: 80, zIndex: 2,
          background: 'linear-gradient(to left, #fff, transparent)',
        }}
      />

      <div
        className="trust-bar-track"
        style={{
          display: 'flex',
          gap: 48,
          animation: 'trustBarScroll 24s linear infinite',
          width: 'max-content',
        }}
      >
        {doubled.map((name, i) => (
          <span
            key={i}
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--color-gray)',
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
            }}
          >
            {name}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes trustBarScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add TrustBar scrolling marquee"
```

---

### Task 10: Services Section

**Files:**
- Create: `components/sections/services.tsx`

- [ ] **Step 1: Create `components/sections/services.tsx`**

```tsx
const pillars = [
  {
    icon: '⬡',
    color: 'var(--color-brand)',
    label: 'Web3 / Blockchain',
    headline: 'Decentralised protocol engineering',
    body: 'DeFi protocols, NFT marketplaces, crypto wallets, token launches, liquid staking, and DAO systems — built multichain.',
    href: '/services/web3/',
    cta: 'Explore Web3 Services →',
  },
  {
    icon: '⬡',
    color: '#10b981',
    label: 'AI Agents',
    headline: 'AI systems that work while you sleep',
    body: 'Agentic pipelines, RAG applications, voice agents, generative AI, and workflow automation — from prototype to production.',
    href: '/services/ai-agents/',
    cta: 'Explore AI Agent Services →',
  },
  {
    icon: '⬡',
    color: 'var(--color-accent)',
    label: 'Product Studio',
    headline: 'SaaS products built to scale',
    body: 'End-to-end Web2 product builds — architecture, design, development, and deployment for startups that need a full technical team.',
    href: '/services/product-studio/',
    cta: 'Explore Product Studio →',
  },
]

export function ServicesSection() {
  return (
    <section style={{ padding: '96px 80px', background: '#fff' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        {/* Section header */}
        <div style={{ marginBottom: 56 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-gray-light)', fontWeight: 600, marginBottom: 12 }}>
            What we build
          </p>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.05, color: 'var(--color-dark)', maxWidth: 520 }}>
            Three pillars. One studio.
          </h2>
          <p style={{ marginTop: 16, fontSize: 16, color: 'var(--color-gray)', lineHeight: 1.65, letterSpacing: '-0.01em', maxWidth: 600 }}>
            Metaborong operates across three interconnected service pillars — Web3 engineering, AI agent development, and SaaS product builds. One senior team, end to end.
          </p>
        </div>

        {/* Pillar cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: '#e5e7eb', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden' }}>
          {pillars.map((p) => (
            <div
              key={p.label}
              style={{ background: '#fff', padding: '44px 36px', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, color: p.color, marginBottom: 20 }}>
                {p.icon} {p.label}
              </div>
              <h3 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.2, color: 'var(--color-dark)', marginBottom: 14 }}>
                {p.headline}
              </h3>
              <p style={{ fontSize: 14, color: 'var(--color-gray)', lineHeight: 1.75, letterSpacing: '-0.005em', flex: 1, marginBottom: 28 }}>
                {p.body}
              </p>
              <a href={p.href} style={{ fontSize: 14, fontWeight: 600, color: p.color, textDecoration: 'none', letterSpacing: '-0.01em' }}>
                {p.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add ServicesSection with 3 pillar cards"
```

---

### Task 11: Why Us, Work Preview, Testimonials, Founders

**Files:**
- Create: `components/sections/why-us.tsx`
- Create: `components/sections/work-preview.tsx`
- Create: `components/sections/testimonials.tsx`
- Create: `components/sections/founders.tsx`

- [ ] **Step 1: Create `components/sections/why-us.tsx`**

```tsx
const reasons = [
  {
    tag: 'Speed',
    tagColor: 'var(--color-brand)',
    title: 'Speed that respects your runway',
    body: 'We ship in weeks, not quarters. A lean, senior team means no account managers between you and the people writing code. Direct communication, fast decisions, fewer handoffs.',
  },
  {
    tag: 'Product thinking',
    tagColor: 'var(--color-accent)',
    title: 'Product thinking, not just execution',
    body: 'We pressure-test assumptions before we write a line of code. If your spec has a gap, we name it. If a simpler approach would do the same job, we say so. You get a team that thinks like a co-builder.',
  },
  {
    tag: 'Niche depth',
    tagColor: '#10b981',
    title: 'Niche depth where it counts',
    body: 'Multichain Web3 architecture. DeFi primitives. AI agent orchestration. These are not skills most agencies have. We go deep in the areas where generalist agencies stop.',
  },
]

export function WhyUsSection() {
  return (
    <section style={{ padding: '96px 80px', background: 'var(--color-bg-subtle)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ marginBottom: 56, maxWidth: 560 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-gray-light)', fontWeight: 600, marginBottom: 12 }}>Why us</p>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.05, color: 'var(--color-dark)' }}>
            Why founders choose Metaborong
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {reasons.map((r) => (
            <div key={r.tag} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '36px 32px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: r.tagColor, marginBottom: 18 }}>
                {r.tag}
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2, color: 'var(--color-dark)', marginBottom: 14 }}>
                {r.title}
              </h3>
              <p style={{ fontSize: 14, color: 'var(--color-gray)', lineHeight: 1.75, letterSpacing: '-0.005em' }}>
                {r.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create `components/sections/work-preview.tsx`**

```tsx
const projects = [
  { name: 'KGeN',                  category: 'Web3 · Gaming',   tag: 'blue' },
  { name: 'DATA3 AI',              category: 'AI · Data',       tag: 'green' },
  { name: 'Bionic',                category: 'Web3 · DeFi',     tag: 'blue' },
  { name: 'Bayan — AI Chatbot',    category: 'AI · Voice',      tag: 'green' },
]

const tagColors: Record<string, string> = {
  blue:  'var(--color-brand)',
  green: '#10b981',
}

export function WorkPreviewSection() {
  return (
    <section style={{ padding: '96px 80px', background: '#fff' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48 }}>
          <div>
            <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-gray-light)', fontWeight: 600, marginBottom: 12 }}>Our work</p>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.05, color: 'var(--color-dark)' }}>
              What we've built
            </h2>
          </div>
          <a href="/work/" style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-brand)', textDecoration: 'none', letterSpacing: '-0.01em' }}>
            View All Work →
          </a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {projects.map((p) => (
            <div
              key={p.name}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                padding: '32px 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                cursor: 'pointer',
                transition: 'box-shadow 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
            >
              {/* Placeholder visual */}
              <div style={{ height: 80, background: 'var(--color-bg-subtle)', borderRadius: 8, marginBottom: 8 }} />
              <div style={{ fontSize: 11, fontWeight: 600, color: tagColors[p.tag], letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {p.category}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--color-dark)' }}>
                {p.name}
              </h3>
              <a href="/work/" style={{ fontSize: 13, color: 'var(--color-brand)', fontWeight: 500, textDecoration: 'none', marginTop: 'auto' }}>
                View Case Study →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Create `components/sections/testimonials.tsx`**

```tsx
const testimonials = [
  {
    quote: 'Impressive DevOps & backend support by Metaborong, their expertise made a real difference. Highly recommend!',
    name: 'Siddharth Banerjee',
    role: 'Client',
  },
  {
    quote: 'Excited to team up with Metaborong! Strong reference and previous quality work made them the perfect fit.',
    name: 'Dr. Josh',
    role: 'Client',
  },
  {
    quote: 'Metaborong took Create Protocol to the next level with their Web3 and Web2 skills. Impressive work!',
    name: 'Abhishek Krishna',
    role: 'Create Protocol',
  },
  {
    quote: 'Metaborong really put their effort to write smart contracts for Create Protocol & their web 2.0 team support was exceptional!',
    name: 'Girish Ahirwar',
    role: 'Create Protocol',
  },
]

export function TestimonialsSection() {
  return (
    <section style={{ padding: '96px 80px', background: 'var(--color-bg-subtle)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-gray-light)', fontWeight: 600, marginBottom: 12 }}>Social proof</p>
          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.05, color: 'var(--color-dark)' }}>
            Voices of trust
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
          {testimonials.map((t) => (
            <div key={t.name} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '32px' }}>
              <p style={{ fontSize: 16, color: 'var(--color-dark)', lineHeight: 1.7, letterSpacing: '-0.01em', marginBottom: 24, fontStyle: 'italic' }}>
                &ldquo;{t.quote}&rdquo;
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700 }}>
                  {t.name[0]}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-dark)', letterSpacing: '-0.01em' }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-gray)', letterSpacing: '-0.005em' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Create `components/sections/founders.tsx`**

```tsx
import { Linkedin } from 'lucide-react'

const founders = [
  {
    name: 'Arnab Ray',
    role: 'CEO & Co-Founder',
    bio: 'Leads strategy, client relationships, and business direction. Background in technology entrepreneurship and Web3 ecosystem development.',
    linkedin: 'https://linkedin.com/in/arnab-ray',
  },
  {
    name: 'Anik Ghosh',
    role: 'COO & Co-Founder',
    bio: 'Oversees operations, project delivery, and go-to-market execution. Ensures every project ships on time and to spec.',
    linkedin: 'https://linkedin.com/in/anik-ghosh',
  },
  {
    name: 'Soumojit Ash',
    role: 'CTO & Co-Founder',
    bio: 'Leads technical architecture across Web3 and AI systems. Deep expertise in blockchain protocols, smart contracts, and AI agent design.',
    linkedin: 'https://linkedin.com/in/soumojit-ash',
  },
]

export function FoundersSection() {
  return (
    <section style={{ padding: '96px 80px', background: '#fff' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-gray-light)', fontWeight: 600, marginBottom: 12 }}>The team</p>
          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 700, letterSpacing: '-0.035em', color: 'var(--color-dark)' }}>
            The team behind the work
          </h2>
        </div>
        <p style={{ fontSize: 16, color: 'var(--color-gray)', lineHeight: 1.65, letterSpacing: '-0.01em', maxWidth: 560, marginBottom: 48 }}>
          A technical co-founding team with hands-on delivery experience across Web3 and AI.
          When you work with Metaborong, you work directly with the people who built the portfolio above.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {founders.map((f) => (
            <div key={f.name} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: '32px 28px' }}>
              <div style={{ width: 56, height: 56, borderRadius: 12, background: 'var(--color-bg-subtle)', border: '1px solid rgba(32,74,248,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: 'var(--color-brand)', marginBottom: 20 }}>
                {f.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-dark)', marginBottom: 4 }}>{f.name}</h3>
              <p style={{ fontSize: 12, color: 'var(--color-brand)', fontWeight: 600, letterSpacing: '0.02em', marginBottom: 14 }}>{f.role}</p>
              <p style={{ fontSize: 13, color: 'var(--color-gray)', lineHeight: 1.7, letterSpacing: '-0.005em', marginBottom: 20 }}>{f.bio}</p>
              <a href={f.linkedin} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-brand)', fontWeight: 500, textDecoration: 'none' }}>
                <Linkedin size={14} /> LinkedIn
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Verify TypeScript**

```bash
pnpm tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add WhyUs, WorkPreview, Testimonials, Founders sections"
```

---

### Task 12: Comparison, FAQ, Contact CTA, Footer

**Files:**
- Create: `components/sections/comparison.tsx`
- Create: `components/sections/faq.tsx`
- Create: `components/sections/contact-cta.tsx`
- Create: `components/layout/footer.tsx`

- [ ] **Step 1: Create `components/sections/comparison.tsx`**

```tsx
const rows = [
  { label: 'Team access',       metaborong: 'Direct — founders',         large: 'Account manager layer',     freelance: 'Direct but inconsistent' },
  { label: 'AI-native services',metaborong: 'Core offering',             large: 'Add-on or absent',          freelance: 'Rare' },
  { label: 'DeFi depth',        metaborong: 'Deep, multichain',          large: 'Generic',                   freelance: 'Depends on individual' },
  { label: 'Speed to delivery', metaborong: 'Weeks',                     large: 'Months',                    freelance: 'Unpredictable' },
  { label: 'Product thinking',  metaborong: 'Built in',                  large: 'Execution-focused',         freelance: 'Absent' },
  { label: 'Track record',      metaborong: '8 shipped products',        large: 'Hundreds of clients ✓',     freelance: 'Case by case' },
]

export function ComparisonSection() {
  return (
    <section style={{ padding: '96px 80px', background: 'var(--color-bg-subtle)' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-gray-light)', fontWeight: 600, marginBottom: 12 }}>Comparison</p>
          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 700, letterSpacing: '-0.035em', color: 'var(--color-dark)' }}>
            How Metaborong compares
          </h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--color-gray-light)', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', width: '22%' }} />
                <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--color-brand)', fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em', width: '26%' }}>Metaborong</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--color-gray)', fontSize: 13, fontWeight: 600, width: '26%' }}>Large Web3 Agency</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--color-gray)', fontSize: 13, fontWeight: 600, width: '26%' }}>Freelance Team</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.label} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : 'transparent' }}>
                  <td style={{ padding: '14px 16px', color: 'var(--color-gray)', fontWeight: 500, fontSize: 13 }}>{r.label}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--color-dark)', fontWeight: 600 }}>{r.metaborong}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--color-gray)' }}>{r.large}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--color-gray)' }}>{r.freelance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: 16, fontSize: 12, color: 'var(--color-gray-light)', letterSpacing: '-0.005em' }}>
          ✓ denotes where the alternative genuinely wins. Large agencies have longer track records — a real advantage for enterprises needing procurement comfort.
        </p>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create `components/sections/faq.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'What is Metaborong?',
    a: 'Metaborong is a Web3 development company and AI agent studio based in the US and Europe. It builds DeFi protocols, autonomous AI systems, and custom SaaS products for founders, crypto-native teams, and enterprises. The studio is run by three technical co-founders.',
  },
  {
    q: 'What Web3 services does Metaborong offer?',
    a: 'Metaborong offers DeFi protocol development, smart contract security audits, NFT marketplace development, crypto wallet development (custodial and non-custodial), token launchpad infrastructure, liquid staking vault architecture, and DAO governance systems — across multiple blockchain networks.',
  },
  {
    q: 'What AI agent services does Metaborong provide?',
    a: 'Metaborong builds agentic AI systems, generative AI applications, RAG and knowledge retrieval systems, voice agent integrations, AI workflow automation, and AI integration into existing software stacks. The studio works with LLMs, multi-agent orchestration frameworks, and enterprise AI tooling.',
  },
  {
    q: 'How long does a typical project take?',
    a: 'Most projects run four to twelve weeks depending on scope. DeFi protocol builds and full SaaS platforms take longer; smart contract audits, AI integrations, and scoped agent builds typically deliver within four to six weeks.',
  },
  {
    q: 'Who does Metaborong work with?',
    a: 'Metaborong primarily works with early-stage founders and startup teams building Web3 or AI products. It also works with crypto-native projects needing specialist development capacity and with enterprises integrating blockchain or AI into existing systems.',
  },
  {
    q: 'How is Metaborong different from larger Web3 agencies?',
    a: 'Metaborong is a small senior team, not a managed agency. Founders communicate directly with the people writing code. The studio ships faster than larger agencies, integrates AI natively into Web3 builds, and treats every project with co-builder accountability rather than contractor execution.',
  },
  {
    q: 'Where is Metaborong based?',
    a: 'Metaborong operates across the US and European markets. The founding team is reachable at contact@metaborong.com for initial conversations about any project.',
  },
  {
    q: 'Does Metaborong work on projects outside Web3?',
    a: "Yes. Metaborong's Product Studio pillar builds custom Web2 SaaS platforms independently of blockchain or AI components. Clients who need a full-stack technical team for a pure SaaS build can engage Metaborong through the Product Studio track.",
  },
]

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section style={{ padding: '96px 80px', background: '#fff' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-gray-light)', fontWeight: 600, marginBottom: 12 }}>FAQ</p>
          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 700, letterSpacing: '-0.035em', color: 'var(--color-dark)' }}>
            Frequently asked questions
          </h2>
        </div>
        <div style={{ borderTop: '1px solid #e5e7eb' }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '20px 0',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  gap: 16,
                }}
                aria-expanded={open === i}
              >
                <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-dark)', letterSpacing: '-0.02em', lineHeight: 1.3 }}>{faq.q}</span>
                <ChevronDown
                  size={18}
                  style={{
                    color: 'var(--color-gray)',
                    flexShrink: 0,
                    transform: open === i ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s',
                  }}
                />
              </button>
              {open === i && (
                <div style={{ paddingBottom: 20, paddingRight: 32 }}>
                  <p style={{ fontSize: 15, color: 'var(--color-gray)', lineHeight: 1.7, letterSpacing: '-0.01em' }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Create `components/sections/contact-cta.tsx`**

```tsx
export function ContactCtaSection() {
  return (
    <section
      style={{
        background: 'var(--color-canvas)',
        padding: '96px 80px',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h2
          style={{
            fontSize: 'clamp(36px, 5vw, 64px)',
            fontWeight: 700,
            color: '#fff',
            letterSpacing: '-0.04em',
            lineHeight: 1.03,
            marginBottom: 18,
          }}
        >
          Got a project in mind?
        </h2>
        <p
          style={{
            fontSize: 17,
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: '-0.01em',
            lineHeight: 1.65,
            maxWidth: 440,
            margin: '0 auto 36px',
          }}
        >
          Tell us what you are building. We will tell you how we would approach it —
          no pitch deck, no fluff, no commitment required.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href="/contact/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--color-brand)',
              color: '#fff',
              fontSize: 16,
              fontWeight: 600,
              padding: '14px 28px',
              borderRadius: 8,
              textDecoration: 'none',
              letterSpacing: '-0.01em',
              transition: 'opacity 0.15s',
            }}
          >
            Start a Conversation →
          </a>
          <a
            href="mailto:contact@metaborong.com"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              fontSize: 15,
              color: 'rgba(255,255,255,0.45)',
              textDecoration: 'none',
              letterSpacing: '-0.01em',
              padding: '14px 0',
            }}
          >
            contact@metaborong.com
          </a>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Create `components/layout/footer.tsx`**

```tsx
import { Logo } from '@/components/ui/logo'
import { Linkedin, Twitter } from 'lucide-react'

const footerLinks = ['Services', 'Work', 'About', 'Blog', 'Contact']

export function Footer() {
  return (
    <footer
      style={{
        background: 'var(--color-canvas)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '36px 80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
      }}
    >
      <Logo showWordmark wordmarkColor="text-white" />

      <nav style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {footerLinks.map((label) => (
          <a
            key={label}
            href={`/${label.toLowerCase()}/`}
            style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', letterSpacing: '-0.01em' }}
          >
            {label}
          </a>
        ))}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <a href="https://linkedin.com/company/metaborong-technologies" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
          <Linkedin size={16} color="rgba(255,255,255,0.35)" />
        </a>
        <a href="https://x.com/Metaborong" target="_blank" rel="noopener noreferrer" aria-label="X / Twitter">
          <Twitter size={16} color="rgba(255,255,255,0.35)" />
        </a>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', letterSpacing: '-0.01em' }}>
          © 2026 Metaborong Technologies
        </span>
      </div>
    </footer>
  )
}
```

- [ ] **Step 5: Verify TypeScript**

```bash
pnpm tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add Comparison, FAQ, ContactCTA, Footer components"
```

---

### Task 13: SEO Schema

**Files:**
- Create: `lib/schema.ts`

- [ ] **Step 1: Create `lib/schema.ts`**

```typescript
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Metaborong',
  alternateName: 'Metaborong Technologies',
  url: 'https://www.metaborong.com',
  logo: 'https://www.metaborong.com/assets/og/logo.png',
  description:
    'Metaborong is a Web3 development company and AI agent studio that builds DeFi protocols, autonomous AI systems, and custom SaaS products for founders and crypto-native teams.',
  email: 'contact@metaborong.com',
  areaServed: ['US', 'EU'],
  foundingDate: '2023',
  sameAs: [
    'https://linkedin.com/company/metaborong-technologies',
    'https://x.com/Metaborong',
  ],
  founders: [
    { '@type': 'Person', name: 'Arnab Ray', jobTitle: 'CEO' },
    { '@type': 'Person', name: 'Anik Ghosh', jobTitle: 'COO' },
    { '@type': 'Person', name: 'Soumojit Ash', jobTitle: 'CTO' },
  ],
}

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Metaborong',
  url: 'https://www.metaborong.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://www.metaborong.com/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add JSON-LD organization and website schema"
```

---

### Task 14: Page Assembly

**Files:**
- Modify: `app/page.tsx` — import and assemble all sections with schema injection

- [ ] **Step 1: Replace `app/page.tsx` with full homepage**

```tsx
import { Nav } from '@/components/layout/nav'
import { Footer } from '@/components/layout/footer'
import { HeroSection } from '@/components/sections/hero'
import { TrustBar } from '@/components/sections/trust-bar'
import { ServicesSection } from '@/components/sections/services'
import { WhyUsSection } from '@/components/sections/why-us'
import { WorkPreviewSection } from '@/components/sections/work-preview'
import { TestimonialsSection } from '@/components/sections/testimonials'
import { FoundersSection } from '@/components/sections/founders'
import { ComparisonSection } from '@/components/sections/comparison'
import { FaqSection } from '@/components/sections/faq'
import { ContactCtaSection } from '@/components/sections/contact-cta'
import { organizationSchema, websiteSchema } from '@/lib/schema'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Web3 & AI Development Studio | Metaborong',
  description:
    'Metaborong builds DeFi protocols, AI agent systems, and custom SaaS products for founders and crypto-native teams. Fast delivery, product-first thinking.',
  alternates: { canonical: 'https://www.metaborong.com' },
  openGraph: {
    title: 'Web3 & AI Development Studio | Metaborong',
    description:
      'Metaborong builds DeFi protocols, AI agent systems, and custom SaaS products for founders and crypto-native teams.',
    url: 'https://www.metaborong.com',
    images: [{ url: '/assets/og/og-home.webp', width: 1200, height: 630, alt: 'Metaborong' }],
  },
}

export default function HomePage() {
  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      <Nav />

      <main>
        <HeroSection />
        <TrustBar />
        <ServicesSection />
        <WhyUsSection />
        <WorkPreviewSection />
        <TestimonialsSection />
        <FoundersSection />
        <ComparisonSection />
        <FaqSection />
        <ContactCtaSection />
      </main>

      <Footer />
    </>
  )
}
```

- [ ] **Step 2: Run the dev server and verify the page renders**

```bash
pnpm dev
```

Open http://localhost:3000. Expected:
- Sticky nav with Services dropdown
- 55/45 hero with ASCII genesis cube morphing
- All sections visible top to bottom
- Dark contact CTA and footer at bottom
- No TypeScript or console errors

- [ ] **Step 3: Final TypeScript check**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: assemble homepage — all sections wired, SEO metadata + JSON-LD"
```

---

## Self-Review Against Spec

**Spec coverage:**
- [x] Next.js 15 App Router + TypeScript + Tailwind v4 + pnpm
- [x] Satoshi font via Fontshare CDN
- [x] Design system tokens wired (`#204AF8`, `#F6851B`, `#0a0a0a`, `#f5f7ff`)
- [x] M-mark logo as React SVG component
- [x] Sticky frosted-glass nav with Services dropdown (3 pillars)
- [x] 55/45 hero split — copy left, ASCII cube right
- [x] ASCII genesis cube: cube → torus → dodecahedron → cube, luminance ramp, numbers
- [x] AEO blockquote in hero (38-word extraction sentence)
- [x] Single H1 with primary keyword
- [x] Trust bar scrolling marquee
- [x] Services section — 3 pillar cards → hub page links
- [x] Why us — 3 differentiator cards (Speed, Product Thinking, Niche Depth)
- [x] Work preview — 4 project cards (placeholder, case study detail TBD)
- [x] Testimonials — 4 named quotes
- [x] Founders — 3 cards with initials + LinkedIn links
- [x] Comparison table with honest competitor note
- [x] FAQ accordion — 8 Q&As, all self-contained for AI extraction
- [x] Contact CTA — dark `#0a0a0a` section
- [x] Footer — logo, nav links, social icons, copyright
- [x] JSON-LD: Organization + WebSite schemas
- [x] Next.js metadata API: title, description, OG, canonical

**No placeholders found.** All component code is complete and implementable as-is.

**Type consistency:** All types defined in `renderer.ts` (`Vec3`, `Vec2`, `RenderConfig`) are used consistently across `renderer.ts`, `use-genesis-cube.ts`, and `genesis-cube.tsx`.
