// The journey road: where the road, the flags and the goal rings go.
import { clamp } from '../../lib/clamp'
import type { Goal } from '../../state/types'

/** An axis-aligned box the layout places labels with. */
interface Box {
  left: number
  top: number
  right: number
  bottom: number
}
type Segment = [x1: number, y1: number, x2: number, y2: number]

const box = (left: number, top: number, right: number, bottom: number): Box => ({
  left,
  top,
  right,
  bottom,
})

const overlaps = (a: Box, b: Box) =>
  a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom

const inset = (b: Box, by: number) =>
  box(b.left + by, b.top + by, b.right - by, b.bottom - by)

/** Liang-Barsky: does the segment cross the box? */
function crosses([x1, y1, x2, y2]: Segment, b: Box) {
  const dx = x2 - x1
  const dy = y2 - y1
  let enter = 0
  let leave = 1
  for (const [p, q] of [
    [-dx, x1 - b.left],
    [dx, b.right - x1],
    [-dy, y1 - b.top],
    [dy, b.bottom - y1],
  ]) {
    if (p === 0) {
      if (q < 0) return false
      continue
    }
    if (p < 0) enter = Math.max(enter, q / p)
    else leave = Math.min(leave, q / p)
    if (enter > leave) return false
  }
  return true
}

let context: CanvasRenderingContext2D | null | undefined

/** A character-count guess, where there is no canvas to measure with. */
const estimate = (text: string, px: number) => text.length * px * 0.62 + 4

function canvasContext() {
  try {
    context ??= document.createElement('canvas').getContext('2d')
  } catch {
    context = null
  }
  return context
}

/** Width of a bold label in the font rendering now. */
function textWidth(text: string, px: number) {
  const canvas = canvasContext()
  if (!canvas) return estimate(text, px)
  canvas.font = `700 ${px}px Figtree, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`
  return canvas.measureText(text).width * 1.06 + 4
}

interface Point {
  x: number
  y: number
}

/** Where a ring may go relative to its year: tiers out from the road and steps sideways, cheapest first. */
function candidateOffsets(ringRadius: number, nudge: number, width: number) {
  const reach = Math.ceil(width / nudge)
  const ringStep = (2 * ringRadius + 4) / nudge
  const offsets: { tierIndex: number; dx: number; cost: number }[] = []
  for (let tierIndex = 0; tierIndex < 6; tierIndex++)
    for (let step = -reach; step <= reach; step++)
      offsets.push({
        tierIndex,
        dx: step * nudge,
        cost: tierIndex + Math.abs(step) / ringStep + (step < 0 ? 0.35 : 0),
      })
  return offsets.toSorted((a, b) => a.cost - b.cost || a.tierIndex - b.tierIndex)
}

/** What ring placement reads, and the marks and leaders it adds as it goes. */
function roadFor(
  width: number,
  height: number,
  wide: boolean,
  roadY: (x: number) => number,
  taken: Box[],
) {
  const ringRadius = wide ? 18 : 13
  const labelHeight = wide ? 15 : 0
  return {
    width,
    height,
    wide,
    ringRadius,
    labelHeight,
    /** gap from the road to the first tier, and between tiers */
    first: ringRadius + (wide ? 12 : 10),
    tier: 2 * ringRadius + labelHeight + 4 + (wide ? 2 : 4),
    /** furthest sideways a ring goes before the last resort */
    far: 4 * (2 * ringRadius + 4),
    roadY,
    offsets: candidateOffsets(ringRadius, wide ? 22 : 16, width),
    taken,
    leaders: [] as Segment[],
  }
}
type Road = ReturnType<typeof roadFor>
interface RingSpec {
  anchorX: number
  anchorY: number
  up: boolean
  labelWidth: number
}
interface PlaceOptions {
  /** stay within `far` of the ring's year */
  nearOnly?: boolean
  /** the leader may not cut a mark, nor an earlier leader cut this ring */
  avoidLeaders?: boolean
}

/** Where a ring's name sits: above an upper ring, below a lower one. */
const labelYFor = (y: number, up: boolean, radius: number) =>
  up ? y - radius - 5 : y + radius + 14

/** The cheapest spot for a ring (and its label) that clears everything already taken. */
function placeRing(road: Road, spec: RingSpec, { nearOnly, avoidLeaders }: PlaceOptions) {
  const { width, height, wide, ringRadius: radius, labelHeight, taken, leaders } = road
  const { anchorX, anchorY, up, labelWidth } = spec
  for (const { tierIndex, dx } of road.offsets) {
    const x = anchorX + dx
    if (x - radius < 2 || x + radius > width - 2) continue
    if (nearOnly && Math.abs(dx) > road.far) continue
    let edge = anchorY
    for (let sampleX = x - radius - 4; sampleX <= x + radius + 4; sampleX += 4)
      edge = up ? Math.min(edge, road.roadY(sampleX)) : Math.max(edge, road.roadY(sampleX))
    const offset = road.first + tierIndex * road.tier
    const y = up ? edge - offset : edge + offset
    const labelX = wide ? clamp(x, labelWidth / 2 + 2, width - labelWidth / 2 - 2) : x
    const labelY = labelYFor(y, up, radius)
    const boxes = [box(x - radius - 2, y - radius - 2, x + radius + 2, y + radius + 2)]
    if (wide) {
      const left = labelX - labelWidth / 2
      const right = labelX + labelWidth / 2
      boxes.push(
        up
          ? box(left, y - radius - labelHeight - 3, right, y - radius - 1)
          : box(left, y + radius + 1, right, y + radius + labelHeight + 3),
      )
    }
    if (boxes.some((b) => b.top < 4 || b.bottom > height - 20)) continue
    if (boxes.some((b) => taken.some((other) => overlaps(b, other)))) continue
    const end = up ? y + radius : y - radius
    if (avoidLeaders) {
      const leader: Segment = [anchorX, anchorY, x, end]
      if (taken.some((other) => crosses(leader, inset(other, 3)))) continue
      if (leaders.some((other) => boxes.some((b) => crosses(other, inset(b, 3))))) continue
    }
    return { x, y, labelX, labelY, boxes, end }
  }
}

