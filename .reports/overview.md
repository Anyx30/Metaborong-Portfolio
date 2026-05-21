# Services Overview — Template A build report

Scope: SERVICES_PLAN.md § 3 Template A + § 7 outcome strip & CTAs. Builds
`components/services/services-overview.tsx` and wires `app/services/page.tsx`
to render it at `/services/`.

## Files changed / added

- **NEW** `components/services/services-overview.tsx` — single server-component
  template composing the seven Template A blocks: hero, outcome strip
  (4 cards), 3-pillar grid (v1 leaves only), engagement-model strip
  (Discovery → Build → Operate), trust band (`TrustBar` marquee +
  `ClutchWidget`), 5-FAQ block, and `ContactCtaSection` reuse.
- **NEW** `app/services/page.tsx` — route entry. `Nav` + `<main>{ServicesOverview}</main>` + `Footer`. `generateMetadata` emits the
  SERVICES_PLAN § 4 title (`Services — AI, Web3, Product Studio — Metaborong`),
  description (118 chars, ≤160), canonical URL, and OpenGraph. Indexable
  (no `robots: noindex`); the overview is v1 content, not a stub.

## Hero copy — entity-definition opener

143-word lede opening `Metaborong is a boutique engineering studio that
builds production AI systems, on-chain protocols, and greenfield SaaS
products for founders and crypto-native teams.` Fits the 130–180 word
band per § 3 Template A. References three verifiable proof points:
agentic AI at PredictRAM and SunsetML, the Aadhaar-integrated DID stack
at GovTech scale, and DeFi protocols across EVM, Solana, and Cosmos.

Primary CTA `Talk to us` (3 words, split-arrow primary). Secondary
`Read case studies` (ghost, links to `/#work`). Both use the approved
verb list (Talk, Read) per DESIGN.md.

## Outcome strip — § 7 four-outcome routing

Four cards, one line of clarifier each:

| Card                                  | Clarifier                                                          | Destination                                                |
|---------------------------------------|--------------------------------------------------------------------|------------------------------------------------------------|
| Launch a new product                  | Zero-to-launch builds for founders without an in-house CTO.        | `/services/product-studio/mvp-development/`                |
| Add AI to your product                | Architect and harden LLMs inside your existing product stack.      | `/services/ai/llm-integration-architecture/`               |
| Launch a token or DeFi protocol       | Tokenomics, smart contracts, and audit-ready protocol engineering. | `/services/web3/`                                          |
| Build a verified-identity / DID system| Aadhaar-integrated DID stacks and UIDAI-aware credentials.         | `/services/web3/decentralized-identity-did-integration/`   |

Each card is a single `<a>` tap target, ≥44px min height, with an
`Open ↗` affordance + brand-color hover.

## Pillar grid — v1 leaves only (CRITICAL)

`getPillarV1Groups(pillar)` filters each sub-group to
`status === 'published'` leaves, caps at 3 per group, drops sub-groups
with zero v1 leaves, and surfaces overflow as `+N more on the hub`.
**Coming-soon leaves never appear on this page** — they are filtered
out at the data layer, not hidden via CSS.

Per-pillar render counts (verified against `services-data.ts`):

| Pillar          | Strategy v1 | Product v1 | Engineering v1 | Visible / Total | Overflow         |
|-----------------|-------------|------------|----------------|------------------|------------------|
| Web3            | 1           | 1          | 4 → cap 3      | 5 / 6            | +1 more on the hub (engineering) |
| AI              | 1           | 2          | 3              | 6 / 6            | —                |
| Product Studio  | 1           | 3          | 0 → hidden     | 4 / 4            | engineering sub-group dropped from card |

Each card carries the pillar's 3px left bar (Web3 `#296ff0`, AI
`#10b981`, Product Studio `#F6851B`), pillar number `[01/02/03]`, label,
2-sentence body from `pillars[].body`, the grouped leaf list, and a
pillar-coloured `Open {pillar}` CTA in JetBrains Mono uppercase.

## Engagement model strip

Three numbered panels in one bordered grid (one row on lg+, stacked on
mobile with `border-b` between rows):

