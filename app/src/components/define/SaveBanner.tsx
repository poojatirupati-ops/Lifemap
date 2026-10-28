import { useStore } from '../../state/store.ts'

/** "Want a break?" until the customer has saved; then where their progress is saved. */
export default function SaveBanner() {
  const save = useStore((store) => store.plan.save)

  if (save.done) {
    return (
      <div className="banner">
        ✅ <span>Progress saved to {save.email}</span>
      </div>
    )
  }
  return (
    <div className="banner sbn">
      <span className="sbn-i" aria-hidden="true">
        ☁️
      </span>
      <span>Want a break?</span>
      <button
        className="link"
        data-a="sheet"
        data-p="save"
        onClick={() => useStore.getState().openSheet('save')}
      >
        Save and come back later
      </button>
    </div>
  )
}
