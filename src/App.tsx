import { useState, useEffect, useMemo } from 'react'
import { HomeScreen } from './components/HomeScreen'
import { SheetScreen } from './components/SheetScreen'
import { EntryModal } from './components/EntryModal'
import { SharePreviewModal } from './components/SharePreviewModal'
import { SettingsModal } from './components/SettingsModal'
import { HelpModal } from './components/HelpModal'
import { buildDays } from './data'

type AppState = 'empty' | 'tracking' | 'complete'

interface Settings {
  mode: 'night' | 'day'
  dayStart: number
  childName: string
  childAge: string
  appState: AppState
}

const STORAGE_KEY = 'moonling-owly-settings'

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...defaultSettings(), ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return defaultSettings()
}

function defaultSettings(): Settings {
  return {
    mode: 'night',
    dayStart: 19,
    childName: '',
    childAge: '',
    appState: 'tracking',
  }
}

function BrandMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
      <circle cx="13" cy="11" r="9" fill="currentColor" opacity="0.18" />
      <circle cx="15.5" cy="9.5" r="7" fill="var(--bg)" />
      <circle cx="8" cy="13" r="3.2" fill="currentColor" />
      <circle cx="7.2" cy="12.5" r="0.7" fill="var(--bg)" />
      <circle cx="8.8" cy="12.5" r="0.7" fill="var(--bg)" />
    </svg>
  )
}

export default function App() {
  const [tab, setTab] = useState<'home' | 'sheet'>('home')
  const [sleeping, setSleeping] = useState(true)
  const [toast, setToast] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<Settings>(loadSettings)

  const { mode, dayStart, childName, childAge, appState } = settings

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    document.documentElement.setAttribute('data-mode', mode)
  }, [settings, mode])

  const days = useMemo(() => {
    if (appState === 'empty') return []
    return buildDays(dayStart)
  }, [appState, dayStart])

  const patchSettings = (patch: Partial<Settings>) => setSettings(s => ({ ...s, ...patch }))

  const popToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 1800)
  }

  const handleSleepToggle = () => {
    if (appState === 'empty') {
      patchSettings({ appState: 'tracking' })
      popToast('↓ First night started · 11:40 PM')
      setSleeping(true)
      return
    }
    setSleeping(s => !s)
    popToast(sleeping ? '↑ Wakeup logged · 11:40 PM' : '↓ Sleep start logged · 11:40 PM')
  }

  const handleQuickEvent = (type: 'A' | 'C' | 'X') => {
    const labels = { A: 'Feed', C: 'Co-sleep', X: 'Note' }
    popToast(`${labels[type]} logged · now`)
  }

  const handleClosePeriod = () => {
    setShowCloseModal(false)
    patchSettings({ appState: 'empty' })
    popToast('Journal closed · starting fresh')
    setTab('home')
  }

  return (
    <div className="app-root" data-mode={mode}>
      <div className="topbar">
        <div className="brand">
          <span className="brand-mark" style={{ color: 'var(--accent)' }}><BrandMark /></span>
          <span>Moonling</span>
          <span className="serif-italic" style={{ opacity: 0.6 }}>Owly</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="iconbtn" onClick={() => patchSettings({ mode: mode === 'day' ? 'night' : 'day' })} aria-label="Toggle mode">
            {mode === 'day' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M20 14.5A8 8 0 0 1 10 4.5 8 8 0 1 0 20 14.5Z" fill="currentColor"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="12" cy="12" r="4" fill="currentColor"/>
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.5 4.5l2 2M17.5 17.5l2 2M4.5 19.5l2-2M17.5 6.5l2-2" strokeLinecap="round"/>
              </svg>
            )}
          </button>
          <button className="iconbtn" onClick={() => setShowSettings(true)} aria-label="Settings">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab${tab === 'home' ? ' active' : ''}`} onClick={() => setTab('home')}>Today</button>
        <button className={`tab${tab === 'sheet' ? ' active' : ''}`} onClick={() => setTab('sheet')}>Journal</button>
      </div>

      <div className="screen">
        {tab === 'home' && (
          <HomeScreen
            days={days}
            state={appState}
            sleeping={sleeping}
            dayStart={dayStart}
            onSleepToggle={handleSleepToggle}
            onQuickEvent={handleQuickEvent}
            onManual={() => setShowModal(true)}
            onDeleteEvent={() => popToast('Entry deleted')}
            onClosePeriod={() => setShowCloseModal(true)}
            onHelp={() => setShowHelp(true)}
          />
        )}
        {tab === 'sheet' && (
          <SheetScreen
            days={days}
            state={appState}
            dayStart={dayStart}
            childName={childName}
            onClosePeriod={() => setShowCloseModal(true)}
            onShare={() => setShowShare(true)}
          />
        )}
      </div>

      {toast && (
        <div style={{
          position: 'fixed', bottom: 60, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--text)', color: 'var(--bg)', padding: '10px 18px',
          borderRadius: 999, fontSize: 12.5, fontFamily: 'Geist, sans-serif',
          whiteSpace: 'nowrap', zIndex: 90, boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
        }}>{toast}</div>
      )}

      {showCloseModal && (
        <div className="modal-back" onClick={(e) => { if ((e.target as HTMLElement).classList.contains('modal-back')) setShowCloseModal(false) }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <h2 className="modal-title">Close this journal?</h2>
            <p className="modal-sub">We'll save it as a PDF / image for you. You'll start a new journal from night 1.</p>
            <button className="modal-confirm" onClick={handleClosePeriod}>Yes, close and start fresh</button>
            <button className="modal-cancel" onClick={() => setShowCloseModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {showModal && <EntryModal onClose={() => setShowModal(false)} onSave={() => { popToast('Entry saved'); setShowModal(false) }} />}
      {showShare && <SharePreviewModal days={days} dayStart={dayStart} childName={childName} childAge={childAge} onUpdate={patchSettings} onClose={() => setShowShare(false)} />}
      {showHelp && <HelpModal dayStart={dayStart} onClose={() => setShowHelp(false)} />}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onChange={patchSettings}
          onNewJournal={() => { patchSettings({ appState: 'empty' }); setShowSettings(false); popToast('Journal closed · starting fresh') }}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}
