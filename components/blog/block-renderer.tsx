import Image from 'next/image'
import type { Block, Image as ImageRow } from '@/lib/blog-schema'

// Slugify heading text into a stable anchor id so jump-link snippets work
// for SEO. Block.data.anchor wins when explicitly set; otherwise we derive.
function anchorFor(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'section'
}

interface BlockRendererProps {
  block: Block
  // M4: resolver returns the full Image row (or null when the image was
  // deleted / never existed). Public route + admin preview both inject one
  // backed by getImagesByIds; when omitted (or returning null) the image
  // block renders a dashed 16:9 placeholder so AEO bots still see the alt.
  resolveImage?: (imageId: string) => ImageRow | null
}

export function BlockRenderer({ block, resolveImage }: BlockRendererProps) {
  switch (block.type) {
    case 'heading': {
      const { text, level, anchor } = block.data
      const id = anchor || anchorFor(text)
      const Tag = (`h${level}` as 'h2' | 'h3' | 'h4' | 'h5' | 'h6')
      const sizeClass = (
        level === 2 ? 'text-[clamp(28px,3.2vw,40px)] tracking-[-0.03em] leading-[1.15] mt-[48px] mb-[16px]' :
        level === 3 ? 'text-[clamp(22px,2.4vw,28px)] tracking-[-0.025em] leading-[1.2] mt-[40px] mb-[12px]' :
        level === 4 ? 'text-[20px] tracking-[-0.02em] leading-[1.25] mt-[32px] mb-[10px]' :
        level === 5 ? 'text-[17px] tracking-[-0.015em] leading-[1.3] mt-[24px] mb-[8px]' :
        /* 6 */       'text-[15px] tracking-[-0.01em] leading-[1.3] mt-[20px] mb-[6px]'
      )
      return <Tag id={id} className={`font-bold text-dark ${sizeClass}`}>{text}</Tag>
    }
    case 'paragraph': {
      return <p className="my-[16px] text-[16px] leading-[1.65] tracking-[-0.005em] text-dark">{block.data.text}</p>
    }
    case 'image': {
      const { imageId, alt, caption } = block.data
      const resolved = resolveImage?.(imageId) ?? null
      return (
        <figure className="my-[32px]">
          {resolved ? (
            <Image
              src={resolved.blob_url}
              alt={alt}
              width={resolved.width}
              height={resolved.height}
              sizes="(max-width: 768px) 100vw, 720px"
              className="block h-auto w-full rounded-lg border border-border"
              style={{ objectPosition: `${resolved.focal_x * 100}% ${resolved.focal_y * 100}%` }}
            />
          ) : (
            <div
              role="img"
              aria-label={alt}
              className="block w-full rounded-lg border border-dashed border-border bg-bg-subtle"
              style={{ aspectRatio: '16 / 9' }}
            />
          )}
          {caption ? (
            <figcaption className="mt-[8px] text-[13px] leading-[1.5] tracking-[-0.005em] text-gray">
              {caption}
            </figcaption>
          ) : null}
        </figure>
      )
    }
    case 'list': {
      const { ordered, items } = block.data
      const Tag = ordered ? 'ol' : 'ul'
      return (
        <Tag
          className={`my-[16px] pl-[24px] text-[16px] leading-[1.65] tracking-[-0.005em] text-dark ${
            ordered ? 'list-decimal' : 'list-disc'
          }`}
        >
          {items.map((item, i) => (
            <li key={i} className="my-[6px]">{item}</li>
          ))}
        </Tag>
      )
    }
    case 'quote': {
      return (
        <blockquote className="my-[24px] border-l-[3px] border-brand pl-[20px] py-[4px]">
          <p className="text-[17px] leading-[1.6] tracking-[-0.01em] text-dark italic">
            {block.data.text}
          </p>
          {block.data.cite ? (
            <cite className="mt-[8px] block text-[13px] not-italic text-gray tracking-[-0.005em]">
              — {block.data.cite}
            </cite>
          ) : null}
        </blockquote>
      )
    }
    case 'code': {
      // No syntax highlighting in M2 — just a monospace block. The lang
      // attribute is preserved for future highlighting + accessibility.
      return (
        <pre
          className="my-[24px] overflow-x-auto rounded-lg border border-border bg-bg-subtle p-[16px] text-[13px] leading-[1.55]"
          style={{ fontFamily: 'var(--font-mono)' }}
          data-lang={block.data.lang || undefined}
        >
          <code>{block.data.code}</code>
        </pre>
      )
    }
    case 'callout': {
      const tone = block.data.tone
      const palette =
        tone === 'tip'  ? { border: 'border-brand', bg: 'bg-[#f5f7ff]', label: 'Tip',     dot: 'bg-brand'  } :
        tone === 'warn' ? { border: 'border-accent', bg: 'bg-[#fff8f1]', label: 'Warning', dot: 'bg-accent' } :
                          { border: 'border-border', bg: 'bg-bg-subtle', label: 'Note',    dot: 'bg-gray-light' }
      return (
        <aside className={`my-[24px] rounded-lg border ${palette.border} ${palette.bg} p-[16px]`}>
          <div className="mb-[6px] flex items-center gap-2">
            <span className={`inline-block h-2 w-2 rounded-sm ${palette.dot}`} aria-hidden="true" />
            <span
              className="text-[11px] font-medium uppercase tracking-[0.12em] text-gray"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {palette.label}
            </span>
          </div>
          <p className="text-[15px] leading-[1.6] tracking-[-0.005em] text-dark">
            {block.data.text}
          </p>
        </aside>
      )
    }
    case 'faq': {
      const { question, answer } = block.data
      return (
        <details className="my-[16px] rounded-lg border border-border bg-white p-[16px] open:bg-bg-subtle">
          <summary className="cursor-pointer text-[16px] font-semibold tracking-[-0.01em] text-dark">
            {question}
          </summary>
          <p className="mt-[12px] text-[15px] leading-[1.65] tracking-[-0.005em] text-dark">
            {answer}
          </p>
        </details>
      )
    }
    case 'key-takeaway': {
      return (
        <aside className="my-[24px] rounded-lg border-l-[3px] border-brand bg-bg-subtle p-[16px]">
          <p
            className="mb-[6px] text-[11px] font-medium uppercase tracking-[0.12em] text-brand"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Key takeaway
          </p>
          <p className="text-[15px] leading-[1.6] tracking-[-0.005em] text-dark">
            {block.data.text}
          </p>
        </aside>
      )
    }
  }
}
