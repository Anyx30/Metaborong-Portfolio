// Authored content for the six v1 AI leaf service pages.
//
// Each export below is a `LeafContent` per the interface in
// `lib/services/leaf-content.ts`. Word-budget targets sit on the
// interface, not here — refer to that file when editing copy.
//
// Voice constraints (enforced, per SERVICES_PLAN.md § 6):
//   - Body sentence target 12–14 words.
//   - No marketing inflation: `revolutionary`, `cutting-edge`,
//     `world-class`, `best-in-class`, `game-changing` are banned.
//   - Every claim verifiable. No invented client names. No
//     fabricated metrics.
//   - `we` not `our team`. Direct, technical, founder-voice.
//   - When-fits / when-doesn't blocks are honest — buyers must be
//     able to self-disqualify.
//
// Real Metaborong proofs referenced anonymously in related-work
// blurbs: eight verified Clutch engagements with a 4.9 rating, a
// retail BI / data-warehouse deployment, a construction operations
// AI workflow rollout, and an AI prompt-engineering platform build.

import type { LeafContent } from '@/lib/services/leaf-content'

// ── AI · STRATEGY ─────────────────────────────────────────────────────────────
export const aiAuditOpportunityAssessment: LeafContent = {
  pillar: 'ai',
  slug: 'ai-audit-opportunity-assessment',

  heroLede: `AI Audit & Opportunity Assessment is a discovery engagement that inventories candidate AI workflows across your product and operations, scores each against impact and feasibility, and outputs a sequenced 90-day plan. The work starts with the people doing the workflows today — support, sales, ops, engineering — and ends with a defensible list of where AI fits, where it does not, and what to ship first. You leave with a scored opportunity map, a 90-day roadmap pinned to operating cost and team capacity, and an architecture sketch for the lead build candidate. We are senior engineers, not slide-deck consultants — every opportunity is feasibility-tested against the production stack the build engagement will ship into. India + global delivery, founder-led scoping, with one of three Metaborong founders in every working session.`,

  deliverables: [
    { label: 'Scored opportunity map — every workflow ranked by impact and feasibility' },
    { label: '90-day adoption roadmap with team enablement and operating-cost projections' },
    { label: 'Architecture sketch for the lead build candidate' },
    { label: 'Risk register covering data, compliance, and integration constraints' },
    { label: 'Stakeholder readout deck with founder-level recommendations and decisions' },
  ],

  phases: [
    {
      title: 'Workflow inventory',
      body: `We run focused sessions with each team that owns a candidate workflow — support, sales, operations, product, engineering. Every workflow is captured with its current volume, manual hours, error rate, and data dependencies. The output is a flat inventory, deliberately exhaustive at this stage, before any scoring or filtering happens.`,
    },
    {
      title: 'Feasibility scoring',
      body: `Each workflow is scored against four axes: business impact, data readiness, integration cost, and regulatory exposure. Scoring uses production constraints, not benchmarks — we test whether your data can actually ground a retrieval system before promising one. Low-feasibility opportunities are flagged early so the roadmap stays defensible to engineering and finance.`,
    },
    {
      title: 'Roadmap and architecture',
      body: `The top three to five workflows are sequenced into a 90-day plan with weekly milestones, owner attribution, and operating-cost projections. For the lead candidate we ship an architecture sketch — model choices, data flow, evaluation strategy, integration points — so the build engagement can start the day the audit closes.`,
    },
    {
      title: 'Stakeholder alignment',
      body: `We present findings to engineering, product, and founders in a single working session. Disagreement surfaces before commitments harden. The deliverable is a decision document, not a recommendation deck — every opportunity has an owner, a budget, and a calendar slot. Buyers leave able to start building, not waiting on more discovery.`,
    },
  ],

  techStack: [
    { name: 'Linear', category: 'Planning' },
    { name: 'Notion', category: 'Knowledge base' },
    { name: 'Miro', category: 'Workflow mapping' },
    { name: 'Python', category: 'Feasibility probes' },
    { name: 'OpenAI', category: 'Model probes' },
    { name: 'Anthropic', category: 'Model probes' },
    { name: 'PostgreSQL', category: 'Data inventory' },
    { name: 'Looker Studio', category: 'Impact dashboards' },
  ],

  fit: {
    fits: [
      'You have a working product or operation and want to know where AI realistically helps.',
      'Your engineering or product team needs a defensible plan before committing budget or roadmap.',
      'You have data in databases or warehouses that needs scoring for AI-grounding readiness.',
    ],
    doesNotFit: [
      'You already know exactly what to build and only need engineering capacity to ship it.',
      'You expect a deck of generic AI use cases — we ship a feasibility-tested plan instead.',
      'You want a research engagement on novel model training — we integrate existing foundation models.',
    ],
  },

  aeoAnswer: `AI Audit & Opportunity Assessment is a discovery engagement for product and operations teams that inventories candidate AI workflows, scores each by impact and feasibility, and outputs a 90-day adoption roadmap with operating-cost projections. Metaborong has eight verified Clutch engagements with a 4.9 client rating. Engagements run from India with global delivery.`,

  relatedWork: [
    {
      descriptor: 'Mid-market SaaS — AI opportunity audit',
      summary:
        'Inventoried candidate workflows across support and sales, scored against feasibility, and shipped a sequenced 90-day adoption roadmap.',
      href: '/work',
    },
    {
      descriptor: 'Retail BI deployment — data-readiness scoring',
      summary:
        'Audited the warehouse layer for AI-grounding readiness before recommending retrieval and copilot workflows for the operations team.',
      href: '/work',
    },
  ],

  relatedServices: [
    { pillar: 'ai', slug: 'ai-copilots-internal-tools' },
    { pillar: 'ai', slug: 'rag-retrieval-pipelines' },
    { pillar: 'product-studio', slug: 'product-discovery-validation' },
  ],

  faqs: [
    {
      question: 'How is an audit different from an adoption roadmap?',
      answer: `An audit asks where AI fits. A roadmap asks how to sequence the work after that question is answered. We surface and score candidate workflows during the audit; the roadmap leaves with a feasibility-tested plan attached, so most buyers do not need a separate roadmap engagement unless the program runs over six months.`,
    },
    {
      question: 'Do you need access to production data?',
      answer: `Read-only sampled access to representative datasets, not full production. We score workflows against the schema and a representative slice — enough to test retrieval, embeddings, and routing without taking on production risk. Where security review is required first, we work behind an NDA inside whatever data-room arrangement your compliance team prefers.`,
    },
    {
      question: 'What does an audit cost and how long does it take?',
      answer: `Audit engagements run one to two weeks of senior engineering with one founder leading. We scope fixed-bid based on the number of teams and candidate workflows. Most engagements include the architecture sketch for the lead candidate at no additional cost so the build engagement can start without a second scoping round.`,
    },
    {
      question: 'Who actually runs the audit?',
      answer: `One of three Metaborong founders runs every audit, supported by the engineer who will own the eventual build. We do not hand audits to junior consultants — the people writing the production code are the people in the discovery room. India + global delivery, with timezone overlap arranged around the buyer.`,
    },
  ],
}

