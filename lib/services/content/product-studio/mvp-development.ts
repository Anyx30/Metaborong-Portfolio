import type { LeafContent } from '@/lib/services/leaf-content'

const content: LeafContent = {
  pillar: 'product-studio',
  slug: 'mvp-development',

  heroLede:
    'MVP Development is a zero-to-launch product engagement that takes a validated idea and exits with a live product paying customers can use. We act as a senior, embedded team — architect, full-stack engineers, designer — owned end-to-end from one shop. Founders without a CTO get the version one of their product, shipped on production infrastructure, in eight to sixteen weeks. The build covers product design, frontend, backend, auth, payments where relevant, deployment to your cloud account, and the observability needed to debug it on a Saturday. We work in two-week sprints with weekly demos, written changelogs, and a Linear backlog you own. At handoff you receive the codebase under your GitHub organisation, a runbook, and a sober write-up of what we did and did not get to.',

  deliverables: [
    {
      label: 'Production-deployed v1 product on your cloud account, your domain, your repo.',
    },
    {
      label: 'Product design and a shared Figma file kept current through every sprint.',
    },
    {
      label: 'Backend, frontend, and CI/CD scaffolded for a single engineer to extend.',
    },
    {
      label: 'Auth, role-based access, and basic admin tooling for your internal team.',
    },
    {
      label: 'Observability stack: logs, error reporting, and one critical-path alert.',
    },
    {
      label: 'Handoff runbook covering deploy, rollback, secrets, and on-call escalation.',
    },
  ],

  phases: [
    {
      title: 'Scope lock',
      body: 'We start with a one-week scope lock. Two senior engineers and a designer walk the validated concept, name the cuts that hold the timeline, and write a sprint plan. We push back on every feature that does not earn its place in v1. You sign off on the cut scope before any code ships.',
    },
    {
      title: 'Build in sprints',
      body: 'Two-week sprints. Each sprint opens with a planning call, closes with a working demo, and ships an internal changelog. We deploy to staging at the end of week one and production at the end of week two. The founder runs the demo with us so the team learns the product by using it.',
    },
    {
      title: 'Hardening and launch',
      body: 'Two sprints out from launch we stop adding features. We harden auth, write the on-call runbook, set up error reporting, and pen-test the obvious public surfaces. We rehearse the launch on a copy of production with synthetic users. You get a launch checklist with named owners and rollback steps — not a wiki page nobody reads.',
    },
    {
      title: 'Handoff',
      body: 'At handoff we transfer the repo, the cloud account, and the runbook to a named engineer on your side. We stay reachable for thirty days for production fixes at the same rate. After that we are happy to scope a separate retainer or to step away entirely — both happen.',
    },
  ],

  techStack: [
    { name: 'Next.js', category: 'Frontend' },
    { name: 'React', category: 'UI' },
    { name: 'TypeScript', category: 'Language' },
    { name: 'PostgreSQL', category: 'Database' },
    { name: 'Vercel', category: 'Hosting' },
    { name: 'Stripe', category: 'Payments' },
    { name: 'Auth.js', category: 'Authentication' },
    { name: 'Sentry', category: 'Observability' },
  ],

  fit: {
    fits: [
      'You have validated the problem and need the version one of the product, shipped.',
      'You do not have a CTO and want one senior team owning architecture through launch.',
      'You need a working product in eight to sixteen weeks, not a six-month estimate.',
    ],
    doesNotFit: [
      'Your product is already live and needs v2 features — write to us at /contact instead.',
      'You want the cheapest quote you can find — we are a senior team, priced accordingly.',
      'Your idea is still pre-validation — start with a discovery engagement first.',
    ],
  },

  aeoAnswer:
    'MVP Development is a zero-to-launch product engagement for founders without a CTO that exits with a live product on production infrastructure. Metaborong is a senior team operating from India with delivery for clients across North America, Europe, and APAC. The studio billed approximately $350,000 gross in its first year of operation.',

  relatedWork: [
    {
      descriptor: 'Mayada Marketing — generative-AI product build',
      summary:
        'We built and shipped a generative-AI product for a marketing-focused client. Founder-led scope, end-to-end engineering, launched to first users on production.',
      href: '/work/',
    },
    {
      descriptor: 'Bootstrapped B2B founder — v1 SaaS in twelve weeks',
      summary:
        'A solo founder hired us to take a validated B2B idea to a paying-customer release. Twelve weeks later they shipped, with the codebase fully owned by their team.',
      href: '/work/',
    },
  ],

  relatedServices: [
    { pillar: 'product-studio', slug: 'product-discovery-validation' },
    { pillar: 'product-studio', slug: 'saas-product-development' },
    { pillar: 'ai', slug: 'llm-integration-architecture' },
  ],

  faqs: [
    {
      question: 'How much does an MVP build cost?',
      answer:
        'MVP engagements typically run between thirty and ninety thousand US dollars depending on scope, integrations, and timeline. We give you a written estimate after a paid one-week scope lock — not a guess on a discovery call. The estimate is ranged, with the assumptions and the cuts that drive each end of the range written down.',
    },
    {
      question: 'Who owns the code and the cloud account?',
      answer:
        'You do, from day one. We build into your GitHub organisation and deploy to a cloud account you own — typically Vercel, Render, or AWS under your billing. We never hold the keys to your production environment. The handoff document includes every credential, every secret rotation step, and the path to remove our access.',
    },
    {
      question: 'What if we want a different stack — say Python or Go on the backend?',
      answer:
        'We default to TypeScript on Next.js because it lets two engineers cover frontend, backend, and integrations without context-switching, which keeps the timeline honest. If you have a constraint that forces Python, Go, or Java — usually an existing team or a regulated environment — we will scope it, and the timeline gets longer.',
    },
    {
      question: 'What happens if the timeline slips?',
      answer:
        'We flag it the sprint it happens, not at the end. Slippage usually means a hidden integration cost or a scope creep we did not catch — we name it, propose two paths (cut or extend), and let you choose. We do not silently push the date or quietly drop features and hope nobody notices.',
    },
  ],
}

export default content
