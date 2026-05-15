import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getDraftPostById } from '@/lib/posts'
import { getImageById } from '@/lib/images'
import { EditPostForm } from '@/components/admin/edit-post-form'
import { InfoTooltip } from '@/components/admin/info-tooltip'

export const metadata: Metadata = {
  title: 'Edit post',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

interface EditPageProps {
  params: Promise<{ id: string }>
}

export default async function AdminEditPostPage({ params }: EditPageProps) {
  const { id } = await params

  // The /admin layout has already gated by getAdminSession; getDraftPostById
  // returns drafts AND published posts, indifferent to status, because the
  // editor needs both views.
  const post = await getDraftPostById(id)
  if (!post) notFound()

  const [initialCover, initialOg] = await Promise.all([
    post.cover_image_id ? getImageById(post.cover_image_id) : Promise.resolve(null),
    post.og_image_id ? getImageById(post.og_image_id) : Promise.resolve(null),
  ])

  return (
    <div className="flex flex-col gap-[24px]">
      <header className="flex flex-wrap items-center justify-between gap-[12px]">
        <div>
          <p
            className="mb-[6px] text-[11px] font-medium uppercase tracking-[0.18em] text-gray"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            <Link href="/admin" className="text-gray no-underline hover:text-brand">
              Posts
            </Link>{' '}
            / Edit
          </p>
          <h1 className="text-[24px] font-bold tracking-[-0.025em] leading-[1.15] text-dark">
            {post.title || 'Untitled draft'}
          </h1>
        </div>
        <span className="inline-flex items-center gap-2">
          <Link
            href={`/admin/posts/${post.id}/preview`}
            target="_blank"
            rel="noopener"
            className="inline-flex h-[36px] items-center gap-2 rounded-md border border-border bg-white px-3 text-[13px] font-medium text-dark no-underline transition-colors duration-150 hover:border-brand/30 hover:text-brand focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Open standalone preview ↗
          </Link>
          <InfoTooltip
            info="Opens a full-bleed admin-only preview of the saved draft in a new tab. Useful for previewing on a phone or sharing with a teammate. The URL is admin-gated — unauthenticated visits redirect to /admin/login."
            label="Help: Open standalone preview"
            side="bottom-end"
          />
        </span>
      </header>

      <EditPostForm initialPost={post} initialCover={initialCover} initialOg={initialOg} />
    </div>
  )
}
