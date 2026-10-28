import { missingChoices } from '../components/finance/requiredChoices.ts'
import { fixChoice } from '../components/plan/planActions.ts'
import GateNote from '../components/ui/GateNote.tsx'
import { useStore } from '../state/store.ts'
import { CHOICE_LABELS } from './choiceLabels.ts'
import CloseButton from './CloseButton.tsx'
import SheetTitle from './SheetTitle.tsx'

export const key = 'gate'

/** "Almost there": the report needs the required choices first. */
export function Body() {
  const plan = useStore((store) => store.plan)
  const missing = missingChoices(plan).map(({ key }) => ({ key, label: CHOICE_LABELS[key] }))
  return (
    <>
      <SheetTitle>Almost there</SheetTitle>
      <GateNote where="report" missing={missing} onChoose={fixChoice} />
      <CloseButton ghost style={{ marginTop: 10 }}>
        Not now
      </CloseButton>
    </>
  )
}
