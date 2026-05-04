# Problem Section — Signature Moment (Phrase Stamp)

## Context

The Problem section (`components/sections/problem.tsx`) shipped in Session 5 as a single editorial paragraph at 720px prose width. It works as copy but reads "article-like, bland" — no signature visual moment, no motion beyond the global `<Reveal>` fade-in. This spec adds the signature.

The locked direction (`memory/visual-direction-and-workflow.md`, 2026-05-04) requires each body section (4–13) to have **one signature visual moment + supporting motion**. Problem is Section 4 — first to receive the treatment. Hero, Nav, Trust bar above it are locked; signature moments live below.

Problem's job in the narrative: dramatize the agency-vs-freelancer trap. The "third option" (Metaborong as studio) is *not* revealed here — Services Section 6 absorbs that bridge.

## What this spec adds

A **phrase stamp** — a typographic emphasis treatment applied to the existing bridge phrase `treats the project like a ticket in a queue`, animated in after the section enters the viewport. The signature lives in the typographic state; motion stages how it arrives.

### At rest (final state, after motion completes)

- Phrase weight: 500 (medium), color `text-dark` (`#0a0a0a`)
- Hairline brand-blue underline (1px, `#204AF8`) sitting flush at the phrase baseline, full phrase width

The rest of the section is unchanged from current shipped state: 40×2px brand-blue accent rule, eyebrow, H2, body paragraph, 720px prose container, white background, left-aligned editorial typography.

### Motion (entry sequence)

The Problem section keeps its existing whole-section `<Reveal>` (opacity 0→1, translateY 8→0, 400ms cubic-bezier(0.16, 1, 0.3, 1), inherited via `<Section>`). The stamp animation fires **as a delayed second layer** off the same intersection trigger.

Timeline from intersection (50px before viewport, fires once):
- `t=0ms` — section reveal starts (existing behavior, unchanged)
- `t=400ms` — section reveal completes
- `t=600ms` — stamp animation begins:
  - Color: `#6b7280` (`text-gray`) → `#0a0a0a` (`text-dark`), 350ms ease
  - Weight: 400 → 500, 350ms ease
  - Underline: brand-blue 1px line draws left → right, 500ms cubic-bezier(0.16, 1, 0.3, 1)
- `t=1100ms` — stamp animation complete; phrase rests in final state

### Reduced motion

When `prefers-reduced-motion: reduce` is set:
- Section reveal collapses to instant (existing `<Reveal>` behavior)
- Stamp renders in **final state on mount** — no transitions, no underline draw. Phrase appears already weighted, colored, and underlined.

