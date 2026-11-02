// Confirming "We read these values": the demo statements' figures go into the plan.
import { FINANCE_FIELDS } from './fields.data.ts'
import { hasValue } from '../../lib/format.ts'
import { readFigure, type FinanceBook } from './figures.ts'
import { itemsOf, readItemField } from './items.ts'
import { itemDocumentOf } from './itemDocuments.data.ts'
import { LIST_FIELDS, listOf, type ListKey } from './lists.data.ts'
import { FINANCE_SECTIONS, SECTION_UPLOADS } from './sections.data.ts'

/** An upload in progress. `edit` holds the customer's corrections; `item` is set for one list item. */
export type Upload = {
  section: string
  stage: 'scan' | 'fail' | 'confirm'
  files: string[]
  edit: Record<string, number>
  item: { list: ListKey; id: number } | null
}

/** One figure as the reader found it, with how sure it is. */
export type ReadFigure = {
  field: string
  label: string
  value: number | string
  confidence: number
  stale?: string
}

/** One document's card in "We read these values". */
export type ReadDocument = {
  title: string
  documents?: string
  figures: ReadFigure[]
  /** Text read as it is (a lender's name), not editable. */
  texts?: [label: string, text: string][]
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

function confirmItem(
  book: FinanceBook,
  { list, id }: { list: ListKey; id: number },
  upload: Upload,
) {
  const document = itemDocumentOf(list)
  const item = itemsOf(book, list).find((candidate) => candidate.id === id)
  if (!item) return
  for (const [field, read, confidence] of document.figures) {
    readItemField(item, field, {
      ...confirmed(upload, field, read),
      confidence,
      from: `upl:item${id}`,
    })
  }
  for (const [field, text] of document.texts ?? []) {
    if (hasValue(item.fields[field])) continue
    item.fields[field] = text
    item.sources[field] = 'doc'
  }
  const totals = listOf(list).totals
  if (document.staleNote && totals) book.warnings[totals.value] = document.staleNote
}

export function confirmUpload(book: FinanceBook, upload: Upload) {
  if (upload.item) return confirmItem(book, upload.item, upload)
  for (const section of uploadSections(upload.section)) {
    const read = SECTION_UPLOADS[section]
    const from = `upl:${section}`
    for (const [key, [value, confidence]] of Object.entries(read.values)) {
      delete book.warnings[key]
      readFigure(book, key, { ...confirmed(upload, key, value), confidence, from })
    }
    for (const [key, [value, confidence]] of Object.entries(read.hidden ?? {})) {
      readFigure(book, key, { value, confidence, corrected: false, from })
    }
    Object.assign(book.warnings, read.staleNotes)
  }
}

/** What "We read these values" shows: one card for a list item's statement, else one per section. */
export function readValuesToConfirm({ section, item }: Upload): ReadDocument[] {
  if (item) {
    const { title, figures, texts = [] } = itemDocumentOf(item.list)
    const label = (field: string) => LIST_FIELDS[`${item.list}.${field}`].label
    return [
      {
        title,
        figures: figures.map(([field, value, confidence]) => ({
          field,
          label: label(field),
          value,
          confidence,
        })),
        texts: texts.map(([field, text]) => [label(field).replace(' (optional)', ''), text]),
      },
    ]
  }
  return uploadSections(section).map((sectionId) => {
    const read = SECTION_UPLOADS[sectionId]
    const { emoji, title } = FINANCE_SECTIONS.find(({ id }) => id === sectionId)!
    return {
      title: `${emoji} ${title}`,
      documents: read.documents.join(' · '),
      figures: Object.entries(read.values).map(([field, [value, confidence]]) => ({
        field,
        label: FINANCE_FIELDS[field].label,
        value,
        confidence,
        stale: read.staleNotes?.[field],
      })),
    }
  })
}