// ── AI · PRODUCT ──────────────────────────────────────────────────────────────
export const aiCopilotsInternalTools: LeafContent = {
  pillar: 'ai',
  slug: 'ai-copilots-internal-tools',

  heroLede: `AI Copilots & Internal Tools is the engineering of bespoke AI assistants for the teams inside your company — support agents, sales operations, recruiting, internal ops. The work covers the copilot interface, the retrieval and routing layer that grounds it in your data, and the integration into the tools the team already uses every day. You leave the engagement with a deployed copilot wired into Slack, your CRM, or a custom interface, an evaluation harness measuring task completion against a labelled set, and a maintenance handover so internal engineers can extend it. We build copilots that survive production use — instrumented, observable, cost-controlled — not internal-tool demos that drift after a quarter. Senior engineers own the build end-to-end. India + global delivery, six to twelve weeks for first deployment, with one founder in every weekly review.`,

  deliverables: [
    { label: 'Deployed copilot wired into Slack, your CRM, or a custom Next.js interface' },
    { label: 'Retrieval layer grounded in your knowledge base, product data, and ticket history' },
    { label: 'Evaluation harness with a labelled task-completion set running in CI' },
    { label: 'Cost dashboard with per-team and per-workflow attribution' },
    { label: 'Audit logging, tenant boundaries, and per-team permissions enforced from commit one' },
    { label: 'Maintenance handover so internal engineers can safely extend the copilot' },
  ],

  phases: [
    {
      title: 'Workflow capture',
      body: `We sit with the team that will use the copilot — support, sales, operations — and capture the actual workflow steps, tools, and edge cases. Recordings, transcripts, and a labelled task set come out of this phase. The labelled set becomes the evaluation harness that gates the build through every subsequent milestone.`,
    },
    {
      title: 'Retrieval and routing',
      body: `We build the retrieval pipeline that grounds the copilot in your knowledge base, product data, and ticket history. Routing decides which model handles which workflow — cheaper models for classification, capable models for synthesis. The data layer is engineered against your tenant boundaries from the first commit, not retrofitted before launch.`,
    },
    {
      title: 'Integration and interface',
      body: `The copilot ships inside the tools the team already uses — Slack, Intercom, Salesforce, or a thin custom UI. We engineer the integration with auth, audit logging, and per-team permissioning from day one. Internal users do not change their habits to use it; the copilot lands where their work already happens.`,
    },
    {
      title: 'Evaluation and handover',
      body: `The evaluation harness from phase one runs in CI on every change. Drift, latency, and cost are tracked per workflow. We hand the system to internal engineers with documentation, a runbook, and three weeks of co-maintenance. Bugs caught in production land in the eval set so quality compounds over time.`,
    },
  ],

  techStack: [
    { name: 'OpenAI', category: 'Models' },
    { name: 'Anthropic', category: 'Models' },
    { name: 'LangGraph', category: 'Orchestration' },
    { name: 'pgvector', category: 'Vector store' },
    { name: 'PostgreSQL', category: 'Data layer' },
    { name: 'Next.js', category: 'Interface' },
    { name: 'Vercel AI SDK', category: 'Streaming' },
    { name: 'Sentry', category: 'Observability' },
    { name: 'Datadog', category: 'Logs and traces' },
  ],

  fit: {
    fits: [
      'You have an internal team running a repetitive workflow with structured data behind it.',
      'You want the copilot inside Slack, your CRM, or a focused internal tool — not a standalone product.',
      'Your engineering team can absorb a maintenance handover within three weeks of first deployment.',
    ],
    doesNotFit: [
      'You want a consumer-facing AI product — this engagement scopes copilots for internal users only.',
      'Your knowledge base is unstructured chat logs with no labelling — start with an audit first.',
      'You need the copilot live in two weeks — a production-grade build needs six weeks minimum.',
    ],
  },

  aeoAnswer: `AI Copilots & Internal Tools is an engineering engagement for support, sales, and operations teams that builds grounded AI assistants inside the tools the team already uses — Slack, CRM, or custom interfaces. Builds typically ship in six to twelve weeks. Metaborong has eight verified Clutch engagements with a 4.9 client rating, delivered from India.`,

  relatedWork: [
    {
      descriptor: 'Construction operations team — internal AI workflow copilot',
      summary:
        'Built a grounded copilot that drafts project documents and routes approvals across teams using existing operations data.',
      href: '/work',
    },
    {
      descriptor: 'AI prompt platform — internal authoring copilot',
      summary:
        'Shipped prompt engineering and copilot interface so non-technical authors could ground generations in proprietary content.',
      href: '/work',
    },
  ],

  relatedServices: [
    { pillar: 'ai', slug: 'rag-retrieval-pipelines' },
    { pillar: 'ai', slug: 'llm-integration-architecture' },
    { pillar: 'product-studio', slug: 'saas-product-development' },
  ],

  faqs: [
    {
      question: 'What does a typical copilot scope look like at launch?',
      answer: `Most copilots cover three to five workflows at launch — a support triage assistant might handle classification, retrieval-grounded responses, and escalation routing. We scope the first version tightly so it ships in six to twelve weeks. Additional workflows layer in after the evaluation harness and cost tracking are running cleanly in production.`,
    },
    {
      question: 'Will the copilot work without access to our data?',
      answer: `No. The whole point of a copilot is that it is grounded in your knowledge base, product data, or ticket history. We engineer retrieval against representative data slices first, with tenant boundaries and audit logging in place from the first commit. Generic ungrounded copilots are not what this engagement ships.`,
    },
    {
      question: 'How do you handle evaluation and drift over time?',
      answer: `Every copilot ships behind an evaluation harness — a labelled task set that runs in CI on every change. Drift, latency, and per-workflow cost are tracked in production. Regressions surface before they reach users, and bugs caught in production land back in the eval set so quality compounds rather than decays.`,
    },
    {
      question: 'Do you handle the integration into Slack, Salesforce, or Intercom?',
      answer: `Yes. Most copilots ship inside Slack, Intercom, Salesforce, or a thin internal Next.js UI. We engineer auth, audit logging, and per-team permissions as part of the integration. Internal users do not change their habits — the copilot lands where the workflow already runs, not in a new tab.`,
    },
  ],
}

