// Your finances (P2) and Check your details (P4) must read each plan as the ORIGINAL does, run in node:vm.
import { describe, expect, it } from 'vitest'
import { fromOriginal } from '../../src/state/migrate'
import { runOriginal } from './origSlice'
import { fixtures, plain } from './origProfile'
import { FINANCE_SECTIONS } from '../../src/domain/finances/sections.data'
import { FINANCE_FIELDS } from '../../src/domain/finances/fields.data'
import {
  checkItems,
  withRepaymentLooks,
  workedOutNote,
} from '../../src/components/finance/checkList'
import { missingChoices } from '../../src/components/finance/requiredChoices'
import {
  hasMinimumFinances,
  sectionStatus,
  sectionSummary,
  skippedSections,
} from '../../src/components/finance/status'

const original = runOriginal(
  'applyAssume, syncLists, FF, FSEC, secStatus, secSummary, minOK, skippedSecs, checkItems, workedNote, req3Missing',
)

function readOriginal(state: any) {
  original.setState(structuredClone(state))
  original.applyAssume()
  original.syncLists()
  const items = original.checkItems() // also flags low repayments into S.look
  return {
    state: structuredClone(original.getState()),
    statuses: original.FSEC.map(original.secStatus),
    summaries: original.FSEC.map(original.secSummary),
    minimum: original.minOK(),
    skipped: original.skippedSecs().map((section: any) => section.id),
    items: items.map((item: any) => [item.k, item.s.id, item.st]),
    worked: ['mortPayM', 'cardPayM', 'loanPayM'].map(original.workedNote),
    missing: original.req3Missing().map((choice: any) => choice.k),
  }
}

// partly filled plans with low repayments, so every branch has something to compare
const variants = (state: any) => [
  state,
  {
    ...state,
    fin: { ...state.fin, cardBal: 4000, cardPayM: 20, cardRate: 22 },
    src: { ...state.src, cardBal: 'typed', cardPayM: 'typed' },
  },
  {
    ...state,
    fin: { ...state.fin, home: 'Own with mortgage', mortBal: 300000, mortPayM: 0, mortYears: 20 },
    src: { ...state.src, mortPayM: 'typed' },
  },
  { ...state, fin: { ...state.fin, loanBal: 9000, loanPayM: 0 }, look: {}, ack: { income: true } },
]

const flaggedLooks: string[] = []
const workedNotes: string[] = []

describe('finances check equals the original', () => {
  it('field labels, types and hints', () => {
    for (const [key, field] of Object.entries(FINANCE_FIELDS)) {
      const theirs = original.FF[key]
      expect([field.label, field.type, field.hint, !!field.optional, field.options]).toEqual([
        theirs.l,
        theirs.type,
        theirs.hint,
        !!theirs.opt,
        theirs.o && plain(theirs.o),
      ])
    }
    expect(Object.keys(FINANCE_FIELDS).sort()).toEqual(Object.keys(original.FF).sort())
  })

  for (const [name, fixture] of fixtures) {
    variants(fixture).forEach((state, variant) => {
      it(`${name} #${variant}`, () => {
        const theirs = readOriginal(state)
        // the same synced plan, before the original flagged anything
        const synced: any = fromOriginal(theirs.state)
        const plan = {
          ...synced,
          warnings: withRepaymentLooks({ ...synced, warnings: structuredClone(state.look ?? {}) }),
        }
        expect(plan.warnings).toEqual(plain(theirs.state.look))
        flaggedLooks.push(...Object.keys(plan.warnings))
        workedNotes.push(...theirs.worked.filter(Boolean))
        expect(FINANCE_SECTIONS.map((section) => sectionStatus(section, plan))).toEqual(
          theirs.statuses,
        )
        expect(FINANCE_SECTIONS.map((section) => sectionSummary(section, plan))).toEqual(
          theirs.summaries,
        )
        expect(hasMinimumFinances(plan)).toBe(theirs.minimum)
        expect(skippedSections(plan).map(({ id }) => id)).toEqual(theirs.skipped)
        expect(checkItems(plan).map((item) => [item.key, item.section.id, item.state])).toEqual(
          theirs.items,
        )
        expect(['mortPayM', 'cardPayM', 'loanPayM'].map((key) => workedOutNote(key, plan))).toEqual(
          theirs.worked,
        )
        expect(missingChoices(plan).map(({ key }) => key)).toEqual(theirs.missing)
      })
    })
  }

  it('the variants reach the repayment flags and worked-out notes', () => {
    expect(flaggedLooks).toEqual(expect.arrayContaining(['cardPayM']))
    expect(workedNotes.length).toBeGreaterThan(0)
  })
})
