// Explore's calculators and statement uploads: what their controls do.
import { calculatorFor } from '../domain/calc/calculators.ts'
import { isSafetyMonthsInput } from '../domain/calc/emergency.calc.ts'
import { toolPlan } from '../domain/calc/context.ts'
import { toolStandard } from '../domain/calc/guide.ts'
import { confirmStatement, defaultFiles, removeStatement } from '../domain/calc/statements.ts'
import { STATEMENT_KINDS } from '../domain/calc/statements.data.ts'
import { missingFigures, missingText, toolFigures } from '../domain/calc/values.ts'
import { clampSafetyMonths } from '../domain/goals/goals.ts'
import { assumption } from '../domain/planning/assumptions.ts'
import { rulesFor } from '../domain/planning/rates.ts'
import { STATEMENT_REMOVED, type StoreCore } from './finances.ts'
import { toast } from './shell.ts'

export interface CalcActions {
  /** The customer moved or typed a figure: it is theirs in this tool from now on. */
  setFigure: (toolId: string, key: string, value: number) => void
  /** "Use the standard (X)" or "Use the suggested rate (X)". */
  chooseStandard: (toolId: string, key: string) => void
  /** "Adjust for inflation": the result in today's money. */
  toggleTodaysMoney: (toolId: string) => void
  changeInflation: () => void
  /** Add to my plan: confirm in a sheet, or say what is still missing. */
  addToPlan: (toolId: string) => void
  /** Upload a statement (or use the sample one). Documents need a secured account first. */
  startStatement: (cat: string, files?: string[]) => void
  /** The (mock) reader has finished: the figures are ready to confirm. */
  statementRead: () => void
  /** The customer corrects a figure we read (kept as typed until they confirm). */
  correctStatementFigure: (key: string, text: string) => void
  /** "Looks right, fill in my tools": on to the tool the statement fills in. */
  confirmUpload: () => void
  removeUploadedStatement: (cat: string) => void
}

type CalcStore = StoreCore & CalcActions & { screen: string; openSheet: (sheet: string) => void }

export function createCalcSlice(get: () => CalcStore): CalcActions {
  const update: StoreCore['update'] = (recipe) => get().update(recipe)
  const currentRules = () => rulesFor(assumption(get().plan, 'startYear'))

  return {
    setFigure: (toolId, key, value) =>
      update((plan) => {
        ;(plan.calcValues[toolId] ??= {})[key] = value
        ;(plan.calcTouched[toolId] ??= {})[key] = true
        if (isSafetyMonthsInput(toolId, key)) plan.assumptions.safetyMonths = clampSafetyMonths(value)
      }),

    chooseStandard: (toolId, key) => {
      const standard = toolStandard(get().plan, toolId, key)
      if (standard) get().setFigure(toolId, key, standard.value)
    },

    toggleTodaysMoney: (toolId) =>
      update((plan) => {
        plan.todaysMoney = { ...plan.todaysMoney, [toolId]: !plan.todaysMoney?.[toolId] }
      }),

    changeInflation: () =>
      update((plan) => {
        plan.editingInflation = true
      }),

    addToPlan: (toolId) => {
      const calculator = calculatorFor(toolId)
      const plan = get().plan
      const figures = toolFigures(calculator, toolPlan(plan, calculator.id))
      const [missing] = missingFigures(calculator, figures, plan.assumptions)
      if (missing) toast(`${missingText(missing)} first`)
      else get().openSheet(`calcadd|${toolId}`)
    },

    startStatement: (cat, files = defaultFiles(cat)) => {
      const { plan, screen } = get()
      if (!(plan.account.emailVerified && plan.account.mobileVerified)) {
        update((draft) => {
          draft.afterGate = { k: 'pst', cat, files, scr: screen }
          draft.explorePages.push({ page: 'ACCT' })
        })
        get().go('P1')
        return
      }
      update((draft) => {
        draft.statement = { cat, stage: 'scan', files, edit: {} }
        draft.explorePages = draft.explorePages.filter(({ page: v }) => v !== 'ACCT' && v !== 'PST')
        draft.explorePages.push({ page: 'PST' })
      })
    },

    statementRead: () =>
      update((plan) => {
        if (plan.statement?.stage === 'scan') plan.statement.stage = 'confirm'
      }),

    correctStatementFigure: (key, text) =>
      update((plan) => {
        if (plan.statement) plan.statement.edit[key] = text
      }),

    confirmUpload: () => {
      const upload = get().plan.statement
      if (!upload) return
      const kind = STATEMENT_KINDS[upload.cat]
      const rules = currentRules()
      update((plan) => {
        confirmStatement(plan, upload, rules)
        plan.statement = null
        plan.explorePages = [
          { page: 'XCAT', param: upload.cat },
          { page: 'CALC', param: kind.opens },
        ]
      })
      toast(
        get().plan.hasResults
          ? `Added to your plan too (${kind.where})`
          : 'Saved. Your plan will use it when you make it',
      )
    },

    removeUploadedStatement: (cat) => {
      const rules = currentRules()
      update((plan) => removeStatement(plan, cat, rules))
      toast(STATEMENT_REMOVED)
    },
  }
}
