// The items in a list (each card, loan, pension and policy) and the statements read into them.
// Mutates (an immer draft); the totals in fin follow the items through normalize.
import { hasValue } from '../../lib/format.ts'
import type { ListItem } from '../../state/types.ts'
import {
  itemFigures,
  readInto,
  typeInto,
  unreadFrom,
  type FinanceBook,
  type Reading,
} from './figures.ts'
import { isPolicyList, LIST_FOR_FIELD, LISTS, listOf, type ListKey } from './lists.data.ts'

export const itemsOf = (book: Pick<FinanceBook, 'lists'>, list: string): ListItem[] =>
  book.lists[list] ?? []

export const itemHasDocument = (item: ListItem) => Object.values(item.sources).includes('doc')
export const itemIsEmpty = (item: ListItem) => !Object.values(item.fields).some(hasValue)

export function addItem(book: FinanceBook, list: string) {
  book.nextItemId = (book.nextItemId ?? 0) + 1
  const item: ListItem = { id: book.nextItemId, fields: {}, sources: {}, confidence: {}, manual: {}, fixed: {}, docFrom: null }
  ;(book.lists[list] ??= []).push(item)
  return item
}

/** A typed item figure; a figure read from a statement stays and the entry is kept. */
export function typeItemField(item: ListItem, field: string, value: number | string | null) {
  typeInto(itemFigures(item), field, value, 'typed')
}

export function readItemField(item: ListItem, field: string, reading: Reading) {
  readInto(itemFigures(item), field, reading)
  item.docFrom = reading.from || item.docFrom || 'upl'
}

export function removeItemDocument(item: ListItem) {
  for (const field of Object.keys(item.sources)) {
    if (item.sources[field] === 'doc') unreadFrom(itemFigures(item), field)
  }
  item.docFrom = null
}

/** A total typed or read before lists existed becomes the list's first item. */
function moveTotalsIntoList(book: FinanceBook, list: ListKey) {
  const totals = listOf(list).totals
  if (!totals || itemsOf(book, list).length) return
  const given = Object.entries(totals).filter(([, key]) => book.sources[key] && hasValue(book.figures[key]))
  if (!given.length) return
  const item = addItem(book, list)
  for (const [field, key] of given) {
    const fromStatement = book.sources[key] === 'doc'
    item.fields[field] = +book.figures[key]
    item.sources[field] = fromStatement ? 'doc' : 'typed'
    if (!fromStatement) continue
    if (book.confidence[key] != null) item.confidence[field] = book.confidence[key]
    if (book.fixed[key]) item.fixed[field] = true
    if (book.manual[key]) item.manual[field] = book.manual[key]
    item.docFrom = book.documentOf[key] || item.docFrom || 'upl:earlier'
  }
}

/**
 * Before a list shows: totals from before lists existed move in, and every list but other
 * mortgages starts with one empty item, until the customer changes the list.
 */
export function prepareList(book: FinanceBook, list: ListKey) {
  moveTotalsIntoList(book, list)
  const touched = (book.listsChanged ??= {})
  if (list === 'mort2' || itemsOf(book, list).length || touched[list]) return
  addItem(book, list)
}

const SECTION_LISTS: Record<string, ListKey[]> = {
  liab: ['mort2', 'cards', 'loans'],
  pension: ['pens'],
}
const POLICIES = Object.keys(LISTS).filter(isPolicyList)

/** The lists a section shows: its own, and in Protection the policies of each cover said Yes to. */
export function prepareSectionLists(book: FinanceBook, section: string) {
  const covers = section === 'prot' ? POLICIES.filter((cover) => book.figures[cover] === 'Yes') : []
  for (const list of [...(SECTION_LISTS[section] ?? []), ...covers]) prepareList(book, list)
}

/** A total read from a statement goes into the item that statement filled, or the first fitting one. */
export function readListFigure(book: FinanceBook, key: string, reading: Reading) {
  const [list, field] = LIST_FOR_FIELD[key]
  moveTotalsIntoList(book, list)
  const items = itemsOf(book, list)
  let item =
    items.find((candidate) => candidate.docFrom === reading.from) ||
    items.find((candidate) => !itemHasDocument(candidate) && !itemIsEmpty(candidate)) ||
    items.find((candidate) => !itemHasDocument(candidate)) ||
    items[0]
  if (!item) {
    item = addItem(book, list)
    item.fromDoc = true
  }
  readItemField(item, field, reading)
  if (reading.from) book.documentOf[key] = reading.from
}

export function removeListDocument(book: FinanceBook, key: string) {
  const [list] = LIST_FOR_FIELD[key]
  const from = book.documentOf[key]
  for (const item of itemsOf(book, list)) {
    if (itemHasDocument(item) && (!from || item.docFrom === from)) removeItemDocument(item)
  }
  book.lists[list] = itemsOf(book, list).filter((item) => !(item.fromDoc && itemIsEmpty(item)))
  for (const record of [book.warnings, book.acknowledged, book.fixed, book.manual, book.documentOf, book.confidence]) {
    delete record[key]
  }
}