/** The last resort: straight off the road, overlaps and all. */
function besideRoad(x: number, y: number, up: boolean, radius: number) {
  return { x, y, labelX: x, labelY: labelYFor(y, up, radius), boxes: [] as Box[], end: y }
}

/** Crop to what is drawn, so a quiet road stays compact and a busy one gets the height it needs. */
function cropBounds(points: Point[], taken: Box[]) {
  const ys = points.map((p) => p.y)
  return {
    top: Math.min(Math.min(...ys) - 12, ...taken.map((b) => b.top)),
    bottom: Math.max(Math.max(...ys) + 12, ...taken.map((b) => b.bottom)),
  }
}

/** The decade ages on the axis; "You, today" sits under the start, so a label must clear it. */
function ageTicks(points: Point[], ages: number[], wide: boolean) {
  const todayEnd = points[0].x - 4 + textWidth(wide ? 'You, today' : 'today', 11)
  return points
    .map((p, i) => ({ x: p.x, age: ages[i] }))
    .filter(({ x, age }) => age % 10 === 0 && x - textWidth(`age ${age}`, 10.5) / 2 > todayEnd)
}

/**
 * Milestones alternate above and below the road in age order, each on a leader from its age.
 * A ring steps out a tier and/or sideways until it clears the fixed marks and earlier rings.
 */
export function layoutJourney(inputs: {
  ages: number[]
  /** index of the year retirement starts, or -1 */
  retireIndex: number
  milestones: Goal[]
  width: number
  landscape: boolean
}) {
  const { ages, retireIndex, width, landscape } = inputs
  const lastIndex = ages.length - 1
  const wide = width > 500
  const height = landscape ? 324 : wide ? 400 : 360
  const pad = 18
  const middle = landscape ? 162 : wide ? 196 : 176
  const wave = landscape ? 20 : wide ? 34 : 24
  const xAt = (i: number) => pad + (i / lastIndex) * (width - 2 * pad)
  const yAt = (i: number) =>
    middle + wave * Math.sin((i / lastIndex) * Math.PI * 2.4) - (i / lastIndex) * 8
  const roadY = (x: number) => {
    const at = clamp(((x - pad) / (width - 2 * pad)) * lastIndex, 0, lastIndex)
    const i = Math.floor(at)
    const next = Math.min(lastIndex, i + 1)
    return yAt(i) + (yAt(next) - yAt(i)) * (at - i)
  }
  const points = ages.map((_, i) => ({ x: xAt(i), y: yAt(i) }))
  const start = points[0]
  // what milestones keep clear of; the "today" column does not count towards the crop
  const marks = [box(start.x - 9, start.y - 9, start.x + 9, start.y + 9)]
  const todayColumn = box(start.x - 3, start.y, start.x + 3, height)

  let flag = null
  if (retireIndex >= 0) {
    const { x, y } = points[retireIndex]
    const flipped = x > width - 90
    const label = `Retire ${ages[retireIndex]}`
    const labelWidth = textWidth(label, 11)
    flag = { x, y, label, flipped }
    const right = flipped ? x + 27 : Math.max(x + 27, x + 4 + labelWidth)
    marks.push(box(flipped ? x - 6 - labelWidth : x - 3, y - 64, right, y - 6))
  }
  const sunset = { x: points[lastIndex].x - 8, y: points[lastIndex].y - 12 }
  marks.push(box(sunset.x - 2, sunset.y - 22, sunset.x + 26, sunset.y + 6))

  const road = roadFor(width, height, wide, roadY, [...marks, todayColumn])
  const { ringRadius } = road

  const placed = inputs.milestones.map((milestone, order) => {
    const index = clamp(milestone.age - ages[0], 0, lastIndex)
    const { x: anchorX, y: anchorY } = points[index]
    const up = order % 2 === 0
    const name = milestone.name.length > 20 ? milestone.name.slice(0, 19) + '…' : milestone.name
    const spec = { anchorX, anchorY, up, labelWidth: wide ? textWidth(name, 11) : 0 }
    const ring =
      placeRing(road, spec, { avoidLeaders: true, nearOnly: true }) ??
      placeRing(road, spec, { nearOnly: true }) ??
      placeRing(road, spec, {}) ??
      besideRoad(anchorX, up ? anchorY - road.first : anchorY + road.first, up, ringRadius)
    road.taken.push(...ring.boxes)
    road.leaders.push([anchorX, anchorY, ring.x, ring.end])
    return { milestone, anchorX, anchorY, name, ...ring }
  })

  const crop = cropBounds(
    points,
    road.taken.filter((b) => b !== todayColumn),
  )
  return {
    wide,
    width,
    top: Math.floor(crop.top - 4),
    bottom: Math.ceil(crop.bottom + (wide ? 22 : 32)),
    ringRadius,
    points,
    start,
    flag,
    sunset,
    placed,
    decades: ageTicks(points, ages, wide),
  }
}