- `[01] Discovery — 1–2 wks` → scoped sprint, written approach.
- `[02] Build — 4–16 wks` → senior team owns architecture through deployment.
- `[03] Operate — Ongoing` → post-launch retainers, only when wanted.

Plain text, no signature visual — anchors the engagement vocabulary so
pillar hubs and leaf pages can echo it without re-explaining.

## Trust band

Reuses two existing components verbatim:

1. `TrustBar` — full-bleed 10-client logo marquee (already shipped, the
   site's only approved infinite animation).
2. `ClutchWidget` — official 4.9-on-Clutch widget centred under an
   `Independently rated` eyebrow, with the existing `sr-only`
   accessible-name fallback (`Metaborong is rated 4.9 out of 5 on Clutch`).

## FAQ — 5 services-overview Q&As

Authored per SERVICES_PLAN.md § 3 Template A:

1. **How do engagements typically start?** — 30-min call, written approach, no pitch deck, 12-hr reply.
2. **What is a typical engagement length?** — 4–12 wks for most builds; 8–16 wks for DeFi / SaaS / DID.
3. **Where is the team based?** — Remote-first; senior engineering anchored in India; UIDAI/Aadhaar GovTech work.
4. **Who owns the IP and the code?** — Client owns on delivery; anonymised case studies only with sign-off.
5. **Do you work on retainer or fixed-bid?** — Both; default to fixed-bid for first engagements.

Implemented with native `<details>` / `<summary>` — server-rendered,
JS-free, keyboard-accessible. Chevron rotates via CSS sibling selector;
animation short-circuited under `prefers-reduced-motion: reduce` via a
scoped `<style precedence="default">` block.

## Contact CTA

Reuses `components/sections/contact-cta.tsx` verbatim — dark canvas,
mailto split-arrow primary, `contact@metaborong.com` ghost link.

## DESIGN.md compliance

- All values use design tokens (no raw hex outside the pillar-colour
  inline styles, which are sourced from `pillars[].color` — the single
  source of truth per DESIGN.md § Color § Pillar color rule).
- Eyebrows use the `<Eyebrow>` primitive everywhere.
- Section padding via `<Section>` primitive — no inline `padding`
  overrides.
- Bauhaus button finish: `<Button arrow="→">` split-arrow primary for
  the hero CTA; ghost for the secondary.
- Cards are square corners (no `rounded-*`), borders-first per
  Swiss-engineering posture.
- Tap targets ≥44×44px on every clickable surface (outcome cards,
  pillar leaf links, FAQ summaries, pillar CTAs).
- Tab order matches visual reading order (hero → outcome → pillars →
  engagement → trust → FAQ → contact CTA).
- `focus-visible:ring-2 focus-visible:ring-brand` on every interactive
  element.
- No banned marketing words (`revolutionary`, `game-changing`,
  `best-in-class`, `cutting-edge`, `world-class`) — verified by grep.
- No infinite animations introduced beyond the already-approved
  `TrustBar` marquee.

## Verification

- `npx tsc --noEmit` — clean.
- `npm run lint` — no errors or warnings in the new files
  (`components/services/services-overview.tsx`, `app/services/page.tsx`).
  Pre-existing lint output in unrelated files is unchanged.
- `npm run build` — succeeded. `/services` is prerendered as static
  content (○), confirming the route is a pure server component.

## Risks / follow-ups

- **Pillar hub links** (`/services/{pillar}/`) currently resolve to a
  placeholder per the existing `[pillar]/page.tsx`. Pillar Hub template
  (Template B) is the next ticket per `.reports/pillar-hub.md` —
  overview links into it once shipped. No action needed here.
- **Schema emission**: SERVICES_PLAN.md § 5 specifies `BreadcrumbList`
  + `ItemList` of `Service` references for `/services/`. Not emitted by
  this build; out of scope for the Template A component task. Wire-up
  belongs in `app/services/page.tsx` (or `lib/schema.ts`) in a
  follow-up. The page is indexable today; schema can be layered in
  without re-rendering the component.
- **FAQ JSON-LD**: a `FAQPage` schema block for the 5 overview Q&As
  could go in `app/services/page.tsx` alongside the schemas above.
  Same follow-up as the breadcrumb/ItemList work.
