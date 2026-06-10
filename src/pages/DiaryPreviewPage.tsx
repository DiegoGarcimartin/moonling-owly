import { useEffect } from 'react'
import { SharePreviewModal } from '../components/SharePreviewModal'
import { nightsToDays } from '../storage'
import type { StoredNight } from '../storage'
import rawNights from '../../data/diary-nights.json'

const DAY_START = 19
const CHILD_NAME = '[nombre]'

const nights = rawNights as StoredNight[]
const DAYS = nightsToDays(nights, DAY_START)

export function DiaryPreviewPage() {
  useEffect(() => {
    document.documentElement.setAttribute('data-mode', 'day')
  }, [])

  return (
    <>
      <style>{`
        /* ── layout ──────────────────────────────────────────────── */
        .share-preview-back    { padding: 0 !important; align-items: flex-start !important; }
        .share-preview-sheet   { max-width: none !important; width: 100vw !important;
                                  border-radius: 0 !important; border: none !important;
                                  max-height: none !important; overflow: visible !important;
                                  animation: none !important; box-shadow: none !important; }
        .doc-scaler            { padding: 0 !important; background: transparent !important;
                                  margin: 0 !important; overflow: visible !important; }
        .share-preview-head    { display: none !important; }
        .share-preview-actions { display: none !important; }
      `}</style>
      <SharePreviewModal
        days={DAYS}
        dayStart={DAY_START}
        childName={CHILD_NAME}
        childAge=""
        onClose={() => {}}
      />
    </>
  )
}
