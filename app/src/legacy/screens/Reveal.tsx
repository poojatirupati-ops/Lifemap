import Button from '../components/ui/Button.tsx'
import RevealType from '../components/reveal/RevealType.tsx'
import RevealTerms from '../components/reveal/RevealTerms.tsx'
import RevealRisk from '../components/reveal/RevealRisk.tsx'
import { DISC_FORMAL, FIRST_READ } from '../components/reveal/reveal.data.ts'
import '../components/reveal/reveal.css'
import { personality } from '../engine/profile.ts'
import { usePlan } from '../state/store.ts'
import type { Route } from '../shell/route.ts'

export const route: Route = { path: '/reveal', public: true }

export default function Reveal() {
  const { ans } = usePlan()
  const type = personality(ans)
  const go = () => { location.hash = '/sign-in' }
  return (
    <section className="rev">
      {type ? (
        <>
          <RevealType k={type.key} />
          <RevealTerms ans={ans} />
          <RevealRisk ans={ans} />
          <p className="rev-note">{FIRST_READ}</p>
          <p className="rev-note">{DISC_FORMAL}</p>
          <div className="rev-actions">
            <Button onClick={go}>Get a more accurate picture: make my plan</Button>
          </div>
        </>
      ) : (
        <>
          <h1>A few more answers</h1>
          <p>Answer the money questions first and we will show your first read.</p>
          <Button variant="secondary" onClick={() => { location.hash = '/discover' }}>Back to the questions</Button>
        </>
      )}
    </section>
  )
}
