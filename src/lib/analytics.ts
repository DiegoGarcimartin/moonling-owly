import posthog from 'posthog-js'

// Centralised analytics wrapper around PostHog.
//
// Funnel del "procedimiento" (lo que queremos medir):
//   landing_cta_click → app_opened → signed_up/signed_in
//                     → onboarding_completed → sleep_logged
//
// Si no hay clave configurada (dev local sin .env) todo queda en no-op:
// el flag `enabled` corta cualquier llamada para que nada reviente.

// La Project API Key de PostHog es publicable (client-side, write-only): es
// seguro tenerla en el bundle. Se puede sobreescribir con VITE_POSTHOG_KEY.
const DEFAULT_KEY = 'phc_pTXAEKprxu7TiUcVqo7ULJeNk8fBfdcx4Q4XeGSapDv4'

const KEY = (import.meta.env.VITE_POSTHOG_KEY as string | undefined) || DEFAULT_KEY
const HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? 'https://eu.i.posthog.com'

let enabled = false

export function initAnalytics() {
  if (enabled || !KEY) return
  posthog.init(KEY, {
    api_host: HOST,
    // App de salud de bebés (España, GDPR): sin cookies, sólo memoria/localStorage,
    // sin grabar sesiones ni autocapturar inputs con datos sensibles.
    persistence: 'localStorage+cookie',
    autocapture: false,
    capture_pageview: false, // lo lanzamos a mano por ser SPA (ver capturePageview)
    capture_pageleave: true,
    disable_session_recording: true,
  })
  enabled = true
}

export type AnalyticsEvent =
  | 'landing_cta_click'
  | 'app_opened'
  | 'signed_up'
  | 'signed_in'
  | 'onboarding_completed'
  | 'sleep_logged'
  | 'quick_event_logged'

export function track(event: AnalyticsEvent, props?: Record<string, unknown>) {
  if (!enabled) return
  posthog.capture(event, props)
}

export function capturePageview(path: string) {
  if (!enabled) return
  posthog.capture('$pageview', { $current_url: window.location.origin + path })
}

// Asocia los eventos a la cuenta (uid de Firebase) sin guardar email ni datos del bebé.
export function identifyUser(uid: string) {
  if (!enabled) return
  posthog.identify(uid)
}

export function resetUser() {
  if (!enabled) return
  posthog.reset()
}
