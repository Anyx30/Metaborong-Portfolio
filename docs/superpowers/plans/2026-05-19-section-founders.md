# Founders Section Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `components/sections/founders.tsx` as the light, Figma-faithful team
E-E-A-T anchor (eyebrow chip → H2 → A3 lede → 3 founder cards with blueprint-framed
portrait/monogram, role chip, bio, brand-blue LinkedIn button), on the canonical
`<Section>` grid, with copy synced verbatim from the A3-locked source.

**Architecture:** Single presentational client-free component. `<Section bg="default"
maxWidth="xwide">` (auto-`<Reveal>`, canonical px chain). One inline `founders` data
array. One internal `FounderCard` for the repeated card. No new files, no new deps,
no edits outside `components/sections/founders.tsx`.

**Tech stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4 tokens
(`text-dark`, `text-gray`, `bg-bg`, `bg-bg-subtle`, `border-border`, `text-brand`,
`bg-brand`), existing `@/components/ui/section`, `@/components/ui/eyebrow`,
`@/components/ui/reveal` primitives.

**Source of truth:**
- Spec: `docs/superpowers/specs/2026-05-19-section-founders.md` (read its Deviations
  + Hard-constraints before coding).
- Copy: `docs/superpowers/specs/2026-05-19-founders-copy-audit.md` → "A3 sub-chain —
  locked copy" block (and `docs/content/homepage.md` Founders block). Sync **verbatim**.
- Figma reference: `docs/superpowers/assets/2026-05-19-founders-figma.png`
  (node `142:516`, file `mQsbMuw0spVgIu7jXirr3o`).

**Verification posture (project, not generic TDD):** marketing sections have **no
co-located unit tests** in this repo; they verify via `npx tsc --noEmit` + dev-server
visual QA at 1440/1280/375 + the spec's hard-constraint checks + a copy-diff
assertion. `npm run build` is expected to FAIL at `/blog/rss.xml` (pre-existing PR-#26
env hold) — not a regression, do not chase it.

---

## File structure

- **Modify (full rewrite):** `components/sections/founders.tsx` — the only file this
  plan touches. Was 47 lines (black bg, DiceBear avatars, raw `<section>`). Becomes:
  `founders` data array → `FounderCard` internal component → `FoundersSection` using
  `<Section>`.
- **Do NOT touch:** `app/page.tsx` (owns the external `#founders` span — anchor stays
  there; Section gets **no** `id`), `components/layout/nav.tsx`, `docs/content/homepage.md`
  (Founders block already A3-locked — read-only here), `DESIGN.md`, `CHANGELOG.md`,
  `lib/schema.ts` (Deviation 7 — deferred to main session).

---

## Task 1: Rewrite `founders.tsx` (data + Section scaffold + header)

**Files:**
- Modify (rewrite): `components/sections/founders.tsx`

- [ ] **Step 1: Replace the entire file with the data array + header scaffold**

Replace the full contents of `components/sections/founders.tsx` with the code below.
This task lands the data model, the `<Section>` wrapper (canonical grid, no `id`), and
the header (hero-consistent eyebrow chip, H2 with brand-blue "the work", A3 lede).
`FounderCard` is added in Task 2 — for now reference it; the file will not typecheck
until Task 2 (expected, verified at Task 3).

