// Report page 11 (as many pages as the years need): every year in numbers, two tables side by side.
import type { ReportData } from '../../report/model/reportData.ts'
import AppendixTable from './AppendixTable.tsx'
import PageFrame, { type PageProps } from './PageFrame.tsx'
import TitleBlock from './TitleBlock.tsx'

const ROWS_PER_TABLE = 27

export interface AppendixPageProps extends PageProps {
  rows: ReportData['appendix']['rows']
  /** this appendix page's index and how many appendix pages there are */
  index: number
  count: number
}

export default function AppendixPage({ rows, index, count, ...frame }: AppendixPageProps) {
  const appendix = frame.data.appendix
  const part = count > 1 ? ` (${index + 1} of ${count})` : ''
  return (
    <PageFrame {...frame} label={`Appendix${part}`}>
      <div className="lmr-body">
        <TitleBlock
          big={appendix.big}
          bigLabel="years in numbers"
          eyebrow="APPENDIX"
          title={`Every year in numbers${part}`}
        />
        <div className="lmr-ap">
          <div>
            <AppendixTable rows={rows.slice(0, ROWS_PER_TABLE)} />
          </div>
          <div>
            {rows.length > ROWS_PER_TABLE ? (
              <AppendixTable rows={rows.slice(ROWS_PER_TABLE)} />
            ) : null}
          </div>
        </div>
        {index === count - 1 ? (
          <div className="lmr-src" style={{ marginTop: 14 }}>
            {appendix.note}
          </div>
        ) : null}
      </div>
    </PageFrame>
  )
}
