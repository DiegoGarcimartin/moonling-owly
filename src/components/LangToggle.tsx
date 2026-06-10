import { lang, setLang, type Lang } from '../lib/i18n'

const OPTIONS: { id: Lang; label: string; aria: string }[] = [
  { id: 'es', label: 'ES', aria: 'Español' },
  { id: 'en', label: 'EN', aria: 'English' },
]

// Compact ES/EN switcher. A manual choice is persisted (localStorage) and
// overrides the auto-detected locale; selecting reloads so all text updates.
export function LangToggle({ className = '' }: { className?: string }) {
  return (
    <div className={`lang-toggle ${className}`.trim()}>
      {OPTIONS.map((o, i) => (
        <span key={o.id} style={{ display: 'inline-flex', alignItems: 'center' }}>
          {i > 0 && <span className="lang-toggle-sep" aria-hidden="true">·</span>}
          <button
            type="button"
            className={`lang-toggle-btn${lang === o.id ? ' active' : ''}`}
            onClick={() => setLang(o.id)}
            aria-label={o.aria}
            aria-pressed={lang === o.id}
          >
            {o.label}
          </button>
        </span>
      ))}
    </div>
  )
}
