# Founders copy audit — baseline (2026-05-19)

A3 sub-chain step (a). Audits the **currently shipped** Founders copy in
`components/sections/founders.tsx` to set a scored baseline the rewrite must beat.
Lens: `seo-content-auditor` + `copywriting` (claim discipline, anti-agency-speak).

## Source under audit (shipped JSX, verbatim)

- **Eyebrow:** `The team`
- **H2:** `We are a team of independent developers and designers.`
- **Lede:** `Three people, shown with a taller portrait treatment and a lighter, more premium brand-forward background.`
- **Cards:** `Arnab Ray — CEO & Co-Founder` · `Anik Ghosh — COO & Co-Founder` ·
  `Soumojit Ash — CTO & Co-Founder` — no bios; per-card link label `LinkedIn`.

Section job (from `homepage.md` BRIEF): E-E-A-T anchor — prove the work is done by
named, reachable, technical co-founders, not a sales layer. Audience arrives convinced
of pillars/portfolio/reviews, asking "who actually builds this".

## Content Audit Report

| Category | Score | Issues Found | Recommendations |
|----------|-------|--------------|-----------------|
| Content Depth | 2/10 | No bios shipped — names + role titles only. Zero substance on what each founder actually does or has done. | Add a one-line role+proof bio per founder (verb-led, specific). |
| E-E-A-T Signals | 1/10 | Section that exists to carry Experience/Expertise/Authority/Trust ships none: no expertise statements, no domain proof, no verifiable credential. LinkedIn present only as bare text label. | Per-founder expertise line + named LinkedIn affordance per person; lede that asserts hands-on involvement. |
| Readability | 4/10 | H2 is a flat generic sentence. Lede is **developer placeholder text describing the layout** ("taller portrait treatment… brand-forward background") — not user-facing copy. Critical defect. | Replace lede with a real trust statement; sharpen H2. |
| Keyword / Semantic Relevance | 2/10 | Nothing ties founders to the studio's Web3 **and** AI entity. "Independent developers and designers" undersells senior co-founders and is semantically off-entity. | Surface Web3/AI technical authority in bios (equal-weight, per positioning lock). |
| Structure / Formatting | 5/10 | Eyebrow + H2 + lede + 3 cards scaffold is sound; content inside it is empty/placeholder. | Keep scaffold; fill with substantive copy. |
| Trust Indicators | 2/10 | "independent developers" reads freelance/looser than reality; no "you work directly with founders" signal; no delivery/operational proof. | Add the "hands-on, no contracting layer, in Slack with you" trust payload. |

**Baseline content-quality score: 2.7 / 10** (weighted toward Depth + E-E-A-T + Trust,
which this section exists to deliver and currently does not).

## Copywriting-lens findings

- **Lede is unshippable.** It is internal layout-direction text, not marketing copy.
  Highest-severity defect — fix is non-optional.
- **"We are a team of independent developers and designers"** — generic agency line;
  undersells co-founders; "independent" leaks a freelance frame onto a trust section.
- **No unverifiable claims present** (because there are essentially no claims at all).
  The rewrite must *add* substance while staying inside claim discipline — bios get a
  `[role verb] + [specific, true proof]` shape; proof that isn't verifiable stays a
  `USER_INPUT` placeholder (fabricated specifics damage E-E-A-T more than absence).
- **Positioning guard:** bios must carry Web3 **and** AI with equal weight (never
  Web3-first) per the positioning lock.

## Targets the rewrite must hit (step d re-score gate)

