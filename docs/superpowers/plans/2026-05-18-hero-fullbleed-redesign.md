# Hero Full-Bleed Landscape Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the two-column ASCII-video hero with a single full-bleed landscape image stage, the three glass cards locked exactly onto the flower cluster, copy recolored for WCAG-AA legibility — no copy wording changes.

**Architecture:** One `relative overflow-hidden` `<section>`. An absolutely-centered, aspect-ratio-locked "stage" is sized to *cover* the viewport; the background image **and** the three `HeroOverlayCard`s are children of that stage, so they share one coordinate space and the cards stay registered on the flowers at every viewport size with pure CSS. The copy block is a separate section-anchored overlay (it must track the readable left scrim, which is viewport-relative). A left-anchored dark gradient scrim makes off-white copy AA-legible.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4, `next/image`, Vitest + happy-dom + Testing Library. `sips` (macOS) for image optimization.

**Spec:** `docs/superpowers/specs/2026-05-18-section-hero-fullbleed-design.md` (commit `dd725c5`).

**Constraints:** branch `design-revamp`; **local commits only, never push**; verify with `pnpm dev` (never a clean build / never `rm -rf .next`); copy wording is A3-locked (treatment/color only).

**TDD adaptation (read first):** This is a single visual component with no prior section tests. Task 2 is guarded by a real Vitest red→green test for the *structural/SSR invariants* (the regression-prone part). The *visual* criteria — scrim contrast, card-on-flower registration, LCP — are not honestly unit-testable; Tasks 4–5 verify them with concrete measured checks (exact commands + expected results), per the project's verification model (`SESSIONS.md`) and user-instruction precedence over the skill's default Jest-everything TDD.

---

## Files

- **Modify:** `components/sections/hero.tsx` — full rewrite of the section structure; `HeroOverlayCard` kept, only its responsive-visibility class changes.
- **Create:** `public/hero-bg.jpg` — optimized shipped background (sips output).
- **Create:** `components/sections/hero.test.tsx` — structural/SSR regression guard.
- **Modify:** `.gitignore` — exclude the 7.5 MB source PNG (decision below).
- **Delete:** `public/hero-ascii.mp4`, `public/hero-ascii-poster.png` — dead after this change.
- **Modify (graduation):** `docs/superpowers/specs/2026-05-10-section-hero.md`, `CHANGELOG.md`.
- **Source (untracked):** `docs/Gemini_Generated_Image_i6ni71i6ni71i6ni.png` stays physically in `docs/` as the local master, git-ignored.

### Open decision — resolved (default; override before Task 0 if you disagree)

The 7.5 MB source PNG: **gitignore it; ship only the optimized JPEG.** Rationale: a 7.5 MB binary bloats every clone forever; the JPEG (~724 KB) is the real artifact and `next/image` re-encodes it to AVIF/WebP at delivery. The master stays in `docs/` locally and is referenced by the spec, just untracked. (Alternatives if you prefer: commit the PNG to `docs/`, or Git LFS. Say so before Task 0 runs.)

---

### Task 0: Asset pipeline + source-PNG gitignore

**Files:**
- Modify: `.gitignore`
- Create: `public/hero-bg.jpg`
- Source: `docs/Gemini_Generated_Image_i6ni71i6ni71i6ni.png` (untracked master)

- [ ] **Step 1: Gitignore the source PNG**

Append to `.gitignore` (under the existing `# dev session artifacts` group is fine, or a new group):

```
# hero background — 7.5MB source master kept locally only; ship the optimized JPEG
docs/Gemini_Generated_Image_i6ni71i6ni71i6ni.png
```

- [ ] **Step 2: Produce the optimized shipped asset**

Run:

```bash
sips -Z 2560 -s format jpeg -s formatOptions 72 \
  docs/Gemini_Generated_Image_i6ni71i6ni71i6ni.png \
  --out public/hero-bg.jpg
```

- [ ] **Step 3: Verify dimensions and size**

Run:

```bash
sips -g pixelWidth -g pixelHeight public/hero-bg.jpg | tail -2 && ls -la public/hero-bg.jpg | awk '{print $5}'
```

Expected: `pixelWidth: 2560`, `pixelHeight: 1427`, size ≈ `724000`–`760000` bytes (≤ 0.8 MB). If size > 1 MB, lower quality: re-run Step 2 with `formatOptions 64`.

- [ ] **Step 4: Visual sanity-check the JPEG**

