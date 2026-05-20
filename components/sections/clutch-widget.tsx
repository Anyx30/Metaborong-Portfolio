'use client'

import Script from 'next/script'

declare global {
  interface Window {
    CLUTCHCO?: { Init?: () => void }
  }
}

// Official Clutch widget (client-side iframe). Clutch's widget.js auto-inits
// on its own load event, which a deferred next/script misses — so re-scan the
// `.clutch-widget` div via CLUTCHCO.Init() once the script is ready. The crawlable
// / screen-reader proof is an sr-only static line in the parent section; this
// element is aria-hidden. Defaults match the Why-Us badge (type 2, h=45);
// Testimonials passes the type-8 reviews carousel (h=300, curated review IDs).
interface ClutchWidgetProps {
  widgetType?: '2' | '8'
  height?: number
  reviews?: string
  className?: string
}

export function ClutchWidget({
  widgetType = '2',
  height = 45,
  reviews,
  className,
}: ClutchWidgetProps = {}) {
  return (
    <div
      aria-hidden="true"
      inert
      className={className ?? 'w-[300px] max-w-full'}
      style={{ minHeight: height }}
    >
      <Script
        src="https://widget.clutch.co/static/js/widget.js"
        strategy="afterInteractive"
        onReady={() => window.CLUTCHCO?.Init?.()}
      />
      <div
        className="clutch-widget"
        data-url="https://widget.clutch.co"
        data-widget-type={widgetType}
        data-height={String(height)}
        data-nofollow="false"
        data-expandifr="true"
        data-scale="100"
        data-clutchcompany-id="2433707"
        {...(reviews ? { 'data-reviews': reviews } : {})}
      />
    </div>
  )
}
