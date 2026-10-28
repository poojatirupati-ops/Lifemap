import { useStore } from '../../state/store.ts'

/** Plan-builder banner: where progress was saved, or a way to save and come back. */
export default function SaveBanner() {
  const { done, email } = useStore((store) => store.plan.save)
  if (done) {
    return (
      <div className="banner">
        ✅ <span>{`Progress saved to ${email}`}</span>
      </div>
    )
  }
  return (
    <div className="banner sbn">
      <span className="sbn-i" aria-hidden="true">
        ☁️
      </span>
      <span>Want a break?</span>
      <button className="link" onClick={() => useStore.getState().openSheet('save')}>
        Save and come back later
      </button>
    </div>
  )
}
