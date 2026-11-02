import type { ListKey } from '../domain/finances/lists.data.ts'
import { useStore } from '../state/store.ts'
import type { ListItem } from '../state/types.ts'

const NO_ITEMS: ListItem[] = []

export const useListItems = (list: ListKey) => useStore(({ plan }) => plan.lists[list] ?? NO_ITEMS)
