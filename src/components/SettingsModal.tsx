import { Icon } from './Icon'

interface AppSettings {
  dayStart: number
  childName: string
  childAge: string
  mode: 'night' | 'day'
}

interface SettingsModalProps {
  settings: AppSettings
  onChange: (patch: Partial<AppSettings>) => void
  onNewJournal: () => void
  onClose: () => void
}

export function SettingsModal({ settings, onChange, onNewJournal, onClose }: SettingsModalProps) {
  const { dayStart } = settings

  const stepDayStart = (delta: number) => {
    let v = dayStart + delta
    if (v < 0) v += 24
    if (v > 23) v -= 24
    onChange({ dayStart: v })
  }

  const period = dayStart >= 12 && dayStart < 24 ? 'PM' : 'AM'
  let hh = dayStart % 12
  if (hh === 0) hh = 12

  return (
    <div className="modal-back" onClick={(e) => { if ((e.target as HTMLElement).classList.contains('modal-back')) onClose() }}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="settings-head">
          <h2 className="modal-title">Settings</h2>
          <button className="iconbtn" onClick={onClose} aria-label="Close" style={{ flexShrink: 0 }}>
            <Icon name="close" size={16}/>
          </button>
        </div>

        <div className="settings-section">
          <div className="settings-label">Child</div>
          <div className="settings-field">
            <label>Name</label>
            <input type="text" className="settings-input" value={settings.childName} onChange={(e) => onChange({ childName: e.target.value })} placeholder="e.g. Lila" />
          </div>
          <div className="settings-field">
            <label>Age</label>
            <input type="text" className="settings-input" value={settings.childAge} onChange={(e) => onChange({ childAge: e.target.value })} placeholder="e.g. 11 m" />
          </div>
          <div className="settings-hint">Shown on the journal you share with your doctor.</div>
        </div>

        <div className="settings-section">
          <div className="settings-label">Night starts at</div>
          <div className="settings-stepper">
            <button className="settings-step-btn" onClick={() => stepDayStart(-1)} aria-label="Earlier">−</button>
            <div className="settings-step-value">
              <span className="settings-step-num">{hh}</span>
              <span className="settings-step-period mono">{period}</span>
            </div>
            <button className="settings-step-btn" onClick={() => stepDayStart(1)} aria-label="Later">+</button>
          </div>
          <div className="settings-hint">Default is <b className="mono">7 PM</b> — the clinical standard. Most parents won't need to change this.</div>
        </div>

        <div className="settings-section danger">
          <button className="settings-danger-btn" onClick={onNewJournal}>Start a new journal</button>
          <div className="settings-hint">Closes this 14-night period and starts fresh from night 1. We'll keep a copy of the current one.</div>
        </div>

        <div className="settings-foot">
          <span className="serif-italic">Moonling Owly</span>
          <span className="mono">v 0.1</span>
        </div>
      </div>
    </div>
  )
}
