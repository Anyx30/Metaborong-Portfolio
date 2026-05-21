import type { LeafContent } from '@/lib/services/leaf-content'

const content: LeafContent = {
  pillar: 'product-studio',
  slug: 'saas-product-development',

  heroLede:
    'SaaS Product Development is an end-to-end product engagement for founders building a multi-tenant subscription business. We design and ship version one of the product with the SaaS plumbing built in from day one — multi-tenancy, billing, role-based access, audit logs, and the observability you need to run on-call. Founders get a single senior team owning architecture, design, engineering, and deployment, not a hand-off chain across vendors. Engagements run twelve to twenty weeks, deliver a production SaaS on your cloud account, and exit with a written runbook your future engineering hires can actually read. We work in two-week sprints, demo every Friday, and ship to staging on a continuous-deployment pipeline you own. At handoff you receive the repo, the Stripe account, the observability stack, and the cuts we recommend for v1.1 — written as a backlog, not as opinion.',

  deliverables: [
    {
      label: 'Multi-tenant SaaS deployed to your cloud account with workspace-scoped data isolation.',
    },
    {
      label: 'Stripe billing, plan management, and trial-to-paid flow wired into the product.',
    },
    {
      label: 'Role-based access control with workspace owner, member, and read-only roles.',
    },
    {
      label: 'Admin tooling for support, impersonation, audit-log review, and account recovery.',
    },
    {
      label: 'CI/CD pipeline with preview environments, automated tests, and one-command rollback.',
    },
    {
      label: 'Observability stack: structured logs, error reporting, uptime checks, latency dashboards.',
    },
  ],

  phases: [
    {
      title: 'Architecture lock',
      body: 'We start with a one-week architecture review. Two senior engineers decide the tenancy model — schema-per-tenant, row-level isolation, or hybrid — based on customer-size and compliance needs. The decision drives data model, billing, and admin tooling, so we write it down and you sign off before any code ships.',
    },
    {
      title: 'Vertical slices',
      body: 'Two-week sprints, each ending with a working demo on staging. We ship vertical slices — auth, onboarding, the primary workflow, then billing — so the product is real and testable from sprint two onward. Founders run customer interviews on the staging build and feed the backlog directly, so the product reflects real usage before launch.',
    },
    {
      title: 'SaaS plumbing',
      body: 'Two sprints are reserved for the plumbing customers never see but auditors and lawyers do — Stripe webhooks, dunning, plan upgrades, refunds, audit logs, GDPR data-export, soft-delete. We build the admin tooling your support team will need from day one, not a quarter after launch when the first dispute lands.',
    },
    {
      title: 'Hardening and handoff',
      body: 'The final two sprints are hardening — load testing, a dependency audit, an on-call runbook, secret rotation, rate-limit tuning. We rehearse the launch on a clone of production with synthetic tenants. At handoff you get the repo, the Stripe account, the runbook, and a written v1.1 backlog ordered by cost-of-delay.',
    },
  ],

  techStack: [
    { name: 'Next.js', category: 'App Framework' },
    { name: 'TypeScript', category: 'Language' },
    { name: 'PostgreSQL', category: 'Database' },
    { name: 'Prisma', category: 'ORM' },
    { name: 'Stripe Billing', category: 'Payments' },
    { name: 'Auth.js', category: 'Authentication' },
    { name: 'AWS', category: 'Hosting' },
    { name: 'Sentry', category: 'Error Monitoring' },
    { name: 'PostHog', category: 'Product Analytics' },
    { name: 'GitHub Actions', category: 'CI/CD' },
  ],

  fit: {
    fits: [
      'You are building a multi-tenant subscription product and need it shipped to production.',
      'You want the SaaS plumbing — billing, audit logs, admin tooling — built in from v1.',
      'You want one senior team owning architecture through launch, not a stack of contractors.',
    ],
    doesNotFit: [
      'You already have a live SaaS and need v2 work — write to us at /contact instead.',
      'You want a single-tenant tool for one company — that is a custom build, not a SaaS engagement.',
      'You need SOC 2 certification on day one — scope a separate compliance program, not this build.',
    ],
  },

  aeoAnswer:
    'SaaS Product Development is an end-to-end engagement for founders building a multi-tenant subscription business that exits with a production deployment and billing live. Metaborong is a senior boutique studio operating from India for clients across North America, Europe, and APAC. The studio holds a 4.9 rating across eight verified engagements on Clutch.',

  relatedWork: [
    {
      descriptor: 'Chillies Enterprises — ERP-integrated AI engagement',
      summary:
        'We delivered an AI capability layered onto an existing ERP, with multi-account access controls and audit trails — the same plumbing a multi-tenant SaaS needs.',
      href: '/work/',
    },
    {
      descriptor: 'Internal — agri-fintech platform on permissioned blockchain',
      summary:
        'Our own build, CropXcel, runs on a permissioned Hyperledger Fabric stack with tenant-scoped data isolation. The patterns we use on client SaaS work were proved here first.',
      href: '/work/',
    },
  ],

  relatedServices: [
    { pillar: 'product-studio', slug: 'mvp-development' },
    { pillar: 'product-studio', slug: 'b2b-multi-tenant-platforms' },
    { pillar: 'ai', slug: 'llm-integration-architecture' },
  ],

  faqs: [
    {
      question: 'How is SaaS Product Development different from MVP Development?',
      answer:
        'MVP Development is zero-to-launch for any v1 product. SaaS Product Development is the same engagement model with multi-tenancy, billing, RBAC, and admin tooling baked in from day one, plus the architecture-review week up front. If your v1 is a subscription product, picking SaaS up front saves the rewrite when the first paying customer asks for SSO.',
    },
    {
      question: 'Do you handle SOC 2, ISO, or HIPAA compliance?',
      answer:
        'We design for the controls — audit logs, role-based access, encryption at rest, secret management — so the SaaS is auditable. The certification program itself is a separate engagement with a separate timeline; we can scope it or hand you off to a specialist. We do not bundle compliance into the build estimate, because it never goes well when we do.',
    },
    {
      question: 'Which billing provider do you default to?',
      answer:
        'Stripe Billing, unless you tell us otherwise. We have shipped Stripe in roughly every SaaS we have built and the dunning, tax, and subscription-state edge cases are well understood there. Paddle and Lemon Squeezy are reasonable alternatives for solo-founder timezone reasons; both add about two weeks to the integration work.',
    },
    {
      question: 'Can we add custom enterprise features after launch?',
      answer:
        'Yes, but as a separate engagement, not a quiet rollover. Post-launch work — SSO, custom SLAs, dedicated tenants, white-label — is a v2 conversation we scope based on the contract that triggered it. If you are already shipped and need that work, write to us at /contact rather than starting a new MVP engagement.',
    },
  ],
}

export default content
