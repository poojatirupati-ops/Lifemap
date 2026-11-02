import { discoverAnswered } from '../../domain/discovery/profile.ts'
import { useStore } from '../../state/store.ts'

/** C0: the optional profile questions, with how many are already answered. */
export default function ProfileIntro() {
  const answered = useStore((store) => discoverAnswered(store.plan.answers))
  return (
    <>
      <div className="xbanner" aria-hidden="true"></div>
      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 46 }} aria-hidden="true">
          🧭
        </div>
        <b style={{ fontSize: 17 }}>6 quick questions, about 2 min</b>
        <p className="small">
          You can choose to share this with your adviser, so you won't repeat yourself. {answered}{' '}
          of your answers are already filled in.
        </p>
      </div>
    </>
  )
}
