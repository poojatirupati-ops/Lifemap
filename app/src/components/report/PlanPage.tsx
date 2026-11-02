// Report page 2: your plan on a page. The goals, when savings run out, and what could close the gap.
import { clamp } from '../../lib/clamp.ts'
import { goalIconName } from './Icon.tsx'
import { BandChip, CircleIcon, PageFrame, TitleBlock, type PageProps } from './PageFrame.tsx'
import { COLOURS, fillOf, textOf } from './tones.ts'

const ROWS_SHOWN = 4

export default function PlanPage(props: PageProps) {
  const plan = props.data.plan
  const { goals, band, close } = plan
  return (
    <PageFrame {...props} label="Your plan on a page">
      <div className="lmr-body">
        <TitleBlock {...plan} bigLabel="goals on track" eyebrow="YOUR PLAN ON A PAGE" />
        <div className="lmr-goals">
          {goals.slice(0, ROWS_SHOWN).map((goal) => {
            const percent = clamp(goal.pct, 0, 100)
            return (
              <div className={goals.length > 3 ? 'lmr-goal cp' : 'lmr-goal'} key={goal.name}>
                <CircleIcon name={goalIconName(goal)} tone={goal.band} size={56} iconSize={26} />
                <div className="lmx-gc">
                  <div className="lmx-gn lmr-clamp2">{goal.name}</div>
                  <div className="lmx-gm">{goal.meta}</div>
                  <div className="lmr-track">
                    <div
                      className="lmr-fill"
                      style={{
                        width: `${percent}%`,
                        background: goal.band === 'good' ? COLOURS.teal : fillOf(goal.band),
                      }}
                    ></div>
                  </div>
                  <div className="lmx-gs">{goal.sentence}</div>
                </div>
                <div className="lmx-gp">
                  <div className="lmx-pc" style={{ color: textOf(goal.band) }}>
                    {percent}%
                  </div>
                  <BandChip tone={goal.band} text={goal.bandText} />
                </div>
              </div>
            )
          })}
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
