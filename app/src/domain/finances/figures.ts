// Where a finance figure comes from: a statement beats anything typed (spec §15). A typed entry
// over a statement figure is kept, so removing the statement brings it back.
// The functions mutate (an immer draft); list totals are refreshed afterwards by normalize.
import { euro } from '../../lib/format.ts'
import type { ManualValue, Plan, Provenance } from '../../state/types.ts'
import { LIST_FOR_FIELD } from './lists.data.ts'
import { readListFigure, removeListDocument, addItem } from './items.ts'

// TODO(R-19): iid (last item id) and lt (lists the customer has added to or removed from) belong in types.ts
export type FinanceBook = Pick<
  Plan,
  'fin' | 'src' | 'conf' | 'look' | 'ack' | 'man' | 'fix' | 'docOf' | 'lists'
> & { iid?: number; lt?: Record<string, boolean> }

const isBlank = (value: unknown) => value == null || value === ''
export const isFromStatement = (book: Pick<Plan, 'src'>, key: string) => book.src[key] === 'doc'

/** A figure the customer typed or picked. Returns false when a statement figure stays in use. */
export function typeFigure(
  book: FinanceBook,
  key: string,
  value: unknown,
  source: Provenance = 'typed',
) {
  if (isFromStatement(book, key)) {
    if (isBlank(value)) delete book.man[key]
    else book.man[key] = { v: value, src: source }
    return false
  }
  if (isBlank(value)) {
    delete book.fin[key]
    delete book.src[key]
  } else {
    book.fin[key] = value
    book.src[key] = source
  }
  delete book.look[key]
  return true
}

/** A figure read from a statement. `corrected`: the customer changed what we read. */
export function readFigure(
  book: FinanceBook,
  key: string,
  value: number | string,
  confidence: number | undefined,
  corrected: boolean,
  from?: string,
) {
  if (LIST_FOR_FIELD[key]) return readListFigure(book, key, value, confidence, corrected, from)
  if (!isFromStatement(book, key) && book.src[key] && !isBlank(book.fin[key])) {
    book.man[key] = { v: book.fin[key], src: book.src[key] }
  }
  book.fin[key] = value
  book.src[key] = 'doc'
  if (confidence != null && !corrected) book.conf[key] = confidence
  else delete book.conf[key]
  if (corrected) book.fix[key] = true
  else delete book.fix[key]
  if (from) book.docOf[key] = from
}

/** Removes statement figures; what the customer typed before comes back. */
export function removeStatementFigures(book: FinanceBook, keys: string[]) {
  for (const key of keys) {
    if (LIST_FOR_FIELD[key]) {
      removeListDocument(book, key)
      continue
    }
    if (!isFromStatement(book, key)) continue
    const typed = book.man[key]
    if (typed) {
      book.fin[key] = typed.v
      if (typed.src) book.src[key] = typed.src
      else delete book.src[key]
    } else {
      delete book.fin[key]
      delete book.src[key]
    }
    for (const record of [book.conf, book.look, book.ack, book.fix, book.man, book.docOf]) {
      delete record[key]
    }
  }
}

/** "You typed €3,000. Your statement says €3,100; we're using that." or '' */
export function statementWinsNote(
  fromStatement: boolean,
  typed: ManualValue | undefined,
  used: unknown,
  isEuro: boolean,
) {
  if (!fromStatement || !typed || String(typed.v) === String(used)) return ''
  const show = (value: unknown) => (isEuro ? euro(Number(value)) : String(value))
  return `You typed ${show(typed.v)}. Your statement says ${show(used)}; we're using that.`
}

/**
 * "Do you have a mortgage?" follows Your home: Yes = Own with mortgage, No = Own outright. Renting
 * or living with family, Yes means a mortgage on another property, so one is added below.
 * Returns false when a statement says how they own their home.
 */
export function answerMortgage(book: FinanceBook, answer: 'Yes' | 'No') {
  const home = book.fin.home
  const forgetAnswer = () => {
    delete book.fin.mortYN
    delete book.src.mortYN
  }
  if (answer === 'Yes') {
    if (!home || home === 'Own outright') {
      const used = typeFigure(book, 'home', 'Own with mortgage')
      if (used) forgetAnswer()
      return used
    }
    if (home === 'Own with mortgage') return true
    book.fin.mortYN = 'Yes'
    book.src.mortYN = 'typed'
    if (!book.lists.mort2?.length) {
      ;(book.lt ||= {}).mort2 = true
      addItem(book, 'mort2')
    }
    return true
  }
  let used = true
  if (home === 'Own with mortgage') used = typeFigure(book, 'home', 'Own outright')
  else {
    book.fin.mortYN = 'No'
    book.src.mortYN = 'typed'
  }
  if (used && /^Own/.test(book.fin.home || '')) forgetAnswer()
  return used
}
