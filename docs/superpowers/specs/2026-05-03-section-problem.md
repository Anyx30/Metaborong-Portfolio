# Spec — Problem section (Session 5)

Inherits master plan: `2026-05-01-homepage-restructure-master-design.md`. Only Problem-specific decisions documented here.

## Goal

Net-new section between Trust bar and Services. Names the buyer's pain (agency-vs-freelance trap, Web3/AI moves faster than traditional cycles), then bridges into Services with a one-line solution intro. The first moment the page speaks *to* the founder rather than *about* the studio.

## Copy (compressed 2026-05-04 — see "Copy compression" below)

- **Eyebrow:** `THE PROBLEM`
- **H2:** `Building in Web3 and AI is still too hard`
- **Pain ¶ (single):** "Most founders end up choosing between two bad options: a large agency that **treats the project like a ticket in a queue**, or a freelance team that lacks the architectural depth to ship something that scales. Either way, timelines slip and technical debt piles up before launch."
  - The phrase `treats the project like a ticket in a queue` is rendered with `font-medium text-dark` (vs `text-gray` body) to give the eye a typographic anchor in the short paragraph.

### Copy compression

Original spec called for three paragraphs (two pain + one bridge) lifted from `docs/content/homepage.md:223-231`. After review on 2026-05-04, compressed to a single pain paragraph because:

1. **Conversion goal is "book a call"** — short funnel.
2. **Mixed traffic (cold + warm)** — warm buyers already feel the pain; long Problem reads as over-explaining.
3. **Agency-vs-freelance trap is one of several positioning hooks**, not THE hook — section is supporting evidence, not centerpiece.
4. **Bridge paragraph removed** — it was doing Services' introduction job. Services Section 6 must absorb that role (see master plan amendment).
5. **Second pain paragraph removed** — "DeFi protocols change / Agentic AI frameworks are still maturing" was the weakest beat (audience-known truisms).

Net: ~120 words section instead of ~200. Premium pause rhythm preserved; funnel pace improved.

## Decisions (Session 5)

### D1 — Use the `<Section>` primitive (fix it first)

`components/ui/section.tsx` currently uses stale horizontal padding `px-6 md:px-[80px]`. Update to the locked 4-step scale `px-[24px] md:px-[48px] lg:px-[96px] xl:px-[128px]`. No callers exist, so the change is risk-free. Problem section is the first adopter.

`maxWidth="prose"` (760px) matches the locked narrow-prose width for narrative-heavy content.

### D2 — Editorial left-aligned treatment

- All content left-aligned within the 760px column (not centered).
- A 2px brand-blue accent rule (`w-[40px] h-[2px] bg-brand`) sits above the eyebrow with `mb-[20px]` between rule and eyebrow.
- Eyebrow → H2: `mb-[24px]`.
- H2 → first paragraph: `mb-[32px]`.
- Paragraph → paragraph: `mb-[24px]`.
- Bridge paragraph visually distinguished with `text-dark` (vs `text-gray` for pain paragraphs) — signals the tonal turn from problem to solution. No italic, no border, no callout — restraint per master plan motion grammar.

### D3 — Background

`bg-bg` (white) per the locked rhythm: Hero subtle → Trust bar white → **Problem white** → Services subtle.

### D4 — Vertical padding

Inherits `py-[96px]` from `<Section>`. No deviation.

## Out of scope

- No motion this session (master plan defers to a single global enter animation).
- No mobile-specific tweaks beyond what `<Section>` and arbitrary-class scale provide.
- No primitive expansion beyond the `<Section>` horizontal-padding fix.

## Verification

- `pnpm build` clean.
- `pnpm dev`: section renders at `/` between Trust bar and Services with no console errors.
- No inline `style={{}}`, no `#hex` literals in `components/sections/problem.tsx`.
- Prose column width visually correct at 1440px (centered, ample side gutter) and at 375px (24px side padding).
- `<Section>` callers (currently zero → one after this session) all render correctly.
