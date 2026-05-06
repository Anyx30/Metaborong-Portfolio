// Dynamic OG image route. Renders a 1200x630 PNG via next/og's
// ImageResponse so every published post has a shareable card without the
// editorial team needing to upload one.
//
// Usage:  /og?slug=<post-slug>
// Cached by edge per the response's Cache-Control headers (set by ImageResponse).

import { ImageResponse } from 'next/og'
import { getPostBySlug } from '@/lib/posts'

export const runtime = 'nodejs'
// Mark dynamic so the slug query param is honored on every request rather
// than being baked into a static export.
export const dynamic = 'force-dynamic'

const WIDTH = 1200
const HEIGHT = 630

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const slug = url.searchParams.get('slug')

  // Region is irrelevant for the OG card — we always show the base title.
  // OG previews render once per share-link and are not personalized.
  const post = slug ? await getPostBySlug(slug, 'OTHER') : null

  const title = post?.title ?? 'Metaborong'
  const tagline = post?.excerpt ?? 'Web3 protocols. AI agents. Custom SaaS.'
  const tags = post?.tags ?? []

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f5f7ff 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: '#204AF8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: 22,
            }}
          >
            M
          </div>
          <span
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: '#303030',
              letterSpacing: '-0.01em',
            }}
          >
            Metaborong
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <h1
            style={{
              fontSize: 64,
              lineHeight: 1.05,
              letterSpacing: '-0.035em',
              color: '#303030',
              fontWeight: 700,
              margin: 0,
              maxWidth: 1000,
            }}
          >
            {title}
          </h1>
          {tagline ? (
            <p
              style={{
                fontSize: 26,
                lineHeight: 1.4,
                letterSpacing: '-0.01em',
                color: '#676767',
                margin: 0,
                maxWidth: 1000,
              }}
            >
              {tagline}
            </p>
          ) : null}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            {tags.slice(0, 3).map((t) => (
              <span
                key={t}
                style={{
                  fontSize: 16,
                  color: '#204AF8',
                  background: '#eef1ff',
                  padding: '6px 14px',
                  borderRadius: 999,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                {t}
              </span>
            ))}
          </div>
          <span
            style={{
              fontSize: 16,
              color: '#999999',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            metaborong.com/blog
          </span>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
    },
  )
}
