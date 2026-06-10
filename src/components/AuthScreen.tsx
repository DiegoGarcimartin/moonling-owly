import { useState } from 'react'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { track } from '../lib/analytics'
import { t } from '../lib/i18n'

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
        track('signed_in')
      } else {
        await createUserWithEmailAndPassword(auth, email, password)
        track('signed_up')
      }
    } catch (e: unknown) {
      const code = (e as { code?: string }).code
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError(t.errWrongCredentials)
      } else if (code === 'auth/email-already-in-use') {
        setError(t.errEmailInUse)
      } else if (code === 'auth/weak-password') {
        setError(t.errWeakPassword)
      } else if (code === 'auth/invalid-email') {
        setError(t.errInvalidEmail)
      } else {
        setError(t.errGeneric)
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
          {mode === 'login' ? t.authLogin : t.authRegister}
        </h2>
        <p className="auth-sub">
          {mode === 'login' ? t.authLoginSub : t.authRegisterSub}
        </p>

        <div className="auth-fields">
          <input
            className="auth-input"
            type="email"
            placeholder={t.email}
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={onKey}
            autoComplete="email"
            autoFocus
          />
          <input
            className="auth-input"
            type="password"
            placeholder={t.password}
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={onKey}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
        </div>

        {error && <div className="auth-error">{error}</div>}

        <button className="auth-submit" onClick={submit} disabled={loading || !email || !password}>
          {loading ? '…' : mode === 'login' ? t.authSubmitLogin : t.authSubmitRegister}
        </button>

        <button className="auth-toggle" onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(null) }}>
          {mode === 'login' ? t.authToggleToRegister : t.authToggleToLogin}
        </button>
      </div>
    </div>
  )
}
