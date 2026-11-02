import type { FocusEvent } from 'react'
import { readEntry } from '../../domain/planning/partnerFigure.ts'
import type { Standard, StandardKey } from '../../domain/planning/settings.data.ts'
import { useSettings } from '../../state/settings.ts'
import { refusedText } from './partnerFigure.ts'

/** Blur handler: takes a changed partner figure (item = one rate of a list); a refused one is undone. */
export function takeEntry(key: StandardKey, standard: Standard, shown: string, item?: number) {
  return (event: FocusEvent<HTMLInputElement>) => {
    const input = event.target
    if (input.value === shown) return
    const entry = readEntry(key, standard, input.value, item)
    const { setPartnerFigure, refuse } = useSettings.getState()
    if ('figure' in entry) {
      setPartnerFigure(key, entry.figure)
      return
    }
    input.value = shown
    refuse(key, refusedText(key, standard.unit))
  }
}
