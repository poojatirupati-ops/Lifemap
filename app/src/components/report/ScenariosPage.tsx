// Report page 7: what could change the answer. Retirement covered today against one change at a
// time and the changes combined.
import { PageFrame, type PageProps } from './PageFrame.tsx'
import { clamp } from '../../lib/clamp.ts'
import { band } from '../../domain/planning/bands.ts'
import { bandTone } from '../../report/model/text.ts'
import { COLOURS, fillOf, textOf } from './tones.ts'

export default function ScenariosPage(props: PageProps) {
  const scenarios = props.data.scenarios
  return (
    <PageFrame {...props} label="What could change the answer">
      <div className="lmr-body">
        <div className="lmr-tb">
          <div className="lmr-bn">
            <div className="lmr-bnum">
              <span style={{ color: textOf(scenarios.fromTone) }}>{scenarios.fromPct}%</span>{' '}
              <svg
                className="lmr-arrow"
                width="40"
                height="22"
                viewBox="0 0 40 22"
                aria-hidden="true"
              >
                <path
                  d="M2 11h33M26 3l9 8-9 8"
                  stroke={COLOURS.coralText}
                  strokeWidth="3.4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>{' '}
              <span style={{ color: textOf(scenarios.toTone) }}>{scenarios.toPct}%</span>
            </div>
            <div className="lmr-bl">retirement covered</div>
          </div>
          <div className="lmr-tx">
            <div className="lmr-ey">WHAT COULD CHANGE THE ANSWER</div>
            <h1 className="lmr-title">{scenarios.title}</h1>
          </div>
        </div>
        <div className="lmr-sc">
          <div className="lmx-hd">
            <span className="lmx-a">WHAT IF YOU…</span>
            <span className="lmx-b">COVERED</span>
            <span className="lmx-c">GAP STARTS AT</span>
          </div>
          {scenarios.groups.map((group) => [
            <div className="lmx-gt" key={group.title}>
              {group.title}
            </div>,
            ...group.rows.map((row) => {
              const percent = clamp(row.pct, 0, 100)
              return (
                <div className="lmx-rw" key={`${group.title} ${row.id}`}>
                  <div className="lmx-a">
                    <b style={'emphasis' in row ? { color: COLOURS.coralText } : undefined}>
                      {row.title}
                    </b>
                    <span>{row.sub}</span>
                  </div>
                  <div className="lmx-bar">
                    <i
                      style={{ width: `${percent}%`, background: fillOf(bandTone(band(percent))) }}
                    ></i>
                  </div>
                  <div className="lmx-p">{percent}%</div>
                  <div className="lmx-g">{row.gapStartsAge ?? 'None'}</div>
                </div>
              )
            }),
          ])}
        </div>
        <div className="lmr-explore">
          <div className="lmx-t">A path to explore</div>
          <div className="lmx-x">{scenarios.explore.text}</div>
        </div>
        <div className="lmr-foot2">{scenarios.footnote}</div>
      </div>
    </PageFrame>
  )
}
