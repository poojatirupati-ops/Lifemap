import { unseenLooks } from '../components/home/useHome.ts'
import { useStore } from '../state/store.ts'
import AppHead from '../components/frame/AppHead.tsx'
import Emo from '../components/ui/Emo.tsx'
import { STATEMENTS } from '../components/explore/explore.data.ts'
import { categoryById, toolsIn } from '../components/explore/tools.data.ts'
import { exploreBack } from '../state/explore.ts'
import CalculatorRow from '../components/explore/CalculatorRow.tsx'
import StatementCard from '../components/explore/StatementCard.tsx'

export const key = 'XCAT'
export const id = 'XPL-CAT'
export const note = (_plan: unknown, param = '') =>
  'Tools in one life-need group.' +
  (param in STATEMENTS ? ' Statement upload card at the top (gated by a verified account).' : '')

// A call, not <AppHead />: the shell's splitHead pins the top bar by reading the returned tree.
// Head runs inside ScreenHost's render, which subscribes to the plan, so getState() is current.
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
  const { id } = categoryById(param)
  const statement = STATEMENTS[id]
  return (
    <>
      {statement ? <StatementCard category={id} statement={statement} /> : null}
      {toolsIn(id).map((tool) => (
        <CalculatorRow key={tool.id} tool={tool} />
      ))}
    </>
  )
}
