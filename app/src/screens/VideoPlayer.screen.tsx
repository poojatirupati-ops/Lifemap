import { useMemo, type CSSProperties } from 'react'
import AppHead from '../components/frame/AppHead.tsx'
import { unseenLooks } from '../components/home/useHome.ts'
import { exploreBack, openCalculator, talkToExpert } from '../components/explore/exploreActions.ts'
import { toolById } from '../components/explore/tools.data.ts'
import Strip from '../components/explore/Strip.tsx'
import VideoCard from '../components/explore/VideoCard.tsx'
import FilmedPlayer from '../components/video/FilmedPlayer.tsx'
import MockPlayer from '../components/video/MockPlayer.tsx'
import { VIDEOS, VIDEO_KIND_LABEL, type Video } from '../components/explore/videos.data.ts'
import { project } from '../domain/planning/project.ts'
import { planMissing } from '../report/model/readiness.ts'
import { toast } from '../state/shell.ts'
import { useStore } from '../state/store.ts'

export const key = 'VID'
export const id = 'VID-01'
export const note =
  'Video player (Lifecast): captions on by default, transcript. Under the video: why it was picked, the matching tool (pre-filled) and an expert door.'

const PARAGRAPH: CSSProperties = { fontSize: 14, lineHeight: 1.55, margin: '8px 0 0' }
const CAPTION_NOTE: CSSProperties = { margin: '12px 0 0' }

const videoById = (id = '') => VIDEOS.find((video) => video.id === id)!

export const Head = () =>
  AppHead({ title: 'Watch', back: exploreBack, needsLook: unseenLooks(useStore.getState().plan) })

/** "Your <goal> goal is n% covered", for the goal this video is about, once the plan is ready. */
function useWhyForYou(video: Video) {
  const plan = useStore((store) => store.plan)
  return useMemo(() => {
    const goal =
      plan.goals.find((g) => g.spec === video.kind && g.kind !== 'retire') ??
      (video.kind === 'pension' ? plan.goals.find((g) => g.kind === 'retire') : undefined)
    if (!plan.app || !goal || planMissing(plan).length) return null
    return `Your ${goal.name.toLowerCase()} goal is ${project(plan).percent[goal.id]}% covered.`
  }, [plan, video.kind])
}

export function Body({ param }: { param?: string }) {
  const video = videoById(param)
  const why = useWhyForYou(video)
  const tool = toolById(video.tool)
  const [presenter, role = ''] = video.who.split(' · ')

  return (
    <>
      {video.src ? <FilmedPlayer video={video} /> : <MockPlayer video={video} />}
      <div className="vm2">
        <span className="vm2-k">{VIDEO_KIND_LABEL[video.kind]}</span>
        <h2 className="t" tabIndex={-1}>
          {video.title}
        </h2>
        <div className="vm2-who">
          <span className="vm2-av" aria-hidden="true">
            {video.who.trim()[0]}
          </span>
          <span>
            <b>{presenter}</b>
            <small>{role}</small>
          </span>
          <span className="vm2-d">⏱ {video.duration ?? `${video.mins} min`}</span>
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
      {video.src && !video.captions ? (
        <p className="small" id="vid-cap" style={CAPTION_NOTE}>
          <b>Captions not available yet.</b> A transcript will be added. If you can't listen, talk
          to an expert or try the calculator above.
        </p>
      ) : (
        <>
          {video.src ? (
            <p className="small" id="vid-cap" style={CAPTION_NOTE}>
              Captions are on. Use the CC button on the player to turn them off.
            </p>
          ) : null}
          <details className="card asmg wigrow" style={{ marginTop: 12 }}>
            <summary>Transcript</summary>
            <p style={PARAGRAPH}>
              {video.src ? video.transcript : `${video.caption} [Full transcript appears here.]`}
            </p>
          </details>
        </>
      )}
      <div className="sec">
        <h3>Up next</h3>
      </div>
      <Strip>
        {VIDEOS.filter((other) => other.id !== video.id)
          .slice(0, 3)
          .map((other) => (
            <VideoCard key={other.id} video={other} />
          ))}
      </Strip>
      <p className="disc">Videos explain general topics. They are not personal advice.</p>
    </>
  )
}
