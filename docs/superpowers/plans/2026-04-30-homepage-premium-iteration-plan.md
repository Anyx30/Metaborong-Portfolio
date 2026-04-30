# Homepage Premium Iteration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a premium iteration of the Metaborong homepage — locked visual system, three rebuilt proof sections (hero, services, navbar), full-page SEO/AEO/GEO content rewrite, and code-side technical SEO additions.

**Architecture:** Three parallel lanes after spec/plan are written. Lane A (visual implementation, single agent using `frontend-design` + `nextjs-best-practices`). Lane B (content pipeline, sequenced through `seo-aeo-landing-page-writer` → `seo-content` → writer-revise → `seo-geo`). Lane C (technical SEO, single agent using `nextjs-best-practices`). Lanes converge in a final integration task that drops Lane B's locked copy into Lane A's slots and adds Lane C's schema/files.

**Tech Stack:** Next.js 16 App Router · React 19 · TypeScript · Tailwind v4 (CSS-first via `@theme`) · pnpm · Three.js (existing orb, restyled) · Lucide React icons · No test framework (verification = dev server + responsive check + view-source for SSR + Lighthouse).

**Spec:** [`docs/superpowers/specs/2026-04-30-homepage-premium-iteration-design.md`](../specs/2026-04-30-homepage-premium-iteration-design.md) — every task references back to spec sections rather than duplicating content.

---

## File Structure

### New files
```
components/ui/section-header.tsx       # reusable eyebrow → H2 → body header (spec §3.2, §5.1)
components/ui/pillar-card.tsx           # reusable card pattern (spec §5.2 — propagates to other sections later)
components/ui/cta.tsx                   # 3 CTA variants in one component (spec §3.4)
components/layout/services-dropdown.tsx # navbar dropdown panel (spec §6.3)
components/layout/mobile-menu.tsx       # navbar fullscreen mobile (spec §6.4)
app/sitemap.ts                          # Next.js MetadataRoute.Sitemap (spec §8.3)
app/robots.ts                           # Next.js MetadataRoute.Robots (spec §8.3)
public/llms.txt                         # GEO fact list (spec §8.2)
docs/content/homepage-v2.md             # Lane B output: ready-to-implement copy for all 10 sections
docs/content/seo-audit-homepage-v2.md   # Lane B output: audit report
docs/content/geo-extraction-map.md      # Lane B output: passage-level AI-citation map
docs/content/llms-homepage.txt          # Lane B output: source for public/llms.txt
```

### Modified files
```
app/globals.css                         # design system tokens reconciled to spec §3.1–§3.3
app/layout.tsx                          # Person schemas for founders, expand Organization
app/page.tsx                            # FAQPage JSON-LD, canonical alternates verify
next.config.js (or next.config.ts)      # 301 redirects www→apex + http→https
components/layout/nav.tsx               # restructure per spec §6
components/sections/hero.tsx            # layout rebuild + locked rhythm + final copy
components/sections/services.tsx        # full rebuild with pillar-card pattern
components/sections/trust-bar.tsx       # eyebrow label + mono treatment
components/hero-orb/orb-scene.tsx       # color discipline applied to nodes/edges/HUD
```

### Untouched (this session)
`components/sections/{why-us,work-preview,testimonials,founders,comparison,faq,contact-cta}.tsx`, `components/layout/footer.tsx` — copy for these IS produced by Lane B (so future visual rollouts aren't blocked) but NO visual changes ship in this iteration. Exception: `app/page.tsx` gains FAQPage JSON-LD that mirrors the existing FAQ section copy.

---

## Lane plan

```
Task 0          Setup (worktree, branch, baseline verify)
Tasks 1–3       Lane A · visual system foundation (tokens + primitives)
Tasks 4–6       Lane A · hero (orb restyle, hero section, trust bar)
Tasks 7–8       Lane A · services (pillar-card + section)
Tasks 9–11      Lane A · navbar (desktop, dropdown, mobile menu)
Tasks 12        Lane A · responsive sweep on proof sections
Task 13         Lane B · seo-aeo-landing-page-writer → draft homepage-v2.md
Task 14         Lane B · seo-content → audit + score
Task 15         Lane B · writer revise pass
Task 16         Lane B · seo-geo → AI-citation pass + extraction map + llms-homepage.txt
Tasks 17–22     Lane C · technical SEO (schema, sitemap, robots, llms, image audit, redirects, SSR verify)
Task 23         Integration · drop Lane B copy into Lane A slots
Task 24         Final verification + code review prep
```

Lanes A, B, C are independent until Task 23. With subagent-driven-development, A/B/C can fan out as parallel agents after Task 0 completes; each lane completes its own tasks sequentially, then meets at Task 23.

---

## Task 0: Setup worktree and baseline

**Files:** none modified — branch + worktree setup.

- [ ] **Step 1: Create worktree and branch**

```bash
cd /Users/zephyr/Claude-Workspace/projects/mb-website
git status                                # confirm clean
git worktree add -b feature/premium-homepage-v2 .worktrees/premium-homepage-v2 main
cd .worktrees/premium-homepage-v2
```

Expected: new worktree at `.worktrees/premium-homepage-v2`, branch `feature/premium-homepage-v2` checked out.

- [ ] **Step 2: Install + run dev server, capture baseline**

```bash
pnpm install
pnpm dev
```

Expected: dev server on `http://localhost:3000` or `:3001`. Open in browser, scroll the homepage, confirm all sections render (hero with orb, trust bar, services, why us, work preview, testimonials, founders, comparison, FAQ, contact, footer). Note any console errors as a baseline so we don't blame our changes for pre-existing issues.

- [ ] **Step 3: Commit empty marker (optional, skips if no changes)**

No commit at this step — proceeding to Task 1.

---

# Lane A — Visual Implementation

## Task 1: Reconcile design tokens in `app/globals.css`

**Spec reference:** §3.1 type scale, §3.2 spacing rhythm, §3.3 color roles, §3.5 motion timings.

**Files:**
- Modify: `app/globals.css`

The existing `@theme` block already has `--color-brand`, `--color-accent`, `--color-bg-subtle`, `--color-canvas`. We're adding the missing tokens, renaming for spec consistency, and locking the type scale + motion easings.

- [ ] **Step 1: Add the spec's color role tokens**

In `app/globals.css` `@theme` block, after the existing `--color-canvas: #0a0a0a;`, add:

```css
  /* Spec §3.3 — color roles */
  --color-ink:          #0a0a0a;
  --color-paper:        #f5f7ff;
  --color-paper-2:      #fafbff;
  --color-surface:      #ffffff;
  --color-surface-dark: #0f0f0f;
  --color-line:         #e5e8f4;
  --color-line-dark:    rgba(255,255,255,0.06);
  --color-line-dark-hover: rgba(255,255,255,0.12);
  --color-muted:        #6b7280;
  --color-muted-dark:   #a8a8a8;
  --color-accent-2:     #3dd685;       /* AI pillar — desaturated from #4dff9a */
```

- [ ] **Step 2: Add type scale tokens**

After the spacing scale, add:

```css
  /* Spec §3.1 — type scale (fluid where applicable) */
  --text-display: clamp(48px, 6vw, 88px);
  --text-h2:      clamp(32px, 4vw, 56px);
  --text-h3:      24px;
  --text-body-lg: 18px;
  --text-body:    16px;
  --text-body-sm: 14px;
  --text-mono-sm: 13px;
  --text-eyebrow: 12px;

  --tracking-display: -0.03em;
  --tracking-h2:      -0.02em;
  --tracking-h3:      -0.01em;
  --tracking-eyebrow: 0.12em;
  --tracking-mono:    0.02em;
```

- [ ] **Step 3: Add motion tokens**

```css
  /* Spec §3.5 — motion */
  --ease-reveal: cubic-bezier(0.22, 1, 0.36, 1);
  --dur-reveal:  400ms;
  --dur-hover:   200ms;
```

- [ ] **Step 4: Add reusable utility classes outside `@theme`**

After the `@theme` block, add base utility primitives:

```css
/* ── Spec §3.2 — section padding + container ─────────────── */
.section-pad { padding-block: clamp(80px, 10vw, 160px); }
.container-x { max-width: 1280px; margin-inline: auto; padding-inline: clamp(24px, 4vw, 48px); }

/* ── Spec §3.5 — reveal-on-scroll (used by IntersectionObserver hook) ── */
.reveal-init  { opacity: 0; transform: translateY(24px); }
.reveal-shown { opacity: 1; transform: translateY(0);
  transition: opacity var(--dur-reveal) var(--ease-reveal), transform var(--dur-reveal) var(--ease-reveal); }

@media (prefers-reduced-motion: reduce) {
  .reveal-init, .reveal-shown { opacity: 1; transform: none; transition: none; }
}
```

- [ ] **Step 5: Verify dev server still renders**

Reload `http://localhost:3001`. The page should look unchanged — we only added tokens, did not remove existing ones.

- [ ] **Step 6: Commit**

```bash
git add app/globals.css
git commit -m "feat(tokens): add spec §3 design system tokens"
```

---

## Task 2: Reusable `SectionHeader` primitive

**Spec reference:** §3.2 locked rhythm (eyebrow → H2 = 16px; H2 → body = 24px), §5.1 services header pattern.

**Files:**
- Create: `components/ui/section-header.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/ui/section-header.tsx
import { ReactNode } from "react";

type Theme = "light" | "dark";

interface SectionHeaderProps {
  eyebrow: string;
  title: ReactNode;
  body?: ReactNode;
  theme?: Theme;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  body,
  theme = "light",
  align = "left",
  className = "",
}: SectionHeaderProps) {
  const inkColor = theme === "dark" ? "text-white" : "text-[var(--color-ink)]";
  const bodyColor = theme === "dark" ? "text-[var(--color-muted-dark)]" : "text-[var(--color-muted)]";
  const eyebrowColor = theme === "dark" ? "text-[var(--color-muted-dark)]" : "text-[var(--color-muted)]";
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";

  return (
    <header className={`max-w-3xl ${alignClass} ${className}`}>
      <div
        className={`font-mono uppercase ${eyebrowColor}`}
        style={{ fontSize: "var(--text-eyebrow)", letterSpacing: "var(--tracking-eyebrow)" }}
      >
        {eyebrow}
      </div>
      <h2
        className={`mt-4 font-medium ${inkColor}`}
        style={{ fontSize: "var(--text-h2)", letterSpacing: "var(--tracking-h2)", lineHeight: 1.05 }}
      >
        {title}
      </h2>
      {body && (
        <p className={`mt-6 ${bodyColor}`} style={{ fontSize: "var(--text-body-lg)", lineHeight: 1.5 }}>
          {body}
        </p>
      )}
    </header>
  );
}
```

`mt-4` = 16px (eyebrow→H2 gap) and `mt-6` = 24px (H2→body gap), matching spec §3.2.

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm exec tsc --noEmit`
Expected: no errors related to this file.

- [ ] **Step 3: Commit**

```bash
git add components/ui/section-header.tsx
git commit -m "feat(ui): add SectionHeader primitive with locked rhythm"
```

---

## Task 3: Reusable `Cta` primitive (3 variants)

**Spec reference:** §3.4 — three CTA variants, locked.

**Files:**
- Create: `components/ui/cta.tsx`

The codebase already has `components/ui/button.tsx`. We do NOT replace it — we add a thinner CTA wrapper that locks the spec's three variants. If the existing Button covers the same ground after review, consolidate in a follow-up; for now, ship Cta and use it in new sections.

- [ ] **Step 1: Create the component**

```tsx
// components/ui/cta.tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface CtaProps {
  href: string;
  variant?: Variant;
  children: ReactNode;
  className?: string;
}

