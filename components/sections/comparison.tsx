import { Eyebrow } from '@/components/ui/eyebrow'
import { Section } from '@/components/ui/section'

type Row = { label: string; mb: string; large: string; free: string }

const rows: Row[] = [
  { label: 'Team access',                     mb: 'Founder-led, no account-manager layer',           large: 'Tiered through account managers',        free: 'Direct, varies by contractor' },
  { label: 'AI engineering depth',            mb: 'Production AI agents and RAG systems',            large: 'Add-on capability or partner-delivered', free: 'Limited, contractor-dependent' },
  { label: 'Multichain coverage',             mb: '7 chains — Ethereum, Solana, Base, Arbitrum, Hyperledger, Polygon, Avalanche', large: 'Generalist, scope varies', free: 'Limited to contractor experience' },
  { label: 'Delivery timeline',               mb: '4–12 weeks per engagement',                       large: '3–6 months or longer',                   free: 'Variable, project-dependent' },
  { label: 'Process and project management',  mb: 'Integrated across engineering, PM, and operations', large: 'Siloed across separate teams',         free: 'Ad hoc, project-dependent' },
  { label: 'Track record',                    mb: '25+ products in production',                      large: 'Hundreds of clients ✓',                  free: 'Portfolio varies by team' },
]

export function ComparisonSection() {
  return (
    <Section bg="default" maxWidth="xwide">
      <div className="mb-[24px] md:mb-[32px]">
        <Eyebrow as="p" className="mb-[12px] block">Comparison</Eyebrow>
        <h2 className="mb-[16px] text-[clamp(28px,3.5vw,44px)] font-bold tracking-[-0.035em] text-dark">
          How Metaborong&apos;s integrated Web3 and AI delivery compares to large agencies and freelance teams
        </h2>
        <p className="max-w-[760px] text-[16px] leading-[1.65] tracking-[-0.01em] text-gray">
          A side-by-side comparison of Metaborong — a lean Web3 and AI development studio with integrated delivery across engineering, project management, and operations — against large agencies and freelance teams.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[720px] w-full border-collapse text-[14px]">
          <caption className="sr-only">
            Comparison of Metaborong, large Web3 or AI agencies, and freelance teams across six dimensions: team access, AI engineering depth, multichain coverage, delivery timeline, process and project management, and track record.
          </caption>
          <thead>
            <tr className="border-b-2 border-border">
              <th scope="col" className="w-[22%] px-[16px] py-[12px] text-left text-[11px] font-bold uppercase tracking-[0.06em] text-gray-light">
                <span className="sr-only">Dimension</span>
              </th>
              <th scope="col" className="w-[26%] px-[16px] py-[12px] text-left text-[13px] font-bold text-brand">Metaborong</th>
              <th scope="col" className="w-[26%] px-[16px] py-[12px] text-left text-[13px] font-bold text-gray">Large Web3 or AI Agency</th>
              <th scope="col" className="w-[26%] px-[16px] py-[12px] text-left text-[13px] font-bold text-gray">Freelance Team</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.label} className={`border-b border-border-subtle ${i % 2 === 0 ? 'bg-bg-subtle/60' : 'bg-transparent'}`}>
                <th scope="row" className="px-[16px] py-[14px] text-left text-[13px] font-medium text-gray">{r.label}</th>
                <td className="px-[16px] py-[14px] font-semibold text-dark">{r.mb}</td>
                <td className="px-[16px] py-[14px] text-gray">{r.large}</td>
                <td className="px-[16px] py-[14px] text-gray">{r.free}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-[16px] max-w-[920px] text-[12px] leading-[1.6] text-gray">
        ✓ marks where the alternative has a structural advantage. Large agencies bring longer track records and procurement maturity. Metaborong&apos;s edge is integrated delivery — one senior team across engineering, project management, and operations, with fewer handoffs and faster decisions.
      </p>
    </Section>
  )
}
