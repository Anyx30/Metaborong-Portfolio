import { pillars } from '@/components/sections/services-data'
import { faqs } from '@/components/sections/faq-data'

export const dynamic = 'force-static'

export function GET() {
  const lines: string[] = []

  lines.push('# Metaborong')
  lines.push('')
  lines.push('> Metaborong is a Web3 development company and AI agent studio that builds DeFi protocols, autonomous AI systems, and custom SaaS products for founders and crypto-native teams across the US and Europe.')
  lines.push('')

  lines.push('## Key facts')
  lines.push('- Founded by three technical co-founders: Arnab Ray (CEO), Anik Ghosh (COO), Soumojit Ash (CTO).')
  lines.push('- Operates across the US and European markets.')
  lines.push('- Direct contact: contact@metaborong.com — no account managers, no pitch decks.')
  lines.push('- Typical project duration: 4–12 weeks; smart contract audits and AI integrations deliver in 4–6 weeks.')
  lines.push('- 8+ products shipped in production across DeFi, gaming, AI, and SaaS.')
  lines.push('- Three service pillars: Web3/Blockchain, AI Agents, and Product Studio.')
  lines.push('')

  lines.push('## Main pages')
  lines.push('- [Homepage](https://www.metaborong.com/): Studio overview, services, work, team, and FAQs.')
  lines.push('')

  lines.push('## Services')
  for (const p of pillars) {
    lines.push(`### ${p.label}`)
    lines.push(`${p.body}`)
    lines.push('')
    for (const c of p.children) {
      lines.push(`- **${c.name}** — ${c.description}`)
    }
    lines.push('')
  }

  lines.push('## Frequently asked questions')
  for (const f of faqs) {
    lines.push(`### ${f.q}`)
    lines.push(f.a)
    lines.push('')
  }

  lines.push('## Contact')
  lines.push('- Email: contact@metaborong.com')
  lines.push('- LinkedIn: https://linkedin.com/company/metaborong-technologies')
  lines.push('- X (Twitter): https://x.com/Metaborong')
  lines.push('')

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
