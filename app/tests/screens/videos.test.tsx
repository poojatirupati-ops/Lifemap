// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, expect, test, vi } from 'vitest'
import { contentClient } from '../../src/content/cms.tsx'
import { seedContent } from '../content/seed.ts'
import { fresh } from '../../src/state/fresh.ts'
import { useStore } from '../../src/state/store.ts'
import { renderAt } from '../renderAt.tsx'
import { goalForVideo } from '../../src/domain/planning/goalForVideo.ts'
import type { Goal } from '../../src/state/types.ts'
import { Body } from '../../src/components/journey/JourneyPage.tsx'
import { JOURNEY_PAGES, resetJourneyPages } from '../../src/state/journeyPage.ts'

beforeEach(() => {
  seedContent()
  useStore.getState().load(fresh())
})

test('VID-00: videos are read from the CMS, keyed by the app ids', async () => {
  contentClient.clear()
  const [video] = (await import('../content/cms.json')).default[
    'videos?limit=100&depth=1&sort=createdAt'
  ]
  const fetch = vi.fn(async (url: string) =>
    Response.json({
      docs: url.includes('/videos?') ? [{ ...video, title: 'Edited in the CMS' }] : [],
    }),
  )
  vi.stubGlobal('fetch', fetch)
  const { container } = await renderAt('/explore/videos')
  await waitFor(() =>
    expect(container.querySelector('.vfeat b')!.textContent).toBe('Edited in the CMS'),
  )
  expect(container.querySelector('.vfeat')!.getAttribute('data-p')).toBe(video.appId)
  expect(fetch).toHaveBeenCalledWith(
    'http://localhost:3000/api/videos?limit=100&depth=1&sort=createdAt',
  )
  vi.unstubAllGlobals()
})

test('VID-00: a topic chip filters the featured video and the grid', async () => {
  const { container } = await renderAt('/explore/videos')
  expect(container.querySelectorAll('.vlist .vcard')).toHaveLength(8)
  const chip = container.querySelector<HTMLElement>('[data-p="protection"]')!
  fireEvent.click(chip)
  expect(chip.getAttribute('aria-pressed')).toBe('true')
  expect(container.querySelector('.vfeat b')!.textContent).toBe('Protecting your family, simply')
  expect(container.querySelector('.vlist')).toBeNull()
  expect(container.querySelectorAll('.lv3')).toHaveLength(3)
})

test('VID-01: a video not filmed yet plays its opening caption', async () => {
  const { container } = await renderAt('/explore/videos/v3')
  expect(container.querySelector('.cc')).toBeNull()
  fireEvent.click(screen.getByLabelText('Play'))
  expect(container.querySelector('.player.vp2.on .cc')!.textContent).toMatch(/three to six months/)
  expect(container.querySelector('.vt2 b')!.textContent).toBe('Emergency fund')
  expect(container.querySelectorAll('.hstrip .vcard')).toHaveLength(3)
})

test('VID-01: a filmed video that cannot load shows Try again', async () => {
  const { container } = await renderAt('/explore/videos/v9')
  const video = container.querySelector('video')!
  expect(container.querySelector('track')).not.toBeNull()
  fireEvent.error(video)
  expect(video.hidden).toBe(true)
  expect((container.querySelector('#vid-fail') as HTMLElement).hidden).toBe(false)
})

test('goalForVideo: a pension video falls back to the retirement goal', () => {
  const retire = { kind: 'retire', spec: 'pension' } as Goal
  const home = { kind: 'home', spec: 'mortgage' } as Goal
  expect(goalForVideo([retire, home], 'mortgage')).toBe(home)
  expect(goalForVideo([retire, home], 'pension')).toBe(retire)
  expect(goalForVideo([home], 'protection')).toBeUndefined()
})

test('a topic page picked past the content shows its last situation and video', async () => {
  JOURNEY_PAGES.Loans.setState({ situation: 99, video: 99 })
  const { container } = render(<Body topic="Loans" />)
  await waitFor(() =>
    expect(container.querySelector('.mp-sit [aria-pressed="true"]')).not.toBeNull(),
  )
  const situations = container.querySelectorAll('.mp-sit button')
  expect(situations[situations.length - 1].getAttribute('aria-pressed')).toBe('true')
  expect(container.querySelector('#mp-player')!.children.length).toBe(1)
  resetJourneyPages()
  expect(JOURNEY_PAGES.Loans.getState()).toMatchObject({ situation: 0, video: 0, seats: {} })
})