const base = "inline-flex items-center gap-2 font-medium transition-[color,background-color,border-color,transform,box-shadow] duration-200 ease-out";

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-[var(--color-accent)] text-white px-6 py-3 rounded-[12px] hover:brightness-110 hover:shadow-md",
  secondary:
    "border border-[var(--color-ink)] text-[var(--color-ink)] px-6 py-3 rounded-[12px] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)]",
  ghost:
    "text-[var(--color-ink)] hover:text-[var(--color-accent)] underline-offset-4 hover:underline",
};

export function Cta({ href, variant = "primary", children, className = "" }: CtaProps) {
  return (
    <Link href={href} className={`${base} ${variantStyles[variant]} ${className} group`}>
      <span>{children}</span>
      <ArrowRight
        size={16}
        strokeWidth={1.5}
        className="transition-transform duration-200 group-hover:translate-x-1"
      />
    </Link>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/ui/cta.tsx
git commit -m "feat(ui): add Cta primitive with 3 locked variants"
```

---

## Task 4: Hero orb color discipline

**Spec reference:** §4.2.

**Files:**
- Modify: `components/hero-orb/orb-scene.tsx`

- [ ] **Step 1: Read the current file to locate color constants**

Run: `cat components/hero-orb/orb-scene.tsx | head -60`
Locate the constants for ambient node color, edge opacity, pillar colors, HUD label background.

- [ ] **Step 2: Update color constants**

Find the existing color literals and replace them per spec §4.2:

| Old | New | Where |
|---|---|---|
| `#204AF8` ambient nodes | `#c8d0ec` | InstancedMesh material color for the 200 ambient nodes |
| `#4dff9a` (AI pillar) | `#3dd685` | AI service node material color |
| Edge opacity `0.16` | `0.10` | LineSegments material opacity |
| HUD bg `rgba(2,6,26,0.94)` | `rgba(10,10,10,0.88)` | the inline style on the HUD label container |

Pillar colors `#F6851B` (Web3) and `#204AF8` (Product) **do not change**. Auto-rotate speed `0.058 rad/s` does not change.

- [ ] **Step 3: Add halo mesh per service node**

The spec calls for a 30%-opacity rim/halo on each service node. If the current implementation does not have this, add a second InstancedMesh sized 1.6× the node radius, same color as parent node, opacity 0.3, depthWrite false. (If it already has equivalent, skip.) Implementation hint:

```tsx
// pseudocode pattern, adapt to actual scene structure:
const haloGeo = new THREE.SphereGeometry(NODE_RADIUS * 1.6, 16, 16);
const haloMat = new THREE.MeshBasicMaterial({ color: pillarColor, transparent: true, opacity: 0.3, depthWrite: false });
```

- [ ] **Step 4: Strip the HUD scan-line animation**

In `app/globals.css`, find the `_orbScn` keyframes (named `orbScanLine` or similar — spec mentions `_orbScn`). Remove that keyframe and any element using it. Keep `_orbIn` (mount fade) and `_orbCur` (blinking cursor). The L-bracket corner brackets stay; only the moving scan-line animation goes.

- [ ] **Step 5: Verify in browser**

Reload. The orb should now:
- Have desaturated grey-blue ambient nodes (200 of them)
- Service nodes pop more cleanly with rim halos
- Edges visibly thinner / less busy
- HUD label sits naturally on light bg with no scan-line sweep

Cross-check on hover: HUD label still appears, with L-brackets and blinking `_` cursor. No layout shift.

- [ ] **Step 6: Commit**

```bash
git add components/hero-orb/orb-scene.tsx app/globals.css
git commit -m "feat(orb): apply spec §4.2 color discipline + drop scan-line"
```

---

## Task 5: Hero section rebuild

**Spec reference:** §4.1 layout, §4.3 copy structure (slots).

**Files:**
- Modify: `components/sections/hero.tsx`

- [ ] **Step 1: Replace hero contents with spec layout**

Open `components/sections/hero.tsx`. Replace its body with this structure (keep the existing `'use client'` directive at the top — required for the dynamically imported orb):

```tsx
'use client';

import dynamic from "next/dynamic";
import { Cta } from "@/components/ui/cta";

const HeroOrb = dynamic(() => import("@/components/hero-orb/hero-orb").then(m => m.HeroOrb), { ssr: false });

export function Hero() {
  return (
    <section className="section-pad" style={{ background: "var(--color-paper)" }}>
      <div className="container-x grid lg:grid-cols-[55fr_45fr] gap-12 items-center">
        {/* Left: copy column */}
        <div className="max-w-[640px]">
          <div
            className="font-mono uppercase text-[var(--color-muted)]"
            style={{ fontSize: "var(--text-eyebrow)", letterSpacing: "var(--tracking-eyebrow)" }}
          >
            {/* SLOT: HERO_EYEBROW — replaced in Task 23 with Lane B copy */}
            FULL-STACK WEB3 + AI STUDIO
          </div>

          <h1
            className="mt-4 font-medium text-[var(--color-ink)]"
            style={{ fontSize: "var(--text-display)", letterSpacing: "var(--tracking-display)", lineHeight: 1.05 }}
          >
            {/* SLOT: HERO_H1 — replaced in Task 23 */}
            We build Web3 platforms and AI agents that ship.
          </h1>

          <blockquote
            className="mt-6 pl-4 text-[var(--color-ink)]"
            style={{
              fontSize: "var(--text-body-lg)",
              lineHeight: 1.5,
              borderLeft: "2px solid var(--color-brand)",
            }}
          >
            {/* SLOT: HERO_BLOCKQUOTE — replaced in Task 23 (38-word AEO sentence) */}
            Metaborong is a Web3 development company building DeFi protocols, custom blockchain platforms, and AI agents for crypto, with delivery-focused founders who have shipped products since Web2 and now operate at the AI agent in Web3 frontier.
          </blockquote>

          <div className="mt-8 flex flex-wrap gap-3">
            <Cta href="/contact" variant="primary">Start a project</Cta>
            <Cta href="#work" variant="ghost">See our work</Cta>
          </div>

          <p
            className="mt-6 text-[var(--color-muted)]"
            style={{ fontSize: "var(--text-body-sm)" }}
          >
            {/* SLOT: HERO_TRUST_MICROCOPY — replaced in Task 23 */}
            Trusted by 8 named clients across DeFi, gaming, and AI.
          </p>
        </div>

        {/* Right: orb */}
        <div className="w-full" style={{ height: "clamp(360px, 60vh, 520px)" }}>
          <HeroOrb />
        </div>
      </div>
    </section>
  );
}
```

The "SLOT" placeholders are intentional — Task 23 replaces them with Lane B's locked copy. Until then, the slot text serves as a working preview.

- [ ] **Step 2: Verify in browser at desktop width**

Reload. Hero should:
- Use 55/45 split at `lg+` (≥1024px)
- H1 in Display size, weight 500, tight tracking
- Blockquote indented with 2px brand-blue left border, no card background
- Two CTAs: orange-filled "Start a project" + ghost "See our work"
- Locked rhythm gaps visible: 16px under eyebrow, 24px under H1, 24px under blockquote, 32px above CTAs

- [ ] **Step 3: Verify on mobile (Chrome DevTools 375px viewport)**

Hero should stack vertically: copy column above, orb below. Orb canvas `clamp(360px, 60vh, 520px)`. CTAs may wrap; that's fine. No horizontal scroll.

- [ ] **Step 4: Commit**

```bash
git add components/sections/hero.tsx
git commit -m "feat(hero): rebuild with spec §4 layout + slots for Lane B copy"
```

---

## Task 6: Trust bar — eyebrow + mono treatment

**Spec reference:** §4.4.

**Files:**
- Modify: `components/sections/trust-bar.tsx`

- [ ] **Step 1: Read existing implementation**

Run: `cat components/sections/trust-bar.tsx`
Note the current marquee structure and client list.

- [ ] **Step 2: Add eyebrow label and switch names to mono uppercase**

Wrap the existing marquee in a flex container with a sticky-left eyebrow label "TRUSTED BY":

```tsx
// Skeleton — preserve existing client list and marquee animation
import { ReactNode } from "react";

const CLIENTS = ["KGeN", "Bionic", "DATA3 AI", "Defiverse", "GET Smart", "SEDAX", "Bayan", "Memestakes Vault"];

export function TrustBar() {
  return (
    <section className="border-y border-[var(--color-line)]" style={{ background: "var(--color-paper)" }}>
      <div className="container-x py-8 flex items-center gap-8">
        <div
          className="font-mono uppercase text-[var(--color-muted)] shrink-0"
          style={{ fontSize: "var(--text-eyebrow)", letterSpacing: "var(--tracking-eyebrow)" }}
        >
          TRUSTED BY
        </div>
        <div className="overflow-hidden flex-1">
          <div className="flex gap-12 animate-[trust-marquee_40s_linear_infinite] whitespace-nowrap">
            {[...CLIENTS, ...CLIENTS].map((name, i) => (
              <span
                key={i}
                className="font-mono uppercase text-[var(--color-ink)]"
                style={{ fontSize: "var(--text-mono-sm)", letterSpacing: "var(--tracking-mono)" }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
```

If the existing component already had a `@keyframes trust-marquee` (or similar named animation), keep that name. If not, add to `globals.css`:

```css
@keyframes trust-marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
```

- [ ] **Step 3: Verify in browser**

Trust bar sits below hero. Eyebrow "TRUSTED BY" anchors the left side. Marquee scrolls infinitely. All client names in mono-sm uppercase.

- [ ] **Step 4: Commit**

```bash
git add components/sections/trust-bar.tsx app/globals.css
git commit -m "feat(trust-bar): eyebrow anchor + mono uppercase treatment"
```

---

## Task 7: `PillarCard` reusable component

**Spec reference:** §5.2 internal layout, §5.5 motion.

**Files:**
- Create: `components/ui/pillar-card.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/ui/pillar-card.tsx
'use client';

import Link from "next/link";
import { ArrowRight, LucideIcon } from "lucide-react";
import { useRef, MouseEvent } from "react";

interface PillarCardProps {
  pillar: "WEB3" | "AI" | "PRODUCT";
  pillarColor: string;        // CSS color string
  icon: LucideIcon;
  title: string;
  description: string;
  services: string[];
  href: string;
  ctaLabel: string;           // e.g. "Explore Web3"
}

export function PillarCard({
  pillar, pillarColor, icon: Icon, title, description, services, href, ctaLabel,
}: PillarCardProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  function handleMove(e: MouseEvent<HTMLAnchorElement>) {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }

  return (
    <Link
      ref={ref}
      href={href}
      onMouseMove={handleMove}
      className="group relative block rounded-[16px] border border-[var(--color-line-dark)] hover:border-[var(--color-line-dark-hover)] bg-[var(--color-surface-dark)] p-10 md:p-10 sm:p-8 transition-[transform,border-color] duration-200 ease-out hover:-translate-y-0.5 overflow-hidden"
      style={{ ['--pillar' as never]: pillarColor }}
    >
      {/* Signature motion: radial gradient trace following cursor */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(240px circle at var(--mx,50%) var(--my,50%), ${pillarColor}14, transparent 60%)`,
        }}
      />

      {/* Pillar identity row */}
      <div className="relative flex items-center gap-2" style={{ color: pillarColor }}>
        <Icon size={20} strokeWidth={1.5} />
        <span
          className="font-mono uppercase"
          style={{ fontSize: "var(--text-mono-sm)", letterSpacing: "var(--tracking-mono)" }}
        >
          {pillar}
        </span>
      </div>

      {/* Title */}
      <h3
        className="relative mt-8 font-medium text-white"
        style={{ fontSize: "var(--text-h3)", letterSpacing: "var(--tracking-h3)", lineHeight: 1.2 }}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        className="relative mt-4 text-[var(--color-muted-dark)]"
        style={{ fontSize: "var(--text-body)", lineHeight: 1.6 }}
      >
        {description}
      </p>

      {/* Service list */}
      <p
        className="relative mt-8 font-mono text-[var(--color-muted-dark)]"
        style={{ fontSize: "var(--text-mono-sm)", letterSpacing: "var(--tracking-mono)", lineHeight: 1.7 }}
      >
        {services.join(" · ")}
      </p>

      {/* Ghost CTA */}
      <span
        className="relative mt-10 inline-flex items-center gap-2 group/cta"
        style={{ color: pillarColor }}
      >
        <span style={{ fontSize: "var(--text-body)" }}>{ctaLabel}</span>
        <ArrowRight size={16} strokeWidth={1.5} className="transition-transform duration-200 group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
