// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, expect, test } from 'vitest'
import { fresh } from '../../src/state/fresh.ts'
import { useStore } from '../../src/state/store.ts'
import * as Videos from '../../src/screens/Videos.screen.tsx'
import * as VideoPlayer from '../../src/screens/VideoPlayer.screen.tsx'
import { goalForVideo } from '../../src/domain/planning/goalForVideo.ts'
import type { Goal } from '../../src/state/types.ts'

beforeEach(() => useStore.getState().load({ ...fresh(), tab: 'explore', explorePages: [{ page: 'VIDS' }] }))

test('VID-00: a topic chip filters the featured video and the grid', () => {
  const { container } = render(<Videos.Body />)
  expect(container.querySelectorAll('.vlist .vcard')).toHaveLength(8)
  const chip = container.querySelector<HTMLElement>('[data-p="protection"]')!
  fireEvent.click(chip)
  expect(chip.getAttribute('aria-pressed')).toBe('true')
  expect(container.querySelector('.vfeat b')!.textContent).toBe('Protecting your family, simply')
  expect(container.querySelector('.vlist')).toBeNull()
  expect(container.querySelectorAll('.lv3')).toHaveLength(3)
})

test('VID-01: a video not filmed yet plays its opening caption', () => {
  const { container } = render(<VideoPlayer.Body param="v3" />)
  expect(container.querySelector('.cc')).toBeNull()
  fireEvent.click(screen.getByLabelText('Play'))
  expect(container.querySelector('.player.vp2.on .cc')!.textContent).toMatch(/three to six months/)
  expect(container.querySelector('.vt2 b')!.textContent).toBe('Emergency fund')
  expect(container.querySelectorAll('.hstrip .vcard')).toHaveLength(3)
})

test('VID-01: a filmed video that cannot load shows Try again', () => {
  const { container } = render(<VideoPlayer.Body param="v9" />)
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
