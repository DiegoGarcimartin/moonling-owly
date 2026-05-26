import { Icon } from './Icon'
import { Day, getHours, fmtTrackMin, clockToTrack, fmt12 } from '../data'
import { nowClockHour } from '../storage'

interface HomeScreenProps {
  days: Day[]
  state: 'empty' | 'tracking' | 'complete'
  sleeping: boolean
  dayStart: number
  onSleepToggle: () => void
  onQuickEvent: (type: 'A' | 'C' | 'X') => void
  onManual: () => void
  onDeleteEvent: (ev: { kind: string; t: number }) => void
  onEditEventNote: (ev: { kind: string; t: number; note?: string }) => void
  onClosePeriod: () => void
  onHelp: () => void
}

export function HomeScreen({ days, state, sleeping, dayStart, onSleepToggle, onQuickEvent, onManual, onDeleteEvent, onEditEventNote, onClosePeriod, onHelp }: HomeScreenProps) {
  const today = days && days.length ? days[days.length - 1] : null
  const HOURS_ARR = getHours(dayStart)
  const dayStartLabel = fmt12(dayStart, 0)

  const todayDate = new Date()
  const MESES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  const todayLabel = `${todayDate.getDate()} ${MESES[todayDate.getMonth()]}`

  if (state === 'empty' || !today) {
    return (
      <div className="screen-inner">
        <div className="empty-hero">
          <div className="empty-eyebrow">{todayLabel}</div>
          <h1 className="empty-title">Empieza<br /><em className="serif-italic">cuando quieras</em>.</h1>
          <p className="empty-sub">
            Pulsa el botón la primera vez que pongas al bebé a dormir.
            En 14 noches tendrás un diario listo para tu pediatra.
          </p>
        </div>
        <button className="primary-cta" onClick={onSleepToggle}>
          <div className="primary-cta-l">
            <div className="primary-cta-eyebrow">inicio</div>
            <div className="primary-cta-label">Inicio de sueño</div>
          </div>
          <div className="primary-cta-r">
            <div className="primary-cta-arrow">↓</div>
            <div>ahora</div>
          </div>
        </button>
        <div className="empty-aside">
          <span>o</span>
          <button className="manual-add prominent" onClick={onManual}>
            <Icon name="plus" size={16} />
            <span>Añadir entrada manual</span>
          </button>
        </div>
        <div className="first-guide">
          <div className="first-guide-eyebrow">Cómo funciona</div>
          <ul className="first-guide-list">
            <li><span className="first-guide-icon"><Icon name="sleep-start" size={16}/></span><span><b>Inicio de sueño.</b> Pulsa cuando empieces la rutina de sueño.</span></li>
            <li><span className="first-guide-icon"><Icon name="sleep-end" size={16}/></span><span><b>Despertar.</b> Pulsa cuando el bebé esté definitivamente despierto — no para despertares nocturnos.</span></li>
            <li><span className="first-guide-icon"><Icon name="feed" size={16}/></span><span><b>Toma.</b> Pulsa cada vez que des una toma (incluyendo antes de dormir).</span></li>
            <li><span className="first-guide-icon"><Icon name="cosleep" size={16}/></span><span><b>Colecho.</b> Pulsa si compartes cama en algún momento.</span></li>
            <li><span className="first-guide-icon"><Icon name="note" size={16}/></span><span><b>Nota.</b> Cualquier cosa inusual: llanto prolongado, movimientos, ronquidos…</span></li>
          </ul>
          <div className="first-guide-foot">
            Una <em>noche</em> va desde las <b className="mono">{dayStartLabel}</b> hasta las <b className="mono">{dayStartLabel}</b> del día siguiente. Puedes cambiarlo en ajustes.
          </div>
        </div>
      </div>
    )
  }

  const nowTrack = (() => {
    if (today.sleeps && today.sleeps.length) return today.sleeps[today.sleeps.length - 1][1]
    return clockToTrack(nowClockHour(), dayStart)
  })()
  const nowClock = fmtTrackMin(nowTrack, dayStart)
  const minToPct = (m: number) => m / 1440 * 100

  type EventListItem = { kind: string; t: number; label: string; note?: string }
  const eventList: EventListItem[] = []
  for (const [s, e] of today.sleeps || []) {
    eventList.push({ kind: 'sleep_start', t: s, label: 'Inicio de sueño' })
    if (!today.inProgress || e < nowTrack) eventList.push({ kind: 'sleep_end', t: e, label: 'Despertar' })
  }
  for (const ev of today.events || []) {
    const labels = { A: 'Toma', C: 'Colecho', X: 'Nota' }
    eventList.push({ kind: ev.type === 'A' ? 'feeding' : ev.type === 'C' ? 'cosleep' : 'incident', t: ev.t, label: labels[ev.type], note: ev.note })
  }
  eventList.sort((a, b) => a.t - b.t)
  eventList.reverse()

  const stripStops = [0, 5, 11, 17, 23].map(i => HOURS_ARR[i])
  const stripLabel = (h: number) => {
    const period = h >= 12 && h < 24 ? 'PM' : 'AM'
    let hh = h % 12
    if (hh === 0) hh = 12
    return `${hh} ${period}`
  }

  return (
    <div className="screen-inner">
      <div className="status-bar">
        <div className="status-state">
          <span className={`status-dot ${sleeping ? 'sleeping' : 'awake'}`}></span>
          {sleeping ? 'Durmiendo' : 'Despierto'}
          <span className="status-since">desde las {nowClock}</span>
        </div>
        <div className="status-meta-wrap">
          <div className="status-meta mono">noche <b>{days.length}</b> / 14</div>
          <button className="help-btn" onClick={onHelp} aria-label="Cómo funciona">
            <Icon name="help" size={15}/>
          </button>
        </div>
      </div>

      <button className={`primary-cta${sleeping ? ' sleeping' : ''}`} onClick={onSleepToggle}>
        <div className="primary-cta-l">
          <div className="primary-cta-eyebrow">{sleeping ? 'cuando se despierte' : 'cuando empiece el sueño'}</div>
          <div className="primary-cta-label">{sleeping ? 'Marcar despertar' : 'Marcar inicio de sueño'}</div>
        </div>
        <div className="primary-cta-r">
          <div className="primary-cta-arrow">{sleeping ? '↑' : '↓'}</div>
          <div>ahora</div>
        </div>
      </button>

      <div className="secondary-row">
        <button className="sec-btn" onClick={() => onQuickEvent('A')}>
          <span className="sec-glyph feed"><Icon name="feed" size={16}/></span>
          <span>Toma</span>
        </button>
        <button className="sec-btn" onClick={() => onQuickEvent('C')}>
          <span className="sec-glyph bed"><Icon name="cosleep" size={16}/></span>
          <span>Colecho</span>
        </button>
        <button className="sec-btn" onClick={() => onQuickEvent('X')}>
          <span className="sec-glyph note"><Icon name="note" size={16}/></span>
          <span>Nota</span>
        </button>
      </div>

      <button className="manual-add prominent" onClick={onManual}>
        <Icon name="plus" size={16} />
        <span>Añadir entrada manual</span>
      </button>

      <div className="strip">
        <div className="strip-head">
          <span className="strip-title">Esta noche</span>
          <span className="strip-now mono">en curso</span>
        </div>
        <div className="strip-grid">
          {HOURS_ARR.map((_, i) =>
            <div key={i} className="strip-hour" style={{ left: `${i / 24 * 100}%` }} />
          )}
          {today.sleeps.map(([s, e], i) =>
            <div key={i} className="strip-bar" style={{ left: `${minToPct(s)}%`, width: `${minToPct(e - s)}%` }} />
          )}
          {(today.events || []).map((ev, i) => {
            const left = minToPct(ev.t)
            const cls = ev.type === 'A' ? 'feeding' : ev.type === 'C' ? 'cosleep' : 'incident'
            const iconName = ev.type === 'A' ? 'feed' : ev.type === 'C' ? 'cosleep' : 'note'
            return (
              <span key={i} className={`strip-marker ${cls}`} style={{ left: `${left}%` }}>
                <Icon name={iconName} size={9} stroke={2.2} />
              </span>
            )
          })}
          <div className="strip-now-line" style={{ left: `${minToPct(nowTrack)}%` }} />
        </div>
        <div className="strip-labels">
          {stripStops.map((h, i) => <span key={i}>{stripLabel(h % 24)}</span>)}
        </div>
      </div>

      {state === 'complete' &&
        <div className="complete-nudge">
          <div className="complete-eyebrow">diario completo</div>
          <div className="complete-title">14 noches registradas</div>
          <div className="complete-sub">¿Cerrarlo y empezar uno nuevo?</div>
          <button className="complete-cta" onClick={onClosePeriod}>Cerrar este diario</button>
        </div>
      }

      <div className="events">
        <div className="events-title">
          <span>Hoy</span>
          <span>{eventList.length} {eventList.length === 1 ? 'entrada' : 'entradas'}</span>
        </div>
        {eventList.length === 0
          ? <div className="no-events">Sin entradas por ahora.</div>
          : eventList.map((ev, i) => {
              const iconName = ev.kind === 'sleep_start' ? 'sleep-start'
                : ev.kind === 'sleep_end' ? 'sleep-end'
                : ev.kind === 'feeding' ? 'feed'
                : ev.kind === 'cosleep' ? 'cosleep' : 'note'
              const hasNoteSupport = ev.kind === 'feeding' || ev.kind === 'cosleep' || ev.kind === 'incident'
              return (
                <div
                  className={`event-row${hasNoteSupport ? ' event-row--editable' : ''}`}
                  key={i}
                  onClick={hasNoteSupport ? () => onEditEventNote(ev) : undefined}
                >
                  <span className="event-time mono">{fmtTrackMin(ev.t, dayStart)}</span>
                  <span className={`event-glyph-sm ${ev.kind}`}><Icon name={iconName} size={12} stroke={2.2}/></span>
                  <span className="event-label">
                    {ev.label}
                    {ev.note
                      ? <span className="event-note">{ev.note}</span>
                      : hasNoteSupport && <span className="event-note-hint">Añadir nota…</span>
                    }
                  </span>
                  <button className="event-del" onClick={e => { e.stopPropagation(); onDeleteEvent(ev) }}>×</button>
                </div>
              )
            })
        }
      </div>
    </div>
  )
}
