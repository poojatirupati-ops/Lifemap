import Button from '../components/ui/Button.tsx'
import photo from '../../assets/cover-photo.jpg?inline'
import CoverLinks from '../components/welcome/CoverLinks.tsx'
import { cover } from '../content/welcome.data.ts'
import '../components/welcome/welcome.css'

export const route = { path: '/welcome', public: true, root: true }

export default function Welcome() {
  return (
    <section className="cover" style={{ backgroundImage: `url(${photo})` }}>
      <p className="cover-logo">LifeMap</p>
      <h1>{cover.headline}</h1>
      <p>{cover.line}</p>
      <Button onClick={() => { location.hash = '/why' }}>{cover.start}</Button>
      <p className="cover-under">{cover.under}</p>
      <CoverLinks />
    </section>
  )
}