```

Notes:
- `var(--color-line-dark-hover)` was added in Task 1 — ensure it's there.
- The `--mx`/`--my` CSS variables are updated on mouse move; the radial gradient reads them. Falls back to 50%/50% on no-move (safe).
- Whole card is the link (spec §5.6) — the inner CTA arrow is decorative.

- [ ] **Step 2: Verify TypeScript**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/ui/pillar-card.tsx
git commit -m "feat(ui): add PillarCard with cursor-trace signature motion"
```

---

## Task 8: Services section rebuild

**Spec reference:** §5.1, §5.3, §5.4.

**Files:**
- Modify: `components/sections/services.tsx`

- [ ] **Step 1: Replace contents with three pillar cards**

```tsx
// components/sections/services.tsx
import { Boxes, Brain, LayoutGrid } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { PillarCard } from "@/components/ui/pillar-card";

export function Services() {
  return (
    <section className="section-pad" style={{ background: "var(--color-ink)" }}>
      <div className="container-x">
        <SectionHeader
          theme="dark"
          eyebrow="WHAT WE BUILD"
          title="Three pillars. One studio."
          body="Metaborong builds Web3 platforms, AI agents for blockchain, and zero-to-one products from a single delivery-focused team."
        />

        <div className="mt-16 grid gap-6 lg:grid-cols-3 grid-cols-1">
          <PillarCard
            pillar="WEB3"
            pillarColor="var(--color-accent)"
            icon={Boxes}
            title="Web3 Development"
            description="DeFi protocols, decentralised exchanges, lending platforms, custom wallets, and token launches — built secure, audited, and ready for mainnet."
            services={["DeFi protocols", "DEX & lending", "Crypto wallets", "Token & smart contracts", "Web3 consulting"]}
            href="/services/web3/"
            ctaLabel="Explore Web3"
          />

          <PillarCard
            pillar="AI"
            pillarColor="var(--color-accent-2)"
            icon={Brain}
            title="AI Agent Development"
            description="Autonomous agents for DeFi automation, AI-powered smart contract auditing, and AI-driven governance — the AI-in-Web3 frontier neither legacy agency owns."
            services={["AI agents for DeFi", "AI smart contract audit", "AI DAO governance", "AI trading agents", "Agentic workflows"]}
            href="/services/ai-agents/"
            ctaLabel="Explore AI Agents"
          />

          <PillarCard
            pillar="PRODUCT"
            pillarColor="var(--color-brand)"
            icon={LayoutGrid}
            title="Product Studio"
            description="Founders bring an idea, Metaborong ships it. Telegram MiniApps, SaaS products, Web2-to-Web3 migrations, and design-led product launches."
            services={["Telegram MiniApps", "SaaS products", "Web2 → Web3 migration", "Design + product strategy", "Founding-team execution"]}
            href="/services/product-studio/"
            ctaLabel="Explore Product Studio"
          />
        </div>
      </div>
    </section>
  );
}
```

