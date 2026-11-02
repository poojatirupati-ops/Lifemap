import { Fragment, type ReactNode } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { isPolicyList } from '../../domain/finances/lists.data.ts'
import type { FinanceSection } from '../../domain/finances/sections.data.ts'
import { useStore } from '../../state/store.ts'
import Emo from '../ui/Emo.tsx'
import AboutHousehold from './AboutHousehold.tsx'
import FinField from './FinField.tsx'
import { FINANCE_FIELDS } from '../../domain/finances/fields.data.ts'
import ListBlock, { PolicyBlock } from './ListBlock.tsx'
import { visibleFields } from './status.ts'

/** Liabilities opens with the mortgage on the home they live in. */
function MortgageLead() {
  const home: string | undefined = useStore(({ plan }) => plan.figures.home)
  const answer = useStore(({ plan }) => plan.figures.mortYN)
  const onOtherProperty = !!home && !/^Own/.test(home) && answer === 'Yes'
  return (
    <>
      <b style={{ fontSize: 16 }}>
        <Emo>🏠 Mortgage</Emo>
      </b>
      <p className="small" style={{ margin: '2px 0 10px' }}>
        The mortgage on the home you live in comes first.
        {onOtherProperty
          ? ` You said "${home}", so this one is on another property. Add its details below.`
          : null}
      </p>
    </>
  )
}

/** Someone with a mortgage on their home can upload its statement. */
function MortgageStatementLink() {
  const hasMortgage = useStore(({ plan }) => plan.figures.home === 'Own with mortgage')
  if (!hasMortgage) return null
  return (
    <button
      className="link"
      data-a="upl"
      data-p="liab"
      onClick={() => useStore.getState().startUpload('liab', ['Sample document.pdf'])}
    >
      <Emo>📄 Upload your mortgage statement (optional)</Emo>
    </button>
  )
}

/** A partner who was invited adds their own income; until then it counts as €0. */
function PartnerIncomeNote() {
  const { waiting, sent, email } = useStore(
    useShallow(({ plan }) => ({
      waiting: !!plan.about.partner && plan.partner.mode === 'invite',
      sent: plan.partner.sent,
      email: plan.partner.email,
    })),
  )
  if (!waiting) return null
  return (
    <p className="note">
      <Emo>💌 Your partner adds their own income</Emo>
      {sent ? ` (invite saved for ${email})` : null}. Until then it counts as €0 in your plan.
    </p>
  )
}

/** How many of the section's figures came from a statement, with Replace and Remove. */
function StatementBar({ count, index }: { count: number; index: number }) {
  const { chooseSectionMode, removeSectionStatement } = useStore.getState()
  return (
    <div className="card" id="docbar" style={{ background: 'var(--ok-l)', boxShadow: 'none' }}>
      <b>
        <Emo>{`📄 ${count} figure${count > 1 ? 's' : ''} from your statement`}</Emo>
      </b>
      <p className="small" style={{ margin: '4px 0 6px', color: 'var(--ink)' }}>
        Statement figures are used ahead of anything typed. To use your own figures instead, remove
        the statement.
      </p>
      <div className="row" style={{ gap: 16 }}>
        <button
          className="link"
          data-a="docrep"
          data-p={index}
          onClick={() => chooseSectionMode('upload')}
        >
          Replace statement
        </button>
        <button className="link" data-a="docrem" data-p={index} onClick={removeSectionStatement}>
          Remove statement
        </button>
      </div>
    </div>
  )
}

// what a section adds above its card, at the top of it, at the end of it, and below it
const SECTION_PARTS: Record<
  string,
  Partial<Record<'above' | 'lead' | 'end' | 'below', ReactNode>>
> = {
  about: { below: <AboutHousehold /> },
  income: { end: <PartnerIncomeNote /> },
  liab: {
    lead: <MortgageLead />,
    end: <MortgageStatementLink />,
    below: (
      <>
        <div style={{ height: 12 }} />
        <ListBlock list="mort2" />
        <ListBlock list="cards" />
        <ListBlock list="loans" />
      </>
    ),
  },
  prot: {
    lead: (
      <>
        <p style={{ margin: '0 0 10px' }}>
          <b>Do you have any of the following?</b>
        </p>
        <p className="small" style={{ margin: '-4px 0 12px' }}>
          Say Yes to add the details, and a policy if you like. Add more than one of each if you
          have them.
        </p>
      </>
    ),
  },
  pension: { above: <ListBlock list="pens" /> },
}

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
    id === 'prot' ? 0 : section.fields.filter((key) => plan.sources[key] === 'doc').length,
  )
  const parts = SECTION_PARTS[id] ?? {}

  return (
    <>
      {fromStatement > 0 ? <StatementBar count={fromStatement} index={index} /> : null}
      {parts.above}
      {fields.length > 0 ? (
        <div className="card">
          {parts.lead}
          {fields.map((key) => (
            <Fragment key={key}>
              <FinField field={key} />
              {isPolicyList(key) ? <PolicyBlock cover={key} /> : null}
            </Fragment>
          ))}
          {parts.end}
        </div>
      ) : null}
      {parts.below}
    </>
  )
}
