import { useEffect } from 'react'
import { LISTS, WORK_COVER_HINT, type ListKey } from '../../domain/finances/lists.data.ts'
import { useStore } from '../../state/store.ts'
import ItemCard from './ItemCard.tsx'
import { addListItem, showList } from './listActions.ts'

const NO_ITEMS: never[] = []

/** The policies under a Yes in Protection; cover through work also says how to find out. */
export default function PolicyBlock({ cover }: { cover: ListKey }) {
  const answer = useStore(({ plan }) => plan.fin[cover])
  const items = useStore(({ plan }) => plan.lists?.[cover] ?? NO_ITEMS)
  const isWork = cover === 'workCover'
  const hasCover = answer === 'Yes'
  useEffect(() => {
    if (hasCover) showList(cover)
  }, [hasCover, cover])

  if (!hasCover && !(isWork && answer === 'Not sure')) return null
  const hint = isWork && (
    <p className="small" style={{ margin: '-4px 0 8px' }} id={`ph-${cover}`}>
      {WORK_COVER_HINT}
    </p>
  )
  if (!hasCover) return hint
  return (
    <>
      {hint}
      <div data-list={cover} style={{ margin: '0 0 14px' }}>
        {items.map((item, index) => (
          <ItemCard key={item.id} list={cover} item={item} number={index + 1} />
        ))}
        <button
          className="btn ghost sm"
          style={{ width: '100%', marginTop: 10 }}
          data-a="iadd"
          data-p={cover}
          onClick={() => addListItem(cover)}
        >
          {LISTS[cover].addLabel}
        </button>
      </div>
    </>
  )
}
