// Confirming "We read these values": the demo statements' figures go into the plan.
import { hasValue } from '../../lib/format.ts'
import { readFigure, type FinanceBook } from './figures.ts'
import { itemsOf, readItemField } from './items.ts'
import { ITEM_DOCUMENTS, LISTS, type ListKey } from './lists.data.ts'
import { SECTION_UPLOADS } from './sections.data.ts'

/** An upload in progress. `edit` holds the customer's corrections; `item` is set for one list item. */
export type Upload = {
  sec: string
  stage: 'scan' | 'fail' | 'confirm'
  files: string[]
  edit: Record<string, number>
  item: { lk: ListKey; id: number } | null
}

/** The smart upload at the top of Your finances reads into every section with documents. */
export const uploadSections = (section: string) =>
  section === 'smart' ? ['income', 'assets', 'liab', 'pension'] : [section]

// the value read, or the customer's correction of it
function confirmed(upload: Upload, field: string, read: number | string) {
  const edited = upload.edit[field]
  const corrected = edited != null && +edited !== read
  return { value: corrected ? +edited : read, corrected }
}

function confirmItem(book: FinanceBook, upload: Upload) {
  const { lk: list, id } = upload.item!
  const document = ITEM_DOCUMENTS[list] as (typeof ITEM_DOCUMENTS)[ListKey] & {
    texts?: [string, string][]
    staleNote?: string
  }
  const item = itemsOf(book, list).find((candidate) => candidate.id === id)
  if (!item) return
  for (const [field, read, confidence] of document.figures) {
    const { value, corrected } = confirmed(upload, field, read)
    readItemField(item, field, value, confidence, corrected, `upl:item${id}`)
  }
  for (const [field, text] of document.texts ?? []) {
    if (hasValue(item.f[field])) continue
    item.f[field] = text
    item.src[field] = 'doc'
  }
  const totals = (LISTS[list] as { totals?: Record<string, string> }).totals
  if (document.staleNote && totals) book.look[totals.value] = document.staleNote
}

export function confirmUpload(book: FinanceBook, upload: Upload) {
  if (upload.item) return confirmItem(book, upload)
  for (const section of uploadSections(upload.sec)) {
    const read = SECTION_UPLOADS[section]
    const from = `upl:${section}`
    for (const [key, [value, confidence]] of Object.entries(read.values)) {
      const answer = confirmed(upload, key, value)
      delete book.look[key]
      readFigure(book, key, answer.value, confidence, answer.corrected, from)
    }
    for (const [key, [value, confidence]] of Object.entries(read.hidden ?? {})) {
      readFigure(book, key, value, confidence, false, from)
    }
    Object.assign(book.look, read.staleNotes)
  }
}
