import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Logo } from '@/components/ui/logo'
import { LoginForm } from '@/components/admin/login-form'

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-bg-subtle">
      <header className="flex h-14 items-center px-[24px] md:px-[48px] lg:px-[96px]">
        <Logo size="sm" href="/" />
      </header>
      <main className="flex flex-1 items-center justify-center px-[24px] py-[64px]">
        <div className="w-full max-w-[420px] rounded-xl border border-border bg-white p-[40px] shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
          <div className="mb-[28px]">
            <p
              className="mb-[10px] text-[11px] font-medium uppercase tracking-[0.18em] text-gray"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Metaborong CMS
            </p>
            <h1 className="text-[24px] font-bold tracking-[-0.025em] leading-[1.2] text-dark">
              Sign in to continue
            </h1>
            <p className="mt-[8px] text-[13px] leading-[1.5] tracking-[-0.005em] text-gray">
              Admin access only. Your session lasts 30 days.
            </p>
          </div>
          {/* useSearchParams() requires a Suspense boundary. */}
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
