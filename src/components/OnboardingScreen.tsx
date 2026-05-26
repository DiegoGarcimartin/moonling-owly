import { useState } from 'react'

interface OnboardingScreenProps {
  onDone: (childName: string, childAge: string) => void
}

const sanitize = (s: string) => s.replace(/[<>]/g, '')

export function OnboardingScreen({ onDone }: OnboardingScreenProps) {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')

  const submit = () => onDone(name.trim(), age.trim())

  return (
    <div className="onboarding-root">
      <div className="onboarding-inner">
        <div className="onboarding-brand">
          <span className="serif-italic">Moonling Owly</span>
        </div>

        <div className="onboarding-hero">
          <h1 className="onboarding-title">El diario de sueño<br />más simple.</h1>
          <p className="onboarding-sub">
            Pulsa cuando empieza el sueño, pulsa cuando se despierta.
            En 14 noches tienes un diario listo para tu pediatra.
          </p>
        </div>

        <div className="onboarding-fields">
          <div className="onboarding-field">
            <label className="onboarding-label">¿Cómo se llama?</label>
            <input
              className="onboarding-input"
              type="text"
              placeholder="ej. Lila"
              value={name}
              onChange={e => setName(sanitize(e.target.value).slice(0, 40))}
              maxLength={40}
              onKeyDown={e => e.key === 'Enter' && submit()}
              autoFocus
            />
          </div>
          <div className="onboarding-field">
            <label className="onboarding-label">¿Cuántos meses tiene? <span className="onboarding-optional">opcional</span></label>
            <input
              className="onboarding-input"
              type="text"
              placeholder="ej. 11 m"
              value={age}
              onChange={e => setAge(sanitize(e.target.value).slice(0, 16))}
              maxLength={16}
              onKeyDown={e => e.key === 'Enter' && submit()}
            />
          </div>
        </div>

        <button className="onboarding-cta" onClick={submit}>
          Empezar
        </button>
      </div>
    </div>
  )
}
