import { Component, ReactNode } from 'react'
import { t } from '../lib/i18n'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

const STORAGE_KEYS = ['moonling-owly-v1', 'moonling-owly-settings']

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: unknown) {
    // eslint-disable-next-line no-console
    console.error('Moonling Owly crashed:', error, info)
  }

  handleReset = () => {
    try {
      for (const key of STORAGE_KEYS) localStorage.removeItem(key)
    } catch { /* ignore */ }
    window.location.reload()
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="app-root" data-mode="night">
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: '100%', padding: '0 28px', textAlign: 'center', gap: 16,
        }}>
          <div className="serif-italic" style={{ fontSize: 28, color: 'var(--text)' }}>
            {t.errorTitle}
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-mute)', maxWidth: 320, lineHeight: 1.5 }}>
            {t.errorBody}
          </p>
          <button className="modal-confirm" onClick={this.handleReload} style={{ minWidth: 220 }}>
            {t.errorReload}
          </button>
          <button className="modal-cancel" onClick={this.handleReset} style={{ minWidth: 220 }}>
            {t.errorReset}
          </button>
        </div>
      </div>
    )
  }
}
