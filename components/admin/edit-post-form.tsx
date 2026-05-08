'use client'

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ApiError, NetworkError, api } from '@/lib/api-client'
import {
  contentJsonSchema,
  slugRegex,
  tagRegex,
  validateContentJson,
  type Block,
  type GeoVariants,
  type Image as ImageRow,
  type Post,
} from '@/lib/blog-schema'
import { EditorShell } from '@/components/admin/editor/editor-shell'
import { AiReadinessButton } from '@/components/admin/editor/ai-readiness-button'
import { AiReadinessDrawer } from '@/components/admin/editor/ai-readiness-drawer'
import type { AiReadinessApiResponse } from '@/lib/ai-readiness/ui-types'
import { ImagePicker, type PickerMode } from '@/components/admin/images/image-picker'

type SaveState =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'saved'; at: number }
  | { kind: 'error'; message: string }

type Field = 'title' | 'slug' | 'excerpt' | 'tags' | 'author_name' | 'author_url' | 'meta_title' | 'meta_description' | 'cover_image_id' | 'og_image_id' | 'content_json'

// Variant tab key. 'OTHER' is used as the sentinel for the Base tab so the
// type matches GeoRegion exactly — keeps the preview-pane wiring simple.
export type ActiveVariant = 'OTHER' | 'US' | 'EU'

// The four post-level fields that can be overridden per region. cta_label /
// cta_href are reserved in the contract but no consumer renders them in
// v1.5; surfacing them here is deferred to v1.6. See handoff §9.
const VARIANT_FIELDS = ['title', 'excerpt', 'meta_title', 'meta_description'] as const
type VariantField = (typeof VARIANT_FIELDS)[number]

interface FormState {
  title: string
  slug: string
  excerpt: string
  tagsText: string  // comma-separated input; serialized to string[] before save
  author_name: string
  author_url: string
  meta_title: string
  meta_description: string
  cover_image_id: string
  og_image_id: string
  // The Tiptap editor owns the canonical Block[] state — held outside
  // FormState so editor re-renders don't rebuild every form input.
}

function postToFormState(p: Post): FormState {
  return {
    title:            p.title,
    slug:             p.slug,
    excerpt:          p.excerpt ?? '',
    tagsText:         p.tags.join(', '),
    author_name:      p.author_name,
    author_url:       p.author_url ?? '',
    meta_title:       p.meta_title ?? '',
    meta_description: p.meta_description ?? '',
    cover_image_id:   p.cover_image_id ?? '',
    og_image_id:      p.og_image_id ?? '',
  }
}

interface ValidationResult {
  ok: boolean
  errors: Partial<Record<Field, string>>
  parsedContent?: Block[]
  parsedTags?: string[]
}

function validate(state: FormState, blocks: Block[]): ValidationResult {
  const errors: Partial<Record<Field, string>> = {}

  const title = state.title.trim()
  if (!title) errors.title = 'Title is required.'
  else if (title.length > 200) errors.title = 'Title must be 200 characters or fewer.'
  else if (title !== state.title) errors.title = 'Title cannot have leading or trailing whitespace.'

  const slug = state.slug.trim()
  if (!slug) errors.slug = 'Slug is required.'
  else if (slug.length > 80) errors.slug = 'Slug must be 80 characters or fewer.'
  else if (!slugRegex.test(slug)) errors.slug = 'Slug must be lowercase alphanumeric segments separated by single hyphens.'

  let parsedTags: string[] | undefined
  if (state.tagsText.trim()) {
    parsedTags = state.tagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    if (parsedTags.length > 10) errors.tags = 'At most 10 tags.'
    else {
      for (const t of parsedTags) {
        if (!tagRegex.test(t)) {
          errors.tags = `Tag "${t}" must be lowercase alphanumeric with hyphens only.`
          break
        }
      }
    }
  } else {
    parsedTags = []
  }

  if (!state.author_name.trim()) errors.author_name = 'Author name is required.'
  if (state.author_url.trim()) {
    try { new URL(state.author_url.trim()) } catch { errors.author_url = 'Author URL must be a valid URL.' }
  }

  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (state.cover_image_id.trim() && !uuidRe.test(state.cover_image_id.trim())) {
    errors.cover_image_id = 'Cover image ID must be a UUID.'
  }
  if (state.og_image_id.trim() && !uuidRe.test(state.og_image_id.trim())) {
    errors.og_image_id = 'OG image ID must be a UUID.'
  }

  // Validate the Tiptap-emitted Block[] against the canonical Zod schema
  // BEFORE submitting. The editor can briefly hold an empty heading or an
  // image without alt; both are caught here so save is blocked with an
  // inline error rather than bouncing off the BE 422.
  const parse = contentJsonSchema.safeParse(blocks)
  let parsedContent: Block[] | undefined
  if (!parse.success) {
    const issue = parse.error.issues[0]
    const path = issue?.path?.join('.') || ''
    errors.content_json = path
      ? `Block ${path}: ${issue.message}`
      : `Block schema error: ${issue?.message ?? 'invalid'}`
  } else {
    parsedContent = parse.data
    const enforce = validateContentJson(parsedContent)
    if (!enforce.ok) errors.content_json = enforce.message
  }

  return { ok: Object.keys(errors).length === 0, errors, parsedContent, parsedTags }
}

