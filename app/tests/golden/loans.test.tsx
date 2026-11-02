// The Loans page must render the same DOM as the ORIGINAL's V.LOANS(), run in node:vm.
import { JSDOM } from 'jsdom'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, expect, test } from 'vitest'
import { runOriginal } from './origSlice'
import { Body } from '../../src/components/journey/JourneyPage.tsx'
import { JOURNEY_PAGES } from '../../src/state/journeyPage.ts'
import { seedContent } from '../content/seed.ts'
import { shape } from './helpers'

seedContent()
const useLoansPage = JOURNEY_PAGES.Loans

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
    lps: situation,
    lpv: video,
    lpd: watched,
    lpseat: seats,
    lprd: openReading,
  })
  original.setState(state)
  return shape(original.V.LOANS().html)
}

function ourPage({ situation, video, watched = {}, seats = {}, openReading }: Page) {
  useLoansPage.setState({ situation, video, watched, seats, openReading: openReading ?? null })
  const container = document.createElement('div')
  const root = createRoot(container)
  act(() => root.render(<Body topic="Loans" />))
  const html = container.innerHTML
  act(() => root.unmount())
  return shape(html)
}

afterEach(() =>
  useLoansPage.setState({ situation: 0, video: 0, watched: {}, seats: {}, openReading: null }),
)

test.each([
  { situation: 0, video: 0 },
  { situation: 0, video: 2, openReading: 0 },
  { situation: 1, video: 1, openReading: 1 },
  { situation: 2, video: 2, openReading: 2 },
  { situation: 1, video: 0, watched: { '1-0': true, '1-2': true }, seats: { '1-1': true } },
])('Loans page equals the original: %o', (page) => {
  expect(ourPage(page)).toEqual(originalPage(page))
})

test('the Loans page keeps its own situation, separate from Mortgages', () => {
  useLoansPage.getState().pickSituation(2)
  expect(useLoansPage.getState().situation).toBe(2)
  expect(JOURNEY_PAGES.Mortgages.getState().situation).toBe(0)
})
