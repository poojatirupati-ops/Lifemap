import CloseButton from './CloseButton.tsx'
import SheetTitle from './SheetTitle.tsx'

export const key = 'whyask'

export function Body() {
  return (
    <>
      <SheetTitle>Why we ask</SheetTitle>
      <p className="sub">
        Your answers help us show goals and results that fit you. Once you sign in, your plan saves
        as you go, and nothing is shared with an adviser without your say. This is guidance, not
        advice.
      </p>
      <CloseButton>Got it</CloseButton>
    </>
  )
}
