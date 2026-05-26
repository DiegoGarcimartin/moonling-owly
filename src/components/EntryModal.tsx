import { useState } from 'react'
import { Icon } from './Icon'
import { fmt12 } from '../data'

interface EntryModalProps {
  onClose: () => void
  onSave: (entry: { type: string; hour: number; minute: number; dayOffset: number; note?: string }) => void
}

export function EntryModal({ onClose, onSave }: EntryModalProps) {
  const [type, setType] = useState('sleep_start')
  const [hour, setHour] = useState(22)
  const [minute, setMinute] = useState(0)
  const [dayOffset, setDayOffset] = useState(0)
  const [note, setNote] = useState('')

  const types = [
    { id: 'sleep_start', label: 'Inicio sueño', icon: 'sleep-start', cls: 'sleep-start' },
    { id: 'sleep_end',   label: 'Despertar',    icon: 'sleep-end',   cls: 'sleep-end' },
    { id: 'A',           label: 'Toma',         icon: 'feed',        cls: 'feeding' },
    { id: 'C',           label: 'Colecho',      icon: 'cosleep',     cls: 'cosleep' },
    { id: 'X',           label: 'Nota',         icon: 'note',        cls: 'incident' },
  ]

  const isEvent = ['A', 'C', 'X'].includes(type)

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

  const DIAS = ['dom','lun','mar','mié','jue','vie','sáb']
  const now = new Date()
  const dayLabels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() + (i - 6))
    const dow = DIAS[d.getDay()]
    return i === 6 ? `hoy ${d.getDate()}` : `${dow} ${d.getDate()}`
  })

  // The day picker only offers past + today, but the time stepper is
  // unbounded — easy to land in the future and silently log a sleep
  // that hasn't happened yet.
  const nowMins = now.getHours() * 60 + now.getMinutes()
  const pickedMins = hour * 60 + minute
  const isFuture = dayOffset > 0 || (dayOffset === 0 && pickedMins > nowMins)

  return (
    <div className="modal-back" onClick={(e) => { if ((e.target as HTMLElement).classList.contains('modal-back')) onClose() }}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <h2 className="modal-title">Añadir entrada</h2>
        <p className="modal-sub">Registra lo que recuerdes. Sin estrés.</p>

        <div className="modal-section-label">Qué pasó</div>
        <div className="type-grid">
          {types.map(t => (
            <button key={t.id} className={`type-btn${type === t.id ? ' selected' : ''}`} onClick={() => setType(t.id)}>
              <span className={`event-glyph-sm ${t.cls}`}><Icon name={t.icon} size={12} stroke={2.2}/></span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        <div className="modal-section-label">Cuándo</div>
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
            <button className="now-pill" onClick={setNow}>ahora</button>
          </div>
        </div>

        <div className="time-pad" style={{ justifyContent: 'space-between', marginBottom: 18 }}>
          <div className="time-pad" style={{ gap: 4 }}>
            <span className="mono" style={{ fontSize: 10, color: 'var(--text-mute)', marginRight: 6 }}>hora</span>
            <button className="time-step" onClick={() => step(-60)}>−</button>
            <button className="time-step" onClick={() => step(60)}>+</button>
          </div>
          <div className="time-pad" style={{ gap: 4 }}>
            <span className="mono" style={{ fontSize: 10, color: 'var(--text-mute)', marginRight: 6 }}>5 min</span>
            <button className="time-step" onClick={() => step(-5)}>−</button>
            <button className="time-step" onClick={() => step(5)}>+</button>
          </div>
        </div>

        {isEvent && (
          <div className="entry-note-wrap">
            <textarea
              className="entry-note"
              placeholder={type === 'X' ? 'Qué pasó…' : 'Nota opcional…'}
              value={note}
              onChange={e => setNote(e.target.value.slice(0, 140))}
              rows={2}
            />
            {note.length > 80 && (
              <span className="entry-note-count mono">{note.length}/140</span>
            )}
          </div>
        )}

        {isFuture && (
          <div
            className="mono"
            style={{
              fontSize: 11,
              color: 'var(--accent)',
              textAlign: 'center',
              opacity: 0.85,
              marginBottom: 10,
              letterSpacing: '0.04em',
            }}
          >
            Esa hora aún no ha pasado.
          </div>
        )}
        <button
          className="modal-confirm"
          disabled={isFuture}
          style={isFuture ? { opacity: 0.45, cursor: 'not-allowed' } : undefined}
          onClick={() => {
            if (isFuture) return
            onSave({ type, hour, minute, dayOffset, note: note.trim() || undefined })
          }}
        >Guardar</button>
        <button className="modal-cancel" onClick={onClose}>Cancelar</button>
      </div>
    </div>
  )
}
