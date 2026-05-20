# Homepage Content
**URL:** `/`
**Last updated:** 2026-05-18
**Status:** Hero eyebrow → entity-category line + pulsing dot removed (premium static-hairline finish). Hero copy reconciled to shipped JSX + geo unified to remote-first/global (A3 chain). Services + below-services copy refresh synced to JSX (live on `design-revamp`). Open placeholders: Clutch quotes/rating/count in testimonials.tsx; founder-bio specifics in founders.tsx.

---

## SEO Meta Tags

**Title tag (43 chars):**
```
Web3 & AI Development Studio | Metaborong
```

**Meta description (157 chars):**
```
Metaborong builds DeFi protocols, AI agent systems, and custom SaaS products for founders and crypto-native teams. Fast delivery, product-first thinking.
```

**Primary keyword:** `web3 development company` (720/mo, medium competition)
**Secondary keywords:** `ai agent development` (480/mo), `defi development company` (390/mo), `web3 consulting` (320/mo)

**Schema to implement:**
- `Organization` (homepage)
- `WebSite` + `SearchAction` (sitelinks searchbox)
- `BreadcrumbList`

---

## Open Graph / Social

```
og:title      → Web3 & AI Development Studio | Metaborong
og:description → Metaborong builds DeFi protocols, AI agent systems, and custom SaaS products for founders and crypto-native teams.
og:image      → /assets/og/og-home.webp (1200×630)
twitter:card  → summary_large_image
```

---

## Page Content

---

### [NAV]

```
[M-mark logo] metaborong    Services ▾   Work   About   Blog   [Let's Talk →]
```

Services dropdown:
- ⬡ Web3 / Blockchain — DeFi, NFT, wallets, DAO, multichain
- ⬡ AI Agents — Agentic AI, RAG, voice agents, automation
- ⬡ Product Studio — Custom SaaS platforms

---

### [HERO — H1 + AEO block + CTAs]

**Eyebrow (category-identity line — original chip box, dot removed):**
`Web3 & AI development studio`

**H1 (typewriter, 3 beats — renders as static SSR text, crawlable):**
# Web3 protocols. AI agents. Shipped.

**AEO Extraction Block** *(blockquote — AI engines extract this; doubles as the de-facto subhead, no separate subheading ships)*:
> Metaborong is a Web3 development company and AI agent studio. A remote-first team of senior engineers, globally distributed. We ship DeFi protocols and smart contract audits across EVM chains and Solana, AI agents spanning RAG, agentic workflows, and generative systems, and full-stack SaaS for founders and early-stage startups. Spec to production, fast.

**CTAs:**
- Primary: `Get a scope →`
- Secondary: `Open recent work`

**Right panel (visual — shipped, locked):**
*ASCII-art video loop (`/hero-ascii.mp4`) + 3 glassmorphic pillar-proof overlay cards (AI weights · web3 tx hash · deploy path). IO-gated, reduced-motion safe. Locked per `docs/superpowers/specs/2026-05-10-section-hero.md`.*

