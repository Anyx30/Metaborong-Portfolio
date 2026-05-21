# content-ai — v1 AI leaf authoring

Authored content for the 6 v1 AI leaf service pages per SERVICES_PLAN.md
§ 6 word budget. All copy lives in `lib/services/content/ai.ts` as
`LeafContent` exports, registered in `lib/services/content/index.ts`.

## Files touched

- `lib/services/content/ai.ts` — new. 6 named exports, one per v1 AI
  leaf. ~6,200 words including code structure and field comments;
  ~4,800 words of authored prose.
- `lib/services/content/index.ts` — registered the 6 exports against
  the `${pillar}/${slug}` composite keys the route loader reads.

## Leaves authored

| Slug                                  | Sub-group   | Approx prose words | Notes                                                                                                |
|---------------------------------------|-------------|--------------------|------------------------------------------------------------------------------------------------------|
| `ai-audit-opportunity-assessment`     | Strategy    | ~810               | Anchored on scored opportunity map + 90-day roadmap. Anonymized BI/warehouse + mid-market SaaS proof. |
| `ai-copilots-internal-tools`          | Product     | ~820               | Anchored on Slack/CRM/internal copilot scope. Anonymized construction-ops + prompt-platform proof.    |
| `conversational-agents-assistants`    | Product     | ~830               | Voice + chat split. Anonymized prompt-platform + ops-workflow proof. Tool-calling emphasis.           |
| `agentic-ai-systems`                  | Engineering | ~810               | Multi-step orchestration, guardrails, human-in-loop. Anonymized construction-ops + enterprise proof.  |
| `rag-retrieval-pipelines`             | Engineering | ~820               | Hybrid retrieval, evals (recall / faithfulness / citation). Anonymized BI/warehouse + SaaS proof.     |
| `llm-integration-architecture`        | Engineering | ~810               | Gateway, routing, cost ceilings, observability. Anonymized prompt-platform + construction-ops proof.  |

Each leaf totals ~800 words of authored prose across hero, deliverables,
phases, fit/doesn't-fit, AEO answer, related work, and FAQs — within the
750–1060 budget in SERVICES_PLAN.md § 6.

## Voice / constraint audit

- **`we` not `our team`** — used throughout. No instances of "our team",
  "the team", or "Metaborong's team" in authored prose. Brand mentions
  ("Metaborong has eight verified Clutch engagements...") sit only in
  the AEO answer blocks.
- **Banned marketing terms** — none of `revolutionary`, `cutting-edge`,
  `world-class`, `best-in-class`, `game-changing` appear. Verified by
  scanning the file against the banned list.
- **No invented client names** — every related-work descriptor uses an
  anonymized category ("Mid-market SaaS", "Retail BI deployment",
  "Construction operations team", "AI prompt platform"). Real
  engagements are referenced obliquely; no logos, no company names.
- **No fabricated metrics** — the only numbers in AEO answers are
  Metaborong's verified Clutch posture (8 engagements, 4.9 rating) and
  the engagement-duration ranges in SERVICES_PLAN.md and the SEO map.
  No invented user counts, throughput numbers, accuracy figures, or
  cost-savings claims.
- **Sentence length** — body prose targets 12–14 words; em-dash and
  colon preferred over connective phrases. Most sentences in the
  10–20-word range. A handful run longer in technical phases where
  splitting would obscure the dependency between two clauses.
- **Bullets ≤16 words** — every `deliverable.label` and every
  `fit.fits` / `fit.doesNotFit` bullet checked against the limit.

## Real-proof references (anonymized)

These four real Metaborong engagements surface across the 6 leaves in
anonymized descriptors. None of them is named directly.

| Real engagement                           | Used in related-work blurbs of                                          |
|-------------------------------------------|--------------------------------------------------------------------------|
| MINISO Greece BI / data warehouse         | `ai-audit-opportunity-assessment`, `rag-retrieval-pipelines`            |
| SBS Construction AI workflow              | `ai-copilots-internal-tools`, `agentic-ai-systems`, `llm-integration-architecture` |
| Lora AI prompt engineering                | `ai-copilots-internal-tools`, `conversational-agents-assistants`, `llm-integration-architecture` |
| 8 Clutch engagements / 4.9 rating         | AEO answer paragraph on all 6 leaves                                    |

Sedax ZKP identity work is reserved for the DID leaf (Web3 pillar), not
referenced here.

## When-fits / when-doesn't honesty pass

Each `fit.doesNotFit` block contains a real disqualifier — a buyer can
self-disqualify after reading it. Sample lines:

- audit: "You already know exactly what to build and only need
  engineering capacity to ship it."
- copilots: "You need the copilot live in two weeks — a production-grade
  build needs six weeks minimum."
- conversational: "You want an FAQ chatbot — that is a different, much
  simpler engagement we do not focus on."
- agentic: "The workflow demands sub-second latency throughout —
  multi-step agents are not a real-time pattern."
- RAG: "You expect retrieval to recover unstructured chat logs without
  a labelling pass first."
- LLM integration: "You do not have an existing product yet — start
  with a build engagement, not an integration one."

## Cross-references

- All 6 `aeoAnswer` blocks follow the
  `{Service} is a {category} for {audience} that {outcome}. {Fact 1}.
  {Fact 2}.` pattern from the interface comment.
- All 6 `relatedServices` arrays list 2 same-pillar AI siblings + 1
  cross-pillar Product Studio leaf (per Template C guidance in § 3 of
  SERVICES_PLAN.md). Cross-pillar target is
  `product-studio/saas-product-development` or
  `product-studio/product-discovery-validation` depending on context.
- `relatedWork` cards link to `/work` — placeholder until real case
  studies land per § 8 of SERVICES_PLAN.md.

## Verification

- `npm run typecheck` clean — `LeafContent` shape satisfied by every
  export; `relatedServices` `pillar` values type-check against
  `PillarId`; tuples `[A, B, C]` enforced for `fit.fits` and
  `fit.doesNotFit`.
- Registry lookup keys match the route's `${pillar}/${slug}` composite
  form, so `getLeafContent('ai', '<slug>')` resolves each new leaf.

## Out of scope for this stream

- Web3 v1 leaves (6) — separate content stream.
- Product Studio v1 leaves (4) — separate content stream.
- Coming-soon AI stubs (4) — no authoring required; render the noindex
  fallback.
- DID leaf AEO Aadhaar-fact requirement — applies to the Web3 stream,
  not this one.