These descriptions are placeholders aligned with the spec's keyword targets — Lane B will replace them in Task 23 with the audited final copy.

- [ ] **Step 2: Verify in browser**

Services section should:
- Sit on `#0a0a0a` ink background
- Have eyebrow → H2 → body header with locked gaps
- Show three cards in a 3-up grid at `lg+` (1024px)
- On hover: -2px lift + radial gradient trace in pillar color follows cursor + arrow translates
- Click anywhere on the card → navigate to `/services/web3/`, `/ai-agents/`, `/product-studio/` (these will 404 until hub pages ship — accept for now)

- [ ] **Step 3: Verify on mobile (375px)**

Cards stack 1-up. Padding tightens to `p-8` (`32px`). No horizontal scroll. Touch target = whole card.

- [ ] **Step 4: Commit**

```bash
git add components/sections/services.tsx
git commit -m "feat(services): rebuild with PillarCard + spec §5 layout"
```

---

## Task 9: Navbar desktop restructure

**Spec reference:** §6.1, §6.2.

**Files:**
- Modify: `components/layout/nav.tsx`

- [ ] **Step 1: Read current nav implementation**

Run: `cat components/layout/nav.tsx`

Note the existing structure (logo, nav links, CTA) and any state/scroll listeners. We're keeping the dropdown logic but replacing the visual + structure.

- [ ] **Step 2: Replace with spec-compliant desktop nav**

```tsx
// components/layout/nav.tsx
'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/logo";
import { Cta } from "@/components/ui/cta";
import { ServicesDropdown } from "@/components/layout/services-dropdown";
import { MobileMenu } from "@/components/layout/mobile-menu";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-200"
      style={{
        height: 72,
        backgroundColor: scrolled ? "rgba(245,247,255,0.72)" : "transparent",
        backdropFilter: scrolled ? "blur(20px) saturate(140%)" : "none",
        borderBottom: scrolled ? "1px solid rgba(10,10,10,0.04)" : "1px solid transparent",
      }}
    >
      <div className="container-x h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="Metaborong home">
          <Logo size={28} />
          <span
            className="hidden sm:inline font-medium text-[var(--color-ink)]"
            style={{ fontSize: "16px" }}
          >
            Metaborong
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-10">
          <ServicesDropdown />
          <Link href="#work" className="text-[14px] font-medium text-[var(--color-ink)]/80 hover:text-[var(--color-ink)] transition-colors">Work</Link>
          <Link href="/about" className="text-[14px] font-medium text-[var(--color-ink)]/80 hover:text-[var(--color-ink)] transition-colors">About</Link>
          <Link href="/blog" className="text-[14px] font-medium text-[var(--color-ink)]/80 hover:text-[var(--color-ink)] transition-colors">Blog</Link>
        </nav>

        <div className="hidden lg:block">
          <Cta href="/contact" variant="ghost">Let&apos;s talk</Cta>
        </div>

        {/* Mobile menu */}
        <div className="lg:hidden">
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
```

The dropdown and mobile-menu components don't exist yet — they're created in Tasks 10-11. The component will not render correctly until those are done; that is expected. (TypeScript may error on missing imports — Tasks 10/11 will resolve them.)

- [ ] **Step 3: Commit (deferred — wait until Tasks 10/11 complete to verify, OR commit now with broken imports and fix in next task)**

Skip commit; proceed to Task 10. Final commit at end of Task 11 covers all three nav files.

---

## Task 10: Services dropdown panel

**Spec reference:** §6.3.

**Files:**
- Create: `components/layout/services-dropdown.tsx`

- [ ] **Step 1: Create the dropdown component**