// Drop empty strings from a variant payload, then drop the region entirely if
// nothing remains. Block overrides survive only when they carry a non-empty
// `text` or `alt` for at least one block id. Returns a fresh GeoVariants
// object — never mutates the input.
function pruneVariants(variants: GeoVariants): GeoVariants {
  const out: GeoVariants = {}
  for (const region of ['US', 'EU'] as const) {
    const payload = variants[region]
    if (!payload) continue
    const next: NonNullable<GeoVariants[typeof region]> = {}
    for (const f of VARIANT_FIELDS) {
      const v = payload[f]
      if (typeof v === 'string' && v !== '') next[f] = v
    }
    if (payload.cta_label && payload.cta_label !== '') next.cta_label = payload.cta_label
    if (payload.cta_href && payload.cta_href !== '') next.cta_href = payload.cta_href
    if (payload.block_overrides) {
      const cleanedBlocks: Record<string, { text?: string; alt?: string }> = {}
      for (const [blockId, override] of Object.entries(payload.block_overrides)) {
        const cleaned: { text?: string; alt?: string } = {}
        if (override.text && override.text !== '') cleaned.text = override.text
        if (override.alt && override.alt !== '') cleaned.alt = override.alt
        if (Object.keys(cleaned).length > 0) cleanedBlocks[blockId] = cleaned
      }
      if (Object.keys(cleanedBlocks).length > 0) next.block_overrides = cleanedBlocks
    }
    if (Object.keys(next).length > 0) out[region] = next
  }
  return out
}

interface Props {
  initialPost: Post
  initialCover?: ImageRow | null
  initialOg?: ImageRow | null
}

