import { expertName, STATEMENTS, withArticle } from '../components/explore/explore.data.ts'
import { toolById } from '../components/explore/tools.data.ts'
import CalculatorRow from '../components/explore/CalculatorRow.tsx'
import StatementLink from '../components/explore/StatementLink.tsx'
import LiveCard from '../components/explore/LiveCard.tsx'
import Strip from '../components/explore/Strip.tsx'
import TopicSheet from '../components/explore/TopicSheet.tsx'
import VideoCard from '../components/explore/VideoCard.tsx'
import { useLiveSessions, useTopics, useVideos } from '../content/cms.tsx'
import { talkToExpert } from '../state/explore.ts'

type Props = { param?: string }

export const key = 'XTOPIC'
export const id = 'XPL-TOPIC'
export const note =
  'Topic page (Pooja, 1 Oct): actions first, then videos. (a) Try the calculator (2–4 most relevant), (b) Talk to the matching expert, (c) Upload a statement where it applies, (d) videos and live sessions.'

const useTopic = (name: string) => useTopics().find((topic) => topic.name === name)

export function Foot({ param = '' }: Props) {
  const expert = useTopic(param)?.expert
  if (!expert) return null
  return (
    <button className="btn" data-a="expertfor" data-p={expert} onClick={() => talkToExpert(expert)}>
      Talk to {withArticle(expertName(expert))}
    </button>
  )
}

export function Body({ param = '' }: Props) {
  const topic = useTopic(param)
  const videos = useVideos().filter((video) => video.kind === topic?.expert)
  const sessions = useLiveSessions().filter((session) => session.expert === topic?.expert)
  if (!topic) return null
  const tools = topic.tools.map(toolById)
  const statement = STATEMENTS[topic.category]

  return (
    <>
      <TopicSheet topic={topic} toolCount={tools.length} videoCount={videos.length} />
      <div className="sec">
        <h3>Try the calculator</h3>
      </div>
      {tools.map((tool) => (
        <CalculatorRow key={tool.id} tool={tool} />
      ))}
      {statement ? <StatementLink category={topic.category} statement={statement} /> : null}
      {videos.length > 0 ? (
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
      ) : null}
      {sessions.map((session) => (
        <LiveCard key={session.title} session={session} style={{ marginTop: 8 }} />
      ))}
      <p className="disc">Topics explain general ideas. They are not advice.</p>
    </>
  )
}