```tsx
import { Section } from '@/components/ui/section'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Reveal } from '@/components/ui/reveal'

type Founder = {
  name: string
  role: string
  bio: string
  /** Real photo path, or null → monogram fallback (spec Deviation 5). */
  image: string | null
  /** Verified LinkedIn URL, or null → no button (spec Deviation 6). */
  linkedin: string | null
}

// Copy synced verbatim from the A3-locked block in
// docs/superpowers/specs/2026-05-19-founders-copy-audit.md. Do not edit here —
// edit homepage.md + re-run the A3 chain, then re-sync.
const founders: Founder[] = [
  {
    name: 'Arnab Ray',
    role: 'CEO & Co-Founder',
    bio: 'Co-founded Metaborong and sets its direction across Web3 and AI engagements.',
    image: null,
    linkedin: 'https://linkedin.com/in/arnab-ray',
  },
  {
    name: 'Anik Ghosh',
    role: 'COO & Co-Founder',
    bio: 'Co-founded the studio; owns delivery and the scope discipline that keeps timelines honest.',
    image: '/anikfounderimage.png',
    linkedin: 'https://www.linkedin.com/in/anik-ghosh-01a985208/',
  },
  {
    name: 'Soumojit Ash',
    role: 'CTO & Co-Founder',
    bio: 'Co-founded the studio and owns the architecture under every Web3 protocol and AI system it ships.',
    image: null,
    linkedin: null,
  },
]

export function FoundersSection() {
  return (
    <Section bg="default" maxWidth="xwide">
      {/* Header */}
      <div className="flex flex-col gap-[20px] items-start">
        {/* Eyebrow chip — matched token-for-token to hero.tsx:50-54 (spec Deviation 2) */}
        <div className="inline-flex items-center bg-bg border border-border rounded-sm px-3 py-[6px] w-fit">
          <Eyebrow className="text-[12px]! tracking-[0.12em]!">The team</Eyebrow>
        </div>

        {/* H2 — "the work" in brand blue (Figma) */}
        <h2 className="text-[clamp(30px,4vw,56px)] font-bold tracking-[-0.03em] leading-[1.05] text-dark uppercase">
          The team behind <span className="text-brand">the work</span>
        </h2>

        {/* A3 lede */}
        <p className="max-w-[640px] text-[16px] leading-[1.65] tracking-[-0.01em] text-gray">
          Metaborong&apos;s three co-founders are hands-on in every Web3 and AI
          engagement. The work in our portfolio was built by us, not by a contracting
          layer we manage. You&apos;ll be in Slack with the people writing your code.
        </p>
      </div>

      {/* Card row */}
      <div className="mt-[48px] grid grid-cols-1 lg:grid-cols-3 gap-[48px]">
        {founders.map((founder, i) => (
          <Reveal key={founder.name} delay={i * 80}>
            <FounderCard founder={founder} />
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
```

- [ ] **Step 2: Verify the locked copy strings match exactly**

Run:
```bash
grep -n "Co-founded Metaborong and sets its direction across Web3 and AI engagements\.\|Co-founded the studio; owns delivery and the scope discipline that keeps timelines honest\.\|Co-founded the studio and owns the architecture under every Web3 protocol and AI system it ships\.\|Metaborong's three co-founders are hands-on in every Web3 and AI engagement" docs/content/homepage.md components/sections/founders.tsx
```
Expected: each bio/lede phrase appears in **both** `homepage.md` and `founders.tsx`
(verbatim parity). If any differ, fix `founders.tsx` to match `homepage.md` (homepage
is the source of truth).

---

## Task 2: Add the `FounderCard` component (blueprint frame, monogram, chip, LinkedIn 7-states)

**Files:**
- Modify: `components/sections/founders.tsx` (insert `FounderCard` + helper above
  `FoundersSection`, after the `founders` array)

- [ ] **Step 1: Add an initials helper + `FounderCard`**

Insert this block immediately after the `founders` array and before
`export function FoundersSection`:

