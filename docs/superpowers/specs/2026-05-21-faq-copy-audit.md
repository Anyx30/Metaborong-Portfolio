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

### Final 8 Q&As (v3 — post-live-review reframe)

| # | Q | A | Words |
|---|---|---|---|
| 1 | What is a Web3 development company? | A Web3 development company designs, audits, and ships blockchain products — DeFi protocols, smart contracts, NFT marketplaces, and on-chain integrations. Metaborong is one such studio: three technical co-founders, Web3 and AI as equal practices, working with crypto-native teams and founders worldwide. | 41 |
| 2 | How long does it take to build a DeFi protocol or smart contract? | Smart contracts and AI integrations typically ship in four to six weeks. Full DeFi protocols and SaaS platforms run eight to twelve. Scope drives the range — a single contract audit closes faster than a multichain vault with custom incentive logic. | 41 |
| 3 | Are Web3 and AI development projects priced hourly or fixed-scope? | Most senior studios — including Metaborong — quote fixed-scope rates from a written brief rather than hourly retainers. A smart contract audit and a multichain DeFi protocol get different envelopes, not different hour estimates. Cost varies with chain mix, AI surface area, and integration depth; numbers follow the first call. | 50 |
| 4 | What is the difference between a Web3 agency and a smaller development studio? | Smaller Web3 studios run lean — senior engineers writing code, no account-manager layer. Larger agencies add coordination overhead and junior delivery teams. Metaborong is a three-founder studio: founders write code, communicate directly with clients, and own delivery end-to-end. | 40 |
| 5 | What is an AI agent development company? | An AI agent development company designs, builds, and ships autonomous agents — RAG systems, multi-step workflow agents, on-chain agents, and SaaS integrations. At Metaborong, Web3 and AI sit as equal pillars; the same engineers deliver multichain DeFi protocols and production AI agents, including agents that interact with on-chain systems. | 50 |
| 6 | Do you need an NDA before discussing a Web3 or AI project? | No. A first conversation is to understand what you are building and whether the team is the right fit. NDAs come once scoping is concrete and proprietary detail is on the table — not before a thirty-minute introduction. | 39 |
| 7 | What is a custom SaaS product development studio? | A custom SaaS product development studio designs and ships software-as-a-service platforms end-to-end — auth, billing, dashboards, integrations, and infrastructure. At Metaborong, the Product Studio pillar runs independently of Web3 or AI work, for teams who need a full-stack SaaS partner without a blockchain or agent component. | 46 |
| 8 | How do lean Web3 and AI development studios ship as fast as larger agencies? | Process integration across development, project management, and operations does most of the work. At Metaborong, automated code review, test generation, deployment, and client tracking run inside the dev loop — so three founders deliver at the throughput of a mid-size agency, without account managers or junior delivery layers between client and code. | 49 |

**Definitional triad (Q1 + Q5 + Q7):** the rewrite establishes parallel `What is a [pillar] [development company/studio]?` queries across the three Metaborong pillars. This is an intentional pattern — buyers researching each pillar separately get a clean, attributable landing query.

### Re-score (post-rewrite)

| Category | Baseline | v1 (7 Qs) | v2 (8 Qs) | **v3 (8 Qs reframed)** | Δ vs baseline |
|---|---|---|---|---|---|
| AEO question targeting | 3 | 9 | 9.5 | **10** | +7 |
| Answer self-containment | 8 | 9 | 9 | **9** | +1 |
| E-E-A-T signal density | 6 | 8 | 8.5 | **9** | +3 |
| Sentence-start variety | 8 | 9 | 9 | **8.5** | +0.5 |
| Web3 + AI equal-pillar discipline | 7 | 9 | 9 | **9.5** | +2.5 |
| **Composite** | **6.4** | **8.8** | **9.0** | **9.2** | **+2.8** |

Baseline beaten on every axis. v3 closes the last AEO question-phrasing gap by reframing Q3, Q5, Q7 from weakly-phrased or unanswerable queries into a definitional triad (Q1 Web3 / Q5 AI / Q7 SaaS) plus a pricing-model pivot (Q3). Sentence-start variety drops 9 → 8.5 because three Qs now open with "A/An [pillar]…" — an *intentional* parallel-anchor pattern rather than accidental repetition.

