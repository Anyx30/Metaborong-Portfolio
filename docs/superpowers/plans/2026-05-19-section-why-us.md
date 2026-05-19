# Why-Us Section Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to
> implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reimplement `WhyUsSection` to match Figma node `112:1787` (canonical
`<Section>` grid, bordered eyebrow chip, UPPERCASE headings, stat-chip cascade, 3
flush bordered illustration columns) with **zero copy changes**.

**Architecture:** One presentational TSX component. The frozen `reasons` array gains
an `image` field only; every copy string, the `ext()` helper, `projectLinkStyle`, the
Clutch badge, and meta stats are preserved byte-identical. Layout switches from a
hand-rolled `<section>` to the `<Section bg="subtle" maxWidth="xwide">` primitive
(canonical grid + auto-`<Reveal>`).

**Tech Stack:** Next.js 16 / React 19 / TypeScript / Tailwind v4. `lucide-react`
(`Zap`, `CalendarDays`). `sharp` (asset conversion). Plain `<img>` (project
convention — no `next/image`).

**Verification posture (project-specific, overrides the skill's TDD default):** Per
`CLAUDE.md` + the master plan, presentational sections are verified with
`npx tsc --noEmit` + dev QA + a copy-diff assertion + `/design-review` — **not**
Vitest unit tests. `npm run build` is expected to fail at `/blog/rss.xml`
(pre-existing PR-#26 env hold) and is **not** chased.

**Pre-existing issues flagged (not fixed — out of scope, frozen-adjacent):**
`projectLinkStyle` hardcodes `#296ff0` / `rgba(41,111,240,.4)` and `reasons[].color`
hardcodes `#296ff0` — raw brand-hex bypasses of the `--color-brand` token. These are
**pre-existing** and part of the frozen link contract; preserved verbatim, surfaced
here per the brand-color-caveats memory rule. Do not "fix" in this task.

---

## File Structure

- **Modify:** `components/sections/why-us.tsx` — the only component file (this
  worktree owns it). Full rewrite of the JSX; data + helpers preserved.
- **Replace:** `public/whyus/{speed,product-thinking,niche-depth}.png` →
  `.webp` (resized). No other assets.
- **Untouched:** `app/page.tsx` (import + `<WhyUsSection />` at line 71 unchanged —
  same export name), `nav.tsx` (no why-us anchor exists; none added), `DESIGN.md`,
  `CHANGELOG.md` (canonical edits happen in the coordinator session at merge).

The section has **no `id`/anchor** today (verified) — none is added (surgical).

---

## Task 1: Optimize illustration assets (resize → WebP)

**Files:**
- Replace: `public/whyus/speed.png` → `public/whyus/speed.webp`
- Replace: `public/whyus/product-thinking.png` → `public/whyus/product-thinking.webp`
- Replace: `public/whyus/niche-depth.png` → `public/whyus/niche-depth.webp`

- [ ] **Step 1: Convert + resize all three with sharp**

Run (from repo root):

```bash
node -e '
const sharp = require("sharp");
const f = ["speed","product-thinking","niche-depth"];
Promise.all(f.map(n =>
  sharp("public/whyus/"+n+".png")
    .resize(800, 800, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile("public/whyus/"+n+".webp")
)).then(r => r.forEach((m,i) => console.log(f[i]+".webp", m.width+"x"+m.height, Math.round(m.size/1024)+"KB")));
'
```

Expected output (sizes approximate): three lines like
`speed.webp 800x800 ~40KB` — each well under 80KB, ≤ 800px.

- [ ] **Step 2: Remove the source PNGs**

```bash
rm public/whyus/speed.png public/whyus/product-thinking.png public/whyus/niche-depth.png
ls public/whyus/
```

Expected: only `niche-depth.webp  product-thinking.webp  speed.webp`.

- [ ] **Step 3: Commit**

```bash
git add public/whyus/
git commit -m "perf(why-us): resize illustrations to 800px WebP

D1 decision: ~2MB PNG -> tens of KB WebP, visually identical at
the ~400px render size. Keeps the plain-<img> convention.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Capture the frozen-copy baseline (diff anchor)

**Files:**
- Create: `/tmp/why-us-copy-baseline.txt` (scratch, not committed)

- [ ] **Step 1: Snapshot every frozen string from the CURRENT component**

```bash
git show HEAD:components/sections/why-us.tsx \
  | grep -oE "'[^']*'|\`[^\`]*\`|>[^<>{}]+<" \
  | sed "s/^>//;s/<$//" | sed "s/^'//;s/'$//;s/^\`//;s/\`$//" \
  | grep -vE '^\s*$|^@/|React\.|color:|#|rgba|underline|500|3px|1px|none' \
  | sort -u > /tmp/why-us-copy-baseline.txt
cat /tmp/why-us-copy-baseline.txt
```

Expected: the visible copy tokens — `Why us`, `Why founders choose Metaborong`,
the lede, `4.9`, `★★★★★`, `on Clutch`, `Reply within 12h`, `4–12 weeks to ship`,
`Speed`, `Product thinking`, `Niche depth`, the three titles, the three bodies,
`AbsolveMe`, `SunsetML`, `OrbitXPay`, `PredictRAM`. This file is the Task 5 anchor.
(No commit — scratch artifact.)

---

## Task 3: Rewrite `why-us.tsx` — header (Section grid + chip + UPPERCASE H2 + cascade)

**Files:**
- Modify: `components/sections/why-us.tsx`

- [ ] **Step 1: Replace the entire file with the new implementation**

The `reasons` array, `ext()` helper, and `projectLinkStyle` are **preserved
byte-identical** from the current file; only an `image` key is added per entry and
the JSX/imports change. Full file:

```tsx
import { clutchProfileUrl } from '@/lib/links'
import { Section } from '@/components/ui/section'
import { Zap, CalendarDays } from 'lucide-react'

const projectLinkStyle: React.CSSProperties = {
  color: '#296ff0',
  textDecoration: 'underline',
  textUnderlineOffset: '3px',
  textDecorationThickness: '1px',
  textDecorationColor: 'rgba(41, 111, 240, 0.4)',
  fontWeight: 500,
}

const ext = (label: string, href: string) => (
  <a href={href} target="_blank" rel="noopener noreferrer" style={projectLinkStyle}>
    {label}
  </a>
)

const reasons = [
  {
    tag: 'Speed',
    color: '#296ff0',
    image: '/whyus/speed.webp',
    title: 'First working version in weeks',
    body: (
      <>
        Lean senior team, no account-manager layer. {ext('AbsolveMe', 'https://www.absolveme.ai/')} needed its launch site live before the liquidity window closed. Site, content, and design support shipped in 2 days. The Solana–NEAR cross-chain layer followed in 5 more.
      </>
    ),
  },
  {
    tag: 'Product thinking',
    color: '#296ff0',
    image: '/whyus/product-thinking.webp',
    title: 'We stress-test the brief before we build',
    body: (
      <>
        Spec gaps get named. Simpler approaches get raised. {ext('SunsetML', 'https://www.sunsetml.com/')} came to us with an AI writing-tool concept. We iterated the architecture with the founder across multiple planning rounds, and stayed on as equity co-founders.
      </>
    ),
  },
  {
    tag: 'Niche depth',
    color: '#296ff0',
    image: '/whyus/niche-depth.webp',
    title: 'Multichain Web3 and production-grade AI agents',
    body: (
      <>
        Smart contracts shipped on Ethereum, Solana, Base, Arbitrum, Hyperledger, Polygon, and Avalanche, including {ext('OrbitXPay', 'https://orbitxpay.com/')}&rsquo;s DeFi-banking module with multi-layer orchestration. AI agent orchestration in production at {ext('SunsetML', 'https://www.sunsetml.com/')} and {ext('PredictRAM', 'https://predictram.com/')}.
      </>
    ),
  },
]

export function WhyUsSection() {
  return (
    <Section bg="subtle" maxWidth="xwide">
      <div className="flex flex-col gap-[40px] lg:flex-row lg:items-start lg:justify-between lg:gap-[48px]">
        <div className="flex max-w-[720px] flex-col gap-[20px]">
          <span className="inline-flex w-fit items-center border border-border bg-bg px-[10px] py-[7px] font-mono text-[12px] font-medium uppercase leading-none tracking-[0.1em] text-gray">
            Why us
          </span>
          <h2 className="text-[clamp(32px,4vw,52px)] font-bold uppercase leading-[1.05] tracking-[-0.035em] text-dark">
            Why founders choose <span className="text-brand">Metaborong</span>
          </h2>
          <p className="max-w-[640px] text-[16px] leading-[1.65] tracking-[-0.01em] text-gray">
            Founders pick Metaborong over larger Web3 and AI agencies for three reasons: shorter time to a first working version, sharper push-back on the brief, and the specialist depth — multichain protocols and AI agent orchestration — most studios don&apos;t have.
          </p>
        </div>

        <div className="flex flex-col gap-[12px] sm:flex-row sm:flex-wrap lg:flex-col lg:items-end lg:gap-[14px]">
          <a
            href={clutchProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center gap-[6px] border border-border bg-bg px-[14px] text-[14px] tracking-[-0.005em] no-underline lg:translate-x-[-40px]"
          >
            <span className="font-semibold text-dark tabular-nums">4.9</span>
            <span aria-label="5 out of 5 stars" className="text-[12px] leading-none tracking-[1px] text-[#F6851B]">★★★★★</span>
            <span className="font-medium text-gray">on Clutch</span>
          </a>
          <span className="inline-flex min-h-[44px] items-center gap-[8px] border border-border bg-bg px-[14px] text-[14px] font-semibold tracking-[-0.005em] text-dark">
            <Zap aria-hidden="true" className="size-[16px] shrink-0 text-gray" strokeWidth={2} />
            Reply within 12h
          </span>
          <span className="inline-flex min-h-[44px] items-center gap-[8px] border border-border bg-bg px-[14px] text-[14px] font-semibold tracking-[-0.005em] text-dark lg:translate-x-[-20px]">
            <CalendarDays aria-hidden="true" className="size-[16px] shrink-0 text-gray" strokeWidth={2} />
            4–12 weeks to ship
          </span>
        </div>
      </div>

      <div className="mt-[40px] grid grid-cols-1 border border-border md:mt-[56px] md:grid-cols-3">
        {reasons.map((r, i) => (
          <div
            key={r.tag}
            className={`relative flex flex-col bg-bg ${i > 0 ? 'border-t border-border md:border-l md:border-t-0' : ''}`}
          >
            <div className="relative aspect-square w-full">
              <img
                src={r.image}
                alt=""
                loading="lazy"
                width={800}
                height={800}
                className="absolute inset-0 size-full object-contain p-[28px]"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-bg to-transparent" />
            </div>
            <div className="flex flex-col gap-[14px] px-[24px] pb-[36px] sm:px-[28px] lg:px-[32px]">
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-gray">{r.tag}</span>
              <h3 className="text-[clamp(20px,1.6vw,24px)] font-bold uppercase leading-[1.15] tracking-[-0.025em] text-dark">{r.title}</h3>
              <p className="text-[14px] leading-[1.7] tracking-[-0.005em] text-gray">{r.body}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0 (no errors). If `Section`/`lucide-react` import paths error, stop
and re-check; do not proceed.

- [ ] **Step 3: Commit**

```bash
git add components/sections/why-us.tsx
git commit -m "feat(why-us): Figma redesign — Section grid, chip, cascade, cards

Node 112:1787. Copy frozen (reasons array + helpers byte-identical;
only an image key added). 6 DESIGN.md deviations logged in spec.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Copy-diff assertion (FROZEN-copy hard gate)

**Files:** none modified (verification only).

- [ ] **Step 1: Assert every baseline string still renders in source**

```bash
MISS=0
while IFS= read -r line; do
  [ -z "$line" ] && continue
  grep -qF -- "$line" components/sections/why-us.tsx || { echo "MISSING: $line"; MISS=1; }
done < /tmp/why-us-copy-baseline.txt
[ "$MISS" = 0 ] && echo "COPY OK — every frozen string present" || echo "COPY DIFF — FAIL"
```

Expected: `COPY OK — every frozen string present`. If any `MISSING:` line prints,
the redesign altered frozen copy — **stop and restore the exact string**.

- [ ] **Step 2: Assert link hrefs unchanged**

```bash
for h in \
  'https://www.absolveme.ai/' 'https://www.sunsetml.com/' \
  'https://orbitxpay.com/' 'https://predictram.com/' \
  'clutchProfileUrl'; do
  grep -qF -- "$h" components/sections/why-us.tsx || echo "MISSING HREF: $h"
done
echo "href check done"
```

Expected: only `href check done` (no `MISSING HREF` lines).

- [ ] **Step 3: Assert the H2 text content is intact despite the span split**

```bash
grep -qF 'Why founders choose <span className="text-brand">Metaborong</span>' components/sections/why-us.tsx \
  && echo "H2 text intact (Why founders choose Metaborong)" || echo "H2 FAIL"
```

Expected: `H2 text intact (Why founders choose Metaborong)`. (Rendered
`textContent` = "Why founders choose Metaborong" — unchanged; only markup differs.)

No commit (verification gate). If all three pass, the FROZEN-copy constraint holds.

---

## Task 5: Live cascade candidate-pick (memory rule — user picks, no blind iteration)

**Files:**
- Modify: `components/sections/why-us.tsx` (only the two `lg:translate-x-[…]` values)

- [ ] **Step 1: Start the dev server**

Run: `npm run dev` (port 3000). Wait for "Ready". Do **not** `rm -rf .next` while
it runs (project gotcha).

- [ ] **Step 2: Render 3 labeled cascade-offset candidates on the live page**

Temporarily render the stat-chip column three times with labeled offset sets
(A: Clutch `-40` / weeks `-20`; B: Clutch `-64` / Reply `-24` / weeks `-12`;
C: no offset, plain right-aligned stack). Use the `gstack`/`browse` tool to
screenshot the live header at 1440 and 1280, annotate A/B/C.

- [ ] **Step 3: Ask the user to pick (AskUserQuestion)**

Present the labeled screenshots; user picks A/B/C (or a tweak). Do not eyeball or
auto-decide — this is the documented candidate-pick deferral.

- [ ] **Step 4: Apply the chosen offsets, remove the other candidates**

Edit only the `lg:translate-x-[…]` utilities to the chosen values. Re-run
`npx tsc --noEmit` (expect exit 0).

- [ ] **Step 5: Commit**

```bash
git add components/sections/why-us.tsx
git commit -m "feat(why-us): finalize stat-chip cascade offsets (user-picked)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Dev QA — grid alignment + responsive + a11y

**Files:** none modified (verification only). Covers plan Step 8 substance; the
formal `/verification-before-completion` + `/impeccable critique` run as workflow
Steps 7–8 after this plan.

- [ ] **Step 1: Edge alignment at 1440 / 1280 / 375**

With `npm run dev` running, use the `gstack`/`browse` tool to measure the section
box left/right edges vs `<Nav>` and an adjacent section.
Expected: left padding 128 / 128 / 16 px; right edge 1312 / 1152 / gutter;
**no horizontal overflow at 375**.

- [ ] **Step 2: Responsive structure**

- 1440/1280 (`lg+`): header two-column, chip cascade right-aligned, cards 3-up
  flush with shared 1px borders, no gaps, no radius.
- ~900 (`md`): header single column, chips wrapped row, cards still 3-up.
- 375 (`<md`): everything single column, chips stacked, illustrations contained
  (no overflow), all copy visible (no `display:none`).

- [ ] **Step 3: Accessibility**

- Keyboard-tab: Clutch chip → 3 client links reachable in visual order; brand
  `:focus-visible` ring shows.
- `prefers-reduced-motion: reduce`: `<Reveal>` short-circuits to visible (emulate
  in devtools).
- Clutch chip + client links hit-area ≥ 44×44 px on a 375 viewport.
- View source / disable JS: every frozen string + link present in static markup.

- [ ] **Step 4: Record results in the spec's draft note (Task 7), no code change.**

---

## Task 7: Graduate draft note (worktree only — NOT canonical)

**Files:**
- Modify: `docs/superpowers/specs/2026-05-19-section-why-us.md` (append a draft note)

- [ ] **Step 1: Append an implementation-status draft note**

Append a `## Implementation note (draft — graduate at merge)` section recording:
final cascade choice, QA results (edges, responsive, a11y), copy-diff PASS, and the
exact `CHANGELOG.md`/`DESIGN.md` Decisions-Log lines the **coordinator session**
should write at merge (do not edit those canonical files here).

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/specs/2026-05-19-section-why-us.md
git commit -m "docs(why-us): implementation draft note (graduate at merge)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage:**
- Canonical `<Section>` grid → Task 3 (`<Section bg="subtle" maxWidth="xwide">`).
- Bordered eyebrow chip, UPPERCASE H2 + blue `Metaborong` → Task 3.
- Stat-chip cascade, frozen strings, additive lucide icons, DOM=tab order,
  ≥44px → Task 3 + Task 5 (offsets) + Task 6 (a11y).
- 3 flush bordered columns, aspect box (no CLS), gradient → `--color-bg`, mono
  kicker = frozen `tag`, UPPERCASE H3, frozen body + client links → Task 3.
- D1 resize+WebP, plain `<img>` → Task 1.
- FROZEN-copy assertion → Task 2 (baseline) + Task 4 (assert).
- Cascade offsets = live candidate-pick → Task 5.
- 1440/1280/375 + responsive + reduced-motion/focus/ARIA/SSR → Task 6.
- Draft note only, no canonical DESIGN.md/CHANGELOG.md → Task 7.
- 6 logged deviations: already in the committed spec (no plan task needed).

**Placeholder scan:** none — every step has the exact command/code. Task 5 offset
values are intentional defaults to be replaced by the user pick (documented), not a
placeholder.

**Type consistency:** `reasons` shape (`tag/color/image/title/body`) consistent
across all three entries and the `.map`; `r.image`/`r.tag`/`r.title`/`r.body`
match. `Section` props (`bg`,`maxWidth`) match `components/ui/section.tsx`.
`Zap`/`CalendarDays` are valid `lucide-react` named exports.

**Out of scope (deferred, with rationale):** raw-hex in `projectLinkStyle` /
`reasons[].color` — pre-existing + frozen-adjacent, flagged not fixed. No
`next/image` — project convention. No `id`/anchor — none exists, not requested.
No canonical `DESIGN.md`/`CHANGELOG.md` — coordinator-owned at merge.

**What already exists (reused):** `components/ui/section.tsx` (grid + Reveal),
`lib/links.ts` (`clutchProfileUrl`), `lucide-react` (nav.tsx precedent), plain
`<img>` (founders/trust-bar precedent), `--color-*` Tailwind tokens.
