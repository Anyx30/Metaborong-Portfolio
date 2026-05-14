const reasons = [
  { tag: 'Speed',           color: '#296ff0', title: 'Speed that respects your runway',    body: 'We ship in weeks, not quarters. A lean, senior team means no account managers between you and the people writing code. Direct communication, fast decisions, fewer handoffs.' },
  { tag: 'Product thinking',color: '#F6851B', title: 'Product thinking, not just execution', body: 'We pressure-test assumptions before we write a line of code. If your spec has a gap, we name it. If a simpler approach would do the same job, we say so.' },
  { tag: 'Niche depth',     color: '#10b981', title: 'Niche depth where it counts',        body: 'Multichain Web3 architecture. DeFi primitives. AI agent orchestration. We go deep in the areas where generalist agencies stop.' },
]

export function WhyUsSection() {
  return (
    <section className="bg-bg-subtle px-[16px] py-[72px] sm:px-[24px] md:px-[48px] md:py-[88px] lg:px-[96px] lg:py-[96px] xl:px-[128px]">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-[40px] max-w-[560px] md:mb-[56px]">
          <p className="mb-[12px] text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-light">Why us</p>
          <h2 className="text-[clamp(32px,4vw,52px)] font-bold leading-[1.05] tracking-[-0.035em] text-dark">Why founders choose Metaborong</h2>
        </div>
        <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-2 lg:grid-cols-3 lg:gap-[24px]">
          {reasons.map(r => (
            <div key={r.tag} className="rounded-[12px] border border-border bg-white px-[20px] py-[24px] sm:px-[24px] sm:py-[28px] lg:px-[32px] lg:py-[36px]">
              <div className="mb-[18px] text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: r.color }}>{r.tag}</div>
              <h3 className="mb-[14px] text-[22px] font-bold leading-[1.2] tracking-[-0.025em] text-dark">{r.title}</h3>
              <p className="text-[14px] leading-[1.75] tracking-[-0.005em] text-gray">{r.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
