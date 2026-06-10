import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { SheetGrid } from '../components/SheetGrid'
import type { Day } from '../data'
import { track } from '../lib/analytics'
import { t, WEEKDAYS } from '../lib/i18n'

// Localized weekday abbreviation for a 2026-05-DD demo date.
const demoWeekday = (day: number) =>
  WEEKDAYS[new Date(`2026-05-${String(day).padStart(2, '0')}T12:00:00Z`).getUTCDay()]

// 14 nights of realistic demo data (dayStart = 19 = 7 PM)
// Track minutes: 0 = 7 PM · 60 = 8 PM · 300 = 12 AM · 540 = 4 AM · 720 = 7 AM
const DEMO_DAYS_RAW: Day[] = [
  { d: '12', label: '', date: '2026-05-12', sleeps: [[75,360],[375,600]],          events: [{ type: 'A', t: 362 }] },
  { d: '13', label: '', date: '2026-05-13', sleeps: [[60,330],[345,420],[435,630]],events: [{ type: 'A', t: 330 }, { type: 'A', t: 420 }] },
  { d: '14', label: '', date: '2026-05-14', sleeps: [[90,600]],                    events: [] },
  { d: '15', label: '', date: '2026-05-15', sleeps: [[45,270],[330,540],[555,660]],events: [{ type: 'A', t: 270 }, { type: 'A', t: 330 }] },
  { d: '16', label: '', date: '2026-05-16', sleeps: [[60,510],[525,690]],          events: [{ type: 'A', t: 510 }, { type: 'C', t: 525 }] },
  { d: '17', label: '', date: '2026-05-17', sleeps: [[75,465],[480,645]],          events: [{ type: 'A', t: 465 }] },
  { d: '18', label: '', date: '2026-05-18', sleeps: [[60,660]],                    events: [] },
  { d: '19', label: '', date: '2026-05-19', sleeps: [[75,390],[405,615]],          events: [{ type: 'A', t: 390 }] },
  { d: '20', label: '', date: '2026-05-20', sleeps: [[90,480],[495,660]],          events: [{ type: 'A', t: 480 }] },
  { d: '21', label: '', date: '2026-05-21', sleeps: [[60,420],[435,630]],          events: [{ type: 'C', t: 435 }] },
  { d: '22', label: '', date: '2026-05-22', sleeps: [[75,510]],                    events: [] },
  { d: '23', label: '', date: '2026-05-23', sleeps: [[60,300],[330,510],[525,660]],events: [{ type: 'A', t: 300 }, { type: 'A', t: 330 }] },
  { d: '24', label: '', date: '2026-05-24', sleeps: [[90,480],[510,660]],          events: [{ type: 'A', t: 480 }] },
  { d: '25', label: '', date: '2026-05-25', sleeps: [[75,540]],                    events: [] },
]
const DEMO_DAYS: Day[] = DEMO_DAYS_RAW.map(d => ({ ...d, label: demoWeekday(parseInt(d.d)) }))

// Nights for the actogram demo (track minutes from dayStart=19 / 7 PM)
// 0 = 7 PM · 60 = 8 PM · 300 = 12 AM · 540 = 4 AM · 720 = 7 AM
const ACTO_NIGHTS = [
  { day: 12, sleeps: [[75,360],[375,600]] as [number,number][] },
  { day: 13, sleeps: [[60,330],[345,420],[435,630]] as [number,number][] },
  { day: 14, sleeps: [[90,600]] as [number,number][] },
  { day: 15, sleeps: [[45,270],[330,540],[555,660]] as [number,number][] },
  { day: 16, sleeps: [[60,510],[525,690]] as [number,number][] },
  { day: 17, sleeps: [[75,465],[480,645]] as [number,number][] },
  { day: 18, sleeps: [[60,660]] as [number,number][] },
  { day: 19, sleeps: [[75,390],[405,615]] as [number,number][] },
].map(n => ({ ...n, label: `${demoWeekday(n.day)[0].toUpperCase()} ${n.day}` }))

