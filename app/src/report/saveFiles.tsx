// Saving the plan report (journey-spec §24.3): a PDF, else a standalone .html.
import { save } from '../lib/downloads.ts'
import type { ReportData } from './model/reportData.ts'
import { planPdf } from './planPdf.ts'

/** Shows a message under the report bar; `bad` colours it as a problem. */
export type Say = (message: string, bad?: boolean) => void

async function reportHtml(data: ReportData) {
  const [{ renderToStaticMarkup }, { default: ReportDocument }] = await Promise.all([
    import('react-dom/server'),
    import('../components/report/ReportDocument.tsx'),
  ])
  return '<!doctype html>' + renderToStaticMarkup(<ReportDocument data={data} />)
}

/** Save the plan report shown in `dialog`: a PDF, else the report as .html. */
export async function saveReport(data: ReportData, dialog: HTMLElement, say: Say) {
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
