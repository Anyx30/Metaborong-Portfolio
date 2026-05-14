import { Reveal } from '@/components/ui/reveal'

type Client = {
  name: string
  src: string
  href: string
  scale?: number
  /** Source asset is white-on-transparent — must stay silhouetted in both states or it goes invisible on the white bg. */
  keepSilhouette?: boolean
  /** Source asset is a dense / fully-opaque badge — `brightness(0)` would flatten the whole rectangle to black. Use grayscale instead. */
  softMute?: boolean
  /** Manually colorize a white logo using mask-image on hover */
  customColor?: string
}

const clients: Client[] = [
  { name: 'KGEN',       src: '/clients/kgen.svg',       href: 'https://kgen.io/',           scale: 1.4, customColor: '#CCFF00' },
  { name: 'GetSmart',   src: '/clients/getsmart.png',   href: 'https://get-smart.net/',     scale: 1.2, softMute: true },
  { name: 'Nero',       src: '/clients/nero.svg',       href: 'https://nerochain.io/',      keepSilhouette: true, scale: 1.4 },
  { name: 'Sedax',      src: '/clients/sedax.svg',      href: 'https://www.sedax.in/',      scale: 0.8 },
  { name: 'DDAF',       src: '/clients/ddaf.svg',       href: 'https://www.ddaf.io/',       scale: 1.2 },
  { name: 'Near',       src: '/clients/near.svg',       href: 'https://near.org/',          scale: 1.3 },
  { name: 'Diamante',   src: '/clients/diamante.svg',   href: 'https://www.diamante.io/',   scale: 1.3, customColor: '#B026FF' },
  { name: 'OrbitX',     src: '/clients/orbitx.svg',     href: 'https://orbitxpay.com/',     scale: 1.1 },
  { name: 'PredictRAM', src: '/clients/predictram.png', href: 'https://predictram.com/',    scale: 1.5, softMute: true },
  { name: 'Magic',      src: '/clients/magic.svg',      href: 'https://omagic.ai/',         scale: 1.2 },
]

export function TrustBar() {
  const doubled = [...clients, ...clients]
  return (
    <section
      aria-label="Selected clients"
      className="relative overflow-hidden border-y border-border bg-bg py-4 md:py-6 px-[24px] md:px-[48px] lg:px-[96px] xl:px-[128px]"
    >
      <Reveal>
      <ul className="flex w-max items-center gap-[48px] md:gap-[64px] lg:gap-[96px] animate-marquee m-0 p-0 list-none will-change-transform">
        {doubled.map((c, i) => {
          const cap = `calc(${c.scale ?? 1} * clamp(20px, 3.5vw, 32px))`
          const cellH = `clamp(40px, 6vw, 56px)`
          
          if (c.customColor) {
            return (
              <li key={`${c.name}-${i}`} className="shrink-0">
                <a
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${c.name} — visit site`}
                  className="group relative flex items-center justify-center rounded-md transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                  style={{ height: cellH }}
                >
                  {/* Invisible image forces the parent 'a' tag to automatically snap to the exact intrinsic layout width/height.
                      alt="" so screen readers don't double-announce — the visible mask-rendered logo is the accessible name carrier via the parent <a> aria-label. */}
                  <img
                    src={c.src}
                    alt=""
                    aria-hidden="true"
                    className="opacity-0 pointer-events-none select-none object-contain"
                    style={{ height: cap, width: 'auto' }}
                  />
                  {/* The mask-image div sits perfectly on top of the invisible image, completely eliminating math gaps! */}
                  <div
                    className="absolute inset-0 m-auto select-none transition-colors duration-200 ease-out bg-black/60 group-hover:bg-[var(--custom-color)]"
                    style={{
                      '--custom-color': c.customColor,
                      WebkitMaskImage: `url(${c.src})`,
                      WebkitMaskSize: 'contain',
                      WebkitMaskRepeat: 'no-repeat',
                      WebkitMaskPosition: 'center',
                      maskImage: `url(${c.src})`,
                      maskSize: 'contain',
                      maskRepeat: 'no-repeat',
                      maskPosition: 'center',
                      height: cap,
                      width: '100%',
                    } as React.CSSProperties}
                  />
                </a>
              </li>
            )
          }

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
                style={{ height: cellH }}
              >
                <img
                  src={c.src}
                  alt={c.name}
                  draggable={false}
                  loading="lazy"
                  className={`select-none object-contain transition-[filter] duration-200 ease-out ${revealClasses}`}
                  style={{
                    height: cap,
                    width: 'auto', // Let intrinsic width take over
                  }}
                />
              </a>
            </li>
          )
        })}
      </ul>
      </Reveal>
    </section>
  )
}

