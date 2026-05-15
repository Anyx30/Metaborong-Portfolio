// Seeds a fully-featured demo post into the configured Mongo cluster.
//
// Inserts ONE document into the `posts` collection with status='published'
// and slug='cms-feature-guide'. The post body walks through every block
// type, every semantic role, geo variants, anchor links, and the
// AI-readiness scoring flow — so an admin reading their own /blog/
// page can see what the editor produces and why each lever matters.
//
// Idempotent: if a post with the same slug already exists, the script
// reports and exits without writing.
//
// Usage:
//   node scripts/seed-demo-post.mjs           # uses MONGODB_URI from .env.local
//   MONGODB_URI=... node scripts/seed-demo-post.mjs   # explicit override

import { readFileSync, existsSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { MongoClient } from 'mongodb'

const SLUG = 'cms-feature-guide'

function resolveUri() {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI
  if (!existsSync('.env.local')) {
    throw new Error('MONGODB_URI not set and .env.local not found')
  }
  const raw = readFileSync('.env.local', 'utf8')
  const line = raw.split('\n').find((l) => l.startsWith('MONGODB_URI='))
  if (!line) throw new Error('MONGODB_URI not found in .env.local')
  return line.slice('MONGODB_URI='.length).trim().replace(/\\\$/g, '$')
}

function dbNameFromUri(u) {
  const noQuery = u.split('?')[0]
  const after = noQuery.replace(/^mongodb(\+srv)?:\/\//, '')
  const slash = after.indexOf('/')
  if (slash === -1) return 'metaborong'
  const name = after.slice(slash + 1)
  return name || 'metaborong'
}

const bid = () => randomUUID()

const blocks = [
  // ── intro ──────────────────────────────────────────────────────────────────
  {
    id: bid(), type: 'paragraph', role: 'intro',
    data: { text: 'Welcome. This post is a guided tour of the Metaborong CMS — every block type, every semantic role, and every SEO/AEO/GEO lever the editor exposes. Open the same post in the editor (admin → Posts → CMS Feature Guide) to see how each block was authored.' },
  },
  {
    id: bid(), type: 'key-takeaway',
    data: { text: 'The CMS is a block editor with semantic roles. Each block declares what it is (heading, paragraph, list, …) AND optionally what it means (intro, tldr, definition, step, …). Search engines and LLMs read both.' },
  },
  {
    id: bid(), type: 'paragraph', role: 'tldr',
    data: { text: 'TL;DR — pick block types from the slash menu (/), set roles from the right inspector, write naturally. Headings drive outline. Roles drive AEO/GEO. Variants drive geo personalization. Save auto-runs every 2s; Publish makes it live.' },
  },

  // ── heading hierarchy ─────────────────────────────────────────────────────
  {
    id: bid(), type: 'heading',
    data: { text: 'Heading levels and why they matter', level: 2, anchor: 'headings' },
  },
  {
    id: bid(), type: 'paragraph',
    data: { text: 'The post title is the page H1 — always, automatically, not editable as a block. The first heading block you insert is therefore H2. Levels go H2 → H6 (no H1, no H7+).' },
  },
  {
    id: bid(), type: 'paragraph', role: 'definition',
    data: { text: 'Heading hierarchy is non-decreasing by more than one. H2 → H3 → H4 is fine. H2 → H4 skips H3 and confuses search engines, screen readers, and LLM summarisers. The editor warns when it spots a skip.' },
  },
  {
    id: bid(), type: 'heading',
    data: { text: 'Anchors and jump links', level: 3, anchor: 'anchors' },
  },
  {
    id: bid(), type: 'paragraph',
    data: { text: 'Every heading can carry an anchor — a URL fragment that lets readers (and search engines) jump straight to that section. This block lives at /blog/cms-feature-guide#anchors. The editor auto-derives the anchor from the heading text; override it in the inspector when you want a custom fragment.' },
  },

  // ── roles ─────────────────────────────────────────────────────────────────
  {
    id: bid(), type: 'heading',
    data: { text: 'Semantic roles: how the CMS feeds AEO and GEO', level: 2, anchor: 'roles' },
  },
  {
    id: bid(), type: 'paragraph',
    data: { text: 'A role tags a block\'s intent so the renderer can shape SEO/AEO/GEO outputs around it. You set the role from the block inspector (right rail). Roles are optional — leave them empty for ordinary body copy.' },
  },
  {
    id: bid(), type: 'list',
    data: {
      ordered: false,
      items: [
        'intro — opening paragraph; first ~120 chars become Article.description when no excerpt is set',
        'tldr — short summary; surfaced to /llms.txt for LLM citation',
        'definition — direct-answer block; wrapped for featured-snippet eligibility',
        'step — sequential step; 3+ step blocks emit HowTo JSON-LD',
        'evidence — source citation; signals trust for generative engines',
        'cta — call-to-action; excluded from AI summaries',
      ],
    },
  },
  {
    id: bid(), type: 'paragraph',
    data: { text: 'Three of the blocks in this very post carry roles — scroll up: the opening paragraph is intro, the second is tldr, and the heading-hierarchy paragraph is definition. Watch how those show up in the page source\'s JSON-LD when this is published.' },
  },

  // ── steps ────────────────────────────────────────────────────────────────
  {
    id: bid(), type: 'heading',
    data: { text: 'Example: publishing your first post (HowTo schema)', level: 3, anchor: 'howto' },
  },
  {
    id: bid(), type: 'paragraph',
    data: { text: 'The four paragraphs below carry role=step. The renderer detects 3+ steps and emits HowTo JSON-LD — Google\'s rich result for instructional content.' },
  },
  {
    id: bid(), type: 'paragraph', role: 'step',
    data: { text: 'Click "New post" on the /admin dashboard. The CMS creates a draft and redirects you to the editor.' },
  },
  {
    id: bid(), type: 'paragraph', role: 'step',
    data: { text: 'Fill in the title, slug, excerpt, tags, and author name. The (i) buttons next to each field explain what each one does and why it matters.' },
  },
  {
    id: bid(), type: 'paragraph', role: 'step',
    data: { text: 'Write your content blocks. Type / to open the slash menu and pick a block type. Set roles in the right inspector. Auto-save runs every 2 seconds.' },
  },
  {
    id: bid(), type: 'paragraph', role: 'step',
    data: { text: 'Click Publish. The post is live at /blog/<slug> within seconds, no redeploy. The slug locks after publish to preserve backlinks.' },
  },

  // ── block-type showcase ──────────────────────────────────────────────────
  {
    id: bid(), type: 'heading',
    data: { text: 'Block types — every flavour', level: 2, anchor: 'blocks' },
  },

  // lists
  {
    id: bid(), type: 'heading',
    data: { text: 'Lists', level: 3, anchor: 'lists' },
  },
  {
    id: bid(), type: 'paragraph',
    data: { text: 'Unordered lists (•) for collections — order doesn\'t matter:' },
  },
  {
    id: bid(), type: 'list',
    data: { ordered: false, items: ['DeFi', 'Custom AI agents', 'SaaS products', 'Smart-contract audits'] },
  },
  {
    id: bid(), type: 'paragraph',
    data: { text: 'Ordered lists (1, 2, 3) for sequences — order matters:' },
  },
  {
    id: bid(), type: 'list',
    data: { ordered: true, items: ['Discovery call', 'Design sprint', 'Build phase', 'Audit + launch'] },
  },

  // quote
  {
    id: bid(), type: 'heading',
    data: { text: 'Quotes', level: 3, anchor: 'quotes' },
  },
  {
    id: bid(), type: 'quote',
    data: { text: 'The web is more a social creation than a technical one.', cite: 'Tim Berners-Lee' },
  },

  // code
  {
    id: bid(), type: 'heading',
    data: { text: 'Code blocks', level: 3, anchor: 'code' },
  },
  {
    id: bid(), type: 'paragraph',
    data: { text: 'Inline code uses the Language hint as a CSS class. Full syntax highlighting is on the v2.1 roadmap.' },
  },
  {
    id: bid(), type: 'code',
    data: { lang: 'ts', code: "import { db } from '@/db/client'\nconst posts = db.collection('posts')\nconst doc = await posts.findOne({ _id: id })" },
  },

  // callouts
  {
    id: bid(), type: 'heading',
    data: { text: 'Callouts: tip, warning, note', level: 3, anchor: 'callouts' },
  },
  {
    id: bid(), type: 'callout',
    data: { tone: 'tip', text: 'Tip — hover the (i) button next to any field for an explanation of what it does and when it matters.' },
  },
  {
    id: bid(), type: 'callout',
    data: { tone: 'warn', text: 'Warning — publishing locks the slug. Pick the slug carefully before clicking Publish; renaming after publish breaks backlinks.' },
  },
  {
    id: bid(), type: 'callout',
    data: { tone: 'note', text: 'Note — geo variants share a single canonical URL. US and EU readers see different copy but the same /blog/<slug>; no SEO duplication.' },
  },

  // faq
  {
    id: bid(), type: 'heading',
    data: { text: 'FAQ pairs (FAQPage JSON-LD)', level: 3, anchor: 'faq' },
  },
  {
    id: bid(), type: 'paragraph',
    data: { text: 'FAQ blocks aggregate into a FAQPage JSON-LD on the rendered page — Google\'s rich-result format for question-and-answer content. The Q field becomes the visible question heading; the A field becomes the answer paragraph.' },
  },
  {
    id: bid(), type: 'faq',
    data: {
      question: 'How often does the public post page re-render?',
      answer: 'Every 60 seconds via Next.js revalidation, plus instantly when an admin clicks Publish or Unpublish — both actions call revalidatePath for /blog and /blog/[slug].',
    },
  },
  {
    id: bid(), type: 'faq',
    data: {
      question: 'How do I create a geo variant?',
      answer: 'Click the US or EU tab at the top of the editor. Title, excerpt, and meta fields become per-region overrides. Per-block text and alt overrides live in the inspector\'s variant panel. Empty fields fall back to Base.',
    },
  },
  {
    id: bid(), type: 'faq',
    data: {
      question: 'What is the AI Readiness scan?',
      answer: 'Click "Check AI readiness" in the action bar. The CMS sends the live URL to VerseOdin (an external MCP server) which scores the page across robots.txt, sitemap, llms.txt, heading structure, readability, meta tags, semantic HTML, and accessibility. Scores are advisory — they don\'t block publish.',
    },
  },

  // ── images ──────────────────────────────────────────────────────────────
  {
    id: bid(), type: 'heading',
    data: { text: 'Images', level: 3, anchor: 'images' },
  },
  {
    id: bid(), type: 'paragraph',
    data: { text: 'Image blocks are not included in this demo because the post is seeded directly into Mongo without going through the upload flow. To insert an image in your own post: type / in the editor to open the slash menu, pick "image", and choose from the library (or upload new). Alt text is required by the schema — save fails without it.' },
  },

  // ── variants ────────────────────────────────────────────────────────────
  {
    id: bid(), type: 'heading',
    data: { text: 'Geo variants', level: 2, anchor: 'variants' },
  },
  {
    id: bid(), type: 'paragraph',
    data: { text: 'This post has both a US and an EU variant — open it in the editor and click the tabs to see each region\'s overrides. The variants overlay title, excerpt, meta fields, and the per-block text from the inspector\'s variant panel. The slug, tags, structure, and canonical URL are shared.' },
  },

  // ── AI readiness ────────────────────────────────────────────────────────
  {
    id: bid(), type: 'heading',
    data: { text: 'AI Readiness scoring', level: 2, anchor: 'ai-readiness' },
  },
  {
    id: bid(), type: 'paragraph',
    data: { text: 'The "Check AI readiness" button in the action bar (only visible after publish) sends the live post URL to VerseOdin\'s MCP server. The drawer that opens shows an overall score (0–100), a band (strong/adequate/weak), and per-check breakdowns — robots.txt presence, sitemap, llms.txt, heading structure, readability, meta tags, semantic HTML, accessibility. Cached for 1 hour against content hash so re-clicking unchanged content costs nothing. Rate-limited to 30 scans per admin per hour.' },
  },
  {
    id: bid(), type: 'paragraph', role: 'evidence',
    data: { text: 'VerseOdin docs: https://verseodin.com — see lib/ai-readiness/client.ts for the JSON-RPC envelope and lib/blog-schema.ts for the score response shape.' },
  },

  // ── publishing ──────────────────────────────────────────────────────────
  {
    id: bid(), type: 'heading',
    data: { text: 'Saving and publishing', level: 2, anchor: 'saving' },
  },
  {
    id: bid(), type: 'paragraph',
    data: { text: 'The editor auto-saves every 2 seconds while you type. The Save button is a manual override — useful when you want a hard checkpoint or when validation needs to re-run server-side. Publish flips status to "published" and bumps published_at; it also calls revalidatePath so /blog, /sitemap.xml, /llms.txt, and /blog/rss.xml refresh inside a second.' },
  },
  {
    id: bid(), type: 'callout',
    data: { tone: 'note', text: 'Sitemap, RSS, llms.txt, and llms-full.txt are all auto-generated from published posts. Nothing to maintain manually.' },
  },

  // ── cta ────────────────────────────────────────────────────────────────
  {
    id: bid(), type: 'heading',
    data: { text: 'Ready to write?', level: 2, anchor: 'cta' },
  },
  {
    id: bid(), type: 'paragraph', role: 'cta',
    data: { text: 'Head back to /admin and click "New post". The block editor is on the left, live preview on the right, slash menu opens with /, and every field has an (i) tooltip when you need it.' },
  },
]

const now = new Date()
const post = {
  _id: randomUUID(),
  slug: SLUG,
  title: 'CMS Feature Guide — every block, every role, every lever',
  excerpt: 'A guided tour of the Metaborong CMS. Every block type, every semantic role, and every SEO/AEO/GEO lever the editor exposes — explained inline.',
  status: 'published',
  content_json: blocks,
  content_schema_version: 1,
  cover_image_id: null,
  og_image_id:    null,
  tags: ['cms', 'editorial', 'docs'],
  author_name: 'Metaborong Editorial',
  author_url:  'https://www.metaborong.com',
  meta_title:        'CMS Feature Guide — Metaborong',
  meta_description: 'A guided tour of the Metaborong CMS. Block types, semantic roles, geo variants, AI readiness, and every lever the editor exposes.',
  canonical_url:    null,
  geo_variants: {
    US: {
      title:            'CMS Feature Guide — every block, every role, every lever (US)',
      excerpt:          'A guided tour of the Metaborong CMS — explained for US-based editors. Every block type, every semantic role, every SEO/AEO/GEO lever.',
      meta_description: 'Guided tour of the Metaborong CMS for US editors. Block types, semantic roles, geo variants, AI readiness, every lever.',
    },
    EU: {
      title:            'CMS Feature Guide — every block, every role, every lever (EU)',
      excerpt:          'A guided tour of the Metaborong CMS — for EU-based editors. GDPR-aware authoring patterns plus every block type and role explained.',
      meta_description: 'Guided tour of the Metaborong CMS for EU editors. GDPR-aware patterns, block types, roles, variants, AI readiness.',
    },
  },
  ai_readiness_score:        null,
  ai_readiness_band:         null,
  ai_readiness_report:       null,
  ai_readiness_content_hash: null,
  ai_readiness_checked_at:   null,
  published_at: now,
  created_at:   now,
  updated_at:   now,
}

const uri = resolveUri()
const dbName = dbNameFromUri(uri)
console.log(`seeding demo post into db=${dbName} slug=${SLUG}`)

const client = new MongoClient(uri)
await client.connect()
try {
  const posts = client.db(dbName).collection('posts')
  const existing = await posts.findOne({ slug: SLUG })
  if (existing) {
    console.log(`already exists (_id=${existing._id}); skipping. delete the doc first to re-seed.`)
    process.exit(0)
  }
  await posts.insertOne(post)
  console.log(`inserted post _id=${post._id} with ${blocks.length} content blocks`)
  console.log(`visit http://localhost:3000/blog/${SLUG}/ once the dev server picks it up`)
} finally {
  await client.close()
}
