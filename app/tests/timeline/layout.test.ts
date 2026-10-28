import { expect, test } from 'vitest'
import { axisMarks, layoutTimeline } from '../../src/components/timeline/layout.ts'

const chip = (id: number, age: number, width = 100) => ({ id, age, width, height: 36 })
const board = { ageNow: 38, width: 520, landscape: false, visibleHeight: 0 }

test('chips at the same age stack in lanes, later chips higher up', () => {
  const { chips, axisY, height } = layoutTimeline({ ...board, chips: [chip(1, 40), chip(2, 40)] })
  expect(chips.map((c) => c.top)).toEqual([60, 10])
  expect(axisY).toBe(10 + 2 * 50 + 12)
  expect(height).toBe(axisY + 46)
})

test('chips far apart share one lane; an edge chip is pushed in and keeps a link to its age', () => {
  const { chips } = layoutTimeline({ ...board, chips: [chip(1, 39), chip(2, 90)] })
  expect(chips.map((c) => c.top)).toEqual([10, 10])
  expect(chips[1]).toMatchObject({ left: 420, ageX: 520, stemX: 510 })
  expect(chips[0].ageX).toBeNull()
})

test('a landscape phone caps the lanes and slides crowded chips right', () => {
  const crowd = [1, 2, 3, 4].map((id) => chip(id, 50, 60))
  const { chips } = layoutTimeline({ ...board, chips: crowd, landscape: true, visibleHeight: 140 })
  expect(new Set(chips.map((c) => c.top)).size).toBe(2)
  expect(chips[2].left).toBeGreaterThan(chips[0].left)
})

test('axis marks every five years, labelled every ten where they fit', () => {
  const marks = axisMarks(38, 520)
  expect(marks[0].age).toBe(40)
  expect(marks.filter((m) => m.labelled).map((m) => m.age)).toEqual([50, 60, 70, 80])
})
