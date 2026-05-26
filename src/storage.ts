// Persistence layer — raw clock hours, independent of dayStart.
// clockToTrack is applied at render time so changing dayStart shifts data correctly.

import { EventType, Day, clockToTrack } from './data'

export interface StoredEvent {
  type: EventType
  h: number // decimal clock hour, e.g. 23.5 = 11:30 PM
  note?: string
}

export interface StoredSleep {
  start: number // decimal clock hour
  end: number | null // null = still sleeping
}

export interface StoredNight {
  date: string // YYYY-MM-DD of the calendar day when night started (at dayStart hour)
  sleeps: StoredSleep[]
  events: StoredEvent[]
}

export interface StoredState {
  nights: StoredNight[]
}

const KEY = 'moonling-owly-v1'

// Defensive parse: if the persisted blob is corrupt or has an unexpected shape
// (older schema, hand-edited, mismatched type) we throw out the bad bits
// instead of letting the app crash with a white screen.
function isValidEvent(e: unknown): e is StoredEvent {
  if (!e || typeof e !== 'object') return false
  const ev = e as { type?: unknown; h?: unknown; note?: unknown }
  return (
    (ev.type === 'A' || ev.type === 'C' || ev.type === 'X') &&
    typeof ev.h === 'number' && Number.isFinite(ev.h) && ev.h >= 0 && ev.h < 48 &&
    (ev.note === undefined || typeof ev.note === 'string')
  )
}

function isValidSleep(s: unknown): s is StoredSleep {
  if (!s || typeof s !== 'object') return false
  const sl = s as { start?: unknown; end?: unknown }
  if (typeof sl.start !== 'number' || !Number.isFinite(sl.start)) return false
  if (sl.end !== null && (typeof sl.end !== 'number' || !Number.isFinite(sl.end))) return false
  return true
}

function isValidNight(n: unknown): n is StoredNight {
  if (!n || typeof n !== 'object') return false
  const night = n as { date?: unknown; sleeps?: unknown; events?: unknown }
  if (typeof night.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(night.date)) return false
  if (!Array.isArray(night.sleeps) || !Array.isArray(night.events)) return false
  return night.sleeps.every(isValidSleep) && night.events.every(isValidEvent)
}

export function load(): StoredState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { nights: [] }
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || !Array.isArray((parsed as { nights?: unknown }).nights)) {
      return { nights: [] }
    }
    // Drop nights that don't match the expected shape rather than blowing up.
    const validNights = (parsed.nights as unknown[]).filter(isValidNight)
    return { nights: validNights }
  } catch {
    return { nights: [] }
  }
}

export function save(state: StoredState) {
  localStorage.setItem(KEY, JSON.stringify(state))
}

// Current decimal clock hour from real wall clock
export function nowClockHour(): number {
  const d = new Date()
  return d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600
}

// ISO date string (YYYY-MM-DD) for the night that starts at dayStart on a given clock hour.
// If we're before dayStart, the night started yesterday.
export function nightDate(dayStart: number): string {
  const h = nowClockHour()
  const d = new Date()
  if (h < dayStart) d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

// Convert StoredNight[] → Day[] for the grid/timeline components
export function nightsToDays(nights: StoredNight[], dayStart: number): Day[] {
  return nights.map(n => {
    const sleeps: [number, number][] = []
    for (const s of n.sleeps) {
      const start = clockToTrack(s.start, dayStart)
      // end is null (ongoing) → use current track position
      const endH = s.end !== null ? s.end : nowClockHour()
      let end = clockToTrack(endH, dayStart)
      // If end wraps before start (crosses midnight), add 1440.
      // Strictly less-than: end===start means duration 0 (just started), not 24h.
      if (end < start) end += 1440
      sleeps.push([start, end])
    }
    const d = new Date(n.date)
    const label = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][d.getUTCDay()]
    const dayNum = String(d.getUTCDate()).padStart(2, '0')
    const lastSleep = n.sleeps[n.sleeps.length - 1]
    const inProgress = !!lastSleep && lastSleep.end === null
    return {
      d: dayNum,
      label,
      date: n.date,
      sleeps,
      events: n.events.map(e => ({
        type: e.type,
        t: clockToTrack(e.h, dayStart),
        ...(e.note ? { note: e.note } : {}),
      })),
      inProgress,
    } satisfies Day
  })
}

// Find or create tonight's StoredNight
export function getOrCreateTonight(nights: StoredNight[], dayStart: number): { nights: StoredNight[]; idx: number } {
  const today = nightDate(dayStart)
  const idx = nights.findIndex(n => n.date === today)
  if (idx >= 0) return { nights, idx }
  const updated = [...nights, { date: today, sleeps: [], events: [] }]
  return { nights: updated, idx: updated.length - 1 }
}
