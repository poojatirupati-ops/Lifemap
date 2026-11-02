// One A4 report page: the running header, the page's content and the footer with its number.
import type { ReactNode } from 'react'
import type { ReportData } from '../../report/model/reportData.ts'
import Logo from './Logo.tsx'

export const FOOTER_LINE =
  'Preliminary guidance, not financial advice. Illustrative, not guaranteed.'

/** What every page component gets: the report's data, its page number and the page count. */
export interface PageProps {
  data: ReportData
  page: number
  total: number
}

interface PageFrameProps extends PageProps {
  label: string
  className?: string
  children: ReactNode
}

export default function PageFrame({
  data,
  page,
  total,
  label,
  className = '',
  children,
}: PageFrameProps) {
  return (
    <section
      className={`lmr-pg ${className}`}
      data-page={page}
      role="group"
      aria-label={`Page ${page} of ${total}: ${label}`}
    >
      <div className="lmr-rh">
        <Logo />
        <span className="lmr-rr">{data.meta.headerRight}</span>
      </div>
      {children}
      <div className="lmr-rf">
        <span>{FOOTER_LINE}</span>
        <span>
          {page} / {total}
        </span>
      </div>
    </section>
  )
}
