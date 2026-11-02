// Where a finance figure comes from: a statement beats anything typed (spec §15). A typed entry
// over a statement figure is kept, so removing the statement brings it back.
// The functions mutate (an immer draft); list totals are refreshed afterwards by normalize.
import { euro, hasValue } from '../../lib/format.ts'
import type { ListItem, ManualValue, Plan, Provenance } from '../../state/types.ts'
import { LIST_FOR_FIELD } from './lists.data.ts'
import { readListFigure, removeListDocument } from './items.ts'

export type FinanceBook = Pick<
  Plan,
  'figures' | 'sources' | 'confidence' | 'warnings' | 'acknowledged' | 'manual' | 'fixed' | 'documentOf' | 'lists' | 'nextItemId' | 'listsChanged'
>

/** One set of figures with where each came from: the plan's totals, or one list item. */
export interface Figures {
  values: Record<string, unknown>
  sources: Record<string, Provenance>
  typed: Record<string, ManualValue>
  conf: Record<string, number>
  fix: Record<string, boolean>
}

/** A figure read from a statement; `corrected`: the customer changed what we read. */
export interface Reading {
  value: number | string
  confidence?: number
  corrected: boolean
  from?: string
}

export const planFigures = (book: FinanceBook): Figures => ({
  values: book.figures,
  sources: book.sources,
  typed: book.manual,
  conf: book.confidence,
  fix: book.fixed,
})

export const itemFigures = (item: ListItem): Figures => ({
  values: item.fields,
  sources: item.sources,
  typed: item.manual,
  conf: item.confidence,
  fix: item.fixed,
})

/** Returns false when a statement figure stays in use (the typed one is kept for later). */
export function typeInto(figures: Figures, key: string, value: unknown, source: Provenance) {
  if (figures.sources[key] === 'doc') {
    if (hasValue(value)) figures.typed[key] = { value: value, source: source }
    else delete figures.typed[key]
    return false
  }
  if (hasValue(value)) {
    figures.values[key] = value
    figures.sources[key] = source
  } else {
    delete figures.values[key]
    delete figures.sources[key]
  }
  return true
}

export function readInto(figures: Figures, key: string, { value, confidence, corrected }: Reading) {
  const { values, sources, typed, conf, fix } = figures
  if (sources[key] && sources[key] !== 'doc' && hasValue(values[key])) {
    typed[key] = { value: values[key], source: sources[key] }
  }
  values[key] = value
  sources[key] = 'doc'
  if (confidence != null && !corrected) conf[key] = confidence
  else delete conf[key]
  if (corrected) fix[key] = true
  else delete fix[key]
}

/** The statement's figure goes; what the customer typed before comes back. */
export function unreadFrom(figures: Figures, key: string) {
  const { values, sources, typed, conf, fix } = figures
  const before = typed[key]
  if (before) {
    values[key] = before.value
    sources[key] = before.source ?? 'typed'
  } else {
    delete values[key]
    delete sources[key]
  }
  delete conf[key]
  delete fix[key]
  delete typed[key]
}

export const isFromStatement = (book: Pick<Plan, 'sources'>, key: string) => book.sources[key] === 'doc'

/** A figure the customer typed or picked; a statement figure stays in use. */
export function typeFigure(
  book: FinanceBook,
  key: string,
  value: unknown,
  source: Provenance = 'typed',
) {
  if (typeInto(planFigures(book), key, value, source)) delete book.warnings[key]
}

export function readFigure(book: FinanceBook, key: string, reading: Reading) {
  if (LIST_FOR_FIELD[key]) return readListFigure(book, key, reading)
  readInto(planFigures(book), key, reading)
  if (reading.from) book.documentOf[key] = reading.from
}

/** Removes statement figures; what the customer typed before comes back. */
export function removeStatementFigures(book: FinanceBook, keys: string[]) {
  for (const key of keys) {
    if (LIST_FOR_FIELD[key]) removeListDocument(book, key)
    else if (isFromStatement(book, key)) {
      unreadFrom(planFigures(book), key)
      delete book.warnings[key]
      delete book.acknowledged[key]
      delete book.documentOf[key]
    }
  }
}

/** "You typed €3,000. Your statement says €3,100; we're using that." or '' */
export function statementWinsNote(
  { values, sources, typed }: Figures,
  key: string,
  isEuro: boolean,
) {
  const before = typed[key]
  const used = values[key]
  if (sources[key] !== 'doc' || !before || String(before.value) === String(used)) return ''
  const show = (value: unknown) => (isEuro ? euro(Number(value)) : String(value))
  return `You typed ${show(before.value)}. Your statement says ${show(used)}; we're using that.`
}