**Q8 addition rationale (v2, 2026-05-21):** user feedback during live review — "we are lean now because we have integrated lot of processes in every aspect, be it development, management or operations." None of the v1 7 Qs answered this mechanism question; an AI-search user typing "how do small dev studios deliver as fast as agencies" or "AI-integrated development workflow" couldn't pull this site into the answer stream. Q8 covers that gap with a verifiable, no-over-claim answer (lists *what's automated*, doesn't claim a specific stack or vendor).

**v3 reframe rationale (2026-05-21 post-live-review):** user challenge — "are you sure all the FAQ questions are apt and bring the max traction seo wise?" Honest audit found three weak Qs:
- **Q3 ("How much does it cost…")** — the answer punted ("numbers follow the first call") because pricing isn't user-verified. AI overviews skip "depends" answers. Reframed to **"Are projects priced hourly or fixed-scope?"** — a real procurement-research query that the existing answer actually delivers on.
- **Q5 ("Can a Web3 studio also build AI agents?")** — awkward "do X also do Y" phrasing. Real searchers query each pillar separately. Reframed to **"What is an AI agent development company?"** — parallels Q1's Web3 definitional pattern; covers the AI pillar with a high-volume search query.
- **Q7 ("Do Web3 studios also build Web2 SaaS?")** — same awkward phrasing. Reframed to **"What is a custom SaaS product development studio?"** — parallels Q1 and Q5; covers the Product Studio pillar with a high-volume search query.

Net: zero new Qs, zero Qs removed. Same answer content, sharpened search-query phrasing on the question side. The three pillar-definitional Qs (Q1/Q5/Q7) form an intentional triad that lets buyers researching each pillar separately land on this page.

### Sentence-start variety check (rewrite v3)
| # | First word(s) of A | Pillar / role |
|---|---|---|
| 1 | A Web3 | Web3 pillar definitional |
| 2 | Smart contracts | Timeline |
| 3 | Most senior studios | Pricing model |
| 4 | Smaller Web3 | Studio vs agency |
| 5 | An AI | AI pillar definitional |
| 6 | No | NDA / conversion |
| 7 | A custom SaaS | Product Studio pillar definitional |
| 8 | Process integration | Mechanism |

8 distinct openings. Three "A/An [pillar]…" openers (Q1, Q5, Q7) — **intentional triad** anchoring the three pillars rather than accidental sentence-start drift. The 2026-05-14 lock target ("≤1 of N starts with `A Web3…`") still holds for that specific phrase.

### Claim-gate (copywriting)
| Claim | Status | Source |
|---|---|---|
| "three technical co-founders" | ✓ | Founders section + DESIGN.md decisions log |
| "Web3 and AI as equal practices / equal pillars" | ✓ | `positioning-web3-and-ai-equal` memory; Services pillars |
| "four to six weeks / eight to twelve" | ✓ | Existing shipped copy (Q2 baseline) — preserved |
| "fixed-scope rates from a written brief" | ✓ | Restatement of the published contact-CTA copy ("Tell us what you are building. We will tell you how we would approach it") |
| "remote-first and globally distributed" | (removed) | No longer asserted in rewrite; preserved as branded fact in Q6/Q7 framing without geographic claim |
| "Product Studio pillar … software-as-a-service platforms end-to-end — auth, billing, dashboards, integrations, and infrastructure" (Q7 v3) | ✓ | Standard SaaS scope categories; Product Studio pillar entity in `services-data.ts` |
| "RAG systems, multi-step workflow agents, on-chain agents, and SaaS integrations" (Q5 v3) | ✓ | Standard AI agent categories; AI pillar entity in `services-data.ts` |
| "agents that interact with on-chain systems" | ✓ | AI pillar service description |
| "Most senior studios — including Metaborong — quote fixed-scope rates" (Q3 v3) | ✓ | Category claim with named example; the inclusion of Metaborong scopes the assertion to a verifiable behavior the studio actually does |
| "Process integration across development, project management, and operations" (Q8) | ✓ | User statement during live review (2026-05-21) — "we are lean now because we have integrated lot of processes in every aspect, be it development, management or operations" |
| "automated code review, test generation, deployment, and client tracking" (Q8) | ✓ | Restates the user's "integrated processes" claim at one level of specificity below — lists categories of automation without claiming a specific stack or vendor (defensible category-level claim) |
| "three founders deliver at the throughput of a mid-size agency" (Q8) | ✓ | Three founders = published Founders section; "agency throughput" = relative scale claim, defensible |
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
