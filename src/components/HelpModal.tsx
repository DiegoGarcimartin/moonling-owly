import { Icon } from './Icon'
import { fmt12 } from '../data'

interface HelpModalProps {
  dayStart: number
  onClose: () => void
}

export function HelpModal({ dayStart, onClose }: HelpModalProps) {
  return (
    <div className="modal-back" onClick={(e) => { if ((e.target as HTMLElement).classList.contains('modal-back')) onClose() }}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <h2 className="modal-title">Cómo funciona</h2>
        <p className="modal-sub">Unas pocas reglas. Nada más.</p>
        <ul className="first-guide-list" style={{ marginTop: 8 }}>
          <li><span className="first-guide-icon"><Icon name="sleep-start" size={16}/></span><span><b>Inicio de sueño.</b> Pulsa cuando empieces la rutina de sueño.</span></li>
          <li><span className="first-guide-icon"><Icon name="sleep-end" size={16}/></span><span><b>Despertar.</b> Cuando el bebé esté definitivamente despierto — no para despertares nocturnos (esos son notas, opcionales).</span></li>
          <li><span className="first-guide-icon"><Icon name="feed" size={16}/></span><span><b>Toma.</b> Cada vez que des una toma, incluyendo durante la rutina de sueño.</span></li>
          <li><span className="first-guide-icon"><Icon name="cosleep" size={16}/></span><span><b>Colecho.</b> Si en algún momento compartes la cama.</span></li>
          <li><span className="first-guide-icon"><Icon name="note" size={16}/></span><span><b>Nota.</b> Cualquier cosa inusual: llanto prolongado, movimientos, ronquidos…</span></li>
        </ul>
        <div className="first-guide-foot" style={{ marginTop: 16 }}>
          La <em>noche</em> empieza actualmente a las <b className="mono">{fmt12(dayStart, 0)}</b>.
          Si tu familia se acuesta antes, cámbialo en Ajustes.
        </div>
        <button className="modal-confirm" style={{ marginTop: 20 }} onClick={onClose}>Entendido</button>
      </div>
    </div>
  )
}
