// Saving files (journey-spec §24.3). Inside a shared Claude page, printing and downloads are blocked, so
// files go through its "downloads" capability: the plan as a PDF, else as a standalone .html.
// Anywhere else the plan is printed (Save as PDF) and the meeting is a normal .ics download.
import { toast } from '../state/shell.ts'
import { LifeMapReport } from './lifeMapReport.js'
import type { BuiltReport } from './openReport.tsx'
import { planPdf } from './planPdf.ts'

type Downloads = {
  save: (file: { filename: string; data: Blob | ArrayBuffer }) => Promise<unknown>
}
type ClaudeWindow = { claude?: { use?: (name: string) => Promise<Downloads> } }

/** Shows a message under the report bar; `bad` colours it as a problem. */
export type Say = (message: string, bad?: boolean) => void

async function downloads() {
  try {
    const found = await (window as ClaudeWindow).claude?.use?.('downloads')
    return typeof found?.save === 'function' ? found : null
  } catch {
    return null
  }
}

async function save(filename: string, blob: Blob) {
  const target = await downloads()
  if (!target) return false
  try {
    await target.save({ filename, data: blob })
    return true
  } catch {
    try {
      await target.save({ filename, data: await blob.arrayBuffer() })
      return true
    } catch {
      return false
    }
  }
}

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

/** Save the plan report: a PDF, else the report as .html, else the print window. */
export async function saveReport(report: BuiltReport, say: Say) {
  if (!(await downloads())) return printReport(say)
  say('Preparing your PDF…')
  try {
    const pdf = await planPdf(report)
    if (!(await save('LifeMap-plan.pdf', pdf.blob))) throw new Error('not saved')
    say(`Saved LifeMap-plan.pdf (${pdf.pages}${pdf.pages === 1 ? ' page' : ' pages'}).`)
  } catch {
    const html = LifeMapReport.reportDocument(report.data, { photoSrc: report.photoSrc })
    const saved = await save('LifeMap-plan.html', new Blob([html], { type: 'text/html' }))
    say(
      saved
        ? "We couldn't make the PDF here, so we saved your plan as LifeMap-plan.html. Open it and choose Print to get a PDF."
        : "We couldn't save your plan here. Please try again, or open this page in your browser.",
      !saved,
    )
  }
}

export interface Meeting {
  adviser: string
  mode: string
  slot: string | null
}

/** The adviser meeting: a calendar file, or its details as text where only text can be saved. */
export async function saveMeeting({ adviser, mode, slot }: Meeting) {
  if (await downloads()) {
    const text = `Your LifeMap adviser meeting\r\n\r\nWith: ${adviser}\r\nWhen: ${slot}\r\nHow: ${mode}\r\nLength: 45 minutes\r\n\r\nAdd it to your calendar by hand. Confirmation was sent by email and SMS.\r\nGuidance, not advice.\r\n`
    const saved = await save('LifeMap-meeting.txt', new Blob([text], { type: 'text/plain' }))
    toast(
      saved
        ? 'Meeting details saved as LifeMap-meeting.txt'
        : "We couldn't save the file. Your meeting details are on this screen.",
    )
    return
  }
  const calendar = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//LifeMap//Prototype//EN',
    'BEGIN:VEVENT',
    `UID:lg-${Date.now()}`,
    'DTSTAMP:20260929T090000Z',
    'DTSTART:20261001T090000Z',
    'DURATION:PT45M',
    `SUMMARY:LifeMap meeting with ${adviser}`,
    `DESCRIPTION:${mode} · ${slot}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  const link = document.createElement('a')
  link.href = URL.createObjectURL(new Blob([calendar], { type: 'text/calendar' }))
  link.download = 'lifemap-meeting.ics'
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(link.href), 20000)
  toast('Calendar file prepared. Check your downloads.')
}
