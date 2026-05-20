import { Section } from '@/components/ui/section'
import { Button } from '@/components/ui/button'

export function ContactCtaSection() {
  return (
    <Section bg="default" maxWidth="xwide">
      <div className="relative isolate aspect-[16/9] min-h-[440px] w-full overflow-hidden">
        {/* Background image (Figma Super-Visuals node 1:19) */}
        <img
          src="/contact/landscape.webp"
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="pointer-events-none absolute inset-0 -z-20 h-full w-full select-none object-cover"
        />
        {/* Centered dark vignette so white text clears AA over the bright sky
            and white cloud clusters; image breathes at the edges. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse 70% 55% at center, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.32) 55%, rgba(0,0,0,0) 88%)',
          }}
        />
        {/* Content */}
        <div className="flex h-full flex-col items-center justify-center px-[16px] text-center">
          <div className="max-w-[640px]">
            <h2
              className="text-[clamp(34px,5vw,56px)] font-black uppercase leading-[1.03] tracking-[-0.03em] text-white"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.45)' }}
            >
              Got a project in mind?
            </h2>
            <p
              className="mx-auto mt-[20px] max-w-[600px] text-[16px] leading-[1.6] tracking-[-0.01em] text-white"
              style={{ textShadow: '0 1px 6px rgba(0,0,0,0.50)' }}
            >
              We build what large agencies under-deliver and freelancers can&apos;t architect, across Web3 protocols, AI agents, and SaaS products. Tell us what you are building. We will tell you how we would approach it — no pitch deck, no fluff, no commitment required.
            </p>
            <div className="mt-[32px] flex justify-center">
              <Button
                variant="primary"
                size="md"
                href="mailto:contact@metaborong.com?subject=New%20project%20inquiry"
                arrow="→"
                className="min-h-[44px]"
              >
                Start a conversation
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
