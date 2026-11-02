import { createFileRoute } from '@tanstack/react-router'
import AppScreen from '../../../../../components/frame/AppScreen.tsx'
import { exploreBack, openCalculator, talkToExpert } from '../../../../../state/explore.ts'
import { whyThisVideo } from '../../../../../domain/explore/picks.ts'
import { useGoalPicks } from '../../../../../hooks/useGoalPicks.ts'
import { toolById } from '../../../../../components/explore/tools.data.ts'
import Strip from '../../../../../components/explore/Strip.tsx'
import VideoCard from '../../../../../components/explore/VideoCard.tsx'
import FilmedPlayer from '../../../../../components/video/FilmedPlayer.tsx'
import MockPlayer from '../../../../../components/video/MockPlayer.tsx'
import {
  VIDEO_KIND_LABEL,
  transcriptFor,
  useVideos,
  videoLength,
  type Video,
} from '../../../../../content/cms.tsx'
import Sec from '../../../../../components/ui/Sec.tsx'
import { toast } from '../../../../../state/shell.ts'

const CAPTIONS_ON = 'Captions are on. Use the CC button on the player to turn them off.'
const CAPTIONS_MISSING = (
  <>
    <b>Captions not available yet.</b> A transcript will be added. If you can't listen, talk to an
    expert or try the calculator above.
  </>
)

export const Route = createFileRoute('/_auth/_app/explore/videos/$id')({ component: VideoPlayer })

function VideoPlayer() {
  const { id } = Route.useParams()
  const videos = useVideos()
  const video = videos.find((each) => each.id === id)
  return (
    <AppScreen
      id="VID-01"
      note="Video player (Lifecast): captions on by default, transcript. Under the video: why it was picked, the matching tool (pre-filled) and an expert door."
      title="Watch"
      back={exploreBack}
      bell
    >
      {video ? <Player video={video} videos={videos} /> : null}
    </AppScreen>
  )
}

function Player({ video, videos }: { video: Video; videos: Video[] }) {
  const { goals, percent, ready } = useGoalPicks()
  const why = whyThisVideo(goals, percent, ready, video.kind)
  const tool = toolById(video.tool)
  const { presenter, role } = video
  const filmed = Boolean(video.src || video.vimeoId)
  const captionNote = filmed ? (video.captions ? CAPTIONS_ON : CAPTIONS_MISSING) : null
  const transcript = transcriptFor(video)

  return (
    <>
      {filmed ? <FilmedPlayer key={video.id} video={video} /> : <MockPlayer video={video} />}
      <div className="vm2">
        <span className="vm2-k">{VIDEO_KIND_LABEL[video.kind]}</span>
        <h2 className="t" tabIndex={-1}>
          {video.title}
        </h2>
        <div className="vm2-who">
          <span className="vm2-av" aria-hidden="true">
            {presenter[0]}
          </span>
          <span>
            <b>{presenter}</b>
            <small>{role}</small>
          </span>
          <span className="vm2-d">⏱ {videoLength(video)}</span>
        </div>
      </div>
      {why ? (
        <div className="card" style={{ marginTop: 12, background: 'var(--sea-l)' }}>
          <b style={{ fontSize: 14 }}>Why this is for you</b>
          <div style={{ fontSize: 14, marginTop: 4 }}>{why} This video explains the basics.</div>
        </div>
      ) : null}
      <button
        className="vt2"
        data-a="calc"
        data-p={video.tool}
        onClick={() => openCalculator(video.tool)}
      >
        <span className="vt2-i" aria-hidden="true">
          {tool.emoji}
        </span>
        <span className="vt2-m">
          <small>Try the calculator</small>
          <b>{tool.name}</b>
        </span>
        <span className="vt2-go" aria-hidden="true">
          →
        </span>
      </button>
      <div className="va2">
        <button
          className="va2-b"
          data-a="expertfor"
          data-p={video.kind}
          onClick={() => talkToExpert(video.kind)}
        >
          <span aria-hidden="true">💬</span> Ask an expert
        </button>
        <button
          className="va2-b"
          data-a="toast"
          data-p="Saved to watch later"
          onClick={() => toast('Saved to watch later')}
        >
          <span aria-hidden="true">🔖</span> Save for later
        </button>
      </div>
      {captionNote ? (
        <p className="small" id="vid-cap" style={{ margin: '12px 0 0' }}>
          {captionNote}
        </p>
      ) : null}
      {transcript === null ? null : (
        <details className="card asmg wigrow" style={{ marginTop: 12 }}>
          <summary>Transcript</summary>
          <p style={{ fontSize: 14, lineHeight: 1.55, margin: '8px 0 0' }}>{transcript}</p>
        </details>
      )}
      <Sec title="Up next" />
      <Strip>
        {videos
          .filter((other) => other.id !== video.id)
          .slice(0, 3)
          .map((other) => (
            <VideoCard key={other.id} video={other} />
          ))}
      </Strip>
      <p className="disc">Videos explain general topics. They are not personal advice.</p>
    </>
  )
}
