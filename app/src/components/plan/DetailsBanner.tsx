import { useStore } from '../../state/store.ts'
import { checkItems, needsAttention } from '../finance/checkList.ts'
import { fixSection } from '../finance/financeActions.ts'
import { FINANCE_SECTIONS } from '../../domain/finances/sections.data.ts'
import { openMe } from './planActions.ts'

/** Figures still missing or to look at, counted as €0 for now. */
export default function DetailsBanner() {
  const plan = useStore((store) => store.plan)
  const flagged = checkItems(plan).filter(needsAttention)
  if (!flagged.length) return null
  const one = flagged.length === 1
  const addThem = () =>
    one ? fixSection(FINANCE_SECTIONS.indexOf(flagged[0].section)) : openMe('money')

  return (
    <div className="nudge" id="miss-banner" role="status">
      <span aria-hidden="true">ℹ️</span>
      <span>
        <b>
          {flagged.length}
          {one ? ' detail' : ' details'} missing
        </b>{' '}
        · counted as €0 for now, so this is a rough picture
      </span>
      <button className="link" data-a="addmiss" onClick={addThem}>
        {one ? 'Add it' : 'Add them'}
      </button>
    </div>
  )
}