Open `public/hero-bg.jpg` (Finder/Preview or browser) and confirm: the blue-flower / tree / rock cluster on the right is intact, the HUD line ("ECOSYSTEM OPERATING SYSTEM…") is legible, no heavy compression banding in the sky. If banding is visible, re-run Step 2 with `formatOptions 80` and re-check size ≤ 1 MB.

- [ ] **Step 5: Commit**

```bash
git add .gitignore public/hero-bg.jpg
git commit -m "asset(hero): optimized full-bleed bg + gitignore 7.5MB source PNG

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 1: Failing structural test

**Files:**
- Create: `components/sections/hero.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `components/sections/hero.test.tsx` (conventions copied from `components/admin/images/image-picker.test.tsx`: happy-dom directive, next/image mock):

```tsx
// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
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
  // Repo convention (matches every components/**/*.test.tsx): explicit
  // cleanup between cases. The vitest config does NOT set globals:true,
  // so RTL auto-cleanup is not registered — do not add globals:true.
  afterEach(() => cleanup())

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
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `pnpm vitest run components/sections/hero.test.tsx`
Expected: FAIL — current hero still renders a `<video>` / `hero-ascii.mp4` and has no `/hero-bg.jpg` image or `[data-hero-card]` attribute. (The copy assertion may pass; the file as a whole must fail.)

- [ ] **Step 3: Commit the red test**

```bash
git add components/sections/hero.test.tsx
git commit -m "test(hero): structural guard for full-bleed redesign (red)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Rewrite `hero.tsx` — full-bleed stage

**Files:**
- Modify: `components/sections/hero.tsx` (full rewrite)

Notes baked into the code below:
- Stage cover sizing: `w = max(100vw, 100vh*A)`, `h = max(100vh, 100vw/A)` where `A = 2754/1536`. Correct in both viewport regimes (verified algebraically in the spec); image + cards are stage children → cards stay on the flowers with no JS.
- `HeroOverlayCard` behavior unchanged; only (a) root gains `data-hero-card` + `hidden lg:block` (was `max-[420px]:hidden`), (b) coords are stage-% over the right flower cluster (starting values; Task 4 tunes).
- Scrim is two layers: a base veil (mobile legibility, fades out at `lg`) + the L1 left gradient (starting values; Task 3 tunes).
- Eyebrow chip structure kept (respects last session's revert) — recolored for dark only.
- Ghost CTA recolored on-dark via per-instance `!` overrides (the hero is the only on-dark surface; the Button primitive stays untouched).
- **Do NOT modify `vitest.config.ts`.** It is backend-owned and intentionally has no `globals:true`; the hero test uses the repo's explicit `afterEach(() => cleanup())` convention. Only `components/sections/hero.tsx` changes in this task.

- [ ] **Step 1: Replace the entire file with this content**

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Reveal } from '@/components/ui/reveal'
import { Typewriter } from '@/components/ui/typewriter'

// Source image is 2754×1536 → aspect 2754/1536. The stage is locked to this
// ratio and scaled to COVER the viewport, so the image and the three cards
// share one coordinate space and the cards stay registered on the flowers
// at every viewport size (pure CSS, no tracking JS).
const STAGE_W = 'max(100vw,calc(100vh*2754/1536))'
const STAGE_H = 'max(100vh,calc(100vw*1536/2754))'

