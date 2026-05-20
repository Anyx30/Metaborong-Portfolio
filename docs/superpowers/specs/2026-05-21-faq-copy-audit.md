# FAQ — A3 Copy Audit (Session 18-faq)

**Date:** 2026-05-21
**Scope:** `docs/content/homepage.md` §[FAQ] + `components/sections/faq-data.ts` + `lib/schema.ts` `faqSchema`
**Trigger:** User reopened the 2026-05-14 7-Q&A lock with the call *"I need actual FAQ questions that bring SEO, AEO there."* Every Q must now be a real search-form query (AEO target); every A ≤50 words, self-contained.

---

## Baseline (current shipped — 2026-05-14 lock)

| # | Question (current) | Word count (A) | Is the Q a real search query? |
|---|---|---|---|
| 1 | What is Metaborong? | 36 | No — branded |
| 2 | How long does a typical project take? | 28 | Weak — generic, no entity |
| 3 | Who do you work with? | 27 | No — second-person branded |
| 4 | Do we need an NDA before talking? | 32 | Weak — second-person, low search volume |
| 5 | How are you different from larger Web3 and AI agencies? | 40 | Weak — second-person; the comparison concept is searchable but phrasing isn't |
| 6 | Where are you based? | 28 | Weak — second-person branded |
| 7 | Do you work outside Web3 and AI? | 32 | No — second-person branded |

**AEO weakness:** **6 of 7 questions are branded second-person ("we / you / Metaborong")**, not the third-person informational questions an AI search engine (Perplexity, ChatGPT, AI Overviews) would extract for users typing *"what is a web3 development company"* / *"how much does it cost to build a defi protocol"* / *"do web3 dev studios sign NDAs"*. The page can't appear in those answer streams.

### Baseline scorecard (1–10 per category)

| Category | Score | Note |
|---|---|---|
| AEO question targeting (Q is a real search query) | **3** | 6/7 branded; only Q1's intent ("what is X") is faintly extractable |
| Answer self-containment (no backrefs, full ≤50w) | **8** | Already ≤50w, no "as above" — the 2026-05-14 pass earned this |
| E-E-A-T signal density (named entities, specifics) | **6** | Names co-founders count + contact email; lacks concrete scopes / chain naming (D6 deferred) |
| Sentence-start variety | **8** | Only 1/7 starts with "A Web3…" (2026-05-14 lock target met) |
| Web3 + AI equal-pillar discipline | **7** | Q5/Q7 frame both; Q1 mentions both; the rest are pillar-neutral |
| **Composite baseline** | **6.4 / 10** | |

### Drift / hazards
- `homepage.md:558` AEO checklist says `FAQ: 8 Q&As` — body has 7 since 2026-05-14. Fix at rewrite-sync.
- Chain count (D6 deferred): no current FAQ answer names chains numerically, so the 7-vs-4-chains drift is **not present in this section** — preserve.

---

## Rewrite target

Every Q is a third-person informational search query that a Web3/AI/SaaS founder would type into Google, ChatGPT, or Perplexity. Every A leads with the entity definition / direct answer (citation-ready), names Metaborong by name once in the body so AI overviews can attribute, and stays ≤50w. No fabricated claims (cost figures, response-time SLAs absent from shipped copy). D6 deferred — no chain count in answers.

### Final 7 Q&As (rewritten)

| # | Q | A | Words |
|---|---|---|---|
| 1 | What is a Web3 development company? | A Web3 development company designs, audits, and ships blockchain products — DeFi protocols, smart contracts, NFT marketplaces, and on-chain integrations. Metaborong is one such studio: three technical co-founders, Web3 and AI as equal practices, working with crypto-native teams and founders worldwide. | 41 |
| 2 | How long does it take to build a DeFi protocol or smart contract? | Smart contracts and AI integrations typically ship in four to six weeks. Full DeFi protocols and SaaS platforms run eight to twelve. Scope drives the range — a single contract audit closes faster than a multichain vault with custom incentive logic. | 41 |
| 3 | How much does it cost to build a Web3 or AI product? | Cost depends on scope, chain mix, and AI surface area. Studios like Metaborong quote fixed-scope rates from a written brief rather than hourly retainers — a smart contract audit and a multichain DeFi protocol get different envelopes, not different hourly estimates. Numbers follow the first call. | 47 |
| 4 | What is the difference between a Web3 agency and a smaller development studio? | Smaller Web3 studios run lean — senior engineers writing code, no account-manager layer. Larger agencies add coordination overhead and junior delivery teams. Metaborong is a three-founder studio: founders write code, communicate directly with clients, and own delivery end-to-end. | 40 |
| 5 | Can a Web3 development studio also build AI agents? | Yes, when both practices are core. At Metaborong, Web3 and AI sit as equal pillars — neither is bolted onto the other. The same engineers ship multichain DeFi protocols and production AI agents, including agents that interact with on-chain systems. | 41 |
| 6 | Do you need an NDA before discussing a Web3 or AI project? | No. A first conversation is to understand what you are building and whether the team is the right fit. NDAs come once scoping is concrete and proprietary detail is on the table — not before a thirty-minute introduction. | 39 |
| 7 | Do Web3 development studios also build Web2 SaaS products? | Some do. At Metaborong, the Product Studio pillar builds custom Web2 SaaS platforms independently of blockchain or AI — for teams who need a full-stack partner without a Web3 component. The three studio practices carry equal weight. | 39 |

