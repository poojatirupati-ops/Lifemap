import { useState, type KeyboardEvent } from 'react'

const STEP: Record<string, number> = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }

/** The chart's chosen year: a tap picks one, arrows step, Home and End jump to the ends. */
export function useChartKeys(count: number, defaultIndex: number) {
  const [chosen, setChosen] = useState<number | null>(null)
  const clamp = (index: number) => Math.max(0, Math.min(count - 1, index))
  const selected = clamp(chosen ?? defaultIndex)

  const onKeyDown = (event: KeyboardEvent) => {
    const { key } = event
    const next =
      key === 'Home' ? 0 : key === 'End' ? count - 1 : key in STEP ? selected + STEP[key] : null
    if (next == null) return
    event.preventDefault()
    setChosen(clamp(next))
  }

  return { selected, select: (index: number) => setChosen(clamp(index)), onKeyDown }
}
