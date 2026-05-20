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

      {/* The visible badge below carries the rating + count as crawlable, JS-free,
          always-rendered trust content. The official Clutch widget loads on top
          (its iframe is opaque), so when Clutch's CDN serves the live carousel
          this badge is hidden behind it; when the widget fails (CDN bot-challenge,
          ad-blocker, no-JS), the badge remains visible. Container has no
          background of its own — the section's subtle bg shows through so widget
          + section read as a single block. */}
      <div className="relative">
        <a
          href={clutchProfileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 flex flex-col items-center justify-center gap-[12px] p-[24px] text-center no-underline text-inherit"
          aria-label={`Metaborong is rated ${rating} out of 5 on Clutch, based on ${reviewCount} verified reviews. View all reviews on Clutch.`}
        >
          <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-gray-light">Verified · Clutch</span>
          <span className="flex items-center gap-[12px]">
            <span className="text-[44px] font-bold leading-none tracking-[-0.03em] text-dark tabular-nums">{rating}</span>
            <span aria-hidden="true" className="text-[20px] leading-none text-[#F6851B]">{'★★★★★'}</span>
          </span>
          <span className="text-[14px] leading-[1.5] text-gray">Based on {reviewCount} verified Clutch reviews</span>
        </a>
        <ClutchWidget widgetType="8" height={220} reviews={clutchReviewIds} className="relative mx-auto w-full max-w-[900px]" />
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