- Content-quality score **> 2.7/10** baseline — target **≥ 7.5/10**.
- Real, shippable lede (no placeholder/layout text).
- Per-founder bio with role-verb + specific proof (USER_INPUT where unverifiable).
- E-E-A-T payload explicit: named, reachable (LinkedIn per person), hands-on, technical.
- Web3/AI equal-weight; no agency-template lines ("Leads strategy, client
  relationships, and business direction" is pre-banned in `homepage.md` WHY).
- Anti-AI guardrails pass (step g).

---

## Re-score — post-rewrite (A3 step d)

Source: `homepage.md` Founders block after steps b–c.

- **Eyebrow:** `The team` (renders `THE TEAM`)
- **H2:** `The team behind the work`
- **Lede (38w):** "Metaborong's three co-founders are hands-on in every Web3 and AI
  engagement. The work in our portfolio was built by us, not by a contracting layer we
  manage. You'll be in Slack with the people writing your code."
- **Bios:** Arnab — "Co-founded Metaborong and sets its direction across Web3 and AI
  engagements." · Anik — "Co-founded the studio and owns delivery. Engagements ship on
  schedule because Anik says no when they can't." · Soumojit — "Co-founded the studio
  and owns the architecture under every Web3 protocol and AI system it ships."

| Category | Baseline | New | Δ | Note |
|----------|----------|-----|---|------|
| Content Depth | 2/10 | 7/10 | +5 | Every founder now has a verb-led role+scope bio. Generic-but-true by user choice; USER_INPUT swap pending for named specifics (caps it below 9). |
| E-E-A-T Signals | 1/10 | 8/10 | +7 | Named, role-titled, reachable (per-person LinkedIn), explicitly hands-on, technical. Co-founder status = verifiable. |
| Readability | 4/10 | 9/10 | +5 | Placeholder/layout lede eliminated. Standalone first sentence; short scannable bios. |
| Keyword / Semantic Relevance | 2/10 | 8/10 | +6 | Metaborong entity named; Web3 AND AI equal-weight in lede + 2 bios. AEO-extractable sentence 1. |
| Structure / Formatting | 5/10 | 8/10 | +3 | Same sound scaffold, now fully populated; lede kept (E-E-A-T anchor). |
| Trust Indicators | 2/10 | 8/10 | +6 | "Built by us, not a contracting layer", "in Slack with the people writing your code", per-founder ownership. "independent/freelance" frame removed. |

**New content-quality score: 8.0 / 10** (vs **2.7** baseline → **+5.3**, gate passed).
Ceiling held below 9 by the deliberate generic-but-true proof (user chose to ship
generic now, swap real specifics later) and Soumojit's pending LinkedIn URL.

---

## E-E-A-T enhancement plan (A3 step e — seo-authority-builder)

Current E-E-A-T (this section): **8/10** · Target: **9/10**

**Existing authority signals (keep):**
- `lib/schema.ts` already emits `Organization.founder[]` as `Person` (name, jobTitle,
  `worksFor` → ORG_ID). Visible bios now assert the **same** entity facts (co-founder,
  CEO/COO/CTO, Web3+AI) → visible/structured consistency is itself an E-E-A-T signal.
- Per-founder visible LinkedIn affordance (reachability = Trust).

**Priority actions:**
1. **[IN SCOPE — founders.tsx]** Each founder's LinkedIn renders as a real, named,
   reachable link: `rel="noopener"` `target="_blank"`, accessible name
   `"<Name> on LinkedIn"`, ≥44×44 tap target, focus-visible ring. Do **not** ship a
   broken/guessed link — Soumojit's URL is pending, so his card must degrade gracefully
   (no link, or link omitted) rather than 404 (a 404 is a negative Trust signal).
2. **[IN SCOPE — copy, done]** Bios keep verb-led role + true scope; no fabricated
   credentials (fabrication is a net-negative E-E-A-T move). Web3+AI equal-weight.
3. **[DEFERRED — OUT OF WORKTREE SCOPE]** Add per-founder `sameAs: [linkedin]` to the
   `Organization.founder[]` `Person` objects in `lib/schema.ts`. **Highest-value entity
   lever** (connects each founder to their LinkedIn entity for the Knowledge Graph) but
   `lib/schema.ts` is a **shared surface owned by the main session** (Terminal B owns
   only `founders.tsx` + homepage.md Founders block). Editing it here would re-create
   the cross-worktree conflict the plan's merge-back section avoids. → Log as a
   follow-up for the main session at/after merge; record in the section spec.
4. **[DEFERRED — pending USER_INPUT]** Swap generic-but-true proof for named,
   verifiable specifics; verify Soumojit's LinkedIn URL. Raises Depth 7→9, E-E-A-T 8→9.

**Net:** in-scope actions hold E-E-A-T at 8/10 for this redesign; 9/10 requires the two
deferred items (shared-file schema `sameAs` + real specifics), correctly handed off
rather than forced into this worktree.

---

## Claim-discipline GATE (A3 step f — copywriting)

Pass/fail audit of every assertion in the locked copy. No fabricated data, no implied
guarantees, no unverifiable specifics.

| Clause | Verdict | Note |
|--------|---------|------|
| H2 "The team behind the work" | PASS | No claim. |
| Lede "three co-founders … hands-on in every Web3 and AI engagement" | PASS | Operating-model self-description (owner-confirmable), not a measured stat. |
| Lede "built by us, not by a contracting layer we manage" | PASS | Delivery-model fact, owner-confirmable. |
| Lede "in Slack with the people writing your code" | PASS | Concrete process claim, no outcome guarantee; Slack already referenced site-wide. |
| Arnab "Co-founded Metaborong and sets its direction across Web3 and AI" | PASS | Co-founder verifiable; CEO role description. |
| ~~Anik "Engagements ship on schedule because Anik says no when they can't"~~ | **FAIL → FIXED** | "ship on schedule" = implied performance guarantee, no proof. Rewritten: *"Co-founded the studio and owns delivery, and the scope discipline that keeps timelines honest."* Keeps the true mechanism, drops the absolute outcome. |
| Soumojit "owns the architecture under every Web3 protocol and AI system it ships" | PASS | CTO role/scope description, owner-confirmable, no fabricated specifics. |

**Gate result: PASS** after the single Anik fix. No fabricated stats/testimonials/
guarantees remain. Generic-but-true proof clauses are explicitly placeholdered
(USER_INPUT) per claim-discipline ("if proof is missing, mark placeholders clearly").

---

## Anti-AI guardrails vet (A3 step g — docs/writing-guardrails.md)

| Check | Result |
|-------|--------|
| Banned words (leverage/robust/crucial/showcase/…) | PASS — none present. |
| Significance inflation ("pivotal moment", "testament to") | PASS — none. |
| -ing significance tails | PASS — no trailing participle significance clause. |
| Padded rule-of-three / tricolons | PASS — no padded triads. |
| Negative parallelism ("not X, but Y") | PASS — exactly one ("built by us, not by a contracting layer"), earned + specific, within the ≤1 budget. |
| False ranges ("from X to Y") | PASS — "Web3 and AI" is a real two-pillar spectrum, not fake comprehensiveness. |
| "serves as / represents" vs "is" | PASS — direct copulatives ("are hands-on", "was built", "owns"). |
| Promotional puffery ("boasts", "world-class") | PASS — none. |
| Opening-with-context | PASS — lede sentence 1 is the point. |
| "Could be about a different company?" | PASS — named entity, Slack detail, contracting-layer contrast, per-founder role scope. Generic-but-true bios are the deliberate, user-chosen ceiling (real specifics pending USER_INPUT). |

**Micro-tighten applied:** Anik bio doubled `and … and` → semicolon
("Co-founded the studio; owns delivery and the scope discipline that keeps timelines
honest.") — clarity per copywriting; no em-dash (project treats em-dash as a tell).

**Vet result: PASS.**

---

## A3 sub-chain — locked copy (sync target for founders.tsx, step 7)

- **Eyebrow:** `The team` → renders `THE TEAM`
- **H2:** `The team behind the work` (visual: "the work" in `--color-brand`, per spec)
- **Lede:** `Metaborong's three co-founders are hands-on in every Web3 and AI engagement. The work in our portfolio was built by us, not by a contracting layer we manage. You'll be in Slack with the people writing your code.`
- **Arnab Ray** — `CEO & Co-Founder` — `Co-founded Metaborong and sets its direction across Web3 and AI engagements.` — LinkedIn `https://linkedin.com/in/arnab-ray`
- **Anik Ghosh** — `COO & Co-Founder` — `Co-founded the studio; owns delivery and the scope discipline that keeps timelines honest.` — LinkedIn `https://www.linkedin.com/in/anik-ghosh-01a985208/`
- **Soumojit Ash** — `CTO & Co-Founder` — `Co-founded the studio and owns the architecture under every Web3 protocol and AI system it ships.` — LinkedIn **pending** (no verified URL; card must degrade gracefully, no 404)

Final score **8.0/10** (baseline 2.7) · claim gate PASS · guardrails PASS.
