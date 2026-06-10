// Lightweight i18n. Language is chosen once, from the browser locale:
// Spanish locales → 'es', everything else → 'en'. There is no in-app
// language switcher by design — the diary should "just be" in the user's
// language. `t` is the resolved dictionary for the active language.

export type Lang = 'es' | 'en'

const LANG_KEY = 'moonling-owly-lang'

// Auto-detect from the browser locale: Spanish locales → 'es', else 'en'.
export function detectLang(): Lang {
  try {
    const candidates = [
      ...(navigator.languages ?? []),
      navigator.language,
    ].filter(Boolean) as string[]
    const primary = candidates[0] ?? 'en'
    return primary.toLowerCase().startsWith('es') ? 'es' : 'en'
  } catch {
    return 'en'
  }
}

// A manual choice (if any) wins over the auto-detected locale.
function storedLang(): Lang | null {
  try {
    const v = localStorage.getItem(LANG_KEY)
    return v === 'es' || v === 'en' ? v : null
  } catch {
    return null
  }
}

export const lang: Lang = storedLang() ?? detectLang()

// Whether the active language came from an explicit user choice.
export const langIsManual = storedLang() !== null

// Persist a manual language choice and reload so every statically-resolved
// `t.*` string is recomputed in the new language.
export function setLang(next: Lang) {
  if (next === lang) return
  try { localStorage.setItem(LANG_KEY, next) } catch { /* ignore */ }
  window.location.reload()
}

// Month + weekday abbreviations, indexed the JS way (months 0..11,
// weekdays 0=Sun..6=Sat).
const MONTHS_MAP: Record<Lang, string[]> = {
  es: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
}
const WEEKDAYS_MAP: Record<Lang, string[]> = {
  es: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
}

export const MONTHS = MONTHS_MAP[lang]
export const WEEKDAYS = WEEKDAYS_MAP[lang]

// Map an English weekday key ('sun'..'sat'), as produced by storage, to the
// localized abbreviation.
const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
export function weekdayFromKey(key: string): string {
  const idx = WEEKDAY_KEYS.indexOf(key.toLowerCase())
  return idx >= 0 ? WEEKDAYS[idx] : key
}

