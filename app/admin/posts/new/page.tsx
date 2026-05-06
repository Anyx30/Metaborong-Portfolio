import type { Metadata } from 'next'
import { NewPostForm } from '@/components/admin/new-post-form'

export const metadata: Metadata = {
  title: 'New post',
  robots: { index: false, follow: false },
}

export default function AdminNewPostPage() {
  return (
    <div className="mx-auto flex max-w-[560px] flex-col gap-[32px]">
      <header>
        <p
          className="mb-[6px] text-[11px] font-medium uppercase tracking-[0.18em] text-gray"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          New post
        </p>
        <h1 className="text-[28px] font-bold tracking-[-0.03em] leading-[1.1] text-dark">
          Start a draft
        </h1>
        <p className="mt-[8px] text-[14px] leading-[1.55] tracking-[-0.005em] text-gray">
          Pick a title — we&rsquo;ll generate a slug and drop you into the editor.
        </p>
      </header>
      <NewPostForm />
    </div>
  )
}
