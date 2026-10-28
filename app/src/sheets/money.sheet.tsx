import CloseButton from './CloseButton.tsx'
import SheetTitle from './SheetTitle.tsx'

export const key = 'money'

export function Body() {
  return (
    <>
      <SheetTitle>How LifeMap makes money</SheetTitle>
      <p className="sub">
        LifeMap is free for you. If you work with an adviser, their firm may pay us a fee. Your
        adviser will tell you how they are paid before you agree to anything. Advisers never pay to
        see your data, and you decide what they can see.
      </p>
      <CloseButton>Got it</CloseButton>
    </>
  )
}
