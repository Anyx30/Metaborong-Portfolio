# Metaborong Website Revamp — Design Spec

## Context

Metaborong (metaborong.com) is a full-stack Web3 development, AI agent development, and product studio. Current site scores D on SEO (On-Page: D, GEO: F, Usability: A, Performance: D) with zero organic traffic. Competitors SoluLab (DA 34, 3.3k/mo) and Antier (DA 35, 7.9k/mo) are both declining. This is a full content + design rebuild — not a patch.

---

## Company Profile

- **Identity:** Full-stack Web3 development + AI agent development + Product Studio
- **Founders:** Arnab Ray (CEO), Anik Ghosh (COO), Soumojit Ash (CTO) — LinkedIn profiles available
- **Target clients:** Startups & founders (primary), crypto-native projects, enterprises
- **Differentiators:** Speed, product thinking, niche depth
- **Markets:** US & Europe
- **Stack:** Currently on Vercel. Rebuild in Next.js 15 (App Router)

---

## Services (14 total across 3 pillars)

### Web3 / Blockchain (7 services)
| Service Name | Subtitle |
|---|---|
| DeFi Protocol Development | Uniswap-style DEX, lending, yield |
| Smart Contract Security | Audit, review & formal verification |
| NFT Marketplace Development | Custom marketplace & minting |
| Crypto Wallet Development | Custodial & non-custodial |
| Token Launchpad | IDO, ICO & fair launch infrastructure |
| Liquid Staking Vaults | LST protocol & vault architecture |
| DAO & Governance Systems | On-chain voting, treasury, multisig |

### AI Agents (6 services)
| Service Name | Subtitle |
|---|---|
| Agentic AI Systems | Multi-agent orchestration & pipelines |
| Generative AI Development | LLM-powered apps & fine-tuning |
| AI Workflow Automation | Replace repetitive ops with AI |
| Voice Agent Integration | Conversational AI for voice channels |
| RAG & Knowledge Systems | Document intelligence & retrieval |
| AI Systems Integration | Embed AI into your existing stack |

### Product Studio (1 service)
| Service Name | Subtitle |
|---|---|
| SaaS Product Development | End-to-end Web2 product builds |

---

## Site Architecture

### Structure: Category Hub + Individual Pages
Every service gets its own URL. Three hub pages own category-level keywords.

```
/ — Homepage
/services/web3/                          ← hub, targets "web3 development company"
/services/web3/defi-protocol/
/services/web3/smart-contract-security/
/services/web3/nft-marketplace/
/services/web3/crypto-wallet/
/services/web3/token-launchpad/
/services/web3/liquid-staking-vaults/
/services/web3/dao-governance/
/services/ai-agents/                     ← hub, targets "ai agent development"
/services/ai-agents/agentic-ai-systems/
/services/ai-agents/generative-ai/
/services/ai-agents/ai-workflow-automation/
/services/ai-agents/voice-agent-integration/
/services/ai-agents/rag-knowledge-systems/
/services/ai-agents/ai-systems-integration/
/services/product-studio/                ← hub
/services/product-studio/saas-development/
/work/                                   ← portfolio / case studies hub
/work/[slug]/                            ← individual case studies (TBD)
/about/
/blog/
/blog/[slug]/
/contact/
```

### Navbar
Simple dropdown — 5 top-level items:
`Logo | Services ▾ | Work | About | Blog | Let's Talk`

Services dropdown shows 3 pillar categories → each links to hub page.

---

## Design System (from Claude Design export)

- **Font:** Satoshi (Fontshare CDN) — weights 300/400/500/700/900. Fallback: Space Grotesk
- **Primary:** `#204AF8` (Blue) — CTAs, logo bg, links, accents
- **Accent:** `#F6851B` (UT Orange) — highlights, secondary actions
- **Dark:** `#0a0a0a` / `#303030` — dark sections, text on light
- **Neutrals:** `#676767` (mid), `#999999` (light), `#D9D9D9` (subtle), `#FEFEFE` (off-white)
- **Page bg:** `#f5f7ff` (subtle blue tint for hero), `#ffffff` (content sections)
- **Dark sections:** `#0a0a0a` (contact CTA, footer)
- **Letter spacing:** `-0.01em` body, `-0.03em` to `-0.04em` display
- **Logo:** M-mark SVG (white) in `#204AF8` rounded rectangle + "metaborong" wordmark
- **Icons:** Lucide Icons (2px stroke, geometric)
- **Spacing scale:** 4/8/12/16/24/32/48/64/96/128px
- **Border radius:** 4/8/12/20px

---

## Hero Direction