export function HeroSection() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#0a0e1a]">
      {/* Aspect-locked cover stage: image + cards live here together. */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: STAGE_W, height: STAGE_H }}
      >
        <Image
          src="/hero-bg.jpg"
          alt=""
          data-testid="hero-bg"
          fill
          priority
          sizes="100vw"
          className="object-cover select-none"
        />

        {/* Scrim: base veil (mobile legibility, gone at lg) + L1 left gradient.
            Starting values — Task 3 tunes against the real pixels for AA. */}
        <div className="absolute inset-0 bg-[rgba(8,12,24,0.50)] lg:bg-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,12,24,0.82)_0%,rgba(8,12,24,0.56)_30%,rgba(8,12,24,0.12)_52%,transparent_64%)]" />

        {/* Three proof windows — over the right flower cluster, current
            low/high/low stagger. Stage-% coords; Task 4 tunes. */}
        <HeroOverlayCard
          loadingLabels={['Cogitating…', 'Reasoning…', 'Inferring…', 'Embedding…']}
          resultLabel="w₁ 0.83, ∑ 0.44"
          style={{ left: '55%', top: '50%' }}
        />
        <HeroOverlayCard
          loadingLabels={['Mining block…', 'Signing tx…', 'Validating…', 'Committing…']}
          resultLabel="0x4a7f..."
          style={{ left: '70%', top: '16%' }}
        />
        <HeroOverlayCard
          loadingLabels={['Deploying…', 'Building…', 'Migrating…', 'Scaling…']}
          resultLabel="/v1/deploy"
          style={{ left: '80%', top: '62%' }}
        />
      </div>

      {/* Copy — section-anchored (tracks the viewport-relative left scrim). */}
      <Reveal className="relative z-10 flex min-h-screen flex-col justify-center px-[24px] md:px-[48px] lg:px-[96px] xl:px-[128px] py-[120px]">
        <div className="max-w-[620px]">
          {/* Eyebrow chip — original structure kept; recolored for dark only. */}
          <div className="inline-flex items-center mb-7 bg-white/[0.07] border border-white/25 rounded-sm px-3 py-[6px] w-fit">
            <Eyebrow className="text-[12px]! tracking-[0.12em]! text-off-white/[0.78]!">
              Web3 &amp; AI development studio
            </Eyebrow>
          </div>

          <h1 className="text-[clamp(32px,4.8vw,72px)] font-black tracking-[-0.04em] leading-[1.02] text-off-white mb-6">
            <Typewriter
              lines={[
                { text: 'Web3 protocols.' },
                { text: 'AI agents.' },
                { text: 'Shipped.', className: 'text-brand' },
              ]}
              durationMs={650}
              startDelayMs={150}
            />
          </h1>

          <blockquote cite="/#services" className="mb-6">
            <p className="text-base text-off-white/[0.86] leading-[1.6] tracking-[-0.005em] max-w-[560px]">
              Metaborong is a Web3 development company and AI agent studio. A
              remote-first team of senior engineers, globally distributed. We ship
              DeFi protocols and smart contract audits across EVM chains and Solana,
              AI agents spanning RAG, agentic workflows, and generative systems, and
              full-stack SaaS for founders and early-stage startups. Spec to
              production, fast.
            </p>
          </blockquote>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Button href="/#contact" size="lg" arrow="→" className="justify-center w-full sm:w-auto">Get a scope</Button>
            <Button
              href="/#work"
              variant="ghost"
              size="lg"
              className="justify-center w-full sm:w-auto text-white! border-white/45! hover:bg-white/10! hover:border-white/70! active:bg-white/15!"
            >
              Open recent work
            </Button>
          </div>
        </div>
      </Reveal>

      <div
        aria-hidden="true"
        className={`absolute bottom-[40px] left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/70 transition-opacity duration-300 z-10 ${
          scrolled ? 'opacity-0' : 'opacity-100'
        } motion-safe:animate-[heroScrollBounce_1.6s_cubic-bezier(0.45,0,0.55,1)_infinite]`}
      >
        <ChevronDown size={16} strokeWidth={2} />
        <span className="text-[10px] tracking-[0.15em] uppercase">Scroll</span>
      </div>
    </section>
  )
}

/** Glassmorphic "browser-window" card overlay. Encodes the three pillars
 *  (AI weights, web3 hash, product API path). Cycles loading → result while
 *  the hero is in viewport; pauses out of view. Behavior unchanged from the
 *  pre-redesign component — only the responsive-visibility class and the
 *  data-hero-card hook differ. */
