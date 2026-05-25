import { useState } from 'react'
import { Icon } from './Icon'
import { SheetGrid } from './SheetGrid'
import { Day, totalSleepHours, nightSleepHours, nightWakeups, fmtTrackMin } from '../data'

interface SheetScreenProps {
  days: Day[]
  state: 'empty' | 'tracking' | 'complete'
  dayStart: number
  childName: string
  childAge: string
  onClosePeriod: () => void
  onShare: () => void
}

const MESES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
const fmtDate = (iso: string) => { const d = new Date(iso); return `${d.getUTCDate()} ${MESES[d.getUTCMonth()]}` }

function fmtDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (h === 0) return `${m}m`
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

function exportText(days: Day[], dayStart: number, childName: string, childAge: string): string {
  const now = new Date()
  const header = [
    'MOONLING OWLY — Diario de sueño',
    childName ? `Bebé: ${childName}${childAge ? ` · ${childAge}` : ''}` : '',
    `Exportado: ${fmtDate(now.toISOString().split('T')[0])} ${now.getFullYear()}`,
    `${days.length} noches registradas`,
    '',
    '─'.repeat(40),
  ].filter(l => l !== null).join('\n')

  const body = days.map((day, i) => {
    const sleepTotal = day.sleeps.reduce((s, [a, b]) => s + (b - a), 0)
    const lines: string[] = [`Noche ${i + 1} · ${day.label} ${day.d} ${MESES[parseInt(day.date.split('-')[1]) - 1]}`]

    for (const [s, e] of day.sleeps) {
      lines.push(`  ${fmtTrackMin(s, dayStart)} → ${fmtTrackMin(e, dayStart)}  (${fmtDuration(e - s)})`)
    }

    const eventLabels: Record<string, string> = { A: 'Toma', C: 'Colecho', X: 'Nota' }
    for (const ev of day.events || []) {
      const label = eventLabels[ev.type] ?? ev.type
      const noteStr = ev.note ? `  "${ev.note}"` : ''
      lines.push(`  ${fmtTrackMin(ev.t, dayStart)} — ${label}${noteStr}`)
    }

    if (sleepTotal > 0) lines.push(`  Total: ${fmtDuration(sleepTotal)}`)
    return lines.join('\n')
  }).join('\n\n')

  return `${header}\n\n${body}\n`
}

