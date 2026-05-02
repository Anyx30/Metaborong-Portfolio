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

## Logo swap (2026-05-03 addendum)

Replaced text array with client logos in `public/clients/` (lowercased filenames). Each logo wraps in `<a target="_blank" rel="noopener noreferrer">` linking to the client's own site.

### Treatment evolution

**v1 attempt (rejected):** `grayscale + opacity-55` default → full color on hover. Failed because Nero and KGEN have pure-white path fills (`#FDFDFD`/`#FFFFFF`) — they were designed for dark backgrounds and rendered fully invisible on our white section bg. Grayscale doesn't help white-on-white. 5 of 10 source assets are raster bitmaps inside SVG wrappers (Figma exports with `<pattern>` + `<image href="data:...">`), so per-logo color tinting via `currentColor` was never possible.

**v2:** `filter: brightness(0)` on every logo — flattens any non-transparent pixel to pure black regardless of source. Default opacity 60% → hover/focus 100%. No color reveal.

**v3 final (2026-05-03):** Per-logo treatment unlocks color reveal on hover for assets that support it.

| Treatment | Default filter | Hover filter | Why |
|---|---|---|---|
| `keepSilhouette: true` | `brightness(0)` | `brightness(0)` | Source is white-on-transparent (Nero, KGEN). Removing the filter → invisible on white bg. |
| `softMute: true` | `grayscale(1)` | `none` | Source is a dense / fully-opaque badge (GetSmart token PNG). `brightness(0)` would flatten the whole badge to a black rectangle. Grayscale preserves the mark's silhouette while muting color. |
| default | `brightness(0)` | `none` | Vector or raster logos with transparent surrounds. Mute to silhouette by default; reveal full color on hover. |

Opacity rises 60% → 100% on hover/focus across all treatments. Color reveal was prioritized as part of the trust signal — a full-color logo on hover communicates "live brand link," not just decoration.

### Asset roster (2026-05-03)

| Logo | File | Treatment | Notes |
|---|---|---|---|
| KGEN | `kgen.svg` | keepSilhouette | White paths, dark on white only via filter |
| GetSmart | `getsmart.png` | softMute, scale 1.4 | Replaced from icon-only SVG; new asset is a colored token badge |
| Nero | `nero.svg` | keepSilhouette | White paths |
| Sedax | `sedax.svg` | default | Hardcoded `#4361EE` reveals as brand-blue |
| DDAF | `ddaf.svg` | default, scale 0.62 | Wordmark inherently wide |
| Near | `near.svg` | default, scale 0.95 | Fetched from Wikimedia (`Near_logo.svg`) — replaces Absolveme.AI |
| Diamante | `diamante.svg` | default | Raster bitmap inside SVG |
| OrbitX | `orbitx.svg` | default | Raster bitmap inside SVG |
| PredictRAM | `predictram.svg` | default | Raster bitmap inside SVG |
| magic | `magic.svg` | default | Raster bitmap inside SVG |

This commits to the master plan intent of "thin band, low visual weight, doesn't compete." A monochrome silhouette wall reads as restrained editorial proof, not a color showcase. Per `frontend-design`'s "pick a direction and commit" rule, this is the direction.

### Layout uniformity

Logos vary wildly in intrinsic dimensions (Sedax 401×95, GetSmart 42×43, Nero 548×130, DDAF 392×41). Without normalization the rendered widths spanned 42px → 459px in the marquee. Fix:

- Each logo lives in a fixed-size cell `width: 160px height: 48px` with `flex items-center justify-center`.
- The `<img>` inside is capped: `maxHeight: 28px (* per-logo scale)`, `maxWidth: 144px`, `object-contain`.
- Per-logo `scale` overrides for outliers — DDAF wordmark `0.62` (still wider than icon-based marks, but proportionate), GetSmart icon-only `1.15` (otherwise reads small).

### Asset edits

- **Stripped Figma placeholder rects** from `kgen.svg`, `diamante.svg`, `predictram.svg`. Each carried a `<rect width="56.3676" height="56.3676" rx="14.0919" fill="white" fill-opacity="0.2"/>` artifact that bloated the bounding box and (under `brightness(0)`) would have rendered as a dark translucent square covering the left third of the logo.
- **Dropped Absolveme.AI** from the marquee. Source asset is a 313×354 portrait headshot bitmap, not a logomark. Under `brightness(0)` it renders as a dark face silhouette — wrong tone for a trust bar. Re-add when a proper landscape logo is supplied.

### Other decisions

- **Image element:** plain `<img>`, not `next/image`. Marquee duplicates each logo so next/image optimization wouldn't help; SVG via next/image requires `dangerouslyAllowSVG: true` (CSP risk).
- **Container element:** `<ul>` of `<li>` items wrapping the `<a>` (semantic list of clients). Section gets `aria-label="Selected clients"`.
- **Gap:** 8px between cells (cells are 160px wide and already include their own padding around the logo).
- **Vertical padding:** `py-[28px]` (slight bump from 24px for visual breathing).
- **Edge fades:** widened to `w-24` (96px) to mask incoming/outgoing logos cleanly.

### Known limitations

- **DDAF** uses Figma `<foreignObject>` + `backdrop-filter:blur`. Under `brightness(0)` the artifact is invisible. May render oddly in older Safari; acceptable.
- **Wordmark vs icon-mark variance.** Even after per-logo scaling, wordmark logos (DDAF, NERO CHAIN, SEDAX, OrbitX, PredictRAM) read longer than icon-mark logos (GetSmart, Diamante, magic). This is inherent to the assets, not the layout.

## Out of scope

- Pause-on-hover for the marquee (not in master plan; logos do reveal color on individual hover).
- Per-logo size tuning (defer until visual review).
- Mobile-specific tuning beyond what the locked horizontal scale gives.
- Internal case-study pages as link targets (deferred — case studies don't exist yet, so links go to client sites).

## Notes

- `components/ui/section.tsx` is stale (uses `px-6 md:px-[80px]`, not the locked global scale). Flagged for a follow-up session before any other section adopts it.
