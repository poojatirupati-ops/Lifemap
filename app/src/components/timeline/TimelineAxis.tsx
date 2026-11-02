import { Fragment } from 'react'
import { axisMarks, type PlacedChip } from '../../domain/goals/timelineLayout.ts'

interface Props {
  ageNow: number
  width: number
  axisY: number
  chips: PlacedChip[]
}

/** The age axis with its marks, and a dashed stem from each chip down to its age. */
export default function TimelineAxis({ ageNow, width, axisY, chips }: Props) {
  return (
    <>
      <div className="tl-axis" style={{ top: axisY }} />
      <div className="tl-now" style={{ left: 0, top: axisY + 2 }} aria-hidden="true" />
      {axisMarks(ageNow, width).map(({ age, x, labelled }) => (
        <Fragment key={age}>
          <div className="tl-tm" style={{ left: x, top: axisY + 6 }} />
          {labelled && (
            <div className="tl-tick" style={{ left: x, top: axisY + 16 }}>
              {`age ${age}`}
            </div>
          )}
        </Fragment>
      ))}
      <div className="tl-tick" style={{ left: 14, top: axisY + 16 }}>
        Now
      </div>
      {chips.map(({ id, stemX, stemTop, stemHeight, ageX }) => (
        <Fragment key={id}>
          <div className="tl-stem" style={{ left: stemX, top: stemTop, height: stemHeight }} />
          {ageX != null && (
            <>
              <div
                className="tl-link"
                style={{
                  left: Math.min(stemX, ageX),
                  width: Math.abs(stemX - ageX),
                  top: axisY - 6,
                }}
              />
              <div className="tl-pin" style={{ left: ageX, top: axisY + 2 }} />
            </>
          )}
        </Fragment>
      ))}
    </>
  )
}
