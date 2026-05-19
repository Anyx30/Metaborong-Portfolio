# ContactCta + Footer — A3 Copy Audit (baseline)

**Date:** 2026-05-19
**Scope:** `components/sections/contact-cta.tsx` + `components/layout/footer.tsx`
**Chain:** A3 step 1 (audit FIRST) — `seo-content-auditor` + `copywriting` lenses.
**Baseline source:** `docs/content/homepage.md` §[CONTACT CTA] (474–498) / §[FOOTER]
(502–508); JSX `contact-cta.tsx`, `footer.tsx`.
**Purpose:** establish the score the A3 rewrite must **beat**; if it cannot, the
locked copy stays (A3 step-4 gate).

---

## A. ContactCta — audit of current locked copy

Baseline strings (Session-15 rewrite, documented WHY in `homepage.md`):

- **H2:** `Tell us the build. We'll send the approach.`
- **Sub (18w):** `No pitch deck. No discovery-call gauntlet. Just a written approach you can take or leave.`
- **Primary CTA (3w):** `Email us →` → `mailto:contact@metaborong.com?subject=New%20project%20inquiry`
- **Risk reducer:** `Most teams hear back within 12 hours.`
- **Secondary:** `contact@metaborong.com`

| Category | Score | Issues | Recommendation (rewrite must clear the gate, not just change) |
|---|---|---|---|
| Purpose fitness (conversion) | 8.0/10 | Already tight: action+outcome H2, objection-removal sub, 3-word CTA, risk reducer. | Preserve the single-action discipline. Do **not** add a second competing CTA. |
| E-E-A-T | 6.5/10 | "Most teams hear back within 12h" is good but generic; doesn't leverage the site's strongest asset — **founder-reachability** (TRUST SIGNALS: "Founders reachable directly — no account manager layer"; Founders section is the E-E-A-T anchor). | Tie the reply promise to a **named/founder** channel **only if verifiable** (e.g. "a founder reads every one"). Claim-gate must pass. |
| Readability | 9.0/10 | Short, plain, scannable. | No change needed. |
| Topical/keyword reinforcement | 6.0/10 | End-of-page CTA names neither pillar; misses a cheap topical-relevance + AEO reinforcement at the page tail. | Optionally one **natural** clause naming Web3 **and** AI equally (positioning memory: never Web3-first). Must not bloat the sub past ~20w or dilute the single idea. |
| Claim discipline (copywriting) | 8.5/10 | No unverifiable claims; "12 hours" is soft/defensible and mirrors the hero eyebrow. | Any new founder/reply claim must be true and non-quantified unless verifiable. |

**Baseline composite ≈ 7.6/10.** Rewrite objective: keep conversion strength, *add*
a verifiable founder-reachability E-E-A-T beat and an optional natural Web3+AI
topical clause. **If the rewrite does not beat 7.6 on E-E-A-T + topical without
losing the single-action clarity, the locked copy stays** (gate, not vanity edit).

**Doc↔design drift to reconcile in A3 step 2 (`homepage.md` first):**
- §[CONTACT CTA — **dark section**] heading + "Notes for Visual Design" line
  `Dark contact CTA section: #0a0a0a background` are now **stale** — the Figma
  redesign (233:261) flips this section to **light**. Reconcile both to "light"
  when editing `homepage.md`.
- Figma frame copy ("Got a project in mind?" / "Start a conversation") is the
  **older generic copy this section already replaced** (see `homepage.md` WHY
  note) — Figma is visual reference only, **not** a copy source here.

## B. Footer — audit (mostly a *create*)

Existing footer copy is **minimal/utility** and **stale vs. the approved design**:

- `homepage.md` §[FOOTER]: nav `Services · Work · About · Blog · Contact`;
  social `LinkedIn · X · Dribbble`; `© 2026 Metaborong Technologies`.
- `footer.tsx`: links `Services/Work/About/FAQ/Contact`; LinkedIn + X; static
  `© 2026`.

