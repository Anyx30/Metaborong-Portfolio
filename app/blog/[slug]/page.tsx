import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { Nav } from '@/components/layout/nav'
import { PostView } from '@/components/blog/post-view'
import { getPostBySlug } from '@/lib/posts'
import { resolveRegion } from '@/lib/geo'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

// Same revalidate window as the index — see PRD §5.4.
export const revalidate = 60

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const region = resolveRegion(await headers())
  const post = await getPostBySlug(slug, region)
  if (!post) return { title: 'Not found', robots: { index: false, follow: false } }

  const title = post.meta_title ?? post.title
  const description = post.meta_description ?? post.excerpt ?? undefined
  // Canonical URL is always the base — geo variants share one URL per
  // PRD §5.6 (avoids SEO duplication).
  const canonical = post.canonical_url ?? `https://www.metaborong.com/blog/${post.slug}/`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: 'article',
      url: canonical,
      // og_image_id resolution lands in M4 / M5 (next/og fallback).
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      authors: post.author_url ? [post.author_url] : [post.author_name],
      tags: post.tags,
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const region = resolveRegion(await headers())

  // Returns null for drafts AND missing posts; both surface as 404 so we
  // never leak draft existence to the public.
  const post = await getPostBySlug(slug, region)
  if (!post) notFound()

  return (
    <>
      <Nav />
      <main className="bg-bg pt-[80px]">
        <PostView post={post} />
      </main>
    </>
  )
}
