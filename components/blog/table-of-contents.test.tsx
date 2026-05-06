// @vitest-environment happy-dom

import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

import { TableOfContents, extractHeadings } from './table-of-contents'
import type { Block } from '@/lib/blog-schema'

const headingBlocks: Block[] = [
  { id: 'b1', type: 'heading',   data: { text: 'First section',  level: 2 } },
  { id: 'b2', type: 'paragraph', data: { text: 'Body.' } },
  { id: 'b3', type: 'heading',   data: { text: 'Sub one',        level: 3 } },
  { id: 'b4', type: 'heading',   data: { text: 'Second section', level: 2 } },
  { id: 'b5', type: 'heading',   data: { text: 'Custom anchor',  level: 2, anchor: 'custom-anchor-id' } },
]

describe('extractHeadings', () => {
  it('returns only heading blocks, in document order', () => {
    const out = extractHeadings(headingBlocks)
    expect(out).toHaveLength(4)
    expect(out.map((e) => e.text)).toEqual([
      'First section',
      'Sub one',
      'Second section',
      'Custom anchor',
    ])
  })

  it('uses block.data.anchor when present, otherwise slugifies the text', () => {
    const out = extractHeadings(headingBlocks)
    expect(out[0].id).toBe('first-section')
    expect(out[1].id).toBe('sub-one')
    expect(out[3].id).toBe('custom-anchor-id')
  })

  it('returns empty array for blocks with zero headings', () => {
    const noHeadings: Block[] = [
      { id: 'p1', type: 'paragraph', data: { text: 'Just a body.' } },
      { id: 'l1', type: 'list', data: { ordered: false, items: ['x'] } },
    ]
    expect(extractHeadings(noHeadings)).toEqual([])
  })
})

describe('<TableOfContents />', () => {
  afterEach(() => cleanup())

  it('renders nothing when the post has no headings (skip-empty)', () => {
    const { container } = render(
      <TableOfContents blocks={[
        { id: 'p1', type: 'paragraph', data: { text: 'just a body' } },
      ]} variant="desktop" />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('desktop variant renders a navigation landmark with proper aria-label', () => {
    render(<TableOfContents blocks={headingBlocks} variant="desktop" />)
    const nav = screen.getByRole('navigation', { name: /table of contents/i })
    expect(nav).toBeInTheDocument()
  })

  it('desktop variant renders one anchor link per heading with correct href', () => {
    render(<TableOfContents blocks={headingBlocks} variant="desktop" />)
    expect(screen.getByRole('link', { name: /first section/i }))
      .toHaveAttribute('href', '#first-section')
    expect(screen.getByRole('link', { name: /sub one/i }))
      .toHaveAttribute('href', '#sub-one')
    expect(screen.getByRole('link', { name: /second section/i }))
      .toHaveAttribute('href', '#second-section')
    expect(screen.getByRole('link', { name: /custom anchor/i }))
      .toHaveAttribute('href', '#custom-anchor-id')
  })

  it('mobile variant renders inside a <details> with an "On this page" summary', () => {
    const { container } = render(
      <TableOfContents blocks={headingBlocks} variant="mobile" />,
    )
    const details = container.querySelector('details')
    expect(details).not.toBeNull()
    expect(screen.getByText(/on this page/i)).toBeInTheDocument()
    const nav = screen.getByRole('navigation', { name: /table of contents/i })
    expect(details!.contains(nav)).toBe(true)
  })

  it('mobile variant renders the same hrefs as desktop variant', () => {
    render(<TableOfContents blocks={headingBlocks} variant="mobile" />)
    expect(screen.getByRole('link', { name: /first section/i }))
      .toHaveAttribute('href', '#first-section')
    expect(screen.getByRole('link', { name: /custom anchor/i }))
      .toHaveAttribute('href', '#custom-anchor-id')
  })

  it('clicking an anchor updates window.location.hash and prevents default navigation', () => {
    // happy-dom needs a target heading for getElementById to succeed.
    const targetEl = document.createElement('h2')
    targetEl.id = 'first-section'
    document.body.appendChild(targetEl)

    render(<TableOfContents blocks={headingBlocks} variant="desktop" />)
    const link = screen.getByRole('link', { name: /first section/i })

    targetEl.scrollIntoView = () => {}

    link.click()
    expect(window.location.hash).toBe('#first-section')

    targetEl.remove()
    history.replaceState(null, '', window.location.pathname)
  })

  it('headings deeper than h2 are visually indented via inline padding-left', () => {
    const { container } = render(
      <TableOfContents blocks={headingBlocks} variant="desktop" />,
    )
    const items = container.querySelectorAll('li')
    const styles = Array.from(items).map((li) => (li as HTMLElement).style.paddingLeft)
    expect(styles).toEqual(['12px', '24px', '12px', '12px'])
  })
})
