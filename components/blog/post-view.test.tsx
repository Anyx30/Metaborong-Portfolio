// @vitest-environment happy-dom

import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

import { PostView } from './post-view'
import type { Block, Post } from '@/lib/blog-schema'
import { faqPageSchema, howToSchema, speakableSchema } from '@/lib/seo'

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    slug: 'how-we-shipped',
    title: 'How we shipped the protocol in six weeks',
    excerpt: 'A short summary that doubles as the lede.',
    status: 'published',
    content_json: [],
    content_schema_version: 1,
    cover_image_id: null,
    og_image_id: null,
    tags: ['web3', 'engineering'],
    author_name: 'Arnab Ray',
    author_url: 'https://example.com/arnab',
    meta_title: null,
    meta_description: null,
    canonical_url: null,
    geo_variants: {},
    ai_readiness_score: null,
    ai_readiness_band: null,
    ai_readiness_report: null,
    ai_readiness_checked_at: null,
    published_at: '2026-04-12T08:00:00.000Z',
    created_at: '2026-04-10T08:00:00.000Z',
    updated_at: '2026-04-12T08:00:00.000Z',
    ...overrides,
  }
}

describe('<PostView />', () => {
  afterEach(() => cleanup())

  it('renders the post title as the canonical h1 (heading blocks may not be h1)', () => {
    render(<PostView post={makePost()} />)
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toHaveTextContent(/how we shipped the protocol in six weeks/i)
  })

  it('renders byline (author + published date) and the excerpt lede', () => {
    render(<PostView post={makePost()} />)
    expect(screen.getByRole('link', { name: /arnab ray/i })).toHaveAttribute('href', 'https://example.com/arnab')
    expect(screen.getByText(/a short summary that doubles as the lede/i)).toBeInTheDocument()
    expect(screen.getByText(/apr 12, 2026/i)).toBeInTheDocument()
  })

  it('iterates blocks in order, respecting heading levels (h2/h3) — never emits an h1 from blocks', () => {
    const blocks: Block[] = [
      { id: 'b1', type: 'heading',   data: { text: 'Section A', level: 2 } },
      { id: 'b2', type: 'paragraph', data: { text: 'First paragraph.' } },
      { id: 'b3', type: 'heading',   data: { text: 'Subsection',  level: 3 } },
      { id: 'b4', type: 'paragraph', data: { text: 'Second paragraph.' } },
    ]
    render(<PostView post={makePost({ content_json: blocks })} />)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 2, name: /section a/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: /subsection/i })).toBeInTheDocument()
    expect(screen.getByText(/first paragraph/i)).toBeInTheDocument()
    expect(screen.getByText(/second paragraph/i)).toBeInTheDocument()
  })

  it('image blocks render the alt-text placeholder when no resolver is provided (pre-M4)', () => {
    const blocks: Block[] = [
      {
        id: 'img1',
        type: 'image',
        data: {
          imageId: '00000000-0000-0000-0000-000000000000',
          alt: 'Protocol architecture diagram',
          caption: 'Hot path on the left, settlement on the right.',
        },
      },
    ]
    render(<PostView post={makePost({ content_json: blocks })} />)
    const placeholder = screen.getByRole('img', { name: /protocol architecture diagram/i })
    expect(placeholder.tagName.toLowerCase()).toBe('div')
    expect(screen.getByText(/hot path on the left/i)).toBeInTheDocument()
  })

  it('faq blocks render as <details> with the question as the summary', () => {
    const blocks: Block[] = [
      {
        id: 'q1',
        type: 'faq',
        data: { question: 'How long does deployment take?', answer: 'About six minutes on the test network.' },
      },
    ]
    render(<PostView post={makePost({ content_json: blocks })} />)
    const details = screen.getByText(/how long does deployment take/i).closest('details')
    expect(details).not.toBeNull()
    expect(within(details!).getByText(/about six minutes/i)).toBeInTheDocument()
  })

  it('list blocks honor the `ordered` flag (ol vs ul)', () => {
    const blocks: Block[] = [
      { id: 'l1', type: 'list', data: { ordered: true,  items: ['Step 1', 'Step 2'] } },
      { id: 'l2', type: 'list', data: { ordered: false, items: ['Apple', 'Banana'] } },
    ]
    const { container } = render(<PostView post={makePost({ content_json: blocks })} />)
    expect(container.querySelector('ol')).not.toBeNull()
    expect(container.querySelector('ul')).not.toBeNull()
    expect(screen.getByText(/step 1/i).closest('ol')).not.toBeNull()
    expect(screen.getByText(/apple/i).closest('ul')).not.toBeNull()
  })

  it('renders the draft banner when draftBanner=true and not when false', () => {
    const { rerender } = render(<PostView post={makePost({ status: 'draft' })} draftBanner />)
    expect(screen.getByText(/draft preview/i)).toBeInTheDocument()
    rerender(<PostView post={makePost()} />)
    expect(screen.queryByText(/draft preview/i)).not.toBeInTheDocument()
  })

  it('cover-image placeholder appears only when cover_image_id is set; absent when null', () => {
    const { container, rerender } = render(<PostView post={makePost({ cover_image_id: null })} />)
    expect(container.querySelector('[style*="aspect-ratio"]')).toBeNull()
    rerender(<PostView post={makePost({ cover_image_id: '00000000-0000-0000-0000-000000000000' })} />)
    expect(container.querySelector('[style*="aspect-ratio"]')).not.toBeNull()
  })

  it('withToc=true wraps the article in a TOC layout when there are headings', () => {
    const blocks: Block[] = [
      { id: 'b1', type: 'heading',   data: { text: 'Section A', level: 2 } },
      { id: 'b2', type: 'paragraph', data: { text: 'Body.' } },
    ]
    render(<PostView post={makePost({ content_json: blocks })} withToc />)
    const labels = screen.getAllByText(/on this page/i)
    expect(labels.length).toBeGreaterThan(0)
    expect(
      screen.getAllByRole('navigation', { name: /table of contents/i }).length,
    ).toBeGreaterThan(0)
  })

  it('withToc=true with zero-heading post renders no TOC nav', () => {
    render(<PostView post={makePost({ content_json: [] })} withToc />)
    expect(screen.queryByRole('navigation', { name: /table of contents/i })).toBeNull()
  })

  it('withToc=false (admin preview default) never renders the TOC layout', () => {
    const blocks: Block[] = [
      { id: 'b1', type: 'heading', data: { text: 'Section A', level: 2 } },
    ]
    render(<PostView post={makePost({ content_json: blocks })} />)
    expect(screen.queryByRole('navigation', { name: /table of contents/i })).toBeNull()
  })
})

