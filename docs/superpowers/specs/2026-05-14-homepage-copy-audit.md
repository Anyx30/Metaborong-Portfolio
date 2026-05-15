# Homepage Copy Audit — Below Services

**Date:** 2026-05-14
**Scope:** 7 sections below Services on `/` (Hero → TrustBar → Problem → Services are out of scope per user — already optimised).
**Lens:** `copywriting` (claim discipline, benefit/outcome, one-idea-per-section) + `seo-content-auditor` (E-E-A-T, AEO, readability) + anti-AI-slop checks (em-dash overuse, abstract nouns, tricolons, generic agency clichés).

---

## Summary

Of 7 sections audited: **0 keep-as-is, 4 sharpen, 1 shrink, 1 merge, 1 cut-candidate**.

| # | Section | Recommendation | One-line reason |
|---|---|---|---|
| 1 | Why Us | **SHARPEN** | Structure is sound. Headlines weak, bodies wordy, tag colours random. |
| 2 | Work Preview | **SHARPEN + add proof** | Empty thumbnails + "Read more →" links to `/#contact` (broken promise — no case studies exist yet). Each card needs a one-liner outcome. |
| 3 | Testimonials | **SHRINK + relabel** | "Voices of trust" is the worst agency-speak on the page. Two quotes are anonymous ("Client"). Two are from same company (Create Protocol). Quality bar is low. |
| 4 | Founders | **SHARPEN** | Bios are interchangeable agency-template. No proof of "hands-on delivery" claim. |
| 5 | Comparison | **SHARPEN** | Honest framing is the section's strength. "8 shipped products" claim needs verification. Headline + intro missing. |
| 6 | FAQ | **MERGE/CUT 2** | 8 entries, 2 redundant with Services section, 1 anaemic. Reduce to 5-6 high-signal Qs. |
| 7 | Contact CTA | **SHARPEN** | Headline "Got a project in mind?" is generic. Subcopy is OK. Add risk-reduction. |

**Cut-candidate flagged at decision gate:** none warrant full removal. Closest to a cut is Testimonials — see section 3 below.

---

## 1. Why Us (`components/sections/why-us.tsx`)

| Field | Finding |
|---|---|
| Word count | 99 across 3 cards + H2 |
| Purpose | Yes — answers "why hire you over alternatives" |
| Tone read | Mixed. Decent specifics ("ship in weeks, not quarters") next to flat clichés ("Direct communication, fast decisions, fewer handoffs" — generic tricolon). |
| AI-slop flags | One tricolon (above). "Pressure-test assumptions" — borderline jargon but tolerable. No slop tokens. |
| Claim audit | "Ship in weeks, not quarters" — verifiable from portfolio? **NEEDS USER CONFIRM.** |
| E-E-A-T | 5/10 — no named projects, no time-to-ship numbers, no founder names tied to claims |
| AEO readiness | 6/10 — bodies are citable but H3s are vague ("Niche depth where it counts") |
| Readability | "Multichain Web3 architecture. DeFi primitives. AI agent orchestration." — three sentence fragments. Stylish but skim-hostile. |
| Redundancy | "Lean, senior team" overlaps Founders' "technical co-founding team" — fine; reinforces. |
| **Recommendation** | **SHARPEN.** Keep 3-card structure. Rewrite H3s to be outcome-shaped not theme-shaped. Replace tricolons with one concrete sentence each. Add one number per card if available. Tag colours are arbitrary — drop or unify. |

---

## 2. Work Preview (`components/sections/work-preview.tsx`)

| Field | Finding |
|---|---|
| Word count | 24 (just project names + categories) |
| Purpose | Yes — but currently *fails* the promise: every "Read more →" points to `/#contact` not a case study page. Visitor is led to expect detail that doesn't exist. |
| Tone read | N/A — no body copy. |
| AI-slop flags | None — there's barely any copy. |
| Claim audit | "What we've built" + 4 named projects — names are verifiable. |
| E-E-A-T | 3/10 — no descriptions, no outcomes, no proof. Logos/thumbnails are empty `#f5f7ff` blocks. |
| AEO readiness | 2/10 — nothing for AI to extract about *what* was built. |
| Readability | N/A. |
| Redundancy | None. |
| **Recommendation** | **SHARPEN + add proof.** Each card needs a one-line outcome (≤14 words) — e.g. "DeFi gaming infrastructure handling X txns/day". Either build case study pages OR change CTAs to "View on web" / external link / remove the CTA. The current state actively damages trust because users click and get bounced to contact form. **User decision needed: do real outcomes/numbers exist for each project?** |