export function SheetScreen({ days, state, dayStart, childName, childAge, onClosePeriod, onShare }: SheetScreenProps) {
  const [selectedRow, setSelectedRow] = useState<number>(() => Math.max(0, (days?.length ?? 1) - 1))

  if (state === 'empty' || !days.length) {
    return (
      <div className="screen-inner">
        <div className="sheet-head">
          <div className="sheet-eyebrow">Diario · 0 noches</div>
          <h1 className="sheet-title">Tu diario<br /><em className="serif-italic">te espera</em></h1>
          <div className="sheet-meta"><span>Empieza en cuanto registres tu primera noche.</span></div>
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
  const totalSleep = totalSleepHours(days)
  const avgNight = days.reduce((s, d) => s + nightSleepHours(d, dayStart), 0) / totalNights
  const totalWakeups = days.reduce((s, d) => s + nightWakeups(d), 0)
  const firstDate = days[0].date
  const lastDate = days[totalNights - 1].date
  const dateRange = firstDate === lastDate ? fmtDate(firstDate) : `${fmtDate(firstDate)} — ${fmtDate(lastDate)}`
  const year = new Date(lastDate).getUTCFullYear()

  const sel = days[selectedRow] ?? days[days.length - 1]
  const selIdx = selectedRow >= 0 && selectedRow < days.length ? selectedRow : days.length - 1

  const handleExport = () => {
    const text = exportText(days, dayStart, childName, childAge)
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `moonling-owly-${lastDate}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Build event log for selected day
  type LogItem = { time: string; label: string; kind: string; note?: string }
  const log: LogItem[] = []
  for (const [s, e] of sel.sleeps) {
    log.push({ time: fmtTrackMin(s, dayStart), label: 'Inicio de sueño', kind: 'sleep_start' })
    if (!sel.inProgress || e < sel.sleeps[sel.sleeps.length - 1][1]) {
      log.push({ time: fmtTrackMin(e, dayStart), label: 'Despertar', kind: 'sleep_end' })
    }
  }
  for (const ev of sel.events || []) {
    const labels: Record<string, string> = { A: 'Toma', C: 'Colecho', X: 'Nota' }
    const kinds: Record<string, string> = { A: 'feeding', C: 'cosleep', X: 'incident' }
    log.push({ time: fmtTrackMin(ev.t, dayStart), label: labels[ev.type], kind: kinds[ev.type], note: ev.note })
  }
  log.sort((a, b) => a.time.localeCompare(b.time))

  const iconFor: Record<string, string> = { sleep_start: 'sleep-start', sleep_end: 'sleep-end', feeding: 'feed', cosleep: 'cosleep', incident: 'note' }
  const sleepTotal = sel.sleeps.reduce((s, [a, b]) => s + (b - a), 0)

  return (
    <div className="screen-inner">
      <div className="sheet-head">
        <div className="sheet-head-top">
          <div className="sheet-eyebrow">Diario · {totalNights} {totalNights === 1 ? 'noche' : 'noches'}</div>
          <button className="sheet-menu" onClick={onClosePeriod} aria-label="Cerrar diario">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="19" cy="12" r="1.7" /></svg>
          </button>
        </div>
        <h1 className="sheet-title">Mi diario<br /><em className="serif-italic">de sueño</em></h1>
        <div className="sheet-meta">
          {childName && <span>de <b>{childName}</b></span>}
          <span><b>{dateRange}</b>, {year}</span>
          <span><b>{totalNights}</b> {totalNights === 1 ? 'noche' : 'noches'}</span>
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
        <div className="legend-item"><span className="legend-swatch bar"></span><span>dormido</span></div>
        <div className="legend-item"><span className="legend-swatch dot dot-feed"><Icon name="feed" size={10} stroke={2.4}/></span><span>toma</span></div>
        <div className="legend-item"><span className="legend-swatch dot dot-co"><Icon name="cosleep" size={10} stroke={2.4}/></span><span>colecho</span></div>
        <div className="legend-item"><span className="legend-swatch dot dot-x"><Icon name="note" size={10} stroke={2.4}/></span><span>nota</span></div>
      </div>

      <div className="stats-row">
        <div className="stat">
          <div className="stat-label">Media / noche</div>
          <div className="stat-val">{avgNight.toFixed(1)}<small>h</small></div>
        </div>
        <div className="stat">
          <div className="stat-label">Total {totalNights}d</div>
          <div className="stat-val">{Math.round(totalSleep)}<small>h</small></div>
        </div>
        <div className="stat">
          <div className="stat-label">Despertares</div>
          <div className="stat-val">{totalWakeups}</div>
        </div>
      </div>

      {/* Day detail log */}
      <div className="day-log">
        <div className="day-log-head">
          <div className="day-log-title">
            Noche {selIdx + 1}
            <span className="day-log-date">{sel.label} {sel.d} {MESES[parseInt(sel.date.split('-')[1]) - 1]}</span>
          </div>
          {sleepTotal > 0 && <div className="day-log-total mono">{fmtDuration(sleepTotal)}</div>}
        </div>
        {log.length === 0
          ? <div className="day-log-empty">Sin entradas.</div>
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
          <div className="diario-share-eyebrow">para tu pediatra</div>
          <h2 className="diario-share-title">Cuando estés listo,<br/>compártelo.</h2>
        </div>
        <button className="share-cta" onClick={onShare}>
          <Icon name="share" size={18}/>
          <span>Compartir imagen</span>
        </button>
        <button className="export-txt-btn" onClick={handleExport}>
          <span style={{ fontSize: 15 }}>↓</span>
          <span>Descargar datos (.txt)</span>
        </button>
        {state === 'complete' &&
          <button className="close-period-btn" onClick={onClosePeriod}>
            Cerrar este diario y empezar uno nuevo
          </button>
        }
      </div>
    </div>
  )
}
