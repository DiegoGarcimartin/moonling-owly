import { useState } from 'react'
import { Icon } from './Icon'
import { fmt12 } from '../data'

interface EntryModalProps {
  onClose: () => void
  onSave: (entry: { type: string; hour: number; minute: number; dayOffset: number }) => void
}

export function EntryModal({ onClose, onSave }: EntryModalProps) {
  const [type, setType] = useState('sleep_start')
  const [hour, setHour] = useState(22)
  const [minute, setMinute] = useState(0)
  const [dayOffset, setDayOffset] = useState(0)

  const types = [
    { id: 'sleep_start', label: 'Sleep start', icon: 'sleep-start', cls: 'sleep-start' },
    { id: 'sleep_end',   label: 'Wakeup',      icon: 'sleep-end',   cls: 'sleep-end' },
    { id: 'A',           label: 'Feed',        icon: 'feed',        cls: 'feeding' },
    { id: 'C',           label: 'Co-sleep',    icon: 'cosleep',     cls: 'cosleep' },
    { id: 'X',           label: 'Note',        icon: 'note',        cls: 'incident' },
  ]

  const step = (deltaMin: number) => {
    let total = hour * 60 + minute + deltaMin
    total = ((total % 1440) + 1440) % 1440
    setHour(Math.floor(total / 60))
    setMinute(total % 60)
  }

  const setNow = () => {
    const d = new Date()
    setHour(d.getHours())
    setMinute(Math.floor(d.getMinutes() / 5) * 5)
  }

  const now = new Date()
  const dayLabels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() + (i - 6))
    const dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]
    return i === 6 ? `Today ${d.getDate()}` : `${dow} ${d.getDate()}`
  })

  return (
    <div className="modal-back" onClick={(e) => { if ((e.target as HTMLElement).classList.contains('modal-back')) onClose() }}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <h2 className="modal-title">Add an entry</h2>
        <p className="modal-sub">Log what you remember. No stress.</p>

        <div className="modal-section-label">What happened</div>
        <div className="type-grid">
          {types.map(t => (
            <button key={t.id} className={`type-btn${type === t.id ? ' selected' : ''}`} onClick={() => setType(t.id)}>
              <span className={`event-glyph-sm ${t.cls}`}><Icon name={t.icon} size={12} stroke={2.2}/></span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        <div className="modal-section-label">When</div>
        <div className="day-row">
          {dayLabels.map((lbl, i) => {
            const parts = lbl.split(' ')
            const dow = parts.length > 1 ? parts[0] : ''
            const day = parts.length > 1 ? parts[1] : parts[0]
            return (
              <button key={i} className={`day-pill${i === 6 + dayOffset ? ' selected' : ''}`} onClick={() => setDayOffset(i - 6)}>
                <span>{dow || '·'}</span>
                <b>{day}</b>
              </button>
            )
          })}
        </div>

        <div className="time-row">
          <div className="time-display">{fmt12(hour, minute)}</div>
          <div className="time-pad">
            <button className="now-pill" onClick={setNow}>now</button>
          </div>
        </div>

        <div className="time-pad" style={{ justifyContent: 'space-between', marginBottom: 18 }}>
          <div className="time-pad" style={{ gap: 4 }}>
            <span className="mono" style={{ fontSize: 10, color: 'var(--text-mute)', marginRight: 6 }}>hour</span>
            <button className="time-step" onClick={() => step(-60)}>−</button>
            <button className="time-step" onClick={() => step(60)}>+</button>
          </div>
          <div className="time-pad" style={{ gap: 4 }}>
            <span className="mono" style={{ fontSize: 10, color: 'var(--text-mute)', marginRight: 6 }}>5 min</span>
            <button className="time-step" onClick={() => step(-5)}>−</button>
            <button className="time-step" onClick={() => step(5)}>+</button>
          </div>
        </div>

        <button className="modal-confirm" onClick={() => onSave({ type, hour, minute, dayOffset })}>Save</button>
        <button className="modal-cancel" onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}
