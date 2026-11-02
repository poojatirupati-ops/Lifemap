import { EXPERTS } from '../../domain/identity/advisers.data.ts'
import { exploreBack } from '../../state/explore.ts'
import { expertName, topicPhotoStyle, withArticle, type Topic } from './explore.data.ts'

interface Props {
  topic: Topic
  toolCount: number
  videoCount: number
}

/** A topic's photo with a back button, and the sheet over it: name, counts and blurb. */
export default function TopicSheet({ topic, toolCount, videoCount }: Props) {
  const shortExpert =
    topic.expert === 'planner' ? 'Planner' : EXPERTS[topic.expert].title.split(' ')[0]
  return (
    <>
      <div className="dhero2" style={topicPhotoStyle(topic)}>
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
            <b>{toolCount}</b>
          </div>
          <div>
            <small>Videos</small>
            <b>{videoCount}</b>
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
    </>
  )
}
