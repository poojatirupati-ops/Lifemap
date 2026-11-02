import { createFileRoute } from '@tanstack/react-router'
import Screen from '../../../../shell/Screen.tsx'
import MortgagesPage from '../../../../components/mortgages/MortgagesPage.tsx'
import { expertName, STATEMENTS, withArticle } from '../../../../components/explore/explore.data.ts'
import { toolById } from '../../../../components/explore/tools.data.ts'
import CalculatorRow from '../../../../components/explore/CalculatorRow.tsx'
import StatementLink from '../../../../components/explore/StatementLink.tsx'
import LiveCard from '../../../../components/explore/LiveCard.tsx'
import Strip from '../../../../components/explore/Strip.tsx'
import TopicSheet from '../../../../components/explore/TopicSheet.tsx'
import VideoCard from '../../../../components/explore/VideoCard.tsx'
import Sec from '../../../../components/ui/Sec.tsx'
import { useLiveSessions, useTopics, useVideos } from '../../../../content/cms.tsx'
import { talkToExpert } from '../../../../state/explore.ts'

export const Route = createFileRoute('/_auth/_app/explore/topic/$name')({ component: ExploreTopic })

/** A topic page; Mortgages has a page of its own. */
function ExploreTopic() {
  const { name } = Route.useParams()
  const topic = useTopics().find((each) => each.name === name)
  const videos = useVideos().filter((video) => video.kind === topic?.expert)
  const sessions = useLiveSessions().filter((session) => session.expert === topic?.expert)
  if (name === 'Mortgages') return <MortgagesPage />
  const tools = topic?.tools.map(toolById) ?? []
  const statement = topic && STATEMENTS[topic.category]

  return (
    <Screen
      id="XPL-TOPIC"
      note="Topic page (Pooja, 1 Oct): actions first, then videos. (a) Try the calculator (2–4 most relevant), (b) Talk to the matching expert, (c) Upload a statement where it applies, (d) videos and live sessions."
      foot={
        topic?.expert ? (
          <button
            className="btn"
            data-a="expertfor"
            data-p={topic.expert}
            onClick={() => talkToExpert(topic.expert)}
          >
            Talk to {withArticle(expertName(topic.expert))}
          </button>
        ) : null
      }
    >
      {topic ? (
        <>
          <TopicSheet topic={topic} toolCount={tools.length} videoCount={videos.length} />
          <Sec title="Try the calculator" />
          {tools.map((tool) => (
            <CalculatorRow key={tool.id} tool={tool} />
          ))}
          {statement ? <StatementLink category={topic.category} statement={statement} /> : null}
          {videos.length > 0 ? (
            <>
              <Sec title="Watch" />
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
      ) : null}
    </Screen>
  )
}