// M9-AEO: data-block-id is the anchor that Speakable's cssSelector
// resolves against, so every block's outermost rendered DOM node must
// carry it. These tests exercise BlockRenderer indirectly through
// PostView so we get the same render path the public route uses.
describe('<PostView /> — data-block-id (M9-AEO)', () => {
  afterEach(() => cleanup())

  it('emits data-block-id on every block type', () => {
    const blocks: Block[] = [
      { id: 'h-1', type: 'heading',     data: { text: 'Heading',  level: 2 } },
      { id: 'p-1', type: 'paragraph',   data: { text: 'Paragraph body.' } },
      { id: 'i-1', type: 'image',       data: { imageId: '00000000-0000-0000-0000-000000000000', alt: 'Alt' } },
      { id: 'l-1', type: 'list',        data: { ordered: false, items: ['a', 'b'] } },
      { id: 'q-1', type: 'quote',       data: { text: 'Quoted.' } },
      { id: 'c-1', type: 'code',        data: { code: 'const x = 1', lang: 'ts' } },
      { id: 'a-1', type: 'callout',     data: { tone: 'note', text: 'Note body.' } },
      { id: 'f-1', type: 'faq',         data: { question: 'Q?', answer: 'A.' } },
      { id: 'k-1', type: 'key-takeaway', data: { text: 'The point.' } },
    ]
    const { container } = render(<PostView post={makePost({ content_json: blocks })} />)
    for (const b of blocks) {
      expect(
        container.querySelector(`[data-block-id="${b.id}"]`),
        `block ${b.id} (${b.type}) should expose data-block-id on its outer node`,
      ).not.toBeNull()
    }
  })
})

