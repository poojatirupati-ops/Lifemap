// Report page 11 (as many pages as the years need): every year in numbers, two tables side by side.
import type { ReportData } from '../../report/model/reportData.ts'
import { PageFrame, TitleBlock, type PageProps } from './PageFrame.tsx'

const ROWS_PER_TABLE = 27

export interface AppendixPageProps extends PageProps {
  rows: ReportData['appendix']['rows']
  /** this appendix page's index and how many appendix pages there are */
  index: number
  count: number
}

// Up to 27 years of the appendix: income, needs, shortfall and savings left, in future euros.

type YearRow = ReportData['appendix']['rows'][number]

const COLUMNS = ['Age (year)', 'Income', 'Needs', 'Shortfall', 'Savings left']

/** 12,345, or a dash for nothing */
const figure = (amount: number) =>
  Math.round(amount) === 0 ? '—' : Math.round(Math.abs(amount)).toLocaleString('en-US')

function AppendixTable({ rows }: { rows: YearRow[] }) {
  return (
    <table>
      <thead>
        <tr>
          {COLUMNS.map((column) => (
            <th scope="col" key={column}>
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.age}>
            <td>
              {row.age} ({row.year})
            </td>
            <td className={row.income ? '' : 'na'}>{figure(row.income)}</td>
            <td className={row.needs ? '' : 'na'}>{figure(row.needs)}</td>
            <td className={row.shortfall > 0 ? 'sf' : 'na'}>{figure(row.shortfall)}</td>
            <td className={row.savingsLeft ? '' : 'na'}>{figure(row.savingsLeft)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
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
