import { addItem, itemsOf, removeItemDocument, typeItemField } from '../domain/finances/items.ts'
import { ITEM_DOCUMENTS } from '../domain/finances/itemDocuments.data.ts'
import { LISTS, type ListKey } from '../domain/finances/lists.data.ts'
import { STATEMENT_REMOVED, updateFinances } from './finances.ts'
import type { Store } from './store.ts'
import { toast } from './shell.ts'
import type { ListItem } from './types.ts'

export function createListsSlice(get: () => Store) {
  const update = updateFinances(get)
  const changeItem = (list: ListKey, id: number, change: (item: ListItem) => void) =>
    update((plan) => {
      const item = itemsOf(plan, list).find((candidate) => candidate.id === id)
      if (item) change(item)
    })

  return {
    /** Returns the new item's id. */
    addListItem: (list: ListKey): number => {
      update((plan) => {
        plan.listsChanged = { ...plan.listsChanged, [list]: true }
        addItem(plan, list)
      })
      return get().plan.nextItemId!
    },

    removeListItem: (list: ListKey, id: number) => {
      update((plan) => {
        plan.listsChanged = { ...plan.listsChanged, [list]: true }
        plan.lists[list] = itemsOf(plan, list).filter((item) => item.id !== id)
      })
      toast('Removed')
    },

    typeListItemField: (list: ListKey, id: number, field: string, value: number | string | null) =>
      changeItem(list, id, (item) => typeItemField(item, field, value)),

    uploadItemStatement: (list: ListKey, id: number) =>
      get().startUpload(LISTS[list].section, [`${ITEM_DOCUMENTS[list].title}.pdf`], { list, id }),

    removeItemStatement: (list: ListKey, id: number) => {
      changeItem(list, id, removeItemDocument)
      toast(STATEMENT_REMOVED)
    },
  }
}

/** The items of a list in Your finances: cards, loans, pensions and policies. */
export type ListActions = ReturnType<typeof createListsSlice>
