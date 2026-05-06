// Tests for the POST / PATCH body schemas behind /api/admin/posts/**.
//
// Adds the M8-core hardening assertions: every free-form text field must
// reject over-length input with VALIDATION_FAILED, and the field path
// emitted by Zod must point to the offending field so the FE can render
// inline errors.

import { describe, it, expect } from 'vitest'
import {
  createPostBodySchema,
  patchPostBodySchema,
  listQuerySchema,
} from './post-validation'

describe('createPostBodySchema', () => {
  it('accepts a minimal title-only body', () => {
    const r = createPostBodySchema.safeParse({ title: 'Hello world' })
    expect(r.success).toBe(true)
  })

  it('accepts a title + slug pair', () => {
    const r = createPostBodySchema.safeParse({ title: 'Hello', slug: 'hello-world' })
    expect(r.success).toBe(true)
  })

  it('rejects an empty title', () => {
    const r = createPostBodySchema.safeParse({ title: '' })
    expect(r.success).toBe(false)
  })

  it('rejects an over-length title (>200)', () => {
    const r = createPostBodySchema.safeParse({ title: 'a'.repeat(201) })
    expect(r.success).toBe(false)
    expect(r.success ? null : r.error.issues[0].path).toEqual(['title'])
  })

  it('rejects an over-length slug (>80)', () => {
    const r = createPostBodySchema.safeParse({
      title: 'Hello',
      slug: 'a'.repeat(81),
    })
    expect(r.success).toBe(false)
    expect(r.success ? null : r.error.issues[0].path).toEqual(['slug'])
  })

  it('rejects unknown fields (.strict)', () => {
    const r = createPostBodySchema.safeParse({ title: 'Hi', surprise: true })
    expect(r.success).toBe(false)
  })
})

describe('patchPostBodySchema — length caps (M8-core hardening)', () => {
  it('accepts a 200-char title and rejects 201', () => {
    expect(patchPostBodySchema.safeParse({ title: 'a'.repeat(200) }).success).toBe(true)
    const over = patchPostBodySchema.safeParse({ title: 'a'.repeat(201) })
    expect(over.success).toBe(false)
    expect(over.success ? null : over.error.issues[0].path).toEqual(['title'])
  })

  it('accepts an 80-char slug and rejects 81', () => {
    expect(
      patchPostBodySchema.safeParse({ slug: 'a' + '-a'.repeat(39) }).success,
    ).toBe(true)
    const over = patchPostBodySchema.safeParse({ slug: 'a'.repeat(81) })
    expect(over.success).toBe(false)
    expect(over.success ? null : over.error.issues[0].path).toEqual(['slug'])
  })

  it('accepts a 500-char excerpt and rejects 501', () => {
    expect(patchPostBodySchema.safeParse({ excerpt: 'x'.repeat(500) }).success).toBe(true)
    const over = patchPostBodySchema.safeParse({ excerpt: 'x'.repeat(501) })
    expect(over.success).toBe(false)
    expect(over.success ? null : over.error.issues[0].path).toEqual(['excerpt'])
  })

  it('accepts a 160-char meta_description and rejects 161', () => {
    expect(
      patchPostBodySchema.safeParse({ meta_description: 'x'.repeat(160) }).success,
    ).toBe(true)
    const over = patchPostBodySchema.safeParse({ meta_description: 'x'.repeat(161) })
    expect(over.success).toBe(false)
    expect(
      over.success ? null : over.error.issues[0].path,
    ).toEqual(['meta_description'])
  })

  it('accepts a 200-char meta_title and rejects 201', () => {
    expect(
      patchPostBodySchema.safeParse({ meta_title: 'x'.repeat(200) }).success,
    ).toBe(true)
    const over = patchPostBodySchema.safeParse({ meta_title: 'x'.repeat(201) })
    expect(over.success).toBe(false)
  })

  it('accepts a 120-char author_name and rejects 121', () => {
    expect(
      patchPostBodySchema.safeParse({ author_name: 'a'.repeat(120) }).success,
    ).toBe(true)
    const over = patchPostBodySchema.safeParse({ author_name: 'a'.repeat(121) })
    expect(over.success).toBe(false)
  })

  it('accepts up to 10 tags and rejects 11', () => {
    const ten     = Array.from({ length: 10 }, (_, i) => `tag-${i}`)
    const eleven  = Array.from({ length: 11 }, (_, i) => `tag-${i}`)
    expect(patchPostBodySchema.safeParse({ tags: ten }).success).toBe(true)
    const over = patchPostBodySchema.safeParse({ tags: eleven })
    expect(over.success).toBe(false)
    expect(over.success ? null : over.error.issues[0].path).toEqual(['tags'])
  })

  it('accepts a 40-char tag and rejects 41', () => {
    expect(patchPostBodySchema.safeParse({ tags: ['a'.repeat(40)] }).success).toBe(true)
    const over = patchPostBodySchema.safeParse({ tags: ['a'.repeat(41)] })
    expect(over.success).toBe(false)
    expect(over.success ? null : over.error.issues[0].path).toEqual(['tags', 0])
  })

  it('rejects a tag containing illegal characters with the same VALIDATION_FAILED path', () => {
    const r = patchPostBodySchema.safeParse({ tags: ['Bad Tag!'] })
    expect(r.success).toBe(false)
    expect(r.success ? null : r.error.issues[0].path).toEqual(['tags', 0])
  })

  it('null is acceptable for nullable text fields', () => {
    const r = patchPostBodySchema.safeParse({
      excerpt: null,
      meta_title: null,
      meta_description: null,
    })
    expect(r.success).toBe(true)
  })

  it('rejects unknown fields (.strict)', () => {
    const r = patchPostBodySchema.safeParse({ status: 'published' })
    expect(r.success).toBe(false)
  })

  it('happy path — partial update with multiple fields all within caps', () => {
    const r = patchPostBodySchema.safeParse({
      title:            'A reasonable title',
      excerpt:          'A short excerpt that fits.',
      meta_description: 'A short meta description for snippet rendering.',
      tags:             ['web3', 'agents', 'ai'],
      author_name:      'Arnab Ray',
    })
    expect(r.success).toBe(true)
  })
})

describe('listQuerySchema', () => {
  it('accepts an absent status', () => {
    expect(listQuerySchema.safeParse({}).success).toBe(true)
  })

  it('accepts status=draft and status=published', () => {
    expect(listQuerySchema.safeParse({ status: 'draft' }).success).toBe(true)
    expect(listQuerySchema.safeParse({ status: 'published' }).success).toBe(true)
  })

  it('rejects an unknown status enum value', () => {
    expect(listQuerySchema.safeParse({ status: 'archived' }).success).toBe(false)
  })
})
