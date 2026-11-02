// Report page 4: your roadmap. The road, then decade by decade: weather, what happens, savings.
import CircleIcon from './CircleIcon.tsx'
import PageFrame, { type PageProps } from './PageFrame.tsx'
import Road from './Road.tsx'
import Sparkline from './Sparkline.tsx'
import TitleBlock from './TitleBlock.tsx'
import { COLOURS, fillOf, textOf, tintOf } from './tones.ts'

const ROAD = {
  width: 681,
  height: 190,
  startX: 36,
  endX: 648,
  middleY: 102,
  swing: 0.72,
  stem: 46,
  endLabelX: 640,
  labelColor: COLOURS.navy,
  subColor: COLOURS.muted,
  glow: '#dce5ec',
  stemColor: '#9aa8b8',
  endColor: COLOURS.muted,
  labels: false,
}

export default function RoadmapPage(props: PageProps) {
  const { roadmap, road } = props.data
  return (
    <PageFrame {...props} label="Your roadmap">
      <div className="lmr-body">
        <TitleBlock
          {...roadmap}
          eyebrow="YOUR ROADMAP"
          lead="Green: income covers life. Gold: savings pay. Coral: a gap to plan for."
        />
        <div className="lmr-roadcard">
          <Road road={road} layout={ROAD} />
        </div>
        <div className="lmr-dec">
          {roadmap.decades.map((decade) => (
            <div className="lmr-drow" key={decade.label}>
              <div className="lmx-a">
                <CircleIcon name={decade.icon} tone={decade.tone} size={52} iconSize={26} />
                <div>
                  <div className="lmx-d">{decade.label}</div>
                  <div className="lmx-r">{decade.range}</div>
                </div>
              </div>
              <div className="lmx-rail" style={{ background: fillOf(decade.tone) }}></div>
              <div className="lmx-m">
                <div className="lmx-h">
                  {decade.title}
                  <span
                    className="lmr-chip"
                    style={{ background: tintOf(decade.tone), color: textOf(decade.tone) }}
                  >
                    {decade.chip}
                  </span>
                </div>
                <div className="lmx-x">{decade.text}</div>
                {decade.goalChips.length ? (
                  <div>
                    {decade.goalChips.slice(0, 4).map((chip) => (
                      <span
                        className="lmr-gchip"
                        style={{ borderColor: fillOf(chip.tone) }}
                        key={chip.text}
                      >
                        <b>{chip.age}</b>
                        {chip.text}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="lmx-sp">
                <div>Savings</div>
                <Sparkline {...decade.spark} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageFrame>
  )
}
