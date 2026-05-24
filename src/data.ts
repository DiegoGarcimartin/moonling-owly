// Moonling Owly — data + helpers, parameterized by dayStart.
// dayStart = the clock hour a "night/day" begins (e.g. 19 = 7 PM).
// Track minutes are 0..1440 starting from dayStart.

export type EventType = 'A' | 'C' | 'X'

export interface DayEvent {
  type: EventType
  t: number // track minutes
}

export interface Day {
  d: string
  label: string
  sleeps: [number, number][] // track minutes
  events: DayEvent[]
  inProgress?: boolean
}

export function getHours(dayStart = 19): number[] {
  const arr: number[] = []
  for (let i = 0; i < 24; i++) {
    let h = (dayStart + i) % 24
    if (h === 0) h = 24
    arr.push(h)
  }
  return arr
}

export function clockToTrack(h: number, dayStart = 19): number {
  const normH = h >= 24 ? h - 24 : h
  return ((normH - dayStart + 24) % 24) * 60
}

export function trackToClock(min: number, dayStart = 19): { h: number; m: number } {
  const totalMin = Math.round(((min % 1440) + 1440) % 1440)
  const h = (dayStart + Math.floor(totalMin / 60)) % 24
  const m = totalMin % 60
  return { h, m }
}

export function fmt12(h: number, m = 0): string {
  h = Math.round(h)
  m = Math.round(m)
  const period = h >= 12 && h < 24 ? 'PM' : 'AM'
  let hh = h % 12
  if (hh === 0) hh = 12
  const mm = String(m).padStart(2, '0')
  return `${hh}:${mm} ${period}`
}

export function fmtTrackMin(min: number, dayStart = 19): string {
  const { h, m } = trackToClock(min, dayStart)
  return fmt12(h, m)
}

// Sample data stored as raw clock times (independent of dayStart)
const SAMPLE_RAW = [
  { d: '07', label: 'mon', sleeps: [[21.5, 6.75 + 24], [13.0, 14.5]], events: [{ type: 'A', h: 21.25 }, { type: 'X', h: 2.166 + 24 }] },
  { d: '08', label: 'tue', sleeps: [[21.0, 7.0 + 24], [12.5, 14.0]], events: [{ type: 'A', h: 21.0 }, { type: 'X', h: 3.5 + 24 }, { type: 'C', h: 4.0 + 24 }] },
  { d: '09', label: 'wed', sleeps: [[22.0, 5.5 + 24], [6.0 + 24, 7.25 + 24], [13.25, 14.5]], events: [{ type: 'X', h: 5.5 + 24 }, { type: 'A', h: 5.75 + 24 }] },
  { d: '10', label: 'thu', sleeps: [[21.25, 6.0 + 24], [13.0, 14.75]], events: [{ type: 'A', h: 21.0 }, { type: 'X', h: 1.25 + 24 }] },
  { d: '11', label: 'fri', sleeps: [[20.75, 4.0 + 24], [4.5 + 24, 6.75 + 24], [13.5, 14.5]], events: [{ type: 'X', h: 4.0 + 24 }, { type: 'A', h: 4.25 + 24 }, { type: 'C', h: 4.5 + 24 }] },
  { d: '12', label: 'sat', sleeps: [[21.75, 7.5 + 24], [13.0, 14.25]], events: [{ type: 'A', h: 21.5 }] },
  { d: '13', label: 'sun', sleeps: [[21.5, 6.5 + 24], [13.25, 14.5]], events: [{ type: 'A', h: 21.25 }, { type: 'X', h: 3.0 + 24 }] },
  { d: '14', label: 'mon', sleeps: [[21.0, 5.0 + 24], [5.5 + 24, 6.75 + 24], [12.75, 14.25]], events: [{ type: 'X', h: 5.0 + 24 }, { type: 'A', h: 5.25 + 24 }] },
  { d: '15', label: 'tue', sleeps: [[20.5, 3.5 + 24], [4.0 + 24, 7.0 + 24], [13.0, 14.5]], events: [{ type: 'A', h: 20.5 }, { type: 'X', h: 3.5 + 24 }, { type: 'C', h: 4.0 + 24 }] },
  { d: '16', label: 'wed', sleeps: [[21.25, 7.0 + 24], [13.5, 14.5]], events: [{ type: 'A', h: 21.0 }] },
  { d: '17', label: 'thu', sleeps: [[21.75, 6.5 + 24], [13.0, 14.0]], events: [{ type: 'A', h: 21.5 }, { type: 'X', h: 2.75 + 24 }] },
  { d: '18', label: 'fri', sleeps: [[22.0, 4.25 + 24], [4.75 + 24, 7.0 + 24], [13.25, 14.5]], events: [{ type: 'A', h: 22.0 }, { type: 'X', h: 4.25 + 24 }, { type: 'C', h: 4.75 + 24 }] },
  { d: '19', label: 'sat', sleeps: [[21.5, 7.5 + 24], [13.5, 15.0]], events: [{ type: 'A', h: 21.25 }] },
  { d: '20', label: 'sun', sleeps: [[21.25, 23.666]], events: [{ type: 'A', h: 21.0 }, { type: 'X', h: 23.25 }], inProgress: true },
]

export function buildDays(dayStart = 19): Day[] {
  return SAMPLE_RAW.map(raw => ({
    d: raw.d,
    label: raw.label,
    inProgress: raw.inProgress,
    sleeps: raw.sleeps.map(([s, e]) => {
      let ts = clockToTrack(s, dayStart)
      let te = clockToTrack(e, dayStart)
      if (te <= ts) te += 1440
      return [ts, te] as [number, number]
    }),
    events: raw.events.map(ev => ({ type: ev.type as EventType, t: clockToTrack(ev.h, dayStart) })),
  }))
}

export function totalSleepHours(days: Day[]): number {
  let total = 0
  for (const d of days) for (const [s, e] of d.sleeps) total += (e - s) / 60
  return total
}

export function nightSleepHours(day: Day, dayStart = 19): number {
  let total = 0
  const cap = 14 * 60
  for (const [s, e] of day.sleeps) {
    if (s >= cap) continue
    const b = Math.min(e, cap)
    if (b > s) total += (b - s) / 60
  }
  return total
}

export function nightWakeups(day: Day): number {
  const cap = 14 * 60
  const nightSleeps = day.sleeps.filter(([s]) => s < cap).sort((a, b) => a[0] - b[0])
  return Math.max(0, nightSleeps.length - 1)
}
