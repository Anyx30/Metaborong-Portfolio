# Hero Section — Deviation Log

**Date:** 2026-05-10
**Section:** Hero (`components/sections/hero.tsx`)
**Master spec:** `DESIGN.md`

## Deviations from master plan

### 1. Two new infinite animations on the right column

`DESIGN.md` motion rule #1 caps infinite animations at three approved exceptions:
trust-bar marquee, orb HUD label cursor blink, hero scroll-cue bounce. The hero ASCII
visual adds two more.

#### 1a. SVG turbulence shimmer on `<Image>` (`hero-ascii-art.png`)

- Implementation: `app/globals.css` `.hero-ascii-image` applies `filter: url(#hero-ascii-shimmer)`. The filter is an inline SVG `<feTurbulence>` + `<feDisplacementMap>` chain in `components/sections/hero.tsx`. Two `<animate>` elements drive it: turbulence `seed` cycles `1;7;3;9;5;1` over 2.6s; displacement `scale` spikes `8→14→8` every 3s.
- Rationale: the ASCII still replaced the Three.js orb (commit `6f9abc8`). Without motion the right column reads as static decoration. The shimmer carries the "alive system" signal the orb used to.
- Cost control: IntersectionObserver flips `data-active="false"` on the image when the hero scrolls out of view, which sets `filter: none` and frees the compositor.
- Reduced motion: `@media (prefers-reduced-motion: reduce)` sets `filter: none` on `.hero-ascii-image`, which short-circuits the entire filter chain — the inner `<animate>` tags have no visual effect when nothing is filtered.

#### 1b. Glassmorphic overlay cards — loading/result cycle

- Implementation: `HeroOverlayCard` in `hero.tsx`. Three cards (AI / Web3 / SaaS) each loop `loading (gerund + spinner) → result label → loading…` indefinitely. 1500ms loading window, 6000ms result hold.
- Rationale: encodes the three pillars as live work-in-progress proofs anchored to the ASCII frame. Static labels would read as a legend; cycling labels read as instrumentation.
- Cost control: per-card IntersectionObserver pauses the cycle when the card scrolls out of view (`inViewRef`), mirroring the shimmer gate.
- Reduced motion: `prefers-reduced-motion: reduce` short-circuits the cycle to `phase='result'` on mount and never advances.

### 2. Hard constraints honored

- SSR/SEO: hero copy (eyebrow, H1 lines, AEO blockquote, CTAs) renders server-side. Right-column ASCII + cards are decorative (`aria-hidden="true"`) and SEO-irrelevant.
- ARIA: cards are `aria-hidden`. Image has empty `alt=""` (decorative).
- Mobile fallback: cards render at the same coordinates on mobile; ASCII frame scales via `w-[86%] h-[80%]`.
- `prefers-reduced-motion: reduce`: see 1a and 1b above.
- Brand color discipline: cards use white/black neutrals only; pillar identity comes from the loading-label vocabulary, not color.
- Focus-visible: cards are non-interactive — no focus surface required.

## Notes

- AEO blockquote is currently 44 words (down from the 56-word version locked in CHANGELOG Session 10). The shorter version drops verifiable facts (co-founders, eight products, 4–12 week timeline, US+Europe geo). Accepted as new lock 2026-05-10 per session decision; CHANGELOG updated.
- H1 clamp min lowered from 40px → 32px to prevent overflow at 320px viewport with `whitespace-nowrap`.
- [2026-05-18] Eyebrow live-availability dot **removed**. Its `heroLivePulse` infinite was an *undocumented* motion-rule-#1 violation — never in DESIGN.md's approved-infinite list nor this deviation log. Removing it is a net compliance gain (no longer a tracked deviation). Eyebrow retains its **original bordered chip** structure (the same-session hairline/flush-left redesign was reverted at user direction); only the dot was removed and the content updated to "Web3 & AI development studio". Hero infinite-animation surface is now just the two right-column deviations in §1 (and §1a's description is itself stale — the shimmer is now an MP4 video, not a PNG+SVG-filter; flagged, not corrected here).
