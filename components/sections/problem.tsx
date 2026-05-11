import { Section } from '@/components/ui/section'
import { ProblemTrendChart } from './problem-trend-chart'
import { ProblemAEOAccordion } from './problem-aeo-accordion'

const definedTermJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'DefinedTerm',
  name: 'Trend window in Web3 and AI',
  description:
    'A trend window is the period between a market shift opening and the same shift dissolving — a new chain launch, a new agent paradigm, or a regulatory change. In Web3 and AI, these windows typically last four to eight weeks.',
  inDefinedTermSet: 'https://metaborong.com/#defined-terms',
}

export function ProblemSection() {
  return (
    <Section bg="default" maxWidth="wide" id="problem">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermJsonLd) }}
      />
      <div className="problem-card">
        <div className="problem-chrome" aria-hidden="true">
          <span className="problem-chrome-dot bg-[#d90429]" />
          <span className="problem-chrome-dot bg-[#ffba08]" />
          <span className="problem-chrome-dot bg-[#38b000]" />
          <span className="problem-chrome-label">THE TREND vs OUTPUT WINDOW</span>
        </div>

        <div className="problem-grid">
          <div className="problem-chart-wrap">
            <ProblemTrendChart />
          </div>
          <div className="problem-content">
            <span className="problem-chip">THE PROBLEM</span>
            <h2 className="problem-h2">
              The window opens fast. Most teams aren&apos;t built to move through it.
            </h2>
            <p className="problem-body">
              Web3 and AI move in windows, not roadmaps. By the time most teams are ready to build, the window has already closed.
            </p>
            <p className="problem-bridge">
              We ship inside the window — and build to last past it.
            </p>
          </div>
        </div>

        <span className="sr-only">
          Chart: three teams ship at week three, week five, and week eleven. Only Metaborong&apos;s week-five delivery lands inside the six-week trend window.
        </span>

        <ProblemAEOAccordion />
      </div>
    </Section>
  )
}
