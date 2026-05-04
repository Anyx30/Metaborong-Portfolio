'use client'

import { useState } from 'react'

export type DeviceTier = 'low' | 'mid' | 'high'

function detectTier(): DeviceTier {
  // Privacy-mode Safari and older Firefox can return 0 or undefined; fall back
  // to 'mid' rather than 'low' so most visitors don't get the degraded path.
  const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency : 0
  if (!cores) return 'mid'
  if (cores >= 8) return 'high'
  if (cores >= 4) return 'mid'
  return 'low'
}

/**
 * Coarse hardware-tier classification from `navigator.hardwareConcurrency`.
 * Lazy useState initializer captures the real tier on first client render,
 * so per-mount allocations (drift particle buffer, etc.) size correctly
 * without a re-render flash.
 */
export function useDeviceTier(): DeviceTier {
  const [tier] = useState<DeviceTier>(() => {
    if (typeof navigator === 'undefined') return 'mid'
    return detectTier()
  })
  return tier
}
