import type { Metadata } from 'next'
import Link from 'next/link'
import { Nav } from '@/components/layout/nav'
import { listPublishedPosts } from '@/lib/posts'
import type { PostSummary } from '@/lib/blog-schema'

export const metadata: Metadata = {
  title: 'Blog — Web3, AI agents, and product engineering — Metaborong',
  description:
    'Notes from the Metaborong studio on shipping Web3 protocols, AI agents, and product systems.',
  alternates: {
    // Tag-filtered URLs (?tag=foo) and paginated URLs (?page=2) all
    // canonicalize to /blog so search engines don't index them as
    // duplicate-content competitors of the unfiltered index.
    canonical: '/blog',
  },
}

// Per PRD §5.4 — published posts revalidate every 60s; publish/unpublish
// also calls revalidatePath('/blog') from the BE for instant invalidation.
export const revalidate = 60

interface BlogIndexProps {
  searchParams: Promise<{ tag?: string; page?: string }>
}

export default async function BlogIndexPage({ searchParams }: BlogIndexProps) {
  const sp = await searchParams
  const tag = typeof sp.tag === 'string' ? sp.tag : undefined
  const page = Math.max(1, parseInt(typeof sp.page === 'string' ? sp.page : '1', 10) || 1)
  const perPage = 12

  let result = { posts: [] as PostSummary[], total: 0, hasMore: false }
  let fetchError: string | null = null
  try {
    result = await listPublishedPosts({ tag, page, perPage })
  } catch (err) {
    fetchError = err instanceof Error ? err.message : 'Could not load posts.'
  }

  return (
    <>
      <Nav />
      <main className="bg-bg pt-[80px]">
        <section className="px-[24px] py-[64px] md:px-[48px] md:py-[96px] lg:px-[96px] xl:px-[128px]">
          <div className="mx-auto max-w-[1120px]">
            <header className="mb-[64px] max-w-[640px]">
              <p
                className="mb-[12px] text-[11px] font-medium uppercase tracking-[0.18em] text-gray"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {tag ? `Tag · ${tag}` : 'Blog'}
              </p>
              <h1 className="text-[clamp(40px,5vw,64px)] font-bold tracking-[-0.035em] leading-[1.05] text-dark">
                {tag ? `Posts tagged "${tag}"` : 'Field notes from the studio'}
              </h1>
              <p className="mt-[20px] text-[16px] leading-[1.65] text-gray tracking-[-0.005em]">
                Web3 protocol design, AI agent architecture, and the messy product
                decisions in between. Written by the engineers who shipped them.
              </p>
              <div className="mt-[16px] flex flex-wrap items-center gap-x-[20px] gap-y-[8px] text-[13px]">
                {tag ? (
                  <Link
                    href="/blog"
                    className="inline-flex items-center gap-1 text-brand no-underline hover:underline"
                  >
                    ← All posts
                  </Link>
                ) : null}
                <a
                  href="/blog/rss.xml"
                  className="inline-flex items-center gap-[6px] text-gray no-underline hover:text-brand"
                  aria-label="Subscribe to the RSS feed"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M4 11a9 9 0 0 1 9 9" />
                    <path d="M4 4a16 16 0 0 1 16 16" />
                    <circle cx="5" cy="19" r="1" />
                  </svg>
                  RSS
                </a>
                {/* M9-GEO: surface the LLM-readable index so curious
                    humans (and crawlers viewing the HTML) can find it. */}
                <a
                  href="/llms.txt"
                  className="inline-flex items-center gap-[6px] text-gray no-underline hover:text-brand"
                  style={{ fontFamily: 'var(--font-mono)' }}
                  aria-label="LLM-readable index of all posts"
                >
                  LLMs.txt
                </a>
              </div>
            </header>

            {fetchError ? (
              <div role="alert" className="rounded-xl border border-[#fda29b] bg-[#fef3f2] p-[24px] text-[14px] text-[#b42318]">
                Could not load the latest posts: {fetchError}
              </div>
            ) : result.posts.length === 0 ? (
              <EmptyState tag={tag} />
            ) : (
              <>
                <ul className="grid grid-cols-1 gap-[32px] md:grid-cols-2 lg:grid-cols-3">
                  {result.posts.map((p) => (
                    <li key={p.id}>
                      <PostCard post={p} />
                    </li>
                  ))}
                </ul>
                {(page > 1 || result.hasMore) ? (
                  <Pagination tag={tag} page={page} hasMore={result.hasMore} />
                ) : null}
              </>
            )}
          </div>
        </section>
      </main>
    </>
  )
}

function PostCard({ post }: { post: PostSummary }) {
  return (
    <article className="group flex h-full flex-col rounded-xl border border-border bg-white transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-brand/30">
      {/* Pre-M4: cover_image_id isn't carried on PostSummary, so the card
          uses a brand-tinted placeholder. Once images are wired (M4) the
          summary type or this card will accept a resolved cover URL. */}
      <div
        aria-hidden="true"
        className="rounded-t-xl bg-bg-subtle"
        style={{ aspectRatio: '16 / 9' }}
      />
      <div className="flex flex-1 flex-col gap-[12px] p-[24px]">
        {post.tags.length > 0 ? (
          <p
            className="text-[10px] font-medium uppercase tracking-[0.18em] text-brand"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {post.tags.slice(0, 3).join(' · ')}
          </p>
        ) : null}
        <h2 className="text-[20px] font-bold tracking-[-0.02em] leading-[1.25] text-dark group-hover:text-brand">
          <Link href={`/blog/${post.slug}`} className="no-underline text-inherit">
            {post.title}
          </Link>
        </h2>
        {post.published_at ? (
          <time
            dateTime={post.published_at}
            className="mt-auto text-[12px] tracking-[-0.005em] text-gray"
          >
            {new Date(post.published_at).toISOString().slice(0, 10)}
          </time>
        ) : null}
      </div>
    </article>
  )
}

function EmptyState({ tag }: { tag?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-white p-[64px] text-center">
      <p
        className="mb-[10px] text-[11px] font-medium uppercase tracking-[0.18em] text-gray-light"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        Empty
      </p>
      <h2 className="mb-[8px] text-[22px] font-semibold tracking-[-0.02em] text-dark">
        {tag ? `No posts tagged "${tag}" yet` : 'Nothing published yet'}
      </h2>
      <p className="mx-auto max-w-[480px] text-[14px] leading-[1.55] tracking-[-0.005em] text-gray">
        Check back soon — we ship faster than we write.
      </p>
    </div>
  )
}

function Pagination({ tag, page, hasMore }: { tag: string | undefined; page: number; hasMore: boolean }) {
  function buildHref(targetPage: number) {
    const params = new URLSearchParams()
    if (tag) params.set('tag', tag)
    if (targetPage > 1) params.set('page', String(targetPage))
    const qs = params.toString()
    return qs ? `/blog?${qs}` : '/blog'
  }
  return (
    <nav aria-label="Pagination" className="mt-[48px] flex items-center justify-between gap-3 text-[13px] tracking-[-0.005em] text-gray">
      {page > 1 ? (
        <Link href={buildHref(page - 1)} className="text-brand no-underline hover:underline">
          ← Newer
        </Link>
      ) : <span aria-hidden="true" />}
      <span className="text-gray-light">Page {page}</span>
      {hasMore ? (
        <Link href={buildHref(page + 1)} className="text-brand no-underline hover:underline">
          Older →
        </Link>
      ) : <span aria-hidden="true" />}
    </nav>
  )
}
