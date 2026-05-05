import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Posts',
  robots: { index: false, follow: false },
}

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-[32px]">
      <div className="flex items-end justify-between gap-[24px]">
        <div>
          <p
            className="mb-[6px] text-[11px] font-medium uppercase tracking-[0.18em] text-gray"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Dashboard
          </p>
          <h1 className="text-[32px] font-bold tracking-[-0.03em] leading-[1.1] text-dark">
            Posts
          </h1>
        </div>
        <button
          type="button"
          disabled
          aria-disabled="true"
          title="The post editor lands in M2."
          className="inline-flex h-[40px] items-center gap-2 rounded-md bg-brand px-4 text-[13px] font-semibold tracking-[-0.01em] text-white transition-opacity duration-150 disabled:cursor-not-allowed disabled:opacity-50"
        >
          New post
        </button>
      </div>

      <div className="rounded-xl border border-dashed border-border bg-white p-[64px] text-center">
        <p
          className="mb-[10px] text-[11px] font-medium uppercase tracking-[0.18em] text-gray-light"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Empty
        </p>
        <h2 className="mb-[8px] text-[20px] font-semibold tracking-[-0.02em] text-dark">
          No posts yet
        </h2>
        <p className="mx-auto max-w-[420px] text-[14px] leading-[1.55] tracking-[-0.005em] text-gray">
          Create your first one when the editor lands.
        </p>
      </div>
    </div>
  )
}
