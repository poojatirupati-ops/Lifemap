import { Fragment, type ReactNode } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { LISTS, type ListKey } from '../../domain/finances/lists.data.ts'
import type { FinanceSection } from '../../domain/finances/sections.data.ts'
import { useStore } from '../../state/store.ts'
import Emo from '../ui/Emo.tsx'
import AboutHousehold from './AboutHousehold.tsx'
import FinField from './FinField.tsx'
import { FINANCE_FIELDS } from './fields.data.ts'
import ListBlock from './ListBlock.tsx'
import PolicyBlock from './PolicyBlock.tsx'
import StatementBar from './StatementBar.tsx'
import { visibleFields } from './status.ts'
import { startUpload } from './uploadActions.ts'

const isPolicy = (key: string) => (LISTS as Record<string, { isPolicy?: true }>)[key]?.isPolicy

/** A section typed in: statement bar, its fields, and its lists. */
export default function SectionFields({
  section,
  index,
}: {
  section: FinanceSection
  index: number
}) {
  const { id } = section
  const fields = useStore(
    useShallow(({ plan }) =>
      visibleFields(section, plan).filter(
        (key) => !(id === 'about' && key === 'pAge') && !FINANCE_FIELDS[key].fromList,
      ),
    ),
  )
  const fromStatement = useStore(({ plan }) =>
    id === 'prot' ? 0 : section.fields.filter((key) => plan.src[key] === 'doc').length,
  )
  const home: string | undefined = useStore(({ plan }) => plan.fin.home)
  const otherMortgage = useStore(
    ({ plan }) => !!home && !/^Own/.test(home) && plan.fin.mortYN === 'Yes',
  )
  const invite = useStore(
    useShallow(({ plan }) => ({
      waiting: id === 'income' && !!plan.about.partner && plan.partner.mode === 'invite',
      sent: plan.partner.sent,
      email: plan.partner.email,
    })),
  )

  const lead: ReactNode =
    id === 'liab' ? (
      <>
        <b style={{ fontSize: 16 }}>
          <Emo>🏠 Mortgage</Emo>
        </b>
        <p className="small" style={{ margin: '2px 0 10px' }}>
          The mortgage on the home you live in comes first.
          {otherMortgage &&
            ` You said "${home}", so this one is on another property. Add its details below.`}
        </p>
      </>
    ) : id === 'prot' ? (
      <>
        <p style={{ margin: '0 0 10px' }}>
          <b>Do you have any of the following?</b>
        </p>
        <p className="small" style={{ margin: '-4px 0 12px' }}>
          Say Yes to add the details, and a policy if you like. Add more than one of each if you
          have them.
        </p>
      </>
    ) : null

  return (
    <>
      {fromStatement > 0 && <StatementBar count={fromStatement} index={index} />}
      {id === 'pension' && <ListBlock list="pens" />}
      {fields.length > 0 && (
        <div className="card">
          {lead}
          {fields.map((key) => (
            <Fragment key={key}>
              <FinField field={key} />
              {isPolicy(key) && <PolicyBlock cover={key as ListKey} />}
            </Fragment>
          ))}
          {invite.waiting && (
            <p className="note">
              <Emo>💌 Your partner adds their own income</Emo>
              {invite.sent && ` (invite saved for ${invite.email})`}. Until then it counts as €0 in
              your plan.
            </p>
          )}
          {id === 'liab' && home === 'Own with mortgage' && (
            <button
              className="link"
              data-a="upl"
              data-p="liab"
              onClick={() => startUpload('liab', ['Sample document.pdf'])}
            >
              <Emo>📄 Upload your mortgage statement (optional)</Emo>
            </button>
          )}
        </div>
      )}
      {id === 'liab' && (
        <>
          <div style={{ height: 12 }} />
          <ListBlock list="mort2" />
          <ListBlock list="cards" />
          <ListBlock list="loans" />
        </>
      )}
      {id === 'about' && <AboutHousehold />}
    </>
  )
}
