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
import { STATEMENT_REMOVED } from './finances.ts'
import type { SetStore, Store } from './store.ts'
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

export function createCalcSlice(set: SetStore, get: () => Store): CalcActions {
  const update: Store['update'] = (recipe) => get().update(recipe)
  const currentRules = () => rulesFor(assumption(get().plan, 'startYear'))

  return {
    setFigure: (toolId, key, value) =>
      update((plan, ui) => {
        ;(ui.calcValues[toolId] ??= {})[key] = value
        ;(ui.calcTouched[toolId] ??= {})[key] = true
        if (isSafetyMonthsInput(toolId, key))
          plan.assumptions.safetyMonths = clampSafetyMonths(value)
      }),

    chooseStandard: (toolId, key) => {
      const standard = toolStandard(get().plan, toolId, key)
      if (standard) get().setFigure(toolId, key, standard.value)
    },

    toggleTodaysMoney: (toolId) =>
      update(
        (_, ui) =>
          void (ui.todaysMoney = { ...ui.todaysMoney, [toolId]: !ui.todaysMoney?.[toolId] }),
      ),

    changeInflation: () => set({ editingInflation: true }),

    addToPlan: (toolId) => {
      const calculator = calculatorFor(toolId)
      const { plan } = get()
      const figures = toolFigures(calculator, toolPlan(plan, get(), calculator.id))
      const [missing] = missingFigures(calculator, figures, plan.assumptions)
      if (missing) toast(`${missingText(missing)} first`)
      else get().openSheet(`calcadd|${toolId}`)
    },

    startStatement: (cat, files = defaultFiles(cat)) => {
      const { plan, screen } = get()
      if (!plan.account.emailVerified) {
        update((_, ui) => {
          ui.afterGate = { k: 'pst', cat, files, scr: screen }
          ui.explorePages.push({ page: 'ACCT' })
        })
        get().go('P1')
        return
      }
      update((_, ui) => {
        ui.statement = { cat, stage: 'scan', files, edit: {} }
        ui.explorePages = ui.explorePages.filter(({ page }) => page !== 'ACCT' && page !== 'PST')
        ui.explorePages.push({ page: 'PST' })
      })
    },

    statementRead: () =>
      update((_, ui) => {
        if (ui.statement?.stage === 'scan') ui.statement.stage = 'confirm'
      }),

    correctStatementFigure: (key, text) =>
      update((_, ui) => {
        if (ui.statement) ui.statement.edit[key] = text
      }),

    confirmUpload: () => {
      const upload = get().statement
      if (!upload) return
      const kind = STATEMENT_KINDS[upload.cat]
      const rules = currentRules()
      update((plan, ui) => {
        confirmStatement(plan, ui, upload, rules)
        ui.statement = null
        ui.explorePages = [
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
      update((plan, ui) => removeStatement(plan, ui, cat, rules))
      toast(STATEMENT_REMOVED)
    },
  }
}