const es = {
  // ── App shell ──────────────────────────────────────────────
  brandSub: 'Owly',
  tabToday: 'Hoy',
  tabDiary: 'Diario',
  ariaToggleMode: 'Cambiar modo',
  ariaSettings: 'Ajustes',
  ariaClose: 'Cerrar',
  ariaHowItWorks: 'Cómo funciona',

  // ── Event names (singular) ─────────────────────────────────
  feeding: 'Toma',
  cosleep: 'Colecho',
  note: 'Nota',
  sleepStart: 'Inicio de sueño',
  sleepEnd: 'Despertar',

  // ── Toasts ─────────────────────────────────────────────────
  toastSleepStart: (time: string) => `↓ Inicio de sueño · ${time}`,
  toastWake: (time: string) => `↑ Despertar · ${time}`,
  toastEvent: (label: string, time: string) => `${label} · ${time}`,
  toastEntryDeleted: 'Entrada eliminada',
  toastEntrySaved: 'Entrada guardada',
  toastNoteSaved: 'Nota guardada',
  toastDiaryClosed: 'Diario cerrado · empezando de cero',

  // ── Close-diary modal ──────────────────────────────────────
  closeDiaryTitle: '¿Cerrar este diario?',
  closeDiarySub: 'Empezarás un diario nuevo desde el día 1.',
  closeDiaryConfirm: 'Sí, cerrar y empezar de cero',
  cancel: 'Cancelar',
  save: 'Guardar',

  // ── Edit-note modal ────────────────────────────────────────
  notePlaceholderExample: 'Ej: tomó 210 ml, tardó en dormirse…',

  // ── Home: empty state ──────────────────────────────────────
  emptyTitleLine1: 'Empieza',
  emptyTitleLine2: 'cuando quieras',
  emptySub: 'Pulsa el botón la primera vez que pongas al bebé a dormir. En 14 días tendrás un diario listo para tu pediatra.',
  ctaEyebrowStart: 'inicio',
  ctaStart: 'Inicio de sueño',
  now: 'ahora',
  or: 'o',
  addManual: 'Añadir entrada manual',
  howItWorks: 'Cómo funciona',
  guideSleepStart: { b: 'Inicio de sueño.', rest: ' Pulsa cuando empieces la rutina de sueño.' },
  guideSleepEnd: { b: 'Despertar.', rest: ' Pulsa cuando el bebé esté definitivamente despierto — no para despertares nocturnos.' },
  guideFeed: { b: 'Toma.', rest: ' Pulsa cada vez que des una toma (incluyendo antes de dormir).' },
  guideCosleep: { b: 'Colecho.', rest: ' Pulsa si compartes cama en algún momento.' },
  guideNote: { b: 'Nota.', rest: ' Cualquier cosa inusual: llanto prolongado, movimientos, ronquidos…' },
  guideFoot: (from: string) => ({ pre: 'Un ', em: 'día', mid: ' va desde las ', a: from, mid2: ' hasta las ', b: from, post: ' del día siguiente. Puedes cambiarlo en ajustes.' }),

  // ── Home: tracking state ───────────────────────────────────
  sleeping: 'Durmiendo',
  awake: 'Despierto',
  since: (time: string) => `desde las ${time}`,
  dayCounter: (n: number) => ({ pre: 'día ', n, post: ' / 14' }),
  ctaEyebrowWake: 'cuando se despierte',
  ctaEyebrowSleep: 'cuando empiece el sueño',
  ctaWake: 'Marcar despertar',
  ctaSleep: 'Marcar inicio de sueño',
  stripInProgress: 'en curso',
  completeEyebrow: 'diario completo',
  completeTitle: '14 días registrados',
  completeSub: '¿Cerrarlo y empezar uno nuevo?',
  completeCta: 'Cerrar este diario',
  entriesCount: (n: number) => `${n} ${n === 1 ? 'entrada' : 'entradas'}`,
  noEntriesYet: 'Sin entradas por ahora.',
  addNoteHint: 'Añadir nota…',

  // ── Sheet / diary ──────────────────────────────────────────
  diaryEyebrow: (n: number) => `Diario · ${n} ${n === 1 ? 'día' : 'días'}`,
  emptyDiaryTitle1: 'Tu diario',
  emptyDiaryTitle2: 'te espera',
  emptyDiarySub: 'Empieza en cuanto registres tu primer día.',
  myDiaryTitle1: 'Mi diario',
  myDiaryTitle2: 'de sueño',
  diaryOf: (name: string) => ({ pre: 'de ', name }),
  daysLabel: (n: number) => `${n} ${n === 1 ? 'día' : 'días'}`,
  dayWord: (n: number): string => (n === 1 ? 'día' : 'días'),
  legendAsleep: 'dormido',
  legendFeed: 'toma',
  legendCosleep: 'colecho',
  legendNote: 'nota',
  statAvgPerDay: 'Media / día',
  statTotal: (n: number) => `Total ${n}d`,
  statWakeups: 'Despertares',
  dayN: (n: number) => `Día ${n}`,
  noEntries: 'Sin entradas.',
  forYourPediatrician: 'para tu pediatra',
  shareWhenReady1: 'Cuando estés listo,',
  shareWhenReady2: 'compártelo.',
  shareImage: 'Compartir imagen',
  downloadCsv: 'Descargar tabla (CSV)',
  closeAndNew: 'Cerrar este diario y empezar uno nuevo',
  csvDay: 'Día',

  // ── Entry modal ────────────────────────────────────────────
  entryTypeSleepStart: 'Inicio sueño',
  entryTypeSleepEnd: 'Despertar',
  addEntry: 'Añadir entrada',
  addEntrySub: 'Registra lo que recuerdes. Sin estrés.',
  whatHappened: 'Qué pasó',
  when: 'Cuándo',
  today: 'hoy',
  hour: 'hora',
  fiveMin: '5 min',
  noteWhatHappened: 'Qué pasó…',
  noteOptional: 'Nota opcional…',
  futureTime: 'Esa hora aún no ha pasado.',

  // ── Share preview modal ────────────────────────────────────
  shareDiaryTitle: 'Compartir diario',
  shareDiarySub: 'La imagen se genera en formato apaisado.',
  legendStart: 'inicio',
  legendWake: 'despertar',
  shareFileTitle: (name: string) => name ? `${name} — diario de sueño` : 'Diario de sueño',
  generating: 'Generando…',
  savePdf: 'Guardar PDF',

  // ── Settings modal ─────────────────────────────────────────
  settings: 'Ajustes',
  baby: 'Bebé',
  name: 'Nombre',
  age: 'Edad',
  egName: 'ej. Lila',
  egAge: 'ej. 11 m',
  nameHint: 'Se muestra en el diario que compartes con tu pediatra.',
  dayStartsAt: 'El día empieza a las',
  ariaEarlier: 'Antes',
  ariaLater: 'Después',
  dayStartHint: 'Si tu familia empieza antes o después, puedes ajustarlo.',
  startNewJournal: 'Empezar un diario nuevo',
  startNewJournalHint: 'Cierra este período de 14 días y empieza desde el día 1. El diario actual se conserva.',
  signOut: 'Cerrar sesión',
  language: 'Idioma',

  // ── Help modal ─────────────────────────────────────────────
  helpSub: 'Unas pocas reglas. Nada más.',
  helpSleepEnd: { b: 'Despertar.', rest: ' Cuando el bebé esté definitivamente despierto — no para despertares nocturnos (esos son notas, opcionales).' },
  helpFeed: { b: 'Toma.', rest: ' Cada vez que des una toma, incluyendo durante la rutina de sueño.' },
  helpCosleep: { b: 'Colecho.', rest: ' Si en algún momento compartes la cama.' },
  helpFoot: (from: string) => ({ pre: 'El ', em: 'día', mid: ' empieza actualmente a las ', a: from, post: '. Si tu familia se acuesta antes, cámbialo en Ajustes.' }),
  gotIt: 'Entendido',

  // ── Auth screen ────────────────────────────────────────────
  authLogin: 'Acceder',
  authRegister: 'Crear cuenta',
  authLoginSub: 'Los dos podéis usar el mismo email y contraseña.',
  authRegisterSub: 'Una cuenta por familia. Los dos entráis con las mismas credenciales.',
  email: 'Email',
  password: 'Contraseña',
  authSubmitLogin: 'Entrar',
  authSubmitRegister: 'Crear cuenta',
  authToggleToRegister: '¿Primera vez? Crea una cuenta',
  authToggleToLogin: '¿Ya tienes cuenta? Acceder',
  errWrongCredentials: 'Email o contraseña incorrectos',
  errEmailInUse: 'Ya existe una cuenta con ese email',
  errWeakPassword: 'La contraseña debe tener al menos 6 caracteres',
  errInvalidEmail: 'Email no válido',
  errGeneric: 'Algo ha ido mal. Inténtalo de nuevo.',

  // ── Onboarding ─────────────────────────────────────────────
  onboardingTitle1: 'El diario de sueño',
  onboardingTitle2: 'más simple.',
  onboardingSub: 'Pulsa cuando empieza el sueño, pulsa cuando se despierta. En 14 días tienes un diario listo para tu pediatra.',
  onboardingNameLabel: '¿Cómo se llama?',
  onboardingAgeLabel: '¿Cuántos meses tiene?',
  optional: 'opcional',
  onboardingCta: 'Empezar',

  // ── Landing page ───────────────────────────────────────────
  openApp: 'Abrir app →',
  lpEyebrow: 'diario de sueño',
  lpHeroTitle1: 'El diario de sueño',
  lpHeroTitle2: 'para las 3 de la mañana.',
  lpHeroSub: 'Un toque cuando empieza el sueño. Un toque cuando se despierta. En 14 días tienes un diario listo para tu pediatra.',
  lpHeroCta: 'Empezar gratis',
  lpResultLabel: 'el resultado',
  lpResultTitle: '14 noches, un diario listo.',
  lpResultBody: 'El formato que tu pediatra reconoce a la primera. Lo enseñas en consulta y a otra cosa.',
  lpResultCaption: '14 días de ejemplo · inicio a las 7 PM',
  lpManifestoTitle1: 'Esto es un diario.',
  lpManifestoTitle2: 'Nada más.',
  lpManifesto1: 'No predice ni analiza el sueño de tu hijo.',
  lpManifesto2: 'No te manda notificaciones a las 3 AM.',
  lpManifesto3: 'No tiene IA que te diga qué estás haciendo mal.',
  lpManifesto4: 'No vende publicidad ni tiene versión premium.',
  lpManifestoCta: 'Probar →',
  lpFooterPro: '¿Eres profesional? Habla con nosotros →',
  lpDiaryReady: (n: number) => `${n} días · diario listo`,

  // Demo phone toasts
  dpToastSleep: '↓  Inicio de sueño · 8:15 PM',
  dpToastWake: '↑  Despertar · 11:42 PM',
  dpSince815: 'desde las 8:15 PM',

  // ── Professionals page ─────────────────────────────────────
  proLabel: 'para profesionales',
  proTitle1: 'Tu marca.',
  proTitle2: 'Tu herramienta.',
  proBody: 'Pediatras, psicólogos del sueño, consultoras certificadas: si trabajas con familias y el registro del sueño forma parte de tu práctica, Moonling Owly puede llevarse tu logo y colores. Tus familias lo instalan en el móvil sin saber que existe Moonling Owly.',
  back: '← Volver',
  formName: 'Nombre *',
  formNamePlaceholder: 'Tu nombre',
  formPractice: 'Consulta, clínica o práctica *',
  formPracticePlaceholder: 'Ej. Clínica Pediatría Norte',
  formEmail: 'Email de contacto *',
  formEmailPlaceholder: 'hola@tuconsulta.com',
  formHow: '¿Cómo trabajas con familias? (opcional)',
  formHowPlaceholder: 'Consulta privada, clínica, visitas a domicilio…',
  formMessage: 'Mensaje (opcional)',
  formMessagePlaceholder: 'Cuéntanos un poco sobre lo que buscas…',
  formSending: 'Enviando…',
  formSubmit: 'Enviar',
  formError: 'Algo salió mal. Escríbenos a hola@moonlingowly.com',
  formDone: 'Recibido. Te escribimos pronto.',

  // ── Error boundary ─────────────────────────────────────────
  errorTitle: 'Algo se ha torcido.',
  errorBody: 'La app no ha podido cargarse. Si recargar no funciona, puedes empezar de cero (se borrarán los datos locales; si tenías sesión activa, los recuperarás al volver a entrar).',
  errorReload: 'Recargar',
  errorReset: 'Borrar datos locales y empezar',

  // ── Document meta ──────────────────────────────────────────
  docTitle: 'Moonling Owly — Diario de sueño para tu bebé',
  docDescription: 'El diario de sueño más sencillo. Un toque cuando empieza, un toque cuando termina. En 14 noches, un actograma listo para tu pediatra.',
}

