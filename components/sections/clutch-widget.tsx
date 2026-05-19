'use client'

import Script from 'next/script'

declare global {
  interface Window {
    CLUTCHCO?: { Init?: () => void }
  }
}

// Official Clutch badge widget (client-side iframe). Clutch's widget.js auto-inits
// on its own load event, which a deferred next/script misses — so re-scan the
// `.clutch-widget` div via CLUTCHCO.Init() once the script is ready. The crawlable
// / screen-reader proof is an sr-only static line in why-us.tsx; this is aria-hidden.
export function ClutchWidget() {
  return (
    <div aria-hidden="true" inert className="min-h-[45px] w-[300px] max-w-full">
      <Script
        src="https://widget.clutch.co/static/js/widget.js"
        strategy="afterInteractive"
        onReady={() => window.CLUTCHCO?.Init?.()}
      />
      <div
        className="clutch-widget"
        data-url="https://widget.clutch.co"
        data-widget-type="2"
        data-height="45"
        data-nofollow="false"
        data-expandifr="true"
        data-scale="100"
        data-clutchcompany-id="2433707"
      />
    </div>
  )
}