function HeroOverlayCard({
  loadingLabels,
  resultLabel,
  style,
}: {
  loadingLabels: string[]
  resultLabel: string
  style: React.CSSProperties
}) {
  const [phase, setPhase] = useState<'loading' | 'result'>('loading')
  const [gerundIdx, setGerundIdx] = useState(0)
  const [cycle, setCycle] = useState(0)
  const cardRef = useRef<HTMLDivElement | null>(null)
  const inViewRef = useRef(true)

  useEffect(() => {
    const card = cardRef.current
    if (!card) return
    const obs = new IntersectionObserver(
      ([entry]) => { inViewRef.current = entry.isIntersecting },
      { threshold: 0 },
    )
    obs.observe(card)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPhase('result')
      return
    }
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | null = null

    const advance = (to: 'loading' | 'result') => {
      if (cancelled) return
      if (!inViewRef.current) {
        timer = setTimeout(() => advance(to), 500)
        return
      }
      if (to === 'result') {
        setPhase('result')
        timer = setTimeout(() => advance('loading'), 6000)
      } else {
        setGerundIdx(i => (i + 1) % loadingLabels.length)
        setCycle(c => c + 1)
        setPhase('loading')
        timer = setTimeout(() => advance('result'), 1500)
      }
    }

    timer = setTimeout(() => advance('result'), 2300)

    return () => { cancelled = true; if (timer) clearTimeout(timer) }
  }, [loadingLabels.length])

  return (
    <div
      ref={cardRef}
      data-hero-card
      aria-hidden="true"
      className="hero-card-pop hidden lg:block absolute z-20 w-[92px] h-[108px] lg:w-[116px] lg:h-[137px] backdrop-blur-[15px] border border-white/80 opacity-0"
      style={style}
    >
      <div className="absolute inset-x-0 top-0 h-[22px] bg-white/95 border-b border-white flex items-center gap-[2px] px-[3px]">
        <span className="w-[15px] h-[14px] bg-[#d90429]" />
        <span className="w-[15px] h-[14px] bg-[#ffba08]" />
        <span className="w-[15px] h-[14px] bg-[#38b000]" />
      </div>
      {phase === 'loading' ? (
        <div className="absolute left-[9px] bottom-[10px] flex items-center gap-[5px] text-white whitespace-nowrap drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">
          <Loader2 size={11} strokeWidth={2.5} className="animate-spin opacity-90" />
          <span className="font-mono text-[10px] lg:text-[11px] tracking-[-0.01em]">
            <Typewriter
              key={`loading-${cycle}`}
              lines={[{ text: loadingLabels[gerundIdx] }]}
              durationMs={400}
              startDelayMs={cycle === 0 ? 1100 : 0}
            />
          </span>
        </div>
      ) : (
        <p className="absolute left-[9px] bottom-[10px] font-bold text-[11px] lg:text-[12px] tracking-[-0.01em] text-white whitespace-nowrap drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">
          <Typewriter
            key={`result-${cycle}`}
            lines={[{ text: resultLabel }]}
            durationMs={550}
            startDelayMs={0}
          />
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: PASS (no errors). If `React.CSSProperties` errors, it is already imported via the `'use client'` React types; no change needed (this matches the pre-existing code).

- [ ] **Step 3: Run the structural test, verify green**

Run: `pnpm vitest run components/sections/hero.test.tsx`
Expected: PASS — all three test cases green (copy present, `/hero-bg.jpg` with `alt=""`, no `<video>`/`hero-ascii`, exactly 3 `[data-hero-card]` aria-hidden).

- [ ] **Step 4: Visual smoke-check on the dev server**

The dev server is already running on http://localhost:3000 (do NOT clean-build / `rm -rf .next`). Hard-refresh the homepage. Confirm: full-bleed landscape image, copy left in off-white, three glass cards roughly over the flower cluster on the right, scroll cue light at bottom. Exact scrim/positions are tuned next — only confirm nothing is broken/blank.

- [ ] **Step 5: Commit**

```bash
git add components/sections/hero.tsx
git commit -m "feat(hero): full-bleed landscape stage; remove ASCII video + 2-col grid

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Tune the scrim for WCAG-AA (measured)

**Files:**
- Modify: `components/sections/hero.tsx` (scrim layer + possibly H1 accent color)

- [ ] **Step 1: Measure the copy-zone contrast**

With the dev server, open the homepage in a browser at desktop width (1440). Using the browser devtools color picker (or the `gstack`/`browse` skill screenshot + an eyedropper), sample the effective background color directly behind: (a) the eyebrow text, (b) the H1, (c) the blockquote — at their on-screen positions. Compute contrast of off-white `#FEFEFE` (and `#FEFEFE` at 0.86 alpha for the blockquote) against each sampled bg using a contrast formula/tool.

Expected pass: H1 (large) ≥ 3:1; eyebrow & blockquote (treated as body) ≥ 4.5:1.

- [ ] **Step 2: If any fail, strengthen the gradient**

Edit the L1 gradient line in `hero.tsx`. Increase the left stops until all three pass — e.g. step to:

```tsx
<div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,12,24,0.90)_0%,rgba(8,12,24,0.66)_32%,rgba(8,12,24,0.18)_54%,transparent_66%)]" />
```

Re-measure (Step 1) after each change. Stop as soon as all three pass — do not over-darken (the right flowers/cards must stay vivid; the gradient must still be `transparent` by ~64–68%).

- [ ] **Step 3: Resolve the H1 accent ("Shipped.")**

Measure brand `#296ff0` against the scrimmed bg behind the accent word. If ≥ 3:1 (large text), keep `text-brand`. If it fails, change that one line `{ text: 'Shipped.', className: 'text-brand' }` → `{ text: 'Shipped.', className: 'text-[#7fb3ff]' }` and re-measure to confirm ≥ 3:1.

- [ ] **Step 4: Verify mobile (375px)**

In devtools responsive mode at 375px: the copy centers over the base veil. Sample bg behind H1/blockquote/eyebrow there too. If any fail, raise the base-veil opacity: `bg-[rgba(8,12,24,0.50)]` → `bg-[rgba(8,12,24,0.62)]` (the `lg:bg-transparent` keeps desktop unaffected). Re-measure.

- [ ] **Step 5: Typecheck + commit**

Run: `pnpm typecheck` → PASS

```bash
git add components/sections/hero.tsx
git commit -m "fix(hero): tune scrim + accent to pass WCAG-AA over the image

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Register the cards exactly on the flowers (measured, all widths)

**Files:**
- Modify: `components/sections/hero.tsx` (the three `style={{ left, top }}` values)

- [ ] **Step 1: Eyeball at the design width**

Dev server at 1440 width. Each of the three cards must sit visibly *on a distinct bloom group* of the right-side cluster (Card 1 = large central anemone, Card 2 = upper blooms near the tree, Card 3 = lower-right rock blooms), preserving the low/high/low stagger. Nudge the three `left`/`top` percentages until the placement reads right. Percentages are of the stage (= image space).

- [ ] **Step 2: Verify NO drift across widths**

Resize the browser to each of: 2560, 1920, 1440, 1280, 1024. At each, confirm every card still sits on the same bloom (the whole point of the aspect-locked stage — they must not drift). They will not if Task 2's stage CSS is intact; if any card drifts, the stage `width/height` style was altered — restore the `STAGE_W`/`STAGE_H` expressions exactly.

- [ ] **Step 3: Confirm sub-`lg` hides the cards**

At 1023px and 375px: the three cards are absent (`hidden lg:block`), the image still carries the visual, copy is legible. No layout overflow from the cards.

- [ ] **Step 4: Typecheck + commit**

Run: `pnpm typecheck` → PASS

```bash
git add components/sections/hero.tsx
git commit -m "fix(hero): register the 3 proof cards on the flower cluster

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 4b: Live ASCII canvas engine (color-tinted)

**Added 2026-05-18 after user feedback + an approved static POC.** The full-bleed
background must read as a *live* ASCII render of `public/hero-bg.jpg` (color-tinted glyphs
on `#0a0e1a`), not a static photo, with gentle non-positional motion. Algorithm is ported
verbatim from the approved POC (`/tmp/ascii_poc.py`): brightness ×1.28, saturation ×1.42,
contrast ×1.06, luminance min/max stretch, gamma 0.72, per-cell brightness normalize to
`86 + 150·t`, ramp `" .:-=+*#%@"`. The static ASCII is drawn once to an offscreen canvas;
each frame only composites a cheap moving scanline (no glyph recompute). IO-gated;
`prefers-reduced-motion` → one static frame, no rAF.

**Files:**
- Create: `components/sections/hero-ascii-canvas.tsx`
- Modify: `components/sections/hero.tsx` (insert `<HeroAsciiCanvas />` in the stage)

- [ ] **Step 1: Create `components/sections/hero-ascii-canvas.tsx` with EXACTLY:**

```tsx
'use client'

import { useEffect, useRef } from 'react'

// Ported from the approved static POC. Color-tinted ASCII of /hero-bg.jpg on
// #0a0e1a. Static base drawn once to an offscreen canvas; the rAF loop only
// composites a cheap moving scanline (no per-frame glyph recompute).
const RAMP = ' .:-=+*#%@'
const BG = '#0a0e1a'
const SRC = '/hero-bg.jpg'
const FONT_PX = 8

const clamp = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v)

export function HeroAsciiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const cx = canvas.getContext('2d')
    if (!cx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let running = false
    let base: HTMLCanvasElement | null = null
    let phase = 0
    let resizeTimer: number | undefined

    const img = new Image()
    img.decoding = 'async'

    const sample = document.createElement('canvas')
    const sctx = sample.getContext('2d', { willReadFrequently: true })

    function buildBase() {
      if (!sctx || !img.complete || img.naturalWidth === 0) return
      const rect = wrap!.getBoundingClientRect()
      const W = Math.max(1, Math.round(rect.width))
      const H = Math.max(1, Math.round(rect.height))
      const dpr = Math.min(1.75, window.devicePixelRatio || 1)

      const probe = sctx
      probe.font = FONT_PX + 'px Menlo, ui-monospace, monospace'
      const cw = Math.max(3, Math.round(probe.measureText('M').width))
      const chh = FONT_PX + 1
      const cols = Math.ceil(W / cw)
      const rows = Math.ceil(H / chh)

      sample.width = cols
      sample.height = rows
      sctx.drawImage(img, 0, 0, cols, rows)
      const d = sctx.getImageData(0, 0, cols, rows).data

      const n = cols * rows
      const rr = new Float32Array(n)
      const gg = new Float32Array(n)
      const bb = new Float32Array(n)
      const lum = new Float32Array(n)
      let lo = 255
      let hi = 0
      for (let p = 0; p < n; p++) {
        let r = d[p * 4] * 1.28
        let g = d[p * 4 + 1] * 1.28
        let b = d[p * 4 + 2] * 1.28
        const m = (r + g + b) / 3
        r = m + (r - m) * 1.42
        g = m + (g - m) * 1.42
        b = m + (b - m) * 1.42
        r = clamp((r - 128) * 1.06 + 128)
        g = clamp((g - 128) * 1.06 + 128)
        b = clamp((b - 128) * 1.06 + 128)
        rr[p] = r
        gg[p] = g
        bb[p] = b
        const L = 0.299 * r + 0.587 * g + 0.114 * b
        lum[p] = L
        if (L < lo) lo = L
        if (L > hi) hi = L
      }
      const span = Math.max(1, hi - lo)

      const b2 = document.createElement('canvas')
      b2.width = W * dpr
      b2.height = H * dpr
      const bctx = b2.getContext('2d')
      if (!bctx) return
      bctx.scale(dpr, dpr)
      bctx.fillStyle = BG
      bctx.fillRect(0, 0, W, H)
      bctx.font = FONT_PX + 'px Menlo, ui-monospace, monospace'
      bctx.textBaseline = 'top'
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const p = j * cols + i
          const t = Math.pow((lum[p] - lo) / span, 0.72)
          let idx = Math.round(t * (RAMP.length - 1))
          let ch = RAMP[idx]
          if (ch === ' ') {
            if (lum[p] < 14) continue
            ch = '.'
          }
          const cl = Math.max(1, 0.299 * rr[p] + 0.587 * gg[p] + 0.114 * bb[p])
          const k = (86 + 150 * t) / cl
          const R = clamp(rr[p] * k + 10) | 0
          const G = clamp(gg[p] * k + 12) | 0
          const B = clamp(bb[p] * k + 16) | 0
          bctx.fillStyle = 'rgb(' + R + ',' + G + ',' + B + ')'
          bctx.fillText(ch, i * cw, j * chh)
        }
      }
      base = b2
      canvas!.width = W * dpr
      canvas!.height = H * dpr
      canvas!.style.width = W + 'px'
      canvas!.style.height = H + 'px'
    }

    function paintStatic() {
      if (!base || !cx) return
      cx.setTransform(1, 0, 0, 1, 0, 0)
      cx.drawImage(base, 0, 0)
    }

    function frame() {
      if (!running) return
      if (base && cx) {
        cx.setTransform(1, 0, 0, 1, 0, 0)
        cx.drawImage(base, 0, 0)
        const h = canvas!.height
        const band = (Math.sin(phase) * 0.5 + 0.5) * h
        const g = cx.createLinearGradient(0, band - h * 0.07, 0, band + h * 0.07)
        g.addColorStop(0, 'rgba(150,190,255,0)')
        g.addColorStop(0.5, 'rgba(150,190,255,0.2)')
        g.addColorStop(1, 'rgba(150,190,255,0)')
        cx.fillStyle = g
        cx.fillRect(0, 0, canvas!.width, canvas!.height)
        phase += 0.016
      }
      raf = requestAnimationFrame(frame)
    }

    function start() {
      if (reduce || running) return
      running = true
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(frame)
    }
    function stop() {
      running = false
      cancelAnimationFrame(raf)
    }

    function init() {
      buildBase()
      paintStatic()
      if (!reduce) start()
    }

    img.src = SRC
    if (img.complete && img.naturalWidth) init()
    else img.onload = init

    const io = new IntersectionObserver(
      ([e]) => {
        if (reduce) return
        if (e.isIntersecting) start()
        else stop()
      },
      { threshold: 0 },
    )
    io.observe(wrap)

    const onResize = () => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        buildBase()
        paintStatic()
      }, 200)
    }
    window.addEventListener('resize', onResize)

    return () => {
      stop()
      io.disconnect()
      window.removeEventListener('resize', onResize)
      window.clearTimeout(resizeTimer)
    }
  }, [])

  return (
    <div ref={wrapRef} aria-hidden="true" className="absolute inset-0">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  )
}
```

- [ ] **Step 2: Wire it into `components/sections/hero.tsx`.** Add the import after the `next/image` import:

```tsx
import { HeroAsciiCanvas } from '@/components/sections/hero-ascii-canvas'
```

Then, inside the stage `div`, insert `<HeroAsciiCanvas />` immediately AFTER the `<Image …/>` and BEFORE the first scrim div. Replace:

```tsx
        <Image
          src="/hero-bg.jpg"
          alt=""
          data-testid="hero-bg"
          fill
          priority
          sizes="100vw"
          className="object-cover select-none"
        />

        {/* Scrim: base veil (mobile legibility, gone at lg) + L1 left gradient.
```

with:

```tsx
        <Image
          src="/hero-bg.jpg"
          alt=""
          data-testid="hero-bg"
          fill
          priority
          sizes="100vw"
          className="object-cover select-none"
        />

        {/* Live ASCII render of the bg; covers the <Image> (kept as SSR/first-
            paint fallback + sample source + structural-test anchor). */}
        <HeroAsciiCanvas />

        {/* Scrim: base veil (mobile legibility, gone at lg) + L1 left gradient.
```

(The `<Image>` stays — it is the SSR/first-paint fallback under the canvas and the `data-testid="hero-bg"` anchor the structural test asserts. The canvas samples `/hero-bg.jpg` via its own `new Image()`.)

- [ ] **Step 3: Typecheck + structural test.**

Run: `pnpm typecheck` → PASS.
Run: `pnpm vitest run components/sections/hero.test.tsx` → 3/3 (canvas is `aria-hidden`, adds no `<video>`/testid/`[data-hero-card]`; the `<Image>` is unchanged so the test holds).

- [ ] **Step 4: Visual verify via the `agent-browser` skill.** Dev server already running at http://localhost:3000 (do NOT restart/clean). Screenshot `/` at 1440×900 and 2560/1920/1280/1024: confirm the bg renders as the color-tinted ASCII landscape (matches the approved POC look — clouds/tree/lake/hills/blue-bloom meadow), the scanline animates subtly (capture two frames ~1s apart and diff), copy stays legible, the 3 cards still sit on the (now ASCII) blue blooms — re-nudge the 3 card coords in `hero.tsx` if the ASCII shifts their read (this is the "finalize card-on-bloom against ASCII" step). At 375: ASCII still fills, cards hidden. Emulate `prefers-reduced-motion: reduce` → ASCII paints one static frame, no animation, no console errors. Save shots to /tmp only.

- [ ] **Step 5: Commit.**

```bash
git add components/sections/hero-ascii-canvas.tsx components/sections/hero.tsx
git commit -m "feat(hero): live color-tinted ASCII canvas render of the bg

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Cleanup + graduation

**Files:**
- Delete: `public/hero-ascii.mp4`, `public/hero-ascii-poster.png`
- Modify: `docs/superpowers/specs/2026-05-10-section-hero.md`
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Confirm the old ASCII assets are unreferenced, then delete**

Run: `grep -rn "hero-ascii" components app --include=*.tsx --include=*.ts --include=*.css; echo "exit: $?"`
Expected: no matches (exit 1 from grep = clean). If any match remains, fix it before deleting. Then:

```bash
git rm public/hero-ascii.mp4 public/hero-ascii-poster.png
```

- [ ] **Step 2: Update the hero deviation log**

In `docs/superpowers/specs/2026-05-10-section-hero.md`, under `## Deviations from master plan`: mark §1a (ASCII turbulence/shimmer) **SUPERSEDED 2026-05-18 — the positional glitch is gone; replaced by D4, a controlled color-tinted ASCII canvas infinite (IO-gated, reduced-motion-static)**. Add a one-line pointer: *"Visual structure superseded by `2026-05-18-section-hero-fullbleed-design.md`; D1–D4 (full-bleed imagery, on-dark copy, left scrim, ASCII-canvas infinite) recorded there. §1b (card cycle) unchanged."* Do not delete the historical text — annotate (SESSIONS.md no-contradicting-versions rule). Note: this is NOT a net infinite-count reduction (the old glitch infinite is replaced, not removed) — frame it as a glitch→clean swap, not a compliance gain.

- [ ] **Step 3: Reconcile spec criterion #4 with reality**

In `docs/superpowers/specs/2026-05-18-section-hero-fullbleed-design.md`, acceptance criterion #4: change "≤ ~250 KB WebP" → "shipped `public/hero-bg.jpg` ≤ ~0.8 MB; **delivered** bytes (Next-optimized AVIF/WebP, responsive) ≤ ~250 KB; hero LCP not regressed. (No local WebP encoder; `next/image` handles modern-format delivery. A `sharp` build-step can be added later if a smaller committed source is wanted.)" This keeps spec ↔ implementation consistent.

- [ ] **Step 4: CHANGELOG entry**

Prepend a Session entry to `CHANGELOG.md` (match the existing format/voice) recording: hero full-bleed redesign; ASCII *video* removed, replaced by a live color-tinted ASCII *canvas* render (glitch → clean swap, not an infinite-count reduction); D1–D4 deviations (incl. D4 ASCII-canvas infinite); copy wording untouched (A3); source PNG gitignored, JPEG shipped; supersedes the 2026-05-04 "Hero unchanged" memory lock and the in-session "static bg" decision (both user-directed). List changed/created/deleted files (incl. new `components/sections/hero-ascii-canvas.tsx`).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore(hero): retire ASCII assets; graduate deviations + CHANGELOG

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Verification gate (verification-before-completion)

**Files:** none (verification only)

- [ ] **Step 1: Typecheck + full test run**

Run: `pnpm typecheck && pnpm vitest run components/sections/hero.test.tsx`
Expected: typecheck PASS; all hero tests PASS.

- [ ] **Step 2: SSR crawlability (copy must be in static HTML)**

Run: `curl -s http://localhost:3000/ | grep -c "Web3 &amp; AI development studio"` → expect `1`.
Run: `curl -s http://localhost:3000/ | grep -c "remote-first team of senior engineers"` → expect `1`.
Run: `curl -s http://localhost:3000/ | grep -c "hero-ascii"` → expect `0`.

- [ ] **Step 3: Reduced-motion check**

In devtools, emulate `prefers-reduced-motion: reduce`, reload. Expected: copy visible (Reveal short-circuits), cards show their result label and do not cycle, scroll cue does not bounce, the ASCII canvas paints ONE static frame and never animates (no rAF loop). No console errors. Also re-confirm AA: re-measure eyebrow/H1/blockquote contrast against the **ASCII canvas output** (not the photo) at 1440 + 375; if the ASCII shifted left-zone luminance enough to fail, re-tune the scrim per Task 3's method and note it.

- [ ] **Step 4: Map results to spec acceptance criteria**

Walk the 8 acceptance criteria in `2026-05-18-section-hero-fullbleed-design.md` and confirm each is satisfied (1 structure, 2 card registration across widths — on the ASCII blooms, 3 AA measured **against the ASCII output**, 4 asset/LCP per the reconciled wording, 5 background reads as a live ASCII render + ASCII infinite is IO-gated + reduced-motion-static + cards behave as before, 6 SSR copy, 7 D1–D4 logged, 8 tsc+dev). Report any unmet criterion explicitly rather than claiming done.

- [ ] **Step 5: Final state report**

Report: commits made (local, unpushed), criteria status, and anything deferred. Do NOT push. Do NOT merge. Branch stays `design-revamp`.

---

## Self-Review

**Spec coverage:** asset pipeline → Task 0; aspect-locked stage + structure + removed video/grid → Task 2; **live ASCII-canvas render (D4) → Task 4b**; card image-space registration → Task 2 + Task 4, finalized vs ASCII in Task 4b; L1 scrim + AA → Task 2 + Task 3, re-verified vs ASCII in Task 6; copy recolor (eyebrow chip/H1/blockquote/ghost CTA/scroll cue) → Task 2; motion (ASCII infinite IO-gated + reduced-motion-static, cards unchanged) → Task 4b + Task 6; responsive/mobile scrim + `hidden lg:block` cards → Task 2 + Task 3 + Task 4; SSR/a11y → Task 1 + Task 6; deviations D1–D4 + §1a superseded + CHANGELOG → Task 5; out-of-scope (copy wording) enforced by Task 1 verbatim copy assertions. All 8 acceptance criteria mapped in Task 6 Step 4. No gaps.

**Placeholder scan:** none — every code step shows full content; coordinates/scrim are explicitly "starting values" with measured tuning tasks (3, 4), not vague TODOs.

**Type/name consistency:** `HeroSection`, `HeroOverlayCard`, `STAGE_W`/`STAGE_H`, `data-hero-card`, `/hero-bg.jpg`, `components/sections/hero.test.tsx` used identically across Tasks 1, 2, 4, 5, 6. `HeroOverlayCard` signature unchanged from the original. next/image mock prop list in Task 1 matches the `<Image>` props used in Task 2 (`fill`, `priority`, `sizes`).
