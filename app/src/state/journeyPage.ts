import { createContext, useContext } from 'react'
import { createStore, useStore } from 'zustand'
import { toast } from './shell.ts'

/** Key of a video or live session within a situation, for `watched` and `seats`. */
export const pageKey = (situation: number, index: number) => `${situation}-${index}`

/** A focus area's own page (Mortgages, Loans): which situation and video are picked, what was watched and booked. */
interface JourneyPage {
  /** The page's data-a names start with it, as in the original (mpsit, lpsit). */
  actionPrefix: string
  situation: number
  video: number
  /** Keys `situation-video` of the videos watched to the end. */
  watched: Record<string, true>
  /** Keys `situation-session` of the live sessions with a seat saved. */
  seats: Record<string, boolean>
  openReading: number | null

  pickSituation: (situation: number) => void
  playVideo: (video: number) => void
  markWatched: () => void
  toggleReading: (reading: number) => void
  toggleSeat: (session: number) => void
}

const journeyPage = (actionPrefix: string) =>
  createStore<JourneyPage>()((set) => ({
    actionPrefix,
    situation: 0,
    video: 0,
    watched: {},
    seats: {},
    openReading: null,

    pickSituation: (situation) => set({ situation, video: 0, openReading: null }),
    playVideo: (video) => set({ video }),
    markWatched: () =>
      set(({ situation, video, watched }) => ({
        watched: { ...watched, [pageKey(situation, video)]: true },
      })),
    toggleReading: (reading) =>
      set(({ openReading }) => ({ openReading: openReading === reading ? null : reading })),
    toggleSeat: (session) => {
      let saved = false
      set(({ situation, seats }) => {
        const key = pageKey(situation, session)
        saved = !seats[key]
        return { seats: { ...seats, [key]: saved } }
      })
      toast(saved ? "Seat saved. We'll remind you before it starts" : 'Seat released')
    },
  }))

/** Each page keeps its own state. */
export const JOURNEY_PAGES = { Mortgages: journeyPage('mp'), Loans: journeyPage('lp') }
export type JourneyTopic = keyof typeof JOURNEY_PAGES

/** The page being shown; its parts read their page's state through it. */
export const JourneyPageContext = createContext(JOURNEY_PAGES.Mortgages)

export const useJourneyPage = <T>(select: (page: JourneyPage) => T) =>
  useStore(useContext(JourneyPageContext), select)

/** The page's actions (stable; they never re-render). */
export const useJourneyActions = () => useContext(JourneyPageContext).getState()
