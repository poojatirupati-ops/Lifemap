import { addItem, itemsOf, removeItemDocument, typeItemField } from '../domain/finances/items.ts'
import { ITEM_DOCUMENTS } from '../domain/finances/itemDocuments.data.ts'
import { LISTS, type ListKey } from '../domain/finances/lists.data.ts'
import { STATEMENT_REMOVED, updateFinances } from './finances.ts'
import type { Store } from './store.ts'
import { toast } from './shell.ts'
import type { ListItem } from './types.ts'

/** The items of a list in Your finances: cards, loans, pensions and policies. */
export interface ListActions {
  /** Returns the new item's id. */
  addListItem: (list: ListKey) => number
  removeListItem: (list: ListKey, id: number) => void
  typeListItemField: (
    list: ListKey,
    id: number,
    field: string,
    value: number | string | null,
  ) => void
  uploadItemStatement: (list: ListKey, id: number) => void
  removeItemStatement: (list: ListKey, id: number) => void
}

export function createListsSlice(get: () => Store): ListActions {
  const update = updateFinances(get)
  const changeItem = (list: ListKey, id: number, change: (item: ListItem) => void) =>
    update((plan) => {
      const item = itemsOf(plan, list).find((candidate) => candidate.id === id)
      if (item) change(item)
    })

  return {
    addListItem: (list) => {
      update((plan) => {
        plan.listsChanged = { ...plan.listsChanged, [list]: true }
        addItem(plan, list)
      })
      return get().plan.nextItemId!
    },

    removeListItem: (list, id) => {
      update((plan) => {
        plan.listsChanged = { ...plan.listsChanged, [list]: true }
        plan.lists[list] = itemsOf(plan, list).filter((item) => item.id !== id)
      })
      toast('Removed')
    },

    typeListItemField: (list, id, field, value) =>
      changeItem(list, id, (item) => typeItemField(item, field, value)),

    uploadItemStatement: (list, id) =>
      get().startUpload(LISTS[list].section, [`${ITEM_DOCUMENTS[list].title}.pdf`], { list, id }),

    removeItemStatement: (list, id) => {
      changeItem(list, id, removeItemDocument)
      toast(STATEMENT_REMOVED)
    },
  }
}
