'use client'

import { useEffect, useState } from 'react'
import { useConsent } from './use-consent'

export interface GeoData {
  country:  string
  region:   string
  city:     string
  /** Signed degrees, 0 if unknown. Drives orb oblateness (squash by latitude). */
  latitude: number
}

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365

function readGeoCookie(): GeoData | null {
  if (typeof document === 'undefined') return null
  const m = document.cookie.match(/(?:^|;\s*)mb_geo=([^;]*)/)
  if (!m) return null
  try {
    const parsed = JSON.parse(decodeURIComponent(m[1])) as Partial<GeoData>
    if (typeof parsed?.country === 'string') {
      return {
        country:  parsed.country,
        region:   parsed.region  ?? '',
        city:     parsed.city    ?? '',
        latitude: typeof parsed.latitude === 'number' ? parsed.latitude : 0,
      }
    }
  } catch {}
  return null
}

function writeGeoCookie(geo: GeoData) {
  if (typeof document === 'undefined') return
  document.cookie =
    `mb_geo=${encodeURIComponent(JSON.stringify(geo))};` +
    ` path=/;` +
    ` max-age=${ONE_YEAR_SECONDS};` +
    ` samesite=lax`
}

/**
 * Returns the visitor's coarse geo (country/region/city) — only when consent
 * is 'accepted'. Sources, in priority order:
 *
 *   1. mb_geo cookie already set by the proxy / API route (Vercel-edge geo
 *      headers in production, DEV_GEO_* env vars in dev as an offline override).
 *   2. Client-side IP geolocation via ipapi.co — runs once per accepted session
 *      when (1) didn't produce a cookie. The browser fetch exits via the
 *      visitor's actual public IP (with VPN routing applied), so this is the
 *      only path that works for localhost + VPN testing.
 *
 * After (2) succeeds, the result is cached in the mb_geo cookie for a year
 * so subsequent page loads short-circuit on (1).
 *
 * NEED LEGAL REVIEW: the ipapi.co path sends the visitor's IP to a third-party
 * service. The consent banner copy must disclose this — see consent-banner.tsx.
 */
export function useGeo(): GeoData | null {
  const { decision } = useConsent()
  const [geo, setGeo] = useState<GeoData | null>(null)

  useEffect(() => {
    if (decision !== 'accepted') {
      setGeo(null)
      return
    }

    const fromCookie = readGeoCookie()
    if (fromCookie) {
      setGeo(fromCookie)
      return
    }

    let cancelled = false
    fetch('https://ipapi.co/json/', { headers: { Accept: 'application/json' } })
      .then(r => (r.ok ? r.json() : null))
      .then((data: unknown) => {
        if (cancelled || !data || typeof data !== 'object') return
        const d = data as Record<string, unknown>
        const next: GeoData = {
          country:  typeof d.country_code === 'string' ? d.country_code : '',
          region:   typeof d.region       === 'string' ? d.region       : '',
          city:     typeof d.city         === 'string' ? d.city         : '',
          latitude: typeof d.latitude     === 'number' ? d.latitude     : 0,
        }
        if (next.country || next.region || next.city) {
          writeGeoCookie(next)
          setGeo(next)
        }
      })
      .catch(() => { /* network down or rate-limited — silently degrade to no-geo */ })

    return () => { cancelled = true }
  }, [decision])

  return geo
}

// ── Region bucketing for orb auto-cycle bias ──────────────────────────────────
// Country ISO codes to coarse region. Used by orb-scene.tsx to skew which
// service nodes auto-feature. Out of any bucket → no bias (uniform random).

const AMERICAS = new Set([
  'US', 'CA', 'MX', 'BR', 'AR', 'CL', 'CO', 'PE', 'UY', 'VE',
])
const EMEA = new Set([
  'GB', 'DE', 'FR', 'NL', 'ES', 'IT', 'SE', 'NO', 'FI', 'DK',
  'IE', 'PT', 'AT', 'BE', 'CH', 'IS', 'PL', 'CZ', 'GR', 'EE',
  'AE', 'SA', 'IL', 'TR', 'ZA',
])
const APAC = new Set([
  'IN', 'SG', 'HK', 'JP', 'KR', 'ID', 'TH', 'MY', 'VN', 'PH',
  'AU', 'NZ', 'CN', 'TW', 'PK', 'BD', 'LK',
])

export type Region = 'americas' | 'emea' | 'apac' | 'other'

export function regionFor(country: string | null | undefined): Region {
  if (!country) return 'other'
  if (AMERICAS.has(country)) return 'americas'
  if (EMEA.has(country))     return 'emea'
  if (APAC.has(country))     return 'apac'
  return 'other'
}
