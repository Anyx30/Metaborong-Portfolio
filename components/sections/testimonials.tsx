'use client'

// TODO: fill the [TODO: …] placeholders below from the Clutch profile.
//   - rating + reviewCount: current aggregate values
//   - quotes[]: 3 best Clutch reviews with verbatim quote, reviewer name, company, and deep-link to the specific review

import { useEffect, useRef } from 'react'
import { clutchProfileUrl } from '@/lib/links'

const rating = '[TODO: 4.9]'
const reviewCount = '[TODO: 12]'

const quotes = [
  { quote: '[TODO: paste top Clutch quote 1 verbatim]', name: '[TODO: Name]', company: '[TODO: Company]', url: '[TODO: deep-link to this review on Clutch]' },
  { quote: '[TODO: paste top Clutch quote 2 verbatim]', name: '[TODO: Name]', company: '[TODO: Company]', url: '[TODO: deep-link to this review on Clutch]' },
  { quote: '[TODO: paste top Clutch quote 3 verbatim]', name: '[TODO: Name]', company: '[TODO: Company]', url: '[TODO: deep-link to this review on Clutch]' },
]

const Stars = ({ size = 13 }: { size?: number }) => (
  <span aria-label="5 out of 5 stars" className="inline-flex gap-[2px] leading-none text-[#F6851B]" style={{ fontSize: size }}>
    {'★★★★★'}
  </span>
)

export function TestimonialsSection() {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.innerWidth >= 1024) return
    const container = scrollRef.current
    if (!container) return
    // Jump to middle set if we were doing infinite scroll, but we just have 3 items here.
    // So no need to jump, just let it start at the beginning.
  }, [])

  return (
    <section className="bg-bg-subtle px-[16px] py-[56px] sm:px-[24px] md:px-[48px] md:py-[72px] lg:px-[96px] lg:py-[80px] xl:px-[128px]">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-[24px] md:mb-[32px]">
          <p className="mb-[12px] text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-light">Social proof</p>
          <h2 className="text-[clamp(28px,3.5vw,44px)] font-bold tracking-[-0.035em] text-dark">Reviewed and verified on Clutch</h2>
        </div>

        <a
          href={clutchProfileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-[24px] flex flex-wrap items-center gap-[16px] rounded-[12px] border border-border bg-white px-[20px] py-[18px] no-underline text-dark sm:gap-[24px] sm:px-[28px] sm:py-[20px]"
        >
          <span className="text-[14px] font-bold tracking-[-0.01em] text-[#17313E]">Clutch</span>
          <span className="inline-flex items-center gap-[8px]">
            <span className="text-[18px] font-bold tracking-[-0.02em]">{rating}</span>
            <Stars size={14} />
          </span>
          <span className="text-[13px] text-gray">Based on {reviewCount} verified reviews</span>
          <span className="ml-auto inline-flex items-center gap-[6px] text-[12px] font-semibold uppercase tracking-[0.02em] text-[#10b981]">
            <span aria-hidden="true">✓</span> Verified
          </span>
        </a>

        <div className="relative mt-[24px] [--cw:calc(100vw-32px)] sm:[--cw:calc(100vw-48px)]">
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto snap-x snap-mandatory gap-[16px] lg:grid lg:grid-cols-3 lg:gap-[20px] pb-[24px] -mx-[16px] px-[16px] sm:-mx-[24px] sm:px-[24px] lg:mx-0 lg:px-0 lg:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                  className="flex w-full flex-col gap-[16px] rounded-[12px] border border-border bg-white p-[20px] no-underline text-inherit sm:p-[24px] lg:p-[28px]"
                >
                  <Stars />
                  <p className="flex-1 text-[15px] italic leading-[1.7] tracking-[-0.01em] text-dark">&ldquo;{q.quote}&rdquo;</p>
                  <div>
                    <div className="text-[14px] font-semibold tracking-[-0.01em] text-dark">{q.name}</div>
                    <div className="text-[12px] text-gray">{q.company}</div>
                  </div>
                  <span className="text-[13px] font-semibold tracking-[-0.005em] text-brand">Read on Clutch →</span>
                </a>
              </div>
            ))}
          </div>

          {/* Floating swipe hint arrow (Left) */}
          <div 
            className="pointer-events-none absolute lg:hidden text-gray opacity-80 motion-safe:animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"
            style={{
              top: 'calc(50% - 12px)',
              left: 'calc(var(--cw) * 0.04)',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="square" strokeLinejoin="miter">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </div>

          {/* Floating swipe hint arrow (Right) */}
          <div 
            className="pointer-events-none absolute lg:hidden text-gray opacity-80 motion-safe:animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"
            style={{
              top: 'calc(50% - 12px)',
              right: 'calc(var(--cw) * 0.04)',
              transform: 'translate(50%, -50%)'
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
            className="text-[14px] font-semibold tracking-[-0.005em] text-brand no-underline"
          >
            View all reviews on Clutch →
          </a>
        </div>
      </div>
    </section>
  )
}
