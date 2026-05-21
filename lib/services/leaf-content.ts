// Content contract for a v1 leaf service page.
//
// The leaf-service template (`components/services/leaf-service.tsx`) is a
// presentation surface — it derives everything that can be derived from the
// taxonomy (pillar label, sub-group label, leaf name, breadcrumb trail,
// related-leaf filtering) and consumes the rest through this interface.
//
// Content streams author one `LeafContent` per v1 slug listed in
// `lib/services/seo-map.ts`. Authoring lives in `lib/services/content/`
// (per-slug files) and is wired into the template at render time. The
// template never reads MDX or markdown — every block is structured data.
//
// Word-budget targets (per SERVICES_PLAN.md § 6) sit in this file as comments
// next to each field so content authors don't need to bounce to the plan.

import type { PillarId } from '@/components/sections/services-data'

export type { PillarId }

/**
 * One concrete artefact the engagement produces — the "what you'll have
 * at the end" list. Renders as a compact card or bullet row.
 *
 * Hard limits per DESIGN.md § Writing Tone:
 *   - `label` ≤ 16 words (counted as a bullet)
 *   - `detail` is optional supporting line; if present, sentence target
 *     12–14 words.
 *
 * Budget: 4–6 deliverables × ~14-word average = 80–120 words total.
 */
export interface LeafDeliverable {
  label: string
  detail?: string
}

/**
 * One phase of the engagement — a chunk of authored copy named after the
 * actual work, not generic "discovery / build / ship".
 *
 * Hard limits:
 *   - `title` ≤ 4 words.
 *   - `body` 40–60 words. Authors should hit the upper end.
 *
 * Budget: 3–4 phases × ~55 words = 180–240 words total.
 */
export interface LeafPhase {
  title: string
  body: string
}

/**
 * One technology entry in the tech-stack strip. Restraint applies:
 * 6–10 items maximum across the whole page, no logos, JetBrains Mono.
 *
 *   - `name` is the verbatim label (e.g., "OpenAI", "LangGraph", "pgvector").
 *   - `category` is a short eyebrow word (e.g., "Models", "Orchestration",
 *     "Vector"). Used as a grouping label, not a sentence.
 */
export interface LeafTechItem {
  name: string
  category?: string
}

/**
 * One bullet in the When-this-fits / When-it-doesn't honest-scope block.
 * Three bullets per side (six total). Each ~18 words. Buyers self-disqualify
 * here, so the language must be specific, not aspirational.
 *
 * Budget: 3 bullets × 2 sides × ~18 words = 90–120 words total.
 */
export type LeafFitBullet = string

/**
 * Two-column block. Both arrays must contain exactly three bullets.
 */
export interface LeafFitBlock {
  fits: readonly [LeafFitBullet, LeafFitBullet, LeafFitBullet]
  doesNotFit: readonly [LeafFitBullet, LeafFitBullet, LeafFitBullet]
}

/**
 * Anonymized related-work card. No invented client names. No fabricated
 * metrics. Either reference a real Metaborong engagement by descriptor
 * (e.g., "Series-A DeFi protocol") or omit.
 *
 *   - `descriptor` 4–8 words (e.g., "Mid-market SaaS — RAG copilot").
 *   - `summary` ~25 words, one sentence preferred.
 *   - `href` typically points to `/work` or a `/blog/<slug>/` post.
 *
 * Budget: 1–2 cards × ~25 words = 25–60 words total.
 */
export interface LeafRelatedWork {
  descriptor: string
  summary: string
  href: string
}

/**
 * Pointer to a sibling/cousin v1 leaf. The template filters these against
 * `services-data.ts` and drops any that don't resolve as
 * `status === 'published'`, so authors can safely list 3–4 and let the
 * filter trim.
 *
 * Recommended: 2 from the same pillar + 1 cross-pillar (per
 * SERVICES_PLAN.md § 3 Template C).
 */
export interface LeafRelatedServiceRef {
  pillar: PillarId
  slug: string
}

/**
 * One FAQ entry for the leaf. Becomes both visible accordion content and
 * `FAQPage` schema.
 *
 * Hard limits:
 *   - `question` natural question, sentence-cased.
 *   - `answer` ~50–80 words. One short paragraph, no lists.
 *
 * Budget: 3–4 Q&As × ~70 words = 200–280 words total.
 */
export interface LeafFaq {
  question: string
  answer: string
}

/**
 * Top-level content contract for a single leaf service page.
 *
 * Identity (`pillar`, `slug`) is authored alongside the content so the
 * loader can sanity-check against `services-data.ts` and `seo-map.ts` at
 * build time — every `LeafContent` must resolve to a published leaf in
 * both registries, otherwise the build fails fast.
 *
 * Block-by-block word budgets sit on each field's typedef above. The
 * template renders these blocks in this order:
 *
 *   1. Breadcrumb         (derived from pillar + slug)
 *   2. Hero               (eyebrow + H1 derived; `heroLede` authored)
 *   3. What we deliver    (`deliverables`)
 *   4. How we work        (`phases`)
 *   5. Tech / stack       (`techStack`)
 *   6. When this fits     (`fit`)
 *   7. AEO answer block   (`aeoAnswer`)
 *   8. Related work       (`relatedWork`)
 *   9. Related services   (`relatedServices` — filtered to v1 by template)
 *  10. FAQ                (`faqs`)
 *  11. Contact CTA        (reuses `contact-cta.tsx`)
 *
 * Total target: 750–1060 words of authored content. Floor 600.
 *
 * For the DID leaf (`decentralized-identity-did-integration`), the
 * `aeoAnswer` paragraph must reference Aadhaar-scale deployment as one of
 * its two verifiable facts. See SERVICES_PLAN.md § 6.
 */
export interface LeafContent {
  pillar: PillarId
  slug: string

  /** 120–180 words. Entity-definition opener, 2–3 deliverables. AEO-eligible. */
  heroLede: string

  deliverables: readonly LeafDeliverable[]
  phases: readonly LeafPhase[]
  techStack: readonly LeafTechItem[]
  fit: LeafFitBlock

  /** 40–60 words. Pattern: `{Service} is a {category} for {audience} that {outcome}. {Fact 1}. {Fact 2}.` */
  aeoAnswer: string

  relatedWork: readonly LeafRelatedWork[]
  relatedServices: readonly LeafRelatedServiceRef[]
  faqs: readonly LeafFaq[]
}
