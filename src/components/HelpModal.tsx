import { Icon } from './Icon'
import { fmt12 } from '../data'
import { t } from '../lib/i18n'

interface HelpModalProps {
  dayStart: number
  onClose: () => void
}

export function HelpModal({ dayStart, onClose }: HelpModalProps) {
  return (
    <div className="modal-back" onClick={(e) => { if ((e.target as HTMLElement).classList.contains('modal-back')) onClose() }}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <h2 className="modal-title">{t.howItWorks}</h2>
        <p className="modal-sub">{t.helpSub}</p>
        <ul className="first-guide-list" style={{ marginTop: 8 }}>
          <li><span className="first-guide-icon"><Icon name="sleep-start" size={16}/></span><span><b>{t.guideSleepStart.b}</b>{t.guideSleepStart.rest}</span></li>
          <li><span className="first-guide-icon"><Icon name="sleep-end" size={16}/></span><span><b>{t.helpSleepEnd.b}</b>{t.helpSleepEnd.rest}</span></li>
          <li><span className="first-guide-icon"><Icon name="feed" size={16}/></span><span><b>{t.helpFeed.b}</b>{t.helpFeed.rest}</span></li>
          <li><span className="first-guide-icon"><Icon name="cosleep" size={16}/></span><span><b>{t.helpCosleep.b}</b>{t.helpCosleep.rest}</span></li>
          <li><span className="first-guide-icon"><Icon name="note" size={16}/></span><span><b>{t.guideNote.b}</b>{t.guideNote.rest}</span></li>
        </ul>
        <div className="first-guide-foot" style={{ marginTop: 16 }}>
          {(() => { const g = t.helpFoot(fmt12(dayStart, 0)); return (<>{g.pre}<em>{g.em}</em>{g.mid}<b className="mono">{g.a}</b>{g.post}</>) })()}
        </div>
        <button className="modal-confirm" style={{ marginTop: 20 }} onClick={onClose}>{t.gotIt}</button>
      </div>
    </div>
  )
}
