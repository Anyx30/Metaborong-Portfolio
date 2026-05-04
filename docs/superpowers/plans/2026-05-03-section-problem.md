# Plan — Problem section (Session 5)

Spec: `docs/superpowers/specs/2026-05-03-section-problem.md`.

## Steps

1. **Fix `<Section>` primitive** — `components/ui/section.tsx`: replace `px-6 md:px-[80px]` with `px-[24px] md:px-[48px] lg:px-[96px] xl:px-[128px]`. No other change. Verify zero existing callers (`grep -r "from.*ui/section"` → empty).

2. **Create `components/sections/problem.tsx`** — left-aligned editorial layout inside `<Section bg="default" maxWidth="prose">`:
   - 40×2px brand accent rule
   - `<Eyebrow>THE PROBLEM</Eyebrow>`
   - H2 (display scale: `text-[clamp(32px,4vw,52px)] font-bold tracking-[-0.035em] leading-[1.05] text-dark`)
   - Two pain paragraphs (`text-base text-gray leading-[1.65] tracking-[-0.01em]`)
   - Bridge paragraph (`text-base text-dark leading-[1.65] tracking-[-0.01em]`)
   - Vertical rhythm per spec D2.

3. **Wire into `app/page.tsx`** — import `ProblemSection`, render between `<TrustBar />` and `<ServicesSection />`.

4. **Verify** — `pnpm build` clean; `pnpm dev` renders correctly; no inline styles, no hex literals in the new file.

## Files touched

- `components/ui/section.tsx` (modify)
- `components/sections/problem.tsx` (create)
- `app/page.tsx` (modify — 1 import, 1 JSX line)

## Risks

None — `<Section>` has no callers, copy is approved, layout is conservative.
