// Report page 8: foundations and you. The five-level pyramid, protection, and your money personality.
import { RISK_LABELS } from '../../domain/discovery/profile.data.ts'
import CircleIcon from './CircleIcon.tsx'
import PageFrame, { type PageProps } from './PageFrame.tsx'
import Photo from './Photo.tsx'
import TitleBlock from './TitleBlock.tsx'
import { COLOURS } from './tones.ts'

/** Each level's background, border and status colours by tone. */
const LEVEL_COLOURS: Record<string, [string, string, string]> = {
  good: [COLOURS.tealTint, COLOURS.tealMid, COLOURS.teal],
  gold: [COLOURS.goldTint, COLOURS.gold, COLOURS.goldText],
  coral: [COLOURS.coralTint, COLOURS.coral, COLOURS.coralText],
  grey: [COLOURS.bg, '#bdc4cd', COLOURS.muted],
}
/** Level widths from the top of the pyramid down. */
const WIDTHS = [58, 66, 74, 83, 91]
const QUADRANTS = [
  'HOW YOU FEEL ABOUT MONEY',
  'HOW YOU TEND TO ACT',
  'HOW MUCH RISK YOU WANT',
  'HOW MUCH YOU CAN AFFORD TO LOSE',
]

const answerColour = (good: boolean | null) =>
  good === true ? COLOURS.teal : good === false ? COLOURS.coralText : COLOURS.navy

export default function FoundationsPage(props: PageProps) {
  const foundations = props.data.foundations
  const { levels, protection, personality } = foundations
  const { activeIndex } = personality.riskScale
  return (
    <PageFrame {...props} label="Foundations and you">
      <div className="lmr-body">
        <TitleBlock
          {...foundations}
          bigLabel="foundations solid"
          eyebrow="FOUNDATIONS AND YOU"
          title="Build from the bottom up"
          lead="Good planning is built from the bottom up."
        />
        <div className="lmr-f1">
          <div
            className="lmr-pyr"
            style={{ height: personality.note.length > 170 ? 426 : 452 }}
            role="img"
            aria-label="Five foundations from the bottom up"
          >
            {levels.map((level, index) => {
              const [background, border, text] = LEVEL_COLOURS[level.tone]
              return (
                <div
                  className="lmr-lv"
                  key={level.level}
                  style={{
                    width: `${WIDTHS[Math.round((index * 4) / Math.max(1, levels.length - 1))]}%`,
                    background,
                    borderColor: border,
                  }}
                >
                  <CircleIcon
                    name={level.icon}
                    tone={level.tone === 'grey' ? 'gold' : level.tone}
                    size={32}
                    iconSize={20}
                  />
                  <div>
                    <div className="lmx-t">{level.title}</div>
                    <div className="lmx-s" style={{ color: text }}>
                      {level.status}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="lmr-prot">
            <div
              className="lmx-ph"
              style={{ height: protection.nextBest.text.length > 110 ? 76 : 113 }}
            >
              <Photo name="car-and-calculator" />
            </div>
            <div className="lmx-pt">Protection</div>
            {protection.rows.map((row) => (
              <div className="lmx-pr" key={row.label}>
                <span>{row.label}</span>
                <b style={{ color: answerColour(row.good) }}>{row.value}</b>
              </div>
            ))}
            <div className="lmr-nb">
              <div className="lmx-e">NEXT BEST STEP</div>
              <div className="lmx-x">{protection.nextBest.text}</div>
            </div>
          </div>
        </div>
        <div className="lmr-pers">
          <div className="lmx-ph">
            <CircleIcon name={personality.icon} tone="gold" size={52} iconSize={26} />
            <div>
              <div className="lmr-ey" style={{ margin: '0 0 3px' }}>
                YOUR MONEY PERSONALITY
              </div>
              <div className="lmx-n">{personality.name}</div>
              <div className="lmx-st">{personality.strap}</div>
            </div>
          </div>
          <div className="lmr-quad">
            {personality.quadrants.map((quadrant, index) => (
              <div key={QUADRANTS[index]}>
                <div className="lmx-q">{QUADRANTS[index]}</div>
                <div className="lmx-v">{quadrant.value}</div>
              </div>
            ))}
          </div>
          <div className="lmr-risk">
            Risk profile
            <div className="lmr-scale">
              {RISK_LABELS.map((label, index) =>
                index === activeIndex ? (
                  <div className="lmx-on" aria-current="true" key={label}>
                    {label}
                  </div>
                ) : (
                  <div key={label}>{label}</div>
                ),
              )}
            </div>
          </div>
          {personality.note ? <div className="lmx-nt">{personality.note}</div> : null}
        </div>
      </div>
    </PageFrame>
  )
}
