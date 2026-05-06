'use client'

// Reusable image picker modal — drives every M4 image-selection affordance
// (cover, og, inline image block). Two tabs: Library (paginated grid backed
// by GET /api/admin/images) and Upload (drag-drop + clipboard + file
// picker, posting to POST /api/admin/images).
//
// Behaviors that live here, per dispatch:
//   · Esc closes; aria-modal=true; focus trap on Tab / Shift+Tab.
//   · Library grid: 4 cols on lg, 2 on md, 1 on <md. role="list" + tiles
//     with role="listitem". Cursor pagination via "Load more".
//   · Upload: drag-drop hover state, paste-from-clipboard (image data + URL
//     fallback), file picker. Real onProgress bar. 415 / 413 / generic
//     errors surfaced inline; the file stays selected so the user can retry.
//   · Alt-required gate: "Use" button stays disabled until alt is non-empty
//     (aria-required="true" on the input + visible asterisk).
//   · On select from Library: emits the row to onSelect immediately.
//   · After upload: optimistically prepends the new image into Library and
//     auto-selects it; admin then enters alt + clicks Use, which PATCHes
//     the alt up before emitting.
//
// The component does NOT mutate the post itself — that's the parent's job
// via onSelect. We treat alt + focal entirely on the image row (PATCH
// /api/admin/images/[id]) so future inline blocks reuse the same image
// without re-uploading.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { ApiError, CsrfMissingError, NetworkError, api } from '@/lib/api-client'
import type { Image as ImageRow } from '@/lib/blog-schema'

export type PickerMode = 'cover' | 'og' | 'inline'

interface ImagePickerProps {
  open: boolean
  mode: PickerMode
  onClose: () => void
  onSelect: (image: ImageRow) => void
}

interface ListResponse {
  images: ImageRow[]
  nextCursor: string | null
}

interface UploadResponse {
  image: ImageRow
}

type LibraryStatus =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready' }

type UploadStatus =
  | { kind: 'idle' }
  | { kind: 'reading'; filename: string }
  | { kind: 'uploading'; filename: string; loaded: number; total: number }
  | { kind: 'success'; image: ImageRow }
  | { kind: 'error'; message: string }

const MODE_TITLE: Record<PickerMode, string> = {
  cover:  'Choose cover image',
  og:     'Choose social (OG) image',
  inline: 'Choose image',
}

const ACCEPTED_MIME = ['image/jpeg', 'image/png', 'image/webp']
const ACCEPT_ATTR = ACCEPTED_MIME.join(',')
const MAX_BYTES = 8 * 1024 * 1024

