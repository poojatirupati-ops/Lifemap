// The journey road: each plan year's colour and where the road, the flags and the goal rings go.
import { livingShort, type YearRow } from '../../domain/planning/project'

export type Band = 'good' | 'nudge' | 'alert'

/** A goal's band from its covered percent: teal, gold or coral. */
export const band = (percent: number): Band =>
  percent >= 95 ? 'good' : percent >= 70 ? 'nudge' : 'alert'
export const BAND_WORDS: Record<Band, string> = {
  good: 'On track',
  nudge: 'Needs a nudge',
  alert: 'Needs attention',
}

type Year = Pick<YearRow, 'livingShortfall' | 'needs' | 'goalShort' | 'drawnFromSavings'>

export const isShortYear = (row: Year) => livingShort(row) || row.goalShort
/** Short of money, paid from savings, or covered by income. */
export const yearBand = (row: Year): Band =>
  isShortYear(row) ? 'alert' : row.drawnFromSavings > 1 ? 'nudge' : 'good'

export interface Milestone {
  id: number
  age: number
  name: string
}
export interface JourneyInputs<M extends Milestone> {
  ages: number[]
  /** index of the year retirement starts, or -1 */
  retireIndex: number
  milestones: M[]
  width: number
  landscape: boolean
  textWidth: (text: string, px: number) => number
}

interface Box {
  l: number
  t: number
  r: number
  b: number
}
const box = (l: number, t: number, r: number, b: number): Box => ({ l, t, r, b })
const overlaps = (a: Box, c: Box) => a.l < c.r && c.l < a.r && a.t < c.b && c.t < a.b
const shrink = (b: Box) => box(b.l + 3, b.t + 3, b.r - 3, b.b - 3)
const clamp = (v: number, low: number, high: number) => Math.max(low, Math.min(high, v))

/** Liang-Barsky: does the segment cross the box? */
function crosses(x1: number, y1: number, x2: number, y2: number, b: Box) {
  const dx = x2 - x1
  const dy = y2 - y1
  let t0 = 0
  let t1 = 1
  for (const [p, q] of [
    [-dx, x1 - b.l],
    [dx, b.r - x1],
    [-dy, y1 - b.t],
    [dy, b.b - y1],
  ]) {
    if (p === 0) {
      if (q < 0) return false
      continue
    }
    if (p < 0) t0 = Math.max(t0, q / p)
    else t1 = Math.min(t1, q / p)
    if (t0 > t1) return false
  }
  return true
}

/**
 * Milestones alternate above and below the road in age order, each on a leader from its age.
 * A ring steps out a tier and/or sideways until it clears the fixed marks and earlier rings.
 */