```tsx
// components/layout/services-dropdown.tsx
'use client';

import Link from "next/link";
import { ChevronDown, Boxes, Brain, LayoutGrid, LucideIcon } from "lucide-react";
import { useState } from "react";

interface PillarRow {
  href: string;
  icon: LucideIcon;
  color: string;
  name: string;
  count: string;
  description: string;
}

const PILLARS: PillarRow[] = [
  {
    href: "/services/web3/",
    icon: Boxes,
    color: "var(--color-accent)",
    name: "Web3 Development",
    count: "5 services",
    description: "DeFi, DEX, lending, wallets, tokens.",
  },
  {
    href: "/services/ai-agents/",
    icon: Brain,
    color: "var(--color-accent-2)",
    name: "AI Agent Development",
    count: "5 services",
    description: "Agents for DeFi, audit, governance.",
  },
  {
    href: "/services/product-studio/",
    icon: LayoutGrid,
    color: "var(--color-brand)",
    name: "Product Studio",
    count: "4 services",
    description: "Telegram MiniApps, SaaS, migrations.",
  },
];

export function ServicesDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="flex items-center gap-1 text-[14px] font-medium text-[var(--color-ink)]/80 hover:text-[var(--color-ink)] transition-colors"
        aria-expanded={open}
        aria-haspopup="true"
      >
        Services
        <ChevronDown
          size={14}
          strokeWidth={1.5}
          className="transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full pt-3"
          style={{ width: 400 }}
        >
          <div
            className="rounded-[12px] bg-[var(--color-surface)] p-2"
            style={{
              border: "1px solid var(--color-line)",
              boxShadow: "0 12px 32px rgba(10,10,10,0.08)",
            }}
          >
            {PILLARS.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className="group flex flex-col gap-1 rounded-[8px] p-3 hover:bg-[var(--color-paper)] border-l-2 border-transparent hover:border-l-2 transition-[background-color,border-color] duration-200"
                style={{ ['--hover-border' as never]: p.color }}
                onMouseEnter={(e) => (e.currentTarget.style.borderLeftColor = p.color)}
                onMouseLeave={(e) => (e.currentTarget.style.borderLeftColor = "transparent")}
              >
                <div className="flex items-center gap-3">
                  <p.icon size={20} strokeWidth={1.5} style={{ color: p.color }} />
                  <span className="text-[16px] font-medium text-[var(--color-ink)]">{p.name}</span>
                  <span
                    className="ml-auto font-mono text-[var(--color-muted)]"
                    style={{ fontSize: "var(--text-mono-sm)", letterSpacing: "var(--tracking-mono)" }}
                  >
                    {p.count}
                  </span>
                </div>
                <span className="text-[14px] text-[var(--color-muted)] pl-[32px]">{p.description}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `pnpm exec tsc --noEmit`
Expected: errors only on `MobileMenu` import (created in Task 11).

- [ ] **Step 3: Proceed to Task 11 before committing**

---

## Task 11: Mobile menu fullscreen

**Spec reference:** §6.4.

**Files:**
- Create: `components/layout/mobile-menu.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/layout/mobile-menu.tsx
'use client';

import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { Cta } from "@/components/ui/cta";

