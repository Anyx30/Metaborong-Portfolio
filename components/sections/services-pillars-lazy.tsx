'use client'

import dynamic from 'next/dynamic'

// Client-side lazy boundary for ServicesPillars. next/dynamic({ ssr: false })
// can only be invoked from a Client Component, so this thin wrapper is the
// boundary — the parent <ServicesSection> stays a Server Component and keeps
// its FAQ JSON-LD <script> in the static HTML.
//
// The skeleton reserves the same vertical footprint as the loaded component
// so the swap-in does not cause CLS.
const ServicesPillarsInner = dynamic(
  () => import('@/components/sections/services-pillars').then((m) => m.ServicesPillars),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden="true"
        className="mt-[48px] min-h-[600px] lg:mt-0 lg:min-h-[260vh] bg-white"
      />
    ),
  },
)

export function ServicesPillarsLazy() {
  return <ServicesPillarsInner />
}
