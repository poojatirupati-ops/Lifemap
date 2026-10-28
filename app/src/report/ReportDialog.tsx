// The plan report over the app (#report): a bar to download or close, then the A4 pages to scroll.
import { useEffect, useState } from 'react'
import { toast } from '../state/shell.ts'
import { closeReport } from '../hooks/useGlobalKeys.ts'
import type { BuiltReport } from './openReport.tsx'
import { saveReport } from './saveFiles.ts'
import { fitReport } from './fitReport.ts'

export default function ReportDialog({ report }: { report: BuiltReport }) {
  const [message, setMessage] = useState<{ text: string; bad?: boolean } | null>(null)
  const [saving, setSaving] = useState(false)
  useEffect(() => {
    addEventListener('resize', fitReport)
    return () => removeEventListener('resize', fitReport)
  }, [])

  const download = async () => {
    if (saving) return
    setSaving(true)
    await saveReport(report, (text, bad) => {
      setMessage({ text, bad })
      toast(text)
    })
    setSaving(false)
  }

  return (
    <>
      <div className="rep-bar">
        <b>Your plan</b>
        <button
          data-r="print"
          style={{ background: 'var(--sun)', color: 'var(--ink)' }}
          disabled={saving}
          onClick={download}
        >
          ⬇ Download my plan
        </button>
        <span
          id="rep-msg"
          role="status"
          aria-live="polite"
          style={{
            fontSize: 13,
            fontWeight: 700,
            flex: '1 1 220px',
            color: message ? (message.bad ? '#FFD2CF' : '#C9F2DD') : undefined,
          }}
        >
          {message?.text}
        </span>
        <button
          data-r="close"
          style={{ background: '#fff', color: 'var(--ink)' }}
          onClick={closeReport}
        >
          Close
        </button>
      </div>
      <div
        className="lmr-wrap"
        tabIndex={0}
        role="region"
        aria-label={`Your plan report, ${report.pages.length} pages. Scroll to read.`}
      >
        {report.pages.map((page, index) => (
          <div key={index} className="lmr-slot" dangerouslySetInnerHTML={{ __html: page }} />
        ))}
      </div>
    </>
  )
}