---

## 3. Testimonials (`components/sections/testimonials.tsx`)

| Field | Finding |
|---|---|
| Word count | 78 across 4 quotes |
| Purpose | Yes — social proof — but quality of proof is low. |
| Tone read | Worst-on-page H2: **"Voices of trust"** is pure abstract-noun agency-speak. Two quotes ("Impressive DevOps & backend support…", "Excited to team up with Metaborong!") sound like LinkedIn endorsements not customer outcomes. |
| AI-slop flags | "Voices of trust" headline. Exclamation marks in quotes are real (user-quoted) so they stay. |
| Claim audit | 2 of 4 quotes attributed to "Client" with no company. Reads anonymised. Risk: looks fabricated even though it isn't. |
| E-E-A-T | 4/10 — real names exist but 2 lack company/role; 2 are from the same company (Create Protocol). |
| AEO readiness | 3/10 — quotes are generic, no specific outcomes ("X% improvement", "Y feature shipped"). |
| Readability | Fine. |
| Redundancy | Reinforces Why-Us "direct communication" — useful. |
| **Recommendation** | **SHRINK.** Replace "Voices of trust" with a benefit-shaped H2 ("What clients say after shipping" / "From founders we've shipped with"). Drop the 2 "Client" entries unless company can be added. If only 2 named/credible quotes remain, reduce to a 2-up grid. Consider deferring the section behind WorkPreview rather than between WorkPreview and Founders. **User decision: can the two anonymous quotes be re-credited?** |

---

## 4. Founders (`components/sections/founders.tsx`)

| Field | Finding |
|---|---|
| Word count | 90 (lede 38 + 3 bios 16 each on average) |
| Purpose | Yes — E-E-A-T anchor, "who's actually building". |
| Tone read | Lede is the strongest copy in the section — "you work directly with the people who built the portfolio above" earns its place. Bios fall back to agency-template: "Leads strategy, client relationships, and business direction" reads like a corporate org chart. |
| AI-slop flags | No tokens. But interchangeable role descriptors ("Leads X, oversees Y, ensures Z") trigger AI-slop pattern detection. |
| Claim audit | LinkedIn URLs need to resolve — quick check recommended in JSX-sync phase. |
| E-E-A-T | 7/10 — names + roles + LinkedIn = solid. Loses points for no years-of-experience signal, no specific projects per founder, no public talks/writing linked. |
| AEO readiness | 6/10 — could quote one sentence per founder. |
| Readability | Bios sentences are tight (12-16 words). Good. |
| Redundancy | Lede repeats "hands-on delivery" — duplicates Why-Us "lean, senior team". Acceptable reinforcement. |
| **Recommendation** | **SHARPEN.** Keep structure. Rewrite each bio to lead with one concrete project or domain — e.g. "Shipped KGeN's gaming protocol. Twelve years in Web3 ecosystem development." Replace "Leads strategy" templating. Consider one-line "What I'm building today" instead of generic role overview. |

---

## 5. Comparison (`components/sections/comparison.tsx`)

| Field | Finding |
|---|---|
| Word count | 84 (table cells + footnote) |
| Purpose | Yes — objection handling. The ✓ on competitor wins is a credibility move. |
| Tone read | Cleanest section on the page. Honest framing ("Large agencies have longer track records — a real advantage for enterprises") earns trust. |
| AI-slop flags | None. |
| Claim audit | **"8 shipped products" — verify.** "Deep, multichain" — vague vs. competitor "Generic"; could be specific (named chains). |
| E-E-A-T | 6/10 — depends on the "8 shipped products" claim holding up. |
| AEO readiness | 8/10 — table format extracts well into AI overviews. |
| Readability | Cell labels ≤4 words. Clean. |
| Redundancy | Some overlap with Why-Us ("Speed", "Product thinking") — but format change (table vs cards) justifies it. |
| **Recommendation** | **SHARPEN.** Add an intro sentence (12-14 words) above the table to set frame — e.g. "If you're choosing between us, a large agency, or freelancers, here's the trade." Replace "Deep, multichain" with named chains (Ethereum, Solana, Base if accurate). Confirm "8 shipped products" is current; if higher, update; if lower, soften to "Multiple production protocols" or similar non-numeric. |

---

## 6. FAQ (`components/sections/faq-data.ts`)

