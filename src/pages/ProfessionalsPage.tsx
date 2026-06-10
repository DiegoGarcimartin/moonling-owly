import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { t } from '../lib/i18n'
import { LangToggle } from '../components/LangToggle'

type LeadState = 'idle' | 'loading' | 'done' | 'error'

function ContactForm() {
  const [nombre, setNombre]   = useState('')
  const [consulta, setConsulta] = useState('')
  const [email, setEmail]     = useState('')
  const [como, setComo]       = useState('')
  const [mensaje, setMensaje] = useState('')
  const [status, setStatus]   = useState<LeadState>('idle')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim() || !email.trim()) return
    setStatus('loading')
    try {
      await addDoc(collection(db, 'leads'), {
        nombre:   nombre.trim(),
        consulta: consulta.trim(),
        email:    email.trim(),
        como:     como.trim(),
        mensaje:  mensaje.trim(),
        createdAt: serverTimestamp(),
      })
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <div className="lp-form-done">
        <div className="lp-form-done-icon">✓</div>
        <p className="lp-form-done-msg">{t.formDone}</p>
      </div>
    )
  }

  return (
    <form className="lp-form" onSubmit={submit}>
      <div className="lp-form-row">
        <div className="lp-form-field">
          <label className="lp-form-label">{t.formName}</label>
          <input className="lp-form-input" type="text" value={nombre}
            onChange={e => setNombre(e.target.value)} placeholder={t.formNamePlaceholder} required />
        </div>
        <div className="lp-form-field">
          <label className="lp-form-label">{t.formPractice}</label>
          <input className="lp-form-input" type="text" value={consulta}
            onChange={e => setConsulta(e.target.value)} placeholder={t.formPracticePlaceholder} required />
        </div>
      </div>
      <div className="lp-form-field">
        <label className="lp-form-label">{t.formEmail}</label>
        <input className="lp-form-input" type="email" value={email}
          onChange={e => setEmail(e.target.value)} placeholder={t.formEmailPlaceholder} required />
      </div>
      <div className="lp-form-field">
        <label className="lp-form-label">{t.formHow}</label>
        <textarea className="lp-form-textarea" value={como} rows={2}
          onChange={e => setComo(e.target.value)}
          placeholder={t.formHowPlaceholder} />
      </div>
      <div className="lp-form-field">
        <label className="lp-form-label">{t.formMessage}</label>
        <textarea className="lp-form-textarea" value={mensaje} rows={3}
          onChange={e => setMensaje(e.target.value)}
          placeholder={t.formMessagePlaceholder} />
      </div>
      <button className="lp-form-submit" type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? t.formSending : t.formSubmit}
      </button>
      {status === 'error' && (
        <p className="lp-form-error">{t.formError}</p>
      )}
    </form>
  )
}

export function ProfessionalsPage() {
  const navigate = useNavigate()

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', 'day')
    document.body.classList.add('landing')
    return () => document.body.classList.remove('landing')
  }, [])

  return (
    <div className="lp-root">

      {/* ── Nav ───────────────────────────────────────────────── */}
      <nav className="lp-nav">
        <span className="lp-nav-brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          Moonling <em className="serif-italic">Owly</em>
        </span>
        <button className="lp-nav-cta" onClick={() => navigate('/app')}>
          {t.openApp}
        </button>
      </nav>

      {/* ── Sección para profesionales ────────────────────────── */}
      <section className="lp-section lp-section--warm">
        <div className="lp-inner">
          <p className="lp-section-label">{t.proLabel}</p>
          <h2 className="lp-section-title">
            {t.proTitle1}<br />
            <em className="serif-italic">{t.proTitle2}</em>
          </h2>
          <p className="lp-section-body">
            {t.proBody}
          </p>
          <ContactForm />
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="lp-footer">
        <span
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          {t.back}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <LangToggle />
          <span className="lp-footer-v">v 0.1</span>
        </div>
      </footer>

    </div>
  )
}
