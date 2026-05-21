import type { LeafContent } from '@/lib/services/leaf-content'

const content: LeafContent = {
  pillar: 'product-studio',
  slug: 'b2b-multi-tenant-platforms',

  heroLede:
    'B2B Multi-Tenant Platforms is an end-to-end engagement for teams shipping software that enterprise buyers procure and operate. We build the platform with workspace-scoped tenancy, SSO, audit logs, and role-based access wired in from day one — the controls procurement teams ask about before they sign. The engagement covers architecture, data model, frontend, backend, admin tooling, and the runbooks your support team will work from. Engagements run sixteen to twenty-four weeks, ship to your cloud account, and end with a deployable v1 that survives an enterprise security review. We pair a senior architect with a small engineering team and a designer, owned end-to-end from one shop. Founders building for mid-market or enterprise buyers, and SaaS teams whose first enterprise deal is forcing the rebuild, both fit here. The output is a platform, a runbook, and a handoff document.',

  deliverables: [
    {
      label: 'Multi-tenant platform with workspace isolation, scoped data, and per-tenant configuration.',
    },
    {
      label: 'SSO via SAML and OIDC plus SCIM provisioning for enterprise identity providers.',
    },
    {
      label: 'Role-based access with custom roles, scoped permissions, and audit trail.',
    },
    {
      label: 'Admin and support tooling: impersonation, account recovery, billing override.',
    },
    {
      label: 'Audit-log surface: tamper-evident, exportable, queryable by tenant administrators.',
    },
    {
      label: 'Deployment runbook covering on-call, rollback, secret rotation, and SLA breach.',
    },
  ],

  phases: [
    {
      title: 'Tenancy decisions',
      body: 'The first week is decisions, not code. We work through tenancy model, identity model, isolation guarantees, audit requirements, and the procurement checklist your first enterprise buyer will send. Each decision is written down with the trade-off, the cost of changing it later, and the customer requirement that drove it. You sign off before sprint one.',
    },
    {
      title: 'Vertical slices',
      body: 'Two-week sprints shipping vertical slices through the platform — auth and SSO, workspace creation, the primary workflow, admin tooling, audit logs. Each slice is testable on staging by the end of its sprint. We invite your earliest enterprise prospect to test on staging from sprint four so the product reflects real procurement pressure.',
    },
    {
      title: 'Enterprise controls',
      body: 'Two sprints are reserved for the controls enterprise security reviews ask about — SCIM provisioning, IP allow-lists, audit-log export, data residency, custom retention, soft-delete and undelete. These are the items that turn a six-month sales cycle into a two-week one when the procurement team can tick them off in their template.',
    },
    {
      title: 'Hardening and handoff',
      body: 'The final sprints harden the platform for production load and an enterprise security review — pen test, dependency audit, on-call runbook, SLA monitoring, secret rotation. We rehearse a tenant onboarding end-to-end. At handoff you get the repo, the cloud account, the runbook, and a written list of the next ten items to ship after first contract.',
    },
  ],

  techStack: [
    { name: 'Next.js', category: 'App Framework' },
    { name: 'TypeScript', category: 'Language' },
    { name: 'PostgreSQL', category: 'Database' },
    { name: 'Prisma', category: 'ORM' },
    { name: 'WorkOS', category: 'SSO and SCIM' },
    { name: 'AWS', category: 'Hosting' },
    { name: 'Datadog', category: 'Observability' },
    { name: 'GitHub Actions', category: 'CI/CD' },
    { name: 'Terraform', category: 'Infrastructure' },
  ],

  fit: {
    fits: [
      'You are building for mid-market or enterprise buyers who run procurement and security reviews.',
      'You need SSO, audit logs, and per-tenant configuration from day one — not bolted on later.',
      'You want one senior team owning architecture through enterprise readiness, not a chain of vendors.',
    ],
    doesNotFit: [
      'You are pre-validation or pre-design — start with discovery, then return when the shape is clear.',
      'You want a single-tenant install — that is a custom build, not a multi-tenant platform engagement.',
      'You need a finished SOC 2 audit by launch — scope a separate compliance program in parallel.',
    ],
  },

  aeoAnswer:
    'B2B Multi-Tenant Platforms is an end-to-end product engagement that exits with a workspace-scoped platform ready for an enterprise security review. Metaborong has shipped CropXcel, a permissioned-blockchain agri-fintech platform, on a Hyperledger Fabric stack as a reference for the multi-tenant patterns we deploy. The studio is based in India with delivery across North America, Europe, and APAC.',

  relatedWork: [
    {
      descriptor: 'Internal — CropXcel agri-fintech platform',
      summary:
        'We built CropXcel, an agri-fintech platform, on a permissioned Hyperledger Fabric stack with tenant-scoped data isolation across producers, lenders, and buyers — our own build.',
      href: '/work/',
    },
    {
      descriptor: 'Chillies Enterprises — ERP-integrated AI engagement',
      summary:
        'We delivered an AI capability over an existing ERP, with workspace controls, role-based access, and audit trails — the multi-account discipline a B2B platform needs.',
      href: '/work/',
    },
  ],

  relatedServices: [
    { pillar: 'product-studio', slug: 'saas-product-development' },
    { pillar: 'product-studio', slug: 'mvp-development' },
    { pillar: 'web3', slug: 'decentralized-identity-did-integration' },
  ],

  faqs: [
    {
      question: 'How is this different from SaaS Product Development?',
      answer:
        'Both ship multi-tenant SaaS. The B2B Multi-Tenant Platforms engagement adds the enterprise-procurement layer — SSO and SCIM, audit-log export, data residency, contract-driven roles — and budgets a longer hardening phase for security review. If your buyer is mid-market or enterprise, pick this engagement. If your buyer is a single user or a small team, SaaS Product Development is the right one.',
    },
    {
      question: 'Do you implement SSO yourselves or use a provider?',
      answer:
        'We default to WorkOS for SSO and SCIM because the long tail of enterprise identity providers is a full-time integration problem. For teams with cost or vendor constraints, we have also implemented SSO directly against Okta, Azure AD, and OneLogin. The choice happens in the architecture week, with the trade-offs written down.',
    },
    {
      question: 'Can you handle on-call after launch?',
      answer:
        'We can scope a post-launch retainer covering on-call, incident response, and the first quarter of platform-level changes. We treat that as a separate engagement, not a default rollover from the build. Many clients move on-call to an in-house hire within ninety days and use us only for architecture-level work — both arrangements work fine.',
    },
    {
      question: 'Have you actually shipped a multi-tenant platform end-to-end?',
      answer:
        'Yes. CropXcel, our own build, runs on a permissioned Hyperledger Fabric stack with tenant-scoped data isolation across producers, lenders, and buyers. We use the patterns we proved there on client engagements. Several client platforms remain unnamed at the client request; eight engagements are publicly verified on Clutch with a 4.9 rating.',
    },
  ],
}

export default content