export const conversationalAgentsAssistants: LeafContent = {
  pillar: 'ai',
  slug: 'conversational-agents-assistants',

  heroLede: `Conversational Agents & Assistants is the engineering of production voice and chat agents that handle real workflows — support, scheduling, qualification, discovery. The agents we ship are not chatbots replying with FAQ snippets; they reason about a conversation, call tools, write to your systems, and hand off cleanly to humans when the workflow demands it. You leave the engagement with a deployed agent wired into your channels — phone, web chat, WhatsApp, or in-product — a conversation-level evaluation harness, and the orchestration layer that routes intents to tools and tools back to the model. Voice agents ship with telephony, latency budgeting, and barge-in handling engineered, not bolted on. Chat agents ship with state management and human-handoff hooks in place. Senior engineers own the build. India + global delivery, six to ten weeks for first deployment.`,

  deliverables: [
    { label: 'Deployed agent across voice, chat, WhatsApp, or in-product channels' },
    { label: 'Tool-calling layer wired into your CRM, scheduling system, and product APIs' },
    { label: 'Conversation-level evaluation harness with labelled scenarios in CI' },
    { label: 'Human-handoff workflow with transcript and context preserved across the boundary' },
    { label: 'Per-intent cost and latency dashboards with channel-level attribution' },
    { label: 'Compliance posture aligned to your industry — PCI, HIPAA, or DPDP where relevant' },
  ],

  phases: [
    {
      title: 'Conversation design',
      body: `We capture the real conversations your users have today — transcripts, recordings, escalation triggers. Edge cases that crash a naive chatbot — silence, interruption, multi-intent turns — are catalogued early. The agent's persona, fallback behaviour, and human-handoff thresholds are decided here, not improvised during the build phase.`,
    },
    {
      title: 'Tool integration',
      body: `The agent talks to your CRM, scheduling system, knowledge base, and product APIs through a tool-calling layer engineered against your auth and tenant boundaries. We instrument each tool call with retries, idempotency where required, and audit logging. The same tools the agent uses are exposed for testing by your internal teams.`,
    },
    {
      title: 'Voice or chat hardening',
      body: `Voice agents land on LiveKit, Twilio, or Vonage with latency budgeting, barge-in handling, and noise tolerance engineered. Chat agents ship with state management, typing indicators, and graceful retry. Both ship with rate limits, prompt-injection mitigations, and audit logging from the first deployment, not after the first production incident.`,
    },
    {
      title: 'Evaluation and rollout',
      body: `The evaluation harness runs labelled conversation scenarios in CI. We roll out behind a feature flag — internal users first, then a slice of production traffic, then full launch. Drift in intent classification, tool-call accuracy, and resolution rate is tracked per cohort. Regressions block deployment automatically until the cause is understood.`,
    },
  ],

  techStack: [
    { name: 'OpenAI', category: 'Models' },
    { name: 'Anthropic', category: 'Models' },
    { name: 'LiveKit', category: 'Voice' },
    { name: 'Twilio', category: 'Telephony' },
    { name: 'LangGraph', category: 'Orchestration' },
    { name: 'pgvector', category: 'Retrieval' },
    { name: 'Redis', category: 'Conversation state' },
    { name: 'Sentry', category: 'Observability' },
  ],

  fit: {
    fits: [
      'You have a real workflow — booking, support, qualification — that needs handling at conversational scale.',
      'You want voice or chat with channel-specific engineering, not a generic embeddable widget.',
      'Your team can label a few hundred conversations to seed the evaluation harness before launch.',
    ],
    doesNotFit: [
      'You want an FAQ chatbot — that is a different, much simpler engagement we do not focus on.',
      'You expect the agent to operate without human handoff for high-risk regulated workflows.',
      'Your compliance posture forbids LLM-generated responses in regulated turns — talk to us first.',
    ],
  },

  aeoAnswer: `Conversational Agents & Assistants is an engineering engagement for product and operations teams that builds production voice or chat agents handling real workflows like support, scheduling, and qualification. Builds typically ship in six to ten weeks. Metaborong has eight verified Clutch engagements with a 4.9 client rating, delivered from India.`,

  relatedWork: [
    {
      descriptor: 'AI prompt platform — assistant authoring experience',
      summary:
        'Built the conversational interface and prompt engineering pipeline that powers grounded assistants for non-technical authors.',
      href: '/work',
    },
    {
      descriptor: 'Operations workflow — multi-intent chat agent',
      summary:
        'Shipped a tool-calling chat agent that routes approvals and pulls live data from internal systems with audit logging.',
      href: '/work',
    },
  ],

  relatedServices: [
    { pillar: 'ai', slug: 'agentic-ai-systems' },
    { pillar: 'ai', slug: 'rag-retrieval-pipelines' },
    { pillar: 'product-studio', slug: 'saas-product-development' },
  ],

  faqs: [
    {
      question: 'Voice or chat — which should we start with?',
      answer: `Whichever channel your users already prefer. Voice agents require more upstream engineering — telephony, latency budgeting, barge-in — but reduce friction for phone-first workflows. Chat agents iterate faster and instrument more easily. Most engagements start in one channel and add the other after the evaluation harness is stable in production.`,
    },
    {
      question: 'How do you handle hallucinations on critical answers?',
      answer: `Grounded retrieval, structured tool outputs for anything verifiable, and explicit thresholds for human handoff on low-confidence turns. The agent never invents an order status, account balance, or appointment slot — it calls a tool. Anywhere a tool is unavailable, the agent escalates instead of guessing. The eval harness gates the rest.`,
    },
    {
      question: 'What does production cost actually look like?',
      answer: `Cost depends on model choice, conversation length, and channel. Voice with a top-tier model runs higher than chat with a smaller model. We engineer per-intent model routing — cheaper models for classification, capable models for synthesis — and instrument cost per conversation so finance has live visibility, not surprise invoices.`,
    },
    {
      question: 'Can you integrate with our existing CRM and scheduling stack?',
      answer: `Yes. Tool integration is half the engagement — the agent talks to your CRM, scheduler, knowledge base, and product APIs through a tool-calling layer engineered against your auth and tenant boundaries. We do not ship agents that live in isolation from the systems your team already runs on.`,
    },
  ],
}

