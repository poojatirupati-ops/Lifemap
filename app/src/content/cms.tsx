// Published copy from the Payload CMS (docs/cms.md), cached with TanStack Query. Records keep the app's ids.
import { QueryClient, useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import type { CategoryId } from '../components/explore/tools.data.ts'

const CMS = import.meta.env.VITE_CMS_URL ?? 'http://localhost:3000'

// Its own client: signing out clears the plan's client, which must not drop the copy.
export const contentClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60_000 } },
})

/** The REST paths read, also the query keys (tests seed the cache by them). */
export const PATHS = {
  videos: 'videos?limit=100&depth=1&sort=createdAt',
  topics: 'topics?sort=order&depth=1',
  live: 'live-sessions?where[onExplore][equals]=true&sort=createdAt',
  journeys: 'journeys?sort=order&depth=2',
  ask: 'ask-answers?sort=order&limit=100',
}

// oxlint-disable-next-line no-explicit-any -- Payload's REST docs, shaped by the mappers below
type Doc = any

async function docs(path: string): Promise<Doc[]> {
  const res = await fetch(`${CMS}/api/${path}`)
  if (!res.ok) throw new Error(`CMS ${res.status}: ${path}`)
  return (await res.json()).docs
}

/** One collection, mapped; [] until it loads. `select` must be a stable (module-level) function. */
function useDocs<T>(path: string, select: (docs: Doc[]) => T[]) {
  return useQuery({ queryKey: [path], queryFn: () => docs(path), select }, contentClient).data ?? []
}

export type VideoKind = 'mortgage' | 'pension' | 'planner' | 'protection' | 'investment'

export interface Video {
  id: string
  title: string
  kind: VideoKind
  presenter: string
  role: string
  /** The calculator the video leads to. */
  tool: string
  art: string
  mins: number
  /** Running time shown on the card; videos without one show their minutes. */
  duration: string | null
  caption: string
  transcript: string | null
  /** Captions file URL. */
  captions: string | null
  vimeoId: string | null
  thumbnailUrl: string | null
  /** App media files, until the video is on Vimeo. */
  src: string | null
  poster: string | null
}

/** The app's own media files are stored as "media/x.mp4": served from the site root, so deep pages find them too. */
const fromRoot = (path: string | null) => (path?.startsWith('media/') ? `/${path}` : path)

const toVideo = (doc: Doc): Video => ({
  ...doc,
  id: doc.appId,
  src: fromRoot(doc.src),
  poster: fromRoot(doc.poster),
  captions: doc.captions?.url ? new URL(doc.captions.url, CMS).href : null,
})
const toVideos = (list: Doc[]) => list.map(toVideo)

export const useVideos = () => useDocs(PATHS.videos, toVideos)

/** "1:14", or "2 min" for a video without a running time. */
export const videoLength = (video: Video) => video.duration ?? `${video.mins} min`

/** The transcript text under the player, or null for a filmed video without captions. */
export function transcriptFor(video: Video) {
  if (!video.src && !video.vimeoId) return `${video.caption} [Full transcript appears here.]`
  return video.captions ? (video.transcript ?? '') : null
}

export const VIDEO_KIND_LABEL: Record<VideoKind, string> = {
  mortgage: 'Mortgages',
  pension: 'Pensions',
  planner: 'Savings & money',
  protection: 'Protection',
  investment: 'Investing',
}

export interface Topic {
  emoji: string
  name: string
  blurb: string
  expert: VideoKind
  category: CategoryId
  /** The --art-* picture and, for photos, where the photo is centred. */
  art: string
  photoPosition: string | null
  tools: string[]
}

const toTopic = (doc: Doc): Topic => ({
  ...doc,
  category: doc.category.appId,
  tools: doc.tools.map((tool: Doc) => tool.appId),
})
const toTopics = (list: Doc[]) => list.map(toTopic)

/** The focus areas, in order. */
export const useTopics = () => useDocs(PATHS.topics, toTopics)

export interface LiveSession {
  when: string
  title: string
  expert: VideoKind
}

const asIs = (list: Doc[]) => list

/** The live sessions Explore shows. */
export const useLiveSessions = (): LiveSession[] => useDocs(PATHS.live, asIs)

export interface CalculatorCard {
  label: string
  photo: string
  /** The calculator it opens. */
  tool: string
  emoji: string
  /** Shown instead of the calculator's own name. */
  name: string | null
}

export interface StoryVideo {
  short: string
  title: string
  duration: string
  color: string
  emoji: string
  /** The calculator "Up next" opens. */
  tool: string
  chapters: string[]
  /** The filmed video, when there is one. */
  video: Video | null
}

export interface Reading {
  kind: string
  title: string
  emoji: string
  /** The article's paragraphs; null when it has no text yet. */
  body: ReactNode[] | null
}

export interface Journey {
  name: string
  topic: Topic
  calculators: CalculatorCard[]
  videos: StoryVideo[]
  reading: Reading[]
  live: { when: string; title: string }[]
}

const READING_KIND: Record<string, string> = { article: 'Articles', faq: 'FAQs', link: 'Links' }

const toJourneys = (list: Doc[]) =>
  list.map((doc): Journey => ({
    name: doc.name,
    topic: toTopic(doc.topic),
    calculators: doc.calculators.map((card: Doc) => ({ ...card, tool: card.tool.appId })),
    videos: doc.stories.map((story: Doc) => ({
      ...story,
      video: story.video?.src || story.video?.vimeoId ? toVideo(story.video) : null,
    })),
    reading: doc.reading.map((item: Doc): Reading => ({
      ...item,
      kind: READING_KIND[item.kind],
      body: item.body ? richText(item.body) : null,
    })),
    live: doc.live,
  }))

/** The Mortgages page's journeys (Buying, Switching, Borrowing more). */
export const useJourneys = () => useDocs(PATHS.journeys, toJourneys)

export interface AskAnswer {
  key: string
  question: string
  answer: ReactNode
}

/**
 * Lexical rich text as React, one entry per paragraph: text, bold where marked (all the copy uses).
 * @payloadcms/richtext-lexical's RichText is not used: it needs payload and Next as peers.
 */
const richText = (value: Doc): ReactNode[] =>
  value.root.children.map((paragraph: Doc) =>
    paragraph.children.map((text: Doc, i: number) =>
      text.format & 1 ? <b key={i}>{text.text}</b> : text.text,
    ),
  )

const toAnswers = (list: Doc[]) =>
  list.map((doc): AskAnswer => ({
    key: doc.key,
    question: doc.question,
    answer: richText(doc.answer),
  }))

/** Ask LifeMap's general questions, and the reply when asked for advice (key 'advice-guard'). */
export function useAskAnswers() {
  const answers = useDocs(PATHS.ask, toAnswers)
  return {
    general: answers.filter((answer) => answer.key !== 'advice-guard'),
    guard: answers.find((answer) => answer.key === 'advice-guard')?.answer,
  }
}
