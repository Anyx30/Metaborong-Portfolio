type Client = {
  name: string
  src: string
  href: string
  scale?: number
  /** Source asset is white-on-transparent — must stay silhouetted in both states or it goes invisible on the white bg. */
  keepSilhouette?: boolean
  /** Source asset is a dense / fully-opaque badge — `brightness(0)` would flatten the whole rectangle to black. Use grayscale instead. */
  softMute?: boolean
}

const clients: Client[] = [
  { name: 'KGEN',       src: '/clients/kgen.svg',       href: 'https://kgen.io/',           keepSilhouette: true },
  { name: 'GetSmart',   src: '/clients/getsmart.png',   href: 'https://get-smart.net/',     scale: 1.25, softMute: true },
  { name: 'Nero',       src: '/clients/nero.svg',       href: 'https://nerochain.io/',      keepSilhouette: true },
  { name: 'Sedax',      src: '/clients/sedax.svg',      href: 'https://www.sedax.in/' },
  { name: 'DDAF',       src: '/clients/ddaf.svg',       href: 'https://www.ddaf.io/',       scale: 0.7 },
  { name: 'Near',       src: '/clients/near.svg',       href: 'https://near.org/' },
  { name: 'Diamante',   src: '/clients/diamante.svg',   href: 'https://www.diamante.io/' },
  { name: 'OrbitX',     src: '/clients/orbitx.svg',     href: 'https://orbitxpay.com/' },
  { name: 'PredictRAM', src: '/clients/predictram.svg', href: 'https://predictram.com/' },
  { name: 'magic',      src: '/clients/magic.svg',      href: 'https://omagic.ai/' },
]

const CELL_WIDTH = 180
const CELL_HEIGHT = 64
const CAP_HEIGHT = 38

export function TrustBar() {
  const doubled = [...clients, ...clients]
  return (
    <section
      aria-label="Selected clients"
      className="relative overflow-hidden border-y border-border bg-bg py-[36px] px-[24px] md:px-[48px] lg:px-[96px] xl:px-[128px]"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-[2] w-24 bg-gradient-to-r from-bg to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-[2] w-24 bg-gradient-to-l from-bg to-transparent" />
      <ul className="flex w-max items-center gap-[8px] animate-marquee m-0 p-0 list-none">
        {doubled.map((c, i) => {
          const cap = Math.round(CAP_HEIGHT * (c.scale ?? 1))
          const revealClasses = c.keepSilhouette
            ? '[filter:brightness(0)] hover:[filter:brightness(0)] focus-visible:[filter:brightness(0)]'
            : c.softMute
              ? '[filter:grayscale(1)] hover:[filter:none] focus-visible:[filter:none]'
              : '[filter:brightness(0)] hover:[filter:none] focus-visible:[filter:none]'
          return (
            <li key={`${c.name}-${i}`} className="shrink-0">
              <a
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${c.name} — visit site`}
                className="group flex items-center justify-center rounded-md opacity-60 transition-opacity duration-200 ease-out hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                style={{ width: CELL_WIDTH, height: CELL_HEIGHT }}
              >
                <img
                  src={c.src}
                  alt={c.name}
                  draggable={false}
                  loading="lazy"
                  className={`select-none object-contain transition-[filter] duration-200 ease-out ${revealClasses}`}
                  style={{
                    maxHeight: cap,
                    maxWidth: CELL_WIDTH - 16,
                  }}
                />
              </a>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
