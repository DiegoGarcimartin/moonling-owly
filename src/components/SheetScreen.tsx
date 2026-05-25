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
          <div className="sheet-eyebrow">Journal · 0 nights</div>
          <h1 className="sheet-title">Your journal<br /><em className="serif-italic">is waiting</em></h1>
          <div className="sheet-meta"><span>It begins as soon as you log your first night.</span></div>
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

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const fmtDate = (iso: string) => { const d = new Date(iso); return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}` }
  const firstDate = days[0].date
  const lastDate = days[totalNights - 1].date
  const dateRange = firstDate === lastDate ? fmtDate(firstDate) : `${fmtDate(firstDate)} — ${fmtDate(lastDate)}`
  const year = new Date(lastDate).getUTCFullYear()

  return (
    <div className="screen-inner">
      <div className="sheet-head">
        <div className="sheet-head-top">
          <div className="sheet-eyebrow">Journal · {totalNights} night{totalNights === 1 ? '' : 's'}</div>
          <button className="sheet-menu" onClick={onClosePeriod} aria-label="Close journal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="19" cy="12" r="1.7" /></svg>
          </button>
        </div>
        <h1 className="sheet-title">My sleep<br /><em className="serif-italic">journal</em></h1>
        <div className="sheet-meta">
          {childName && <span>for <b>{childName}</b></span>}
          <span><b>{dateRange}</b>, {year}</span>
          <span><b>{totalNights}</b> night{totalNights === 1 ? '' : 's'}</span>
        </div>
      </div>

      <div className="sheet-paper">
        <SheetGrid days={days} dayStart={dayStart} />
      </div>

      <div className="sheet-legend">
        <div className="legend-item"><span className="legend-swatch bar"></span><span>asleep</span></div>
        <div className="legend-item"><span className="legend-swatch dot dot-feed"><Icon name="feed" size={10} stroke={2.4}/></span><span>feed</span></div>
        <div className="legend-item"><span className="legend-swatch dot dot-co"><Icon name="cosleep" size={10} stroke={2.4}/></span><span>co-sleep</span></div>
        <div className="legend-item"><span className="legend-swatch dot dot-x"><Icon name="note" size={10} stroke={2.4}/></span><span>note</span></div>
      </div>

      <div className="stats-row">
        <div className="stat">
          <div className="stat-label">Avg / night</div>
          <div className="stat-val">{avgNight.toFixed(1)}<small>h</small></div>
        </div>
        <div className="stat">
          <div className="stat-label">Total {totalNights}d</div>
          <div className="stat-val">{Math.round(totalSleep)}<small>h</small></div>
        </div>
        <div className="stat">
          <div className="stat-label">Wake-ups</div>
          <div className="stat-val">{totalWakeups}</div>
        </div>
      </div>

      <div className="diario-share">
        <div className="diario-share-head">
          <div className="diario-share-eyebrow">for your doctor</div>
          <h2 className="diario-share-title">When you're ready,<br/>share it.</h2>
          <p className="diario-share-sub">Formatted as sleep specialists expect. Preview before sending.</p>
        </div>
        <button className="share-cta" onClick={onShare}>
          <Icon name="share" size={18}/>
          <span>Share / Print</span>
        </button>
        {state === 'complete' &&
          <button className="close-period-btn" onClick={onClosePeriod}>
            Close this journal and start a new one
          </button>
        }
      </div>
    </div>
  )
}
