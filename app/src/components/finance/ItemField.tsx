import { statementWinsNote } from '../../domain/finances/figures.ts'
import { LIST_FIELDS } from '../../domain/finances/lists.data.ts'
import type { ListItem } from '../../state/types.ts'
import Emo from '../ui/Emo.tsx'
import DocNote from './DocNote.tsx'
import ExampleLink from './ExampleLink.tsx'
import NumberBox from './NumberBox.tsx'
import { itemFieldId, typeListItemField } from './listActions.ts'

interface Props {
  list: string
  item: ListItem
  field: string
}

function tagOf(item: ListItem, field: string) {
  if (item.src[field] === 'typed') return ['tag typed', '✏️ Your figure']
  if (item.src[field] !== 'doc') return null
  const confidence = item.conf[field] != null ? ` · ${item.conf[field]}%` : ''
  const read = item.fix[field] ? 'From your statement (corrected)' : `From document${confidence}`
  return ['tag doc', `✅ ${read}`]
}

/** One figure of a card, loan, pension or policy. */
export default function ItemField({ list, item, field }: Props) {
  const key = `${list}.${field}`
  const { label, type, hint } = LIST_FIELDS[key]
  const id = itemFieldId(list, item, field)
  const value = item.f[field]
  const tag = tagOf(item, field)
  const note = statementWinsNote(item.src[field] === 'doc', item.man[field], value, type === 'eur')
  const type_ = (typed: number | string | null) => typeListItemField(list, item.id, field, typed)
  const shared = {
    id,
    'data-it': `${list}|${item.id}|${field}`,
    'aria-describedby': hint ? `${id}-h` : undefined,
  }

  return (
    <div className="field">
      <label htmlFor={id}>
        {label}{' '}
        <span id={`${id}-t`}>
          {tag && (
            <span className={tag[0]}>
              <Emo>{tag[1]}</Emo>
            </span>
          )}
        </span>
      </label>
      <NumberBox
        {...shared}
        kind={type}
        value={value}
        maxPercent={100}
        autoComplete={type === 'text' ? 'off' : undefined}
        onValue={(typed) => type_(typeof typed === 'string' && !typed.trim() ? null : typed)}
      />
      <DocNote id={`${id}-n`} note={note} />
      {hint && (
        <span className="small" id={`${id}-h`}>
          {hint}
        </span>
      )}
      <ExampleLink field={key} />
    </div>
  )
}