const en: typeof es = {
  // ── App shell ──────────────────────────────────────────────
  brandSub: 'Owly',
  tabToday: 'Today',
  tabDiary: 'Diary',
  ariaToggleMode: 'Toggle mode',
  ariaSettings: 'Settings',
  ariaClose: 'Close',
  ariaHowItWorks: 'How it works',

  // ── Event names (singular) ─────────────────────────────────
  feeding: 'Feed',
  cosleep: 'Co-sleep',
  note: 'Note',
  sleepStart: 'Asleep',
  sleepEnd: 'Awake',

  // ── Toasts ─────────────────────────────────────────────────
  toastSleepStart: (time: string) => `↓ Asleep · ${time}`,
  toastWake: (time: string) => `↑ Awake · ${time}`,
  toastEvent: (label: string, time: string) => `${label} · ${time}`,
  toastEntryDeleted: 'Entry deleted',
  toastEntrySaved: 'Entry saved',
  toastNoteSaved: 'Note saved',
  toastDiaryClosed: 'Diary closed · starting fresh',

  // ── Close-diary modal ──────────────────────────────────────
  closeDiaryTitle: 'Close this diary?',
  closeDiarySub: "You'll start a new diary from day 1.",
  closeDiaryConfirm: 'Yes, close and start fresh',
  cancel: 'Cancel',
  save: 'Save',

  // ── Edit-note modal ────────────────────────────────────────
  notePlaceholderExample: 'E.g.: drank 210 ml, took a while to settle…',

  // ── Home: empty state ──────────────────────────────────────
  emptyTitleLine1: 'Start',
  emptyTitleLine2: 'whenever you like',
  emptySub: 'Tap the button the first time you put your baby down to sleep. In 14 days you’ll have a diary ready for your pediatrician.',
  ctaEyebrowStart: 'start',
  ctaStart: 'Sleep start',
  now: 'now',
  or: 'or',
  addManual: 'Add entry manually',
  howItWorks: 'How it works',
  guideSleepStart: { b: 'Sleep start.', rest: ' Tap when you begin the bedtime routine.' },
  guideSleepEnd: { b: 'Awake.', rest: ' Tap when the baby is definitely awake — not for night wakings.' },
  guideFeed: { b: 'Feed.', rest: ' Tap every time you feed (including before sleep).' },
  guideCosleep: { b: 'Co-sleep.', rest: ' Tap if you share a bed at any point.' },
  guideNote: { b: 'Note.', rest: ' Anything unusual: prolonged crying, movements, snoring…' },
  guideFoot: (from: string) => ({ pre: 'A ', em: 'day', mid: ' runs from ', a: from, mid2: ' to ', b: from, post: ' the next day. You can change it in settings.' }),

  // ── Home: tracking state ───────────────────────────────────
  sleeping: 'Sleeping',
  awake: 'Awake',
  since: (time: string) => `since ${time}`,
  dayCounter: (n: number) => ({ pre: 'day ', n, post: ' / 14' }),
  ctaEyebrowWake: 'when they wake up',
  ctaEyebrowSleep: 'when sleep begins',
  ctaWake: 'Mark awake',
  ctaSleep: 'Mark sleep start',
  stripInProgress: 'in progress',
  completeEyebrow: 'diary complete',
  completeTitle: '14 days logged',
  completeSub: 'Close it and start a new one?',
  completeCta: 'Close this diary',
  entriesCount: (n: number) => `${n} ${n === 1 ? 'entry' : 'entries'}`,
  noEntriesYet: 'No entries yet.',
  addNoteHint: 'Add note…',

  // ── Sheet / diary ──────────────────────────────────────────
  diaryEyebrow: (n: number) => `Diary · ${n} ${n === 1 ? 'day' : 'days'}`,
  emptyDiaryTitle1: 'Your diary',
  emptyDiaryTitle2: 'awaits',
  emptyDiarySub: 'It begins as soon as you log your first day.',
  myDiaryTitle1: 'My sleep',
  myDiaryTitle2: 'diary',
  diaryOf: (name: string) => ({ pre: 'for ', name }),
  daysLabel: (n: number) => `${n} ${n === 1 ? 'day' : 'days'}`,
  dayWord: (n: number) => (n === 1 ? 'day' : 'days'),
  legendAsleep: 'asleep',
  legendFeed: 'feed',
  legendCosleep: 'co-sleep',
  legendNote: 'note',
  statAvgPerDay: 'Avg / day',
  statTotal: (n: number) => `Total ${n}d`,
  statWakeups: 'Wakings',
  dayN: (n: number) => `Day ${n}`,
  noEntries: 'No entries.',
  forYourPediatrician: 'for your pediatrician',
  shareWhenReady1: 'When you’re ready,',
  shareWhenReady2: 'share it.',
  shareImage: 'Share image',
  downloadCsv: 'Download table (CSV)',
  closeAndNew: 'Close this diary and start a new one',
  csvDay: 'Day',

  // ── Entry modal ────────────────────────────────────────────
  entryTypeSleepStart: 'Sleep start',
  entryTypeSleepEnd: 'Awake',
  addEntry: 'Add entry',
  addEntrySub: 'Log what you remember. No stress.',
  whatHappened: 'What happened',
  when: 'When',
  today: 'today',
  hour: 'hour',
  fiveMin: '5 min',
  noteWhatHappened: 'What happened…',
  noteOptional: 'Optional note…',
  futureTime: 'That time hasn’t happened yet.',

  // ── Share preview modal ────────────────────────────────────
  shareDiaryTitle: 'Share diary',
  shareDiarySub: 'The image is generated in landscape format.',
  legendStart: 'start',
  legendWake: 'awake',
  shareFileTitle: (name: string) => name ? `${name} — sleep diary` : 'Sleep diary',
  generating: 'Generating…',
  savePdf: 'Save PDF',

  // ── Settings modal ─────────────────────────────────────────
  settings: 'Settings',
  baby: 'Baby',
  name: 'Name',
  age: 'Age',
  egName: 'e.g. Lila',
  egAge: 'e.g. 11 mo',
  nameHint: 'Shown on the diary you share with your pediatrician.',
  dayStartsAt: 'The day starts at',
  ariaEarlier: 'Earlier',
  ariaLater: 'Later',
  dayStartHint: 'If your family starts earlier or later, you can adjust it.',
  startNewJournal: 'Start a new diary',
  startNewJournalHint: 'Closes this 14-day period and starts from day 1. The current diary is kept.',
  signOut: 'Sign out',
  language: 'Language',

  // ── Help modal ─────────────────────────────────────────────
  helpSub: 'A few rules. Nothing more.',
  helpSleepEnd: { b: 'Awake.', rest: ' When the baby is definitely awake — not for night wakings (those are notes, optional).' },
  helpFeed: { b: 'Feed.', rest: ' Every time you feed, including during the bedtime routine.' },
  helpCosleep: { b: 'Co-sleep.', rest: ' If you share a bed at any point.' },
  helpFoot: (from: string) => ({ pre: 'The ', em: 'day', mid: ' currently starts at ', a: from, post: '. If your family goes to bed earlier, change it in Settings.' }),
  gotIt: 'Got it',

  // ── Auth screen ────────────────────────────────────────────
  authLogin: 'Sign in',
  authRegister: 'Create account',
  authLoginSub: 'You can both use the same email and password.',
  authRegisterSub: 'One account per family. You both sign in with the same credentials.',
  email: 'Email',
  password: 'Password',
  authSubmitLogin: 'Sign in',
  authSubmitRegister: 'Create account',
  authToggleToRegister: 'First time? Create an account',
  authToggleToLogin: 'Already have an account? Sign in',
  errWrongCredentials: 'Wrong email or password',
  errEmailInUse: 'An account with that email already exists',
  errWeakPassword: 'Password must be at least 6 characters',
  errInvalidEmail: 'Invalid email',
  errGeneric: 'Something went wrong. Please try again.',

  // ── Onboarding ─────────────────────────────────────────────
  onboardingTitle1: 'The simplest',
  onboardingTitle2: 'sleep diary.',
  onboardingSub: 'Tap when sleep begins, tap when they wake up. In 14 days you have a diary ready for your pediatrician.',
  onboardingNameLabel: 'What’s their name?',
  onboardingAgeLabel: 'How many months old?',
  optional: 'optional',
  onboardingCta: 'Get started',

  // ── Landing page ───────────────────────────────────────────
  openApp: 'Open app →',
  lpEyebrow: 'sleep diary',
  lpHeroTitle1: 'The sleep diary',
  lpHeroTitle2: 'for 3 in the morning.',
  lpHeroSub: 'One tap when sleep begins. One tap when they wake up. In 14 days you have a diary ready for your pediatrician.',
  lpHeroCta: 'Start free',
  lpResultLabel: 'the result',
  lpResultTitle: '14 nights, one ready diary.',
  lpResultBody: 'The format your pediatrician recognizes at a glance. Show it at the appointment and move on.',
  lpResultCaption: '14 sample days · starts at 7 PM',
  lpManifestoTitle1: 'This is a diary.',
  lpManifestoTitle2: 'Nothing more.',
  lpManifesto1: 'It doesn’t predict or analyze your child’s sleep.',
  lpManifesto2: 'It doesn’t send you notifications at 3 AM.',
  lpManifesto3: 'No AI telling you what you’re doing wrong.',
  lpManifesto4: 'No ads, no premium tier.',
  lpManifestoCta: 'Try it →',
  lpFooterPro: 'Are you a professional? Talk to us →',
  lpDiaryReady: (n: number) => `${n} days · diary ready`,

  // Demo phone toasts
  dpToastSleep: '↓  Asleep · 8:15 PM',
  dpToastWake: '↑  Awake · 11:42 PM',
  dpSince815: 'since 8:15 PM',

  // ── Professionals page ─────────────────────────────────────
  proLabel: 'for professionals',
  proTitle1: 'Your brand.',
  proTitle2: 'Your tool.',
  proBody: 'Pediatricians, sleep psychologists, certified consultants: if you work with families and sleep tracking is part of your practice, Moonling Owly can take on your logo and colors. Your families install it on their phone without ever knowing Moonling Owly exists.',
  back: '← Back',
  formName: 'Name *',
  formNamePlaceholder: 'Your name',
  formPractice: 'Practice, clinic or office *',
  formPracticePlaceholder: 'E.g. North Pediatrics Clinic',
  formEmail: 'Contact email *',
  formEmailPlaceholder: 'hello@yourpractice.com',
  formHow: 'How do you work with families? (optional)',
  formHowPlaceholder: 'Private practice, clinic, home visits…',
  formMessage: 'Message (optional)',
  formMessagePlaceholder: 'Tell us a little about what you’re looking for…',
  formSending: 'Sending…',
  formSubmit: 'Send',
  formError: 'Something went wrong. Email us at hola@moonlingowly.com',
  formDone: 'Got it. We’ll be in touch soon.',

  // ── Error boundary ─────────────────────────────────────────
  errorTitle: 'Something went wrong.',
  errorBody: 'The app couldn’t load. If reloading doesn’t help, you can start fresh (local data will be erased; if you were signed in, you’ll get it back when you log in again).',
  errorReload: 'Reload',
  errorReset: 'Erase local data and start over',

  // ── Document meta ──────────────────────────────────────────
  docTitle: 'Moonling Owly — Sleep diary for your baby',
  docDescription: 'The simplest sleep diary. One tap when it starts, one tap when it ends. In 14 nights, an actogram ready for your pediatrician.',
}

export const t = lang === 'es' ? es : en
