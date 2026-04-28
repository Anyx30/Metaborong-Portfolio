'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  { q: 'What is Metaborong?', a: 'Metaborong is a Web3 development company and AI agent studio based in the US and Europe. It builds DeFi protocols, autonomous AI systems, and custom SaaS products for founders, crypto-native teams, and enterprises. The studio is run by three technical co-founders.' },
  { q: 'What Web3 services does Metaborong offer?', a: 'Metaborong offers DeFi protocol development, smart contract security audits, NFT marketplace development, crypto wallet development (custodial and non-custodial), token launchpad infrastructure, liquid staking vault architecture, and DAO governance systems — across multiple blockchain networks.' },
  { q: 'What AI agent services does Metaborong provide?', a: 'Metaborong builds agentic AI systems, generative AI applications, RAG and knowledge retrieval systems, voice agent integrations, AI workflow automation, and AI integration into existing software stacks. The studio works with LLMs, multi-agent orchestration frameworks, and enterprise AI tooling.' },
  { q: 'How long does a typical project take?', a: 'Most projects run four to twelve weeks depending on scope. DeFi protocol builds and full SaaS platforms take longer; smart contract audits, AI integrations, and scoped agent builds typically deliver within four to six weeks.' },
  { q: 'Who does Metaborong work with?', a: 'Metaborong primarily works with early-stage founders and startup teams building Web3 or AI products. It also works with crypto-native projects needing specialist development capacity and with enterprises integrating blockchain or AI into existing systems.' },
  { q: 'How is Metaborong different from larger Web3 agencies?', a: 'Metaborong is a small senior team, not a managed agency. Founders communicate directly with the people writing code. The studio ships faster than larger agencies, integrates AI natively into Web3 builds, and treats every project with co-builder accountability rather than contractor execution.' },
  { q: 'Where is Metaborong based?', a: 'Metaborong operates across the US and European markets. The founding team is reachable at contact@metaborong.com for initial conversations about any project.' },
  { q: 'Does Metaborong work on projects outside Web3?', a: "Yes. Metaborong's Product Studio pillar builds custom Web2 SaaS platforms independently of blockchain or AI components. Clients who need a full-stack technical team for a pure SaaS build can engage Metaborong through the Product Studio track." },
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
