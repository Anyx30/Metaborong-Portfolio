'use client'

import { Section } from '@/components/ui/section'
import { Eyebrow } from '@/components/ui/eyebrow'
import { ClutchWidget } from '@/components/sections/clutch-widget'
import { clutchProfileUrl } from '@/lib/links'

const rating = '4.9'
const reviewCount = '9'

// Curated review IDs surfaced by the official Clutch widget (type 8). The widget
// is the only review surface in the section — the prior hand-rolled card fallback
// duplicated the same quotes and was removed by user direction 2026-05-21.
const clutchReviewIds = '457842,454740,453781,439014,438481,437747'

export function TestimonialsSection() {
  // Section narrows to wide (1120) instead of xwide (1280) because the Clutch
  // type-8 iframe self-caps its internal grid at ~1100; matching the Section
  // content width to that cap keeps the H2 / lede / widget / CTA on the same
  // left edge with no dead right-side whitespace.
  return (
    <Section bg="subtle" maxWidth="wide">
      <div className="mb-[24px] md:mb-[32px]">
        <Eyebrow as="p" className="mb-[12px]">Social proof</Eyebrow>
        <h2 className="text-[clamp(28px,3.5vw,44px)] font-bold tracking-[-0.035em] text-dark">Reviewed and verified on Clutch</h2>
        <p className="mt-[16px] max-w-[640px] text-[16px] leading-[1.65] tracking-[-0.01em] text-gray">
          Nine verified clients have rated our work on Clutch.
        </p>
      </div>

      {/* SEO + a11y fallback: crawlable static line announcing the rating, followed by the aria-hidden official widget. */}
      <a href={clutchProfileUrl} target="_blank" rel="noopener noreferrer" className="sr-only">
        Metaborong is rated {rating} out of 5 on Clutch, based on {reviewCount} verified reviews.
      </a>

      <div className="rounded-[12px] border border-border bg-white">
        <ClutchWidget widgetType="8" height={420} reviews={clutchReviewIds} className="w-full" />
      </div>

      <div className="mt-[24px] text-center">
        <a
          href={clutchProfileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block py-[8px] text-[14px] font-semibold tracking-[-0.005em] text-brand no-underline"
        >
          View all reviews on Clutch →
        </a>
      </div>
    </Section>
  )
}
