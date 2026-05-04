import { Section } from '@/components/ui/section'
import { Eyebrow } from '@/components/ui/eyebrow'

export function ProblemSection() {
  return (
    <Section bg="default" maxWidth="prose" id="problem">
      <div aria-hidden="true" className="w-[40px] h-[2px] bg-brand mb-[20px]" />

      <Eyebrow as="p">The problem</Eyebrow>

      <h2 className="mt-[24px] text-[clamp(32px,4vw,52px)] font-bold tracking-[-0.035em] leading-[1.05] text-dark">
        Building in Web3 and AI is still too hard
      </h2>

      <p className="mt-[32px] text-[16px] text-gray leading-[1.65] tracking-[-0.01em]">
        Most founders end up choosing between two bad options: a large agency that{' '}
        <strong className="font-medium text-dark">treats the project like a ticket in a queue</strong>
        , or a freelance team that lacks the architectural depth to ship something that scales. Either way, timelines slip and technical debt piles up before launch.
      </p>
    </Section>
  )
}