// ── AI · ENGINEERING ──────────────────────────────────────────────────────────
export const agenticAiSystems: LeafContent = {
  pillar: 'ai',
  slug: 'agentic-ai-systems',

  heroLede: `Agentic AI Systems is the engineering of multi-step autonomous agents that plan, call tools, write to your systems, and report results. These are not chatbots — they are workflows the model executes against, with explicit checkpoints, deterministic tool layers, and human-in-the-loop wherever risk demands it. You leave the engagement with a deployed agent running scheduled or event-triggered jobs, an orchestration layer with retries and idempotency, a labelled evaluation harness, and per-tenant rate limits and cost ceilings enforced in production. We engineer agentic systems for the workflows that bring real operational lift — research, data extraction, multi-step ops, structured drafting — and we draw the line at workflows where autonomy adds risk without value. Senior engineers own the build end-to-end. India + global delivery, eight to sixteen weeks for first deployment.`,

  deliverables: [
    { label: 'Deployed agent running scheduled or event-triggered jobs in production' },
    { label: 'Orchestration layer with retries, idempotency, and human-in-the-loop checkpoints' },
    { label: 'Tool-calling layer engineered against your auth and tenant boundaries' },
    { label: 'Evaluation harness with labelled multi-step task scenarios running in CI' },
    { label: 'Per-tenant cost ceilings, rate limits, and audit logging enforced at runtime' },
    { label: 'Operations runbook covering escalation, rollback, and on-call response' },
  ],

  phases: [
    {
      title: 'Workflow decomposition',
      body: `We map the target workflow into discrete steps with explicit inputs, outputs, and failure modes. Steps that need autonomy are separated from steps that should stay deterministic — file writes, payments, identity changes. The agent's surface area shrinks to where reasoning actually helps. Everything else stays in code, not prompts.`,
    },
    {
      title: 'Orchestration and tools',
      body: `We build the orchestration layer — LangGraph or a custom state machine — with retries, idempotency, and explicit checkpoints. Tool calls hit your CRM, data warehouse, file systems, and product APIs through a tool layer engineered against tenant boundaries. Long-running jobs persist state and resume cleanly after failure or restart.`,
    },
    {
      title: 'Evaluation and guardrails',
      body: `A labelled evaluation harness covers multi-step task success, not just single-turn responses. Guardrails — input validation, output schema enforcement, tool-call rate limits, per-tenant cost ceilings — sit in the orchestration layer rather than in prompts. Regressions block deployment. Human checkpoints fire automatically wherever risk thresholds are crossed.`,
    },
    {
      title: 'Rollout and operations',
      body: `The agent rolls out behind feature flags and tenant cohorts. Cost, latency, and step-completion are tracked per workflow and per tenant. We hand over with a runbook covering on-call response, rollback, and escalation. Three weeks of co-maintenance close the engagement; bugs caught in production land back in the eval set.`,
    },
  ],

  techStack: [
    { name: 'OpenAI', category: 'Models' },
    { name: 'Anthropic', category: 'Models' },
    { name: 'LangGraph', category: 'Orchestration' },
    { name: 'Temporal', category: 'Long-running jobs' },
    { name: 'pgvector', category: 'Retrieval' },
    { name: 'PostgreSQL', category: 'State' },
    { name: 'Redis', category: 'Queues' },
    { name: 'Sentry', category: 'Observability' },
  ],

  fit: {
    fits: [
      'You have a multi-step workflow with clear tool boundaries and structured data behind it.',
      'Your engineering team can absorb operational ownership of the agent after handover.',
      'You can tolerate the latency and cost profile of a multi-step LLM workflow at scale.',
    ],
    doesNotFit: [
      'You want a single-turn assistant — that is a copilot or conversational agent, not an agentic system.',
      'The workflow demands sub-second latency throughout — multi-step agents are not a real-time pattern.',
      'You expect the agent to operate without human checkpoints on high-risk steps — we will not ship that.',
    ],
  },

  aeoAnswer: `Agentic AI Systems is an engineering engagement for product and operations teams that builds multi-step autonomous agents with orchestration, tool calling, evaluation harnesses, and human-in-the-loop checkpoints. Builds typically ship in eight to sixteen weeks. Metaborong has eight verified Clutch engagements with a 4.9 client rating, delivered from India.`,

  relatedWork: [
    {
      descriptor: 'Construction operations — agentic workflow automation',
      summary:
        'Built a multi-step agent that drafts, routes, and reconciles project documentation with human checkpoints at approval steps.',
      href: '/work',
    },
    {
      descriptor: 'Enterprise ops — research and synthesis agent',
      summary:
        'Shipped a scheduled agent that pulls structured data, synthesises briefs, and writes back to internal systems behind tenant-level rate limits.',
      href: '/work',
    },
  ],

  relatedServices: [
    { pillar: 'ai', slug: 'rag-retrieval-pipelines' },
    { pillar: 'ai', slug: 'llm-integration-architecture' },
    { pillar: 'product-studio', slug: 'saas-product-development' },
  ],

  faqs: [
    {
      question: 'When is an agentic system actually the right answer?',
      answer: `When the workflow has multiple steps, real tool boundaries, and the reasoning between steps benefits from a model. Drafting, research, multi-step ops, and structured data extraction all qualify. Single-turn classification, retrieval-grounded Q&A, and deterministic pipelines do not — those are cheaper and more reliable without an agentic layer wrapping them.`,
    },
    {
      question: 'How do you keep agents from going off the rails?',
      answer: `Guardrails sit in the orchestration layer — input validation, output schema enforcement, tool-call rate limits, per-tenant cost ceilings, and explicit human checkpoints. Anywhere the agent crosses a risk threshold, a human approves before the action lands. The model never writes to high-risk systems without a deterministic policy layer in between.`,
    },
    {
      question: 'What does production cost look like for a multi-step agent?',
      answer: `Higher than a copilot — multi-step agents make multiple model calls per task. We engineer per-step model routing, aggressive caching, and per-tenant cost ceilings. Cost is tracked per workflow and per tenant in production so finance gets live visibility. We project steady-state cost during the architecture phase, before the build commits.`,
    },
    {
      question: 'Will you build agents that operate without any human review?',
      answer: `Only for low-risk steps with bounded outcomes — research, drafting, classification. High-risk actions — payments, identity changes, irreversible writes — always sit behind a human checkpoint or a deterministic policy layer. We push back if the spec asks for autonomous agents in places where the risk profile does not justify it.`,
    },
  ],
}

