import { unseenLooks } from '../components/home/useHome.ts'
import { useStore } from '../state/store.ts'
import AppHead from '../components/frame/AppHead.tsx'
import Emo from '../components/ui/Emo.tsx'
import { STATEMENTS } from '../components/explore/explore.data.ts'
import { categoryById, TOOLS, type CategoryId } from '../components/explore/tools.data.ts'
import { exploreBack, openCalculator } from '../components/explore/exploreActions.ts'
import ExploreRow from '../components/explore/ExploreRow.tsx'
import StatementCard from '../components/explore/StatementCard.tsx'

export const key = 'XCAT'
export const id = 'XPL-CAT'
export const note = (_plan: unknown, param = '') =>
  'Tools in one life-need group.' +
  (param in STATEMENTS ? ' Statement upload card at the top (gated by a verified account).' : '')

export function Head({ param = '' }: { param?: string }) {
  const category = categoryById(param)
  return AppHead({
    title: <Emo>{`${category.emoji} ${category.name}`}</Emo>,
    sub: category.blurb,
    back: exploreBack,
    needsLook: unseenLooks(useStore.getState().plan),
  })
}

export function Body({ param = '' }: { param?: string }) {
  const category = param as CategoryId
  return (
    <>
      {category in STATEMENTS && <StatementCard category={category} />}
      {TOOLS.filter((tool) => tool.category === category).map((tool) => (
        <ExploreRow
          key={tool.id}
          emoji={tool.emoji}
          title={tool.name}
          sub={tool.question}
          onClick={() => openCalculator(tool.id)}
          data-a="calc"
          data-p={tool.id}
        />
      ))}
    </>
  )
}
