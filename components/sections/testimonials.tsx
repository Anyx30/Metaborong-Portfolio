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
  // Split-screen layout: header column (eyebrow + H2 + lede + section CTA) sits
  // left at lg+; the Clutch widget sits right. Stacks vertically below lg. White
  // section bg (matches Founders below + the iframe's internal bg) so the widget
  // reads as a continuation of the section, not a separate card.
  return (
    <Section bg="default" maxWidth="xwide">
      <div className="grid grid-cols-1 gap-[40px] lg:grid-cols-2 lg:items-start lg:gap-[64px]">
        <div className="flex flex-col">
          <Eyebrow as="p" className="mb-[12px]">Social proof</Eyebrow>
          <h2 className="max-w-[440px] text-[clamp(28px,3.5vw,44px)] font-bold tracking-[-0.035em] text-dark">Reviewed and verified on Clutch</h2>
          <p className="mt-[16px] max-w-[480px] text-[16px] leading-[1.65] tracking-[-0.01em] text-gray">
            Nine verified clients have rated our work on Clutch — read each review on our profile.
          </p>
          <div className="mt-[24px] flex items-center gap-[16px]">
            <span className="text-[36px] font-bold leading-none tracking-[-0.03em] text-dark tabular-nums">{rating}</span>
            <span aria-hidden="true" className="text-[18px] leading-none text-[#F6851B]">{'★★★★★'}</span>
            <span className="text-[13px] leading-[1.4] text-gray">{reviewCount} verified<br />Clutch reviews</span>
          </div>
          <a
            href={clutchProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-[24px] inline-flex w-fit items-center text-[14px] font-semibold tracking-[-0.005em] text-brand no-underline"
          >
            View all reviews on Clutch →
          </a>
        </div>

        {/* The visible badge below carries the rating + count as crawlable, JS-free,
            always-rendered trust content. The official Clutch widget loads on top
            (its iframe is opaque), so when Clutch's CDN serves the live carousel
            this badge is hidden behind it; when the widget fails (CDN bot-challenge,
            ad-blocker, no-JS), the badge remains visible. */}
        <div className="relative w-full">
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
          <ClutchWidget widgetType="8" height={220} reviews={clutchReviewIds} className="relative w-full" />
        </div>
      </div>
    </Section>
  )
}