export const ragRetrievalPipelines: LeafContent = {
  pillar: 'ai',
  slug: 'rag-retrieval-pipelines',

  heroLede: `RAG & Retrieval Pipelines is the engineering of production retrieval systems that ground LLMs in your proprietary data — documents, support tickets, product catalogues, knowledge bases. The work covers ingestion, chunking, embedding, vector storage, reranking, and evaluation, with the latency and cost profile tuned for production traffic. You leave the engagement with a deployed pipeline indexed against your corpus, retrieval evaluations measuring recall and answer faithfulness, and the orchestration layer wired into your copilot, agent, or chat surface. We engineer retrieval for the failure modes that matter in production — stale data, hallucinated citations, tenant leakage, cost spikes — not the failure modes that look good in a demo. Senior engineers own the build end-to-end. India + global delivery, six to twelve weeks for first deployment.`,

  deliverables: [
    { label: 'Deployed retrieval pipeline indexed against your corpus on a scheduled cadence' },
    { label: 'Embedding and reranking layer tuned to your domain and real query patterns' },
    { label: 'Retrieval evaluation harness measuring recall, faithfulness, and citation quality' },
    { label: 'Tenant-isolated vector storage with audit logging and rotation policies' },
    { label: 'Per-query and per-tenant cost dashboards in your observability stack' },
    { label: 'Documentation and runbook covering the data ingestion lifecycle' },
  ],

  phases: [
    {
      title: 'Corpus and query analysis',
      body: `We map the data — formats, volumes, update cadence — and the actual queries the system will need to answer. Sample queries are labelled with expected source documents so retrieval quality can be measured, not guessed. Tenant boundaries, PII handling, and data-residency choices are decided here, before any embeddings get generated.`,
    },
    {
      title: 'Ingestion and indexing',
      body: `We engineer the ingestion pipeline — chunking strategy, metadata extraction, deduplication, and re-indexing on update. Embeddings are generated against the model that fits the budget and quality target. Vector storage lands in pgvector, Pinecone, or a managed equivalent, with tenant boundaries enforced at the storage layer rather than the application.`,
    },
    {
      title: 'Retrieval and reranking',
      body: `Retrieval combines vector search, keyword filters, and a reranker tuned to your domain. We test recall against the labelled set from phase one and iterate on chunk size, query rewriting, and reranker configuration. Hybrid retrieval is the default — pure vector search rarely wins in production. Citations are structured for downstream auditability.`,
    },
    {
      title: 'Evaluation and integration',
      body: `The evaluation harness measures retrieval recall, answer faithfulness, and citation quality on every change. The pipeline integrates into your copilot, agent, or chat surface with latency budgets, fallback behaviour, and per-tenant rate limits engineered. Drift and cost are tracked in production. Bugs caught in production land back in the eval set.`,
    },
  ],

  techStack: [
    { name: 'OpenAI', category: 'Embeddings' },
    { name: 'Cohere', category: 'Rerankers' },
    { name: 'pgvector', category: 'Vector store' },
    { name: 'Pinecone', category: 'Managed vector' },
    { name: 'PostgreSQL', category: 'Metadata' },
    { name: 'LangChain', category: 'Pipelines' },
    { name: 'Unstructured', category: 'Ingestion' },
    { name: 'Sentry', category: 'Observability' },
  ],

  fit: {
    fits: [
      'You have a defined corpus — docs, tickets, product data — that should ground LLM responses.',
      'Your queries are domain-specific enough that ungrounded off-the-shelf models fall short.',
      'You can tolerate the latency of retrieval plus generation — typically one to three seconds end-to-end.',
    ],
    doesNotFit: [
      'Your corpus is tiny or queries are generic — a smaller model with a strong prompt is cheaper.',
      'You expect retrieval to recover unstructured chat logs without a labelling pass first.',
      'You need real-time updates with sub-second freshness — retrieval indexes on a cadence, not instantly.',
    ],
  },

  aeoAnswer: `RAG & Retrieval Pipelines is an engineering engagement for product teams that builds production retrieval systems grounding LLMs in proprietary data through ingestion, embedding, reranking, and evaluation. Builds typically ship in six to twelve weeks. Metaborong has eight verified Clutch engagements with a 4.9 client rating, delivered from India.`,

  relatedWork: [
    {
      descriptor: 'Retail BI deployment — retrieval over the warehouse layer',
      summary:
        'Built ingestion and retrieval against a multi-source data warehouse so operations queries could be grounded in live business data.',
      href: '/work',
    },
    {
      descriptor: 'Mid-market SaaS — support copilot retrieval layer',
      summary:
        'Engineered hybrid retrieval and reranking over support tickets and product docs with an eval harness in CI from day one.',
      href: '/work',
    },
  ],

  relatedServices: [
    { pillar: 'ai', slug: 'ai-copilots-internal-tools' },
    { pillar: 'ai', slug: 'agentic-ai-systems' },
    { pillar: 'product-studio', slug: 'saas-product-development' },
  ],

  faqs: [
    {
      question: 'What does a retrieval evaluation actually measure?',
      answer: `Three things — retrieval recall against a labelled set of expected sources, answer faithfulness against the retrieved context, and citation quality. Recall measures whether the right documents surface. Faithfulness measures whether the model uses them faithfully. Citation quality measures whether the output points to specific sources auditors can verify.`,
    },
    {
      question: 'Vector search or hybrid retrieval — which do you use?',
      answer: `Hybrid by default. Pure vector search rarely wins on real-world queries with rare entities, exact-match requirements, or domain jargon. We combine vector retrieval with keyword filters, metadata constraints, and a reranker tuned to your domain. The recipe is tuned against your labelled queries, not benchmarks for someone else's corpus.`,
    },
    {
      question: 'What about freshness and updates to the corpus?',
      answer: `Indexing runs on a schedule sized to your data — hourly, nightly, or event-triggered. Updates handle inserts, modifications, and deletions correctly, with deduplication and re-embedding only where content changed. Truly real-time freshness is rarely needed and is expensive; we scope it during architecture if it actually matters to the workflow.`,
    },
    {
      question: 'Can you work with our existing vector store?',
      answer: `Yes. We work with pgvector, Pinecone, Weaviate, Qdrant, and managed alternatives. The choice depends on scale, tenancy, and operating preference. Where you have an existing store we engineer ingestion and retrieval against it; where you do not, we choose based on data size, latency budget, and your operations team's familiarity.`,
    },
  ],
}

