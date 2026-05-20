'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { faqs } from '@/components/sections/faq-data'

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="border-t border-border">
      {faqs.map((faq, i) => {
        const isOpen = open === i
        return (
          <div key={i} className="border-b border-border">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${i}`}
              id={`faq-trigger-${i}`}
              className="flex min-h-[56px] w-full items-center justify-between gap-[16px] bg-transparent py-[20px] text-left [font-family:var(--font-brand)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <span className="text-[16px] font-semibold leading-[1.35] tracking-[-0.02em] text-dark sm:text-[17px]">
                {faq.q}
              </span>
              <ChevronDown
                size={18}
                aria-hidden="true"
                className={`shrink-0 text-gray transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            <div
              id={`faq-panel-${i}`}
              role="region"
              aria-labelledby={`faq-trigger-${i}`}
              hidden={!isOpen}
              className="pb-[20px] pr-[8px] sm:pr-[32px]"
            >
              <p className="text-[15px] leading-[1.7] tracking-[-0.01em] text-gray">{faq.a}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
