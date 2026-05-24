interface IconProps {
  name: string
  size?: number
  stroke?: number
}

export function Icon({ name, size = 18, stroke = 1.8 }: IconProps) {
  const s = size
  const sw = stroke
  switch (name) {
    case 'feed':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="2.5" width="8" height="2.6" rx="1"/>
          <path d="M8.6 5.1h6.8l-.5 3h-5.8l-.5-3Z"/>
          <rect x="7.5" y="8.1" width="9" height="13.4" rx="3"/>
          <line x1="9.5" y1="13" x2="14.5" y2="13"/>
        </svg>
      )
    case 'cosleep':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="10" r="2.6"/>
          <circle cx="16" cy="10" r="2.6"/>
          <path d="M3 17h18"/>
          <path d="M5 20.5h14"/>
        </svg>
      )
    case 'note':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12h3l2-5 4 10 2-5h7"/>
        </svg>
      )
    case 'sleep-start':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v15"/>
          <path d="M6 12l6 6 6-6"/>
        </svg>
      )
    case 'sleep-end':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 21V6"/>
          <path d="M6 12l6-6 6 6"/>
        </svg>
      )
    case 'plus':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      )
    case 'help':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9"/>
          <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 3.5"/>
          <circle cx="12" cy="17" r="0.7" fill="currentColor"/>
        </svg>
      )
    case 'close':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 6l12 12M18 6L6 18"/>
        </svg>
      )
    case 'share':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
          <polyline points="16 6 12 2 8 6"/>
          <line x1="12" y1="2" x2="12" y2="15"/>
        </svg>
      )
    default:
      return null
  }
}
