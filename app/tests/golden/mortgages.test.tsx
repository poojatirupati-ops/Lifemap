// The Mortgages page must render the same DOM as the ORIGINAL's V.MORT(), run in node:vm.
import { JSDOM } from 'jsdom'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, expect, test } from 'vitest'
import { runOriginal } from './origSlice'
import { Body } from '../../src/components/journey/JourneyPage.tsx'
import { JOURNEY_PAGES } from '../../src/state/journeyPage.ts'
import { seedContent } from '../content/seed.ts'
import { PATHS, contentClient } from '../../src/content/cms.tsx'
import { shape } from './helpers'

seedContent()
const useMortgagePage = JOURNEY_PAGES.Mortgages
// Every article gets a body here; the original shows a placeholder where the app shows the body.
const BODY = 'What lenders look at, step by step.'
const PLACEHOLDER = 'TODO: content to come from docs/content/mortgage/ (not added yet).'
for (const journey of contentClient.getQueryData<{ reading: object[] }[]>([PATHS.journeys])!)
  for (const item of journey.reading)
    Object.assign(item, {
      body: { root: { children: [{ children: [{ text: BODY, format: 0 }] }] } },
    })

const original = runOriginal('V, fresh')
// a DOM for React to render into; this file runs in node because the original is read from disk
const page = new JSDOM('<!doctype html><body></body>')
Object.assign(globalThis, {
  window: page.window,
  document: page.window.document,
  IS_REACT_ACT_ENVIRONMENT: true,
})

type Page = {
  situation: number
  video: number
  watched?: object
  seats?: object
  openReading?: number
}

function originalPage({ situation, video, watched = {}, seats = {}, openReading }: Page) {
  const state = original.fresh()
  Object.assign(state, {
    mps: situation,
    mpv: video,
    mpd: watched,
    mpseat: seats,
    mprd: openReading,
  })
  original.setState(state)
  return shape(original.V.MORT().html.replace(PLACEHOLDER, BODY))
}

function ourPage({ situation, video, watched = {}, seats = {}, openReading }: Page) {
  useMortgagePage.setState({ situation, video, watched, seats, openReading: openReading ?? null })
  const container = document.createElement('div')
  const root = createRoot(container)
  act(() => root.render(<Body topic="Mortgages" />))
  // captions now come from the CMS, cross-origin; the rest is the original's markup
  const html = container.innerHTML
    .replace(' crossorigin="anonymous"', '')
    .replace('http://localhost:3000/api/media/file/', '/media/')
  act(() => root.unmount())
  return shape(html)
}

afterEach(() => useMortgagePage.setState({ situation: 0, video: 0, watched: {}, seats: {} }))

test.each([
  { situation: 0, video: 0 },
  { situation: 0, video: 2 },
  { situation: 1, video: 3 },
  { situation: 2, video: 1, openReading: 1 },
  { situation: 1, video: 1, watched: { '1-0': true }, seats: { '1-1': true } },
])('Mortgages page equals the original: %o', (page) => {
  expect(ourPage(page)).toEqual(originalPage(page))
})

test('picking a situation starts at its first video; a seat toggles per situation', () => {
  const page = useMortgagePage.getState()
  page.playVideo(2)
  page.pickSituation(1)
  page.toggleSeat(0)
  expect(useMortgagePage.getState()).toMatchObject({
    situation: 1,
    video: 0,
    seats: { '1-0': true },
  })
  useMortgagePage.getState().toggleSeat(0)
  expect(useMortgagePage.getState().seats['1-0']).toBe(false)
})
