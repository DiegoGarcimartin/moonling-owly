import React from 'react'
import { Icon } from './Icon'
import { Day, getHours } from '../data'

interface SheetGridProps {
  days: Day[]
  dayStart?: number
  print?: boolean
  selectedRow?: number
  onRowClick?: (idx: number) => void
}

export function SheetGrid({ days, dayStart = 19, print = false, selectedRow, onRowClick }: SheetGridProps) {
  const HOURS_ARR = getHours(dayStart)
  const cols = HOURS_ARR.length
  const cls = print ? 'sheet-grid print-grid' : 'sheet-grid'

  const clampInterval = ([s, e]: [number, number]): [number, number] => [Math.max(0, s), Math.min(1440, e)]

  return (
    <div className={cls} style={{ '--rows': days.length, '--cols': cols } as React.CSSProperties}>
      <div className="cell-day" style={{ borderTop: 'none', borderLeft: 'none' }}>
        <span style={{ fontSize: 8, opacity: 0.5 }}>h →</span>
      </div>
      {HOURS_ARR.map((h, i) => (
        <div className="cell-h" key={`h-${i}`}>{h}</div>
      ))}
      {days.map((day, rowIdx) => (
        <React.Fragment key={`row-${rowIdx}`}>
          <div
            className={`cell-day${selectedRow === rowIdx ? ' cell-day--selected' : ''}${onRowClick ? ' cell-day--clickable' : ''}`}
            onClick={() => onRowClick?.(rowIdx)}
          >
            <span style={{ fontSize: 7.5, letterSpacing: '0.06em', textTransform: 'uppercase', opacity: 0.55 }}>{day.label}</span>
            <b>{day.d}</b>
          </div>
          {HOURS_ARR.map((_, colIdx) => {
            const cellStart = colIdx * 60
            const cellEnd = cellStart + 60
            const overlaps: { a: number; b: number; isStart: boolean; isEnd: boolean }[] = []
            for (const intv of day.sleeps) {
              const [s, e] = clampInterval(intv)
              const a = Math.max(s, cellStart)
              const b = Math.min(e, cellEnd)
              if (b > a) overlaps.push({ a, b, isStart: s >= cellStart && s < cellEnd, isEnd: e > cellStart && e <= cellEnd })
            }
            const bars = overlaps.map((o, i) => {
              const leftPct = ((o.a - cellStart) / 60) * 100
              const widthPct = ((o.b - o.a) / 60) * 100
              return (
                <div
                  key={i}
                  className={`cell-sleep${o.isStart ? ' start' : ''}${o.isEnd ? ' end' : ''}`}
                  style={{ left: `${leftPct}%`, width: `${widthPct}%`, right: 'auto' }}
                />
              )
            })
            const events = (day.events || []).filter(e => e.t >= cellStart && e.t < cellEnd)
            const eventEls = events.map((e, i) => {
              const offsetPct = ((e.t - cellStart) / 60) * 100
              const iconName = e.type === 'A' ? 'feed' : e.type === 'C' ? 'cosleep' : 'note'
              return (
                <span
                  key={i}
                  className={`cell-glyph ${e.type}`}
                  style={{ left: `${offsetPct}%` }}
                ><Icon name={iconName} size={print ? 10 : 8} stroke={2.4} /></span>
              )
            })
            const arrows: React.ReactNode[] = []
            for (const o of overlaps) {
              if (o.isStart) {
                const off = ((o.a - cellStart) / 60) * 100
                arrows.push(<span key={'d' + arrows.length} className="cell-arrow down" style={{ left: `${off}%` }}>↓</span>)
              }
              if (o.isEnd) {
                const off = ((o.b - cellStart) / 60) * 100
                arrows.push(<span key={'u' + arrows.length} className="cell-arrow up" style={{ left: `${off}%`, right: 'auto', transform: 'translate(-100%, -50%)' }}>↑</span>)
              }
            }
            return (
              <div className="cell" key={`c-${rowIdx}-${colIdx}`}>
                {bars}
                {arrows}
                {eventEls}
              </div>
            )
          })}
        </React.Fragment>
      ))}
    </div>
  )
}
