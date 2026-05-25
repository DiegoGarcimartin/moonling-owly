import { useEffect, useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { Icon } from './Icon'
import { SheetGrid } from './SheetGrid'
import { Day, fmt12 } from '../data'

interface SharePreviewModalProps {
  days: Day[]
  dayStart: number
  childName: string
  childAge: string
  onUpdate: (patch: { childName?: string; childAge?: string }) => void
  onClose: () => void
}

export function SharePreviewModal({ days, dayStart, childName, childAge, onUpdate, onClose }: SharePreviewModalProps) {
  const scalerRef = useRef<HTMLDivElement>(null)
  const docRef = useRef<HTMLDivElement>(null)
  const [capturing, setCapturing] = useState(false)

  const MESES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  const lastDate = days.length ? new Date(days[days.length - 1].date) : new Date()
  const dateLabel = `${lastDate.getUTCDate()} ${MESES[lastDate.getUTCMonth()]} ${lastDate.getUTCFullYear()}`

  useEffect(() => {
    const update = () => {
      const scaler = scalerRef.current
      const doc = docRef.current
      if (!scaler || !doc) return
      const naturalWidth = 880
      const containerWidth = scaler.clientWidth
      const scale = Math.min(1, containerWidth / naturalWidth)
      doc.style.transform = `scale(${scale})`
      doc.style.transformOrigin = 'top left'
      doc.style.width = naturalWidth + 'px'
      requestAnimationFrame(() => {
        if (scaler && doc) scaler.style.height = (doc.offsetHeight * scale) + 'px'
      })
    }
    update()
    const ro = new ResizeObserver(update)
    if (scalerRef.current) ro.observe(scalerRef.current)
    window.addEventListener('resize', update)
    if (document.fonts?.ready) document.fonts.ready.then(update)
    const t1 = setTimeout(update, 100)
    const t2 = setTimeout(update, 400)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
      clearTimeout(t1); clearTimeout(t2)
    }
  }, [childName, childAge, days, dayStart])

  const captureAndShare = async () => {
    const doc = docRef.current
    if (!doc) return
    setCapturing(true)

    try {
      // Temporarily reset the scale so html2canvas captures full resolution
      const prevTransform = doc.style.transform
      const prevWidth = doc.style.width
      doc.style.transform = 'none'
      doc.style.width = '880px'

      const canvas = await html2canvas(doc, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      })

      doc.style.transform = prevTransform
      doc.style.width = prevWidth

      const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/png'))
      if (!blob) throw new Error('canvas blob failed')

      const file = new File([blob], 'moonling-owly.png', { type: 'image/png' })

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: childName ? `${childName} — diario de sueño` : 'Diario de sueño',
        })
      } else if (navigator.share) {
        await navigator.share({
          title: 'Diario de sueño · Moonling Owly',
          text: childName ? `${childName} — ${days.length} noches registradas` : `${days.length} noches registradas`,
        })
      } else {
        // Desktop: trigger download
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'moonling-owly.png'
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch {
      // Silently ignore user cancellations
    } finally {
      setCapturing(false)
    }
  }

  const handlePrint = () => window.print()

  return (
    <div className="modal-back share-preview-back" onClick={(e) => { if ((e.target as HTMLElement).classList.contains('share-preview-back')) onClose() }}>
      <div className="share-preview-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="share-preview-head">
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 className="modal-title">Compartir diario</h2>
            <p className="modal-sub">Toca un campo para rellenarlo antes de compartir.</p>
          </div>
          <button className="iconbtn" onClick={onClose} aria-label="Cerrar" style={{ flexShrink: 0 }}>
            <Icon name="close" size={16}/>
          </button>
        </div>

        <div className="doc-scaler" ref={scalerRef}>
          <div className="doc" id="printable-doc" ref={docRef}>
            <div className="doc-poster-bg" />
            <div className="doc-head">
              <div className="doc-brand">
                <div className="doc-brand-name">Moonling <em>Owly</em></div>
                <div className="doc-brand-sub mono">diario de sueño · {days.length} {days.length === 1 ? 'noche' : 'noches'}</div>
              </div>
              <div className="doc-meta">
                <div className="doc-meta-row">
                  <span>Nombre</span>
                  <input className="doc-fillin" type="text" value={childName} onChange={(e) => onUpdate({ childName: e.target.value })} placeholder="Toca para rellenar" aria-label="Nombre del bebé" />
                </div>
                <div className="doc-meta-row">
                  <span>Edad</span>
                  <input className="doc-fillin short" type="text" value={childAge} onChange={(e) => onUpdate({ childAge: e.target.value })} placeholder="ej. 11 m" aria-label="Edad del bebé" />
                </div>
                <div className="doc-meta-row"><span>Fecha</span><b>{dateLabel}</b></div>
                <div className="doc-meta-row"><span>Inicio noche</span><b className="mono">{fmt12(dayStart, 0)}</b></div>
              </div>
            </div>
            <div className="doc-grid">
              <SheetGrid days={days} dayStart={dayStart} print={true} />
            </div>
            <div className="doc-legend">
              <span className="doc-legend-item"><span className="doc-legend-glyph"><span style={{fontSize: 13, lineHeight: '1'}}>↓</span></span>inicio sueño</span>
              <span className="doc-legend-item"><span className="doc-legend-glyph"><span style={{fontSize: 13, lineHeight: '1'}}>↑</span></span>despertar</span>
              <span className="doc-legend-item"><span className="doc-legend-glyph asleep"></span>dormido</span>
              <span className="doc-legend-item"><span className="doc-legend-glyph feed"><Icon name="feed" size={10} stroke={2.4}/></span>toma</span>
              <span className="doc-legend-item"><span className="doc-legend-glyph co"><Icon name="cosleep" size={10} stroke={2.4}/></span>colecho</span>
              <span className="doc-legend-item"><span className="doc-legend-glyph note"><Icon name="note" size={10} stroke={2.4}/></span>nota</span>
            </div>
            <div className="doc-footer">
              <span>moonling owly</span>
              <span>página 1 / 1</span>
            </div>
          </div>
        </div>

        <div className="share-preview-actions">
          <button className="share-preview-btn primary" onClick={captureAndShare} disabled={capturing}>
            <Icon name="share" size={16}/><span>{capturing ? 'Generando…' : 'Compartir imagen'}</span>
          </button>
          <button className="share-preview-btn" onClick={handlePrint}>
            <span style={{ fontSize: 16, lineHeight: '1' }}>⎙</span><span>Guardar PDF</span>
          </button>
        </div>
      </div>
    </div>
  )
}
