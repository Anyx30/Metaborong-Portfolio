import { Section } from '@/components/ui/section'
import { Eyebrow } from '@/components/ui/eyebrow'
import { ServicesTrefoil } from '@/components/sections/services-trefoil'
import { ServicesMobile } from '@/components/sections/services-mobile'

export function ServicesSection() {
  return (
    <Section bg="subtle" maxWidth="wide" id="services">
      <div className="text-center max-w-[720px] mx-auto mb-[48px]">
        <Eyebrow as="p">What we build</Eyebrow>
        <h2 className="mt-[16px] text-[clamp(32px,4vw,52px)] font-bold tracking-[-0.035em] leading-[1.05] text-dark">
          A small, senior team. Three pillars. End to end.
        </h2>
        <p className="mt-[20px] text-[16px] text-gray leading-[1.65] tracking-[-0.01em]">
          We build what large agencies under-deliver and freelancers can't architect — across Web3 protocols, AI agents, and SaaS products. One team takes you from spec to production.
        </p>
      </div>
      <ServicesTrefoil className="hidden lg:grid" />
      <ServicesMobile className="lg:hidden" />
    </Section>
  )
}
