'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export function PhraseStamp({ children }: Props) {
  const ref = useRef<HTMLElement | null>(null)
  const [played, setPlayed] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mql.matches) {
      setReducedMotion(true)
      setPlayed(true)
      return
    }

    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            observer.unobserve(entry.target)
            window.setTimeout(() => setPlayed(true), 600)
          }
        }
      },
      { rootMargin: '0px 0px -50px 0px', threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const base =
    'box-decoration-clone bg-[linear-gradient(to_right,var(--color-brand),var(--color-brand))] bg-no-repeat [background-position:0_100%]'
  const motion = reducedMotion
    ? 'transition-none'
    : '[transition:color_350ms_cubic-bezier(0.16,1,0.3,1),font-weight_350ms_cubic-bezier(0.16,1,0.3,1),background-size_500ms_cubic-bezier(0.16,1,0.3,1)]'
  const restState = played
    ? 'text-dark font-medium [background-size:100%_1px]'
    : 'text-gray font-normal [background-size:0%_1px]'

  return (
    <strong
      ref={ref}
      className={`${base} ${motion} ${restState}`}
    >
      {children}
    </strong>
  )
}
