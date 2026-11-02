// The report as a standalone page to save: every A4 page, with its CSS, and no web fonts (GDPR G-17).
import type { ReportData } from '../../report/model/reportData.ts'
import documentCss from './report-doc.css?raw'
import css from './report.css?raw'
import { reportPages } from './reportPages.tsx'

export default function ReportDocument({ data }: { data: ReportData }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>{data.meta.headerRight}</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <style>{documentCss + css}</style>
      </head>
      <body>
        <main className="lmr-doc">{reportPages(data)}</main>
      </body>
    </html>
  )
}
