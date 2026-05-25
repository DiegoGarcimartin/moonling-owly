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
          <h2 className="modal-title">Ajustes</h2>
          <button className="iconbtn" onClick={onClose} aria-label="Cerrar" style={{ flexShrink: 0 }}>
            <Icon name="close" size={16}/>
          </button>
        </div>

        <div className="settings-section">
          <div className="settings-label">Bebé</div>
          <div className="settings-field">
            <label>Nombre</label>
            <input type="text" className="settings-input" value={settings.childName} onChange={(e) => onChange({ childName: e.target.value })} placeholder="ej. Lila" />
          </div>
          <div className="settings-field">
            <label>Edad</label>
            <input type="text" className="settings-input" value={settings.childAge} onChange={(e) => onChange({ childAge: e.target.value })} placeholder="ej. 11 m" />
          </div>
          <div className="settings-hint">Se muestra en el diario que compartes con tu pediatra.</div>
        </div>

        <div className="settings-section">
          <div className="settings-label">La noche empieza a las</div>
          <div className="settings-stepper">
            <button className="settings-step-btn" onClick={() => stepDayStart(-1)} aria-label="Antes">−</button>
            <div className="settings-step-value">
              <span className="settings-step-num">{hh}</span>
              <span className="settings-step-period mono">{period}</span>
            </div>
            <button className="settings-step-btn" onClick={() => stepDayStart(1)} aria-label="Después">+</button>
          </div>
          <div className="settings-hint">Si tu familia empieza antes o después, puedes ajustarlo.</div>
        </div>

        <div className="settings-section danger">
          <button className="settings-danger-btn" onClick={onNewJournal}>Empezar un diario nuevo</button>
          <div className="settings-hint">Cierra este período de 14 noches y empieza desde la noche 1. El diario actual se conserva.</div>
        </div>

        <div className="settings-section">
          <button className="settings-signout-btn" onClick={onSignOut}>Cerrar sesión</button>
        </div>

        <div className="settings-foot">
          <span className="serif-italic">Moonling Owly</span>
          <span className="mono">v 0.1</span>
        </div>
      </div>
    </div>
  )
}
