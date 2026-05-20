# ContactCta Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans
> to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.
> **Verification posture:** project-standard `tsc --noEmit` + `pnpm dev` visual
> QA at 1440/1280/375 + SSR/a11y/reduced-motion checks (NOT Vitest — section
> components are visually QA'd here; `npm run build` is expected to fail at
> `/blog/rss.xml`, PR-#26 env hold, NOT a regression). Spec is the source of
> truth: `docs/superpowers/specs/2026-05-19-section-contact-cta.md`.

**Goal:** Rebuild `components/sections/contact-cta.tsx` from dark to the light,
Figma-faithful (`233:261`) final CTA on the canonical `<Section>` grid, syncing
the A3-locked copy verbatim from `homepage.md`.

**Architecture:** `<Section bg="default" maxWidth="xwide">` (light, auto-Reveal,
verified API `section.tsx:5,21`). Children = a `relative` wrapper holding (1) a
bottom-anchored optimized ASCII-hills `<img>` (decorative) and (2) the centered
content stack (H2 → sub → split-arrow primary → risk reducer → secondary). No
`id` on the section (`#contact` span lives in `app/page.tsx:80`; do not touch
`app/page.tsx`).

**Tech Stack:** Next 16 / React 19 / TS / Tailwind v4 tokens (`bg-bg`,
`text-dark`, `text-gray`, `text-gray-light`, `bg-brand`, `--duration-instant`).

---

### Task 1: Source + optimize the ASCII-hills asset

**Files:**
- Source (already captured): `docs/superpowers/assets/2026-05-19-contact-ascii-hills-figma.png` (4096×2305, 9.7 MB — DO NOT ship)
- Create: `public/contact/ascii-hills.webp`

- [ ] **Step 1: Create the public dir**

```bash
mkdir -p public/contact
```

- [ ] **Step 2: Resize + convert to webp** (retina-sized for the ~1240px render box; target < 250 KB)

```bash
# Prefer cwebp; fall back to sharp-cli via npx if cwebp absent.
if command -v cwebp >/dev/null 2>&1; then
  # downscale to 1600px wide first with sips (macOS), then cwebp q=72
  cp docs/superpowers/assets/2026-05-19-contact-ascii-hills-figma.png /tmp/ah.png
  sips --resampleWidth 1600 /tmp/ah.png --out /tmp/ah-1600.png >/dev/null
  cwebp -q 72 /tmp/ah-1600.png -o public/contact/ascii-hills.webp
else
  npx --yes sharp-cli@latest -i docs/superpowers/assets/2026-05-19-contact-ascii-hills-figma.png -o public/contact/ascii-hills.webp resize 1600 --format webp --quality 72
fi
```

- [ ] **Step 3: Verify size + dimensions**

Run: `ls -lh public/contact/ascii-hills.webp && file public/contact/ascii-hills.webp`
Expected: a webp, well under ~250 KB, ~1600px wide. If it is still large,
re-run Step 2 with `-q 60` (cwebp) / `--quality 60` (sharp).

- [ ] **Step 4: Commit (webp only — NOT the 9.7 MB raw PNG)**

The raw capture stays a **local-only** working file (do not add it to git —
9.7 MB in history forever is unacceptable; provenance is the Figma node id
`237:341` recorded in the spec). Only the optimized webp ships.

```bash
git add public/contact/ascii-hills.webp
git commit -m "feat(contact-cta): add optimized ASCII-hills asset (from Figma 237:341)"
```

---

### Task 2: Rebuild `contact-cta.tsx` + sync copy

**Files:**
- Modify (full rewrite): `components/sections/contact-cta.tsx`
- Reference (verbatim copy source, do NOT edit): `docs/content/homepage.md` §[CONTACT CTA — light section]

- [ ] **Step 1: Replace the file with the light redesign**

Exact content for `components/sections/contact-cta.tsx`:

```tsx
import { Section } from '@/components/ui/section'

export function ContactCtaSection() {
  return (
    <Section bg="default" maxWidth="xwide">
      <div className="relative isolate text-center">
        {/* Decorative ASCII-hills raster, anchored to the content-box bottom.
            Figma 233:261 (frame ≈ content width, not viewport-bleed). Static,
            aria-hidden; section is fully legible on bg-bg without it. */}
        <img
          src="/contact/ascii-hills.webp"
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="pointer-events-none absolute inset-x-0 bottom-[-48px] -z-10 mx-auto w-full select-none object-cover object-bottom md:bottom-[-64px] lg:bottom-[-72px]"
        />
        <div className="mx-auto max-w-[640px]">
          <h2 className="text-[clamp(34px,5vw,56px)] font-black uppercase leading-[1.03] tracking-[-0.03em] text-dark">
            Tell us the build. We&apos;ll send the approach.
          </h2>
          <p className="mx-auto mt-[20px] max-w-[560px] text-[16px] leading-[1.6] tracking-[-0.01em] text-gray">
            No pitch deck, no discovery-call gauntlet — a written approach to your Web3 or AI build, straight from a founder.
          </p>
          <div className="mt-[32px] flex flex-col items-center gap-[16px]">
            <a
              href="mailto:contact@metaborong.com?subject=New%20project%20inquiry"
              className="group inline-flex min-h-[44px] items-stretch justify-center text-[15px] font-semibold tracking-[-0.01em] text-white no-underline [font-feature-settings:'tnum'] transition-[background-color] duration-[var(--duration-instant)]"
            >
              <span className="flex items-center bg-brand px-[22px] py-[12px] group-hover:bg-brand/90 group-active:bg-brand/85">
                Email us
              </span>
              <span
                aria-hidden="true"
                className="flex items-center border-l border-white/15 bg-white/10 px-[16px] py-[12px] group-hover:bg-white/15"
              >
                →
              </span>
            </a>
            <p className="text-[13px] tracking-[-0.005em] text-gray-light">
              Most teams hear back within 12 hours.
            </p>
          </div>
          <a
            href="mailto:contact@metaborong.com"
            className="mt-[20px] inline-block text-[14px] tracking-[-0.01em] text-gray no-underline transition-[color] duration-[var(--duration-instant)] hover:text-dark"
          >
            contact@metaborong.com
          </a>
        </div>
      </div>
    </Section>
  )
}
```

- [ ] **Step 2: Confirm copy is byte-identical to `homepage.md`**

Run: `grep -n "straight from a founder\|Tell us the build\|Most teams hear back within 12 hours" docs/content/homepage.md components/sections/contact-cta.tsx`
Expected: H2, sub, and risk-reducer strings match the `homepage.md` §[CONTACT
CTA — light section] block verbatim (no em dash, comma per guardrails).

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0 (no new errors).

- [ ] **Step 4: Commit**

```bash
git add components/sections/contact-cta.tsx
git commit -m "feat(contact-cta): dark→light Figma redesign + A3 copy sync"
```

---

### Task 3: Verify (project posture) + design-review prep

**Files:** none (QA only)

- [ ] **Step 1: Start dev server on a free port**

Run: `PORT=3099 pnpm dev` (background; pick another free port if taken — see memory `feedback-parallel-worktree-dev-ports`).

- [ ] **Step 2: SSR markup assertion**

Run: `curl -s localhost:3099 | grep -o "Tell us the build[^<]*\|straight from a founder\|Email us"`
Expected: all three strings present in the server HTML (crawlable, not
client-only).

- [ ] **Step 3: Visual QA at 1440 / 1280 / 375**

Scroll to the final CTA. Verify against the spec:
- Light section; centered H2 (uppercase) → sub → split-arrow "Email us" button → "Most teams hear back within 12 hours." → `contact@metaborong.com`.
- ASCII-hills raster sits at the section bottom behind the stack, no horizontal overflow at 375, does not occlude/!cover the button hit area, text contrast stays AA over it.
- Left/right edges align with nav + other sections (128/1312 @1440, 128/1152 @1280, 16/359 @375).
- Button hover darkens (no transform); keyboard focus shows the global `2px --color-brand` ring (Tab to the button) and the ring is visible on the light bg.

- [ ] **Step 4: Reduced-motion check**

DevTools → Rendering → emulate `prefers-reduced-motion: reduce`. Reload.
Expected: `<Section>` Reveal short-circuits to visible; raster is static (no
animation). Nothing animates.

- [ ] **Step 5: Note any subjective placement for live-candidate pick**

If the raster's vertical anchor / crop is debatable, prepare 2–3 labeled
variants on the live page for the user to choose (memory rule: subjective
placement → candidate-pick, never blind-iterate). Do not burn reject cycles
eyeballing.

- [ ] **Step 6: Stop the dev server**

---

## Self-Review

- **Spec coverage:** dark→light (Task 2), `<Section bg=default maxWidth=xwide>`
  (Task 2), A3 copy verbatim (Task 2 Step 2), split-arrow ≤3-word CTA (Task 2),
  ASCII asset exported+optimized (Task 1, Deviation 4), SSR/a11y/reduced-motion
  (Task 3), no `id` on section (Task 2 — none set). All spec items mapped.
- **Placeholders:** none — full JSX + exact commands provided.
- **Type consistency:** single component, no cross-task type drift.
- **Open:** raster bottom offsets (`bottom-[-48/-64/-72px]`) negate the
  `<Section>` py so the raster meets the true section edge — verify visually in
  Task 3; adjust to `bottom-0` if the negative bleed looks wrong (live-candidate
  decision, Task 3 Step 5).
