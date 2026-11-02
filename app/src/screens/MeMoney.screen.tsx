import { meHead } from '../components/me/meHead.ts'
import Emo from '../components/ui/Emo.tsx'
import SectionRow from '../components/finance/SectionRow.tsx'
import { checkItems, needsAttention, type CheckState } from '../components/finance/checkList.ts'
import { FINANCE_FIELDS } from '../domain/finances/fields.data.ts'
import { backToMe, fixSection } from '../components/finance/financeActions.ts'
import { sectionStatus, sectionSummary } from '../components/finance/status.ts'
import { useStore } from '../state/store.ts'
import { useFinancePlan } from '../components/finance/useFinancePlan.ts'
import { FINANCE_SECTIONS } from '../domain/finances/sections.data.ts'

export const key = 'ME:money'
export const id = 'ME-MONEY'
export const note =
  'My money: the 6 finance sections, checklist of missing items and ones that need a look, add a document. No bank connection in this version.'

export const Head = () =>
  meHead({
    title: 'My money',
    sub: 'Keep your figures up to date. Your plan recalculates.',
    back: backToMe,
  })

const MARK: Record<CheckState, string> = { look: '⚠️', miss: '❓', ok: '', typed: '' }

export function Body() {
  const plan = useFinancePlan()
  const flagged = checkItems(plan).filter(needsAttention)

  return (
    <>
      <button
        className="btn sm"
        style={{ width: '100%' }}
        data-a="upl"
        data-p="smart"
        onClick={() => useStore.getState().startUpload('smart', ['Sample document.pdf'])}
      >
        <Emo>📥 Add a document</Emo>
      </button>
      <div style={{ marginTop: 12 }}>
        {FINANCE_SECTIONS.map((section, index) => (
          <SectionRow
            key={section.id}
            section={section}
            index={index}
            status={sectionStatus(section, plan)}
            summary={sectionSummary(section, plan)}
          />
        ))}
      </div>
      {flagged.length > 0 && (
        <div className="card">
          <b>To sharpen your plan</b>
          {flagged.map((item) => {
            const index = FINANCE_SECTIONS.indexOf(item.section)
            return (
              <div className="mini" key={item.key}>
                <span>
                  <Emo>{`${MARK[item.state]} ${FINANCE_FIELDS[item.key].label}`}</Emo>
                  {item.state === 'miss' && (
                    <>
                      {' '}
                      <span className="small">· optional</span>
                    </>
                  )}
                </span>
                <button
                  className="link"
                  data-a="fix"
                  data-p={index}
                  onClick={() => fixSection(index)}
                >
                  Fix
                </button>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
