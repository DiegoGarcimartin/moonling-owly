import { useEffect, useRef } from 'react'
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

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Sleep journal · Moonling Owly',
          text: childName ? `${childName} — 14-night sleep self-report` : '14-night sleep self-report',
        })
      } catch { /* ignored */ }
    } else {
      window.print()
    }
  }

  return (
    <div className="modal-back share-preview-back" onClick={(e) => { if ((e.target as HTMLElement).classList.contains('share-preview-back')) onClose() }}>
      <div className="share-preview-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="share-preview-head">
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 className="modal-title">Doctor's view</h2>
            <p className="modal-sub">Tap a blank to fill it in. Same format clinics use.</p>
          </div>
          <button className="iconbtn" onClick={onClose} aria-label="Close" style={{ flexShrink: 0 }}>
            <Icon name="close" size={16}/>
          </button>
        </div>

        <div className="doc-scaler" ref={scalerRef}>
          <div className="doc" id="printable-doc" ref={docRef}>
            <div className="doc-head">
              <div className="doc-brand">
                <div className="doc-brand-name">Moonling Owly</div>
                <div className="doc-brand-sub mono">sleep self-report · 14 nights</div>
              </div>
              <div className="doc-meta">
                <div className="doc-meta-row">
                  <span>Name</span>
                  <input className="doc-fillin" type="text" value={childName} onChange={(e) => onUpdate({ childName: e.target.value })} placeholder="Tap to fill" aria-label="Child name" />
                </div>
                <div className="doc-meta-row">
                  <span>Age</span>
                  <input className="doc-fillin short" type="text" value={childAge} onChange={(e) => onUpdate({ childAge: e.target.value })} placeholder="e.g. 11 m" aria-label="Child age" />
                </div>
                <div className="doc-meta-row"><span>Date</span><b>20 May 2026</b></div>
                <div className="doc-meta-row"><span>Day starts</span><b className="mono">{fmt12(dayStart, 0)}</b></div>
              </div>
            </div>
            <div className="doc-grid">
              <SheetGrid days={days} dayStart={dayStart} print={true} />
            </div>
            <div className="doc-legend">
              <span className="doc-legend-item"><span className="doc-legend-glyph"><span style={{fontSize: 13, lineHeight: '1'}}>↓</span></span>bedtime starts</span>
              <span className="doc-legend-item"><span className="doc-legend-glyph"><span style={{fontSize: 13, lineHeight: '1'}}>↑</span></span>woke up for the day</span>
              <span className="doc-legend-item"><span className="doc-legend-glyph asleep"></span>asleep</span>
              <span className="doc-legend-item"><span className="doc-legend-glyph feed"><Icon name="feed" size={10} stroke={2.4}/></span>feeding</span>
              <span className="doc-legend-item"><span className="doc-legend-glyph co"><Icon name="cosleep" size={10} stroke={2.4}/></span>co-sleeping</span>
              <span className="doc-legend-item"><span className="doc-legend-glyph note"><Icon name="note" size={10} stroke={2.4}/></span>notable event</span>
            </div>
            <div className="doc-footer">
              <span>moonling owly · self-report</span>
              <span>page 1 / 1</span>
            </div>
          </div>
        </div>

        <div className="share-preview-actions">
          <button className="share-preview-btn primary" onClick={handleNativeShare}>
            <Icon name="share" size={16}/><span>Share…</span>
          </button>
          <button className="share-preview-btn" onClick={() => window.print()}>
            <span style={{ fontSize: 16, lineHeight: '1' }}>⎙</span><span>Print / Save PDF</span>
          </button>
        </div>
        <p className="share-preview-foot">
          "Share…" opens the system sheet (WhatsApp, AirDrop, Files…). On desktop, use Print → Save as PDF.
        </p>
      </div>
    </div>
  )
}
