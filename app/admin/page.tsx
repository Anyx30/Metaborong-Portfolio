import type { Metadata } from 'next'
import { headers } from 'next/headers'
import Link from 'next/link'
import { listAllPostsForAdmin } from '@/lib/posts'
import type { PostSummary } from '@/lib/blog-schema'
import { AdminPostsList } from '@/components/admin/admin-posts-list'

export const metadata: Metadata = {
  title: 'Posts',
  robots: { index: false, follow: false },
}

// Admin views never want stale data — re-render every visit.
export const dynamic = 'force-dynamic'

type StatusFilter = 'all' | 'draft' | 'published'

function parseStatus(raw: string | string[] | undefined): StatusFilter {
  const v = Array.isArray(raw) ? raw[0] : raw
  return v === 'draft' || v === 'published' ? v : 'all'
}

interface DashboardPageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function AdminDashboardPage({ searchParams }: DashboardPageProps) {
  const sp = await searchParams
  const status = parseStatus(sp.status)

  // Touch headers() so Next treats this as truly dynamic on every request.
  await headers()

  // Server fetch via lib/posts.ts. The §2.3 contract names GET
  // /api/admin/posts as the consumer; we read directly from the helper
  // here because the layout has already gated by getAdminSession and
  // there's no benefit to hopping over HTTP from a server component on
  // the same process. The /api/admin/posts route handler (BE-owned, M2)
  // wraps the same helper for the editor's client-side calls (autosave,
  // status changes, delete).
  let posts: PostSummary[] = []
  let fetchError: string | null = null
  try {
    posts = await listAllPostsForAdmin(status)
  } catch (err) {
    fetchError = err instanceof Error ? err.message : 'Could not load posts.'
  }

  return (
    <div className="flex flex-col gap-[32px]">
      <header className="flex flex-wrap items-end justify-between gap-[24px]">
        <div>
          <p
            className="mb-[6px] text-[11px] font-medium uppercase tracking-[0.18em] text-gray"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Dashboard
          </p>
          <h1 className="text-[32px] font-bold tracking-[-0.03em] leading-[1.1] text-dark">
            Posts
          </h1>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex h-[40px] items-center gap-2 rounded-md bg-brand px-4 text-[13px] font-semibold tracking-[-0.01em] text-white no-underline transition-opacity duration-150 hover:opacity-95 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          New post
        </Link>
      </header>

      <AdminPostsList initialPosts={posts} status={status} fetchError={fetchError} />
    </div>
  )
}
