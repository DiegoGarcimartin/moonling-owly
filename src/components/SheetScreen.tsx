import { useState } from 'react'
import { Icon } from './Icon'
import { SheetGrid } from './SheetGrid'
import { Day, totalSleepHours, nightSleepHours, nightWakeups, fmtTrackMin, getHours, fmt12 } from '../data'
import { t, MONTHS, weekdayFromKey } from '../lib/i18n'

interface SheetScreenProps {
  days: Day[]
  state: 'empty' | 'tracking' | 'complete'
  dayStart: number
  childName: string
  childAge: string
  onClosePeriod: () => void
  onShare: () => void
}

const MESES = MONTHS
const fmtDate = (iso: string) => { const d = new Date(iso); return `${d.getUTCDate()} ${MESES[d.getUTCMonth()]}` }

function fmtDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (h === 0) return `${m}m`
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

function exportCsvGrid(days: Day[], dayStart: number, childName: string, childAge: string): string {
  // CSV injection hardening: a leading =, +, -, @, tab or CR makes spreadsheet
  // apps treat the cell as a formula (potentially executing system commands
  // via DDE in Excel). Prefix any such value with a single quote so it stays
  // visible text but is no longer an active formula.
  const csvSafe = (s: string) => (/^[=+\-@\t\r]/.test(s) ? "'" + s : s)
  const q = (s: string) => `"${csvSafe(s).replace(/"/g, '""')}"`
  // Strip newlines from meta header too — they'd break the leading `#` comment line.
  const safeName = childName.replace(/[\r\n]+/g, ' ')
  const safeAge = childAge.replace(/[\r\n]+/g, ' ')

  // 24 hour columns from dayStart
  const hours = getHours(dayStart) // e.g. [19,20,21,22,23,24,1,2,...,18]
  const hourLabels = hours.map(h => fmt12(h, 0)) // e.g. "7:00 PM", "12:00 AM"…

  const headers = [t.csvDay, ...hourLabels].map(q)

  const rows = days.map(day => {
    const mes = MESES[parseInt(day.date.split('-')[1]) - 1]
    const dayLabel = `${weekdayFromKey(day.label).toUpperCase()} ${day.d} ${mes}`

    const cells = hours.map((_, colIdx) => {
      const cellStart = colIdx * 60
      const cellEnd = cellStart + 60

      // Is baby sleeping any portion of this hour?
      const sleeping = day.sleeps.some(([s, e]) => s < cellEnd && e > cellStart)

      // Events in this hour
      const events = (day.events || []).filter(ev => ev.t >= cellStart && ev.t < cellEnd)

      const parts: string[] = []
      if (sleeping) parts.push('Z')
      for (const ev of events) {
        const name = ev.type === 'A' ? t.feeding : ev.type === 'C' ? t.cosleep : t.note
        parts.push(ev.note ? `${name} (${ev.note})` : name)
      }

      return q(parts.join(' · '))
    })

    return [q(dayLabel), ...cells].join(',')
  })

  // Sanitize meta too: even though it starts with `#`, Excel ignores the prefix
  // and parses the rest as a row. Run it through csvSafe so a name like
  // `=cmd|' /c calc'!A1` cannot fire a formula either.
  const metaLine = safeName ? `${csvSafe(safeName)}${safeAge ? ` · ${csvSafe(safeAge)}` : ''} — Moonling Owly` : ''
  const meta = metaLine ? `# ${metaLine}\n` : ''
  return `${meta}${headers.join(',')}\n${rows.join('\n')}\n`
}

