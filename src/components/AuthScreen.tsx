import { useState } from 'react'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../lib/firebase'

function BrandMark({ size = 28 }: { size?: number }) {
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

export function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!email || !password) return
    setLoading(true)
    setError(null)
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        await createUserWithEmailAndPassword(auth, email, password)
      }
    } catch (e: unknown) {
      const code = (e as { code?: string }).code
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Email o contraseña incorrectos')
      } else if (code === 'auth/email-already-in-use') {
        setError('Ya existe una cuenta con ese email')
      } else if (code === 'auth/weak-password') {
        setError('La contraseña debe tener al menos 6 caracteres')
      } else if (code === 'auth/invalid-email') {
        setError('Email no válido')
      } else {
        setError('Algo ha ido mal. Inténtalo de nuevo.')
      }
    }
    setLoading(false)
  }

  const onKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter') submit() }

  return (
    <div className="auth-screen">
      <div className="auth-brand">
        <span style={{ color: 'var(--accent)' }}><BrandMark size={32} /></span>
        <span className="auth-brand-name">Moonling</span>
        <span className="serif-italic auth-brand-sub">Owly</span>
      </div>

      <div className="auth-card">
        <h2 className="auth-title">
          {mode === 'login' ? 'Acceder' : 'Crear cuenta'}
        </h2>
        <p className="auth-sub">
          {mode === 'login'
            ? 'Los dos podéis usar el mismo email y contraseña.'
            : 'Una cuenta por familia. Los dos entráis con las mismas credenciales.'}
        </p>

        <div className="auth-fields">
          <input
            className="auth-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={onKey}
            autoComplete="email"
            autoFocus
          />
          <input
            className="auth-input"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={onKey}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
        </div>

        {error && <div className="auth-error">{error}</div>}

        <button className="auth-submit" onClick={submit} disabled={loading || !email || !password}>
          {loading ? '…' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
        </button>

        <button className="auth-toggle" onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(null) }}>
          {mode === 'login' ? '¿Primera vez? Crea una cuenta' : '¿Ya tienes cuenta? Acceder'}
        </button>
      </div>
    </div>
  )
}
