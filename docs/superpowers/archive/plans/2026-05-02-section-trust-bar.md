# Plan — Trust Bar refactor

Scope: `components/sections/trust-bar.tsx` + small addition to `app/globals.css`.

## Steps

1. **Move keyframes to globals.** Add `@keyframes trustBarScroll { from { transform: translateX(0) } to { transform: translateX(-50%) } }` to `app/globals.css` near other keyframes. Remove inline `<style>` block from the component.
2. **Rewrite the component** with Tailwind classes only, no inline styles, no hex literals:
   - Outer `<section>`: `relative overflow-hidden border-y border-border bg-bg py-[24px] px-[24px] md:px-[48px] lg:px-[96px] xl:px-[128px]`.
   - Left fade overlay: `pointer-events-none absolute inset-y-0 left-0 z-[2] w-20 bg-gradient-to-r from-bg to-transparent`.
   - Right fade overlay: mirror with `right-0` and `bg-gradient-to-l`.
   - Track: `flex w-max gap-[48px]` with inline `style={{ animation: 'trustBarScroll 24s linear infinite' }}` — animation name is a string reference to the global keyframe; this is the only style attribute that survives because Tailwind has no first-class custom-animation utility unless we register it in `@theme`. (Acceptable: master plan permits `style={{}}` "where dynamic computation requires it" — animation registration is comparable; the semantic intent is class-driven, the style is one declaration referencing a globally defined keyframe.)
   - Items: `<span className="text-sm font-medium text-gray tracking-[-0.01em] whitespace-nowrap">`.
3. **Verify.** `pnpm build`, `pnpm dev`, visual check for white bg, hairline borders, scroll animation, no console errors.

## Risk note on the `style` exception

The master plan says no inline `style={{}}` "except where dynamic computation requires it." Strictly, the marquee is not dynamic. To stay clean we could register the animation in `@theme` via `--animate-marquee: trustBarScroll 24s linear infinite` and then use `animate-marquee`. Tailwind v4 supports this.

**Decision: register the animation in `@theme`.** It's a one-line addition and keeps the JSX 100% class-driven, which matches the spec letter and spirit.
