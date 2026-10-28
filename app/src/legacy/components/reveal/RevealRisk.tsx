import Card from '../ui/Card.tsx'
import { myTerms, riskProfile } from '../../engine/profile.ts'
import { MIS_LABEL } from './reveal.data.ts'
import type { Answers } from '../../content/discover.data.ts'

/** Risk appetite and cushion, in words and in terms (tags come from the validated answers), plus at most one mismatch line. */
export default function RevealRisk({ ans }: { ans: Answers }) {
  const r = riskProfile(ans)
  const tag = (s: string) => [...myTerms(ans)].find(t => t.section === s)?.tag
  const word = tag('appetite'), term = tag('safety')
  return (
    <Card className="rev-risk">
      <h2>Risk and cushion</h2>
      {r.comfort && <p>Risk comfort: <strong>{r.comfort}</strong>{word && word !== r.comfort && <> ({word})</>}. How much ups and downs you are happy with.</p>}
      {r.cushion && <p>Cushion: <strong>{r.cushion}</strong>{term && <> ({term})</>}. Money set aside for surprises.</p>}
      {r.mis && <><p className="eyebrow">{MIS_LABEL}</p><p>{r.mis}</p></>}
    </Card>
  )
}
