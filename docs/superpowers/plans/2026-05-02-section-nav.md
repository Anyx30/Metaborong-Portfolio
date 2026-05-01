# Section Plan — Nav

Implements `docs/superpowers/specs/2026-05-02-section-nav.md`.

## Steps

1. **Rewrite `components/layout/nav.tsx`** in one pass:
   - Update the `services` array to drop `color` and add `textClass` + `bgClass`.
   - Replace `<header style={...}>` with className-driven version: `fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow] duration-200` plus conditional classes for `bg-white/80` vs `bg-white/95 border-b border-border shadow-[0_1px_8px_rgba(0,0,0,0.06)]` based on `scrolled`. Keep `backdrop-blur-md` always.
   - Replace inner `<nav>` inline styles with `mx-auto max-w-[1280px] h-14 px-6 md:px-10 flex items-center gap-8`.
   - Replace desktop link cluster with `hidden md:flex items-center gap-6 flex-1`.
   - Services trigger button: `flex items-center gap-1 text-sm text-gray tracking-[-0.01em] font-[var(--font-brand)]` (bare button, no bg/border).
   - Chevron rotation: conditional class `transition-transform duration-150` + `rotate-180` when open.
   - Dropdown card: classes per spec.
   - Right-side `<Button>` wrapped in `hidden md:inline-flex` (or sibling) so it hides on mobile.
   - Hamburger button: `md:hidden text-gray` after the CTA wrapper.
   - Mobile sheet: `md:hidden border-t border-border bg-white px-6 py-4 flex flex-col gap-3` + each link uses `text-sm text-gray`/`text-dark` and resets `mobileOpen` on click.

2. **Verify build**: `pnpm build` (or `pnpm dev` smoke).

3. **Self-check** the file with `grep`:
   - No `style={{` remains.
   - No `#` followed by 3 or 6 hex chars remains.

## Risks

- Tailwind v4 must see class strings statically. Per-pillar `textClass`/`bgClass` are stored as plain strings in the `services` array literal, which is fine — Tailwind's source scan finds them.
- The hover row uses `bg-border-subtle` which corresponds to `--color-border-subtle: #f3f4f6` (matches the prior `#f9fafb` closely enough; spec value wins).
- `bg-white/80` is `rgba(255,255,255,0.8)` exactly; `bg-white/95` ≈ `0.95` (was `0.96`). Acceptable drift.
