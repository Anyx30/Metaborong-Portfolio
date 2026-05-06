// Next.js convention: app/robots.ts → /robots.txt.
//
// Two-mode output:
//   · production (NEXT_PUBLIC_VERCEL_ENV === 'production') →
//     allow-list rules with Disallow for /admin/, /api/, and the
//     standalone preview path. References /sitemap.xml.
//   · everywhere else (preview, development) → blanket "Disallow: /"
//     so test deploys never get indexed.

import type { MetadataRoute } from 'next'
import { SITE_ORIGIN } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  const isProd = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'

  if (!isProd) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
      // No sitemap reference in non-prod — robots that DO obey the
      // disallow may still ignore it for sitemap fetches; better not to
      // advertise a preview sitemap at all.
    }
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/admin/posts/*/preview',
        ],
      },
    ],
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
    host: SITE_ORIGIN,
  }
}