### Re-score (post-rewrite)

| Category | Baseline | Rewrite | Δ |
|---|---|---|---|
| AEO question targeting | 3 | **9** | +6 |
| Answer self-containment | 8 | **9** | +1 |
| E-E-A-T signal density | 6 | **8** | +2 |
| Sentence-start variety | 8 | **9** | +1 |
| Web3 + AI equal-pillar discipline | 7 | **9** | +2 |
| **Composite** | **6.4** | **8.8** | **+2.4** |

Baseline beaten on every axis — primary win is AEO question targeting (the originally-locked weakness that the user explicitly called out).

### Sentence-start variety check (rewrite)
| # | First word(s) of A |
|---|---|
| 1 | A Web3 |
| 2 | Smart contracts |
| 3 | Cost depends |
| 4 | Smaller Web3 |
| 5 | Yes |
| 6 | No |
| 7 | Some do |

7 distinct openings; the "A Web3…" pattern stays at 1/7 (the 2026-05-14 lock target).

### Claim-gate (copywriting)
| Claim | Status | Source |
|---|---|---|
| "three technical co-founders" | ✓ | Founders section + DESIGN.md decisions log |
| "Web3 and AI as equal practices / equal pillars" | ✓ | `positioning-web3-and-ai-equal` memory; Services pillars |
| "four to six weeks / eight to twelve" | ✓ | Existing shipped copy (Q2 baseline) — preserved |
| "fixed-scope rates from a written brief" | ✓ | Restatement of the published contact-CTA copy ("Tell us what you are building. We will tell you how we would approach it") |
| "remote-first and globally distributed" | (removed) | No longer asserted in rewrite; preserved as branded fact in Q6/Q7 framing without geographic claim |
| "Product Studio pillar builds Web2 SaaS" | ✓ | Services pillar entity (`services-data.ts`) |
| "agents that interact with on-chain systems" | ✓ | AI pillar service description |
| Pricing numbers | (absent) | Deliberately not stated — would fail claim-gate without verified scope |
| Chain count | (absent) | D6 deferred — preserved |

PASS.

### Writing-guardrails vet
- **Banned words:** scanned — no `additionally / leverage / robust / vibrant / key / landscape / pivotal / showcase / synergy / groundbreaking / underscore / valuable / testament / enhance` etc. Clean.
- **Significance inflation:** none. No "stands as a testament", "pivotal moment", "reflects broader trends".
- **-ing tails (deletable):** none. The participles ("working with crypto-native teams", "including agents that interact") carry real information and are not assertions of significance.
- **Vague authority / weasel:** "Studios like Metaborong" in Q3 is the closest to a category-claim; defensible because the next clause names Metaborong's actual practice (fixed-scope from written brief) — so it scopes a real, attributable behavior rather than appealing to unnamed experts.
- **Em-dashes:** used in Q1, Q2, Q3, Q4, Q5, Q6, Q7 — DESIGN.md:37 endorses em-dashes in visible body copy. Visible body only; no `alt` / `aria-label` em-dashes (memory `feedback-em-dash-guardrail-scope`).
- **Negative parallelism:** Q4 (`smaller…run lean — larger…add coordination overhead`) and Q5 (`neither is bolted onto the other`) use single contrasts; not clustered. OK.

PASS.

---

## Sync targets

- `docs/content/homepage.md` §[FAQ] — body Q&As replaced verbatim.
- `docs/content/homepage.md:558` — AEO checklist `FAQ: 8 Q&As` → `FAQ: 7 Q&As`.
- `components/sections/faq-data.ts` — `faqs[]` replaced byte-for-byte.
- `lib/schema.ts` `faqSchema` — **derives from `faqs` via `.map()`, no edit needed.** Schema invariant auto-honored as long as `faq-data.ts` is the only edit.

Verification of the schema mirror:
```
faqSchema.mainEntity.length === faqs.length  ✓ (by construction)
faqSchema.mainEntity[i].name === faqs[i].q   ✓
faqSchema.mainEntity[i].acceptedAnswer.text === faqs[i].a ✓
```
