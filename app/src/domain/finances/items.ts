// The items in a list (each card, loan, pension and policy) and the statements read into them.
// Mutates (an immer draft); the totals in fin follow the items through normalize.
import { hasValue } from '../../lib/format.ts'
import type { ListItem } from '../../state/types.ts'
import type { FinanceBook } from './figures.ts'
import { LIST_FOR_FIELD, LISTS, type ListKey } from './lists.data.ts'

export const itemsOf = (book: Pick<FinanceBook, 'lists'>, list: string) =>
  ((book.lists ||= {})[list] ||= [])

export const itemHasDocument = (item: ListItem) => Object.values(item.src).includes('doc')
export const itemIsEmpty = (item: ListItem) => !Object.values(item.f).some(hasValue)

export function addItem(book: FinanceBook, list: string) {
  book.iid = (book.iid || 0) + 1
  const item: ListItem = { id: book.iid, f: {}, src: {}, conf: {}, man: {}, fix: {}, docFrom: null }
  itemsOf(book, list).push(item)
  return item
}

/** A typed item figure; a figure read from a statement stays and the entry is kept. */
export function typeItemField(item: ListItem, field: string, value: number | string | null) {
  const blank = !hasValue(value)
  if (item.src[field] === 'doc') {
    if (blank) delete item.man[field]
    else item.man[field] = { v: value, src: 'typed' }
    return
  }
  if (blank) {
    delete item.f[field]
    delete item.src[field]
  } else {
    item.f[field] = value!
    item.src[field] = 'typed'
  }
}

export function readItemField(
  item: ListItem,
  field: string,
  value: number | string,
  confidence: number | undefined,
  corrected: boolean,
  from?: string,
) {
  if (item.src[field] !== 'doc' && hasValue(item.f[field])) {
    item.man[field] = { v: item.f[field], src: item.src[field] }
  }
  item.f[field] = value
  item.src[field] = 'doc'
  if (confidence != null && !corrected) item.conf[field] = confidence
  else delete item.conf[field]
  if (corrected) item.fix[field] = true
  else delete item.fix[field]
  item.docFrom = from || item.docFrom || 'upl'
}

export function removeItemDocument(item: ListItem) {
  for (const field of Object.keys(item.src)) {
    if (item.src[field] !== 'doc') continue
    const typed = item.man[field]
    if (typed) {
      item.f[field] = typed.v as number | string
      item.src[field] = typed.src || 'typed'
    } else {
      delete item.f[field]
      delete item.src[field]
    }
    delete item.conf[field]
    delete item.fix[field]
    delete item.man[field]
  }
  item.docFrom = null
}

/** A total typed or read before lists existed becomes the list's first item. */
export function moveTotalsIntoList(book: FinanceBook, list: ListKey) {
  const totals: Record<string, string> | undefined = (
    LISTS[list] as { totals?: Record<string, string> }
  ).totals
  if (!totals || itemsOf(book, list).length) return
  const given = Object.entries(totals).filter(([, key]) => book.src[key] && hasValue(book.fin[key]))
  if (!given.length) return
  const item = addItem(book, list)
  for (const [field, key] of given) {
    item.f[field] = +book.fin[key]
    item.src[field] = book.src[key] === 'doc' ? 'doc' : 'typed'
    if (book.src[key] !== 'doc') continue
    if (book.conf[key] != null) item.conf[field] = book.conf[key]
    if (book.fix[key]) item.fix[field] = true
    if (book.man[key]) item.man[field] = book.man[key]
    item.docFrom = book.docOf[key] || item.docFrom || 'upl:earlier'
  }
}

/** Every list but other mortgages starts with one empty item, until the customer changes the list. */
export function addStarterItem(book: FinanceBook, list: string) {
  const touched = (book.lt ||= {})
  if (list === 'mort2' || itemsOf(book, list).length || touched[list]) return
  addItem(book, list)
}

/** Lists a list block shows: legacy totals moved in, and a starter item. */
export function prepareList(book: FinanceBook, list: ListKey) {
  moveTotalsIntoList(book, list)
  addStarterItem(book, list)
}

/** A total read from a statement goes into the item that statement filled, or the first fitting one. */
export function readListFigure(
  book: FinanceBook,
  key: string,
  value: number | string,
  confidence: number | undefined,
  corrected: boolean,
  from?: string,
) {
  const [list, field] = LIST_FOR_FIELD[key]
  moveTotalsIntoList(book, list)
  const items = itemsOf(book, list)
  let item =
    items.find((candidate) => candidate.docFrom === from) ||
    items.find((candidate) => !itemHasDocument(candidate) && !itemIsEmpty(candidate)) ||
    items.find((candidate) => !itemHasDocument(candidate)) ||
    items[0]
  if (!item) {
    item = addItem(book, list)
    item.fromDoc = true
  }
  readItemField(item, field, value, confidence, corrected, from)
  if (from) book.docOf[key] = from
}

export function removeListDocument(book: FinanceBook, key: string) {
  const [list] = LIST_FOR_FIELD[key]
  const from = book.docOf[key]
  for (const item of itemsOf(book, list)) {
    if (itemHasDocument(item) && (!from || item.docFrom === from)) removeItemDocument(item)
  }
  book.lists[list] = itemsOf(book, list).filter((item) => !(item.fromDoc && itemIsEmpty(item)))
  for (const record of [book.look, book.ack, book.fix, book.man, book.docOf, book.conf]) {
    delete record[key]
  }
}
