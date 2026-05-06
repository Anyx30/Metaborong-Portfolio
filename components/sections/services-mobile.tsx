import { Card } from '@/components/ui/card'
import { pillars } from '@/components/sections/services-data'

type Props = {
  className?: string
}

export function ServicesMobile({ className = '' }: Props) {
  return (
    <ul className={`flex flex-col gap-6 list-none p-0 m-0 ${className}`}>
      {pillars.map((p) => (
        <Card
          key={p.id}
          as="li"
          variant="featured"
          accentColor={p.color}
          className="!hover:translate-y-0 !hover:border-border"
        >
          <div
            className="text-[11px] font-bold tracking-[0.1em] uppercase mb-[20px]"
            style={{ color: p.color }}
          >
            {p.label}
          </div>
          <h3 className="text-[20px] font-bold tracking-[-0.025em] leading-[1.2] text-dark mb-[14px]">
            {p.headline}
          </h3>
          <p className="text-[14px] text-gray leading-[1.75] tracking-[-0.005em] mb-[24px]">
            {p.body}
          </p>
          <ul className="flex flex-col gap-[12px] list-none p-0 m-0 mb-[24px]">
            {p.children.map((c) => (
              <li key={c.slug}>
                <a
                  href={`${p.hubHref}${c.slug}/`}
                  className="group flex flex-col gap-[2px] no-underline"
                >
                  <span
                    className="flex items-center gap-[6px] text-[14px] font-semibold text-dark group-hover:text-[var(--hover-color)]"
                    style={{ ['--hover-color' as string]: p.color }}
                  >
                    {c.name}
                    <span aria-hidden="true">→</span>
                  </span>
                  <span className="text-[13px] text-gray leading-[1.5]">
                    {c.description}
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <a
            href={p.hubHref}
            className="text-[14px] font-semibold tracking-[-0.01em] no-underline"
            style={{ color: p.color }}
          >
            {p.hubCta} →
          </a>
        </Card>
      ))}
    </ul>
  )
}
