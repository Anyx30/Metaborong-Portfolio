'use client'

import { useEffect, useRef, useState, type HTMLAttributes } from 'react'

interface RevealProps extends HTMLAttributes<HTMLDivElement> {
  /** Optional delay before the transition starts, in ms. Use sparingly for staggered reveals. */
  delay?: number
}

export function Reveal({ delay = 0, className = '', children, ...props }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) {
      setReduced(true)
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry], obs) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.unobserve(el)
        }
      },
      { rootMargin: '0px 0px 50px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={reduced ? undefined : { transitionDelay: `${delay}ms` }}
      className={`${
        reduced
          ? ''
          : `transition-[opacity,transform] duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
