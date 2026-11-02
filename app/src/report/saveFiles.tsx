// Saving the plan report (journey-spec §24.3). Inside a shared Claude page, printing and downloads
// are blocked, so the plan goes through its "downloads" capability: a PDF, else a standalone .html.
// Anywhere else the plan is printed (Save as PDF).
import { downloads, save } from '../lib/downloads.ts'
import type { ReportData } from './model/reportData.ts'
import { planPdf } from './planPdf.ts'

/** Shows a message under the report bar; `bad` colours it as a problem. */
export type Say = (message: string, bad?: boolean) => void

// A sandboxed viewer can ignore print() without an error; beforeprint tells us a print window opened.
function printReport(say: Say) {
  say('Opening the print window. Choose "Save as PDF" as the printer.')
  let opened = false
  const markOpened = () => (opened = true)
  addEventListener('beforeprint', markOpened)
  try {
    window.print()
  } catch {
    removeEventListener('beforeprint', markOpened)
    say('Printing is blocked here. Open this page in your browser to save the PDF.', true)
    return
  }
  setTimeout(() => {
    removeEventListener('beforeprint', markOpened)
    if (!opened)
      say(
        'Nothing opened. Printing looks blocked here. Open this page in your browser to save the PDF.',
        true,
      )
  }, 500)
}

async function reportHtml(data: ReportData) {
  const [{ renderToStaticMarkup }, { default: ReportDocument }] = await Promise.all([
    import('react-dom/server'),
    import('../components/report/ReportDocument.tsx'),
  ])
  return '<!doctype html>' + renderToStaticMarkup(<ReportDocument data={data} />)
}

/** Save the plan report shown in `dialog`: a PDF, else the report as .html, else the print window. */
export async function saveReport(data: ReportData, dialog: HTMLElement, say: Say) {
  if (!(await downloads())) return printReport(say)
  say('Preparing your PDF…')
  try {
    const pdf = await planPdf([...dialog.querySelectorAll<HTMLElement>('.lmr-pg')])
    if (!(await save('LifeMap-plan.pdf', pdf.blob))) throw new Error('not saved')
    say(`Saved LifeMap-plan.pdf (${pdf.pages} page${pdf.pages === 1 ? '' : 's'}).`)
  } catch {
    const html = await reportHtml(data)
    const saved = await save('LifeMap-plan.html', new Blob([html], { type: 'text/html' }))
    say(
      saved
        ? "We couldn't make the PDF here, so we saved your plan as LifeMap-plan.html. Open it and choose Print to get a PDF."
        : "We couldn't save your plan here. Please try again, or open this page in your browser.",
      !saved,
    )
  }
}
