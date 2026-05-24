import { Icon } from './Icon'
import { fmt12 } from '../data'

interface HelpModalProps {
  dayStart: number
  onClose: () => void
}

export function HelpModal({ dayStart, onClose }: HelpModalProps) {
  return (
    <div className="modal-back" onClick={(e) => { if ((e.target as HTMLElement).classList.contains('modal-back')) onClose() }}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <h2 className="modal-title">How it works</h2>
        <p className="modal-sub">A few short rules. That's it.</p>
        <ul className="first-guide-list" style={{ marginTop: 8 }}>
          <li><span className="first-guide-icon"><Icon name="sleep-start" size={16}/></span><span><b>Sleep start.</b> Tap when you begin the bedtime routine.</span></li>
          <li><span className="first-guide-icon"><Icon name="sleep-end" size={16}/></span><span><b>Wakeup.</b> When the baby is finally up — not for night wakings (those are notes, optional).</span></li>
          <li><span className="first-guide-icon"><Icon name="feed" size={16}/></span><span><b>Feed.</b> Whenever you feed, including during the bedtime routine.</span></li>
          <li><span className="first-guide-icon"><Icon name="cosleep" size={16}/></span><span><b>Co-sleep.</b> If at any point you share the bed.</span></li>
          <li><span className="first-guide-icon"><Icon name="note" size={16}/></span><span><b>Note.</b> Anything unusual: long crying, movement, snoring…</span></li>
        </ul>
        <div className="first-guide-foot" style={{ marginTop: 16 }}>
          A <em>night</em> currently starts at <b className="mono">{fmt12(dayStart, 0)}</b>.
          If your family goes to bed earlier, change it in Settings.
        </div>
        <button className="modal-confirm" style={{ marginTop: 20 }} onClick={onClose}>Got it</button>
      </div>
    </div>
  )
}
