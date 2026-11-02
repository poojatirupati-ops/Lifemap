// Up to 27 years of the appendix: income, needs, shortfall and savings left, in future euros.
import type { ReportData } from '../../report/model/reportData.ts'

type YearRow = ReportData['appendix']['rows'][number]

const COLUMNS = ['Age (year)', 'Income', 'Needs', 'Shortfall', 'Savings left']

/** 12,345, or a dash for nothing */
const figure = (amount: number) =>
  Math.round(amount) === 0 ? '—' : Math.round(Math.abs(amount)).toLocaleString('en-US')

export default function AppendixTable({ rows }: { rows: YearRow[] }) {
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
