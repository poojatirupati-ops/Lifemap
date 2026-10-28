// Adding, typing into and removing items in a list (cards, loans, pensions, policies).
import {
  addItem,
  prepareList,
  itemsOf,
  removeItemDocument,
  typeItemField,
} from '../../domain/finances/items.ts'
import { ITEM_DOCUMENTS, LISTS, type ListKey } from '../../domain/finances/lists.data.ts'
import { toast } from '../../state/shell.ts'
import { useStore } from '../../state/store.ts'
import type { ListItem, Plan } from '../../state/types.ts'
import { startUpload } from './uploadActions.ts'

const update = (recipe: (plan: Plan) => void) => useStore.getState().update(recipe)
// TODO(R-19): lt belongs in types.ts
const touched = (plan: Plan & { lt?: Record<string, boolean> }, list: string) => {
  ;(plan.lt ||= {})[list] = true
}
const focusSoon = (selector: string) =>
  requestAnimationFrame(() => document.querySelector<HTMLElement>(selector)?.focus())

export const itemFieldId = (list: string, item: ListItem, field: string) =>
  `i-${list}-${item.id}-${field}`

function changeItem(list: string, id: number, change: (item: ListItem) => void) {
  update((plan) => {
    const item = itemsOf(plan, list).find((candidate) => candidate.id === id)
    if (item) change(item)
  })
}

/** On showing a list: totals from before lists existed move in, and an empty first item is added. */
export const showList = (list: ListKey) => update((plan) => prepareList(plan, list))

export function addListItem(list: ListKey) {
  let item: ListItem | undefined
  update((plan) => {
    touched(plan, list)
    item = { ...addItem(plan, list) }
  })
  focusSoon(`#${itemFieldId(list, item!, LISTS[list].fields[0])}`)
}

export function removeListItem(list: ListKey, id: number) {
  update((plan) => {
    touched(plan, list)
    plan.lists[list] = itemsOf(plan, list).filter((item) => item.id !== id)
  })
  focusSoon(`[data-a="iadd"][data-p="${list}"]`)
  toast('Removed')
}

export const typeListItemField = (
  list: string,
  id: number,
  field: string,
  value: number | string | null,
) => changeItem(list, id, (item) => typeItemField(item, field, value))

export const uploadItemStatement = (list: ListKey, id: number) =>
  startUpload(LISTS[list].section, [`${ITEM_DOCUMENTS[list].title}.pdf`], { lk: list, id })

export function removeItemStatement(list: string, id: number) {
  changeItem(list, id, removeItemDocument)
  toast('Statement removed. Your own figures are used again')
}