export function EditPostForm({ initialPost, initialCover = null, initialOg = null }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  const [state, setState] = useState<FormState>(() => postToFormState(initialPost))
  const [post, setPost] = useState<Post>(initialPost)
  const [blocks, setBlocks] = useState<Block[]>(initialPost.content_json)
  const [variants, setVariants] = useState<GeoVariants>(() => initialPost.geo_variants ?? {})
  const [activeVariant, setActiveVariant] = useState<ActiveVariant>('OTHER')
  const [save, setSave] = useState<SaveState>({ kind: 'idle' })
  const [statusBusy, setStatusBusy] = useState<'publish' | 'unpublish' | null>(null)
  const [showDelete, setShowDelete] = useState(false)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [confirmSlug, setConfirmSlug] = useState('')
  // Picker state — one modal serves both the cover and og slots; the
  // currently-active slot is encoded in the open value.
  const [pickerOpen, setPickerOpen] = useState<null | PickerMode>(null)
  // Local thumbnail cache so the preview stays visible across re-renders
  // without a server round-trip per keystroke.
  const [coverThumb, setCoverThumb] = useState<ImageRow | null>(initialCover)
  const [ogThumb, setOgThumb] = useState<ImageRow | null>(initialOg)
  // AI readiness drawer + soft-prompt-on-publish state.
  // `aiDrawerOpen` is the controlled open prop for the drawer.
  // `aiDrawerSeedNull` forces a fresh scan even when post.ai_readiness_report
  // is non-null — used by the post-publish soft-prompt's "Score" CTA so
  // re-checking after a content change always hits the MCP.
  // `softPrompt` flips on after publish lands when the post's last scan
  // is missing or > 24h old. Dismissible; not persisted.
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false)
  const [aiDrawerSeedNull, setAiDrawerSeedNull] = useState(false)
  const [softPrompt, setSoftPrompt] = useState<{ visible: true } | null>(null)

  // Hydrate active variant tab from localStorage on mount. Persist on every
  // change. Per-post key so opening two posts side-by-side doesn't share a
  // tab state.
  const variantKey = `mb.editor.variant.${initialPost.id}`
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(variantKey)
      if (raw === 'US' || raw === 'EU' || raw === 'OTHER') {
        setActiveVariant(raw)
      }
    } catch { /* localStorage may throw in private mode */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPost.id])
  useEffect(() => {
    try {
      window.localStorage.setItem(variantKey, activeVariant)
    } catch { /* ignore */ }
  }, [variantKey, activeVariant])

  const region = activeVariant === 'OTHER' ? null : activeVariant
  const onVariantTab = region !== null

  const dirty = useMemo(() => {
    const baseline = postToFormState(post)
    if (JSON.stringify(state) !== JSON.stringify(baseline)) return true
    if (JSON.stringify(blocks) !== JSON.stringify(post.content_json)) return true
    const cleaned = pruneVariants(variants)
    const baseVariants = post.geo_variants ?? {}
    if (JSON.stringify(cleaned) !== JSON.stringify(baseVariants)) return true
    return false
  }, [state, post, blocks, variants])

  const validation = useMemo(() => validate(state, blocks), [state, blocks])
  const slugLocked = post.status === 'published' || !!post.published_at

  // Autosave: debounced 2s after the last edit. Skips if validation fails
  // so the textarea's red border + inline error are the user's signal,
  // not a noisy server 422.
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (!dirty || !validation.ok) return
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current)
    autosaveTimerRef.current = setTimeout(() => {
      void runSave({ silent: true })
    }, 2000)
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, variants, blocks, dirty, validation.ok])

  // After a save lands, the indicator lingers in the 'saved' state for a
  // visible window so the user actually sees it landed, then fades back to
  // 'idle'. Keeping this lifecycle in one place avoids the prior flicker
  // where a stale "Saved Xs ago" toast and the live indicator could
  // disagree across rapid keystrokes.
  const SAVED_LINGER_MS = 2000
  useEffect(() => {
    if (save.kind !== 'saved') return
    const id = setTimeout(() => {
      setSave((cur) => (cur.kind === 'saved' ? { kind: 'idle' } : cur))
    }, SAVED_LINGER_MS)
    return () => clearTimeout(id)
  }, [save])

  // Browser unload guard — warn if navigating away with unsaved changes.
  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (!dirty) return
      e.preventDefault()
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  // Global Cmd/Ctrl+S → save now. The editor pane also binds this for
  // when focus is inside Tiptap; we mirror it at window-level for the
  // form fields above.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey
      if (meta && e.key.toLowerCase() === 's') {
        e.preventDefault()
        void runSave()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validation.ok, dirty])

  const setField = useCallback(
    <K extends keyof FormState>(field: K, value: FormState[K]) => {
      setState((prev) => ({ ...prev, [field]: value }))
    },
    [],
  )

  // Variant overlay setters. Empty string clears the override — falls back to
  // base on render. Always merges the other region's variant unchanged so
  // editing US can never drop EU's overrides.
  const setVariantField = useCallback(
    (r: 'US' | 'EU', field: VariantField, value: string) => {
      setVariants((prev) => {
        const next: GeoVariants = { ...prev }
        const current = { ...(next[r] ?? {}) }
        if (value === '') delete current[field]
        else current[field] = value
        if (Object.keys(current).length === 0) {
          delete next[r]
        } else {
          next[r] = current
        }
        return next
      })
    },
    [],
  )

  // Block-level override setter. `text` for heading/paragraph/quote/callout/
  // key-takeaway, `alt` for image. Empty string clears the field; clearing
  // both fields removes the block id entirely; clearing every block id (and
  // post-level overrides) removes the region key.
  const setBlockOverride = useCallback(
    (r: 'US' | 'EU', blockId: string, kind: 'text' | 'alt', value: string) => {
      setVariants((prev) => {
        const next: GeoVariants = { ...prev }
        const region = { ...(next[r] ?? {}) }
        const blockOverrides = { ...(region.block_overrides ?? {}) }
        const current = { ...(blockOverrides[blockId] ?? {}) }
        if (value === '') delete current[kind]
        else current[kind] = value
        if (Object.keys(current).length === 0) {
          delete blockOverrides[blockId]
        } else {
          blockOverrides[blockId] = current
        }
        if (Object.keys(blockOverrides).length === 0) {
          delete region.block_overrides
        } else {
          region.block_overrides = blockOverrides
        }
        if (Object.keys(region).length === 0) {
          delete next[r]
        } else {
          next[r] = region
        }
        return next
      })
    },
    [],
  )

  async function runSave({ silent = false }: { silent?: boolean } = {}): Promise<boolean> {
    if (!validation.ok) {
      if (!silent) setSave({ kind: 'error', message: 'Fix the highlighted fields before saving.' })
      return false
    }
    setSave({ kind: 'saving' })
    const cleanedVariants = pruneVariants(variants)
    const patch: Partial<Post> = {
      title:             state.title,
      excerpt:           state.excerpt.trim() || null,
      tags:              validation.parsedTags ?? [],
      author_name:       state.author_name.trim(),
      author_url:        state.author_url.trim() || null,
      meta_title:        state.meta_title.trim() || null,
      meta_description: state.meta_description.trim() || null,
      cover_image_id:    state.cover_image_id.trim() || null,
      og_image_id:       state.og_image_id.trim() || null,
      content_json:      validation.parsedContent ?? [],
      geo_variants:      cleanedVariants,
    }
    if (!slugLocked) patch.slug = state.slug.trim()

    try {
      const res = await api.patch<{ post: Post }>(`/api/admin/posts/${post.id}`, patch)
      setPost(res.post)
      setState(postToFormState(res.post))
      setBlocks(res.post.content_json)
      setVariants(res.post.geo_variants ?? {})
      setSave({ kind: 'saved', at: Date.now() })
      return true
    } catch (err) {
      const message =
        err instanceof NetworkError ? 'Network error, try again.' :
        err instanceof ApiError ? err.message :
        'Save failed.'
      setSave({ kind: 'error', message })
      return false
    }
  }

  async function handlePublish() {
    if (statusBusy) return
    if (!validation.ok) {
      setSave({ kind: 'error', message: 'Fix the highlighted fields before publishing.' })
      return
    }
    if (dirty) {
      const ok = await runSave({ silent: true })
      if (!ok) return
    }
    setStatusBusy('publish')
    const prevStatus = post.status
    setPost((p) => ({ ...p, status: 'published' }))
    try {
      const res = await api.post<{ post: Post }>(`/api/admin/posts/${post.id}/publish`)
      setPost(res.post)
      setState(postToFormState(res.post))
      setBlocks(res.post.content_json)
      setVariants(res.post.geo_variants ?? {})
      // Soft-prompt: nudge the admin to score AI readiness when the latest
      // scan is missing or older than 24h. Non-blocking — admin can dismiss
      // and ignore. Re-evaluates on every successful publish (no persisted
      // dismissal) so each publish that lacks a fresh score gets a prompt.
      const checkedAt = res.post.ai_readiness_checked_at
        ? new Date(res.post.ai_readiness_checked_at).getTime()
        : null
      const stale = checkedAt === null || (Date.now() - checkedAt) > 24 * 60 * 60 * 1000
      if (stale) setSoftPrompt({ visible: true })
      router.refresh()
    } catch (err) {
      setPost((p) => ({ ...p, status: prevStatus }))
      const message =
        err instanceof NetworkError ? 'Network error, try again.' :
        err instanceof ApiError ? err.message :
        'Publish failed.'
      setSave({ kind: 'error', message })
    } finally {
      setStatusBusy(null)
    }
  }

  async function handleUnpublish() {
    if (statusBusy) return
    setStatusBusy('unpublish')
    const prevStatus = post.status
    setPost((p) => ({ ...p, status: 'draft' }))
    try {
      const res = await api.post<{ post: Post }>(`/api/admin/posts/${post.id}/unpublish`)
      setPost(res.post)
      setState(postToFormState(res.post))
      setBlocks(res.post.content_json)
      setVariants(res.post.geo_variants ?? {})
      router.refresh()
    } catch (err) {
      setPost((p) => ({ ...p, status: prevStatus }))
      const message =
        err instanceof NetworkError ? 'Network error, try again.' :
        err instanceof ApiError ? err.message :
        'Unpublish failed.'
      setSave({ kind: 'error', message })
    } finally {
      setStatusBusy(null)
    }
  }

  async function handleDelete() {
    if (deleteBusy) return
    if (confirmSlug.trim() !== post.slug) return
    setDeleteBusy(true)
    setDeleteError(null)
    try {
      await api.delete<{ ok: true }>(`/api/admin/posts/${post.id}`)
      startTransition(() => {
        router.push('/admin')
        router.refresh()
      })
    } catch (err) {
      const message =
        err instanceof NetworkError ? 'Network error, try again.' :
        err instanceof ApiError ? err.message :
        'Delete failed.'
      setDeleteError(message)
      setDeleteBusy(false)
    }
  }

  const errs = validation.errors

  // Variant-eligible field bindings. On the Base tab these read straight from
  // the form state; on a variant tab they read from variants[region][field]
  // and write back via setVariantField — never touching the base value.
  const variantPayload = region ? (variants[region] ?? {}) : null
  const eligibleValue = (field: VariantField): string => {
    if (!region) {
      switch (field) {
        case 'title':            return state.title
        case 'excerpt':          return state.excerpt
        case 'meta_title':       return state.meta_title
        case 'meta_description': return state.meta_description
      }
    }
    return variantPayload?.[field] ?? ''
  }
  const onEligibleChange = (field: VariantField, value: string) => {
    if (!region) {
      const baseField: keyof FormState =
        field === 'title' ? 'title' :
        field === 'excerpt' ? 'excerpt' :
        field === 'meta_title' ? 'meta_title' :
        'meta_description'
      setField(baseField, value)
      return
    }
    setVariantField(region, field, value)
  }
  const overrides = (field: VariantField): boolean => {
    if (!region) return false
    const v = variantPayload?.[field]
    return typeof v === 'string' && v !== ''
  }
  const resetOverride = (field: VariantField) => {
    if (!region) return
    setVariantField(region, field, '')
  }

  // Effective preview values: when on a variant tab, the preview uses the
  // overlay-merged values; on Base, it's just the base form state.
  const previewOverlay = useMemo(() => {
    return {
      title:            region ? (variantPayload?.title ?? state.title) : state.title,
      excerpt:          (region ? variantPayload?.excerpt ?? null : (state.excerpt.trim() || null)) ?? (state.excerpt.trim() || null),
      tags:             validation.parsedTags ?? post.tags,
      author_name:      state.author_name.trim() || post.author_name,
      author_url:       state.author_url.trim() || null,
      meta_title:       (region ? variantPayload?.meta_title : state.meta_title.trim() || null) ?? null,
      meta_description: (region ? variantPayload?.meta_description : state.meta_description.trim() || null) ?? null,
      cover_image_id:   state.cover_image_id.trim() || null,
      og_image_id:      state.og_image_id.trim() || null,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region, variantPayload, state, validation.parsedTags, post.tags, post.author_name])

  // The post that flows into the editor / preview must carry the live
  // variants overlay so the preview pane's mergeVariant() resolves block
  // overrides against the in-memory edits, not the last-saved state.
  const livePost = useMemo<Post>(() => ({ ...post, geo_variants: variants }), [post, variants])

  // Reconstruct the wire response from the post's flat fields so the drawer
  // can open instantly without an extra POST. The route handler returns
  // `{ score, band, report, cached, scannedAt }`; everything we need is
  // already on the persisted Post columns (M7-BE writes `ai_readiness_report`
  // as the full VerseOdin payload).
  const initialAiReport: AiReadinessApiResponse | null = useMemo(() => {
    if (
      post.ai_readiness_score === null ||
      post.ai_readiness_band === null ||
      post.ai_readiness_checked_at === null ||
      post.ai_readiness_report === null
    ) {
      return null
    }
    return {
      score:     post.ai_readiness_score,
      band:      post.ai_readiness_band,
      report:    post.ai_readiness_report,
      cached:    true,
      scannedAt: post.ai_readiness_checked_at,
    }
  }, [post.ai_readiness_score, post.ai_readiness_band, post.ai_readiness_checked_at, post.ai_readiness_report])

  return (
    <>
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-white p-[16px]">
        <SaveIndicator state={save} dirty={dirty} validationOk={validation.ok} onRetry={() => runSave()} />
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex h-[26px] items-center rounded-sm border px-2 text-[10px] font-medium uppercase tracking-[0.12em] ${
              post.status === 'published'
                ? 'border-[#10b981]/30 bg-[#ecfdf5] text-[#047857]'
                : 'border-border bg-bg-subtle text-gray'
            }`}
            style={{ fontFamily: 'var(--font-mono)' }}
            role="status"
            aria-label={`Status: ${post.status}`}
          >
            {post.status}
          </span>
          <AiReadinessButton
            post={post}
            onOpen={() => {
              setAiDrawerSeedNull(false)
              setAiDrawerOpen(true)
            }}
          />
          {post.status === 'published' ? (
            <button
              type="button"
              onClick={handleUnpublish}
              disabled={statusBusy !== null}
              className="inline-flex h-[36px] items-center rounded-md border border-border bg-white px-3 text-[13px] font-medium text-dark transition-colors duration-150 hover:border-brand/30 disabled:opacity-60 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {statusBusy === 'unpublish' ? 'Unpublishing…' : 'Unpublish'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePublish}
              disabled={statusBusy !== null || !validation.ok}
              className="inline-flex h-[36px] items-center rounded-md bg-brand px-3 text-[13px] font-semibold text-white transition-opacity duration-150 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {statusBusy === 'publish' ? 'Publishing…' : 'Publish'}
            </button>
          )}
          <button
            type="button"
            onClick={() => runSave()}
            disabled={save.kind === 'saving' || !dirty || !validation.ok}
            className="inline-flex h-[36px] items-center rounded-md border border-border bg-white px-3 text-[13px] font-medium text-dark transition-colors duration-150 hover:border-brand/30 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {save.kind === 'saving' ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => { setShowDelete(true); setConfirmSlug('') }}
            className="inline-flex h-[36px] items-center rounded-md border border-transparent px-3 text-[13px] font-medium text-gray transition-colors duration-150 hover:border-[#fda29b] hover:text-[#b42318] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Variant tab strip */}
      <VariantTabs active={activeVariant} onChange={setActiveVariant} />

      {/* Form fields */}
      <div className="grid grid-cols-1 gap-[20px] rounded-xl border border-border bg-white p-[24px] md:grid-cols-2">
        <Field
          label="Title"
          id="f-title"
          error={errs.title}
          variantOverride={overrides('title')}
          onResetOverride={() => resetOverride('title')}
        >
          <input
            id="f-title"
            type="text"
            maxLength={200}
            value={eligibleValue('title')}
            onChange={(e) => onEligibleChange('title', e.target.value)}
            placeholder={onVariantTab ? post.title : undefined}
            className={inputClass(!!errs.title)}
          />
        </Field>

        <Field
          label="Slug"
          id="f-slug"
          error={errs.slug}
          hint={
            onVariantTab ? 'Slug is base-only; switch to Base to edit.' :
            slugLocked ? 'Slug locked — this post is published.' :
            '/blog/<slug>'
          }
        >
          <input
            id="f-slug"
            type="text"
            value={state.slug}
            onChange={(e) => setField('slug', e.target.value)}
            disabled={slugLocked || onVariantTab}
            aria-readonly={slugLocked || onVariantTab || undefined}
            className={inputClass(!!errs.slug, slugLocked || onVariantTab)}
          />
        </Field>

        <Field
          label="Excerpt"
          id="f-excerpt"
          error={errs.excerpt}
          className="md:col-span-2"
          variantOverride={overrides('excerpt')}
          onResetOverride={() => resetOverride('excerpt')}
        >
          <textarea
            id="f-excerpt"
            rows={3}
            value={eligibleValue('excerpt')}
            onChange={(e) => onEligibleChange('excerpt', e.target.value)}
            placeholder={onVariantTab ? (post.excerpt ?? '') : undefined}
            className={textareaClass(false)}
          />
        </Field>

        <Field
          label="Tags"
          id="f-tags"
          error={errs.tags}
          hint={onVariantTab ? 'Tags are base-only; switch to Base to edit.' : 'Comma-separated. lowercase-with-hyphens.'}
        >
          <input
            id="f-tags"
            type="text"
            value={state.tagsText}
            onChange={(e) => setField('tagsText', e.target.value)}
            placeholder="defi, web3, custody"
            disabled={onVariantTab}
            aria-readonly={onVariantTab || undefined}
            className={inputClass(!!errs.tags, onVariantTab)}
          />
        </Field>

        <Field
          label="Author name"
          id="f-author"
          error={errs.author_name}
          hint={onVariantTab ? 'Author name is base-only; switch to Base to edit.' : undefined}
        >
          <input
            id="f-author"
            type="text"
            value={state.author_name}
            onChange={(e) => setField('author_name', e.target.value)}
            disabled={onVariantTab}
            aria-readonly={onVariantTab || undefined}
            className={inputClass(!!errs.author_name, onVariantTab)}
          />
        </Field>

        <Field
          label="Author URL"
          id="f-author-url"
          error={errs.author_url}
          hint={onVariantTab ? 'Author URL is base-only; switch to Base to edit.' : undefined}
        >
          <input
            id="f-author-url"
            type="url"
            value={state.author_url}
            onChange={(e) => setField('author_url', e.target.value)}
            placeholder="https://"
            disabled={onVariantTab}
            aria-readonly={onVariantTab || undefined}
            className={inputClass(!!errs.author_url, onVariantTab)}
          />
        </Field>

        <Field
          label="Meta title"
          id="f-meta-title"
          error={errs.meta_title}
          variantOverride={overrides('meta_title')}
          onResetOverride={() => resetOverride('meta_title')}
        >
          <input
            id="f-meta-title"
            type="text"
            value={eligibleValue('meta_title')}
            onChange={(e) => onEligibleChange('meta_title', e.target.value)}
            placeholder={onVariantTab ? (post.meta_title ?? '') : undefined}
            className={inputClass(!!errs.meta_title)}
          />
        </Field>

        <Field
          label="Meta description"
          id="f-meta-desc"
          error={errs.meta_description}
          variantOverride={overrides('meta_description')}
          onResetOverride={() => resetOverride('meta_description')}
        >
          <input
            id="f-meta-desc"
            type="text"
            value={eligibleValue('meta_description')}
            onChange={(e) => onEligibleChange('meta_description', e.target.value)}
            placeholder={onVariantTab ? (post.meta_description ?? '') : undefined}
            className={inputClass(!!errs.meta_description)}
          />
        </Field>

        <Field
          label="Cover image"
          id="f-cover"
          error={errs.cover_image_id}
          hint={
            onVariantTab ? 'Cover image is base-only; switch to Base to edit.' :
            'Shown at the top of /blog/[slug] and in social cards.'
          }
        >
          <ImageSlot
            id="f-cover"
            label="Cover image"
            image={coverThumb}
            disabled={onVariantTab}
            onPick={() => setPickerOpen('cover')}
            onRemove={() => {
              setField('cover_image_id', '')
              setCoverThumb(null)
            }}
          />
        </Field>

        <Field
          label="OG image"
          id="f-og"
          error={errs.og_image_id}
          hint={
            onVariantTab ? 'OG image is base-only; switch to Base to edit.' :
            'Falls back to cover when unset.'
          }
        >
          <ImageSlot
            id="f-og"
            label="OG image"
            image={ogThumb}
            disabled={onVariantTab}
            onPick={() => setPickerOpen('og')}
            onRemove={() => {
              setField('og_image_id', '')
              setOgThumb(null)
            }}
          />
        </Field>
      </div>

      <div className="flex flex-col gap-[8px]">
        <div className="flex items-center justify-between">
          <p
            className="text-[12px] font-medium uppercase tracking-[0.08em] text-gray"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Content {onVariantTab ? <span className="text-gray-light">(read-only on variant tabs)</span> : null}
          </p>
          {errs.content_json ? (
            <p role="alert" className="text-[12px] text-[#b42318] tracking-[-0.005em]">{errs.content_json}</p>
          ) : (
            <p className="text-[11px] text-gray-light tracking-[-0.005em]">
              {onVariantTab ? 'Edit the per-block override in the inspector.' : 'Type / to insert a block.'}
            </p>
          )}
        </div>
        <EditorShell
          basePost={livePost}
          initialBlocks={livePost.content_json}
          onBlocksChange={setBlocks}
          onSaveShortcut={() => { void runSave() }}
          activeVariant={activeVariant}
          variants={variants}
          onSetBlockOverride={(blockId, kind, value) => {
            if (!region) return
            setBlockOverride(region, blockId, kind, value)
          }}
          liveOverlay={previewOverlay}
          images={[coverThumb, ogThumb].filter((x): x is ImageRow => x !== null)}
        />
      </div>

      {showDelete ? (
        <DeleteModal
          slug={post.slug}
          confirmSlug={confirmSlug}
          onTyped={setConfirmSlug}
          busy={deleteBusy}
          error={deleteError}
          onCancel={() => { if (!deleteBusy) setShowDelete(false) }}
          onConfirm={handleDelete}
        />
      ) : null}

      <ImagePicker
        open={pickerOpen !== null}
        mode={pickerOpen ?? 'cover'}
        onClose={() => setPickerOpen(null)}
        onSelect={(image) => {
          if (pickerOpen === 'cover') {
            setField('cover_image_id', image.id)
            setCoverThumb(image)
          } else if (pickerOpen === 'og') {
            setField('og_image_id', image.id)
            setOgThumb(image)
          }
          setPickerOpen(null)
        }}
      />

      <AiReadinessDrawer
        open={aiDrawerOpen}
        onClose={() => {
          setAiDrawerOpen(false)
          setAiDrawerSeedNull(false)
        }}
        post={post}
        initialReport={aiDrawerSeedNull ? null : initialAiReport}
        onPublishRequest={() => {
          // POST_NOT_PUBLISHED → close drawer and re-run publish.
          setAiDrawerOpen(false)
          setAiDrawerSeedNull(false)
          void handlePublish()
        }}
      />

      {softPrompt ? (
        <PublishSoftPrompt
          onScore={() => {
            setSoftPrompt(null)
            setAiDrawerSeedNull(true)
            setAiDrawerOpen(true)
          }}
          onDismiss={() => setSoftPrompt(null)}
        />
      ) : null}
    </>
  )
}

// ── Tiny presentational helpers ─────────────────────────────────────────────

function VariantTabs({
  active, onChange,
}: {
  active: ActiveVariant
  onChange: (next: ActiveVariant) => void
}) {
  const TABS: ReadonlyArray<{ key: ActiveVariant; label: string }> = [
    { key: 'OTHER', label: 'Base' },
    { key: 'US',    label: 'US' },
    { key: 'EU',    label: 'EU' },
  ]
  return (
    <nav role="tablist" aria-label="Geo variant" className="flex gap-1 border-b border-border" data-testid="variant-tabs">
      {TABS.map((t) => {
        const isActive = active === t.key
        return (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(t.key)}
            className={`relative -mb-px h-[36px] border-b-2 px-3 text-[13px] tracking-[-0.005em] transition-colors duration-150 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              isActive
                ? 'border-brand text-dark font-semibold'
                : 'border-transparent text-gray hover:text-dark'
            }`}
          >
            {t.label}
          </button>
        )
      })}
    </nav>
  )
}

function Field({
  label, id, hint, error, children, className, variantOverride, onResetOverride,
}: {
  label: string
  id: string
  hint?: string
  error?: string
  children: React.ReactNode
  className?: string
  variantOverride?: boolean
  onResetOverride?: () => void
}) {
  return (
    <div className={`flex flex-col gap-[6px] ${className ?? ''}`}>
      <div className="flex flex-wrap items-center justify-between gap-[6px]">
        <label
          htmlFor={id}
          className="text-[12px] font-medium uppercase tracking-[0.08em] text-gray"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {label}
        </label>
        {variantOverride ? (
          <span className="flex items-center gap-2">
            <span
              className="inline-flex h-[20px] items-center rounded-sm border border-brand/30 bg-[#eef2ff] px-2 text-[10px] font-medium uppercase tracking-[0.12em] text-brand"
              style={{ fontFamily: 'var(--font-mono)' }}
              data-testid={`override-chip-${id}`}
            >
              · Overrides base
            </span>
            {onResetOverride ? (
              <button
                type="button"
                onClick={onResetOverride}
                aria-label={`Reset ${label.toLowerCase()} to base`}
                data-testid={`reset-override-${id}`}
                className="text-[11px] font-medium text-gray underline-offset-2 hover:text-brand hover:underline focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Reset to base
              </button>
            ) : null}
          </span>
        ) : null}
      </div>
      {children}
      {error ? (
        <p role="alert" className="text-[12px] text-[#b42318] tracking-[-0.005em]">{error}</p>
      ) : hint ? (
        <p className="text-[12px] text-gray-light tracking-[-0.005em]">{hint}</p>
      ) : null}
    </div>
  )
}

function ImageSlot({
  id, label, image, onPick, onRemove, disabled,
}: {
  id: string
  label: string
  image: ImageRow | null
  onPick: () => void
  onRemove: () => void
  disabled?: boolean
}) {
  // Buttons intentionally do NOT carry `id={id}`. The wrapping <Field>
  // emits a <label htmlFor={id}> for visible-text-only purposes. Screen
  // readers compute a button's accessible name from its own attributes
  // first; binding the label to a button via htmlFor would replace the
  // button text ("Change", "Remove") with the field label ("Cover image"),
  // making both Change AND Remove announce as the same generic "Cover
  // image" — caught as M4 Tester HIGH 1, same root-cause class as M3's
  // list-toggle a11y fix. Each button declares its own aria-label.
  if (!image) {
    return (
      <button
        type="button"
        onClick={onPick}
        disabled={disabled}
        aria-label={`Choose ${label.toLowerCase()}`}
        className={`flex h-[88px] w-full items-center justify-center gap-2 rounded-md border border-dashed border-border bg-bg-subtle text-[13px] font-medium text-gray transition-colors duration-150 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
          disabled ? 'cursor-not-allowed opacity-60' : 'hover:border-brand/30 hover:text-brand'
        }`}
      >
        <span aria-hidden="true">+</span> Choose image
      </button>
    )
  }
  // The wrapping div doesn't take `id` either — the htmlFor target is
  // purely visual. (Same a11y note as the empty-slot button above.)
  void id
  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-white p-2">
      <div className="relative h-[64px] w-[96px] flex-shrink-0 overflow-hidden rounded-md border border-border bg-bg-subtle">
        <Image
          src={image.blob_url}
          alt={image.alt || image.filename}
          fill
          sizes="96px"
          className="object-cover"
          style={{ objectPosition: `${image.focal_x * 100}% ${image.focal_y * 100}%` }}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="truncate text-[13px] text-dark" title={image.filename}>{image.filename}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onPick}
            disabled={disabled}
            aria-label={`Change ${label.toLowerCase()}`}
            className="inline-flex h-[28px] items-center rounded-md border border-border bg-white px-2 text-[12px] font-medium text-dark transition-colors duration-150 hover:border-brand/30 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Change
          </button>
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            aria-label={`Remove ${label.toLowerCase()}`}
            className="inline-flex h-[28px] items-center rounded-md border border-transparent px-2 text-[12px] font-medium text-gray transition-colors duration-150 hover:border-[#fda29b] hover:text-[#b42318] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}

function inputClass(invalid: boolean, locked: boolean = false): string {
  return [
    'h-[40px] w-full rounded-md border bg-white px-3 text-[14px] tracking-[-0.005em] text-dark',
    'transition-colors duration-150 placeholder:text-gray-light',
    'focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
    invalid ? 'border-[#b42318]' : 'border-border hover:border-brand/30',
    locked ? 'cursor-not-allowed bg-bg-subtle text-gray' : '',
  ].join(' ')
}

function textareaClass(invalid: boolean): string {
  return [
    'w-full rounded-md border bg-white px-3 py-2 text-[14px] tracking-[-0.005em] text-dark',
    'transition-colors duration-150 placeholder:text-gray-light',
    'focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
    invalid ? 'border-[#b42318]' : 'border-border hover:border-brand/30',
  ].join(' ')
}

function relativeTime(at: number): string {
  const delta = Math.max(0, Date.now() - at)
  const sec = Math.floor(delta / 1000)
  if (sec < 5) return 'just now'
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  return `${hr}h ago`
}

function SaveIndicator({
  state, dirty, validationOk, onRetry,
}: {
  state: SaveState
  dirty: boolean
  validationOk: boolean
  onRetry: () => void
}) {
  // Idle / saving / saved transitions all announce through a single
  // role="status" aria-live="polite" region so screen-reader users hear
  // the autosave lifecycle. Errors promote to role="alert" (assertive).
  // The 'saved' state is short-lived (parent transitions it back to idle
  // after ~2s) so a live-updating "Xs ago" timer would barely tick.
  if (state.kind === 'error') {
    return (
      <div role="alert" aria-live="assertive" className="flex items-center gap-2 text-[12px] text-[#b42318] tracking-[-0.005em]">
        <span className="inline-block h-2 w-2 rounded-full bg-[#b42318]" aria-hidden="true" />
        {state.message}
        <button
          type="button"
          onClick={onRetry}
          className="ml-2 rounded-md border border-[#fda29b] px-2 py-[2px] text-[11px] font-semibold text-[#b42318] hover:bg-[#fef3f2] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Retry
        </button>
      </div>
    )
  }
  if (state.kind === 'saving') {
    return (
      <div role="status" aria-live="polite" className="flex items-center gap-2 text-[12px] text-gray tracking-[-0.005em]">
        <span aria-hidden="true" className="inline-block h-[10px] w-[10px] animate-spin rounded-full border-2 border-gray/30 border-t-gray" />
        Saving…
      </div>
    )
  }
  if (state.kind === 'saved') {
    return (
      <div role="status" aria-live="polite" className="flex items-center gap-2 text-[12px] text-gray tracking-[-0.005em]">
        <span className="inline-block h-2 w-2 rounded-full bg-[#10b981]" aria-hidden="true" />
        Saved {relativeTime(state.at)}
      </div>
    )
  }
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-2 text-[12px] text-gray-light tracking-[-0.005em]">
      <span className="inline-block h-2 w-2 rounded-full bg-gray-subtle" aria-hidden="true" />
      {dirty ? 'Unsaved changes' : validationOk ? 'Up to date' : 'Fix validation errors to save'}
    </div>
  )
}

function PublishSoftPrompt({
  onScore, onDismiss,
}: {
  onScore: () => void
  onDismiss: () => void
}) {
  // Auto-dismiss after 12s so the toast doesn't linger if the admin
  // ignores it. Stays non-blocking — esc / close button always work.
  useEffect(() => {
    const id = setTimeout(onDismiss, 12_000)
    return () => clearTimeout(id)
  }, [onDismiss])

  return (
    <div
      data-testid="ai-readiness-soft-prompt"
      role="status"
      aria-live="polite"
      className="fixed bottom-[20px] right-[20px] z-30 flex max-w-[360px] items-start gap-3 rounded-xl border border-border bg-white p-[16px] shadow-[0_12px_32px_rgba(0,0,0,0.10)]"
    >
      <div className="flex-1">
        <p className="text-[13px] font-semibold tracking-[-0.01em] text-dark">Just published.</p>
        <p className="mt-[2px] text-[12px] leading-[1.5] text-gray tracking-[-0.005em]">
          Score AI readiness now?
        </p>
      </div>
      <div className="flex flex-shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={onScore}
          data-testid="ai-readiness-soft-prompt-score"
          className="inline-flex h-[28px] items-center rounded-md bg-brand px-3 text-[12px] font-semibold text-white transition-opacity duration-150 hover:opacity-95 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Score
        </button>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          data-testid="ai-readiness-soft-prompt-dismiss"
          className="inline-flex h-[28px] w-[28px] items-center justify-center rounded-md border border-transparent text-gray transition-colors duration-150 hover:border-border hover:text-dark focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <span aria-hidden="true" className="text-[16px] leading-none">×</span>
        </button>
      </div>
    </div>
  )
}

function DeleteModal({
  slug, confirmSlug, onTyped, busy, error, onCancel, onConfirm,
}: {
  slug: string
  confirmSlug: string
  onTyped: (v: string) => void
  busy: boolean
  error: string | null
  onCancel: () => void
  onConfirm: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)
  // Element that opened the modal — focus returns there on close so the
  // keyboard user lands on the Delete button they invoked, not <body>.
  const triggerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const active = document.activeElement
    if (active instanceof HTMLElement) triggerRef.current = active
    inputRef.current?.focus()
    return () => {
      const trigger = triggerRef.current
      if (trigger && document.body.contains(trigger)) trigger.focus()
    }
  }, [])
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !busy) onCancel()
      if (e.key === 'Tab') {
        const order = [inputRef.current, cancelRef.current, confirmRef.current].filter(Boolean) as HTMLElement[]
        if (!order.length) return
        const idx = order.indexOf(document.activeElement as HTMLElement)
        if (idx < 0) return
        e.preventDefault()
        const next = (idx + (e.shiftKey ? -1 : 1) + order.length) % order.length
        order[next].focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [busy, onCancel])

  const matches = confirmSlug.trim() === slug

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="edit-delete-title" className="fixed inset-0 z-50 flex items-center justify-center bg-canvas/60 px-4">
      <div className="w-full max-w-[440px] rounded-xl border border-border bg-white p-[28px] shadow-[0_24px_64px_rgba(0,0,0,0.12)]">
        <h2 id="edit-delete-title" className="mb-[6px] text-[18px] font-bold tracking-[-0.025em] text-dark">
          Delete this post?
        </h2>
        <p className="mb-[20px] text-[14px] leading-[1.5] text-gray tracking-[-0.005em]">
          This is permanent. To confirm, type the slug{' '}
          <code className="rounded-sm bg-bg-subtle px-1 py-[1px] text-[12px] text-dark" style={{ fontFamily: 'var(--font-mono)' }}>{slug}</code>{' '}
          below.
        </p>
        <input
          ref={inputRef}
          type="text"
          value={confirmSlug}
          onChange={(e) => onTyped(e.target.value)}
          aria-label="Type the slug to confirm"
          className="mb-[12px] h-[40px] w-full rounded-md border border-border bg-white px-3 text-[14px] tracking-[-0.005em] text-dark placeholder:text-gray-light focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          placeholder={slug}
        />
        {error ? (
          <div role="alert" className="mb-[12px] rounded-md border border-[#fda29b] bg-[#fef3f2] px-3 py-2 text-[12px] text-[#b42318] tracking-[-0.005em]">
            {error}
          </div>
        ) : null}
        <div className="flex justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="inline-flex h-[36px] items-center rounded-md border border-border bg-white px-3 text-[13px] font-medium text-dark transition-colors duration-150 hover:border-brand/30 disabled:opacity-60 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Cancel
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={busy || !matches}
            className="inline-flex h-[36px] items-center rounded-md bg-[#b42318] px-3 text-[13px] font-semibold text-white transition-opacity duration-150 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {busy ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
