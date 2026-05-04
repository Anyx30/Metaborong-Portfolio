# Section Spec — Nav

Inherits the master plan at `docs/superpowers/specs/2026-05-01-homepage-restructure-master-design.md`. This document records only nav-specific decisions.

## Scope

Refactor `components/layout/nav.tsx`:
- Migrate every inline `style={{}}` to Tailwind classes referencing `@theme` tokens.
- Remove all hex literals from the file (including the `#10b981` AI-pillar literal and the per-pillar `color` strings in the `services` data).
- Restyle the desktop services dropdown card to match `<Card>`: `border border-border`, `rounded-lg`, white bg, same hover lift/border treatment as `Card`.
- Fix the mobile hamburger trigger: currently `display: 'none'`, never visible. Make it visible below `md` and hidden at `md+`. The desktop links + CTA should be hidden below `md` and visible at `md+`.

## Layout — unchanged

- Sticky frosted-glass `<header>` (`fixed inset-x-0 top-0 z-50`).
- 56px tall inner `<nav>`, `max-w-[1280px]`, horizontal padding `px-6 md:px-10`.
- Scroll state still toggles bg opacity (0.8 → 0.96), bottom border, and shadow.

## Token mapping

| Was (hex) | Now |
|---|---|
| `#e5e7eb` (border) | `border-border` / `border-t-border` |
| `#676767` (link text) | `text-gray` |
| `#999999` (sub text) | `text-gray-light` |
| `#303030` (mobile pillar label) | `text-dark` |
| `#f9fafb` (dropdown row hover) | `hover:bg-border-subtle` |
| `#fff` (dropdown bg, mobile sheet bg) | `bg-white` |
| `#204AF8` / `#10b981` / `#F6851B` (per-pillar) | `text-brand` / `text-ai` / `text-accent` and `bg-brand` / `bg-ai` / `bg-accent` via class fields on the `services` data |

The frosted-glass background uses `rgba(255,255,255,*)` opacity values that are not tokens; encode them with Tailwind opacity-modifier classes (`bg-white/80`, `bg-white/95`) — these are arbitrary but semantically correct and contain no hex.

## Pillar data shape

```ts
const services = [
  { pillar, sub, href, textClass, bgClass }, // textClass: text-brand|text-ai|text-accent
]
```

Driven by class strings rather than hex so the file stays hex-free and Tailwind picks them up at build (since they are statically present as literal strings).

## Dropdown card

- Wrapper: `absolute top-[calc(100%+8px)] left-0 w-[260px] bg-white border border-border rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.1)] p-2`.
- Row: `flex items-start gap-3 px-3 py-2.5 rounded-md hover:bg-border-subtle transition-colors`.
- Pillar dot: `w-2 h-2 rounded-sm shrink-0 mt-[5px]` + `bgClass`.
- Pillar label: `text-[13px] font-semibold tracking-[-0.01em]` + `textClass`.
- Sub text: `text-[11px] text-gray-light mt-0.5`.

(The `<Card>` primitive itself isn't reused because the dropdown is a popover, not a content card; we mirror its border/radius/hover treatment instead. This matches the master-plan instruction "uses same border + radius as `<Card>`".)

## Hamburger / mobile sheet

- Hamburger button: `md:hidden` (visible mobile, hidden desktop).
- Desktop link cluster + CTA: `hidden md:flex` (hidden mobile, visible desktop).
- Mobile sheet: `md:hidden` so it never opens on desktop. Closes on link tap (`onClick` on each anchor sets `mobileOpen=false`).

## Out of scope

- No new links, no logo change, no color updates.
- No animation tweaks beyond removing inline `transition`.
