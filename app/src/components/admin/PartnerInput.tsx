import type { Standard, StandardKey } from '../../domain/planning/settings.data.ts'
import ChoiceInput from './ChoiceInput.tsx'
import FigureInput from './FigureInput.tsx'
import RateListInput from './RateListInput.tsx'

/** The partner's own figure: a pick for a choice, three rates for a list, else one figure. */
export default function PartnerInput({ id, standard }: { id: StandardKey; standard: Standard }) {
  if (standard.unit === 'choice') return <ChoiceInput id={id} standard={standard} />
  if (standard.unit === 'pct3') return <RateListInput id={id} standard={standard} />
  return <FigureInput id={id} standard={standard} />
}
