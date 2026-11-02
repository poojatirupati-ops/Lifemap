import { useState, type KeyboardEvent } from 'react'

const STEP: Partial<Record<string, number>> = {
  ArrowRight: 1,
  ArrowUp: 1,
  ArrowLeft: -1,
  ArrowDown: -1,
}

/** The chart's chosen year: a tap picks one, arrows step, Home and End jump to the ends. */
export function useChartKeys(count: number, defaultIndex: number) {
  const [chosen, setChosen] = useState<number | null>(null)
  const clamp = (index: number) => Math.max(0, Math.min(count - 1, index))
  const selected = clamp(chosen ?? defaultIndex)

  const onKeyDown = (event: KeyboardEvent) => {
    const step = STEP[event.key]
    if (event.key === 'Home') setChosen(0)
    else if (event.key === 'End') setChosen(count - 1)
    else if (step != null) setChosen(clamp(selected + step))
    else return
    event.preventDefault()
  }

  return { selected, select: (index: number) => setChosen(clamp(index)), onKeyDown }
}
