// Report page 3: your money today. Where the month goes, what you own and owe, what to add next.
import type { ReportData } from '../../report/model/reportData.ts'
import { PageFrame, Photo, TitleBlock, type PageProps } from './PageFrame.tsx'
import { textOf, tintOf } from './tones.ts'

const PRIORITY_TONE: Record<string, string> = { High: 'coral', Medium: 'gold' }

/** Each tile's share of the row: at least 19%, the biggest takes what is left. */
function tileShares(amounts: number[]) {
  const total = amounts.reduce((sum, amount) => sum + Math.max(0, amount), 0) || 1
  const shares = amounts.map((amount) => Math.max(0.19, Math.max(0, amount) / total))
  const biggest = shares.indexOf(Math.max(...shares))
  const others = shares.reduce((sum, share, index) => (index === biggest ? sum : sum + share), 0)
  shares[biggest] = 1 - others
  return shares
}

type LedgerRow = ReportData['money']['own']['rows'][number]

/** "YOU OWN" or "YOU OWE": a figure per row, or Missing. */
function Ledger({ title, rows }: { title: string; rows: LedgerRow[] }) {
  return (
    <>
      <div className="lmr-led-t">{title}</div>
      {rows.map((row) => (
        <div className="lmr-row" key={row.label}>
          <span>{row.label}</span>
          {row.status === 'missing' ? (
            <span className="lmr-miss">Missing</span>
          ) : (
            <b>{row.value}</b>
          )}
        </div>
      ))}
    </>
  )
}

export default function MoneyPage(props: PageProps) {
  const money = props.data.money
  const { complete } = money
  const shares = tileShares(money.tiles.map((tile) => tile.amount))
  const filled = Math.max(0, Math.min(100, (complete.have / Math.max(1, complete.total)) * 100))
  return (
    <PageFrame {...props} label="Your money today">
      <div className="lmr-body">
        <TitleBlock {...money} eyebrow="YOUR MONEY TODAY" />
        <div className="lmr-tiles">
          {money.tiles.map((tile, index) => (
            <div
              className={`lmr-tile ${tile.tone}`}
              style={{ flex: `0 0 calc(${(shares[index] * 100).toFixed(2)}% - 3px)` }}
              key={tile.label}
            >
              <div className="lmx-l">{tile.label}</div>
              <div className="lmx-v">{tile.value}</div>
            </div>
          ))}
        </div>
        <p className="lmr-sent">
          {money.sentence} {money.takeHome}
        </p>
        <div className="lmr-two">
          <div className="lmx-l">
            <Ledger title="YOU OWN" rows={money.own.rows} />
            <Ledger title="YOU OWE" rows={money.owe.rows} />
            <div className="lmr-nw">
              <span>Net worth</span>
              {'value' in money.netWorth ? (
                <b>{money.netWorth.value}</b>
              ) : (
                <span className="lmr-miss">not yet known</span>
              )}
            </div>
          </div>
          <div className="lmx-r">
            <div className="lmr-plant">
              <Photo name="money-plant" />
              <div className="lmx-in">
                <div className="lmx-e">HOW COMPLETE IS YOUR PICTURE?</div>
                <div className="lmx-n">
                  {complete.have}
                  <small>of {complete.total}</small>
                </div>
                <div className="lmr-prog">
                  <i style={{ width: `${filled.toFixed(1)}%` }}></i>
                </div>
                <div className="lmx-sb">
                  {complete.items.length
                    ? 'Add these next to sharpen your plan.'
                    : 'Your picture is complete. Thank you.'}
                </div>
              </div>
            </div>
            {complete.items.map((item) => {
              const tone = PRIORITY_TONE[item.priority] ?? 'good'
              return (
                <div className="lmr-it" key={item.title}>
                  <div>
                    <div className="lmx-t">{item.title}</div>
                    <div className="lmx-s">{item.sub}</div>
                  </div>
                  <span
                    className="lmr-chip"
                    style={{ background: tintOf(tone), color: textOf(tone) }}
                  >
                    {item.priority}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </PageFrame>
  )
}