| Field | Finding |
|---|---|
| Word count | 312 across 8 Q&As |
| Purpose | Mostly yes — handles AEO + objection. But 2 entries duplicate Services section verbatim. |
| Tone read | "What is Metaborong?" answer is fine. Service-list answers (Web3 services, AI services) are bullet-dump catalogues, not real Q&As — they belong on service hub pages, not homepage FAQ. |
| AI-slop flags | None per se. Repetition of "Metaborong" as sentence subject (8 of 8 answers start with "Metaborong" or close to it) feels SEO-spammy. |
| Claim audit | "Four to twelve weeks" — verifiable? Looks reasonable. "US and European markets" — accurate? **USER CONFIRM.** |
| E-E-A-T | 7/10 — answers are self-contained, citable. |
| AEO readiness | 8/10 — format is ideal for AI extraction. |
| Readability | Most answers ≥40 words. Two exceed 50. DESIGN.md target is "under 50 words, self-contained". |
| Redundancy | **Q2 (Web3 services) and Q3 (AI services) duplicate Services pillars.** **Q7 (Where based?) is anaemic** — half is an email address. |
| **Recommendation** | **MERGE/CUT 2 entries.** Drop Q2 + Q3 (service lists belong on hub pages, not FAQ). Merge Q7 (location) into Q5 (who we work with) or drop. Rewrite remaining 5 to start with varied subjects (not "Metaborong is…" 8 times). Add 1 new high-friction Q if cuts leave <5 — e.g. "What does it cost?" or "Do you sign NDAs first?" **User decision: which Qs do prospects actually ask in inbound emails?** |

---

## 7. Contact CTA (`components/sections/contact-cta.tsx`)

| Field | Finding |
|---|---|
| Word count | 30 |
| Purpose | Yes — primary conversion. |
| Tone read | "Got a project in mind?" — generic agency-speak headline; you've seen it on every dev shop site. Subcopy is genuinely good: "no pitch deck, no fluff, no commitment required" is concrete and disarming. |
| AI-slop flags | Tricolon in subcopy is intentional and works. Headline is the only problem. |
| Claim audit | None. |
| E-E-A-T | N/A (CTA section). |
| AEO readiness | N/A. |
| Readability | Subcopy clean. Headline weak. |
| Redundancy | Email is shown twice (button + plain text below). Reasonable for accessibility but could be one cleaner CTA. |
| **Recommendation** | **SHARPEN.** Replace headline with a specific outcome promise — e.g. "Tell us the build. We'll send back the approach." or "Skip the pitch deck. Start the build." Keep subcopy. Consider adding a third trust line under the CTA — e.g. "Most teams hear back within 12h" (mirrors the hero "Reply in 12h" eyebrow). |

---

## Decision gate — what to ask the user

Three groups of decisions need user input before rewrite:

### A. Cuts (yes/no per item)

1. **Testimonials: drop the 2 anonymous "Client" quotes?** (Or can companies be added?)
2. **FAQ: drop Q2 (Web3 services list) + Q3 (AI services list)?** They duplicate Services section.
3. **FAQ: drop or merge Q7 (Where is Metaborong based?)?** Currently anaemic.
4. **WorkPreview: keep CTAs as "Read more →" with no destination, OR remove the CTA until case study pages exist?**

### B. Proof inputs (factual user input)

1. **"8 shipped products" — is this still the current count?** If higher, update; if lower, soften.
2. **Time-to-ship: confirm "weeks, not quarters" is honest.** Best examples?
3. **Named chains for Web3 depth claim** (Ethereum, Solana, Base, Arbitrum, others?).
4. **One concrete outcome or stat per project** (KGeN, DATA3 AI, Bionic, Bayan) for WorkPreview cards.
5. **Founder bios: one specific project or domain per founder** to replace template language.

### C. Tone/voice direction

1. Comfort with **dropping the "Metaborong is…" sentence-start pattern** in FAQ (currently 8/8 answers)?
2. Headline tone — **specific outcome promise** (e.g. "Skip the pitch deck. Start the build.") vs **warm question** (current "Got a project in mind?") for Contact CTA?

---

## Out-of-scope reminders

- Problem section is **above** Services in live page order → already in the "optimised" bucket per user.
- Hero, Trust Bar, Services lede + pillars unchanged.
- Nav, Footer untouched.
- Service hub pages (`/services/web3/` etc.) have empty content folders — separate workstream.