const PILLARS = [
  { href: "/services/web3/", name: "Web3 Development" },
  { href: "/services/ai-agents/", name: "AI Agent Development" },
  { href: "/services/product-studio/", name: "Product Studio" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="text-[var(--color-ink)] p-2"
      >
        <Menu size={24} strokeWidth={1.5} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60]"
          style={{ background: "var(--color-ink)", color: "white" }}
          role="dialog"
          aria-modal="true"
        >
          <div className="container-x flex items-center justify-between" style={{ height: 64 }}>
            <span className="font-medium text-[16px]">Menu</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="text-white p-2"
            >
              <X size={24} strokeWidth={1.5} />
            </button>
          </div>

          <nav className="container-x mt-8 flex flex-col gap-6">
            <button
              type="button"
              onClick={() => setServicesOpen(s => !s)}
              className="flex items-center justify-between text-[24px] font-medium"
              aria-expanded={servicesOpen}
            >
              <span>Services</span>
              <ChevronDown
                size={20}
                strokeWidth={1.5}
                style={{ transform: servicesOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 200ms" }}
              />
            </button>

            {servicesOpen && (
              <div className="flex flex-col gap-3 pl-2">
                {PILLARS.map(p => (
                  <Link key={p.href} href={p.href} onClick={() => setOpen(false)} className="text-[18px] text-white/85 hover:text-white">
                    {p.name}
                  </Link>
                ))}
              </div>
            )}

            <Link href="#work" onClick={() => setOpen(false)} className="text-[24px] font-medium">Work</Link>
            <Link href="/about" onClick={() => setOpen(false)} className="text-[24px] font-medium">About</Link>
            <Link href="/blog" onClick={() => setOpen(false)} className="text-[24px] font-medium">Blog</Link>
          </nav>

          <div className="container-x absolute bottom-8 left-0 right-0">
            <Cta href="/contact" variant="primary" className="w-full justify-center">Let&apos;s talk</Cta>
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Verify TypeScript clean**

Run: `pnpm exec tsc --noEmit`
Expected: no errors. All three nav files now resolve.

- [ ] **Step 3: Verify in browser**

Desktop (≥1024px):
- Logo + wordmark left, centered nav with Services dropdown, ghost CTA right
- Scroll past 24px → bg fades to frosted glass with bottom border
- Hover Services → dropdown panel appears with 3 pillar rows
- Hover a pillar row → bg shifts to paper, left border in pillar color
- Click pillar row → navigates to hub page

Mobile (≤1023px):
- Logo + hamburger only (wordmark hides ≤ sm)
- Tap hamburger → fullscreen ink panel
- Tap Services → reveals 3 pillar rows
- Tap any link → closes panel and navigates
- Bottom: full-width orange "Let's talk"
- Tap X or any link → closes

- [ ] **Step 4: Commit**

```bash
git add components/layout/nav.tsx components/layout/services-dropdown.tsx components/layout/mobile-menu.tsx
git commit -m "feat(nav): restructure desktop + dropdown + mobile menu per spec §6"
```

---

## Task 12: Responsive sweep on proof sections

**Spec reference:** §3.6 verification gate.

**Files:** none modified — testing only.

- [ ] **Step 1: Open dev server in Chrome DevTools**

Open `http://localhost:3001`, open DevTools, toggle device toolbar.

- [ ] **Step 2: Test at 375 / 768 / 1280 / 1536**

For each viewport:
- No horizontal scrollbar
- Hero stacks/splits correctly (split at ≥1024)
- Trust bar marquee continues smoothly
- Services cards stack 1-up below 1024, 3-up at 1024+
- Navbar shows desktop layout at ≥1024, hamburger below
- All touch targets ≥ 44px on mobile sizes
- Body text reads at minimum 16px on mobile

- [ ] **Step 3: Test reduced motion**

Open DevTools → Rendering → Emulate CSS prefers-reduced-motion: reduce. Verify: cards no longer slide on hover (instant), section reveal is instant. Orb continues to rotate (decorative, not page-content motion — acceptable).

- [ ] **Step 4: Capture screenshots into a verification log**

```bash
mkdir -p .verification/2026-04-30
# Optionally take screenshots manually and save to that dir.
```

This is for self-review, not committed.

- [ ] **Step 5: No commit (verification-only step)**

If issues are found, fix them in a small commit, then re-verify.

---

# Lane B — Content Pipeline

> **Lane B can run in parallel with Lane A.** It writes/edits markdown files only — no code touches. Each task hands off a markdown artifact to the next. Use the named skill for each task.

## Task 13: Content draft (seo-aeo-landing-page-writer)

**Spec reference:** §7.1, §7.3 keyword map, §7.5 inconsistency-killer rules.

**Files:**
- Create: `docs/content/homepage-v2.md`

- [ ] **Step 1: Invoke the skill**

```
Skill: seo-aeo-landing-page-writer
```

- [ ] **Step 2: Brief the skill**

Provide:
- Spec doc path: `docs/superpowers/specs/2026-04-30-homepage-premium-iteration-design.md` — §7.3 keyword/AEO map is the source of truth
- Existing draft to learn voice from: `docs/content/homepage.md` (v1, partial)
- Strategy doc for context: `docs/metaborong-seo-strategy.pdf` (Gap 1: AI Agents in Web3 first-mover; Gap 3: commercial-intent keywords; Gap 4: AI search visibility)

Required output for ALL 10 sections (hero, trust bar, services [with 3 pillar cards], why us, work preview, testimonials, founders, comparison, FAQ [8 Q&As], contact CTA, footer):

For each section, produce:
- Eyebrow (mono uppercase, ≤6 words)
- H1 / H2 / H3 as appropriate
- Body copy with primary + secondary keywords from the §7.3 table
- AEO-extractable sentences (subject named, no pronouns-only)
- CTA verbs limited to {Start, Explore, See}

Constraints (spec §7.5):
- Every body paragraph: ≤60 words, ≤3 sentences
- Total body word count target: 700–800 words across the page (≥500 minimum)
- No "we" without subject — "Metaborong builds X" not "We build X" where extraction matters

- [ ] **Step 3: Save output to `docs/content/homepage-v2.md`**

- [ ] **Step 4: Commit**

```bash
git add docs/content/homepage-v2.md
git commit -m "docs(content): initial homepage-v2 draft from seo-aeo-landing-page-writer"
```

---

## Task 14: Content audit (seo-content)

**Spec reference:** §7.6 pipeline.

**Files:**
- Create: `docs/content/seo-audit-homepage-v2.md`

- [ ] **Step 1: Invoke the skill**

```
Skill: seo-content
```

- [ ] **Step 2: Brief the skill**

Provide:
- Path to draft: `docs/content/homepage-v2.md`
- Spec §7.3 keyword/AEO map and §7.5 rules

Required output: a scored audit report covering, per section:
- Keyword presence vs targets (pass/fail per primary, secondary)
- E-E-A-T signals (named persons, credentials, specific clients, dates)
- Readability (Flesch reading ease estimate, sentence length, jargon)
- Thin-content risk (word count vs target)
- Citation-readiness (passage extractability, subject naming)
- Specific revision recommendations (concrete sentences to change, not vague guidance)

- [ ] **Step 3: Save output**

Save to `docs/content/seo-audit-homepage-v2.md`.

- [ ] **Step 4: Commit**

```bash
git add docs/content/seo-audit-homepage-v2.md
git commit -m "docs(content): seo-content audit of homepage-v2 draft"
```

---

## Task 15: Writer revision pass

**Spec reference:** §7.6 pipeline.

**Files:**
- Modify: `docs/content/homepage-v2.md`

- [ ] **Step 1: Invoke the skill again**

```
Skill: seo-aeo-landing-page-writer
```

- [ ] **Step 2: Brief the skill with audit feedback**

Provide:
- Current draft: `docs/content/homepage-v2.md`
- Audit report: `docs/content/seo-audit-homepage-v2.md`
- Spec §7.3 + §7.5

Required output: revised `homepage-v2.md` addressing every concrete recommendation in the audit. Mark each addressed item explicitly in a brief inline change-log comment at the top of the file (HTML comment so it doesn't render).

- [ ] **Step 3: Verify against the audit checklist**

Open both files side by side. For each "fail" or recommendation in the audit, confirm the revised draft addresses it.

- [ ] **Step 4: Commit**

```bash
git add docs/content/homepage-v2.md
git commit -m "docs(content): writer revision pass against audit feedback"
```

---

## Task 16: AI-citation pass (seo-geo)

**Spec reference:** §7.4 GEO discipline rules, §8.2 llms.txt.

**Files:**
- Create: `docs/content/geo-extraction-map.md`
- Create: `docs/content/llms-homepage.txt`

- [ ] **Step 1: Invoke the skill**

```
Skill: seo-geo
```

- [ ] **Step 2: Brief the skill**

Provide:
- Revised draft: `docs/content/homepage-v2.md`
- Spec §7.4 (GEO rules) and §8.2 (llms.txt format)

Required outputs:

**A) `docs/content/geo-extraction-map.md`** — for each section, the passage-level extraction map: which sentences are designed to be picked up by AI engines, what query they answer, what entities/facts they encode. Format:

```
## Hero
- Sentence: "Metaborong is a Web3 development company building DeFi protocols, custom blockchain platforms, and AI agents for crypto."
  - Answers: "What does Metaborong do?", "What is Metaborong?"
  - Entities: Metaborong (Org), Web3 development (service), DeFi protocols, blockchain, AI agents
  - Citation surface: AI Overview / Perplexity / ChatGPT
```

**B) `docs/content/llms-homepage.txt`** — bullet list of factual claims about Metaborong. Sections: Identity, Services, Founders, Clients, Where to learn more. Each bullet is one sentence, named subject, factual, no marketing fluff. Becomes `public/llms.txt` in Lane C.

Also propose any small revisions to `homepage-v2.md` if a sentence is unextractable (subject elided, fact buried) — apply them inline.

- [ ] **Step 3: Commit**

```bash
git add docs/content/geo-extraction-map.md docs/content/llms-homepage.txt docs/content/homepage-v2.md
git commit -m "docs(content): geo extraction map + llms-homepage.txt + final tweaks"
```

---

# Lane C — Technical SEO additions

> **Lane C can run in parallel with Lane A.** Touches `app/`, `next.config.*`, `public/`. No overlap with Lane A's components.

## Task 17: FAQPage + Person JSON-LD

**Spec reference:** §8.1.

**Files:**
- Modify: `app/page.tsx` (add FAQPage schema)
- Modify: `app/layout.tsx` (add Person schemas, expand Organization with `founder` array)

- [ ] **Step 1: Read current schemas**

Run: `grep -n "Organization\|WebSite\|application/ld" app/layout.tsx app/page.tsx`

Note existing JSON-LD blocks. Spec §8.1 says Organization + WebSite already exist; we add Person + FAQPage.

- [ ] **Step 2: Add Person schemas + expand Organization in `app/layout.tsx`**

Add a new JSON-LD block (do not modify the existing Organization block in place — add a separate `<script>` for each Person, then update Organization's `founder` field to reference them by `@id`):

```tsx
// In app/layout.tsx, near existing JSON-LD:
const founderArnab = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://metaborong.com/#arnab-ray",
  "name": "Arnab Ray",
  "jobTitle": "CEO",
  "worksFor": { "@id": "https://metaborong.com/#organization" },
  "url": "https://metaborong.com/about/",
  // sameAs: LinkedIn URL (placeholder until Task #11 in Open Follow-ups)
};
const founderAnik = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://metaborong.com/#anik-ghosh",
  "name": "Anik Ghosh",
  "jobTitle": "COO",
  "worksFor": { "@id": "https://metaborong.com/#organization" },
  "url": "https://metaborong.com/about/",
};
const founderSoumojit = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://metaborong.com/#soumojit-ash",
  "name": "Soumojit Ash",
  "jobTitle": "CTO",
  "worksFor": { "@id": "https://metaborong.com/#organization" },
  "url": "https://metaborong.com/about/",
};

// In the JSX:
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(founderArnab) }} />
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(founderAnik) }} />
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(founderSoumojit) }} />
```

Then update the existing Organization JSON-LD to add:

```tsx
"@id": "https://metaborong.com/#organization",
"founder": [
  { "@id": "https://metaborong.com/#arnab-ray" },
  { "@id": "https://metaborong.com/#anik-ghosh" },
  { "@id": "https://metaborong.com/#soumojit-ash" },
],
```

- [ ] **Step 3: Add FAQPage schema in `app/page.tsx`**

The FAQPage schema mirrors the existing FAQ section's 8 Q&As. Read `components/sections/faq.tsx` to extract the questions and answers exactly:

```bash
cat components/sections/faq.tsx
```

Then add to `app/page.tsx`:

```tsx
const faqPageSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "<Q1 from faq.tsx>", "acceptedAnswer": { "@type": "Answer", "text": "<A1>" } },
    // ... all 8 Q&As, copying exactly from faq.tsx
  ],
};

// In JSX:
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }} />
```

- [ ] **Step 4: Validate**

In a browser, view-source on `http://localhost:3001/`. Find each `<script type="application/ld+json">` block. Copy each JSON into [https://validator.schema.org/](https://validator.schema.org/) — all should validate clean.

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx app/page.tsx
git commit -m "feat(seo): add FAQPage + Person schemas, expand Organization founders"
```

---

## Task 18: Sitemap + robots

**Spec reference:** §8.3.

**Files:**
- Create: `app/sitemap.ts`
- Create: `app/robots.ts`

- [ ] **Step 1: Create sitemap**

```ts
// app/sitemap.ts
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://metaborong.com";
  const lastModified = new Date();
  return [
    { url: `${base}/`, lastModified, changeFrequency: "weekly", priority: 1.0 },
    // Hub pages added once they ship; until then sitemap = root only.
  ];
}
```

- [ ] **Step 2: Create robots**

```ts
// app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://metaborong.com/sitemap.xml",
    host: "https://metaborong.com",
  };
}
```

- [ ] **Step 3: Verify**

Run: `pnpm dev` (if not already running)
Visit `http://localhost:3001/sitemap.xml` and `http://localhost:3001/robots.txt`.
Both should return 200 with valid content.

- [ ] **Step 4: Commit**

```bash
git add app/sitemap.ts app/robots.ts
git commit -m "feat(seo): add sitemap.ts and robots.ts"
```

---

## Task 19: `public/llms.txt`

**Spec reference:** §8.2.

**Files:**
- Create: `public/llms.txt`

- [ ] **Step 1: Read Lane B's source**

Run: `cat docs/content/llms-homepage.txt`
This was produced in Lane B Task 16.

- [ ] **Step 2: Create the public file**

Format `public/llms.txt` per the llms.txt convention. Use the markdown structure with `# Metaborong` heading and section `##` subheadings. Each entry under a section is a `- [Title](URL): description` line OR a plain factual bullet, depending on what the section serves. Use Lane B's facts as the source.

Skeleton (the actual entries come from Lane B):

```
# Metaborong

> Metaborong is a Web3 development company and AI agent studio. We build DeFi protocols, custom blockchain platforms, AI agents for crypto, and zero-to-one products with founder-led teams.

## Identity
- Founded by Arnab Ray (CEO), Anik Ghosh (COO), and Soumojit Ash (CTO).
- Markets served: United States, Europe.
- Specialisation: Full-stack Web3 development plus AI agent development for blockchain.

## Services
- [Web3 Development](https://metaborong.com/services/web3/): DeFi protocols, decentralised exchanges, lending platforms, crypto wallets, token development.
- [AI Agent Development](https://metaborong.com/services/ai-agents/): autonomous agents for DeFi, AI smart contract auditing, AI DAO governance.
- [Product Studio](https://metaborong.com/services/product-studio/): Telegram MiniApps, SaaS products, Web2-to-Web3 migrations.

## Clients
- KGeN, Bionic, DATA3 AI, Defiverse, GET Smart, SEDAX, Bayan, Memestakes Vault.

## Where to learn more
- Homepage: https://metaborong.com/
- About: https://metaborong.com/about/
- Contact: https://metaborong.com/contact/
```

Lane B's `llms-homepage.txt` content takes precedence over this skeleton — replace bullets with whatever B produced.

- [ ] **Step 3: Verify**

Visit `http://localhost:3001/llms.txt` — should return 200 with the file contents.

- [ ] **Step 4: Commit**

```bash
git add public/llms.txt
git commit -m "feat(seo): add public/llms.txt for AI engine readability"
```

---

## Task 20: Canonical tag audit

**Spec reference:** §8.4.

**Files:**
- Modify: `app/layout.tsx` and/or `app/page.tsx` (add/verify `alternates.canonical`)

- [ ] **Step 1: Read current Metadata**

Run: `grep -n "metadata\|alternates\|canonical" app/layout.tsx app/page.tsx`

- [ ] **Step 2: Verify or add canonical**

Ensure `app/layout.tsx`'s `metadata` export contains:

```ts
export const metadata: Metadata = {
  // ...existing fields
  metadataBase: new URL("https://metaborong.com"),
  alternates: { canonical: "/" },
  // ...
};
```

If `app/page.tsx` exports its own metadata, ensure it also has `alternates.canonical: "/"`. If only one of these is needed (Next.js merges), keep it in `layout.tsx` as the page root.

- [ ] **Step 3: Verify in HTML**

Reload `http://localhost:3001/`. View source, search for `<link rel="canonical"`. Should be present pointing to `https://metaborong.com/`.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx app/page.tsx
git commit -m "feat(seo): verify/add canonical tag pointing to apex"
```

---

## Task 21: Image audit (next/Image migration + alt text)

**Spec reference:** §8.5.

**Files:** any component with `<img>` — modify in place.

- [ ] **Step 1: Find raw `<img>` usage**

Run: `grep -rn "<img" components/ app/ 2>/dev/null`

- [ ] **Step 2: Migrate each to `next/image`**

For each `<img src="..." alt="..." />` found:
- Replace with `<Image src="..." alt="..." width={W} height={H} />` from `next/image`
- Provide explicit `width` and `height` (or `fill` with a sized parent) — required by Next Image
- Ensure `alt` is descriptive (not empty, not generic "image")
- For decorative images: `alt=""` is valid + add `aria-hidden="true"`

Common cases in this codebase:
- Founders avatars (if any) — `alt="Arnab Ray, CEO of Metaborong"` style
- Client logos (trust bar) — currently text-only per Task 6, no images, skip
- M-mark logo — already inline SVG, skip

- [ ] **Step 3: Audit alt text**

Run again: `grep -rn "alt=" components/ app/ | grep -v 'alt=\"\"' | wc -l`
Spot-check each `alt=""` is decorative. Anything questionable, give it real alt text.

- [ ] **Step 4: Verify images render**

Reload site, scroll, no broken images, no Next/Image warnings in console.

- [ ] **Step 5: Commit**

```bash
git add components/ app/
git commit -m "feat(seo): migrate raw <img> to next/Image + audit alt attributes"
```

If no raw `<img>` found, skip the commit and note in the verification log: "no raw <img> in codebase, all alt attributes already present."

---

## Task 22: Redirects + server-render verification

**Spec reference:** §8.4 redirects, §8.6 server-render verification.

**Files:**
- Modify: `next.config.js` or create `next.config.ts`

- [ ] **Step 1: Add redirect rules**

Read existing config: `cat next.config.js 2>/dev/null || cat next.config.ts 2>/dev/null`

Add (or merge into existing config):

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // www.metaborong.com → metaborong.com
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.metaborong.com" }],
        destination: "https://metaborong.com/:path*",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
```

http→https is enforced by Vercel/host platform automatically; if self-hosted, add a host-level redirect — note this in the verification log.

- [ ] **Step 2: Server-render verification**

Run: `pnpm build && pnpm start`
Open `http://localhost:3000/`. View source. Confirm in raw HTML (NOT after JS hydrates):
- Hero H1 text present
- Services 3-card section heading + body text + service lists present
- FAQ Q&As present (if present in current FAQ component)
- All section eyebrows present
- Word count of visible body text ≥ 500 (rough check — use word-count tool on the rendered text)

If anything is missing from raw HTML, identify the offending component (likely a `'use client'` that should be a Server Component for static content) and fix.

- [ ] **Step 3: Commit**

```bash
git add next.config.js
git commit -m "feat(seo): add www→apex 301 redirect + verify server-rendering"
```

---

## Task 23: Integration — drop Lane B copy into Lane A slots

**Spec reference:** §9.1 merge step.

**Files:**
- Modify: `components/sections/hero.tsx`
- Modify: `components/sections/services.tsx`
- Modify: any other proof-section file with SLOT placeholders

- [ ] **Step 1: Open Lane B's locked copy**

Run: `cat docs/content/homepage-v2.md`

Lane B's revised + GEO-passed copy is the source of truth. Copy applies to ALL 10 sections, but this task only edits the 3 proof sections (hero, services, navbar copy is mostly fixed in nav.tsx already and doesn't need slot replacement).

