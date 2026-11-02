import type { CSSProperties } from 'react'
import { LISTS, type ListKey } from '../../domain/finances/lists.data.ts'
import { focusSoon } from '../../lib/focusSoon.ts'
import { useStore } from '../../state/store.ts'
import { itemFieldId } from './itemFieldId.ts'

/** "＋ Add a credit card" and the like; the new item's first field gets the focus. */
export default function AddItemButton({ list, style }: { list: ListKey; style: CSSProperties }) {
  const add = () => {
    const id = useStore.getState().addListItem(list)
    focusSoon(`#${itemFieldId(list, id, LISTS[list].fields[0])}`)
  }
  return (
    <button
      className="btn ghost sm"
      style={{ width: '100%', ...style }}
      data-a="iadd"
      data-p={list}
      onClick={add}
    >
      {LISTS[list].addLabel}
    </button>
  )
}
