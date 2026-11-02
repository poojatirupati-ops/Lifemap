import type { ReactNode } from 'react'
import type { CheckItem } from './checkList.ts'
import type { FinanceSection } from '../../domain/finances/sections.data.ts'
import { FINANCE_FIELDS } from '../../domain/finances/fields.data.ts'
import { fixSection, leaveForAdviser, leaveSectionForAdviser } from '../../state/finances.ts'
import Emo from '../ui/Emo.tsx'

type Figure = {
  item: CheckItem
  /** Missing: what it counts as; needs a look: "Needs a look: " and why. */
  status: string
  workedOut: string
}

type Props = {
  /** The section's index in FINANCE_SECTIONS, for Fix now / Add now. */
  index: number
  leftForAdviser: boolean
} & (Figure | { section: FinanceSection })

type Row = {
  icon: string
  title: ReactNode
  place: string
  status: string
  fix: string
  leave: { a: string; p: string; onClick: () => void }
}

const figureRow = ({ item, status, workedOut }: Figure): Row => ({
  icon: item.state === 'look' ? '⚠️' : '❓',
  title: FINANCE_FIELDS[item.key].label,
  place: item.section.title,
  status: workedOut ? `${status}. ${workedOut}` : status,
  fix: 'Fix now',
  leave: { a: 'ack', p: item.key, onClick: () => leaveForAdviser(item.key) },
})

const sectionRow = (section: FinanceSection): Row => ({
  icon: '❓',
  title: <Emo>{`${section.emoji} ${section.title}`}</Emo>,
  place: 'skipped',
  status: section.id === 'prot' ? 'Not added yet' : 'Not added yet, so it counts as €0 for now',
  fix: 'Add now',
  leave: { a: 'acksec', p: section.id, onClick: () => leaveSectionForAdviser(section) },
})

/** A row of Check your details: one figure missing or worth a look, or a whole skipped section. */
export default function CheckRow(props: Props) {
  const { index, leftForAdviser } = props
  const { icon, title, place, status, fix, leave } =
    'item' in props ? figureRow(props) : sectionRow(props.section)

  return (
    <div className="ck">
      <span className="i" aria-hidden="true">
        {icon}
      </span>
      <div style={{ flex: 1 }}>
        <b>{title}</b> <span className="small">· {place}</span>
        <div className="small">
          {status}
          {leftForAdviser ? (
            <>
              {' · '}
              <b>Left for my adviser</b>
            </>
          ) : null}
        </div>
        <div className="a">
          <button className="link" data-a="fix" data-p={index} onClick={() => fixSection(index)}>
            {fix}
          </button>
          {leftForAdviser ? null : (
            <button className="link" data-a={leave.a} data-p={leave.p} onClick={leave.onClick}>
              Leave for my adviser
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
