import type { CSSProperties } from 'react'
import { listOf, WORK_COVER_HINT, type ListKey } from '../../domain/finances/lists.data.ts'
import { focusSoon } from '../../lib/focusSoon.ts'
import { useStore } from '../../state/store.ts'
import Emo from '../ui/Emo.tsx'
import ItemCard from './ItemCard.tsx'
import { itemFieldId } from './itemFieldId.ts'
import WorkedOutNote from './WorkedOutNote.tsx'
import type { ListItem } from '../../state/types.ts'

const NO_ITEMS: ListItem[] = []

const useListItems = (list: ListKey) => useStore(({ plan }) => plan.lists[list] ?? NO_ITEMS)

/** "＋ Add a credit card" and the like; the new item's first field gets the focus. */
function AddItemButton({ list, style }: { list: ListKey; style: CSSProperties }) {
  const { fields, addLabel } = listOf(list)
  const add = () => {
    const id = useStore.getState().addListItem(list)
    focusSoon(`#${itemFieldId(list, id, fields[0])}`)
  }
  return (
    <button
      className="btn ghost sm"
      style={{ width: '100%', ...style }}
      data-a="iadd"
      data-p={list}
      onClick={add}
    >
      {addLabel}
    </button>
  )
}

type DebtOrPension = Extract<ListKey, 'cards' | 'loans' | 'mort2' | 'pens'>

/** Credit cards, loans, other mortgages or pensions: one card per item and an Add button. */
export default function ListBlock({ list }: { list: DebtOrPension }) {
  const items = useListItems(list)
  const { emoji, title, totals } = listOf(list)

  if (list === 'mort2' && !items.length) {
    return <AddItemButton list={list} style={{ margin: '0 0 12px' }} />
  }
  return (
    <div className="card" data-list={list}>
      <b style={{ fontSize: 16 }}>
        <Emo>{`${emoji} ${title}`}</Emo>
      </b>
      {items.map((item, index) => (
        <ItemCard key={item.id} list={list} item={item} number={index + 1} />
      ))}
      <WorkedOutNote field={totals?.pay} style={{ marginTop: 8 }} />
      <AddItemButton list={list} style={{ marginTop: 10 }} />
    </div>
  )
}

/** The policies under a Yes in Protection; cover through work also says how to find out. */
export function PolicyBlock({ cover }: { cover: ListKey }) {
  const answer = useStore(({ plan }) => plan.figures[cover])
  const items = useListItems(cover)
  const isWork = cover === 'workCover'
  const hasCover = answer === 'Yes'

  if (!hasCover && !(isWork && answer === 'Not sure')) return null
  const hint = isWork ? (
    <p className="small" style={{ margin: '-4px 0 8px' }} id={`ph-${cover}`}>
      {WORK_COVER_HINT}
    </p>
  ) : null
  if (!hasCover) return hint
  return (
    <>
      {hint}
      <div data-list={cover} style={{ margin: '0 0 14px' }}>
        {items.map((item, index) => (
          <ItemCard key={item.id} list={cover} item={item} number={index + 1} />
        ))}
        <AddItemButton list={cover} style={{ marginTop: 10 }} />
      </div>
    </>
  )
}
