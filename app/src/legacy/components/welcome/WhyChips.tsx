import Chip from '../ui/Chip.tsx'
import Emoji from '../ui/Emoji.tsx'
import { usePlan, setPlan } from '../../state/store.ts'
import { why, whyChips } from '../../content/welcome.data.ts'

/** Optional multi-select; answers go to the local store only. */
export default function WhyChips() {
  const p = usePlan()
  const toggle = (k: string) => {
    const on = p.why.includes(k)
    setPlan({ why: on ? p.why.filter(x => x !== k) : [...p.why, k], ...(on && k === why.other ? { whyNote: '' } : {}) })
  }
  return (
    <>
      <div className="why-chips" role="group" aria-label={why.title}>
        {whyChips.map(c => (
          <Chip key={c.k} selected={p.why.includes(c.k)} onClick={() => toggle(c.k)}><Emoji>{c.e}</Emoji> {c.t}</Chip>
        ))}
        <Chip selected={p.why.includes(why.other)} onClick={() => toggle(why.other)}>{why.otherLabel}</Chip>
      </div>
      {p.why.includes(why.other) && (
        <input aria-label={why.otherLabel} placeholder={why.otherPlaceholder} maxLength={why.otherMax} value={p.whyNote} onChange={e => setPlan({ whyNote: e.target.value })} />
      )}
    </>
  )
}
