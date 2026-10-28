import { euro } from '../../lib/format.ts'
import { whatIfTotal } from './saving.ts'

interface Props {
  saving: number
  spare: number
  extra: number
}

/** The live line: saving today plus the what-if extra, warning when that is more than is spare. */
export default function WhatIfLive({ saving, spare, extra }: Props) {
  const live = whatIfTotal(saving, spare, extra)
  return (
    <div
      className={live.over ? 'wi-live over' : 'wi-live'}
      id="wi-live"
      role="status"
      aria-live="polite"
    >
      {extra === 0 ? (
        <>
          Your saving today is <b>{euro(saving)} a month</b> · spare money about {euro(live.spare)}.
          Add an extra amount to see what changes.
        </>
      ) : (
        <>
          With this what-if you'd save <b>{euro(live.total)} a month</b> ({euro(saving)}
          {extra > 0 ? ` + ${euro(extra)} extra` : ` − ${euro(-extra)} less`}) · spare money about{' '}
          {euro(live.spare)}
        </>
      )}
      {live.over && (
        <span className="wn">
          ⚠️ That's more than your spare money of about {euro(live.spare)} a month. It may only work
          if you cut back elsewhere.
        </span>
      )}
    </div>
  )
}
