import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { SheetGrid } from '../components/SheetGrid'
import type { Day } from '../data'

// 8 nights of realistic demo data (dayStart = 19 = 7 PM)
// Track minutes: 0 = 7 PM · 60 = 8 PM · 300 = 12 AM · 540 = 4 AM · 720 = 7 AM
const DEMO_DAYS: Day[] = [
  { d: '12', label: 'LUN', date: '2026-05-12', sleeps: [[75,360],[375,600]],          events: [{ type: 'A', t: 362 }] },
  { d: '13', label: 'MAR', date: '2026-05-13', sleeps: [[60,330],[345,420],[435,630]],events: [{ type: 'A', t: 330 }, { type: 'A', t: 420 }] },
  { d: '14', label: 'MIÉ', date: '2026-05-14', sleeps: [[90,600]],                    events: [] },
  { d: '15', label: 'JUE', date: '2026-05-15', sleeps: [[45,270],[330,540],[555,660]],events: [{ type: 'A', t: 270 }, { type: 'A', t: 330 }] },
  { d: '16', label: 'VIE', date: '2026-05-16', sleeps: [[60,510],[525,690]],          events: [{ type: 'A', t: 510 }, { type: 'C', t: 525 }] },
  { d: '17', label: 'SÁB', date: '2026-05-17', sleeps: [[75,465],[480,645]],          events: [{ type: 'A', t: 465 }] },
  { d: '18', label: 'DOM', date: '2026-05-18', sleeps: [[60,660]],                    events: [] },
  { d: '19', label: 'LUN', date: '2026-05-19', sleeps: [[75,390],[405,615]],          events: [{ type: 'A', t: 390 }] },
]

type LeadState = 'idle' | 'loading' | 'done' | 'error'

function ContactForm() {
  const [nombre, setNombre]   = useState('')
  const [negocio, setNegocio] = useState('')
  const [email, setEmail]     = useState('')
  const [clientes, setClientes] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [status, setStatus]   = useState<LeadState>('idle')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim() || !email.trim()) return
    setStatus('loading')
    try {
      await addDoc(collection(db, 'leads'), {
        nombre:   nombre.trim(),
        negocio:  negocio.trim(),
        email:    email.trim(),
        clientes,
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
        <p className="lp-form-done-msg">Recibido. Te escribimos pronto.</p>
      </div>
    )
  }

  return (
    <form className="lp-form" onSubmit={submit}>
      <div className="lp-form-row">
        <div className="lp-form-field">
          <label className="lp-form-label">Nombre *</label>
          <input className="lp-form-input" type="text" value={nombre}
            onChange={e => setNombre(e.target.value)} placeholder="Tu nombre" required />
        </div>
        <div className="lp-form-field">
          <label className="lp-form-label">Consulta o negocio *</label>
          <input className="lp-form-input" type="text" value={negocio}
            onChange={e => setNegocio(e.target.value)} placeholder="Ej. Sueño Feliz" required />
        </div>
      </div>
      <div className="lp-form-row">
        <div className="lp-form-field">
          <label className="lp-form-label">Email de contacto *</label>
          <input className="lp-form-input" type="email" value={email}
            onChange={e => setEmail(e.target.value)} placeholder="hola@tuconsulta.com" required />
        </div>
        <div className="lp-form-field">
          <label className="lp-form-label">Número de clientes aprox.</label>
          <select className="lp-form-select" value={clientes} onChange={e => setClientes(e.target.value)}>
            <option value="">Seleccionar</option>
            <option value="<10">Menos de 10</option>
            <option value="10-50">10 – 50</option>
            <option value="50-200">50 – 200</option>
            <option value="+200">Más de 200</option>
          </select>
        </div>
      </div>
      <div className="lp-form-field">
        <label className="lp-form-label">Mensaje (opcional)</label>
        <textarea className="lp-form-textarea" value={mensaje} rows={3}
          onChange={e => setMensaje(e.target.value)}
          placeholder="Cuéntanos un poco sobre lo que buscas…" />
      </div>
      <button className="lp-form-submit" type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Enviando…' : 'Enviar'}
      </button>
      {status === 'error' && (
        <p className="lp-form-error">Algo salió mal. Escríbenos a hola@moonlingowly.com</p>
      )}
    </form>
  )
}

export function LandingPage() {
  const navigate = useNavigate()

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
        <button className="lp-nav-cta" onClick={() => navigate('/app')}>
          Abrir app →
        </button>
      </nav>

      {/* ── Hero — para los padres ────────────────────────────── */}
      <section className="lp-hero">
        <div className="lp-inner">
          <p className="lp-eyebrow">diario de sueño</p>
          <h1 className="lp-hero-title">
            Una mano.<br />
            Oscuridad.<br />
            Bebé en brazos.
          </h1>
          <p className="lp-hero-sub">
            Un toque cuando empieza el sueño. Un toque cuando se despierta.
            En 14 noches tienes un diario listo para tu pediatra.
          </p>
          <button className="lp-hero-cta" onClick={() => navigate('/app')}>
            Empezar gratis
          </button>
        </div>
      </section>

      {/* ── Grid demo — para consultoras ─────────────────────── */}
      <section className="lp-section lp-section--light">
        <div className="lp-inner">
          <p className="lp-section-label">para consultoras de sueño</p>
          <h2 className="lp-section-title">
            El actograma que necesitas,<br />
            <em className="serif-italic">sin trabajo extra.</em>
          </h2>
          <p className="lp-section-body">
            Tus clientes registran noche a noche. Tú recibes el patrón visual
            completo antes de cada sesión — listo para compartir o imprimir.
          </p>
          <div className="lp-grid-wrap">
            <div className="lp-grid-demo">
              <SheetGrid days={DEMO_DAYS} dayStart={19} print={true} />
            </div>
            <p className="lp-grid-caption">8 noches de ejemplo · inicio a las 7 PM</p>
          </div>
        </div>
      </section>

      {/* ── White label ──────────────────────────────────────── */}
      <section className="lp-section lp-section--warm">
        <div className="lp-inner">
          <p className="lp-section-label">white label</p>
          <h2 className="lp-section-title">
            Tu marca.<br />
            <em className="serif-italic">Tu herramienta.</em>
          </h2>
          <p className="lp-section-body">
            Logo, colores, nombre. La app queda como tuya.
            Tus clientes la instalan en el móvil sin saber que existe Moonling Owly.
          </p>
          <ContactForm />
        </div>
      </section>

      {/* ── Manifiesto ──────────────────────────────────────── */}
      <section className="lp-section lp-section--dark">
        <div className="lp-inner">
          <h2 className="lp-manifesto-title">
            Esto es un diario.<br />
            <em className="serif-italic">Nada más.</em>
          </h2>
          <ul className="lp-manifesto-list">
            <li>No predice ni analiza el sueño de tu hijo.</li>
            <li>No te manda notificaciones a las 3 AM.</li>
            <li>No tiene IA que te diga qué estás haciendo mal.</li>
            <li>No vende publicidad ni tiene versión premium.</li>
          </ul>
          <button className="lp-manifesto-cta" onClick={() => navigate('/app')}>
            Probar →
          </button>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="lp-footer">
        <span>Moonling <em className="serif-italic">Owly</em></span>
        <span className="lp-footer-v">v 0.1</span>
      </footer>

    </div>
  )
}
