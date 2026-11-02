// Report page 6: cashflow. Savings by age, and how each year is paid.
import PageFrame, { type PageProps } from './PageFrame.tsx'
import PaidChart from './PaidChart.tsx'
import SavingsChart from './SavingsChart.tsx'
import TitleBlock from './TitleBlock.tsx'
import { COLOURS } from './tones.ts'

const LEGEND = [
  { colour: COLOURS.teal, label: 'Paid from income' },
  { colour: COLOURS.gold, label: 'Paid from savings' },
  { colour: COLOURS.coral, label: 'Shortfall, not covered' },
]

export default function CashflowPage(props: PageProps) {
  const cashflow = props.data.cashflow
  const { savingsChart, paidChart } = cashflow
  return (
    <PageFrame {...props} label="Cashflow">
      <div className="lmr-body">
        <TitleBlock {...cashflow} eyebrow="CASHFLOW" />
        <div className="lmr-card">
          <div className="lmx-ct">
            <b>{savingsChart.title}</b>
            <span className="lmr-muted" style={{ fontSize: 12 }}>
              Cash and investments
            </span>
          </div>
          <SavingsChart chart={savingsChart} />
          <div className="lmx-cap">{savingsChart.caption}</div>
        </div>
        <div className="lmr-card">
          <div className="lmx-ct">
            <b>How each year is paid</b>
            <span className="lmr-leg">
              {LEGEND.map((item) => (
                <span key={item.label}>
                  <i style={{ background: item.colour }}></i>
                  {item.label}
                </span>
              ))}
            </span>
          </div>
          <PaidChart chart={paidChart} />
          <div className="lmx-cap">{paidChart.caption}</div>
          <div className="lmx-cap2">Each bar is living costs plus any goal payments.</div>
        </div>
      </div>
    </PageFrame>
  )
}
