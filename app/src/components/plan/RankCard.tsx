import { useStore } from '../../state/store.ts'
import RankList from '../define/RankList.tsx'

/** "Which goal first?" folded on My Plan, once there are two goals to order. */
export default function RankCard() {
  const several = useStore((store) => store.plan.goals.length > 1)
  const ranked = useStore((store) => !!store.plan.rank)
  if (!several) return null
  return (
    <details className="card asmg wigrow" data-g="rank" style={{ marginTop: 12 }}>
      <summary>Which goal first?{ranked ? ' · your order' : ''}</summary>
      <div style={{ marginTop: 8 }}>
        <RankList place="plan" />
      </div>
    </details>
  )
}
