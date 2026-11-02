import { Logo } from '../ui/icons.tsx'
import { loadedTenant } from '../../shell/tenant.ts'

const lifeMap = (
  <b>
    Life<em>Map</em>
  </b>
)

/** The tenant's logo and name (LifeMap's own for LifeMap Direct). Hook-free, so heads may call it as a function. */
export default function Brand() {
  const tenant = loadedTenant()
  const own = !tenant || tenant.name === 'LifeMap'
  return (
    <div className="brand brand2">
      <span className="logo" aria-hidden="true">
        {tenant?.logo ? <img src={tenant.logo} alt="" width="100%" height="100%" /> : <Logo />}
      </span>
      <span className="bt">
        {own ? lifeMap : <b>{tenant.name}</b>}
        <small>by DigiPro.AI</small>
      </span>
    </div>
  )
}
