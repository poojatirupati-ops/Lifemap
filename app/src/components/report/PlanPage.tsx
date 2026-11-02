// Report page 2: your plan on a page. The goals, when savings run out, and what could close the gap.
import PageFrame, { type PageProps } from './PageFrame.tsx'
import PlanGoalRow from './PlanGoalRow.tsx'
import TitleBlock from './TitleBlock.tsx'
import { fillOf } from './tones.ts'

const ROWS_SHOWN = 4

export default function PlanPage(props: PageProps) {
  const plan = props.data.plan
  const { goals, band, close } = plan
  return (
    <PageFrame {...props} label="Your plan on a page">
      <div className="lmr-body">
        <TitleBlock {...plan} bigLabel="goals on track" eyebrow="YOUR PLAN ON A PAGE" />
        <div className="lmr-goals">
          {goals.slice(0, ROWS_SHOWN).map((goal) => (
            <PlanGoalRow key={goal.name} goal={goal} compact={goals.length > 3} />
          ))}
          {goals.length > ROWS_SHOWN ? (
            <div className="lmr-more">
              and {goals.length - ROWS_SHOWN} more goals. See the goal pages.
            </div>
          ) : null}
        </div>
        <div className={band.kind === 'none' ? 'lmr-gap pos' : 'lmr-gap'}>
          {band.cells.map((cell) => (
            <div className="lmx-c" key={cell.small}>
              <div className="lmx-b">{cell.big}</div>
              <div className="lmx-s">{cell.small}</div>
            </div>
          ))}
        </div>
        {close.items.length ? (
          <div className="lmr-close">
            <div className="lmr-h3">What could close the gap</div>
            <div className="lmr-cols3">
              {close.items.map((item) => (
                <div style={{ borderColor: fillOf(item.tone) }} key={item.title}>
                  <div className="lmx-p">{item.points}</div>
                  <div className="lmx-t">{item.title}</div>
                  <div className="lmx-x">{item.text}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        <div className="lmr-banner">
          <div>
            <div className="lmx-t">Next: share this plan with an expert</div>
            <div className="lmx-x">They check the numbers and choose the best way forward.</div>
          </div>
          <span className="lmr-btn">Meet an expert</span>
        </div>
      </div>
    </PageFrame>
  )
}
