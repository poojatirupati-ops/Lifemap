import Button from '../components/ui/Button.tsx'
import { usePlan } from '../state/store.ts'
import WhyChips from '../components/welcome/WhyChips.tsx'
import { why } from '../content/welcome.data.ts'
import '../components/welcome/welcome.css'

export const route = { path: '/why', public: true }

export default function WhyHere() {
  const answered = usePlan().why.length > 0
  const next = () => { location.hash = '/discover' }
  return (
    <section className="why">
      <h1>{why.title}</h1>
      <p>{why.sub}</p>
      <WhyChips />
      <div className="why-actions">
        <Button disabled={!answered} onClick={next}>{why.next}</Button>
        <Button variant="link" onClick={next}>{why.skip}</Button>
      </div>
    </section>
  )
}