The phrase emphasis is semantically meaningful (it's the load-bearing line of the paragraph), so the final state must be visible regardless of motion preference.

## Why A1 (not per-element stagger)

A1 = section enters as one block (existing global motion grammar), stamp adds on top.
A2 = Problem opts out of global `<Reveal>`, runs internal stagger on rule/eyebrow/H2/body.

**A1 chosen.** Reasons:
1. Every other shipped section uses the global `<Reveal>`. Internal stagger here sets a precedent the rest of the page would have to chase, and inflates the motion budget across all 10 body sections.
2. The signature *is* the phrase stamp. Stagger would split attention between two motion gestures, weakening both.
3. Problem keeps cohering with the page's existing entry rhythm; the stamp is the one disciplined exception.

## Component shape

`components/sections/problem.tsx` keeps its current structure. One element changes: the `<strong>` wrapping the bridge phrase becomes a small client component (`PhraseStamp` or inline `'use client'` element) that owns the stamp animation.

```tsx
<Section bg="default" maxWidth="prose" id="problem">
  <div aria-hidden="true" className="w-[40px] h-[2px] bg-brand mb-[20px]" />
  <Eyebrow as="p">The problem</Eyebrow>
  <h2 className="...">Building in Web3 and AI is still too hard</h2>
  <p className="...">
    Most founders end up choosing between two bad options: a large agency that{' '}
    <PhraseStamp>treats the project like a ticket in a queue</PhraseStamp>
    , or a freelance team that lacks the architectural depth to ship
    something that scales. Either way, timelines slip and technical debt
    piles up before launch.
  </p>
</Section>
```

`PhraseStamp` is a small client component:
- Renders `<strong>` with the children inline (semantic emphasis preserved).
- Uses an `IntersectionObserver` on the section root or piggybacks via `data-` attribute / context. Implementation choice deferred to plan phase, but the simplest is: `PhraseStamp` registers its own observer with rootMargin `0px 0px -50px 0px`, threshold `0.1`. Fires once. Adds `data-played` (or class `played`) after a 600ms delay from intersection.
- All transitions driven by CSS keyed off `[data-played]` / class state.
- Reads `prefers-reduced-motion: reduce` once on mount; if true, sets the played state immediately.

The CSS lives co-located with the component (Tailwind arbitrary values + a tiny block of inline `<style jsx>` or a class in `globals.css` for the underline draw — final placement decided in plan).

## Tokens used

- `--color-brand` (#204AF8) — underline color
- `--color-dark` (#0a0a0a) — final phrase color
- `--color-gray` (#6b7280) — initial phrase color
- Existing motion easing `cubic-bezier(0.16, 1, 0.3, 1)` — already used by `<Reveal>`

No new tokens. No new primitives.

## What does NOT change

- Copy stays exactly as currently shipped (`docs/content/homepage.md:223–231`, the compressed Session 5 paragraph).
- Section uses `<Section maxWidth="prose">` — 720px, white bg.
- Top accent rule, eyebrow, H2, paragraph layout — unchanged.
- Section bg rhythm: Problem stays white between Trust bar (white) and Services (`bg-bg-subtle`).
- Hero, Nav, Trust bar — untouched.
- Master plan motion grammar — `<Reveal>` continues to govern global section entry. Stamp is an additive, section-local layer.
- The existing `<strong>` semantic emphasis — preserved (PhraseStamp renders `<strong>`).

## Out of scope

- Refactoring the rest of the section's typography, copy, or layout.
- Adding any other motion to the section beyond the stamp.
- Touching the bridge into Services (still Services Session 6's job to absorb).
- Per-element stagger (A2 — explicitly rejected above).
- A separate diagram, schematic, or graphic element (lane B/C — explicitly rejected in brainstorming).

## Verification

After implementation:
- `pnpm dev` → scroll Problem into viewport. Section reveals as one block (~400ms). At ~600ms after intersection, the bridge phrase animates: color darkens, weight thickens, brand-blue underline draws L→R over ~500ms. Total signature lands by ~1100ms after section enters viewport.
- Re-scroll past and back: stamp does not replay (fires once).
- DevTools → Rendering → Emulate `prefers-reduced-motion: reduce`. Reload. Section appears in final state with no transitions; bridge phrase is already weighted, colored, and underlined on mount.
- View source: `<strong>` wraps the bridge phrase (semantic emphasis preserved).
- No console errors. No CLS from the underline (use `background-image` linear-gradient or `::after` with `transform: scaleX`, not a layout-affecting border).

## Files touched

- `components/sections/problem.tsx` — minor: replace `<strong>` with `<PhraseStamp>`, otherwise unchanged.
- `components/sections/phrase-stamp.tsx` *(new)* — the small client component, ~40 lines.
- Possibly `app/globals.css` — only if a CSS keyframe/utility is cleaner than co-located styles. Decided in plan phase.

## Workflow chain

This spec is the output of `superpowers:brainstorming`. Next steps in the locked chain (`memory/visual-direction-and-workflow.md`):

1. `superpowers:writing-plans` — writes the implementation plan from this spec.
2. `/design-shotgun` — generates visual variants of the stamp treatment via gstack design binary (`~/.claude/skills/gstack/design/dist/design`).
3. `/plan-design-review` — rates the plan, surfaces gaps, fixes to 9–10/10.
4. Implementation: `/frontend-design` (visual) + `/frontend-patterns` (React structure) + `/landing-page-generator` (qualifies — Problem is being redone).