export function SheetScreen({ days, state, dayStart, childName, childAge, onClosePeriod, onShare }: SheetScreenProps) {
  const [selectedRow, setSelectedRow] = useState<number>(() => Math.max(0, (days?.length ?? 1) - 1))

  if (state === 'empty' || !days.length) {
    return (
      <div className="screen-inner">
        <div className="sheet-head">
          <div className="sheet-eyebrow">{t.diaryEyebrow(0)}</div>
          <h1 className="sheet-title">{t.emptyDiaryTitle1}<br /><em className="serif-italic">{t.emptyDiaryTitle2}</em></h1>
          <div className="sheet-meta"><span>{t.emptyDiarySub}</span></div>
        </div>
        <div className="sheet-paper">
          <div className="empty-grid">
            <div className="empty-grid-fade">
              <SheetGrid dayStart={dayStart} days={Array.from({ length: 7 }, () => ({
                d: '—', label: '—', date: '', sleeps: [] as [number,number][], events: [],
              }))} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const totalNights = days.length
  const recordedNights = days.filter(d => d.sleeps.length > 0).length
  const totalSleep = totalSleepHours(days)
  const avgNight = recordedNights > 0
    ? days.reduce((s, d) => s + nightSleepHours(d, dayStart), 0) / recordedNights
    : 0
  const totalWakeups = days.reduce((s, d) => s + nightWakeups(d), 0)
  const firstDate = days[0].date
  const lastDate = days[totalNights - 1].date
  const dateRange = firstDate === lastDate ? fmtDate(firstDate) : `${fmtDate(firstDate)} — ${fmtDate(lastDate)}`
  const year = new Date(lastDate).getUTCFullYear()

  const sel = days[selectedRow] ?? days[days.length - 1]
  const selIdx = selectedRow >= 0 && selectedRow < days.length ? selectedRow : days.length - 1

  const handleExport = () => {
    const csv = exportCsvGrid(days, dayStart, childName, childAge)
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `moonling-owly-${lastDate}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Build event log for selected day
  type LogItem = { time: string; label: string; kind: string; note?: string }
  const log: LogItem[] = []
  for (const [s, e] of sel.sleeps) {
    log.push({ time: fmtTrackMin(s, dayStart), label: t.sleepStart, kind: 'sleep_start' })
    if (!sel.inProgress || e < sel.sleeps[sel.sleeps.length - 1][1]) {
      log.push({ time: fmtTrackMin(e, dayStart), label: t.sleepEnd, kind: 'sleep_end' })
    }
  }
  for (const ev of sel.events || []) {
    const labels: Record<string, string> = { A: t.feeding, C: t.cosleep, X: t.note }
    const kinds: Record<string, string> = { A: 'feeding', C: 'cosleep', X: 'incident' }
    log.push({ time: fmtTrackMin(ev.t, dayStart), label: labels[ev.type], kind: kinds[ev.type], note: ev.note })
  }
  log.sort((a, b) => a.time.localeCompare(b.time))

  const iconFor: Record<string, string> = { sleep_start: 'sleep-start', sleep_end: 'sleep-end', feeding: 'feed', cosleep: 'cosleep', incident: 'note' }
  // Don't count the in-progress sleep towards the per-night total;
  // showing e.g. "11h 12m" when half of it is just "still asleep, who knows
  // when they'll wake up" misleads the pediatrician reading the diary.
  const sleepTotal = sel.sleeps.reduce((sum, [a, b]) => {
    if (sel.openSleepStart !== undefined && a === sel.openSleepStart) return sum
    return sum + (b - a)
  }, 0)

  return (
    <div className="screen-inner">
      <div className="sheet-head">
        <div className="sheet-head-top">
          <div className="sheet-eyebrow">{t.diaryEyebrow(totalNights)}</div>
          <button className="sheet-menu" onClick={onClosePeriod} aria-label={t.ariaClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="19" cy="12" r="1.7" /></svg>
          </button>
        </div>
        <h1 className="sheet-title">{t.myDiaryTitle1}<br /><em className="serif-italic">{t.myDiaryTitle2}</em></h1>
        <div className="sheet-meta">
          {childName && <span>{t.diaryOf(childName).pre}<b>{childName}</b></span>}
          <span><b>{dateRange}</b>, {year}</span>
          <span><b>{totalNights}</b> {t.dayWord(totalNights)}</span>
        </div>
      </div>

      <div className="sheet-paper">
        <SheetGrid
          days={days}
          dayStart={dayStart}
          selectedRow={selIdx}
          onRowClick={setSelectedRow}
        />
      </div>

      <div className="sheet-legend">
        <div className="legend-item"><span className="legend-swatch bar"></span><span>{t.legendAsleep}</span></div>
        <div className="legend-item"><span className="legend-swatch dot dot-feed"><Icon name="feed" size={10} stroke={2.4}/></span><span>{t.legendFeed}</span></div>
        <div className="legend-item"><span className="legend-swatch dot dot-co"><Icon name="cosleep" size={10} stroke={2.4}/></span><span>{t.legendCosleep}</span></div>
        <div className="legend-item"><span className="legend-swatch dot dot-x"><Icon name="note" size={10} stroke={2.4}/></span><span>{t.legendNote}</span></div>
      </div>

      <div className="stats-row">
        <div className="stat">
          <div className="stat-label">{t.statAvgPerDay}</div>
          <div className="stat-val">{avgNight.toFixed(1)}<small>h</small></div>
        </div>
        <div className="stat">
          <div className="stat-label">{t.statTotal(totalNights)}</div>
          <div className="stat-val">{Math.round(totalSleep)}<small>h</small></div>
        </div>
        <div className="stat">
          <div className="stat-label">{t.statWakeups}</div>
          <div className="stat-val">{totalWakeups}</div>
        </div>
      </div>

      {/* Day detail log */}
      <div className="day-log">
        <div className="day-log-head">
          <div className="day-log-title">
            {t.dayN(selIdx + 1)}
            <span className="day-log-date">{weekdayFromKey(sel.label)} {sel.d} {MESES[parseInt(sel.date.split('-')[1]) - 1]}</span>
          </div>
          {sleepTotal > 0 && <div className="day-log-total mono">{fmtDuration(sleepTotal)}</div>}
        </div>
        {log.length === 0
          ? <div className="day-log-empty">{t.noEntries}</div>
          : log.map((item, i) => (
            <div className="day-log-row" key={i}>
              <span className="day-log-time mono">{item.time}</span>
              <span className={`event-glyph-sm ${item.kind}`}><Icon name={iconFor[item.kind]} size={12} stroke={2.2}/></span>
              <span className="day-log-label">
                {item.label}
                {item.note && <span className="event-note">{item.note}</span>}
              </span>
            </div>
          ))
        }
      </div>

      <div className="diario-share">
        <div className="diario-share-head">
          <div className="diario-share-eyebrow">{t.forYourPediatrician}</div>
          <h2 className="diario-share-title">{t.shareWhenReady1}<br/>{t.shareWhenReady2}</h2>
        </div>
        <button className="share-cta" onClick={onShare}>
          <Icon name="share" size={18}/>
          <span>{t.shareImage}</span>
        </button>
        <button className="export-txt-btn" onClick={handleExport}>
          <span style={{ fontSize: 15 }}>↓</span>
          <span>{t.downloadCsv}</span>
        </button>
        {state === 'complete' &&
          <button className="close-period-btn" onClick={onClosePeriod}>
            {t.closeAndNew}
          </button>
        }
      </div>
    </div>
  )
}
