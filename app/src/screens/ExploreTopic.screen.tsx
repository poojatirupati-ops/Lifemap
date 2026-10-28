import type { CSSProperties } from 'react'
import { EXPERTS } from '../domain/identity/advisers.data.ts'
import {
  LIVE_SESSIONS,
  STATEMENTS,
  TOPICS,
  withArticle,
} from '../components/explore/explore.data.ts'
import { toolById } from '../components/explore/tools.data.ts'
import {
  exploreBack,
  openCalculator,
  openCategory,
  talkToExpert,
} from '../components/explore/exploreActions.ts'
import ExploreRow from '../components/explore/ExploreRow.tsx'
import LiveCard from '../components/explore/LiveCard.tsx'
import Strip from '../components/explore/Strip.tsx'
import VideoCard from '../components/explore/VideoCard.tsx'
import { VIDEOS } from '../components/explore/videos.data.ts'
import Emo from '../components/ui/Emo.tsx'
import { screenFor } from '../shell/screens.tsx'
import { useStore } from '../state/store.ts'

type Props = { param?: string }

export const key = 'XTOPIC'
export const id = 'XPL-TOPIC'
export const note =
  'Topic page (Pooja, 1 Oct): actions first, then videos. (a) Try the calculator (2–4 most relevant), (b) Talk to the matching expert, (c) Upload a statement where it applies, (d) videos and live sessions.'

/** Mortgages has a page of its own. */
const MORTGAGES = 'Mortgages'
const mortgages = () => screenFor('MORT', useStore.getState().plan)
const topicFor = (name = '') => TOPICS.find((topic) => topic.name === name)!
const expertName = (kind: keyof typeof EXPERTS) => EXPERTS[kind].title.toLowerCase()

export const Head = (props: Props) =>
  props.param === MORTGAGES ? (mortgages().Head?.(props) ?? null) : null

export function Foot(props: Props) {
  if (props.param === MORTGAGES) {
    const MortgagesFoot = mortgages().Foot
    return MortgagesFoot ? <MortgagesFoot {...props} /> : null
  }
  const { expert } = topicFor(props.param)
  return (
    <button className="btn" data-a="expertfor" data-p={expert} onClick={() => talkToExpert(expert)}>
      Talk to {withArticle(expertName(expert))}
    </button>
  )
}

export function Body(props: Props) {
  const uploaded = useStore((store) => store.plan.pdocs)
  if (props.param === MORTGAGES) {
    const MortgagesBody = mortgages().Body
    return <MortgagesBody {...props} />
  }
  const topic = topicFor(props.param)
  const tools = topic.tools.map(toolById)
  const videos = VIDEOS.filter((video) => video.kind === topic.expert)
  const statement = STATEMENTS[topic.category]
  const photo = {
    '--art': `var(--art-${topic.art})`,
    '--pos': topic.photoPosition,
  } as CSSProperties
  const shortExpert =
    topic.expert === 'planner' ? 'Planner' : EXPERTS[topic.expert].title.split(' ')[0]

  return (
    <>
      <div className="dhero2" style={photo}>
        <span className="art" aria-hidden="true"></span>
        <button className="dcirc" data-a="xback" aria-label="Back" onClick={exploreBack}>
          ‹
        </button>
      </div>
      <div className="dsheet2">
        <span className="dgrab" aria-hidden="true"></span>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 className="t" tabIndex={-1} style={{ margin: 0 }}>
              {topic.name}
            </h2>
            <div className="small" style={{ marginTop: 4 }}>
              {topic.emoji} Focus area
            </div>
          </div>
        </div>
        <div className="dstats">
          <div>
            <small>Tools</small>
            <b>{tools.length}</b>
          </div>
          <div>
            <small>Videos</small>
            <b>{videos.length}</b>
          </div>
          <div>
            <small>Expert</small>
            <b>{shortExpert}</b>
          </div>
        </div>
        <p className="sub" style={{ margin: '12px 0 0' }}>
          {topic.blurb}. Try a calculator, watch a short video, or talk to{' '}
          {withArticle(expertName(topic.expert))}.
        </p>
      </div>
      <div className="sec">
        <h3>Try the calculator</h3>
      </div>
      {tools.map((tool) => (
        <ExploreRow
          key={tool.id}
          emoji={tool.emoji}
          title={tool.name}
          sub={tool.question}
          onClick={() => openCalculator(tool.id)}
          data-a="calc"
          data-p={tool.id}
        />
      ))}
      {statement && (
        <button
          className="link"
          style={{ fontSize: 15, display: 'block' }}
          onClick={() => openCategory(topic.category)}
          data-a="cat"
          data-p={topic.category}
        >
          <Emo>
            {`📄 ${uploaded[topic.category] ? `Your ${statement.what} statement is uploaded · see it` : `Upload ${withArticle(statement.what)} statement to fill in these tools`} →`}
          </Emo>
        </button>
      )}
      {videos.length > 0 && (
        <>
          <div className="sec">
            <h3>Watch</h3>
          </div>
          <Strip>
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </Strip>
        </>
      )}
      {LIVE_SESSIONS.filter((session) => session.expert === topic.expert).map((session) => (
        <LiveCard key={session.title} session={session} style={{ marginTop: 8 }} />
      ))}
      <p className="disc">Topics explain general ideas. They are not advice.</p>
    </>
  )
}
