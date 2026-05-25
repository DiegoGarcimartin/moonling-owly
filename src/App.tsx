import { useState, useEffect, useMemo, useCallback } from 'react'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'
import { HomeScreen } from './components/HomeScreen'
import { SheetScreen } from './components/SheetScreen'
import { EntryModal } from './components/EntryModal'
import { SharePreviewModal } from './components/SharePreviewModal'
import { SettingsModal } from './components/SettingsModal'
import { HelpModal } from './components/HelpModal'
import { AuthScreen } from './components/AuthScreen'
import { OnboardingScreen } from './components/OnboardingScreen'
import { auth } from './lib/firebase'
import { loadAllNights, syncNight, deleteAllNights, mergeNights } from './lib/sync'
import {
  load, save, nowClockHour, nightDate, nightsToDays, getOrCreateTonight,
  StoredState, StoredNight,
} from './storage'
import { EventType, clockToTrack } from './data'

interface Settings {
  mode: 'night' | 'day'
  dayStart: number
  childName: string
  childAge: string
  onboardingDone: boolean
}

const SETTINGS_KEY = 'moonling-owly-settings'

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // Existing users who already have a name skip onboarding
      return { ...defaultSettings(), ...parsed, onboardingDone: parsed.onboardingDone ?? !!parsed.childName }
    }
  } catch { /* ignore */ }
  return defaultSettings()
}
function defaultSettings(): Settings {
  return { mode: 'night', dayStart: 19, childName: '', childAge: '', onboardingDone: false }
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
  const [toast, setToast] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const [stored, setStored] = useState<StoredState>(load)
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  const { mode, dayStart, childName, childAge } = settings
  const nights = stored.nights

  // Auth state — al login carga desde Firebase y mergea con localStorage
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        const remote = await loadAllNights(firebaseUser.uid)
        const local = load().nights
        const merged = mergeNights(remote, local)
        setStored({ nights: merged })
        save({ nights: merged })
        // Sube noches que están solo en localStorage (escritas offline)
        const remoteDates = new Set(remote.map(n => n.date))
        for (const n of local) {
          if (!remoteDates.has(n.date)) syncNight(n, firebaseUser.uid)
        }
      } else {
        setStored({ nights: [] })
      }
      setAuthLoading(false)
    })
    return unsub
  }, [])

  // Persiste ajustes
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    document.documentElement.setAttribute('data-mode', mode)
  }, [settings, mode])

  // Persiste noches en localStorage como caché offline
  useEffect(() => { save(stored) }, [stored])

  const patchSettings = useCallback((patch: Partial<Settings>) => {
    setSettings(s => ({ ...s, ...patch }))
  }, [])

  const popToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 1800)
  }, [])

  const isSleeping = useMemo(() => {
    const today = nightDate(dayStart)
    const tonight = nights.find(n => n.date === today)
    if (!tonight) return false
    const last = tonight.sleeps[tonight.sleeps.length - 1]
    return !!last && last.end === null
  }, [nights, dayStart])

  const appState = useMemo((): 'empty' | 'tracking' | 'complete' => {
    if (nights.length === 0) return 'empty'
    if (nights.length >= 14 && !isSleeping) return 'complete'
    return 'tracking'
  }, [nights.length, isSleeping])

  const days = useMemo(() => nightsToDays(nights, dayStart), [nights, dayStart])

  const fmt12Short = (h: number) => {
    const m = Math.round((h % 1) * 60)
    const period = Math.floor(h) >= 12 && Math.floor(h) < 24 ? 'PM' : 'AM'
    let hh = Math.floor(h) % 12
    if (hh === 0) hh = 12
    return `${hh}:${String(m).padStart(2, '0')} ${period}`
  }

  const handleSleepToggle = useCallback(() => {
    const h = nowClockHour()
    const timeStr = fmt12Short(h)

    const { nights: updatedNights, idx } = getOrCreateTonight(stored.nights, dayStart)
    const night = { ...updatedNights[idx], sleeps: [...updatedNights[idx].sleeps] }
    const lastSleep = night.sleeps[night.sleeps.length - 1]
    const sleeping = !!lastSleep && lastSleep.end === null

    if (sleeping) {
      night.sleeps[night.sleeps.length - 1] = { ...lastSleep, end: h }
    } else {
      night.sleeps.push({ start: h, end: null })
    }

    const result = [...updatedNights]
    result[idx] = night
    setStored({ nights: result })
    if (user) syncNight(night, user.uid)

    popToast(isSleeping ? `↑ Despertar · ${timeStr}` : `↓ Inicio de sueño · ${timeStr}`)
  }, [stored.nights, dayStart, isSleeping, popToast, user])

  const handleQuickEvent = useCallback((type: EventType) => {
    const h = nowClockHour()
    const labels = { A: 'Toma', C: 'Colecho', X: 'Nota' } as const

    const { nights: updatedNights, idx } = getOrCreateTonight(stored.nights, dayStart)
    const night = {
      ...updatedNights[idx],
      events: [...updatedNights[idx].events, { type, h }],
    }
    const result = [...updatedNights]
    result[idx] = night
    setStored({ nights: result })
    if (user) syncNight(night, user.uid)

    popToast(`${labels[type]} · ${fmt12Short(h)}`)
  }, [stored.nights, dayStart, popToast, user])

  const handleDeleteEvent = useCallback((ev: { kind: string; t: number }) => {
    const today = nightDate(dayStart)
    const nightsCopy = [...stored.nights]
    const idx = nightsCopy.findIndex(n => n.date === today)
    if (idx < 0) return
    const night = nightsCopy[idx]
    let updatedNight = { ...night }

    if (ev.kind === 'sleep_start') {
      updatedNight.sleeps = night.sleeps.filter(
        s => Math.round(clockToTrack(s.start, dayStart)) !== Math.round(ev.t)
      )
    } else if (ev.kind === 'sleep_end') {
      updatedNight.sleeps = night.sleeps.map(s =>
        s.end !== null && Math.round(clockToTrack(s.end, dayStart)) === Math.round(ev.t)
          ? { ...s, end: null }
          : s
      )
    } else {
      const typeMap: Record<string, EventType> = { feeding: 'A', cosleep: 'C', incident: 'X' }
      const targetType = typeMap[ev.kind]
      let removed = false
      updatedNight.events = night.events.filter(e => {
        if (!removed && e.type === targetType && Math.round(clockToTrack(e.h, dayStart)) === Math.round(ev.t)) {
          removed = true; return false
        }
        return true
      })
    }

    nightsCopy[idx] = updatedNight
    setStored({ nights: nightsCopy })
    if (user) syncNight(updatedNight, user.uid)
    popToast('Entrada eliminada')
  }, [stored.nights, dayStart, popToast, user])

  const handleManualSave = useCallback((entry: { type: string; hour: number; minute: number; dayOffset: number }) => {
    const h = entry.hour + entry.minute / 60
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + entry.dayOffset)
    if (entry.hour < dayStart) targetDate.setDate(targetDate.getDate() - 1)
    const dateStr = targetDate.toISOString().split('T')[0]

    const nightsCopy = [...stored.nights]
    let idx = nightsCopy.findIndex(n => n.date === dateStr)
    if (idx < 0) {
      nightsCopy.push({ date: dateStr, sleeps: [], events: [] } satisfies StoredNight)
      idx = nightsCopy.length - 1
    }
    const night = { ...nightsCopy[idx] }

    if (entry.type === 'sleep_start') {
      night.sleeps = [...night.sleeps, { start: h, end: null }]
    } else if (entry.type === 'sleep_end') {
      const sleeps = [...night.sleeps]
      const lastOpen = sleeps.map((s, i) => ({ s, i })).reverse().find(({ s }) => s.end === null)
      if (lastOpen) sleeps[lastOpen.i] = { ...lastOpen.s, end: h }
      night.sleeps = sleeps
    } else {
      night.events = [...night.events, { type: entry.type as EventType, h }]
    }

    nightsCopy[idx] = night
    setStored({ nights: nightsCopy })
    if (user) syncNight(night, user.uid)

    popToast('Entrada guardada')
    setShowModal(false)
  }, [stored.nights, dayStart, popToast, user])

  const handleClosePeriod = useCallback(() => {
    setShowCloseModal(false)
    setStored({ nights: [] })
    if (user) deleteAllNights(user.uid)
    popToast('Diario cerrado · empezando de cero')
    setTab('home')
  }, [popToast, user])

  const handleSignOut = useCallback(async () => {
    await signOut(auth)
    setShowSettings(false)
  }, [])

  // Loading mientras Firebase resuelve sesión (~300ms)
  if (authLoading) {
    return (
      <div className="app-root" data-mode={mode}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.3 }}>
          <span className="serif-italic" style={{ fontSize: 20 }}>Moonling Owly</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="app-root" data-mode={mode}>
        <AuthScreen />
      </div>
    )
  }

  if (!settings.onboardingDone) {
    return (
      <div className="app-root" data-mode={mode}>
        <OnboardingScreen
          onDone={(childName, childAge) =>
            patchSettings({ childName, childAge, onboardingDone: true })
          }
        />
      </div>
    )
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
          <button className="iconbtn" onClick={() => setShowSettings(true)} aria-label="Ajustes">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab${tab === 'home' ? ' active' : ''}`} onClick={() => setTab('home')}>Hoy</button>
        <button className={`tab${tab === 'sheet' ? ' active' : ''}`} onClick={() => setTab('sheet')}>Diario</button>
      </div>

      <div className="screen">
        {tab === 'home' && (
          <HomeScreen
            days={days}
            state={appState}
            sleeping={isSleeping}
            dayStart={dayStart}
            onSleepToggle={handleSleepToggle}
            onQuickEvent={handleQuickEvent}
            onManual={() => setShowModal(true)}
            onDeleteEvent={handleDeleteEvent}
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
          whiteSpace: 'nowrap', zIndex: 200, boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
        }}>{toast}</div>
      )}

      {showCloseModal && (
        <div className="modal-back" onClick={(e) => { if ((e.target as HTMLElement).classList.contains('modal-back')) setShowCloseModal(false) }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <h2 className="modal-title">¿Cerrar este diario?</h2>
            <p className="modal-sub">Empezarás un diario nuevo desde la noche 1.</p>
            <button className="modal-confirm" onClick={handleClosePeriod}>Sí, cerrar y empezar de cero</button>
            <button className="modal-cancel" onClick={() => setShowCloseModal(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {showModal && <EntryModal onClose={() => setShowModal(false)} onSave={handleManualSave} />}
      {showShare && <SharePreviewModal days={days} dayStart={dayStart} childName={childName} childAge={childAge} onUpdate={patchSettings} onClose={() => setShowShare(false)} />}
      {showHelp && <HelpModal dayStart={dayStart} onClose={() => setShowHelp(false)} />}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onChange={patchSettings}
          onNewJournal={() => {
            setStored({ nights: [] })
            if (user) deleteAllNights(user.uid)
            setShowSettings(false)
            popToast('Diario cerrado · empezando de cero')
          }}
          onSignOut={handleSignOut}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}
