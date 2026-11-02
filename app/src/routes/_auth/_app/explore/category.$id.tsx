import { createFileRoute } from '@tanstack/react-router'
import AppScreen from '../../../../components/frame/AppScreen.tsx'
import Emo from '../../../../components/ui/Emo.tsx'
import { STATEMENTS } from '../../../../components/explore/explore.data.ts'
import { categoryById, toolsIn } from '../../../../components/explore/tools.data.ts'
import { exploreBack } from '../../../../state/explore.ts'
import CalculatorRow from '../../../../components/explore/CalculatorRow.tsx'
import StatementCard from '../../../../components/explore/StatementCard.tsx'

export const Route = createFileRoute('/_auth/_app/explore/category/$id')({
  component: ExploreCategory,
})

function ExploreCategory() {
  const category = categoryById(Route.useParams().id)
  const statement = STATEMENTS[category.id]
  return (
    <AppScreen
      id="XPL-CAT"
      note={
        'Tools in one life-need group.' +
        (statement ? ' Statement upload card at the top (gated by a verified account).' : '')
      }
      title={<Emo>{`${category.emoji} ${category.name}`}</Emo>}
      sub={category.blurb}
      back={exploreBack}
      bell
    >
      {statement ? <StatementCard category={category.id} statement={statement} /> : null}
      {toolsIn(category.id).map((tool) => (
        <CalculatorRow key={tool.id} tool={tool} />
      ))}
    </AppScreen>
  )
}
