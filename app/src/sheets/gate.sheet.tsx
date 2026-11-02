import GateNote from '../components/ui/GateNote.tsx'
import { useMissingChoices } from '../hooks/useMissingChoices.ts'
import { useStore } from '../state/store.ts'
import CloseButton from './CloseButton.tsx'
import SheetTitle from './SheetTitle.tsx'

export const key = 'gate'

/** "Almost there": the report needs the required choices first. */
export function Body() {
  const missing = useMissingChoices()
  return (
    <>
      <SheetTitle>Almost there</SheetTitle>
      <GateNote where="report" missing={missing} onChoose={useStore.getState().fixChoice} />
      <CloseButton ghost style={{ marginTop: 10 }}>
        Not now
      </CloseButton>
    </>
  )
}
