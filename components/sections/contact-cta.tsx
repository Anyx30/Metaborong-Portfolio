import { Section } from '@/components/ui/section'

export function ContactCtaSection() {
  return (
    <Section bg="default" maxWidth="xwide">
      <div className="relative isolate text-center">
        {/* Decorative ASCII-hills raster, anchored to the content-box bottom.
            Figma 233:261 (frame ≈ content width, not viewport-bleed). Static,
            aria-hidden; section is fully legible on bg-bg without it. */}
        <img
          src="/contact/ascii-hills.webp"
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="pointer-events-none absolute inset-x-0 bottom-[-48px] -z-10 mx-auto w-full select-none object-cover object-bottom md:bottom-[-64px] lg:bottom-[-72px]"
        />
        <div className="mx-auto max-w-[640px]">
          <h2 className="text-[clamp(34px,5vw,56px)] font-black uppercase leading-[1.03] tracking-[-0.03em] text-dark">
            Tell us the build. We&apos;ll send the approach.
          </h2>
          <p className="mx-auto mt-[20px] max-w-[560px] text-[16px] leading-[1.6] tracking-[-0.01em] text-gray">
            No pitch deck, no discovery-call gauntlet — a written approach to your Web3 or AI build, straight from a founder.
          </p>
          <div className="mt-[32px] flex flex-col items-center gap-[16px]">
            <a
              href="mailto:contact@metaborong.com?subject=New%20project%20inquiry"
              className="group inline-flex min-h-[44px] items-stretch justify-center text-[15px] font-semibold tracking-[-0.01em] text-white no-underline [font-feature-settings:'tnum'] transition-[background-color] duration-[var(--duration-instant)]"
            >
              <span className="flex items-center bg-brand px-[22px] py-[12px] group-hover:bg-brand/90 group-active:bg-brand/85">
                Email us
              </span>
              <span
                aria-hidden="true"
                className="flex items-center border-l border-white/15 bg-white/10 px-[16px] py-[12px] group-hover:bg-white/15"
              >
                →
              </span>
            </a>
            <p className="text-[13px] tracking-[-0.005em] text-gray-light">
              Most teams hear back within 12 hours.
            </p>
          </div>
          <a
            href="mailto:contact@metaborong.com"
            className="mt-[20px] inline-block text-[14px] tracking-[-0.01em] text-gray no-underline transition-[color] duration-[var(--duration-instant)] hover:text-dark"
          >
            contact@metaborong.com
          </a>
        </div>
      </div>
    </Section>
  )
}