export function ImagePicker({ open, mode, onClose, onSelect }: ImagePickerProps) {
  const [tab, setTab] = useState<'library' | 'upload'>('library')

  // Library state
  const [items, setItems] = useState<ImageRow[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [libraryStatus, setLibraryStatus] = useState<LibraryStatus>({ kind: 'idle' })
  const [loadingMore, setLoadingMore] = useState(false)

  // Upload state
  const [upload, setUpload] = useState<UploadStatus>({ kind: 'idle' })
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [altDraft, setAltDraft] = useState('')
  const [savingAlt, setSavingAlt] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  // Refs for focus management
  const containerRef = useRef<HTMLDivElement | null>(null)
  const closeBtnRef = useRef<HTMLButtonElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const altInputRef = useRef<HTMLInputElement | null>(null)

  // ── Reset when reopening ──
  useEffect(() => {
    if (!open) return
    setTab('library')
    setUpload({ kind: 'idle' })
    setPendingFile(null)
    setAltDraft('')
    setSavingAlt(false)
    setDragActive(false)
  }, [open])

  // ── Initial library fetch on open ──
  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLibraryStatus({ kind: 'loading' })
    setItems([])
    setCursor(null)
    api
      .get<ListResponse>('/api/admin/images')
      .then((res) => {
        if (cancelled) return
        setItems(res.images)
        setCursor(res.nextCursor)
        setLibraryStatus({ kind: 'ready' })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setLibraryStatus({ kind: 'error', message: errorToMessage(err, 'Could not load images.') })
      })
    return () => { cancelled = true }
  }, [open])

  // ── Esc to close + focus trap ──
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const root = containerRef.current
      if (!root) return
      const focusables = Array.from(
        root.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]):not([type=hidden]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null || el === document.activeElement)
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement as HTMLElement | null
      if (e.shiftKey) {
        if (active === first || !root.contains(active)) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (active === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Focus the close button on open so screen readers announce the dialog.
  useEffect(() => {
    if (!open) return
    requestAnimationFrame(() => closeBtnRef.current?.focus())
  }, [open])

  // ── Paste-from-clipboard ──
  useEffect(() => {
    if (!open || tab !== 'upload') return
    function onPaste(e: ClipboardEvent) {
      const dt = e.clipboardData
      if (!dt) return
      // (a) image data items.
      for (const item of Array.from(dt.items)) {
        if (item.kind === 'file' && ACCEPTED_MIME.includes(item.type)) {
          const file = item.getAsFile()
          if (file) {
            e.preventDefault()
            void startUpload(file)
            return
          }
        }
      }
      // (b) URL fallback — fetch the URL, validate type, upload as File.
      const text = dt.getData('text/plain').trim()
      if (text && /^https?:\/\//i.test(text)) {
        e.preventDefault()
        void uploadFromUrl(text)
      }
    }
    document.addEventListener('paste', onPaste)
    return () => document.removeEventListener('paste', onPaste)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tab])

  const startUpload = useCallback(async (file: File) => {
    setUpload({ kind: 'reading', filename: file.name })
    setPendingFile(file)
    setAltDraft('')

    // Client-side gates so the user gets instant feedback instead of waiting
    // for the server's 413 / 415. Server still enforces these defensively.
    if (!ACCEPTED_MIME.includes(file.type)) {
      setUpload({ kind: 'error', message: `Only JPG, PNG, or WebP. Got ${file.type || 'unknown'}.` })
      return
    }
    if (file.size > MAX_BYTES) {
      setUpload({ kind: 'error', message: 'Files must be under 8MB.' })
      return
    }

    const fd = new FormData()
    fd.append('file', file, file.name)

    setUpload({ kind: 'uploading', filename: file.name, loaded: 0, total: file.size })
    try {
      const res = await api.postMultipart<UploadResponse>('/api/admin/images', fd, {
        onProgress: (loaded, total) => {
          setUpload((prev) => prev.kind === 'uploading'
            ? { ...prev, loaded, total: total || prev.total }
            : prev)
        },
      })
      // Optimistic insert into Library so the user sees their upload there
      // immediately even before they click Use.
      setItems((prev) => [res.image, ...prev.filter((it) => it.id !== res.image.id)])
      setUpload({ kind: 'success', image: res.image })
      requestAnimationFrame(() => altInputRef.current?.focus())
    } catch (err) {
      setUpload({ kind: 'error', message: errorToMessage(err, 'Upload failed.') })
    }
  }, [])

  const uploadFromUrl = useCallback(async (url: string) => {
    try {
      setUpload({ kind: 'reading', filename: url })
      const res = await fetch(url, { mode: 'cors' })
      if (!res.ok) throw new Error(`Fetch returned ${res.status}`)
      const blob = await res.blob()
      const filename = url.split('/').pop()?.split('?')[0] || 'pasted-image'
      const file = new File([blob], filename, { type: blob.type })
      await startUpload(file)
    } catch {
      setUpload({ kind: 'error', message: 'Could not fetch the pasted URL. CORS or network blocked it.' })
    }
  }, [startUpload])

  const onPickedFile = useCallback((file: File | null | undefined) => {
    if (!file) return
    void startUpload(file)
  }, [startUpload])

  const onLoadMore = useCallback(async () => {
    if (!cursor || loadingMore) return
    setLoadingMore(true)
    try {
      const res = await api.get<ListResponse>(`/api/admin/images?cursor=${encodeURIComponent(cursor)}`)
      setItems((prev) => {
        const seen = new Set(prev.map((p) => p.id))
        const merged = [...prev]
        for (const img of res.images) if (!seen.has(img.id)) merged.push(img)
        return merged
      })
      setCursor(res.nextCursor)
    } catch (err) {
      setLibraryStatus({ kind: 'error', message: errorToMessage(err, 'Could not load more images.') })
    } finally {
      setLoadingMore(false)
    }
  }, [cursor, loadingMore])

  const handleConfirmUpload = useCallback(async () => {
    if (upload.kind !== 'success') return
    if (altDraft.trim().length === 0) return
    setSavingAlt(true)
    try {
      // Persist alt back to the row so this image carries it permanently.
      const patched = await api.patch<{ image: ImageRow }>(
        `/api/admin/images/${upload.image.id}`,
        { alt: altDraft.trim() },
      )
      // Reflect the alt update in the Library list.
      setItems((prev) => prev.map((it) => (it.id === patched.image.id ? patched.image : it)))
      onSelect(patched.image)
      onClose()
    } catch (err) {
      setUpload({ kind: 'error', message: errorToMessage(err, 'Could not save alt text.') })
    } finally {
      setSavingAlt(false)
    }
  }, [upload, altDraft, onSelect, onClose])

  const handleSelectFromLibrary = useCallback((img: ImageRow) => {
    onSelect(img)
    onClose()
  }, [onSelect, onClose])

  const dragHandlers = useMemo(() => ({
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(true)
    },
    onDragEnter: (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setDragActive(true)
    },
    onDragLeave: (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      // Only clear when actually leaving the dropzone, not when crossing
      // an inner child border.
      if (e.currentTarget.contains(e.relatedTarget as Node | null)) return
      setDragActive(false)
    },
    onDrop: (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
      const file = e.dataTransfer.files?.[0] ?? null
      if (file) onPickedFile(file)
    },
  }), [onPickedFile])

  if (!open) return null

  const altRequiredOk = upload.kind === 'success' && altDraft.trim().length > 0

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-picker-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-canvas/60 px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={containerRef}
        className="flex h-[min(720px,90vh)] w-full max-w-[920px] flex-col rounded-xl border border-border bg-white shadow-[0_24px_64px_rgba(0,0,0,0.12)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-border px-[24px] py-[16px]">
          <h2
            id="image-picker-title"
            className="text-[18px] font-bold tracking-[-0.025em] text-dark"
          >
            {MODE_TITLE[mode]}
          </h2>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close image picker"
            className="inline-flex h-[32px] w-[32px] items-center justify-center rounded-md border border-transparent text-gray transition-colors duration-150 hover:border-border hover:text-dark focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        {/* Tabs */}
        <div role="tablist" aria-label="Picker tabs" className="flex gap-1 border-b border-border px-[24px]">
          <TabButton selected={tab === 'library'} onClick={() => setTab('library')}>Library</TabButton>
          <TabButton selected={tab === 'upload'} onClick={() => setTab('upload')}>Upload</TabButton>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-[24px] py-[20px]">
          {tab === 'library' ? (
            <LibraryGrid
              items={items}
              status={libraryStatus}
              cursor={cursor}
              loadingMore={loadingMore}
              onLoadMore={onLoadMore}
              onSelect={handleSelectFromLibrary}
            />
          ) : (
            <UploadPane
              dragActive={dragActive}
              dragHandlers={dragHandlers}
              upload={upload}
              pendingFile={pendingFile}
              fileInputRef={fileInputRef}
              altInputRef={altInputRef}
              altDraft={altDraft}
              setAltDraft={setAltDraft}
              savingAlt={savingAlt}
              altRequiredOk={altRequiredOk}
              onPickedFile={onPickedFile}
              onConfirm={handleConfirmUpload}
              onRetry={() => {
                if (pendingFile) void startUpload(pendingFile)
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ── sub-components ───────────────────────────────────────────────────────────

function TabButton({ selected, onClick, children }: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onClick}
      className={[
        'relative h-[40px] px-3 text-[13px] font-medium tracking-[-0.005em] transition-colors duration-150',
        'focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
        selected ? 'text-brand' : 'text-gray hover:text-dark',
      ].join(' ')}
    >
      {children}
      {selected ? (
        <span aria-hidden="true" className="absolute bottom-[-1px] left-0 right-0 h-[2px] rounded-full bg-brand" />
      ) : null}
    </button>
  )
}

function LibraryGrid({
  items, status, cursor, loadingMore, onLoadMore, onSelect,
}: {
  items: ImageRow[]
  status: LibraryStatus
  cursor: string | null
  loadingMore: boolean
  onLoadMore: () => void
  onSelect: (img: ImageRow) => void
}) {
  if (status.kind === 'loading') {
    return (
      <div className="flex h-full items-center justify-center text-[13px] text-gray-light">Loading images…</div>
    )
  }
  if (status.kind === 'error') {
    return (
      <div role="alert" className="rounded-md border border-[#fda29b] bg-[#fef3f2] px-3 py-2 text-[13px] text-[#b42318]">
        {status.message}
      </div>
    )
  }
  if (items.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
        <p className="text-[15px] font-medium text-dark">No images yet — upload your first.</p>
        <p className="text-[13px] text-gray">Switch to the Upload tab.</p>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-4">
      <ul role="list" className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {items.map((img) => (
          <li key={img.id} role="listitem" className="group flex flex-col gap-2 rounded-lg border border-border bg-white p-2 transition-colors hover:border-brand/30">
            <div className="relative aspect-square w-full overflow-hidden rounded-md border border-border bg-bg-subtle">
              <Image
                src={img.blob_url}
                alt={img.alt || img.filename}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover"
                style={{ objectPosition: `${img.focal_x * 100}% ${img.focal_y * 100}%` }}
              />
            </div>
            <p className="truncate text-[12px] text-dark" title={img.filename}>{img.filename}</p>
            <button
              type="button"
              onClick={() => onSelect(img)}
              className="inline-flex h-[32px] items-center justify-center rounded-md border border-border bg-white text-[12px] font-medium text-dark transition-colors duration-150 hover:border-brand/30 hover:text-brand focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Select
            </button>
          </li>
        ))}
      </ul>
      {cursor ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="inline-flex h-[36px] items-center rounded-md border border-border bg-white px-3 text-[13px] font-medium text-dark transition-colors duration-150 hover:border-brand/30 disabled:opacity-60 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {loadingMore ? 'Loading…' : 'Load more'}
          </button>
        </div>
      ) : null}
    </div>
  )
}

function UploadPane({
  dragActive, dragHandlers, upload, pendingFile, fileInputRef, altInputRef,
  altDraft, setAltDraft, savingAlt, altRequiredOk, onPickedFile, onConfirm, onRetry,
}: {
  dragActive: boolean
  dragHandlers: {
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void
    onDragEnter: (e: React.DragEvent<HTMLDivElement>) => void
    onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void
  }
  upload: UploadStatus
  pendingFile: File | null
  fileInputRef: React.RefObject<HTMLInputElement | null>
  altInputRef: React.RefObject<HTMLInputElement | null>
  altDraft: string
  setAltDraft: (v: string) => void
  savingAlt: boolean
  altRequiredOk: boolean
  onPickedFile: (file: File | null | undefined) => void
  onConfirm: () => void
  onRetry: () => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <div
        {...dragHandlers}
        data-testid="image-picker-dropzone"
        data-drag-active={dragActive ? 'true' : 'false'}
        className={[
          'flex h-[180px] flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed text-center transition-colors duration-150',
          dragActive ? 'border-brand bg-[#f5f7ff]' : 'border-border bg-bg-subtle',
        ].join(' ')}
      >
        <p className="text-[14px] font-medium text-dark">
          {dragActive ? 'Drop to upload' : 'Drag & drop, or paste from clipboard'}
        </p>
        <p className="text-[12px] text-gray">JPG, PNG, or WebP. Up to 8 MB.</p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-1 inline-flex h-[34px] items-center rounded-md border border-border bg-white px-3 text-[13px] font-medium text-dark transition-colors duration-150 hover:border-brand/30 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Choose file
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT_ATTR}
          className="sr-only"
          onChange={(e) => onPickedFile(e.target.files?.[0])}
        />
      </div>

      {upload.kind === 'reading' ? (
        <p className="text-[12px] text-gray">Reading {truncate(upload.filename, 60)}…</p>
      ) : null}

      {upload.kind === 'uploading' ? (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[12px] text-gray">
            <span>Uploading {truncate(upload.filename, 40)}</span>
            <span>{Math.round((upload.loaded / Math.max(1, upload.total)) * 100)}%</span>
          </div>
          <div
            role="progressbar"
            aria-label="Upload progress"
            aria-valuemin={0}
            aria-valuemax={upload.total || 1}
            aria-valuenow={upload.loaded}
            className="h-[6px] overflow-hidden rounded-full bg-bg-subtle"
          >
            <div
              className="h-full rounded-full bg-brand transition-[width] duration-150"
              style={{ width: `${Math.min(100, Math.round((upload.loaded / Math.max(1, upload.total)) * 100))}%` }}
            />
          </div>
        </div>
      ) : null}

      {upload.kind === 'error' ? (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-md border border-[#fda29b] bg-[#fef3f2] px-3 py-2 text-[13px] text-[#b42318]">
          <span className="flex-1 min-w-0">{upload.message}</span>
          {pendingFile ? (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-md border border-[#fda29b] px-2 py-[2px] text-[12px] font-semibold text-[#b42318] hover:bg-[#fef3f2] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Retry
            </button>
          ) : null}
        </div>
      ) : null}

      {upload.kind === 'success' ? (
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-bg-subtle p-3">
          <div className="flex items-start gap-3">
            <div className="relative h-[80px] w-[80px] flex-shrink-0 overflow-hidden rounded-md border border-border bg-white">
              <Image
                src={upload.image.blob_url}
                alt={upload.image.alt || upload.image.filename}
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="truncate text-[13px] font-medium text-dark" title={upload.image.filename}>
                {upload.image.filename}
              </p>
              <p className="text-[11px] text-gray">
                {upload.image.width}×{upload.image.height}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="image-picker-alt"
              className="text-[11px] font-medium uppercase tracking-[0.08em] text-gray"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Alt text <span className="text-[#b42318]" aria-hidden="true">*</span>
            </label>
            <input
              ref={altInputRef}
              id="image-picker-alt"
              type="text"
              value={altDraft}
              onChange={(e) => setAltDraft(e.target.value)}
              aria-required="true"
              placeholder="Describe the image for screen readers"
              className="h-[36px] w-full rounded-md border border-border bg-white px-3 text-[13px] tracking-[-0.005em] text-dark placeholder:text-gray-light focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onConfirm}
              disabled={!altRequiredOk || savingAlt}
              className="inline-flex h-[36px] items-center rounded-md bg-brand px-3 text-[13px] font-semibold text-white transition-opacity duration-150 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {savingAlt ? 'Saving…' : 'Use'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

// ── helpers ─────────────────────────────────────────────────────────────────

function truncate(s: string, max: number): string {
  if (s.length <= max) return s
  return s.slice(0, max - 1) + '…'
}

function errorToMessage(err: unknown, fallback: string): string {
  if (err instanceof CsrfMissingError) return 'Session expired — sign in again.'
  if (err instanceof NetworkError) return 'Network error — try again.'
  if (err instanceof ApiError) return err.message || fallback
  return fallback
}
