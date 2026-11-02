import { LISTS, listOf, type ListKey } from '../../domain/finances/lists.data.ts'
import { useListItems } from '../../hooks/useListItems.ts'
import Emo from '../ui/Emo.tsx'
import AddItemButton from './AddItemButton.tsx'
import ItemCard from './ItemCard.tsx'
import WorkedOutNote from './WorkedOutNote.tsx'

type DebtOrPension = Extract<ListKey, 'cards' | 'loans' | 'mort2' | 'pens'>

/** Credit cards, loans, other mortgages or pensions: one card per item and an Add button. */
export default function ListBlock({ list }: { list: DebtOrPension }) {
  const items = useListItems(list)
  const { emoji, title } = LISTS[list]

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
      <WorkedOutNote field={listOf(list).totals?.pay} style={{ marginTop: 8 }} />
      <AddItemButton list={list} style={{ marginTop: 10 }} />
    </div>
  )
}
