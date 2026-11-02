import { useShallow } from 'zustand/react/shallow'
import { fieldSourceKey } from '../../domain/finances/fields.data.ts'
import { useStore } from '../../state/store.ts'
import { tagFor } from '../../domain/finances/sourceTag.ts'
import Emo from '../ui/Emo.tsx'

/** Where a finance figure came from, or that it needs a look. */
export default function FieldTag({ field }: { field: string }) {
  const [className, text] = useStore(
    useShallow(({ plan }) =>
      tagFor({
        source: plan.sources[fieldSourceKey(field, plan)],
        confidence: plan.confidence[field],
        corrected: plan.fixed[field],
        look: !!plan.warnings[field] && !plan.acknowledged[field],
      }),
    ),
  )
  return (
    <span className={className}>
      <Emo>{text}</Emo>
    </span>
  )
}
