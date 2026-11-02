import { itemFigures, statementWinsNote } from '../../domain/finances/figures.ts'
import { tagFor } from '../../domain/finances/sourceTag.ts'
import { LIST_FIELDS, type ListKey } from '../../domain/finances/lists.data.ts'
import { useStore } from '../../state/store.ts'
import type { ListItem } from '../../state/types.ts'
import Emo from '../ui/Emo.tsx'
import DocNote from './DocNote.tsx'
import ExampleLink from './ExampleLink.tsx'
import NumberBox from './NumberBox.tsx'
import { itemFieldId } from './itemFieldId.ts'

interface Props {
  list: ListKey
  item: ListItem
  field: string
}

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
export default function ItemField({ list, item, field }: Props) {
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
