import { Fragment, type ComponentType } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { isPolicyList } from '../../domain/finances/lists.data.ts'
import type { FinanceSection } from '../../domain/finances/sections.data.ts'
import { useStore } from '../../state/store.ts'
import AboutHousehold from './AboutHousehold.tsx'
import FinField from './FinField.tsx'
import { FINANCE_FIELDS } from '../../domain/finances/fields.data.ts'
import LiabilityLists from './LiabilityLists.tsx'
import ListBlock from './ListBlock.tsx'
import MortgageLead from './MortgageLead.tsx'
import MortgageStatementLink from './MortgageStatementLink.tsx'
import PartnerIncomeNote from './PartnerIncomeNote.tsx'
import PolicyBlock from './PolicyBlock.tsx'
import ProtectionLead from './ProtectionLead.tsx'
import StatementBar from './StatementBar.tsx'
import { visibleFields } from './status.ts'

// what a section adds at the top of its card, at the end of it, and below it
const LEAD: Record<string, ComponentType> = { liab: MortgageLead, prot: ProtectionLead }
const CARD_END: Record<string, ComponentType> = {
  income: PartnerIncomeNote,
  liab: MortgageStatementLink,
}
const BELOW: Record<string, ComponentType> = { liab: LiabilityLists, about: AboutHousehold }

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
  const Lead = LEAD[id]
  const CardEnd = CARD_END[id]
  const Below = BELOW[id]

  return (
    <>
      {fromStatement > 0 ? <StatementBar count={fromStatement} index={index} /> : null}
      {id === 'pension' ? <ListBlock list="pens" /> : null}
      {fields.length > 0 ? (
        <div className="card">
          {Lead ? <Lead /> : null}
          {fields.map((key) => (
            <Fragment key={key}>
              <FinField field={key} />
              {isPolicyList(key) ? <PolicyBlock cover={key} /> : null}
            </Fragment>
          ))}
          {CardEnd ? <CardEnd /> : null}
        </div>
      ) : null}
      {Below ? <Below /> : null}
    </>
  )
}
