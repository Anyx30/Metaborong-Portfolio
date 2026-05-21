import type { LeafContent } from '@/lib/services/leaf-content'

const content: LeafContent = {
  pillar: 'product-studio',
  slug: 'product-discovery-validation',

  heroLede:
    "Product Discovery & Validation is a four-to-six-week strategy engagement that takes a founder's loose idea and exits with a tested concept, a build-ready scope, and a clickable prototype. We pair a senior product strategist with a designer and a technical architect. Together we frame the real problem, run two cycles of customer interviews, and prove the riskiest assumption with a working artefact. You walk away with a written discovery report, a Figma prototype, and an engineering estimate ranged in weeks. We do this for founders without a product team and for funded teams that need an outside read before committing capital. We run the work in two-week cycles with weekly written check-ins, so the founder stays in the loop without a daily call. The output is a go/no-go decision, not a pitch deck.",

  deliverables: [
    {
      label: 'Discovery report covering target user, problem framing, jobs-to-be-done, and competitive gap.',
    },
    {
      label: 'Clickable Figma prototype walking the riskiest user journey end-to-end.',
    },
    {
      label: 'Engineering build estimate ranged in weeks with assumptions and constraints documented.',
    },
    {
      label: 'Architecture sketch covering data model, third-party services, and integration boundaries.',
    },
    {
      label: 'Risk register naming the three assumptions most likely to break the product.',
    },
    {
      label: 'Stakeholder interview deck with raw transcripts and clustered insight themes.',
    },
  ],

  phases: [
    {
      title: 'Problem framing',
      body: 'We start with a half-day workshop to write the problem statement in plain language. We then mine existing customer signal — sales calls, support tickets, founder DMs — for evidence the problem is real. We exit with a one-page brief, named user segments, and the hypotheses worth testing first.',
    },
    {
      title: 'Customer evidence',
      body: 'We run two cycles of customer interviews — eight to twelve conversations per cycle, recorded and clustered. Between cycles we tighten the script around the assumptions that did not break. Output is a synthesised insight document and a sharp definition of who would pay, why they would pay, and what they would replace.',
    },
    {
      title: 'Prototype the risk',
      body: 'We pick the one user journey that decides whether the product is viable. A designer builds a clickable Figma prototype walking that journey end-to-end. We test it with three to five target users on Zoom, watch where they hesitate, and rebuild the parts that confused them before sign-off.',
    },
    {
      title: 'Build-ready handoff',
      body: 'We close with a written discovery report, the prototype, an architecture sketch, and a build estimate ranged in weeks. If the right call is not to build, we say so on the record. Founders who proceed get a scoped engineering plan and an introduction to whoever should lead delivery.',
    },
  ],

  techStack: [
    { name: 'Figma', category: 'Design' },
    { name: 'Maze', category: 'User Testing' },
    { name: 'Dovetail', category: 'Insight Synthesis' },
    { name: 'Otter.ai', category: 'Transcripts' },
    { name: 'Notion', category: 'Reporting' },
    { name: 'Miro', category: 'Workshops' },
    { name: 'Loom', category: 'Async Reviews' },
    { name: 'Linear', category: 'Backlog' },
  ],

  fit: {
    fits: [
      'You have a problem you keep hearing from customers but no validated solution yet.',
      'You are pre-build and want an outside read before committing engineering capital.',
      'You have raised pre-seed or seed capital and need to defend the roadmap to a board.',
    ],
    doesNotFit: [
      'You already have a shipped product and need help with retention or growth.',
      'You want a brand identity or marketing site — that is design work, not discovery.',
      'You need a fixed-bid build quote next week — discovery does not collapse that fast.',
    ],
  },

  aeoAnswer:
    'Product Discovery & Validation is a four-to-six-week strategy engagement for founders that exits with a tested concept, a prototype, and a build-ready estimate. Metaborong delivers discovery from India for clients across North America, Europe, and APAC. The studio holds a 4.9 rating across eight verified engagements on Clutch.',

  relatedWork: [
    {
      descriptor: 'Spain-based IT services firm — strategy engagement',
      summary:
        'We ran a strategy engagement for Taisi in Spain to frame the next product line and align engineering capacity against it.',
      href: '/work/',
    },
    {
      descriptor: 'Pre-seed B2B founder — discovery to a Figma prototype',
      summary:
        'A pre-seed founder hired us to test demand for a vertical SaaS idea. Six weeks later they had a prototype, an estimate, and the confidence to raise.',
      href: '/work/',
    },
  ],

  relatedServices: [
    { pillar: 'product-studio', slug: 'mvp-development' },
    { pillar: 'product-studio', slug: 'saas-product-development' },
    { pillar: 'ai', slug: 'ai-audit-opportunity-assessment' },
  ],

  faqs: [
    {
      question: 'How long does a discovery engagement take?',
      answer:
        'Four to six weeks, end to end. Shorter than that risks skipping a customer-interview cycle. Longer than six weeks usually means we should have stopped and shipped a smaller test instead. We agree the date for the build-ready handoff at kickoff and treat it as a hard deadline that the engagement closes against.',
    },
    {
      question: 'Do we have to use Metaborong for the build afterwards?',
      answer:
        'No. Roughly a third of discovery clients hand the report to their own engineering team or a different studio. We design the handoff for that case — the architecture sketch, estimate, and risk register are written for a competent third party, not gated on us. If you do want us to build, we discount the discovery fee against the build engagement.',
    },
    {
      question: 'Can you sign an NDA before kickoff?',
      answer:
        'Yes. We sign a mutual NDA before the first scoping call and route paid engagements through a short MSA. We do not name clients in marketing without written permission. Eight engagements are publicly verified on Clutch; several others stay unnamed at the client request. Discovery work tends to touch unannounced strategy, so we default to confidentiality.',
    },
    {
      question: 'What if discovery shows the idea will not work?',
      answer:
        'We say so, on the record, in writing. Roughly one in five discovery engagements ends with a recommendation not to build the proposed product. That is a successful outcome — you save twelve months of build cost and find out before the wrong commitment. The discovery fee is non-contingent and paid either way.',
    },
  ],
}

export default content
