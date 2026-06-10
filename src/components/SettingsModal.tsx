import { Icon } from './Icon'
import { t } from '../lib/i18n'
import { LangToggle } from './LangToggle'

const sanitize = (s: string) => s.replace(/[<>]/g, '')

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
  onSignOut: () => void
  onClose: () => void
}

export function SettingsModal({ settings, onChange, onNewJournal, onSignOut, onClose }: SettingsModalProps) {
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
          <h2 className="modal-title">{t.settings}</h2>
          <button className="iconbtn" onClick={onClose} aria-label={t.ariaClose} style={{ flexShrink: 0 }}>
            <Icon name="close" size={16}/>
          </button>
        </div>

        <div className="settings-section">
          <div className="settings-label">{t.baby}</div>
          <div className="settings-field">
            <label>{t.name}</label>
            <input
              type="text"
              className="settings-input"
              value={settings.childName}
              onChange={(e) => onChange({ childName: sanitize(e.target.value).slice(0, 40) })}
              maxLength={40}
              placeholder={t.egName}
            />
          </div>
          <div className="settings-field">
            <label>{t.age}</label>
            <input
              type="text"
              className="settings-input"
              value={settings.childAge}
              onChange={(e) => onChange({ childAge: sanitize(e.target.value).slice(0, 16) })}
              maxLength={16}
              placeholder={t.egAge}
            />
          </div>
          <div className="settings-hint">{t.nameHint}</div>
        </div>

        <div className="settings-section">
          <div className="settings-label">{t.dayStartsAt}</div>
          <div className="settings-stepper">
            <button className="settings-step-btn" onClick={() => stepDayStart(-1)} aria-label={t.ariaEarlier}>−</button>
            <div className="settings-step-value">
              <span className="settings-step-num">{hh}</span>
              <span className="settings-step-period mono">{period}</span>
            </div>
            <button className="settings-step-btn" onClick={() => stepDayStart(1)} aria-label={t.ariaLater}>+</button>
          </div>
          <div className="settings-hint">{t.dayStartHint}</div>
        </div>

        <div className="settings-section">
          <div className="settings-label">{t.language}</div>
          <LangToggle className="lang-toggle--settings" />
        </div>

        <div className="settings-section danger">
          <button className="settings-danger-btn" onClick={onNewJournal}>{t.startNewJournal}</button>
          <div className="settings-hint">{t.startNewJournalHint}</div>
        </div>

        <div className="settings-section">
          <button className="settings-signout-btn" onClick={onSignOut}>{t.signOut}</button>
        </div>

        <div className="settings-foot">
          <span className="serif-italic">Moonling Owly</span>
          <span className="mono">v 0.1</span>
        </div>
      </div>
    </div>
  )
}
