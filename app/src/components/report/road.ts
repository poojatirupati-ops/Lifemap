// The road's geometry: the S-wave it follows and which side each milestone's label sits on.
import type { ReportData } from '../../report/model/reportData.ts'

type Milestone = ReportData['road']['milestones'][number]

// the wave as [share of the way along, height], eased between points (cubic Hermite)
const WAVE = [
  [0, 0],
  [0.21, 43],
  [0.43, -11],
  [0.61, -53],
  [0.74, -37],
  [1, 30],
]

export function waveHeight(along: number) {
  let i = 0
  while (i < WAVE.length - 2 && along > WAVE[i + 1][0]) i++
  const [before, from, to, after] = [i - 1, i, i + 1, i + 2].map(
    (index) => WAVE[Math.min(WAVE.length - 1, Math.max(0, index))],
  )
  const width = to[0] - from[0]
  const u = Math.max(0, Math.min(1, (along - from[0]) / width))
  const slopeFrom = ((to[1] - before[1]) / (to[0] - before[0])) * width
  const slopeTo = ((after[1] - from[1]) / (after[0] - from[0])) * width
  const u2 = u * u
  const u3 = u2 * u
  return (
    (2 * u3 - 3 * u2 + 1) * from[1] +
    (u3 - 2 * u2 + u) * slopeFrom +
    (-2 * u3 + 3 * u2) * to[1] +
    (u3 - u2) * slopeTo
  )
}

/** Milestones in age order; a label flips side when it would sit within 120px of the last one. */
export function placeMilestones(milestones: Milestone[], x: (age: number) => number) {
  let lastSide = ''
  let lastX = -999
  return milestones
    .toSorted((a, b) => a.age - b.age)
    .map((milestone) => {
      let side = milestone.side === 'below' ? 'below' : 'above'
      const mx = x(milestone.age)
      if (side === lastSide && Math.abs(mx - lastX) < 120)
        side = side === 'above' ? 'below' : 'above'
      lastSide = side
      lastX = mx
      return { ...milestone, above: side === 'above' }
    })
}

export const ROAD_TEXT = { fontFamily: 'Figtree,sans-serif', fontWeight: 800 }
