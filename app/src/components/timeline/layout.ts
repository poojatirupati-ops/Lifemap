// Where the timeline chips sit: x by age, stacked in lanes so chips never overlap.

export const LAST_AGE = 90
const LANE_HEIGHT = 50
const LANE_HEIGHT_LANDSCAPE = 36
const GAP = 6

export interface ChipSize {
  id: number
  age: number
  width: number
  height: number
}

export interface PlacedChip {
  id: number
  left: number
  top: number
  width: number
  /** The dashed stem from the chip down to the axis. */
  stemX: number
  stemTop: number
  stemHeight: number
  /** A chip pushed sideways from its age keeps a dashed link and a pin at the exact age. */
  ageX: number | null
}

interface Board {
  chips: ChipSize[]
  ageNow: number
  width: number
  landscape: boolean
  /** Height left for the board on a landscape phone; lanes are capped to fit it. */
  visibleHeight: number
}

export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value))

export const ageToX = (age: number, ageNow: number, width: number) =>
  ((age - ageNow) / (LAST_AGE - ageNow)) * width

export const laneHeight = (landscape: boolean) => (landscape ? LANE_HEIGHT_LANDSCAPE : LANE_HEIGHT)

export function layoutTimeline({ chips, ageNow, width, landscape, visibleHeight }: Board) {
  const height = laneHeight(landscape)
  const maxLanes = landscape
    ? Math.max(2, Math.floor((visibleHeight - 22 - 46) / height))
    : Infinity
  // lanes[n] is the right edge of the last chip in lane n
  const lanes: number[] = []

  const sorted = chips
    .map((chip) => ({ ...chip, x: ageToX(chip.age, ageNow, width) }))
    .sort((a, b) => a.x - b.x || a.id - b.id)

  const laned = sorted.map((chip) => {
    let left = clamp(chip.x, chip.width / 2, width - chip.width / 2) - chip.width / 2
    let lane = 0
    while (lane < lanes.length && left < lanes[lane] + GAP) lane++
    if (lane >= maxLanes) {
      // crowded landscape board: slide right in the emptiest lane
      lane = lanes.indexOf(Math.min(...lanes))
      left = Math.min(lanes[lane] + GAP, width - chip.width)
    }
    lanes[lane] = Math.max(lanes[lane] ?? -Infinity, left + chip.width)
    return { ...chip, left, lane }
  })

  const laneCount = Math.max(1, lanes.length)
  const axisY = 10 + laneCount * height + 12

  const placed: PlacedChip[] = laned.map((chip) => {
    const top = 10 + (laneCount - 1 - chip.lane) * height
    const stemX = clamp(chip.x, chip.left + 10, chip.left + chip.width - 10)
    const pushed = stemX !== chip.x
    return {
      id: chip.id,
      left: chip.left,
      top,
      width: chip.width,
      stemX,
      stemTop: top + chip.height,
      stemHeight: Math.max(0, axisY - top - chip.height - (pushed ? 6 : 0)),
      ageX: pushed ? chip.x : null,
    }
  })

  return { chips: placed, axisY, height: axisY + 46 }
}

/** Five-year marks from now to 90; every ten years is labelled where it fits. */
export function axisMarks(ageNow: number, width: number) {
  const marks = []
  for (let age = Math.ceil(ageNow / 5) * 5; age <= LAST_AGE; age += 5) {
    const x = ageToX(age, ageNow, width)
    marks.push({ age, x, labelled: age % 10 === 0 && x > 34 && x < width - 18 })
  }
  return marks
}
