'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  { q: 'What does an AI and Blockchain Development Company do?', a: 'It builds AI systems, AI agents, and blockchain-based applications that solve real-world problems and operate at scale.' },
  { q: 'What makes Metaborong different?', a: 'We focus on production systems — not prototypes — designed for reliability, performance, and long-term usage.' },
  { q: 'What kind of AI systems do you build?', a: 'We build AI agents, RAG systems, automation pipelines, and generative AI applications for business use cases.' },
  { q: 'What kind of blockchain development do you offer?', a: 'We build DeFi platforms, smart contracts, token systems, and scalable Web3 infrastructure.' },
]

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section style={{ padding: '96px 80px', background: '#fff' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#999999', fontWeight: 600, marginBottom: 12 }}>FAQ</p>
          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 700, letterSpacing: '-0.035em', color: '#303030' }}>Frequently asked questions</h2>
        </div>
        <div style={{ borderTop: '1px solid #e5e7eb' }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <button onClick={() => setOpen(open === i ? null : i)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 16, fontFamily: 'var(--font-brand)' }}
                aria-expanded={open === i}
              >
                <span style={{ fontSize: 16, fontWeight: 600, color: '#303030', letterSpacing: '-0.02em', lineHeight: 1.3 }}>{faq.q}</span>
                <ChevronDown size={18} style={{ color: '#676767', flexShrink: 0, transform: open === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
              {open === i && (
                <div style={{ paddingBottom: 20, paddingRight: 32 }}>
                  <p style={{ fontSize: 15, color: '#676767', lineHeight: 1.7, letterSpacing: '-0.01em' }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
