// The plan report over the app (#report): a bar to download or close, then the A4 pages to scroll.
import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Content, Root } from '@radix-ui/react-dialog'
import { useDialogFocus } from '../hooks/useDialogFocus.ts'
import { closeReport } from '../shell/router.ts'
import { toast } from '../state/shell.ts'
import { useStore } from '../state/store.ts'
import { localToday } from '../lib/today.ts'
import { reportData } from './model/reportData.ts'
import { reportPages } from '../components/report/reportPages.tsx'
import css from '../components/report/report.css?raw'
import { saveReport } from './saveFiles.tsx'
import { PAGE_WIDTH } from './planPdf.ts'

const downloadButton = (dialog: HTMLElement) =>
  dialog.querySelector<HTMLElement>('[data-r="print"]')

/** Pages shrink to the dialog's width (never below 30%). */
function useFitScale() {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  useLayoutEffect(() => {
    const fit = () => {
      const width = ref.current?.clientWidth ?? PAGE_WIDTH
      setScale(Math.min(1, Math.max(0.3, (width - 24) / PAGE_WIDTH)))
    }
    fit()
    addEventListener('resize', fit)
    return () => removeEventListener('resize', fit)
  }, [])
  return { ref, scale }
}

export default function ReportDialog() {
  const plan = useStore((state) => state.plan)
  const data = useMemo(() => reportData(plan, localToday()), [plan])
  const [message, setMessage] = useState<{ text: string; bad?: boolean } | null>(null)
  const [saving, setSaving] = useState(false)
  const focus = useDialogFocus(downloadButton)
  const { ref, scale } = useFitScale()
  // saving re-renders the bar; the pages only change with the plan
  const pages = useMemo(() => (data.ready === false ? null : reportPages(data)), [data])
  if (data.ready === false || !pages) return null

  const download = async () => {
    setSaving(true)
    await saveReport(data, ref.current!, (text, bad) => {
      setMessage({ text, bad })
      toast(text)
    })
    setSaving(false)
  }

  // Radix keeps Tab inside, closes on Escape and hides the app from assistive tech.
  return (
    <Root open onOpenChange={closeReport}>
      <Content asChild {...focus}>
        <div
          ref={ref}
          id="report"
          className="on"
          // Radix adds role=dialog but not aria-modal, and points labelledby/describedby at a
          // Title/Description this dialog does not have; undefined drops them for the aria-label
          aria-modal="true"
          aria-label="Your LifeMap plan report"
          aria-labelledby={undefined}
          aria-describedby={undefined}
          style={{ '--lmr-s': scale.toFixed(4) } as CSSProperties}
        >
          <style>{css}</style>
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
            aria-label={`Your plan report, ${pages.length} pages. Scroll to read.`}
          >
            {pages.map((page) => (
              <div key={page.key} className="lmr-slot">
                {page}
              </div>
            ))}
          </div>
        </div>
      </Content>
    </Root>
  )
}
