import { hasValue } from '../../lib/format.ts'
import { focusSoon } from '../../lib/focusSoon.ts'
import { itemHasDocument } from '../../domain/finances/items.ts'
import { ITEM_DOCUMENTS } from '../../domain/finances/itemDocuments.data.ts'
import { LIST_FIELDS, LISTS, type ListKey } from '../../domain/finances/lists.data.ts'
import { useStore } from '../../state/store.ts'
import type { ListItem } from '../../state/types.ts'
import { itemFigures, statementWinsNote } from '../../domain/finances/figures.ts'
import { tagFor } from '../../domain/finances/sourceTag.ts'
import Emo from '../ui/Emo.tsx'
import DocNote from './DocNote.tsx'
import ExampleLink from './ExampleLink.tsx'
import NumberBox from './NumberBox.tsx'
import { itemFieldId } from './itemFieldId.ts'

// where the figure came from: typed, or read from a statement
function SourceTag({ item, field }: { item: ListItem; field: string }) {
  const source = item.sources[field]
  if (!source) return null
  const [className, text] = tagFor({
    source,
    confidence: item.confidence[field],
    corrected: item.fixed[field],
  })
  return (
    <span className={className}>
      <Emo>{text}</Emo>
    </span>
  )
}

/** One figure of a card, loan, pension or policy. */
function ItemField({ list, item, field }: { list: ListKey; item: ListItem; field: string }) {
  const key = `${list}.${field}`
  const { label, type, hint } = LIST_FIELDS[key]
  const id = itemFieldId(list, item.id, field)
  const value = item.fields[field]
  const note = statementWinsNote(itemFigures(item), field, type === 'eur')
  const save = (typed: number | string | null) =>
    useStore.getState().typeListItemField(list, item.id, field, typed)

  return (
    <div className="field">
      <label htmlFor={id}>
        {label}{' '}
        <span id={`${id}-t`}>
          <SourceTag item={item} field={field} />
        </span>
      </label>
      <NumberBox
        id={id}
        data-it={`${list}|${item.id}|${field}`}
        aria-describedby={hint ? `${id}-h` : undefined}
        kind={type}
        value={value}
        autoComplete={type === 'text' ? 'off' : undefined}
        onValue={save}
      />
      <DocNote id={`${id}-n`} note={note} />
      {hint ? (
        <span className="small" id={`${id}-h`}>
          {hint}
        </span>
      ) : null}
      <ExampleLink field={key} />
    </div>
  )
}

/** One card, loan, pension or policy, with its statement. */
export default function ItemCard({
  list,
  item,
  number,
}: {
  list: ListKey
  item: ListItem
  number: number
}) {
  const notWorking = useStore(({ plan }) => plan.figures.work === 'Not working')
  const { singular, fields, uploadLabel } = LISTS[list]
  const title =
    list === 'pens' && hasValue(item.fields.name)
      ? String(item.fields.name)
      : `${singular[0].toUpperCase()}${singular.slice(1)} ${number}`
  const target = `${list}|${item.id}`
  // only the customer's own pension share gets tax relief, so it is not asked when not working
  const shown = fields.filter((field) => !(field === 'own' && notWorking))
  const { removeListItem, uploadItemStatement, removeItemStatement } = useStore.getState()
  const remove = () => {
    removeListItem(list, item.id)
    focusSoon(`[data-a="iadd"][data-p="${list}"]`)
  }
  const upload = () => uploadItemStatement(list, item.id)

  return (
    <div
      className="card"
      id={`item-${list}-${item.id}`}
      style={{ boxShadow: 'none', border: '1.5px solid #D5E0EA', marginTop: 10 }}
    >
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <b>{title}</b>
        <button
          className="link"
          data-a="idel"
          data-p={target}
          aria-label={`Remove ${title}`}
          onClick={remove}
        >
          Remove
        </button>
      </div>
      {shown.map((field) => (
        <ItemField key={field} list={list} item={item} field={field} />
      ))}
      {itemHasDocument(item) ? (
        <div className="mini" style={{ alignItems: 'center' }}>
          <span>
            <span aria-hidden="true">✅</span> From <b>{ITEM_DOCUMENTS[list].title}</b>
          </span>
          <span className="row" style={{ gap: 12 }}>
            <button className="link" data-a="iupl" data-p={target} onClick={upload}>
              Replace statement
            </button>
            <button
              className="link"
              data-a="irem"
              data-p={target}
              onClick={() => removeItemStatement(list, item.id)}
            >
              Remove statement
            </button>
          </span>
        </div>
      ) : (
        <button className="link" data-a="iupl" data-p={target} onClick={upload}>
          <span aria-hidden="true">📄</span> {uploadLabel}
        </button>
      )}
    </div>
  )
}