- [ ] **Step 2: Replace hero slots**

In `components/sections/hero.tsx`, replace each `// SLOT:` placeholder with the corresponding final copy from `homepage-v2.md`:
- HERO_EYEBROW
- HERO_H1
- HERO_BLOCKQUOTE (38-word AEO sentence)
- HERO_TRUST_MICROCOPY

Ensure H1 contains primary keyword `web3 development company` and blockquote contains `ai agent development` per spec §7.3.

- [ ] **Step 3: Replace services placeholder copy**

In `components/sections/services.tsx`, replace `description` and `services` array values for each PillarCard with Lane B's locked copy. Ensure:
- Web3 card body contains `web3 development company` + `defi development`
- AI card body contains `ai agent development` + Gap-1 AI-in-Web3 framing
- Product card body matches Lane B output

- [ ] **Step 4: Verify keywords land in raw HTML**

Run: `pnpm build && pnpm start`
Run: `curl -s http://localhost:3000/ | grep -o "web3 development company\|ai agent development\|defi development"`
Expected: each keyword appears at least once. If not, the copy didn't land — re-edit.

- [ ] **Step 5: Visual regression check**

Open `http://localhost:3001/`, scroll, click through CTAs. Confirm nothing broke from the copy swap (long sentences may overflow if hero is too narrow — adjust `max-w` if needed).

