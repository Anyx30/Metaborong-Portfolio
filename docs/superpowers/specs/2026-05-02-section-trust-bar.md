# Section Spec — Trust Bar

Inherits master plan: `docs/superpowers/specs/2026-05-01-homepage-restructure-master-design.md`.

## Job

Thin band sitting between Hero and Problem. Logos/project names scroll horizontally as proof of past work. Visual weight is intentionally low — it punctuates without competing.

## Locked decisions for this section

- **Container:** inline wrapper (not `<Section>` primitive). The `<Section>` primitive bakes in `py-[96px]` and the old `px-6 md:px-[80px]` horizontal scale, neither of which fits a thin band. Match the hero session pattern: build the wrapper inline using the locked horizontal scale.
- **Background:** `bg-bg` (white) — per locked rhythm Hero (subtle) → Trust bar (white) → Problem (white).
- **Borders:** `border-y border-border` (top + bottom hairline using the `--color-border` token).
- **Vertical padding:** `py-[24px]` — thin band.
- **Horizontal padding:** `px-[24px] md:px-[48px] lg:px-[96px] xl:px-[128px]` — uniform with nav and hero.
- **Marquee:** keep the 24s linear infinite scroll. Move the `@keyframes trustBarScroll` definition out of inline `<style>` and into `app/globals.css` so the component file is JSX only.
- **Item type:** 14px (`text-sm`), weight 500, `text-gray` (`#676767`), tracking `-0.01em`, `whitespace-nowrap`. Spec called for "14px font, gray-500" — `text-gray` is the project's equivalent of gray-500.
- **Edge fade:** 80px-wide gradients on left/right that fade from `bg-bg` to transparent. Express via Tailwind arbitrary value: `bg-gradient-to-r from-bg to-transparent` / `bg-gradient-to-l from-bg to-transparent`.
- **Gap between items:** 48px (`gap-[48px]`).

## Out of scope

- Replacing project name strings with logo SVGs (deferred — content layer).
- Pause-on-hover (not in master plan).
- Mobile-specific tuning beyond what the locked horizontal scale gives.

## Notes

- `components/ui/section.tsx` is stale (uses `px-6 md:px-[80px]`, not the locked global scale). Flagged for a follow-up session before any other section adopts it.
