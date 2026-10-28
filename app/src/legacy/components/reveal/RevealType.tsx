import Card from '../ui/Card.tsx'
import Emoji from '../ui/Emoji.tsx'
import { TYPES, type TypeKey } from '../../content/discover.data.ts'

export default function RevealType({ k }: { k: TypeKey }) {
  const t = TYPES[k]
  return (
    <Card className="rev-type">
      <p className="eyebrow">Your money personality</p>
      <h1><Emoji>{t.e}</Emoji> The {t.name}</h1>
      <p>{t.strap}</p>
      <p><strong>Strengths:</strong> {t.str.join(', ')}.</p>
      <p><strong>Worth watching:</strong> {t.watch}</p>
    </Card>
  )
}
