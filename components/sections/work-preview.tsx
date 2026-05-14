const projects = [
  { name: 'KGeN',               category: 'Web3 · Gaming', color: '#296ff0' },
  { name: 'DATA3 AI',           category: 'AI · Data',     color: '#10b981' },
  { name: 'Bionic',             category: 'Web3 · DeFi',   color: '#296ff0' },
  { name: 'Bayan — AI Chatbot', category: 'AI · Voice',    color: '#10b981' },
]

export function WorkPreviewSection() {
  return (
    <section className="bg-bg px-[16px] py-[72px] sm:px-[24px] md:px-[48px] md:py-[88px] lg:px-[96px] lg:py-[96px] xl:px-[128px]">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-[36px] flex flex-col gap-[18px] sm:mb-[48px] sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-[12px] text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-light">Our work</p>
            <h2 className="text-[clamp(32px,4vw,52px)] font-bold tracking-[-0.035em] text-dark">What we&apos;ve built</h2>
          </div>
          <a href="/#contact" className="inline-flex min-h-[44px] items-center text-[14px] font-semibold text-brand no-underline">Talk to us →</a>
        </div>
        <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-2 xl:grid-cols-4">
          {projects.map(p => (
            <div key={p.name} className="flex flex-col gap-[12px] rounded-[12px] border border-border px-[20px] py-[24px] sm:px-[24px] sm:py-[28px] lg:px-[28px] lg:py-[32px]">
              <div className="mb-[8px] h-[80px] rounded-[8px] bg-bg-subtle" />
              <div className="text-[11px] font-semibold uppercase tracking-[0.06em]" style={{ color: p.color }}>{p.category}</div>
              <h3 className="text-[18px] font-bold tracking-[-0.025em] text-dark">{p.name}</h3>
              <a href="/#contact" className="mt-auto inline-flex min-h-[44px] items-center text-[13px] font-medium text-brand no-underline">Read more →</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
