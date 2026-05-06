import { describe, it, expect, vi } from 'vitest'

// `server-only` throws on non-Next contexts; the unit-test layer doesn't
// need its real implementation. Same shim as the route tests.
vi.mock('server-only', () => ({}))

import {
  decodeCursor,
  encodeCursor,
  sanitizeOriginalFilename,
  sniffImageFormat,
} from './images'

describe('sniffImageFormat', () => {
  it('detects JPEG by magic bytes', () => {
    const jpg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0])
    expect(sniffImageFormat(jpg)).toBe('jpeg')
  })

  it('detects PNG by 8-byte signature', () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0])
    expect(sniffImageFormat(png)).toBe('png')
  })

  it('detects WebP via RIFF/WEBP container', () => {
    const webp = Buffer.from([
      0x52, 0x49, 0x46, 0x46, 0xff, 0xff, 0xff, 0xff,
      0x57, 0x45, 0x42, 0x50,
    ])
    expect(sniffImageFormat(webp)).toBe('webp')
  })

  it('rejects GIF (47 49 46 38) — common disguise candidate', () => {
    const gif = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0, 0, 0, 0, 0, 0])
    expect(sniffImageFormat(gif)).toBeNull()
  })

  it('rejects BMP (42 4D)', () => {
    const bmp = Buffer.from([0x42, 0x4d, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    expect(sniffImageFormat(bmp)).toBeNull()
  })

  it('rejects an undersized buffer', () => {
    expect(sniffImageFormat(Buffer.from([0xff, 0xd8]))).toBeNull()
  })
})

describe('encodeCursor / decodeCursor', () => {
  it('round-trips a (createdAt, id) tuple via base64url', () => {
    const ts = new Date('2026-05-06T12:34:56.123Z')
    const id = '11111111-2222-4333-8444-555555555555'
    const c = encodeCursor(ts, id)
    expect(c).toBeTypeOf('string')
    expect(c).not.toMatch(/[+/=]/) // base64url, not base64
    const back = decodeCursor(c)
    expect(back).not.toBeNull()
    expect(back!.createdAt.toISOString()).toBe(ts.toISOString())
    expect(back!.id).toBe(id)
  })

  it('accepts an ISO string for createdAt too', () => {
    const c = encodeCursor('2026-05-06T00:00:00.000Z', 'abc')
    expect(decodeCursor(c)?.id).toBe('abc')
  })

  it('returns null for garbage input', () => {
    expect(decodeCursor('!!!')).toBeNull()
  })

  it('returns null when separator is missing', () => {
    const noSep = Buffer.from('no-pipe-here', 'utf8').toString('base64url')
    expect(decodeCursor(noSep)).toBeNull()
  })

  it('returns null when timestamp is unparseable', () => {
    const bad = Buffer.from('not-a-date|some-id', 'utf8').toString('base64url')
    expect(decodeCursor(bad)).toBeNull()
  })

  it('returns null when id is empty', () => {
    const noId = Buffer.from('2026-05-06T00:00:00.000Z|', 'utf8').toString('base64url')
    expect(decodeCursor(noId)).toBeNull()
  })
})

describe('sanitizeOriginalFilename', () => {
  it('strips POSIX path components', () => {
    expect(sanitizeOriginalFilename('/etc/passwd')).toBe('passwd')
  })

  it('strips Windows path components', () => {
    expect(sanitizeOriginalFilename('C:\\evil\\name.png')).toBe('name.png')
  })

  it('strips embedded NUL and other control characters', () => {
    const dirty = String.fromCharCode(0,7,9,127)
    expect(sanitizeOriginalFilename("hi" + dirty + "you.jpg")).toBe("hiyou.jpg")
  })

  it('replaces Windows-illegal punctuation with underscores', () => {
    expect(sanitizeOriginalFilename('a<b>c:d"e|f?g*h.jpg')).toBe('a_b_c_d_e_f_g_h.jpg')
  })

  it('falls back to "unnamed" for null / undefined / empty', () => {
    expect(sanitizeOriginalFilename(null)).toBe('unnamed')
    expect(sanitizeOriginalFilename(undefined)).toBe('unnamed')
    expect(sanitizeOriginalFilename('')).toBe('unnamed')
  })

  it('falls back to "unnamed" when the input is whitespace-only', () => {
    expect(sanitizeOriginalFilename('   ')).toBe('unnamed')
  })

  it('caps the result at 200 characters', () => {
    const long = 'a'.repeat(500) + '.png'
    expect(sanitizeOriginalFilename(long)).toHaveLength(200)
  })
})
