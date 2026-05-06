import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getDraftPostById } from '@/lib/posts'
import { getImagesByIds } from '@/lib/images'
import { PostView } from '@/components/blog/post-view'
import type { Block } from '@/lib/blog-schema'

// Defensive: cookies should never let a screenshot tool index this page,
// but the meta tag is belt-and-braces. The /admin/layout.tsx auth gate
// also redirects unauthenticated visitors to /admin/login?next=…
export const metadata: Metadata = {
  title: 'Preview',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

interface PreviewPageProps {
  params: Promise<{ id: string }>
}

export default async function AdminPreviewPage({ params }: PreviewPageProps) {
  const { id } = await params

  const post = await getDraftPostById(id)
  if (!post) notFound()

  const imageIds = collectImageIds(post.content_json, post.cover_image_id)
  const imageMap = await getImagesByIds(imageIds)
  const resolveImage = (imgId: string) => imageMap.get(imgId) ?? null

  // Renders through the SHARED PostView — same DOM the public route uses,
  // so what previews is what publishes. The draftBanner makes it clear
  // this is not a live URL.
  return (
    <div className="min-h-screen bg-bg">
      <PostView
        post={post}
        resolveImage={resolveImage}
        draftBanner={post.status !== 'published'}
      />
    </div>
  )
}

function collectImageIds(blocks: Block[], cover: string | null): string[] {
  const seen = new Set<string>()
  if (cover) seen.add(cover)
  for (const b of blocks) {
    if (b.type === 'image' && b.data.imageId) seen.add(b.data.imageId)
  }
  return Array.from(seen)
}
