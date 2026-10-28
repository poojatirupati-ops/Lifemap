import { useEffect } from 'react'
import { LISTS, type ListKey } from '../../domain/finances/lists.data.ts'
import { useStore } from '../../state/store.ts'
import Emo from '../ui/Emo.tsx'
import { workedOutNote } from './checkList.ts'
import ItemCard from './ItemCard.tsx'
import { addListItem, showList } from './listActions.ts'

type DebtOrPension = 'cards' | 'loans' | 'mort2' | 'pens'
const REPAYMENT: Partial<Record<DebtOrPension, string>> = { cards: 'cardPayM', loans: 'loanPayM' }
const NO_ITEMS: never[] = []

/** Credit cards, loans, other mortgages or pensions: one card per item and an Add button. */
export default function ListBlock({ list }: { list: DebtOrPension }) {
  const items = useStore(({ plan }) => plan.lists?.[list] ?? NO_ITEMS)
  const repayment = REPAYMENT[list]
  const worked = useStore(({ plan }) => (repayment ? workedOutNote(repayment, plan) : ''))
  const { emoji, title, addLabel } = LISTS[list]
  useEffect(() => showList(list as ListKey), [list])

  const addButton = (margin: object) => (
    <button
      className="btn ghost sm"
      style={{ width: '100%', ...margin }}
      data-a="iadd"
      data-p={list}
      onClick={() => addListItem(list)}
    >
      {addLabel}
    </button>
  )

  if (list === 'mort2' && !items.length) return addButton({ margin: '0 0 12px' })
  return (
    <div className="card" data-list={list}>
      <b style={{ fontSize: 16 }}>
        <Emo>{`${emoji} ${title}`}</Emo>
      </b>
      {items.map((item, index) => (
        <ItemCard key={item.id} list={list} item={item} number={index + 1} />
      ))}
      {worked && (
        <span
          className="small"
          id={`wo-${repayment}`}
          style={{ display: 'block', marginTop: 8, color: 'var(--sea-d)' }}
        >
          {worked}
        </span>
      )}
      {addButton({ marginTop: 10 })}
    </div>
  )
}
