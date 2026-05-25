import { Icon } from './Icon'
import { SheetGrid } from './SheetGrid'
import { Day, totalSleepHours, nightSleepHours, nightWakeups } from '../data'

interface SheetScreenProps {
  days: Day[]
  state: 'empty' | 'tracking' | 'complete'
  dayStart: number
  childName: string
  onClosePeriod: () => void
  onShare: () => void
}

export function SheetScreen({ days, state, dayStart, childName, onClosePeriod, onShare }: SheetScreenProps) {
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
              <SheetGrid dayStart={dayStart} days={Array.from({ length: 7 }, (_, i) => ({
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

  const MESES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  const fmtDate = (iso: string) => { const d = new Date(iso); return `${d.getUTCDate()} ${MESES[d.getUTCMonth()]}` }
  const firstDate = days[0].date
  const lastDate = days[totalNights - 1].date
  const dateRange = firstDate === lastDate ? fmtDate(firstDate) : `${fmtDate(firstDate)} — ${fmtDate(lastDate)}`
  const year = new Date(lastDate).getUTCFullYear()

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
        <SheetGrid days={days} dayStart={dayStart} />
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

      {/* Notas de todos los días */}
      {(() => {
        const notes = days.flatMap((d, i) =>
          (d.events || [])
            .filter(ev => ev.note)
            .map(ev => ({ dayNum: i + 1, date: fmtDate(d.date), note: ev.note! }))
        )
        if (!notes.length) return null
        return (
          <div className="notes-section">
            <div className="notes-title">Notas</div>
            {notes.map((n, i) => (
              <div className="note-row" key={i}>
                <span className="note-meta mono">noche {n.dayNum} · {n.date}</span>
                <span className="note-text">{n.note}</span>
              </div>
            ))}
          </div>
        )
      })()}

      <div className="diario-share">
        <div className="diario-share-head">
          <div className="diario-share-eyebrow">para tu pediatra</div>
          <h2 className="diario-share-title">Cuando estés listo,<br/>compártelo.</h2>
          <p className="diario-share-sub">Formato clínico estándar. Previsualiza antes de enviar.</p>
        </div>
        <button className="share-cta" onClick={onShare}>
          <Icon name="share" size={18}/>
          <span>Compartir / Imprimir</span>
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
