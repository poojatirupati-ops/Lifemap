import { hasValue } from '../../lib/format.ts'
import { focusSoon } from '../../lib/focusSoon.ts'
import { itemHasDocument } from '../../domain/finances/items.ts'
import { ITEM_DOCUMENTS } from '../../domain/finances/itemDocuments.data.ts'
import { LISTS, type ListKey } from '../../domain/finances/lists.data.ts'
import { useStore } from '../../state/store.ts'
import type { ListItem } from '../../state/types.ts'
import ItemField from './ItemField.tsx'

interface Props {
  list: ListKey
  item: ListItem
  number: number
}

/** One card, loan, pension or policy, with its statement. */
export default function ItemCard({ list, item, number }: Props) {
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
