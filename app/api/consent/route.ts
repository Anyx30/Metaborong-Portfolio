import { NextRequest, NextResponse } from 'next/server'

// POST /api/consent
//   body: { decision: 'accepted' | 'rejected' | 'reset' }
//
// - 'accepted' → set mb_consent=accepted (1y) and, if Vercel geo headers are
//   present, immediately set mb_geo so the client sees personalization on the
//   current page without waiting for the next request to traverse middleware.
// - 'rejected' → set mb_consent=rejected (1y); clear mb_geo if any.
// - 'reset'    → clear both cookies; banner re-appears on next render.

type Decision = 'accepted' | 'rejected' | 'reset'

const ONE_YEAR = 60 * 60 * 24 * 365

function setConsentCookie(res: NextResponse, value: 'accepted' | 'rejected') {
  res.cookies.set('mb_consent', value, {
    path:     '/',
    sameSite: 'lax',
    secure:   process.env.NODE_ENV === 'production',
    maxAge:   ONE_YEAR,
  })
}

export async function POST(req: NextRequest) {
  let body: { decision?: Decision } = {}
  try { body = await req.json() } catch {}

  const decision: Decision =
    body.decision === 'accepted' || body.decision === 'rejected' || body.decision === 'reset'
      ? body.decision
      : 'rejected'

  // In development, fall back to DEV_GEO_* env vars (set in .env.local) so the
  // geo path can be exercised on localhost without a Vercel preview deploy.
  const dev = process.env.NODE_ENV === 'development'
  const country = req.headers.get('x-vercel-ip-country')
                ?? (dev ? process.env.DEV_GEO_COUNTRY ?? '' : '')
  const region  = req.headers.get('x-vercel-ip-region')
                ?? (dev ? process.env.DEV_GEO_REGION  ?? '' : '')
  const city    = req.headers.get('x-vercel-ip-city')
                ?? (dev ? process.env.DEV_GEO_CITY    ?? '' : '')

  if (decision === 'reset') {
    const res = NextResponse.json({ decision: 'reset', geo: null })
    res.cookies.delete('mb_consent')
    res.cookies.delete('mb_geo')
    return res
  }

  const geo = decision === 'accepted' && (country || region || city)
    ? { country, region, city }
    : null

  const res = NextResponse.json({ decision, geo })
  setConsentCookie(res, decision)

  if (geo) {
    res.cookies.set('mb_geo', JSON.stringify(geo), {
      path:     '/',
      sameSite: 'lax',
      secure:   process.env.NODE_ENV === 'production',
      maxAge:   ONE_YEAR,
    })
  } else if (decision === 'rejected') {
    res.cookies.delete('mb_geo')
  }

  return res
}
