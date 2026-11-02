// Confirming "We read these values": the figures the document reader found (or the sample document's) go into the plan.
import { FINANCE_FIELDS } from './fields.data.ts'
import { hasValue } from '../../lib/format.ts'
import { readFigure, type FinanceBook } from './figures.ts'
import { itemsOf, readItemField } from './items.ts'
import { itemDocumentOf } from './itemDocuments.data.ts'
import { LIST_FIELDS, listOf, type ListKey } from './lists.data.ts'
import { FINANCE_SECTIONS, SECTION_UPLOADS } from './sections.data.ts'

/** What the document reader found (POST /api/documents/:id/read), confidence in %. */
export type DocumentRead = {
  provider: string
  failed: boolean
  fields: Record<string, { value: number | string; confidence: number }>
}

/** Sample documents and the example reader show the example figures, labelled as such. */
export const isExample = (read?: DocumentRead) => !read || read.provider === 'example'

/** The reader's figures in place of the sample ones, only those it found; a sample document keeps the samples. */
function figuresRead<V extends number | string>(
  sample: Record<string, [V, number]>,
  read?: DocumentRead,
): Record<string, [V, number]> {
  if (!read) return sample
  return Object.fromEntries(
    Object.keys(sample).flatMap((key) => {
      const found = read.fields[key]
      if (!found || typeof found.value !== typeof sample[key][0]) return []
      return [[key, [found.value as V, found.confidence]]]
    }),
  )
}

/** An upload in progress. `edit` holds the customer's corrections; `item` is set for one list item; `read` once a real document was read. */
export type Upload = {
  section: string
  stage: 'scan' | 'fail' | 'confirm'
  files: string[]
  edit: Record<string, number>
  item: { list: ListKey; id: number } | null
  read?: DocumentRead
}

/** One figure as the reader found it, with how sure it is. */
type ReadFigure = {
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
  /** Example figures (a sample document or the example reader). */
  example: boolean
}

/** The smart upload at the top of Your finances reads into every section with documents. */
const uploadSections = (section: string) =>
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
    for (const [key, [value, confidence]] of Object.entries(figuresRead(read.values, upload.read))) {
      delete book.warnings[key]
      readFigure(book, key, { ...confirmed(upload, key, value), confidence, from })
    }
    for (const [key, [value, confidence]] of Object.entries(figuresRead(read.hidden ?? {}, upload.read))) {
      readFigure(book, key, { value, confidence, corrected: false, from })
    }
    if (!upload.read) Object.assign(book.warnings, read.staleNotes) // the sample statements' dates
  }
}

/** What "We read these values" shows: one card for a list item's statement, else one per section. */
export function readValuesToConfirm({ section, item, read: found }: Upload): ReadDocument[] {
  const example = isExample(found)
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
        example,
      },
    ]
  }
  return uploadSections(section).map((sectionId) => {
    const read = SECTION_UPLOADS[sectionId]
    const { emoji, title } = FINANCE_SECTIONS.find(({ id }) => id === sectionId)!
    return {
      title: `${emoji} ${title}`,
      documents: found ? undefined : read.documents.join(' · '),
      example,
      figures: Object.entries(figuresRead(read.values, found)).map(([field, [value, confidence]]) => ({
        field,
        label: FINANCE_FIELDS[field].label,
        value,
        confidence,
        stale: found ? undefined : read.staleNotes?.[field],
      })),
    }
  })
}
