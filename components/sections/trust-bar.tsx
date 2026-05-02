const projects = ['KGeN', 'Bionic', 'DATA3 AI', 'Defiverse', 'GET Smart', 'SEDAX', 'Bayan', 'Memestakes Vault']

export function TrustBar() {
  const doubled = [...projects, ...projects]
  return (
    <section className="relative overflow-hidden border-y border-border bg-bg py-[24px] px-[24px] md:px-[48px] lg:px-[96px] xl:px-[128px]">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-[2] w-20 bg-gradient-to-r from-bg to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-[2] w-20 bg-gradient-to-l from-bg to-transparent" />
      <div className="flex w-max gap-[48px] animate-marquee">
        {doubled.map((name, i) => (
          <span
            key={i}
            className="text-sm font-medium text-gray tracking-[-0.01em] whitespace-nowrap"
          >
            {name}
          </span>
        ))}
      </div>
    </section>
  )
}
