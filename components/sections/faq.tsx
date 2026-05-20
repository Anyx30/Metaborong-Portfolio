import { Section } from '@/components/ui/section'
import { Eyebrow } from '@/components/ui/eyebrow'
import { FaqAccordion } from '@/components/sections/faq-accordion'

export function FaqSection() {
  return (
    <Section as="section" maxWidth="xwide">
      <div className="grid gap-[40px] md:grid-cols-[minmax(0,360px)_1fr] md:gap-[64px] lg:gap-[96px]">
        <div className="md:sticky md:top-[96px] md:self-start">
          <Eyebrow as="p" className="mb-[14px]">FAQ</Eyebrow>
          <h2 className="text-[clamp(28px,3.5vw,44px)] font-bold leading-[1.05] tracking-[-0.035em] text-dark">
            Frequently asked questions
          </h2>
          <div className="mt-[32px] hidden border border-border p-[24px] md:block">
            <p className="text-[15px] font-semibold leading-[1.4] tracking-[-0.02em] text-dark">
              Don&apos;t see your question?
            </p>
            <p className="mt-[8px] text-[14px] leading-[1.5] text-gray">
              Email the founders directly — first reply usually lands the same day.
            </p>
            <a
              href="mailto:contact@metaborong.com?subject=Question%20about%20your%20studio"
              className="mt-[18px] inline-flex items-center gap-[6px] text-[13px] font-semibold tracking-[-0.01em] text-dark underline decoration-gray-subtle underline-offset-[3px] transition-colors duration-200 hover:text-brand hover:decoration-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              contact@metaborong.com <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
        <FaqAccordion />
      </div>
    </Section>
  )
}