**B — Light / Tinted**
- Background: `#f5f7ff` subtle blue tint
- Two-column layout: copy left, visual right
- Dark text on light
- Right panel visual: TBD (video loop / ASCII art / isometric — decided at visual design stage)
- Nav: white frosted glass, sticky

---

## Homepage Content Structure

### SEO Tags
- **Title:** `Web3 & AI Development Studio | Metaborong` (43 chars)
- **Meta description:** `Metaborong builds DeFi protocols, AI agent systems, and custom SaaS products for founders and crypto-native teams. Fast delivery, product-first thinking.` (157 chars)
- **H1 (single):** `The Web3 & AI Development Studio for Founders`

### Sections (in order)
1. **Nav** — sticky frosted glass
2. **Hero** — H1 + subheading + dual CTA + right visual panel
3. **Trust bar** — scrolling strip: KGeN · Bionic · DATA3 AI · Defiverse · GET Smart · SEDAX · Bayan · Memestakes Vault
4. **Services** — H2: "Three pillars. One studio." — 3 pillar cards → hub pages
5. **Why Metaborong** — H2: "Why founders choose us" — Speed, Product Thinking, Niche Depth
6. **Work Preview** — H2: "What we've built" — 3-4 project cards (case study details TBD)
7. **Testimonials** — H2: "Voices of trust" — 4 existing quotes
8. **Founders** — H2: "The team behind the work" — 3 founder cards with LinkedIn
9. **Contact CTA** — dark section, H2: "Got a project in mind?"
10. **Footer** — logo, nav, social, copyright

---

## Content Plan

### Approach
- SEO/AEO-optimized content written using `/seo-aeo-landing-page-writer`, `/seo-content`, `/seo-fundamentals`, `/seo-geo` skills
- Each page's content stored as a separate markdown file in `docs/content/`
- Content covers: homepage + 3 hub pages + 14 service pages (Phase 1)
- Blog posts follow the strategy doc calendar (Phase 2)

### Content file structure
```
docs/content/
  homepage.md
  services-web3-hub.md
  services-ai-agents-hub.md
  services-product-studio-hub.md
  services/web3/
    defi-protocol.md
    smart-contract-security.md
    nft-marketplace.md
    crypto-wallet.md
    token-launchpad.md
    liquid-staking-vaults.md
    dao-governance.md
  services/ai-agents/
    agentic-ai-systems.md
    generative-ai.md
    ai-workflow-automation.md
    voice-agent-integration.md
    rag-knowledge-systems.md
    ai-systems-integration.md
  services/product-studio/
    saas-development.md
  about.md
  contact.md
```

---

## SEO/GEO Implementation Plan (from audit + strategy docs)

### Technical (fix immediately)
- Single H1 per page with primary keyword
- Title tags: 50-60 chars, keyword-first
- Meta descriptions: 120-160 chars with CTA
- XML sitemap at `/sitemap.xml`
- `robots.txt` — allow all content, block `/api/`
- Canonical tags on every page
- `hreflang` for US/EU if separate content
- Remove all inline styles — move to CSS/Tailwind
- WebP images, lazy loading, explicit width/height (fixes CLS)
- SPF record (email deliverability)

### Schema (JSON-LD on every relevant page)
- `Organization` — homepage + about
- `WebSite` + `SearchAction` — homepage
- `Service` — each service page
- `FAQPage` — service pages + blog posts
- `Article` / `BlogPosting` — every blog post
- `BreadcrumbList` — all pages
- `Person` — each founder (About page)

### GEO / AEO (fixes the F grade)
- Structured answers in first 150 words of every service page (AI citation readiness)
- FAQ sections on every page (6-10 Q&As)
- Data tables where relevant (competitor comparisons, feature lists)
- `llms.txt` file at site root
- Clear entity definitions (what is Metaborong, what does it do)
- Organization schema with `sameAs` links to all social profiles

### Core Web Vitals targets
- LCP < 2.5s — preload hero assets, WebP, CDN
- INP < 200ms — minimize JS bundles, defer non-critical
- CLS < 0.1 — explicit image dimensions, no dynamic content injection above fold

---

## Phase 1 Scope (this session)

1. Write SEO/AEO content for all pages → `docs/content/`
2. Build homepage (visual design after content is approved)
3. Build service hub pages (3)
4. Build individual service pages (14)
5. Build About + Contact pages
6. Technical SEO foundation (schema, sitemap, robots, canonical, meta)

## Phase 2 (later)
- Case studies (user to provide details)
- Blog infrastructure + first 16 posts
- Link building campaign
- Analytics + rank tracking setup
