/** A choice only the customer can make: theirs once made, else not chosen yet. */
export default function ChoiceTag({ chosen }: { chosen: boolean }) {
  return chosen ? (
    <span className="tag doc">Your choice</span>
  ) : (
    <span className="tag look">Not chosen yet</span>
  )
}
