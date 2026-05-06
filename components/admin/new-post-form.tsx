'use client'

import { useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ApiError, NetworkError, api } from '@/lib/api-client'
import type { Post } from '@/lib/blog-schema'

export function NewPostForm() {
  const router = useRouter()
  const titleRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldError, setFieldError] = useState<'title' | 'slug' | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (busy) return

    const trimmed = title.trim()
    if (!trimmed) {
      setError('Title is required.')
      setFieldError('title')
      titleRef.current?.focus()
      return
    }
    if (trimmed.length > 200) {
      setError('Title must be 200 characters or fewer.')
      setFieldError('title')
      titleRef.current?.focus()
      return
    }

    setError(null)
    setFieldError(null)
    setBusy(true)
    try {
      const res = await api.post<{ post: Post }>('/api/admin/posts', { title: trimmed })
      router.push(`/admin/posts/${res.post.id}`)
      router.refresh()
    } catch (err) {
      if (err instanceof NetworkError) {
        setError('Network error, try again.')
      } else if (err instanceof ApiError) {
        // SLUG_CONFLICT here means the auto-derived slug collided with an
        // existing one; the editor will let the admin pick a different slug.
        setFieldError(err.field === 'title' || err.field === 'slug' ? err.field : null)
        setError(err.message)
      } else {
        setError('Could not create post. Please try again.')
      }
      setBusy(false)
      titleRef.current?.focus()
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-[20px]">
      <div className="flex flex-col gap-[6px]">
        <label
          htmlFor="new-post-title"
          className="text-[12px] font-medium uppercase tracking-[0.08em] text-gray"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Title
        </label>
        <input
          id="new-post-title"
          ref={titleRef}
          type="text"
          required
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={busy}
          aria-invalid={fieldError === 'title' || undefined}
          aria-describedby={error ? 'new-post-error' : undefined}
          autoFocus
          placeholder="What are you writing about?"
          className={`h-[44px] w-full rounded-md border bg-white px-3 text-[14px] tracking-[-0.005em] text-dark transition-colors duration-150 placeholder:text-gray-light focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
            fieldError === 'title' ? 'border-[#b42318]' : 'border-border hover:border-brand/30'
          }`}
        />
      </div>

      {error ? (
        <div
          id="new-post-error"
          role="alert"
          aria-live="polite"
          className="rounded-md border border-[#fda29b] bg-[#fef3f2] px-3 py-2 text-[13px] leading-[1.45] text-[#b42318] tracking-[-0.005em]"
        >
          {error}
        </div>
      ) : null}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => router.push('/admin')}
          disabled={busy}
          className="inline-flex h-[40px] items-center rounded-md border border-border bg-white px-3 text-[13px] font-medium text-dark transition-colors duration-150 hover:border-brand/30 disabled:opacity-60 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={busy}
          className="inline-flex h-[40px] items-center gap-2 rounded-md bg-brand px-4 text-[13px] font-semibold tracking-[-0.01em] text-white transition-opacity duration-150 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {busy ? (
            <>
              <span
                aria-hidden="true"
                className="inline-block h-[12px] w-[12px] animate-spin rounded-full border-2 border-white/40 border-t-white"
              />
              Creating…
            </>
          ) : (
            'Create draft'
          )}
        </button>
      </div>
    </form>
  )
}