```tsx
function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function FounderCard({ founder }: { founder: Founder }) {
  return (
    <div className="flex flex-col">
      {/* Photo tile — non-interactive/decorative (spec: only the LinkedIn button links).
          shadow.lg-class lift + dashed blueprint frame, pure CSS. */}
      <div className="relative aspect-square border border-border bg-white shadow-[0_12px_32px_-8px_rgba(0,0,0,0.12),0_6px_16px_-4px_rgba(0,0,0,0.06)]">
        {/* 4 dashed edge accents (Figma blueprint ticks) */}
        <span aria-hidden className="pointer-events-none absolute left-[8%] right-[8%] top-0 border-t border-dashed border-gray" />
        <span aria-hidden className="pointer-events-none absolute left-[8%] right-[8%] bottom-0 border-b border-dashed border-gray" />
        <span aria-hidden className="pointer-events-none absolute top-[8%] bottom-[8%] left-0 border-l border-dashed border-gray" />
        <span aria-hidden className="pointer-events-none absolute top-[8%] bottom-[8%] right-0 border-r border-dashed border-gray" />

        {/* Inset dashed frame holding the portrait/monogram */}
        <div className="absolute inset-[8%] border border-dashed border-gray overflow-hidden">
          {founder.image ? (
            <img
              src={founder.image}
              alt={`${founder.name} — ${founder.role}`}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              role="img"
              aria-label={founder.name}
              className="flex h-full w-full items-center justify-center bg-bg-subtle"
            >
              <span aria-hidden className="text-[64px] font-bold tracking-[-0.02em] text-gray">
                {initials(founder.name)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Name + role chip — chip never shrinks; stack on narrow to avoid collision */}
      <div className="mt-[20px] flex flex-col gap-[10px] sm:flex-row sm:items-center sm:justify-between sm:gap-[12px]">
        <h3 className="text-[20px] font-bold tracking-[-0.025em] text-dark">
          {founder.name}
        </h3>
        <div className="inline-flex shrink-0 items-center bg-bg-subtle border border-border rounded-sm px-3 py-[6px] w-fit">
          <Eyebrow as="span" className="text-[11px]! tracking-[0.1em]!">
            {founder.role}
          </Eyebrow>
        </div>
      </div>

      {/* Bio */}
      <p className="mt-[12px] text-[15px] leading-[1.6] tracking-[-0.01em] text-gray">
        {founder.bio}
      </p>

      {/* LinkedIn — brand-blue square button, 7 states. No URL → no button. */}
      {founder.linkedin && (
        <a
          href={founder.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${founder.name} on LinkedIn`}
          className="mt-[16px] inline-flex h-[44px] w-[44px] items-center justify-center border border-white bg-brand text-white transition-colors duration-[150ms] hover:bg-[#1f5fd0] active:bg-[#1a52b8]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zM8.34 18.34V9.94H5.56v8.4h2.78zM6.95 8.7a1.61 1.61 0 1 0 0-3.22 1.61 1.61 0 0 0 0 3.22zm11.39 9.64v-4.6c0-2.47-1.32-3.62-3.08-3.62a2.66 2.66 0 0 0-2.41 1.33h-.04V9.94H9.95c.04.79 0 8.4 0 8.4h2.78v-4.69c0-.25.02-.5.09-.68.2-.5.66-1.02 1.42-1.02 1 0 1.4.76 1.4 1.88v4.51h2.78z" />
          </svg>
        </a>
      )}
    </div>
  )
}
```

> **Note on `bg-[#1f5fd0]` / `bg-[#1a52b8]`:** these are the hover/active *darken*
> steps for `--color-brand` (#296ff0 → ~10% / ~15% darker), matching DESIGN.md's
> "Button finish" rule (no transform, 150ms, bg darkens on hover/active). They are
> derived shades of the brand token, not a new brand color — acceptable per the
> button signature spec. If a darken utility/token exists in `globals.css`, prefer it;
> otherwise these literal shades are the documented hover/active steps.

- [ ] **Step 2: Confirm 7-state coverage is satisfied**

Read the spec's Card → LinkedIn bullet. Confirm in the code: default (`bg-brand`),
hover (`hover:bg-[#1f5fd0]`), active (`active:bg-[#1a52b8]`), focus-visible (global
`:focus-visible` ring — no per-component override needed; do **not** add `outline-none`),
disabled/loading/error documented N/A (static external link). No code change if all
present; otherwise add the missing state class.

---

## Task 3: Typecheck + dev visual QA at 3 breakpoints

**Files:** none (verification only)

- [ ] **Step 1: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0, no errors. (If `Founder`/`FounderCard` ordering errors appear,
ensure `FounderCard` + `initials` are declared before `FoundersSection` in the file.)

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no new errors for `components/sections/founders.tsx`.

- [ ] **Step 3: Start dev server**

Run: `npm run dev` (port 3000). Leave running. **Never `rm -rf .next` while it runs**
(project gotcha — corrupts served CSS silently).

- [ ] **Step 4: Visual QA at 1440 / 1280 / 375**

Load `http://localhost:3000/#founders`. With agent-browser (or DevTools device
toolbar) measure the section box left/right edges at **1440**, **1280**, **375**.
Expected (matches nav + every other section, per master plan Verification):
- 1440: left edge 128px, right edge 1312px
- 1280: left edge 128px (xl) / 96px (lg) per the canonical chain, right within
  `max-w-[1280px]` centered
- 375: left/right gutter 16px; **no horizontal overflow**; cards stack 1-up; name +
  role chip stacked (not colliding)
- 1024+ (`lg`): 3 cards side by side, 48px gaps, no overflow

- [ ] **Step 5: Hard-constraint checks (spec "Hard constraints honored")**

- **SSR/crawlable:** `curl -s http://localhost:3000/ | grep -o "The team behind the work\|Metaborong's three co-founders\|Co-founded Metaborong"` → all present in raw HTML (copy is server-rendered, not client-only).
- **Reduced motion:** emulate `prefers-reduced-motion: reduce` → section is visible immediately (no hidden/blank reveal); no animation runs.
- **Focus-visible:** keyboard-Tab to each LinkedIn button → the global `2px --color-brand` ring renders at 2px offset; tab order is card1 → card2 → card3 (photos/monograms not focusable); Soumojit's card has **no** focusable LinkedIn (null URL).
- **Anchor:** `#founders` still scrolls to the section (external span in `app/page.tsx` untouched); confirm `founders.tsx` did **not** add `id="founders"`.
- **Contrast:** monogram initials (`text-gray` on `bg-bg-subtle`) and bio (`text-gray`) ≥ 4.5:1.

Record any failure; fix in `founders.tsx` only; re-run Steps 1 + 4 + 5.

---

## Task 4: Commit (single logical unit)

**Files:** `components/sections/founders.tsx`

- [ ] **Step 1: Stage only the component (do not `git add -A`)**

Run:
```bash
git add components/sections/founders.tsx
git status --porcelain
```
Expected: only `components/sections/founders.tsx` staged. (Spec/plan/audit/asset docs
are committed separately by the workflow, not in this code commit.)

- [ ] **Step 2: Commit**

Run:
```bash
git commit -m "feat(founders): Figma-driven redesign on canonical Section grid

Light team E-E-A-T section: hero-consistent eyebrow chip, H2 with brand
'the work', A3 lede, 3 founder cards (blueprint-framed portrait/monogram,
role chip, bio, brand-blue LinkedIn button, graceful no-URL degrade).
Copy synced verbatim from the A3 chain (homepage.md). Figma node 142:516.
Spec: docs/superpowers/specs/2026-05-19-section-founders.md

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

Per project memory: commit locally to the branch in logical units; **do not push**
unless the user explicitly asks.

---

## Self-review (against the spec)

- **Spec coverage:** light `<Section bg=default maxWidth=xwide>` grid ✓ (T1); eyebrow
  chip hero-matched ✓ (T1, Deviation 2); H2 brand "the work" ✓ (T1); A3 lede kept ✓
  (T1, Deviation 4); 3-up `lg:grid-cols-3 gap-[48px]` ✓ (T1, design-review fix);
  blueprint frame + 4 ticks ✓ (T2, Deviation 3 raster dropped); monogram fallback
  with `role="img"`/AA ✓ (T2, Deviation 5); name+role chip overflow-safe ✓ (T2);
  bio from A3 ✓ (T1/T2); LinkedIn square Bauhaus 7-states + ≥44px + rel + a11y name +
  graceful no-URL ✓ (T2, Deviation 6); photo non-interactive ✓ (T2, D1); no `id` on
  Section ✓ (T1, anchor correction); tokens only, no raw hex except documented
  brand-darken hover/active ✓; SSR/ARIA/reduced-motion/focus/contrast ✓ (T3).
  Deferred (not gaps): `lib/schema.ts` `sameAs` (Deviation 7 → main session);
  pending USER_INPUT real specifics + Soumojit URL.
- **Placeholder scan:** no TBD/TODO; all code complete; copy literal.
- **Type consistency:** `Founder` type, `founders: Founder[]`, `FounderCard({ founder
  }: { founder: Founder })`, `initials(name: string): string` consistent across tasks;
  `FounderCard`/`initials` declared before `FoundersSection` (T2 inserts above T1's
  export) — typecheck gates this at T3S1.
