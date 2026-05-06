// Per-post markdown export. Crawled by LLM ingestion pipelines (Perplexity,
// ChatGPT search, etc.) for clean grounding without HTML noise. The full
// /llms-full.txt bundle lands in v1.5+; this route is the GEO foundation
// per PRD §5.7.
//
// Reachable at /blog/{slug}/raw.md. Returns:
//   · 200 text/markdown for a published post
//   · 404 text/plain for a missing post or one that's been unpublished
//
// The same getPostBySlug() helper used by /blog/[slug]/page.tsx so a draft
// or 404 here matches what the public reader sees.

import { headers } from 'next/headers'
import { getPostBySlug } from '@/lib/posts'
import { resolveRegion } from '@/lib/geo'
import { blocksToMarkdown } from '@/lib/blocks-to-md'

export const revalidate = 60

interface Ctx {
  params: Promise<{ slug: string }>
}

export async function GET(_req: Request, ctx: Ctx): Promise<Response> {
  const { slug } = await ctx.params
  const region = resolveRegion(await headers())
  const post = await getPostBySlug(slug, region)

  if (!post) {
    return new Response('post not found\n', {
      status: 404,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    })
  }

  const body = serializePost(post.title, post)

  return new Response(body, {
    status: 200,
    headers: {
      'content-type': 'text/markdown; charset=utf-8',
      'cache-control': 'public, s-maxage=60, stale-while-revalidate=3600',
    },
  })
}

// Header front-matter keeps the file machine-parseable: every line above
// the first blank-line break is a "Key: value" field, and everything below
// is the post body in markdown. LLMs can read either half cleanly.
function serializePost(title: string, post: import('@/lib/blog-schema').Post): string {
  const headerLines = [`# ${title}`]
  if (post.excerpt) headerLines.push('', post.excerpt)
  const meta: string[] = []
  meta.push(`Published: ${post.published_at ?? post.created_at}`)
  meta.push(`Updated: ${post.updated_at}`)
  meta.push(`Author: ${post.author_name}${post.author_url ? ` <${post.author_url}>` : ''}`)
  if (post.tags.length > 0) meta.push(`Tags: ${post.tags.join(', ')}`)
  meta.push(`Canonical: ${post.canonical_url ?? `https://www.metaborong.com/blog/${post.slug}/`}`)
  return [
    headerLines.join('\n'),
    '',
    meta.join('\n'),
    '',
    blocksToMarkdown(post.content_json),
    '',
  ].join('\n')
}
