import { NextRequest, NextResponse } from 'next/server'

// Reads the visitor's consent cookie and, when consent === 'accepted', mirrors
// Vercel-edge geo headers into a `mb_geo` cookie that client code can read.
// When consent is rejected (or unset) we never store geo. Keeps the page
// statically prerenderable — middleware only writes cookies on responses,
// it doesn't transform the body.

export const config = {
  // Skip static assets and the consent API (which manages cookies itself).
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}

export function proxy(req: NextRequest) {
  const consent = req.cookies.get('mb_consent')?.value
  const res     = NextResponse.next()

  if (consent === 'accepted') {
    // Vercel's edge sets these headers for incoming requests with geo data.
    // Local dev / non-Vercel hosts return null. In development, we fall back
    // to env vars (DEV_GEO_COUNTRY etc. in .env.local) so the geo path can be
    // exercised on localhost without a real preview deploy.
    const dev = process.env.NODE_ENV === 'development'
    const country = req.headers.get('x-vercel-ip-country')
                  ?? (dev ? process.env.DEV_GEO_COUNTRY ?? '' : '')
    const region  = req.headers.get('x-vercel-ip-region')
                  ?? (dev ? process.env.DEV_GEO_REGION  ?? '' : '')
    const city    = req.headers.get('x-vercel-ip-city')
                  ?? (dev ? process.env.DEV_GEO_CITY    ?? '' : '')

    if (country || region || city) {
      const next = JSON.stringify({ country, region, city })
      const existing = req.cookies.get('mb_geo')?.value
      if (existing !== next) {
        res.cookies.set('mb_geo', next, {
          path:     '/',
          sameSite: 'lax',
          secure:   process.env.NODE_ENV === 'production',
          maxAge:   60 * 60 * 24 * 365, // 1 year
        })
      }
    }
  } else if (req.cookies.has('mb_geo')) {
    // Defensive: if consent was withdrawn or rejected but a stale geo cookie
    // somehow exists, clear it.
    res.cookies.delete('mb_geo')
  }

  return res
}
