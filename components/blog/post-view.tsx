import Image from 'next/image'
import type { Post, Image as ImageRow } from '@/lib/blog-schema'
import { BlockRenderer } from './block-renderer'
import { TableOfContents } from './table-of-contents'

// Format an ISO timestamp as "Mar 14, 2026". Server-rendered, deterministic
// output across regions — locale-agnostic to avoid a hydration mismatch
// when the same post is fetched from different geo edges.
function formatDate(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`
}

interface PostViewProps {
  post: Post
  /**
   * Optional resolver for image-block ids and the cover. M4 onward both
   * call sites inject a resolver backed by the `images` table; without
   * one, image blocks fall back to alt-only placeholders.
   */
  resolveImage?: (imageId: string) => ImageRow | null
  /**
   * When true, render a "Draft preview" banner above the title. Used by
   * the standalone preview route so the admin reader knows they're not
   * looking at the published page. Defaults to false (public reader).
   */
  draftBanner?: boolean
  /**
   * When true, wrap the article in a 2-column layout with a sticky TOC
   * rail on lg+ viewports. Only the public /blog/[slug] route opts in;
   * admin preview keeps the single-column reader.
   */
  withToc?: boolean
}

/**
 * The single shared post view. Used by:
 *   · app/blog/[slug]/page.tsx          (public reader)
 *   · app/admin/posts/[id]/preview/page.tsx (standalone admin preview)
 *
 * One renderer, two call sites. Same DOM, same SEO output. PRD §5.9
 * specifically requires this — what previews is what publishes.
 */
export function PostView({ post, resolveImage, draftBanner, withToc }: PostViewProps) {
  const published = formatDate(post.published_at)
  const updated = formatDate(post.updated_at)
  const cover = post.cover_image_id ? resolveImage?.(post.cover_image_id) ?? null : null

  const articleNode = (
    <article className="mx-auto max-w-[720px] px-[24px] py-[64px] md:px-[48px] md:py-[96px]">
      {draftBanner ? (
        <div className="mb-[24px] rounded-lg border border-dashed border-accent bg-[#fff8f1] px-4 py-3">
          <p
            className="text-[11px] font-medium uppercase tracking-[0.16em] text-accent"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Draft preview · noindex
          </p>
          <p className="mt-1 text-[13px] leading-[1.5] text-dark tracking-[-0.005em]">
            This is a sharable preview of an unpublished post. The public route returns 404 until publish.
          </p>
        </div>
      ) : null}

      {cover ? (
        <Image
          src={cover.blob_url}
          alt={cover.alt || ''}
          width={cover.width}
          height={cover.height}
          sizes="(max-width: 768px) 100vw, 720px"
          priority
          className="mb-[40px] w-full rounded-xl border border-border"
          style={{ objectPosition: `${cover.focal_x * 100}% ${cover.focal_y * 100}%` }}
        />
      ) : post.cover_image_id ? (
        <div
          aria-hidden="true"
          className="mb-[40px] w-full rounded-xl border border-dashed border-border bg-bg-subtle"
          style={{ aspectRatio: '16 / 9' }}
        />
      ) : null}

      {post.tags.length > 0 ? (
        <p
          className="mb-[16px] text-[11px] font-medium uppercase tracking-[0.16em] text-gray"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {post.tags.join(' · ')}
        </p>
      ) : null}

      {/* Title — the canonical h1 (PRD: heading blocks may not be h1). */}
      <h1 className="mb-[24px] text-[clamp(36px,5vw,56px)] font-bold tracking-[-0.035em] leading-[1.05] text-dark">
        {post.title}
      </h1>

      {/* Excerpt / lede — promoted as the AEO-extractable summary. */}
      {post.excerpt ? (
        <p className="mb-[32px] border-l-[3px] border-brand pl-[20px] text-[18px] leading-[1.6] tracking-[-0.01em] text-dark">
          {post.excerpt}
        </p>
      ) : null}

      <div className="mb-[40px] flex flex-wrap items-center gap-x-[16px] gap-y-[4px] text-[13px] tracking-[-0.005em] text-gray">
        {post.author_url ? (
          <a href={post.author_url} className="text-brand no-underline hover:underline">
            {post.author_name}
          </a>
        ) : (
          <span>{post.author_name}</span>
        )}
        {published ? (
          <>
            <span aria-hidden="true">·</span>
            <time dateTime={post.published_at!}>{published}</time>
          </>
        ) : null}
        {updated && published && updated !== published ? (
          <>
            <span aria-hidden="true">·</span>
            <span>Updated {updated}</span>
          </>
        ) : null}
      </div>

      <div className="text-dark">
        {post.content_json.map((block) => (
          <BlockRenderer key={block.id} block={block} resolveImage={resolveImage} />
        ))}
      </div>
    </article>
  )

  if (!withToc) return articleNode

  // Public-reader layout: TOC rail on lg+, accordion on smaller. The
  // mobile accordion sits above the article; the desktop rail goes in
  // the right column. Each variant of the component handles its own
  // visibility breakpoint via the wrapping div's CSS.
  return (
    <div className="mx-auto max-w-[1100px] px-[24px] md:px-[48px] py-[24px] lg:py-[64px]">
      <div className="lg:hidden mb-[24px]">
        <TableOfContents blocks={post.content_json} variant="mobile" />
      </div>
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-[48px]">
        <div className="min-w-0">{articleNode}</div>
        <aside className="hidden lg:block pt-[64px]">
          <TableOfContents blocks={post.content_json} variant="desktop" />
        </aside>
      </div>
    </div>
  )
}