- [ ] **Step 6: Commit**

```bash
git add components/sections/hero.tsx components/sections/services.tsx
git commit -m "feat(content): drop Lane B locked copy into proof-section slots"
```

---

## Task 24: Final verification + code review prep

**Spec reference:** §9.4 verification gates per lane.

**Files:** none — verification only.

- [ ] **Step 1: Lane A gates**

- [ ] Dev server runs without errors: `pnpm dev` → no console errors on load or scroll
- [ ] All 4 viewport widths render cleanly: 375, 768, 1280, 1536. No horizontal scroll. Hover/motion work.
- [ ] `prefers-reduced-motion` respected — toggle in DevTools, reload, verify reveals/lifts are instant.

- [ ] **Step 2: Lane B gates**

- [ ] `docs/content/homepage-v2.md` complete for all 10 sections
- [ ] `docs/content/seo-audit-homepage-v2.md` exists, every section scored
- [ ] `docs/content/geo-extraction-map.md` exists, every section mapped
- [ ] `docs/content/llms-homepage.txt` exists, factual bullets only

- [ ] **Step 3: Lane C gates**

- [ ] `http://localhost:3000/sitemap.xml` returns 200
- [ ] `http://localhost:3000/robots.txt` returns 200, references sitemap
- [ ] `http://localhost:3000/llms.txt` returns 200
- [ ] All `<script type="application/ld+json">` blocks validate at https://validator.schema.org/
- [ ] `<link rel="canonical" href="https://metaborong.com/" />` present in `<head>`
- [ ] Raw HTML word count of visible body copy ≥ 500
- [ ] No raw `<img>` tags in components (or zero raw `<img>` to begin with — note in log)

- [ ] **Step 4: Lighthouse smoke (optional but recommended)**

Run Lighthouse on `http://localhost:3000/` (production build via `pnpm build && pnpm start`). Note scores for Performance, Accessibility, Best Practices, SEO. Target SEO ≥ 90, Accessibility ≥ 90. If Performance is low, log it as a follow-up — not a blocker for this iteration.

- [ ] **Step 5: Update CHANGELOG**

Add a new entry to `CHANGELOG.md` under `## [Unreleased]` (or move it under the date block):

```markdown
## 2026-04-30 — Homepage Premium Iteration

### Added
- Locked design system tokens in `app/globals.css` (type scale, spacing rhythm, color roles, motion grammar)
- `components/ui/section-header.tsx` — reusable section header primitive
- `components/ui/cta.tsx` — 3 locked CTA variants
- `components/ui/pillar-card.tsx` — reusable card pattern with cursor-trace signature motion
- `components/layout/services-dropdown.tsx` + `components/layout/mobile-menu.tsx`
- FAQPage + Person JSON-LD schemas
- `app/sitemap.ts`, `app/robots.ts`, `public/llms.txt`
- `next.config.js` redirect rules (www→apex)

### Changed
- Hero rebuilt per spec §4 with locked rhythm, orb color discipline applied
- Services rebuilt with PillarCard composition (proof section)
- Navbar restructured (sticky frosted, dropdown, fullscreen mobile)
- Trust bar: eyebrow anchor + mono uppercase treatment
- Orb: ambient nodes desaturated, AI pillar color desaturated, edges thinner, HUD scan-line removed

### Content
- `docs/content/homepage-v2.md` — full SEO/AEO/GEO-disciplined copy for all 10 sections
- `docs/content/seo-audit-homepage-v2.md` — content audit
- `docs/content/geo-extraction-map.md` — passage-level AI-citation map
- `docs/content/llms-homepage.txt` — source for public/llms.txt

### Deferred (open follow-ups)
- Roll out new system + drafted copy to remaining 7 sections (why us, work preview, testimonials, founders, comparison, FAQ, contact CTA, footer)
- Account-side technical SEO: Google Search Console verification, GA4 setup, Cloudflare CDN
- Service hub pages (3) and individual service pages (14)
```

- [ ] **Step 6: Commit + invoke requesting-code-review**

```bash
git add CHANGELOG.md
git commit -m "docs: log homepage premium iteration in CHANGELOG"
```

Then: `Skill: superpowers:requesting-code-review` — branch `feature/premium-homepage-v2`, spec `docs/superpowers/specs/2026-04-30-homepage-premium-iteration-design.md`.

After review passes, finishing the branch handled by `superpowers:finishing-a-development-branch`.

---

## Self-Review (run after writing this plan, fix inline)

**Spec coverage:**
- §3 Visual system → Tasks 1, 2, 3 (tokens, header, cta) ✓
- §4 Hero → Tasks 4 (orb), 5 (hero), 6 (trust bar) ✓
- §5 Services → Tasks 7 (PillarCard), 8 (services section) ✓
- §6 Navbar → Tasks 9, 10, 11 ✓
- §7 Content pipeline → Tasks 13, 14, 15, 16 ✓
- §8.1 Schema → Task 17 ✓
- §8.2 llms.txt → Task 19 (Lane C) sources from Task 16 (Lane B) ✓
- §8.3 Sitemap + robots → Task 18 ✓
- §8.4 Canonical + redirects → Tasks 20, 22 ✓
- §8.5 Image audit → Task 21 ✓
- §8.6 Server-render verification → Task 22 step 2 ✓
- §9 Dispatch + verification gates → Task 24 ✓

**Placeholder scan:** Done — no "TBD" or "implement later". Lane B inputs (Tasks 13-16) intentionally describe deliverables since the *skill* produces the content; the brief structure for each skill is concrete.

**Type consistency:** PillarCard's `pillar` prop is `"WEB3" | "AI" | "PRODUCT"` (Task 7) and matches Task 8 usage. CTA variants are `"primary" | "secondary" | "ghost"` consistently. SectionHeader theme is `"light" | "dark"` consistently.

**Open file-path nits resolved:**
- Nav lives at `components/layout/nav.tsx` (existing), not `components/nav.tsx`. Plan corrected.
- Spec mentioned `components/nav/services-dropdown.tsx`; plan places it at `components/layout/services-dropdown.tsx` (matches existing nav location). Same for mobile-menu.

---

**Plan complete.**
