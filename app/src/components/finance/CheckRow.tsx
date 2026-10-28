import { FINANCE_SECTIONS } from '../../domain/finances/sections.data.ts'
import type { CheckItem } from './checkList.ts'
import { FINANCE_FIELDS } from './fields.data.ts'
import { fixSection, leaveForAdviser } from './financeActions.ts'

interface Props {
  item: CheckItem
  /** Missing: what it counts as; needs a look: "Needs a look: " and why. */
  status: string
  workedOut: string
  leftForAdviser: boolean
}

/** One figure that is missing or worth a second look. */
export default function CheckRow({ item, status, workedOut, leftForAdviser }: Props) {
  const index = FINANCE_SECTIONS.indexOf(item.section)
  return (
    <div className="ck">
      <span className="i" aria-hidden="true">
        {item.state === 'look' ? '⚠️' : '❓'}
      </span>
      <div style={{ flex: 1 }}>
        <b>{FINANCE_FIELDS[item.key].label}</b>{' '}
        <span className="small">· {item.section.title}</span>
        <div className="small">
          {status}
          {workedOut && `. ${workedOut}`}
          {leftForAdviser && (
            <>
              {' · '}
              <b>Left for my adviser</b>
            </>
          )}
        </div>
        <div className="a">
          <button className="link" data-a="fix" data-p={index} onClick={() => fixSection(index)}>
            Fix now
          </button>
          {!leftForAdviser && (
            <button
              className="link"
              data-a="ack"
              data-p={item.key}
              onClick={() => leaveForAdviser(item.key)}
            >
              Leave for my adviser
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