export function layoutJourney<M extends Milestone>(inputs: JourneyInputs<M>) {
  const { ages, retireIndex, width: W, landscape, textWidth } = inputs
  const n = ages.length
  const wide = W > 500
  const H = landscape ? 324 : wide ? 400 : 360
  const pad = 18
  const mid = landscape ? 162 : wide ? 196 : 176
  const amp = landscape ? 20 : wide ? 34 : 24
  const X = (i: number) => pad + (i / (n - 1)) * (W - 2 * pad)
  const Y = (i: number) => mid + amp * Math.sin((i / (n - 1)) * Math.PI * 2.4) - (i / (n - 1)) * 8
  const roadY = (x: number) => {
    const f = clamp(((x - pad) / (W - 2 * pad)) * (n - 1), 0, n - 1)
    const i = Math.floor(f)
    const j = Math.min(n - 1, i + 1)
    return Y(i) + (Y(j) - Y(i)) * (f - i)
  }
  const points = ages.map((_, i) => ({ x: X(i), y: Y(i) }))
  const start = points[0]
  // what milestones keep clear of; the "today" column does not count towards the crop
  const taken: Box[] = [box(start.x - 9, start.y - 9, start.x + 9, start.y + 9)]
  const todayColumn = box(start.x - 3, start.y, start.x + 3, H)
  taken.push(todayColumn)

  let flag = null
  if (retireIndex >= 0) {
    const { x, y } = points[retireIndex]
    const flipped = x > W - 90
    const label = `Retire ${ages[retireIndex]}`
    const lw = textWidth(label, 11)
    flag = { x, y, label, flipped }
    const right = flipped ? x + 27 : Math.max(x + 27, x + 4 + lw)
    taken.push(box(flipped ? x - 6 - lw : x - 3, y - 64, right, y - 6))
  }
  const sunset = { x: points[n - 1].x - 8, y: points[n - 1].y - 12 }
  taken.push(box(sunset.x - 2, sunset.y - 22, sunset.x + 26, sunset.y + 6))

  const R = wide ? 18 : 13
  const labelHeight = wide ? 15 : 0
  const first = R + (wide ? 12 : 10)
  const tier = 2 * R + labelHeight + 4 + (wide ? 2 : 4)
  const nudge = wide ? 22 : 16
  const far = 4 * (2 * R + 4)
  const reach = Math.ceil(W / nudge)
  const tries: { t: number; dx: number; cost: number }[] = []
  for (let t = 0; t < 6; t++)
    for (let s = -reach; s <= reach; s++)
      tries.push({
        t,
        dx: s * nudge,
        cost: t + Math.abs(s) / ((2 * R + 4) / nudge) + (s < 0 ? 0.35 : 0),
      })
  tries.sort((a, b) => a.cost - b.cost || a.t - b.t)

  const leaders: number[][] = []
  const placed = inputs.milestones.map((milestone, k) => {
    const i = clamp(milestone.age - ages[0], 0, n - 1)
    const { x: cx, y: cy } = points[i]
    const up = k % 2 === 0
    const name = milestone.name.length > 20 ? milestone.name.slice(0, 19) + '…' : milestone.name
    const lw = wide ? textWidth(name, 11) : 0
    const fit = (pass: number) => {
      for (const { t, dx } of tries) {
        const x = cx + dx
        if (x - R < 2 || x + R > W - 2 || (pass < 2 && Math.abs(dx) > far)) continue
        let edge = cy
        for (let xx = x - R - 4; xx <= x + R + 4; xx += 4)
          edge = up ? Math.min(edge, roadY(xx)) : Math.max(edge, roadY(xx))
        const y = up ? edge - first - t * tier : edge + first + t * tier
        const labelX = wide ? clamp(x, lw / 2 + 2, W - lw / 2 - 2) : x
        const labelY = up ? y - R - 5 : y + R + 14
        const boxes = [box(x - R - 2, y - R - 2, x + R + 2, y + R + 2)]
        if (wide)
          boxes.push(
            up
              ? box(labelX - lw / 2, y - R - labelHeight - 3, labelX + lw / 2, y - R - 1)
              : box(labelX - lw / 2, y + R + 1, labelX + lw / 2, y + R + labelHeight + 3),
          )
        if (boxes.some((b) => b.t < 4 || b.b > H - 20)) continue
        if (boxes.some((b) => taken.some((o) => overlaps(b, o)))) continue
        const end = up ? y + R : y - R
        const cutsRing = taken.some((o) => crosses(cx, cy, x, end, shrink(o)))
        const cutByLeader = leaders.some(([x1, y1, x2, y2]) =>
          boxes.some((b) => crosses(x1, y1, x2, y2, shrink(b))),
        )
        if (pass === 0 && (cutsRing || cutByLeader)) continue
        return { x, y, labelX, labelY, boxes, end }
      }
    }
    const y = up ? cy - first : cy + first
    const fallback = {
      x: cx,
      y,
      labelX: cx,
      labelY: up ? y - R - 5 : y + R + 14,
      boxes: [],
      end: y,
    }
    const ring = fit(0) ?? fit(1) ?? fit(2) ?? fallback
    taken.push(...ring.boxes)
    leaders.push([cx, cy, ring.x, ring.end])
    return { milestone, cx, cy, name, ...ring }
  })

  // crop to what is drawn, so a quiet road stays compact and a busy one gets the height it needs
  let top = Math.min(...points.map((p) => p.y)) - 12
  let bottom = Math.max(...points.map((p) => p.y)) + 12
  for (const b of taken)
    if (b !== todayColumn) {
      top = Math.min(top, b.t)
      bottom = Math.max(bottom, b.b)
    }
  top = Math.floor(top - 4)
  bottom = Math.ceil(bottom + (wide ? 22 : 32))
  // "You, today" sits on the age axis under the start, so an age label must clear it
  const todayWidth = textWidth(wide ? 'You, today' : 'today', 11)
  const decades = points
    .map((p, i) => ({ x: p.x, age: ages[i] }))
    .filter(
      ({ x, age }) =>
        age % 10 === 0 && x - textWidth(`age ${age}`, 10.5) / 2 > start.x - 4 + todayWidth,
    )
  return { wide, width: W, top, bottom, R, points, start, flag, sunset, placed, decades }
}
