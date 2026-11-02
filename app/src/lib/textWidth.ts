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
export function textWidth(text: string, px: number) {
  const canvas = canvasContext()
  if (!canvas) return estimate(text, px)
  canvas.font = `700 ${px}px Figtree, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`
  return canvas.measureText(text).width * 1.06 + 4
}
