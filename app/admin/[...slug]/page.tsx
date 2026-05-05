import { notFound } from 'next/navigation'

// Catch-all under /admin so any unmatched nested path still routes through
// app/admin/layout.tsx — which means the auth gate redirects unauthenticated
// users to /admin/login?next=<path> before Next.js gets to decide the page
// is missing. Authenticated users land on app/admin/not-found.tsx.
export default function AdminCatchAll() {
  notFound()
}
