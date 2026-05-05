import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Logo } from '@/components/ui/logo'
import { SignOutButton } from '@/components/admin/sign-out-button'
import { getAdminSession } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
}

// `x-pathname` is set by middleware.ts so this server layout can know which
// admin route the user actually requested (Next.js doesn't expose pathname
// to server components otherwise).
async function currentPathname(): Promise<string> {
  const h = await headers()
  const path = h.get('x-pathname')
  if (path && path.startsWith('/')) return path
  return '/admin'
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const path = await currentPathname()
  // The login route must NOT be gated — it's the way back in.
  const isLoginRoute = path.startsWith('/admin/login')

  if (!isLoginRoute) {
    const session = await getAdminSession()
    if (!session) {
      const next = encodeURIComponent(path || '/admin')
      redirect(`/admin/login?next=${next}`)
    }
  }

  if (isLoginRoute) {
    // Unauthenticated chrome — no top bar, no sign-out. Just render the
    // login page directly.
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-bg-subtle">
      <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur-md">
        <div className="flex h-14 items-center justify-between px-[24px] md:px-[48px] lg:px-[96px]">
          <Logo size="sm" href="/admin" />
          <SignOutButton />
        </div>
      </header>
      <main className="px-[24px] md:px-[48px] lg:px-[96px] py-[48px]">
        <div className="mx-auto max-w-[1120px]">{children}</div>
      </main>
    </div>
  )
}
