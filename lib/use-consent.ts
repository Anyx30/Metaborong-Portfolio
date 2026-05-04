'use client'

import { useCallback, useEffect, useState } from 'react'

export type ConsentDecision = 'accepted' | 'rejected' | null

const CONSENT_EVENT = 'mb-consent-changed'

function readConsent(): ConsentDecision {
  if (typeof document === 'undefined') return null
  const m = document.cookie.match(/(?:^|;\s*)mb_consent=([^;]*)/)
  if (!m) return null
  const v = decodeURIComponent(m[1])
  return v === 'accepted' || v === 'rejected' ? v : null
}

/**
 * Tracks the visitor's consent decision (cookie-backed). Multiple components
 * stay in sync via a custom-event broadcast on writes — no React context
 * needed for this small surface area. `set()` POSTs to /api/consent which
 * writes both `mb_consent` and (when accepted) `mb_geo` cookies in one round
 * trip, then dispatches the event so all subscribers re-read.
 */
export function useConsent(): {
  decision: ConsentDecision
  set: (decision: 'accepted' | 'rejected' | 'reset') => Promise<void>
} {
  const [decision, setDecision] = useState<ConsentDecision>(() => readConsent())

  useEffect(() => {
    const onChange = () => setDecision(readConsent())
    window.addEventListener(CONSENT_EVENT, onChange)
    return () => window.removeEventListener(CONSENT_EVENT, onChange)
  }, [])

  const set = useCallback(async (next: 'accepted' | 'rejected' | 'reset') => {
    await fetch('/api/consent', {
      method:  'POST',
      body:    JSON.stringify({ decision: next }),
      headers: { 'Content-Type': 'application/json' },
    })
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT))
  }, [])

  return { decision, set }
}