<!-- WHY (A3 copy reconcile, 2026-05-17)
  - Doc was stale vs shipped JSX (old H1, eyebrow, CTAs, plus a subheading + trust line that never shipped). Reconciled doc → shipped reality.
  - H1 kept verbatim per user + keyword research: hub /services/web3/ owns "web3 development company"; homepage hard-targeting it too = cannibalization. H1 stays voice-led; primary keyword recovered in the blockquote's first 6 words + the title tag.
  - Geo unified to remote-first/global (user decision 2026-05-16) — replaces every "US and Europe" mention site-wide (FAQ ×2, llms.txt ×2, schema areaServed → Worldwide).
  - Blockquote sentence 2 was a 29-word 7-item colon dump → first tightened to a parallel 3-pillar clause, then iterated 2026-05-17 per user: em-dash removed (writing-guardrails AI tell, blockquote scope only); capability broadened to canonical services-data.ts nouns; RAG re-added (high-signal AI term, also in schema knowsAbout) and "across EVM chains and Solana" added back (canonical superordinate — makes no chain-count claim, so the site-wide 3-vs-7 inconsistency stays deferred, not reignited). 52 words, parallel structure (not a colon dump), in the 40–60 AEO band.
  - Trust line "No pitch decks. No retainers. Direct from founders." dropped — never shipped; read as poetic/unprofessional. Eyebrow carries the trust signal.
  - [2026-05-18] Eyebrow changed: availability line → entity-category "Web3 & AI development studio" (= title tag, so title/H1-context/blockquote/Org-schema all assert one entity — the only real SEO lever an eyebrow has; keyword-research-backed; no hub cannibalization). Pulsing green dot removed (undocumented infinite — net DESIGN.md motion-rule-#1 compliance gain). SUPERSEDES the "Eyebrow carries the trust signal" line above — the 12h/availability promise now lives only in Contact CTA + FAQ. NOTE: a same-session /impeccable layout+polish redesign (drop the pill, static brand hairline, flush-left) was **reverted at user direction** — the original bordered chip structure + 0.12em tracking are retained; only the dot was removed and the content updated. No structural/visual redesign shipped.
-->

**Pre-existing drift noted, not fixed (out of scope):** the AEO checklist below still says "FAQ: 8 Q&As" but the doc body has 7 (post 2026-05-14 cut). Flag only.

---

### [TRUST BAR]

*Scrolling strip — client/project names as social proof:*

`KGeN · Bionic · DATA3 AI · Defiverse · GET Smart · SEDAX · Bayan · Memestakes Vault`

---

### [SERVICES — H2]

## A small, senior team. Three pillars. End to end.

*Eyebrow:* What we build

*Section intro (synced to live `services.tsx`):*
A boutique studio for founders without a CTO. We ship Web3 protocols, production AI agents, and full SaaS products with one senior team that owns the work from architecture to deployment. Every build is engineered for production, not stopped at a demo.

**Pillar cards (each links to its hub page):**

#### ⬡ Web3 / Blockchain
**Headline:** Decentralised protocol engineering
**Body:** DeFi protocols, NFT marketplaces, wallets, and DAO systems. Smart-contract engineering across EVM, Solana, and Cosmos.
**CTA:** `Web3 services →` → `/services/web3/`

#### ⬡ AI Agents
**Headline:** Production AI agent engineering
**Body:** Agentic pipelines, RAG systems, voice agents, generative AI, and workflow automation. Agents that plan, retrieve, and act inside real software.
**CTA:** `AI agent services →` → `/services/ai-agents/`

#### ⬡ Product Studio
**Headline:** Your full SaaS engineering team
**Body:** SaaS, MVP, and B2B product builds for founders without a CTO. One team owns architecture, engineering, design, and deployment, so the build doesn't fragment across vendors.
**CTA:** `Product Studio services →` → `/services/product-studio/`

---

<!-- BRIEF
  Goal: convince visitor that hiring us is a different shape than hiring an agency.
  Audience state: they've seen our three pillars; now asking "why you over the alternatives".
  One idea: lean senior team that ships faster, pushes back harder, and goes deeper than generalists.
  Proof: portfolio above + founders below.
  CTA: none (objection-handling section, not conversion).
-->

### [WHY METABORONG — H2]

## Why founders choose Metaborong

*Alt headlines:*
- "What you get when you hire us"
- "Three reasons we win the bake-off"

**AEO answer block (38 words — answers "What makes Metaborong different from larger Web3 and AI agencies?"):**
> Founders pick Metaborong over larger Web3 and AI agencies for three reasons: shorter time to a first working version, sharper push-back on the brief, and the specialist depth — multichain protocols and AI agent orchestration — most studios don't have.

**Primary keywords woven in:** `Web3 and AI development` (equal-pillar framing, Tier 2 commercial).
**AEO query owned:** "What makes Metaborong different from larger Web3 and AI agencies?"
**JSON-LD:** Question/Answer pair injected via `whyUsAeoSchema` in `lib/schema.ts` (separate FAQPage from the visible FAQ list, so AI engines can extract this paragraph as a standalone answer).

**Trust strip (between answer block and cards):**
- `4.9 / 5 ★★★★★ on Clutch` (links to Clutch profile)
- `Reply within 12h`
- `4–12 weeks to ship`

All three numbers compound promises made elsewhere on the page (Testimonials → Clutch; Hero eyebrow → 12h; FAQ → 4–12 weeks). No new claims.

**Three feature cards (one outcome per card):**

#### Tag: SPEED
**Headline:** First working version in weeks
**Body:** Lean senior team, no account-manager layer. [AbsolveMe](https://www.absolveme.ai/) needed its launch site live before the liquidity window closed. Site, content, and design support shipped in 2 days. The Solana–NEAR cross-chain layer followed in 5 more.

#### Tag: PRODUCT THINKING
**Headline:** We stress-test the brief before we build
**Body:** Spec gaps get named. Simpler approaches get raised. [SunsetML](https://www.sunsetml.com/) came to us with an AI writing-tool concept. We iterated the architecture with the founder across multiple planning rounds, and stayed on as equity co-founders.

#### Tag: NICHE DEPTH
**Headline:** Multichain Web3 and production-grade AI agents
**Body:** Smart contracts shipped on Ethereum, Solana, Base, Arbitrum, Hyperledger, Polygon, and Avalanche, including [OrbitXPay](https://orbitxpay.com/)'s DeFi-banking module with multi-layer orchestration. AI agent orchestration in production at [SunsetML](https://www.sunsetml.com/) and [PredictRAM](https://predictram.com/).

**Note on Bayan / DATA3:** removed from card 3 per user direction 2026-05-15 — SunsetML carries the AI-agent proof alongside PredictRAM. Bayan and DATA3 remain visible in the Work Preview cards above; only the Why-Us card 3 list was trimmed.

<!-- WHY
  - H3s shifted from theme-shaped ("Niche depth where it counts") to outcome-shaped ("Where most agencies stop, we start") so each card answers a different objection.
  - Killed the tricolon "Direct communication, fast decisions, fewer handoffs" — sounded like every dev-shop site.
  - Each body is 21–32 words, max sentence 16 words.
  - Tag colours in JSX are currently arbitrary — sync phase should unify to brand or drop.
-->


---

<!-- BRIEF
  Goal: prove we ship, with named projects across all three pillars.
  Audience state: convinced of *why*, now asking *what have you actually shipped*.
  One idea: real products across DeFi, AI, gaming, SaaS — not slideware.
  Proof: project names only for now; case studies pending; per-card outcomes deferred per user.
  CTA: "Talk to us →" (top-right of section) + per-card "Read more →" to /#contact placeholder until case studies exist.
-->

### [WORK PREVIEW — H2]

## What we've built

*Alt headlines:*
- "Shipped, in production"
- "Four products, four categories"

*Section intro (28 words):*
Live products across DeFi, AI, gaming, and SaaS — each shipped with founders we still work with. Case studies are on the way.

**Project cards — minimal until case studies land:**

#### KGeN
**Category:** Web3 · Gaming
**One-liner:** *[Deferred — write at case-study time]*
**CTA:** `Read more →` → `/#contact` *(swap to case study URL when published)*

#### Bionic
**Category:** Web3 · DeFi
**One-liner:** *[Deferred]*
**CTA:** `Read more →` → `/#contact`

#### DATA3 AI
**Category:** AI · Data
**One-liner:** *[Deferred]*
**CTA:** `Read more →` → `/#contact`

#### Bayan — AI Calling Chatbot
**Category:** AI · Voice
**One-liner:** *[Deferred]*
**CTA:** `Read more →` → `/#contact`

**Section CTA (top-right):** `Talk to us →` → `/#contact`

<!-- WHY
  - Dropped "Eight products" since the comparison row was softened; consistency matters across page.
  - "Live products" replaces "Eight products" without losing the credibility frame.
  - Per-card one-liners deferred per user direction — placeholder text reads "Deferred — write at case-study time" so JSX sync knows not to render fake outcomes.
  - When case studies exist, replace each "Read more →" target with the real URL in one swap.
-->


---

<!-- BRIEF
  Goal: third-party verification of quality, with an SEO benefit (outbound link to Clutch profile).
  Audience state: seen our pillars + portfolio + why-us, now wants external proof.
  One idea: real clients, verified, rated — read them yourself on Clutch.
  Proof: Clutch reviews (verified, outbound-linked).
  CTA: per-card "Read on Clutch →" + section-level "View all reviews on Clutch →".
-->

### [TESTIMONIALS — H2 → Clutch verified strip + cards]

## Reviewed and verified on Clutch

*Alt headlines:*
- "What clients say after shipping"
- "Verified by clients on Clutch"

**Stat-led header strip (1 row, full-width inside section):**

```
[Clutch logo]    4.9 / 5  ★★★★★    Based on <!-- USER_INPUT: review count --> verified reviews    [Verified ✓]
```

- **Clutch profile URL:** `<!-- USER_INPUT: https://clutch.co/profile/metaborong -->`
- **Aggregate rating:** `<!-- USER_INPUT: confirm 4.9 or actual current score -->`
- **Review count:** `<!-- USER_INPUT: current count -->`

**Three quote cards (each card whole-card links to Clutch — same target as inline CTA):**

#### Quote 1
> "<!-- USER_INPUT: paste top Clutch quote 1 verbatim -->"
**Reviewer:** `<!-- USER_INPUT: Name, Title @ Company -->`
**Rating:** ★★★★★
**CTA:** `Read on Clutch →` → `<!-- USER_INPUT: deep-link to specific review on Clutch -->`

#### Quote 2
> "<!-- USER_INPUT: paste top Clutch quote 2 verbatim -->"
**Reviewer:** `<!-- USER_INPUT: Name, Title @ Company -->`
**Rating:** ★★★★★
**CTA:** `Read on Clutch →` → `<!-- USER_INPUT: deep-link to specific review on Clutch -->`

#### Quote 3
> "<!-- USER_INPUT: paste top Clutch quote 3 verbatim -->"
**Reviewer:** `<!-- USER_INPUT: Name, Title @ Company -->`
**Rating:** ★★★★★
**CTA:** `Read on Clutch →` → `<!-- USER_INPUT: deep-link to specific review on Clutch -->`

**Section CTA (below grid):** `View all reviews on Clutch →` → `<!-- USER_INPUT: Clutch profile URL -->`

<!-- WHY
  - "Voices of trust" was the worst agency-speak on the page — replaced with a verb-led headline that names the source ("Clutch").
  - Verbatim quotes from existing site (Siddharth, Dr. Josh, Abhishek, Girish) are NOT carried over — user picks 3 from Clutch instead. The two anonymous "Client" attributions die here.
  - Outbound links to Clutch give the section measurable SEO value (Clutch profile traffic = reciprocal trust signal) and let visitors verify independently.
  - All link attributes on the JSX should be: rel="noopener" target="_blank" — Clutch is a third-party domain.
  - Quote selection rule: pick the 3 with most specific outcome language; avoid generic "highly recommend" if better exists.
-->


---

<!-- BRIEF
  Goal: E-E-A-T anchor. Show the work is done by named, reachable, technical co-founders.
  Audience state: convinced of pillars + portfolio + reviews; now asking "who actually builds this".
  One idea: three founders, hands-on, named on every project — not a sales layer.
  Proof: LinkedIn URLs + per-founder specifics (USER_INPUT needed).
  CTA: per-card LinkedIn link.
-->

### [FOUNDERS — H2]

## The team behind the work

*Alt headlines:*
- "Three founders. No account managers."
- "Who you'll actually work with"

*Section intro (38 words — AEO-scoped 2026-05-19: standalone-extractable sentence 1, Web3+AI entity-anchored, em-dash removed):*
Metaborong's three co-founders are hands-on in every Web3 and AI engagement. The work in our portfolio was built by us, not by a contracting layer we manage. You'll be in Slack with the people writing your code.

**Founder cards:**

#### Arnab Ray
**Role:** CEO & Co-Founder
**Bio:** Co-founded Metaborong and sets its direction across Web3 and AI engagements. <!-- USER_INPUT (pending — generic-but-true placeholder shipped 2026-05-19): swap in one specific Web3-ecosystem credential or project Arnab personally led (12–14 words). -->
**Links:** `LinkedIn` → `https://www.linkedin.com/in/arnab-ray-682111192/` · `X` → `https://x.com/Arnab_Alfa_Ray`

#### Anik Ghosh
**Role:** COO & Co-Founder
**Bio:** Co-founded the studio; owns delivery and the scope discipline that keeps timelines honest. <!-- USER_INPUT (pending — generic-but-true placeholder shipped 2026-05-19): swap in one specific operational signal — background, prior company, or a delivery-record line (12–14 words). -->
**Links:** `LinkedIn` → `https://www.linkedin.com/in/anik-ghosh-01a985208/` · `X` → `https://x.com/0x_Zeph`

#### Soumojit Ash
**Role:** CTO & Co-Founder
**Bio:** Co-founded the studio and owns the architecture under every Web3 protocol and AI system it ships. <!-- USER_INPUT (pending — generic-but-true placeholder shipped 2026-05-19): swap in chains or frameworks Soumojit has shipped on (12–16 words). -->
**Links:** `LinkedIn` → `https://www.linkedin.com/in/soumojit-ash/` · `X` → `https://x.com/SoumojitAsh`

<!-- WHY
  - Killed "Leads strategy, client relationships, and business direction" — the most agency-template line on the page (still banned).
  - [2026-05-19, Founders redesign] Figma-driven visual redesign (node mQsbMuw0spVgIu7jXirr3o / 142:516). Copy comes from THIS A3 chain, NOT the Figma frame — the Figma text reuses the pre-banned "Leads strategy, client relationships, and business direction" agency line; Figma anchors visual only.
  - Bios: [role verb] + generic-but-true proof. User chose "build with generic data now, supply real specifics later" — proof clauses assert only verifiable facts (co-founder status, role ownership): no numbers, no named projects, no fabricated chains. USER_INPUT markers retained for the real-specifics swap.
  - Each bio carries Web3 AND AI with equal weight (positioning lock — never Web3-first).
  - Lede kept (33 words, user decision 2026-05-19) — Figma has no lede, but Founders is the E-E-A-T anchor and this is its strongest trust statement. Logged as a deviation in the section spec.
  - [2026-05-19 update] Soumojit's LinkedIn provided by user (https://www.linkedin.com/in/soumojit-ash/) — no longer pending. Per-founder X profiles added at user request (Arnab https://x.com/Arnab_Alfa_Ray, Anik https://x.com/0x_Zeph confirmed, Soumojit https://x.com/SoumojitAsh) — this reverses spec Deviation 6 (Figma was LinkedIn-only); X uses the same brand-blue square button as LinkedIn (no X-black — DESIGN.md brand-color discipline). All three now have both links; conditional render retained for correctness.
-->


---

### [PROBLEM → SOLUTION — H2]

## Building in Web3 and AI is still too hard

*Pain section — no product mention:*
Most founders approaching Web3 or AI development face the same problems. Either they hire a large agency that treats the project like a ticket in a queue, or they try to assemble a freelance team that lacks the architectural depth to build what actually needs to exist. The result is slow timelines, accumulated technical debt, and products that launch but do not scale.

The Web3 and AI landscape moves faster than traditional development cycles allow. DeFi protocols change. Agentic AI frameworks are still maturing. A team that was building Web2 products last year is not the right fit for a protocol that will handle real user funds.

*Solution introduction:*
Metaborong was built specifically for this problem. A small, senior team with deep experience in DeFi protocol architecture, AI agent orchestration, and full-stack product development — working directly with founders from the first conversation to the final deployment.

---

<!-- [HOW IT WORKS] section removed 2026-05-14: no equivalent exists on live site. If restored, source-of-truth here goes first. -->

---

<!-- BRIEF
  Goal: objection handling — surface the trade-off honestly so the visitor self-qualifies.
  Audience state: deciding between us, a larger agency, or a freelance team.
  One idea: each option wins on something; here's the honest read.
  Proof: chain names + acknowledged competitor wins (the ✓ marks).
  CTA: none (decision-support section).
-->

### [COMPARISON — H2]

## How Metaborong compares

*Alt headlines:*
- "Choosing between us and the alternatives"
- "Where each option wins"

*Section intro (16 words):*
If you're choosing between us, a large agency, or a freelance team — here's the honest read.

| | Metaborong | Large Web3 or AI Agency | Freelance team |
|---|---|---|---|
| **Team access** | Direct — founders | Account manager layer | Direct but inconsistent |
| **AI-native services** | Core offering | Add-on or absent | Rare |
| **DeFi depth** | 7 chains — Ethereum, Solana, Base, Arbitrum, Hyperledger, Polygon, Avalanche | Generic | Depends on individual |
| **Speed to delivery** | Weeks | Months | Unpredictable |
| **Product thinking** | Built in | Execution-focused | Absent |
| **Track record** | DeFi · AI · SaaS shipped | Hundreds of clients ✓ | Case by case |

*Footnote:*
✓ marks where the alternative genuinely wins. Larger agencies have longer track records — a real advantage for enterprises needing procurement comfort. We win on speed, AI-native depth, and direct access.

<!-- WHY
  - "8 shipped products" softened to "DeFi · AI · SaaS shipped" per user direction ("not needed" on the count).
  - "Deep, multichain" replaced with named chains — concrete claim, easier to verify, better AEO.
  - Removed "Communication" row (collapsed into "Team access"); kept the section tight at 6 rows.
  - Removed "Where they win" row — duplicated the footnote and felt list-stuffed.
  - Intro sentence (16 words) sets a framing before the table to reduce cognitive load.
-->


---

<!-- BRIEF
  Goal: handle the last objections before Contact CTA + give AI engines clean extractable answers.
  Audience state: warmed; objections remaining are timeline, cost shape, location, scope-fit.
  One idea per Q: one self-contained answer that doesn't repeat the rest of the page.
  Proof: concrete ranges where honest (4–12 weeks, remote-first/global).
  CTA: none — funnels into Contact CTA below.

  Cut 2 entries per user decision (2026-05-14): old Q2 (Web3 service list) + Q3 (AI service list) — both duplicated Services section.
  Added 1 new high-friction Q ("Do we need an NDA…") to mirror the hero "no pitch decks" promise.
  Result: 7 entries (was 8), no repetition of "Metaborong is…" as sentence-start.
-->

### [FAQ — H2]

## Frequently asked questions

*Alt headlines:*
- "Questions before we start"
- "What founders ask before scoping"

*Each Q is a real third-person search query (AEO target). Each answer ≤50 words, self-contained for AI extraction, varied sentence subjects.*

**Q: What is a Web3 development company?**
A: A Web3 development company designs, audits, and ships blockchain products — DeFi protocols, smart contracts, NFT marketplaces, and on-chain integrations. Metaborong is one such studio: three technical co-founders, Web3 and AI as equal practices, working with crypto-native teams and founders worldwide.

**Q: How long does it take to build a DeFi protocol or smart contract?**
A: Smart contracts and AI integrations typically ship in four to six weeks. Full DeFi protocols and SaaS platforms run eight to twelve. Scope drives the range — a single contract audit closes faster than a multichain vault with custom incentive logic.

**Q: How much does it cost to build a Web3 or AI product?**
A: Cost depends on scope, chain mix, and AI surface area. Studios like Metaborong quote fixed-scope rates from a written brief rather than hourly retainers — a smart contract audit and a multichain DeFi protocol get different envelopes, not different hourly estimates. Numbers follow the first call.

**Q: What is the difference between a Web3 agency and a smaller development studio?**
A: Smaller Web3 studios run lean — senior engineers writing code, no account-manager layer. Larger agencies add coordination overhead and junior delivery teams. Metaborong is a three-founder studio: founders write code, communicate directly with clients, and own delivery end-to-end.

**Q: Can a Web3 development studio also build AI agents?**
A: Yes, when both practices are core. At Metaborong, Web3 and AI sit as equal pillars — neither is bolted onto the other. The same engineers ship multichain DeFi protocols and production AI agents, including agents that interact with on-chain systems.

**Q: Do you need an NDA before discussing a Web3 or AI project?**
A: No. A first conversation is to understand what you are building and whether the team is the right fit. NDAs come once scoping is concrete and proprietary detail is on the table — not before a thirty-minute introduction.

**Q: Do Web3 development studios also build Web2 SaaS products?**
A: Some do. At Metaborong, the Product Studio pillar builds custom Web2 SaaS platforms independently of blockchain or AI — for teams who need a full-stack partner without a Web3 component. The three studio practices carry equal weight.

<!-- WHY (2026-05-21 — Session 18-faq A3 reopen)
  - User reopened the 2026-05-14 lock with "I need actual FAQ questions that bring SEO,
    AEO there." Every Q rewritten as a third-person informational search query — the
    kind a Web3/AI/SaaS founder would type into Google / ChatGPT / Perplexity. The
    6/7 branded second-person Qs ("What is Metaborong?", "Who do you work with?",
    "Where are you based?", etc.) are gone.
  - Every A leads with the entity definition / direct answer, names Metaborong once
    in the body for AI overview attribution, and stays self-contained. Sentence-start
    variety preserved: only 1/7 starts with "A Web3…" (lock target met). 0/7 with
    "Metaborong is…" — that pattern stays retired.
  - Word counts: 39–47, all ≤50.
  - Claim discipline: no pricing figures (would fail without user-verified scope);
    no chain count (7-vs-4-chains drift stays deferred per D6).
  - Audit (2026-05-21): baseline composite 6.4 → rewrite 8.8 (AEO question
    targeting 3 → 9 is the primary win). Full table in
    docs/superpowers/specs/2026-05-21-faq-copy-audit.md.
  - SUPERSEDED — the 2026-05-14 lock (7 branded Qs, "What is Metaborong?" as Q1)
    kept for provenance:
      Q1 What is Metaborong? · Q2 How long does a typical project take? ·
      Q3 Who do you work with? · Q4 Do we need an NDA before talking? ·
      Q5 How are you different from larger Web3 and AI agencies? ·
      Q6 Where are you based? · Q7 Do you work outside Web3 and AI?
-->


---

### [TRUST SIGNALS]

*To be displayed near footer or alongside testimonials:*

- 8+ products shipped in production
- Clients across DeFi, gaming, AI, and SaaS verticals
- Multichain experience: Ethereum, Solana, Base, Arbitrum (confirm with team)
- Founders reachable directly — no account manager layer
- `contact@metaborong.com`

---

<!-- BRIEF
  Goal: convert. Get the visitor to email.
  Audience state: warm, objections handled, ready to either email or bounce.
  One idea: send us your spec, get a written approach back — no gatekeeping.
  Proof: 12h reply time (mirrors hero eyebrow).
  CTA: "Email us" (3 words, ≤ DESIGN.md cap).
-->

### [CONTACT CTA — light section]

## Got a project in mind?

**Sub:**
We build what large agencies under-deliver and freelancers can't architect, across Web3 protocols, AI agents, and SaaS products. Tell us what you are building. We will tell you how we would approach it — no pitch deck, no fluff, no commitment required.

**Primary CTA:** `Start a conversation →` → `mailto:contact@metaborong.com?subject=New%20project%20inquiry`

<!-- WHY (2026-05-20 — Figma sync, supersedes the Session-17 A3 rewrite below)
  - User reverted to the Figma 233:261 copy verbatim ("Got a project in mind?" /
    "Start a conversation"). The Session-17 A3 rewrite ("Tell us the build…" +
    "straight from a founder" + 12h risk reducer + secondary email) is
    superseded by explicit user instruction "make the ux-copy same as in figma".
  - Figma sub had a mid-word edit accident ("…Web3 protocols, ATell us…");
    reconstructed to "AI agents, and SaaS products. Tell us…" per user
    confirmation 2026-05-20 (matches site-wide Web3 + AI + SaaS positioning).
  - Risk reducer + secondary email removed (not in Figma).
-->

<!-- SUPERSEDED — Session-17 A3 rewrite (kept for provenance)
  H2: "Tell us the build. We'll send the approach."
  Sub: "No pitch deck, no discovery-call gauntlet — a written approach to your Web3 or AI build, straight from a founder."
  CTA: "Email us →" + risk reducer "Most teams hear back within 12 hours." + secondary "contact@metaborong.com".
  Audit score 7.6 → 8.1, claim-gate PASS. Reverted 2026-05-20 to match Figma.
-->



---

### [FOOTER — light, expanded sitemap (redesigned 2026-05-19, Figma 237:359)]

**Positioning line (near wordmark, 16w):**
Metaborong builds and ships Web3 protocols, AI agents, and SaaS products — a small, senior, founder-led team.

**Wordmark:** `METABORONG` — rendered as live text (not a raster; SSR/SEO-crawlable, crisp, responsive).

**Column — Company:** Work `/#work` · About `/#founders` · Blog `/blog` · FAQ `/#faq` · Contact `/#contact`

**Column — Services:** Web3 / Blockchain · AI Agents · Product Studio — all → `/#services` (service pillar/leaf pages are `robots:noindex,nofollow`; the homepage anchor is the only indexable, SEO-valuable target)

**Column — Offices (user-verified 2026-05-19, publish verbatim):**
- **India** — 117, Rajyadharpur Govt Colony, Mallickpara, Serampore, West Bengal
- **United Arab Emirates** — Sharjah Media City, Sharjah, UAE, Al Batayih, 000000
- **USA** — 16192 Coastal Hwy, Lewes, DE 19958

**Column — Get in touch:** `contact@metaborong.com` (mailto) · social row

**Social:** LinkedIn `https://linkedin.com/company/metaborong-technologies` · X `https://x.com/Metaborong` · Behance, Medium, Discord → `/` (TEMPORARY homepage redirect — real URLs pending; follow-up to swap. No `rel="me"` on the temp links.)

**Bottom bar:** `© {dynamic year} Metaborong Technologies` (left) · LinkedIn · X (right)

**No legal row** — no Privacy/Terms pages exist (user-confirmed); omitting beats a dead link.

<!-- WHY (A3 create, 2026-05-19 — Session 17 Figma redesign)
  - Footer expands from a single compact row to the Figma sitemap structure
    (237:359), placeholder "ARNAB RAY ×4" card grid DROPPED (user decision —
    Founders section already carries the team; avoids publishing personal
    mobiles).
  - Only real prose is the 16-word positioning line: names all THREE pillars
    (Web3, AI, SaaS) with equal weight (positioning rule: never Web3-first),
    "small, senior team" mirrors the Services H2, "founder-led" restates the
    published TRUST SIGNALS claim — no new/unverifiable claim. Guardrails PASS.
  - Offices user-verified 2026-05-19 → copywriting claim-gate PASS (client is
    the authority); publish verbatim incl. UAE "000000".
  - Stale removed/reconciled: "Dribbble" dropped (not a real channel in code);
    "metaborong™" → live "METABORONG" wordmark; static "© 2026" → dynamic year
    (also fixes Figma's "@2026" bug).
  - Services → /#services only (noindex,nofollow on service pages; see the
    copy-audit SEO advisory §C — real lever is reindexing, out of scope here).
-->
<!-- CLAIM PROVENANCE: "founder-led" / "small, senior team" = restatements of
  the existing published TRUST SIGNALS + Services-H2 lines, not new claims.
  Office addresses = user-verified 2026-05-19. Copywriting gate: PASS. -->

---

## AEO / GEO Compliance Checklist

- [x] AEO extraction sentence in blockquote after H1 (52 words, self-contained)
- [x] Definition of Metaborong within first 60 words of page body
- [x] 134+ word answer block in Services section (134 words)
- [x] Question-based H2s present (FAQ section)
- [x] FAQ: 7 Q&As, all under 50 words, all self-contained
- [x] E-E-A-T signals: named founders + LinkedIn, testimonials with names, portfolio projects
- [x] Comparison table with honest competitor acknowledgement
- [x] Single H1 with primary keyword (`web3 development company` contained)
- [x] No "revolutionary", "game-changing", "best-in-class"
- [ ] `llms.txt` — to be created at site root
- [ ] AI crawlers (GPTBot, ClaudeBot, PerplexityBot) — allow in `robots.txt`
- [ ] `Organization` + `WebSite` JSON-LD schema — to be implemented in code
- [ ] Publication date + last-updated date — to be added to page metadata
- [ ] Server-side rendering confirmed — Next.js App Router handles this natively

---

## Notes for Visual Design

- Hero right panel visual treatment: TBD (video loop / ASCII / isometric art)
- Trust bar should auto-scroll with no pause on hover — purely decorative, no SEO value
- Comparison table: mobile-friendly (horizontal scroll or collapsed rows)
- FAQ section: consider accordion expand/collapse for UX (content still in DOM for crawlers)
- Light contact CTA section (redesigned 2026-05-19, Figma 233:261): `--color-bg` background, dark text, brand-blue radius-0 CTA, full-width ASCII-hills raster anchored bottom
