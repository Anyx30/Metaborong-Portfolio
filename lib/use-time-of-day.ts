'use client'

import { useEffect, useState } from 'react'

export type PartOfDay = 'morning' | 'midday' | 'evening' | 'night'

export interface TimeOfDayState {
  hour:        number
  partOfDay:   PartOfDay
  hueShiftDeg: number
}

const DEFAULT_STATE: TimeOfDayState = { hour: 12, partOfDay: 'midday', hueShiftDeg: 0 }

function partOfDayFor(hour: number): PartOfDay {
  if (hour >= 5  && hour <  9) return 'morning'
  if (hour >= 9  && hour < 17) return 'midday'
  if (hour >= 17 && hour < 21) return 'evening'
  return 'night'
}

function hueShiftFor(part: PartOfDay): number {
  switch (part) {
    case 'morning': return  12
    case 'midday':  return   0
    case 'evening': return  18
    case 'night':   return -10
  }
}

function compute(): TimeOfDayState {
  const hour = new Date().getHours()
  const part = partOfDayFor(hour)
  return { hour, partOfDay: part, hueShiftDeg: hueShiftFor(part) }
}

/**
 * Visitor's local time-of-day partition + a hue offset for ambient orb tinting.
 * The lazy useState initializer reads compute() synchronously on the first
 * client render so consumers that capture-once (orb-scene's useMemo with []
 * deps) get the real value immediately. After mount, state only updates when
 * partOfDay actually changes — every-minute setInterval ticks are filtered.
 */
export function useTimeOfDay(): TimeOfDayState {
  const [state, setState] = useState<TimeOfDayState>(() => {
    if (typeof window === 'undefined') return DEFAULT_STATE
    return compute()
  })

  useEffect(() => {
    const tick = () => {
      const next = compute()
      setState(prev => (prev.partOfDay === next.partOfDay ? prev : next))
    }
    const id = setInterval(tick, 60_000)
    return () => clearInterval(id)
  }, [])

  return state
}
