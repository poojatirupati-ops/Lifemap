// Axis-aligned boxes and the segment test the journey layout places labels with.

export interface Box {
  left: number
  top: number
  right: number
  bottom: number
}
export type Segment = [x1: number, y1: number, x2: number, y2: number]

export const box = (left: number, top: number, right: number, bottom: number): Box => ({
  left,
  top,
  right,
  bottom,
})

export const overlaps = (a: Box, b: Box) =>
  a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom

export const inset = (b: Box, by: number) =>
  box(b.left + by, b.top + by, b.right - by, b.bottom - by)

/** Liang-Barsky: does the segment cross the box? */
export function crosses([x1, y1, x2, y2]: Segment, b: Box) {
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
