import { WORK_COVER_HINT, type ListKey } from '../../domain/finances/lists.data.ts'
import { useListItems } from '../../hooks/useListItems.ts'
import { useStore } from '../../state/store.ts'
import AddItemButton from './AddItemButton.tsx'
import ItemCard from './ItemCard.tsx'

/** The policies under a Yes in Protection; cover through work also says how to find out. */
export default function PolicyBlock({ cover }: { cover: ListKey }) {
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
