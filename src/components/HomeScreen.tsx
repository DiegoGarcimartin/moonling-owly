import { Icon } from './Icon'
import { Day, getHours, fmtTrackMin, clockToTrack, fmt12 } from '../data'

interface HomeScreenProps {
  days: Day[]
  state: 'empty' | 'tracking' | 'complete'
  sleeping: boolean
  dayStart: number
  onSleepToggle: () => void
  onQuickEvent: (type: 'A' | 'C' | 'X') => void
  onManual: () => void
  onDeleteEvent: (ev: unknown) => void
  onClosePeriod: () => void
  onHelp: () => void
}

export function HomeScreen({ days, state, sleeping, dayStart, onSleepToggle, onQuickEvent, onManual, onDeleteEvent, onClosePeriod, onHelp }: HomeScreenProps) {
  const today = days && days.length ? days[days.length - 1] : null
  const HOURS_ARR = getHours(dayStart)
  const dayStartLabel = fmt12(dayStart, 0)
  const dayEndLabel = fmt12(dayStart, 0)

  if (state === 'empty' || !today) {
    return (
      <div className="screen-inner">
        <div className="empty-hero">
          <div className="empty-eyebrow">Day 0 · 20 May</div>
          <h1 className="empty-title">We start<br /><em className="serif-italic">tonight</em>.</h1>
          <p className="empty-sub">
            Tap the button when you put the baby to sleep.
            In 14 nights you'll have a journal ready for your doctor.
          </p>
        </div>
        <button className="primary-cta" onClick={onSleepToggle}>
          <div className="primary-cta-l">
            <div className="primary-cta-eyebrow">start</div>
            <div className="primary-cta-label">Sleep started</div>
          </div>
          <div className="primary-cta-r">
            <div className="primary-cta-arrow">↓</div>
            <div>now</div>
          </div>
        </button>
        <div className="empty-aside">
          <span>or</span>
          <button className="manual-add prominent" onClick={onManual}>
            <Icon name="plus" size={16} />
            <span>Add entry manually</span>
          </button>
        </div>
        <div className="first-guide">
          <div className="first-guide-eyebrow">How it works</div>
          <ul className="first-guide-list">
            <li><span className="first-guide-icon"><Icon name="sleep-start" size={16}/></span><span><b>Sleep start.</b> Tap when you begin the bedtime routine.</span></li>
            <li><span className="first-guide-icon"><Icon name="sleep-end" size={16}/></span><span><b>Wakeup.</b> Tap when the baby is finally up — not for night wakings.</span></li>
            <li><span className="first-guide-icon"><Icon name="feed" size={16}/></span><span><b>Feed.</b> Tap whenever you feed (incl. as part of bedtime).</span></li>
            <li><span className="first-guide-icon"><Icon name="cosleep" size={16}/></span><span><b>Co-sleep.</b> Tap if you share the bed at any point.</span></li>
            <li><span className="first-guide-icon"><Icon name="note" size={16}/></span><span><b>Note.</b> Anything unusual: long crying, movement, snoring…</span></li>
          </ul>
          <div className="first-guide-foot">
            A <em>night</em> runs from <b className="mono">{dayStartLabel}</b> to <b className="mono">{dayEndLabel}</b> the next day — the clinical convention. Change it in settings if your family goes to bed earlier.
          </div>
        </div>
      </div>
    )
  }

  const nowTrack = (() => {
    if (today.sleeps && today.sleeps.length) return today.sleeps[today.sleeps.length - 1][1]
    return clockToTrack(22, dayStart)
  })()
  const nowClock = fmtTrackMin(nowTrack, dayStart)
  const minToPct = (m: number) => m / 1440 * 100

  type EventListItem = { kind: string; t: number; label: string }
  const eventList: EventListItem[] = []
  for (const [s, e] of today.sleeps || []) {
    eventList.push({ kind: 'sleep_start', t: s, label: 'Sleep start' })
    if (!today.inProgress || e < nowTrack) eventList.push({ kind: 'sleep_end', t: e, label: 'Wakeup' })
  }
  for (const ev of today.events || []) {
    const labels = { A: 'Feed', C: 'Co-sleep', X: 'Note' }
    eventList.push({ kind: ev.type === 'A' ? 'feeding' : ev.type === 'C' ? 'cosleep' : 'incident', t: ev.t, label: labels[ev.type] })
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
          {sleeping ? 'Sleeping' : 'Awake'}
          <span className="status-since">since {nowClock}</span>
        </div>
        <div className="status-meta-wrap">
          <div className="status-meta mono">night <b>{days.length}</b> / 14</div>
          <button className="help-btn" onClick={onHelp} aria-label="How it works">
            <Icon name="help" size={15}/>
          </button>
        </div>
      </div>

      <button className={`primary-cta${sleeping ? ' sleeping' : ''}`} onClick={onSleepToggle}>
        <div className="primary-cta-l">
          <div className="primary-cta-eyebrow">{sleeping ? 'when they wake up' : 'when sleep starts'}</div>
          <div className="primary-cta-label">{sleeping ? 'Mark wakeup' : 'Mark sleep start'}</div>
        </div>
        <div className="primary-cta-r">
          <div className="primary-cta-arrow">{sleeping ? '↑' : '↓'}</div>
          <div>now</div>
          <div>{nowClock}</div>
        </div>
      </button>

      <div className="secondary-row">
        <button className="sec-btn" onClick={() => onQuickEvent('A')}>
          <span className="sec-glyph feed"><Icon name="feed" size={16}/></span>
          <span>Feed</span>
        </button>
        <button className="sec-btn" onClick={() => onQuickEvent('C')}>
          <span className="sec-glyph bed"><Icon name="cosleep" size={16}/></span>
          <span>Co-sleep</span>
        </button>
        <button className="sec-btn" onClick={() => onQuickEvent('X')}>
          <span className="sec-glyph note"><Icon name="note" size={16}/></span>
          <span>Note</span>
        </button>
      </div>

      <button className="manual-add prominent" onClick={onManual}>
        <Icon name="plus" size={16} />
        <span>Add entry manually</span>
      </button>

      <div className="strip">
        <div className="strip-head">
          <span className="strip-title">Tonight <span className="strip-range mono">· {dayStartLabel} → {dayEndLabel}</span></span>
          <span className="strip-now mono">ONGOING · {nowClock}</span>
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
          <div className="complete-eyebrow">journal complete</div>
          <div className="complete-title">14 nights logged</div>
          <div className="complete-sub">Close it and start a new one?</div>
          <button className="complete-cta" onClick={onClosePeriod}>Close this journal</button>
        </div>
      }

      <div className="events">
        <div className="events-title">
          <span>Today</span>
          <span>{eventList.length} entries</span>
        </div>
        {eventList.length === 0
          ? <div className="no-events">No entries yet today.</div>
          : eventList.map((ev, i) => {
              const iconName = ev.kind === 'sleep_start' ? 'sleep-start'
                : ev.kind === 'sleep_end' ? 'sleep-end'
                : ev.kind === 'feeding' ? 'feed'
                : ev.kind === 'cosleep' ? 'cosleep' : 'note'
              return (
                <div className="event-row" key={i}>
                  <span className="event-time mono">{fmtTrackMin(ev.t, dayStart)}</span>
                  <span className={`event-glyph-sm ${ev.kind}`}><Icon name={iconName} size={12} stroke={2.2}/></span>
                  <span className="event-label">{ev.label}</span>
                  <button className="event-del" onClick={() => onDeleteEvent(ev)}>×</button>
                </div>
              )
            })
        }
      </div>
    </div>
  )
}