// M9-AEO: the FAQPage / HowTo / Speakable JSON-LD scripts are emitted
// by app/blog/[slug]/page.tsx, not PostView itself. These tests cover
// the wiring contract: feed the same builder outputs through the same
// <script type="application/ld+json"> dangerouslySetInnerHTML pattern
// the page route uses, and assert the rendered HTML matches what a
// crawler would see. If the page route's emit pattern drifts, these
// tests still pass; the e2e spec (e2e/m9-aeo.spec.ts) is the
// integration check that catches drift end-to-end.
function PostJsonLd({ post }: { post: Post }) {
  const faqPage = faqPageSchema(post)
  const howTo = howToSchema(post)
  const speakable = speakableSchema(post)
  return (
    <>
      {faqPage && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }}
        />
      )}
      {howTo && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howTo) }}
        />
      )}
      {speakable && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(speakable) }}
        />
      )}
    </>
  )
}

function ldJsonScripts(container: HTMLElement): Array<Record<string, unknown>> {
  const nodes = Array.from(container.querySelectorAll('script[type="application/ld+json"]'))
  return nodes.map((n) => JSON.parse(n.textContent ?? 'null') as Record<string, unknown>)
}

describe('<PostJsonLd /> — AEO emissions on /blog/[slug] (M9-AEO)', () => {
  afterEach(() => cleanup())

  it('a post with 1 faq block emits a FAQPage script', () => {
    const blocks: Block[] = [
      { id: 'p-1', type: 'paragraph', data: { text: 'Lede.' } },
      { id: 'f-1', type: 'faq',       data: { question: 'How long?', answer: 'About six minutes.' } },
    ]
    const { container } = render(<PostJsonLd post={makePost({ content_json: blocks })} />)
    const scripts = ldJsonScripts(container)
    const faq = scripts.find((s) => s['@type'] === 'FAQPage')
    expect(faq).toBeDefined()
    expect(Array.isArray(faq!.mainEntity)).toBe(true)
    expect((faq!.mainEntity as unknown[]).length).toBe(1)
  })

  it('a post with 3 step-role blocks emits a HowTo with 3 steps in order', () => {
    const blocks: Block[] = [
      { id: 's-1', type: 'paragraph', role: 'step', data: { text: 'First, do this.' } },
      { id: 'p-1', type: 'paragraph',                data: { text: 'Aside, not a step.' } },
      { id: 's-2', type: 'paragraph', role: 'step', data: { text: 'Then, do that.' } },
      { id: 's-3', type: 'paragraph', role: 'step', data: { text: 'Finally, ship it.' } },
    ]
    const { container } = render(<PostJsonLd post={makePost({ content_json: blocks })} />)
    const scripts = ldJsonScripts(container)
    const howTo = scripts.find((s) => s['@type'] === 'HowTo')
    expect(howTo).toBeDefined()
    const steps = howTo!.step as Array<Record<string, unknown>>
    expect(steps).toHaveLength(3)
    expect(steps.map((s) => s.position)).toEqual([1, 2, 3])
    expect(steps[0].text).toMatch(/first, do this/i)
    expect(steps[2].text).toMatch(/finally, ship it/i)
  })

  it('a post with role=tldr on one block emits a Speakable cssSelector pointing at that data-block-id', () => {
    const blocks: Block[] = [
      { id: 'p-1', type: 'paragraph', role: 'tldr', data: { text: 'Top-line summary.' } },
      { id: 'p-2', type: 'paragraph',                data: { text: 'Body.' } },
    ]
    const { container } = render(<PostJsonLd post={makePost({ content_json: blocks })} />)
    const scripts = ldJsonScripts(container)
    const speakable = scripts.find((s) => s['@type'] === 'WebPage')
    expect(speakable).toBeDefined()
    const spec = speakable!.speakable as Record<string, unknown>
    expect(spec['@type']).toBe('SpeakableSpecification')
    expect(spec.cssSelector).toEqual(['[data-block-id="p-1"]'])
  })

  it('a post with neither faq nor 3+ steps nor tldr/intro emits no AEO scripts', () => {
    const blocks: Block[] = [
      { id: 'h-1', type: 'heading',   data: { text: 'Heading',  level: 2 } },
      { id: 'p-1', type: 'paragraph', data: { text: 'Body.' } },
    ]
    const { container } = render(<PostJsonLd post={makePost({ content_json: blocks })} />)
    expect(ldJsonScripts(container)).toHaveLength(0)
  })
})