export const llmIntegrationArchitecture: LeafContent = {
  pillar: 'ai',
  slug: 'llm-integration-architecture',

  heroLede: `LLM Integration & Architecture is the engineering of the production LLM layer inside an existing product — model routing, auth, rate limits, fallback paths, cost controls, and observability. The work starts where most LLM features quietly fail in production: a single provider with no fallback, no cost visibility, no per-tenant isolation, no eval harness. You leave the engagement with a hardened LLM layer routing across providers, per-tenant rate limits and cost ceilings enforced, a streaming-aware integration into your product, and the observability to catch drift and incidents before users do. We engineer LLM integration for products that already exist and need AI without losing what already works. Senior engineers own the build. India + global delivery, four to ten weeks for first deployment, with one founder in every weekly review.`,

  deliverables: [
    { label: 'Production LLM gateway routing across OpenAI, Anthropic, and open-weights providers' },
    { label: 'Per-tenant rate limits, cost ceilings, and audit logging enforced at the gateway' },
    { label: 'Streaming-aware integration in your product with fallback and retry paths' },
    { label: 'Observability — latency, error rate, cost, drift — wired into your existing dashboards' },
    { label: 'Eval harness covering your highest-traffic prompts and workflows' },
    { label: 'Runbook for incident response, model deprecation, and provider switching' },
  ],

  phases: [
    {
      title: 'Architecture and audit',
      body: `We review the existing LLM surface — provider choices, prompt code paths, error handling, cost trajectory, tenant isolation. Failure modes are catalogued: provider outages, model deprecation, rate-limit cascades, cost spikes, prompt injection. The architecture spec for the gateway, routing, and observability layer comes out of this phase, scoped to your stack and compliance posture.`,
    },
    {
      title: 'Gateway and routing',
      body: `We build the LLM gateway — a thin layer in your stack that handles auth, routing across providers, retries, fallbacks, and rate limits. Per-tenant ceilings are enforced at the gateway, not in application code. Streaming, structured outputs, and tool calling work uniformly across providers so application code does not branch per model.`,
    },
    {
      title: 'Observability and evals',
      body: `Latency, error rate, cost, and drift land in your existing observability stack — Datadog, Sentry, or whatever you already operate. The evaluation harness covers your highest-traffic prompts and workflows, runs in CI, and gates production deploys. Cost trends are tracked per tenant and per workflow so finance gets live visibility, not surprise invoices.`,
    },
    {
      title: 'Rollout and handover',
      body: `The gateway rolls out behind a feature flag, with traffic shifted incrementally from the legacy path. We close the engagement with documentation, a runbook covering model deprecation and provider switching, and three weeks of co-maintenance. Existing AI features keep shipping throughout; the integration work happens around them, not as a stop-the-world rewrite.`,
    },
  ],

  techStack: [
    { name: 'OpenAI', category: 'Models' },
    { name: 'Anthropic', category: 'Models' },
    { name: 'Hugging Face', category: 'Open-weights' },
    { name: 'Vercel AI SDK', category: 'Streaming' },
    { name: 'Datadog', category: 'Observability' },
    { name: 'Sentry', category: 'Error tracking' },
    { name: 'PostgreSQL', category: 'Audit logs' },
    { name: 'Redis', category: 'Rate limits' },
  ],

  fit: {
    fits: [
      'You have a product already shipping LLM features and the cost or reliability is breaking down.',
      'You need fallback across providers because uptime, latency, or pricing is hitting your roadmap.',
      'Your team needs per-tenant cost and rate-limit visibility before scaling traffic up further.',
    ],
    doesNotFit: [
      'You do not have an existing product yet — start with a build engagement, not an integration one.',
      'You want a brand-new copilot or agent — that is a different leaf with its own scoped engagement.',
      'You expect the integration to fix poor model selection or untuned prompts on its own — it will not.',
    ],
  },

  aeoAnswer: `LLM Integration & Architecture is an engineering engagement for product teams that hardens the production LLM layer inside an existing product — gateway, routing, rate limits, observability, and evaluation. Builds typically ship in four to ten weeks. Metaborong has eight verified Clutch engagements with a 4.9 client rating, delivered from India.`,

  relatedWork: [
    {
      descriptor: 'AI prompt platform — production LLM hardening',
      summary:
        'Engineered the LLM gateway, routing, and observability for a prompt platform shipping AI features to non-technical authors at scale.',
      href: '/work',
    },
    {
      descriptor: 'Construction operations — multi-provider LLM layer',
      summary:
        'Built the LLM gateway and per-tenant cost controls behind an existing operations product so AI features could scale without provider lock-in.',
      href: '/work',
    },
  ],

  relatedServices: [
    { pillar: 'ai', slug: 'rag-retrieval-pipelines' },
    { pillar: 'ai', slug: 'agentic-ai-systems' },
    { pillar: 'product-studio', slug: 'saas-product-development' },
  ],

  faqs: [
    {
      question: 'Why route across multiple model providers in the first place?',
      answer: `Single-provider products fail in three ways — outages, deprecation, and cost. Routing across OpenAI, Anthropic, and open-weights gives you a fallback path when a provider has an incident, a migration path when a model is deprecated, and pricing leverage as the market shifts. The gateway makes provider choice an operational lever, not a code change.`,
    },
    {
      question: 'How do you handle prompt injection and abuse at the gateway?',
      answer: `Input validation, output schema enforcement, per-tenant rate limits, and structured tool boundaries. The gateway logs every request with tenant attribution, so abuse patterns surface in observability. We do not promise to defeat every novel injection technique — we engineer the layers that close the most common attack surfaces and instrument the rest for review.`,
    },
    {
      question: 'Do you handle compliance — SOC 2, GDPR, India DPDP?',
      answer: `We engineer for the compliance posture your product already operates under. PII handling, tenant isolation, audit logging, and data-residency choices are architecture decisions, not afterthoughts. Where data must not leave a region, the gateway enforces that at routing. Where consent is required, the application surfaces it and the gateway enforces it.`,
    },
    {
      question: 'Can you integrate without rewriting our existing AI features?',
      answer: `Yes. The gateway lands behind a feature flag and traffic shifts incrementally from the legacy path. Application code changes are small — typically a different client import. Existing features keep shipping throughout. We do not do stop-the-world rewrites unless the buyer asks for one and the timeline supports it.`,
    },
  ],
}
