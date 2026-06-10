import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './global.css'
import App from './App'
import { LandingPage } from './pages/LandingPage'
import { ProfessionalsPage } from './pages/ProfessionalsPage'
import { DiaryPreviewPage } from './pages/DiaryPreviewPage'
import { ErrorBoundary } from './components/ErrorBoundary'
import { initAnalytics, capturePageview } from './lib/analytics'
import { lang, t } from './lib/i18n'

initAnalytics()

// Apply the detected language to the document chrome (html lang + tab title +
// meta description). Language is picked from the browser locale in i18n.ts.
document.documentElement.lang = lang
document.title = t.docTitle
document
  .querySelector('meta[name="description"]')
  ?.setAttribute('content', t.docDescription)

// SPA: capturamos un $pageview en cada cambio de ruta de react-router.
function PageviewTracker() {
  const location = useLocation()
  useEffect(() => {
    capturePageview(location.pathname)
  }, [location.pathname])
  return null
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <PageviewTracker />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/profesionales" element={<ProfessionalsPage />} />
          {/* dev-only: renders the clinical case diary for screenshot generation */}
          <Route path="/diary-preview" element={<DiaryPreviewPage />} />
          <Route path="/app" element={<App />} />
          {/* catch-all: any other path → landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
