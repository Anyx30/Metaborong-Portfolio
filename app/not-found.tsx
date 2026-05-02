import { Nav } from '@/components/layout/nav'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Page Not Found',
}

export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="min-h-[70vh] bg-bg-subtle flex items-center justify-center px-6 py-24">
        <div className="max-w-2xl text-center">
          <p className="text-sm text-gray uppercase tracking-[0.15em] mb-4">
            Error 404
          </p>
          <h1 className="text-[clamp(40px,5vw,72px)] font-bold tracking-[-0.04em] leading-[1.02] text-dark mb-6">
            NEED TO FIX CONTENT
          </h1>
          <p className="text-base text-gray leading-[1.6] max-w-[480px] mx-auto mb-8">
            NEED TO FIX CONTENT &mdash; placeholder body copy. Content team to replace with the real 404 voice that matches Metaborong&apos;s tone.
          </p>
          <Button href="/">Back to home</Button>
        </div>
      </main>
      <Footer />
    </>
  )
}
