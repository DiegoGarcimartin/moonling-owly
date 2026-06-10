import { Icon } from './Icon'
import { Day, getHours, fmtTrackMin, clockToTrack, fmt12 } from '../data'
import { nowClockHour, nightDate } from '../storage'
import { t, MONTHS } from '../lib/i18n'

interface HomeScreenProps {
  days: Day[]
  state: 'empty' | 'tracking' | 'complete'
  sleeping: boolean
  dayStart: number
  currentNight: number
  onSleepToggle: () => void
  onQuickEvent: (type: 'A' | 'C' | 'X') => void
  onManual: () => void
  onDeleteEvent: (ev: { kind: string; t: number }) => void
  onEditEventNote: (ev: { kind: string; t: number; note?: string }) => void
  onClosePeriod: () => void
  onHelp: () => void
}

export function HomeScreen({ days, state, sleeping, dayStart, currentNight, onSleepToggle, onQuickEvent, onManual, onDeleteEvent, onEditEventNote, onClosePeriod, onHelp }: HomeScreenProps) {
  // Use *tonight* (the night that's currently active per the wall clock),
  // not the last day in the array. Otherwise a manual entry made for a
  // future date pushes the array forward, and the Hoy tab starts showing
  // a different night than the one the sleep/wake toggle is mutating —
  // marking the wake-up looked like nothing was happening because the
  // change landed in a different Day object.
  const todayDateStr = nightDate(dayStart)
  const today = (days && days.length)
    ? (days.find(d => d.date === todayDateStr) || days[days.length - 1])
    : null
  const HOURS_ARR = getHours(dayStart)
  const dayStartLabel = fmt12(dayStart, 0)

  const todayDate = new Date()
  const todayLabel = `${todayDate.getDate()} ${MONTHS[todayDate.getMonth()]}`

  if (state === 'empty' || !today) {
    return (
      <div className="screen-inner">
        <div className="empty-hero">
          <div className="empty-eyebrow">{todayLabel}</div>
          <h1 className="empty-title">{t.emptyTitleLine1}<br /><em className="serif-italic">{t.emptyTitleLine2}</em>.</h1>
          <p className="empty-sub">{t.emptySub}</p>
        </div>
        <button className="primary-cta" onClick={onSleepToggle}>
          <div className="primary-cta-l">
            <div className="primary-cta-eyebrow">{t.ctaEyebrowStart}</div>
            <div className="primary-cta-label">{t.ctaStart}</div>
          </div>
          <div className="primary-cta-r">
            <div className="primary-cta-arrow">↓</div>
            <div>{t.now}</div>
          </div>
        </button>
        <div className="empty-aside">
          <span>{t.or}</span>
          <button className="manual-add prominent" onClick={onManual}>
            <Icon name="plus" size={16} />
            <span>{t.addManual}</span>
          </button>
        </div>
        <div className="first-guide">
          <div className="first-guide-eyebrow">{t.howItWorks}</div>
          <ul className="first-guide-list">
            <li><span className="first-guide-icon"><Icon name="sleep-start" size={16}/></span><span><b>{t.guideSleepStart.b}</b>{t.guideSleepStart.rest}</span></li>
            <li><span className="first-guide-icon"><Icon name="sleep-end" size={16}/></span><span><b>{t.guideSleepEnd.b}</b>{t.guideSleepEnd.rest}</span></li>
            <li><span className="first-guide-icon"><Icon name="feed" size={16}/></span><span><b>{t.guideFeed.b}</b>{t.guideFeed.rest}</span></li>
            <li><span className="first-guide-icon"><Icon name="cosleep" size={16}/></span><span><b>{t.guideCosleep.b}</b>{t.guideCosleep.rest}</span></li>
            <li><span className="first-guide-icon"><Icon name="note" size={16}/></span><span><b>{t.guideNote.b}</b>{t.guideNote.rest}</span></li>
          </ul>
          <div className="first-guide-foot">
            {(() => { const g = t.guideFoot(dayStartLabel); return (<>{g.pre}<em>{g.em}</em>{g.mid}<b className="mono">{g.a}</b>{g.mid2}<b className="mono">{g.b}</b>{g.post}</>) })()}
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
    eventList.push({ kind: 'sleep_start', t: s, label: t.sleepStart })
    if (!today.inProgress || e < nowTrack) eventList.push({ kind: 'sleep_end', t: e, label: t.sleepEnd })
  }
  for (const ev of today.events || []) {
    const labels = { A: t.feeding, C: t.cosleep, X: t.note }
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
          {sleeping ? t.sleeping : t.awake}
          <span className="status-since">{t.since(nowClock)}</span>
        </div>
        <div className="status-meta-wrap">
          <div className="status-meta mono">{(() => { const d = t.dayCounter(currentNight); return (<>{d.pre}<b>{d.n}</b>{d.post}</>) })()}</div>
          <button className="help-btn" onClick={onHelp} aria-label={t.ariaHowItWorks}>
            <Icon name="help" size={15}/>
          </button>
        </div>
      </div>

      <button className={`primary-cta${sleeping ? ' sleeping' : ''}`} onClick={onSleepToggle}>
        <div className="primary-cta-l">
          <div className="primary-cta-eyebrow">{sleeping ? t.ctaEyebrowWake : t.ctaEyebrowSleep}</div>
          <div className="primary-cta-label">{sleeping ? t.ctaWake : t.ctaSleep}</div>
        </div>
        <div className="primary-cta-r">
          <div className="primary-cta-arrow">{sleeping ? '↑' : '↓'}</div>
          <div>{t.now}</div>
        </div>
      </button>

      <div className="secondary-row">
        <button className="sec-btn" onClick={() => onQuickEvent('A')}>
          <span className="sec-glyph feed"><Icon name="feed" size={16}/></span>
          <span>{t.feeding}</span>
        </button>
        <button className="sec-btn" onClick={() => onQuickEvent('C')}>
          <span className="sec-glyph bed"><Icon name="cosleep" size={16}/></span>
          <span>{t.cosleep}</span>
        </button>
        <button className="sec-btn" onClick={() => onQuickEvent('X')}>
          <span className="sec-glyph note"><Icon name="note" size={16}/></span>
          <span>{t.note}</span>
        </button>
      </div>

      <button className="manual-add prominent" onClick={onManual}>
        <Icon name="plus" size={16} />
        <span>{t.addManual}</span>
      </button>

      <div className="strip">
        <div className="strip-head">
          <span className="strip-title">{t.tabToday}</span>
          <span className="strip-now mono">{t.stripInProgress}</span>
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
          <div className="complete-eyebrow">{t.completeEyebrow}</div>
          <div className="complete-title">{t.completeTitle}</div>
          <div className="complete-sub">{t.completeSub}</div>
          <button className="complete-cta" onClick={onClosePeriod}>{t.completeCta}</button>
        </div>
      }

      <div className="events">
        <div className="events-title">
          <span>{t.tabToday}</span>
          <span>{t.entriesCount(eventList.length)}</span>
        </div>
        {eventList.length === 0
          ? <div className="no-events">{t.noEntriesYet}</div>
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
                      : hasNoteSupport && <span className="event-note-hint">{t.addNoteHint}</span>
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
