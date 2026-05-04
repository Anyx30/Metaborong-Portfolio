'use client'

import { useEffect, useState } from 'react'
import { useConsent } from '@/lib/use-consent'

/**
 * Bottom-right consent banner. Renders only when there's no recorded decision.
 *
 * NEED LEGAL REVIEW — all visible copy in this component (banner body + button
 * labels) is placeholder language drafted without counsel. Replace with text
 * approved by a privacy lawyer before production launch.
 */
export function ConsentBanner() {
  const { decision, set } = useConsent()
  const [mounted, setMounted] = useState(false)
  const [busy, setBusy] = useState(false)

  // Only mount the banner UI after hydration so the SSR'd HTML matches the
  // client's first render (cookies aren't available during SSR).
  useEffect(() => { setMounted(true) }, [])

  if (!mounted || decision !== null) return null

  const handle = async (next: 'accepted' | 'rejected') => {
    setBusy(true)
    try { await set(next) } finally { setBusy(false) }
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-title"
      aria-describedby="consent-text"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-[60] bg-bg border border-border rounded-md shadow-lg p-5"
    >
      <p id="consent-title" className="text-xs uppercase tracking-[0.15em] text-gray mb-2">
        {/* NEED LEGAL REVIEW */}
        Privacy preferences
      </p>
      <p id="consent-text" className="text-sm text-dark mb-4 leading-snug">
        {/* NEED LEGAL REVIEW */}
        We use your approximate location (country, region, city) to lightly
        personalize this page. We derive it from your IP — either via our
        hosting platform&apos;s edge geo (no third party) or, where that
        isn&apos;t available, by sending your IP to <strong>ipapi.co</strong>
        {' '}for a one-time lookup that we cache in a cookie on your device.
        Nothing is stored on our servers, sold, profiled, or linked to your
        identity. You can change your mind any time.
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => handle('accepted')}
          disabled={busy}
          className="bg-brand text-white text-sm font-semibold px-4 py-2 rounded-md disabled:opacity-50"
        >
          {/* NEED LEGAL REVIEW */}
          Accept
        </button>
        <button
          type="button"
          onClick={() => handle('rejected')}
          disabled={busy}
          className="bg-bg-subtle text-dark text-sm font-semibold px-4 py-2 rounded-md border border-border disabled:opacity-50"
        >
          {/* NEED LEGAL REVIEW */}
          Reject
        </button>
      </div>
    </div>
  )
}

/**
 * Tiny pill that renders after a decision is recorded, letting the visitor
 * revoke consent (resets cookies, banner re-appears). Required for GDPR's
 * right-to-withdraw — consent must be as easy to revoke as to give.
 */
export function ConsentRevokePill() {
  const { decision, set } = useConsent()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted || decision === null) return null

  return (
    <button
      type="button"
      onClick={() => set('reset')}
      className="fixed bottom-4 left-4 z-[55] text-[11px] uppercase tracking-[0.15em] text-gray bg-bg/80 border border-border rounded-sm px-2 py-1 hover:text-dark"
      aria-label="Reset privacy preferences"
    >
      {/* NEED LEGAL REVIEW */}
      Privacy: {decision} · revoke
    </button>
  )
}
