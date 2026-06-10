import { useState } from 'react'
import { t } from '../lib/i18n'

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
          <h1 className="onboarding-title">{t.onboardingTitle1}<br />{t.onboardingTitle2}</h1>
          <p className="onboarding-sub">{t.onboardingSub}</p>
        </div>

        <div className="onboarding-fields">
          <div className="onboarding-field">
            <label className="onboarding-label">{t.onboardingNameLabel}</label>
            <input
              className="onboarding-input"
              type="text"
              placeholder={t.egName}
              value={name}
              onChange={e => setName(sanitize(e.target.value).slice(0, 40))}
              maxLength={40}
              onKeyDown={e => e.key === 'Enter' && submit()}
              autoFocus
            />
          </div>
          <div className="onboarding-field">
            <label className="onboarding-label">{t.onboardingAgeLabel} <span className="onboarding-optional">{t.optional}</span></label>
            <input
              className="onboarding-input"
              type="text"
              placeholder={t.egAge}
              value={age}
              onChange={e => setAge(sanitize(e.target.value).slice(0, 16))}
              maxLength={16}
              onKeyDown={e => e.key === 'Enter' && submit()}
            />
          </div>
        </div>

        <button className="onboarding-cta" onClick={submit}>
          {t.onboardingCta}
        </button>
      </div>
    </div>
  )
}
