// Authored copy for the pillar-hub template (Template B).
//
// One entry per pillar. Hero copy is 200-300 words and opens with the
// entity-definition pattern. Sub-group descriptions are one paragraph
// each. FAQs are 5-6 per pillar (15-18 total). Engagement-model vocab
// is pillar-tailored per SERVICES_PLAN.md § 3 Template B.
//
// Case-study placeholders use anonymized descriptors — no invented
// client names, no fabricated metrics. They link to /work.

import type { PillarId, SubGroupId } from '@/components/sections/services-data'

export type SubGroupCopy = {
  id: SubGroupId
  description: string
  caseStudy: { descriptor: string; outcome: string; href: string }
}

export type EngagementPhase = {
  label: string
  duration: string
  body: string
}

export type PillarFaq = { q: string; a: string }

export type PillarHubCopy = {
  id: PillarId
  positioning: string
  heroParagraphs: string[]
  subGroups: SubGroupCopy[]
  engagement: EngagementPhase[]
  faqs: PillarFaq[]
}

export const pillarHubCopy: Record<PillarId, PillarHubCopy> = {
  ai: {
    id: 'ai',
    positioning: 'We add production AI capability to existing products and teams.',
    heroParagraphs: [
      'AI development at Metaborong is the work of adding production-grade language-model, retrieval, and agentic capability to products and teams that already exist. We do not run an ML research lab — we integrate, fine-tune, and harden off-the-shelf foundation models inside the stack you already ship. The pillar covers three engagement shapes: AI strategy and audits for teams asking where AI fits; AI product builds for copilots, conversational agents, and AI-augmented customer journeys; and AI engineering for agentic systems, RAG pipelines, and LLM integration.',
      'Every engagement is owned by senior engineers. The same people who write the production code are the people in the discovery call. We ship behind evaluations, not vibes — production evals, drift monitoring, and cost controls are scoped from day one. Where a buyer arrives with a vague mandate, we open with an audit; where the brief is already concrete, we move straight to architecture and build. India + global delivery, with security and observability defaults already in the boilerplate.',
    ],
    subGroups: [
      {
        id: 'strategy',
        description:
          'Audit, roadmap, and enablement work for teams sequencing AI adoption. The output is a defensible plan — not a slide deck — anchored in feasibility and operating cost, not hype.',
        caseStudy: {
          descriptor: 'Mid-market SaaS — AI opportunity audit',
          outcome:
            'Inventoried 42 candidate workflows, scored against impact and feasibility, and shipped a 90-day adoption plan with team enablement built in.',
          href: '/work',
        },
      },
      {
        id: 'product',
        description:
          'Copilots, conversational agents, and customer-journey AI engineered into products that already have users. The job is to integrate AI without breaking what already works.',
        caseStudy: {
          descriptor: 'Series-A support platform — RAG copilot',
          outcome:
            'Grounded copilot over 2.4M support tickets with retrieval, reranking, and citation. Eval harness and cost controls live in production from week one.',
          href: '/work',
        },
      },
      {
        id: 'engineering',
        description:
          'Agentic systems, retrieval pipelines, and LLM integration engineered to production standards. Evals, guardrails, observability, and cost controls scoped at the architecture stage.',
        caseStudy: {
          descriptor: 'Enterprise ops team — agentic workflow system',
          outcome:
            'Multi-step agent with tool use and human-in-the-loop checkpoints, deployed behind a production eval harness and per-tenant rate limits.',
          href: '/work',
        },
      },
    ],
    engagement: [
      { label: 'Audit', duration: '1–2 wks', body: 'Opportunity mapping, feasibility, and a sequenced roadmap before anyone writes code.' },
      { label: 'Build', duration: '4–16 wks', body: 'Architecture, integration, evaluations, and a hardened path to production deployment.' },
      { label: 'Operate & Govern', duration: 'ongoing', body: 'Drift monitoring, eval regressions, cost controls, and per-tenant governance.' },
    ],
    faqs: [
      {
        q: 'Do you train custom AI models from scratch?',
        a: 'No. We integrate, fine-tune, and adapt off-the-shelf foundation models — OpenAI, Anthropic, open-weights through Hugging Face — inside your product. Custom pretraining is out of scope and rarely the right answer for the buyers we work with.',
      },
      {
        q: 'How do you handle evaluation and quality?',
        a: 'Every engagement scopes an evaluation harness at the architecture stage. We instrument retrieval quality, generation quality, and end-to-end task success, then wire those evals into CI so regressions are caught before they hit production.',
      },
      {
        q: 'What does an AI engagement typically cost?',
        a: 'AI audits land in the four-to-six week range. Copilot and RAG builds usually run eight to twelve weeks of senior engineering. Agentic systems and multi-tenant LLM platforms run longer. We scope fixed-bid or weekly capacity depending on which the buyer prefers.',
      },
      {
        q: 'Can you integrate AI into a product we already ship?',
        a: 'Yes. Most of our AI engineering work lands inside existing products — not greenfield. We harden auth, routing, fallback, cost controls, and observability around the LLM layer so the existing product keeps shipping while AI features layer in.',
      },
      {
        q: 'Which model providers do you work with?',
        a: 'OpenAI, Anthropic, Google, and open-weights via Hugging Face and self-hosted inference. We route per workload — different models for retrieval, generation, and agent planning — and engineer fallback paths between providers for resilience and cost.',
      },
      {
        q: 'Do you handle data security and compliance?',
        a: 'Yes. We engineer for the compliance posture your product already operates under — SOC 2, GDPR, India DPDP. PII handling, tenant isolation, audit logging, and data-residency choices are architecture decisions, not afterthoughts.',
      },
    ],
  },

  web3: {
    id: 'web3',
    positioning: 'We design and ship the protocols, wallets, and on-chain systems.',
    heroParagraphs: [
      'Web3 development at Metaborong is decentralised protocol engineering — smart contracts, DeFi systems, NFT infrastructure, tokenomics, and decentralised identity. The pillar is multichain by default across EVM, Solana, and Cosmos, with delivery shaped by what the protocol actually needs rather than what one chain happens to be loudest about that quarter. We cover three engagement shapes: protocol and tokenomics strategy before launch, product surfaces like marketplaces and wallets, and the core engineering of contracts, vaults, and identity systems audit-ready from day one.',
      'Every smart contract we ship is specced, tested, and instrumented for third-party audit before deployment. We do not treat security review as a step after launch — it is the architectural constraint that shapes the code. The decentralised-identity practice anchors our GovTech work: we have shipped Aadhaar-integrated DID stacks at production scale, and UIDAI-aware verifiable-credential systems sit alongside the broader Web3 portfolio. India + global delivery, with the senior engineers writing the code present in every scoping conversation.',
    ],
    subGroups: [
      {
        id: 'strategy',
        description:
          'Tokenomics, protocol architecture review, and on-chain product discovery. The output is a model stress-tested against on-chain behaviour, not a whitepaper drafted in isolation.',
        caseStudy: {
          descriptor: 'Layer-2 DeFi launch — tokenomics design',
          outcome:
            'Modelled supply, emissions, and treasury policy across launch and steady-state. Simulated against on-chain behaviour before token-generation event.',
          href: '/work',
        },
      },
      {
        id: 'product',
        description:
          'NFT marketplaces, wallets, and on-chain product surfaces. The work spans the storefront, settlement, and key-management UX that users actually interact with.',
        caseStudy: {
          descriptor: 'Multichain NFT platform — marketplace + curation',
          outcome:
            'Royalty enforcement, lazy-mint, curated drops, and cross-chain settlement across EVM and Solana. Shipped in six weeks from spec to mainnet.',
          href: '/work',
        },
      },
      {
        id: 'engineering',
        description:
          'Smart contracts, DeFi protocols, liquid-staking vaults, and decentralised identity systems. Every contract is engineered for third-party audit and instrumented for post-deploy monitoring.',
        caseStudy: {
          descriptor: 'Aadhaar-integrated DID rollout',
          outcome:
            'Verified-identity layer at production scale, UIDAI-aware credential issuance, and on-chain anchoring. Shipped for a GovTech-adjacent deployment.',
          href: '/work',
        },
      },
    ],
    engagement: [
      { label: 'Design', duration: '1–3 wks', body: 'Protocol architecture, tokenomics modelling, and pre-launch risk review before any code is written.' },
      { label: 'Engineer', duration: '6–16 wks', body: 'Contracts and protocol systems engineered for audit, with tests, deployment, and post-deploy monitoring.' },
      { label: 'Audit & Operate', duration: 'ongoing', body: 'Audit support, post-deploy monitoring, governance tooling, and incident response.' },
    ],
    faqs: [
      {
        q: 'Which blockchain ecosystems do you support?',
        a: 'EVM chains including Ethereum and Layer-2 rollups, Solana with SPL tokens and Anchor programs, and Cosmos with CosmWasm modules. We pick the chain that fits the protocol, not the chain that fits the conference circuit.',
      },
      {
        q: 'Are contracts ready for third-party audit?',
        a: 'Every smart contract we ship is engineered for audit. Specs, invariants, tests, fuzzing, and static-analysis output are all delivered alongside the code. We coordinate with audit firms directly and remediate findings in-band.',
      },
      {
        q: 'Do you handle tokenomics design as well as engineering?',
        a: 'Yes. The Strategy sub-group covers token supply, emissions, vesting, governance modelling, and stress-tests against on-chain behaviour before launch. Tokenomics and engineering ship through one accountable team rather than two.',
      },
      {
        q: 'What is the DID and Aadhaar work you reference?',
        a: 'We engineer decentralised-identity stacks including UIDAI-aware verifiable-credential systems and Aadhaar-integrated DID issuance at production scale. The Decentralized Identity & DID Integration leaf has the full breakdown.',
      },
      {
        q: 'Do you provide ongoing protocol operations after launch?',
        a: 'Yes. Post-deploy monitoring, governance tooling, treasury integrations, and incident response are scoped as part of the Operate phase. Many protocols stay engaged on retainer for ongoing engineering.',
      },
      {
        q: 'Can you take a project from idea to mainnet?',
        a: 'Yes. Tokenomics and protocol design through engineering, audit support, deployment, and post-launch operations are all in scope. Typical end-to-end engagements run twelve to twenty weeks depending on protocol complexity.',
      },
    ],
  },

  'product-studio': {
    id: 'product-studio',
    positioning: 'We build the first version of your product, end-to-end.',
    heroParagraphs: [
      'Product Studio at Metaborong is greenfield product engineering for founders building from zero. The pillar exists for teams without an in-house CTO who need one senior engineering group to own the work from architecture through deployment — not a fragmented chain of specialists each handing off the last piece. We cover three engagement shapes: product strategy and discovery for pre-build founders, product engineering for MVP, SaaS, and B2B multi-tenant platforms, and underlying disciplines like frontend, backend, and design-systems engineering that hold the product together.',
      'Every build is shaped to ship to production, not to demo in a stand-up. Multi-tenancy, billing, observability, authentication, audit logging, and the operational defaults that enterprise procurement asks about are baked in from week one. Founders communicate directly with the engineers writing the code, and architecture decisions happen out in the open. We do not market modernisation, managed services, or v2/v3 retainers — Product Studio is intentionally a greenfield practice. Teams who already have a product can still reach us; we handle that conversation directly.',
    ],
    subGroups: [
      {
        id: 'strategy',
        description:
          'Discovery sprints, architecture planning, and MVP scoping for founders before a single line of production code is written. The output is a shipping plan, not a strategy deck.',
        caseStudy: {
          descriptor: 'Pre-seed founder — product discovery sprint',
          outcome:
            'Two-week discovery: problem framing, hypothesis tests, technical feasibility, and a clickable prototype the founder used to close the seed round.',
          href: '/work',
        },
      },
      {
        id: 'product',
        description:
          'MVP, SaaS, and B2B multi-tenant platforms shipped end-to-end by one senior team. Architecture, engineering, design, and deployment are owned in-house — not subcontracted.',
        caseStudy: {
          descriptor: 'B2B vertical SaaS — multi-tenant platform',
          outcome:
            'Multi-tenant platform with SSO, role-based access, audit trails, and admin tooling shipped to enterprise procurement readiness in fourteen weeks.',
          href: '/work',
        },
      },
      {
        id: 'engineering',
        description:
          'Frontend, backend, and design-systems engineering — the underlying disciplines that hold a product together. Used as standalone capacity or as part of a full product build.',
        caseStudy: {
          descriptor: 'Founding-team React stack — design system rebuild',
          outcome:
            'Token-driven design system and component library rebuilt from a Figma reference set. Owned by the in-house team within six weeks of handoff.',
          href: '/work',
        },
      },
    ],
    engagement: [
      { label: 'Discover', duration: '1–2 wks', body: 'Problem framing, hypothesis tests, technical feasibility, and a clickable prototype before the build starts.' },
      { label: 'Build', duration: '6–16 wks', body: 'Architecture, engineering, design, and deployment from one senior team — through to first paying users.' },
      { label: 'Ship & Iterate', duration: 'ongoing', body: 'Production support, feature roadmap, and the iteration loop teams need post-launch.' },
    ],
    faqs: [
      {
        q: 'Do you work with non-technical founders?',
        a: 'Yes — that is the core buyer for the pillar. We translate founder intent into architecture, scope, and milestones, and we communicate trade-offs in plain language. Founders are in the room for every architecture call.',
      },
      {
        q: 'Who owns the IP and the codebase?',
        a: 'You do. Every engagement transfers full IP ownership of the code, design, and infrastructure to the engaging team. Source is in your repository, in your cloud account, under your team\'s control from day one.',
      },
      {
        q: 'How long does an MVP typically take?',
        a: 'Discovery is one to two weeks. A focused MVP build runs six to twelve weeks depending on scope. SaaS and B2B multi-tenant platforms run longer — fourteen to twenty weeks is the typical band when the scope includes enterprise-readiness defaults.',
      },
      {
        q: 'What is in scope for a build?',
        a: 'Architecture, engineering, design, deployment, observability, billing where the product needs it, and the operational defaults enterprise procurement asks about. One senior team owns all of it — no subcontracting across disciplines.',
      },
      {
        q: 'Do you help with the next phase after the MVP?',
        a: 'Yes — many teams retain us through v1, v2, and beyond. Product Studio is intentionally marketed as greenfield, but ongoing engineering for existing products is handled through direct conversation. Reach us through the contact form.',
      },
      {
        q: 'What stack do you build on?',
        a: 'Next.js, TypeScript, React, and Postgres or MongoDB depending on the data model. Hosted on Vercel, AWS, or whichever cloud the buyer already runs. We do not change stack on every project, which is how we deliver fast.',
      },
    ],
  },
}
