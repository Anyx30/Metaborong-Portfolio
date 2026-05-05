import Link from 'next/link'

// Segment-scoped not-found page. Next.js renders this through
// app/admin/layout.tsx, which means the auth gate runs first — an
// unauthenticated visit to any nonexistent /admin/* path lands on the
// login redirect, not on the public not-found page. M2+ pages can
// override this file or rely on it as the catch-all.
export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-[64px] text-center">
      <p
        className="mb-[10px] text-[11px] font-medium uppercase tracking-[0.18em] text-gray-light"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        404
      </p>
      <h1 className="mb-[8px] text-[24px] font-bold tracking-[-0.025em] text-dark">
        Not found
      </h1>
      <p className="mb-[24px] max-w-[420px] text-[14px] leading-[1.55] tracking-[-0.005em] text-gray">
        The page you’re looking for doesn’t exist in the admin surface.
      </p>
      <Link
        href="/admin"
        className="inline-flex h-[40px] items-center rounded-md bg-brand px-4 text-[13px] font-semibold tracking-[-0.01em] text-white transition-opacity duration-150 hover:opacity-95"
      >
        Back to dashboard
      </Link>
    </div>
  )
}
