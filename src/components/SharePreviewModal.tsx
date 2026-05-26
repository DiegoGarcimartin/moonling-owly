import { useEffect, useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { Icon } from './Icon'
import { SheetGrid } from './SheetGrid'
import { Day, fmt12 } from '../data'

// A4 landscape at 96dpi
const DOC_W = 1122
const DOC_H = 794

interface SharePreviewModalProps {
  days: Day[]
  dayStart: number
  childName: string
  childAge: string
  onClose: () => void
}

export function SharePreviewModal({ days, dayStart, childName, childAge, onClose }: SharePreviewModalProps) {
  const scalerRef = useRef<HTMLDivElement>(null)
  const docRef = useRef<HTMLDivElement>(null)
  const [capturing, setCapturing] = useState(false)

  const MESES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  const firstDate = days.length ? new Date(days[0].date) : new Date()
  const lastDate = days.length ? new Date(days[days.length - 1].date) : new Date()
  const dateRange = days.length > 1
    ? `${firstDate.getUTCDate()} ${MESES[firstDate.getUTCMonth()]} – ${lastDate.getUTCDate()} ${MESES[lastDate.getUTCMonth()]} ${lastDate.getUTCFullYear()}`
    : `${lastDate.getUTCDate()} ${MESES[lastDate.getUTCMonth()]} ${lastDate.getUTCFullYear()}`

  useEffect(() => {
    const update = () => {
      const scaler = scalerRef.current
      const doc = docRef.current
      if (!scaler || !doc) return
      const naturalWidth = DOC_W
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
      await document.fonts.ready

      const clone = doc.cloneNode(true) as HTMLElement
      clone.style.transform = 'none'
      clone.style.width = `${DOC_W}px`
      clone.style.position = 'fixed'
      clone.style.top = '-9999px'
      clone.style.left = '0'
      document.body.appendChild(clone)

      const bgColor = getComputedStyle(doc).backgroundColor

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        backgroundColor: bgColor,
        logging: false,
        width: DOC_W,
      })

      document.body.removeChild(clone)

      const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/png'))
      if (!blob) throw new Error('canvas blob failed')

      const file = new File([blob], 'moonling-owly.png', { type: 'image/png' })

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: childName ? `${childName} — diario de sueño` : 'Diario de sueño' })
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'moonling-owly.png'
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch {
      // User cancelled or capture failed
    } finally {
      setCapturing(false)
    }
  }

  return (
    <div className="modal-back share-preview-back" onClick={(e) => { if ((e.target as HTMLElement).classList.contains('share-preview-back')) onClose() }}>
      <div className="share-preview-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="share-preview-head">
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 className="modal-title">Compartir diario</h2>
            <p className="modal-sub">Vista previa de la imagen que se compartirá.</p>
          </div>
          <button className="iconbtn" onClick={onClose} aria-label="Cerrar" style={{ flexShrink: 0 }}>
            <Icon name="close" size={16}/>
          </button>
        </div>

        <div className="doc-scaler" ref={scalerRef}>
          <div className="doc doc-landscape" id="printable-doc" ref={docRef} style={{ width: DOC_W, minHeight: DOC_H }}>

            {/* Header — una sola línea compacta */}
            <div className="doc-ls-header">
              <span className="doc-ls-brand">Moonling <em>Owly</em></span>
              {childName && <span className="doc-ls-name">{childName}{childAge ? <span className="doc-ls-age"> · {childAge}</span> : null}</span>}
              <span className="doc-ls-meta mono">{dateRange} · {days.length} {days.length === 1 ? 'noche' : 'noches'}</span>
            </div>

            <div className="doc-rule" />

            {/* Grid — ocupa la mayor parte del espacio */}
            <div className="doc-grid doc-grid-ls">
              <SheetGrid days={days} dayStart={dayStart} print={true} />
            </div>

            <div className="doc-rule" style={{ marginTop: 8 }} />

            {/* Pie: leyenda + crédito */}
            <div className="doc-ls-footer">
              <div className="doc-legend">
                <span className="doc-legend-item"><span className="doc-legend-glyph"><span style={{fontSize: 13, lineHeight: '1'}}>↓</span></span>inicio</span>
                <span className="doc-legend-item"><span className="doc-legend-glyph"><span style={{fontSize: 13, lineHeight: '1'}}>↑</span></span>despertar</span>
                <span className="doc-legend-item"><span className="doc-legend-glyph asleep"></span>dormido</span>
                <span className="doc-legend-item"><span className="doc-legend-glyph feed"><Icon name="feed" size={10} stroke={2.4}/></span>toma</span>
                <span className="doc-legend-item"><span className="doc-legend-glyph co"><Icon name="cosleep" size={10} stroke={2.4}/></span>colecho</span>
                <span className="doc-legend-item"><span className="doc-legend-glyph note"><Icon name="note" size={10} stroke={2.4}/></span>nota</span>
              </div>
              <span className="serif-italic" style={{ fontSize: 11, color: 'var(--doc-text-mute)' }}>moonling owly</span>
            </div>

          </div>
        </div>

        <div className="share-preview-actions">
          <button className="share-preview-btn primary" onClick={captureAndShare} disabled={capturing}>
            <Icon name="share" size={16}/><span>{capturing ? 'Generando…' : 'Compartir imagen'}</span>
          </button>
          <button className="share-preview-btn" onClick={() => window.print()}>
            <span style={{ fontSize: 16, lineHeight: '1' }}>⎙</span><span>Guardar PDF</span>
          </button>
        </div>
      </div>
    </div>
  )
}