// Phases: awake → tap → toast → sleeping → tap → toast → event log → slide → actogram
const DP = [
  { id: 'awake',    dur: 2200 },
  { id: 'tap1',     dur: 185  },
  { id: 'toast_s',  dur: 860  },
  { id: 'sleeping', dur: 2700 },
  { id: 'tap2',     dur: 185  },
  { id: 'toast_w',  dur: 860  },
  { id: 'logged',   dur: 1600 },
  { id: 'swipe',    dur: 480  },
  { id: 'diary',    dur: 4200 },
] as const
type DPId = typeof DP[number]['id']

function AnimatedPhone() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    let i = 0
    let tid: ReturnType<typeof setTimeout>
    const step = () => {
      i = (i + 1) % DP.length
      setIdx(i)
      tid = setTimeout(step, DP[i].dur)
    }
    tid = setTimeout(step, DP[0].dur)
    return () => clearTimeout(tid)
  }, [])

  const phase    = DP[idx].id as DPId
  const sleeping = ['sleeping','tap2','toast_w','logged'].includes(phase)
  const tapping  = phase === 'tap1' || phase === 'tap2'
  const isToast  = phase === 'toast_s' || phase === 'toast_w'
  const isDiary  = phase === 'swipe' || phase === 'diary'
  const events   = phase === 'logged'
  const toast    = phase === 'toast_s' ? t.dpToastSleep : t.dpToastWake

  return (
    <div className="dp-frame">
      {/* dynamic island */}
      <div className="dp-island" />

      {/* header */}
      <div className="dp-topbar">
        <span className="dp-brand">Moonling <em>Owly</em></span>
        <span className="dp-meta">{t.dayCounter(8).pre}<b>8</b>{t.dayCounter(8).post}</span>
      </div>

      {/* tabs */}
      <div className="dp-tabs">
        <span className={`dp-tab${!isDiary ? ' active' : ''}`}>{t.tabToday}</span>
        <span className={`dp-tab${isDiary ? ' active' : ''}`}>{t.tabDiary}</span>
      </div>

      {/* screens */}
      <div className="dp-screens">

        {/* HOME */}
        <div className={`dp-home${isDiary ? ' dp-home--out' : ''}`}>
          <div className="dp-status">
            <span className={`dp-dot ${sleeping ? 'sleeping' : 'awake'}`} />
            <span className="dp-status-text">{sleeping ? t.sleeping : t.awake}</span>
            {sleeping && <span className="dp-since">{t.dpSince815}</span>}
          </div>

          <div className={`dp-cta${sleeping ? ' sleeping' : ''}${tapping ? ' pressing' : ''}`}>
            <div className="dp-cta-body">
              <div className="dp-eyebrow">{sleeping ? t.ctaEyebrowWake : t.ctaEyebrowSleep}</div>
              <div className="dp-label">{sleeping ? t.ctaWake : t.ctaStart}</div>
            </div>
            <div className="dp-arrow">{sleeping ? '↑' : '↓'}</div>
          </div>

          <div className="dp-sec">
            <span className="dp-sec-item">{t.feeding}</span>
            <span className="dp-sec-item">{t.cosleep}</span>
            <span className="dp-sec-item">{t.note}</span>
          </div>

          {events ? (
            <div className="dp-events">
              <div className="dp-ev">
                <span className="dp-ev-time">8:15 PM</span>
                <span className="dp-ev-lbl">↓ {t.sleepStart}</span>
              </div>
              <div className="dp-ev">
                <span className="dp-ev-time">11:42 PM</span>
                <span className="dp-ev-lbl">↑ {t.sleepEnd}</span>
              </div>
            </div>
          ) : (
            <div className="dp-strip">
              <div className="dp-strip-bar" style={{ left: '18%', width: '25%' }} />
              {sleeping && <div className="dp-strip-pulse" />}
            </div>
          )}
        </div>

        {/* DIARY */}
        <div className={`dp-diary${isDiary ? ' dp-diary--in' : ''}`}>
          <div className="dp-diary-label">{t.lpDiaryReady(8)}</div>
          <div className="dp-acto">
            {ACTO_NIGHTS.map((n, i) => (
              <div key={i} className="dp-acto-row">
                <span className="dp-acto-day">{n.label}</span>
                <div className="dp-acto-track">
                  {n.sleeps.map(([s, e], j) => (
                    <div
                      key={j}
                      className="dp-acto-bar"
                      style={{
                        left:  `${(s / 720) * 100}%`,
                        width: `${((Math.min(e, 720) - s) / 720) * 100}%`,
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
            <div className="dp-acto-ruler">
              <span>7 PM</span>
              <span>12 AM</span>
              <span>7 AM</span>
            </div>
          </div>
        </div>

      </div>

      {/* toast */}
      {isToast && <div key={phase} className="dp-toast">{toast}</div>}
    </div>
  )
}

export function LandingPage() {
  const navigate = useNavigate()

  const goToApp = (cta: 'nav' | 'hero' | 'manifesto') => {
    track('landing_cta_click', { cta })
    navigate('/app')
  }

  // Force day appearance and reset phone-frame layout while landing is visible
  useEffect(() => {
    document.documentElement.setAttribute('data-mode', 'day')
    document.body.classList.add('landing')
    return () => document.body.classList.remove('landing')
  }, [])

  return (
    <div className="lp-root">

      {/* ── Nav ───────────────────────────────────────────────── */}
      <nav className="lp-nav">
        <span className="lp-nav-brand">
          Moonling <em className="serif-italic">Owly</em>
        </span>
        <button className="lp-nav-cta" onClick={() => goToApp('nav')}>
          {t.openApp}
        </button>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="lp-hero">
        <div className="lp-hero-inner">
          <div className="lp-hero-text">
            <p className="lp-eyebrow">{t.lpEyebrow}</p>
            <h1 className="lp-hero-title">
              {t.lpHeroTitle1}<br />
              {t.lpHeroTitle2}
            </h1>
            <p className="lp-hero-sub">
              {t.lpHeroSub}
            </p>
            <button className="lp-hero-cta" onClick={() => goToApp('hero')}>
              {t.lpHeroCta}
            </button>
          </div>
          <div className="lp-hero-visual">
            <AnimatedPhone />
          </div>
        </div>
      </section>

      {/* ── El resultado — para padres ───────────────────────── */}
      <section className="lp-section lp-section--light">
        <div className="lp-inner">
          <p className="lp-section-label">{t.lpResultLabel}</p>
          <h2 className="lp-section-title">
            {t.lpResultTitle}
          </h2>
          <p className="lp-section-body">
            {t.lpResultBody}
          </p>
          <div className="lp-grid-wrap">
            <div className="lp-grid-demo">
              <SheetGrid days={DEMO_DAYS} dayStart={19} print={true} />
            </div>
            <p className="lp-grid-caption">{t.lpResultCaption}</p>
          </div>
        </div>
      </section>

      {/* ── Manifiesto ──────────────────────────────────────── */}
      <section className="lp-section lp-section--dark">
        <div className="lp-inner">
          <h2 className="lp-manifesto-title">
            {t.lpManifestoTitle1}<br />
            <em className="serif-italic">{t.lpManifestoTitle2}</em>
          </h2>
          <ul className="lp-manifesto-list">
            <li>{t.lpManifesto1}</li>
            <li>{t.lpManifesto2}</li>
            <li>{t.lpManifesto3}</li>
            <li>{t.lpManifesto4}</li>
          </ul>
          <button className="lp-manifesto-cta" onClick={() => goToApp('manifesto')}>
            {t.lpManifestoCta}
          </button>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="lp-footer">
        <span>Moonling <em className="serif-italic">Owly</em></span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to="/profesionales" className="lp-footer-pro">
            {t.lpFooterPro}
          </Link>
          <span className="lp-footer-v">v 0.1</span>
        </div>
      </footer>

    </div>
  )
}