| Category | Score | Issues | Recommendation |
|---|---|---|---|
| Copy completeness vs. approved IA | 3.0/10 | No positioning line, no offices/NAP, no Services grouping, stale social (`Dribbble` not in code; Behance/Medium/Discord not present), static year. | This is a **create**: write the new blocks (A3 step 3), don't "fix" the old. |
| Claim discipline | n/a→PASS | Offices (India/UAE/USA) flagged as registered-agent/`000000`-looking. | **User-verified correct 2026-05-19** → claim-gate satisfied (client is the authority). Record provenance in the spec. |
| Legal/entity accuracy | 6.0/10 | Static `© 2026`; Figma shows buggy `@2026`. | Dynamic year; entity string `Metaborong Technologies`; **no** Privacy/Terms row (no such pages — user-confirmed; omitting a dead link is correct). |
| Nomenclature consistency | 5.0/10 | Footer/nav/homepage use different labels ("Services" vs "Work" vs pillar names). | Lock labels to site nomenclature: Company (Work/About/Blog/FAQ/Contact) · Services (Web3/Blockchain, AI Agents, Product Studio → `/#services`). |

**Footer copy to *write* (A3 step 3):** one positioning one-liner near the
wordmark (Web3 **and** AI equal, claim-safe), the four column headings
(utility — terse, DESIGN.md mono-eyebrow grammar), the legal line, and
office labels. Everything else is links/addresses, not prose.

---

## C. SEO / internal-linking advisory (user add-on — recommendations only, NOT implemented here)

> Out of this redesign's scope to *implement* (indexing strategy is a deliberate
> prior decision). Surfaced so the lever is visible.

1. **The real SEO lever is not footer links — it's the noindex.** All ~19 service
   pages + pillar hubs are `robots:{index:false, follow:false}`
   (`app/services/[pillar]/page.tsx:14,18`, `[slug]/page.tsx:17,21`; CLAUDE.md
   confirms intentional). `nofollow` also strips internal link equity, so footer
   links to them pass **zero** SEO value today. → *Separate follow-up:* pick the
   service slugs with real search demand, replace the stubs with unique indexable
   content, then link those from the footer. Until then, footer Services → the
   indexable homepage `/#services` anchor (already the approved decision).
2. **NAP / entity authority (highest-value, low-effort).** Three verified office
   addresses → add `address` / multiple `PostalAddress` (or `location`) to the
   `Organization` JSON-LD in `lib/schema.ts`, **byte-consistent** with the footer
   text. Legit entity + potential local signal; pairs with the Founders
   `sameAs` follow-up already deferred. *(Recommend; not in this redesign's
   component scope — `lib/schema.ts` is a shared surface.)*
3. **Internal linking depth.** Footer `/#…` are same-page anchors → no new crawl
   paths. Real gain = cross-linking blog ↔ *indexable* landing/service pages.
   Run `seo-aeo-internal-linking` once 3+ indexable pages exist (SESSIONS.md C2).
4. **Social `rel="me"`.** On the *real* verified profiles (LinkedIn, X) add
   `rel="me"` for entity disambiguation. The temporary homepage-redirect social
   links (Behance/Medium/Discord) must **not** carry `rel="me"` (would assert a
   false identity) — add it only when real URLs land.
5. **Wordmark as text, not raster.** Rendering "METABORONG" as live text keeps a
   crawlable brand token at the page tail; the Figma raster gives zero. (Already
   the approved deviation.)

---

## Verdict

- **ContactCta:** baseline 7.6/10. Proceed to A3 rewrite with two explicit
  targets (founder-reachability E-E-A-T, optional Web3+AI topical clause);
  **gate**: must beat 7.6 without losing single-action clarity, else keep locked.
- **Footer:** *create* — write the new blocks; claim-gate already cleared by
  user-verified offices.
- **Advisory C** handed to follow-up; not implemented in this redesign.
