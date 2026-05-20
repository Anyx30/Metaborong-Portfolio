'use client'

import { useRef } from 'react'
import { Section } from '@/components/ui/section'
import { Eyebrow } from '@/components/ui/eyebrow'
import { ClutchWidget } from '@/components/sections/clutch-widget'
import { clutchProfileUrl } from '@/lib/links'

const rating = '4.9'
const reviewCount = '9'

// Curated review IDs surfaced by the official Clutch widget (type 8). The widget
// renders the live versions client-side; the 3 verbatim cards below are the
// SSR-crawlable / no-JS fallback. Per-review deep-links are not exposed by
// Clutch's URL surface — cards link to the profile root.
const clutchReviewIds = '457842,454740,453781,439014,438481,437747'

const quotes = [
  {
    quote: 'Their implementation and prompt product delivery stood out.',
    name: 'Executive',
    company: 'Sedax Data Solutions Private Limited',
    project: 'Blockchain & IT Support for ID Authentication Software Co',
    url: clutchProfileUrl,
  },
  {
    quote: 'They had great teamwork and the ability to understand and adapt to the business problems.',
    name: 'President',
    company: 'Digital Financial Aid Corporation',
    project: 'Web App Development for Gamified Learning Platform',
    url: clutchProfileUrl,
  },
  {
    quote: 'All works were delivered within the promised deadlines with proper deliverables.',
    name: 'Executive',
    company: 'SBS Construction',
    project: 'AI Development for Construction & Consulting Firm',
    url: clutchProfileUrl,
  },
]

// Decorative stars only — the section-level rating is announced by the sr-only
// outbound link ("Metaborong is rated 4.9 out of 5 on Clutch …"). The repeated
// per-card stars are aria-hidden to avoid redundant SR noise.
const Stars = ({ size = 13 }: { size?: number }) => (
  <span aria-hidden="true" className="inline-flex gap-[2px] leading-none text-[#F6851B]" style={{ fontSize: size }}>
    {'★★★★★'}
  </span>
)

export function TestimonialsSection() {
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <Section bg="subtle" maxWidth="xwide">
      <div className="mb-[24px] md:mb-[32px]">
        <Eyebrow as="p" className="mb-[12px]">Social proof</Eyebrow>
        <h2 className="text-[clamp(28px,3.5vw,44px)] font-bold tracking-[-0.035em] text-dark">Reviewed and verified on Clutch</h2>
        <p className="mt-[16px] max-w-[640px] text-[16px] leading-[1.65] tracking-[-0.01em] text-gray">
          Nine verified clients have rated our work on Clutch. Three of them, in their own words.
        </p>
      </div>

      {/* SEO + a11y fallback: crawlable static line announcing the rating, followed by the aria-hidden official widget. */}
      <a href={clutchProfileUrl} target="_blank" rel="noopener noreferrer" className="sr-only">
        Metaborong is rated {rating} out of 5 on Clutch, based on {reviewCount} verified reviews.
      </a>

      <div className="mb-[24px] overflow-hidden rounded-[12px] border border-border bg-white px-[20px] py-[18px] sm:px-[28px] sm:py-[20px]">
        <ClutchWidget widgetType="8" height={300} reviews={clutchReviewIds} className="w-full min-h-[300px]" />
      </div>

      <div className="relative mt-[24px] [--cw:calc(100vw-32px)] sm:[--cw:calc(100vw-48px)]">
        <div
          ref={scrollRef}
          role="region"
          aria-label="Client reviews"
          tabIndex={0}
          className="flex overflow-x-auto snap-x snap-mandatory gap-[16px] lg:grid lg:grid-cols-3 lg:gap-[20px] pb-[24px] -mx-[16px] px-[16px] sm:-mx-[24px] sm:px-[24px] lg:mx-0 lg:px-0 lg:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          {quotes.map((q, i) => (
            <div
              key={i}
              className="snap-center snap-always shrink-0 w-[calc(100vw-32px)] sm:w-[calc(100vw-48px)] lg:w-auto lg:max-w-none flex"
            >
              <a
                href={q.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full flex-col gap-[16px] rounded-[12px] border border-border bg-white p-[20px] no-underline text-inherit sm:p-[24px] lg:p-[28px] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                <div className="flex items-center justify-between gap-[12px]">
                  <Stars />
                  <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-gray-light">Verified · Clutch</span>
                </div>
                <p className="flex-1 text-[15px] italic leading-[1.7] tracking-[-0.01em] text-dark">&ldquo;{q.quote}&rdquo;</p>
                <div>
                  <div className="text-[14px] font-semibold tracking-[-0.01em] text-dark">{q.name}, {q.company}</div>
                  <div className="mt-[2px] text-[12px] leading-[1.5] text-gray">{q.project}</div>
                </div>
                <span aria-hidden="true" className="text-[13px] font-semibold tracking-[-0.005em] text-brand">Read on Clutch →</span>
              </a>
            </div>
          ))}
        </div>

        {/* Floating swipe hint arrow (Left) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute lg:hidden text-gray opacity-80 motion-safe:animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"
          style={{
            top: 'calc(50% - 12px)',
            left: 'calc(var(--cw) * 0.04)',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="square" strokeLinejoin="miter">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </div>

        {/* Floating swipe hint arrow (Right) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute lg:hidden text-gray opacity-80 motion-safe:animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"
          style={{
            top: 'calc(50% - 12px)',
            right: 'calc(var(--cw) * 0.04)',
            transform: 'translate(50%, -50%)',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="square" strokeLinejoin="miter">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
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
