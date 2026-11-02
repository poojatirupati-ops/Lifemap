// Explore's calculators and statement uploads: what their controls do.
import { calculatorFor } from '../domain/calc/calculators.ts'
import { isSafetyMonthsInput } from '../domain/calc/emergency.calc.ts'
import { toolPlan } from '../domain/calc/context.ts'
import { toolStandard } from '../domain/calc/guide.ts'
import { confirmStatement, defaultFiles, removeStatement } from '../domain/calc/statements.ts'
import type { DocumentRead } from '../domain/finances/upload.ts'
import { STATEMENT_KINDS } from '../domain/calc/statements.data.ts'
import { missingFigures, missingText, toolFigures } from '../domain/calc/values.ts'
import { clampSafetyMonths } from '../domain/goals/goals.ts'
import { assumption } from '../domain/planning/assumptions.ts'
import { rulesFor } from '../domain/planning/rates.ts'
import { STATEMENT_REMOVED } from './finances.ts'
import type { SetStore, Store } from './store.ts'
import { toast } from './shell.ts'
import { openCalculator, openExplorePage } from './explore.ts'
import { currentPath, goTo, router } from '../shell/router.ts'

export function createCalcSlice(set: SetStore, get: () => Store) {
  const update: Store['update'] = (recipe) => get().update(recipe)
  const currentRules = () => rulesFor(assumption(get().plan, 'startYear'))

  return {
    /** The customer moved or typed a figure: it is theirs in this tool from now on. */
    setFigure: (toolId: string, key: string, value: number) =>
      update((plan, ui) => {
        ;(ui.calcValues[toolId] ??= {})[key] = value
        ;(ui.calcTouched[toolId] ??= {})[key] = true
        if (isSafetyMonthsInput(toolId, key))
          plan.assumptions.safetyMonths = clampSafetyMonths(value)
      }),

    /** "Use the standard (X)" or "Use the suggested rate (X)". */
    chooseStandard: (toolId: string, key: string) => {
      const standard = toolStandard(get().plan, toolId, key)
      if (standard) get().setFigure(toolId, key, standard.value)
    },

    /** "Adjust for inflation": the result in today's money. */
    toggleTodaysMoney: (toolId: string) =>
      update(
        (_, ui) =>
          void (ui.todaysMoney = { ...ui.todaysMoney, [toolId]: !ui.todaysMoney?.[toolId] }),
      ),

    changeInflation: () => set({ editingInflation: true }),

    /** Add to my plan: confirm in a sheet, or say what is still missing. */
    addToPlan: (toolId: string) => {
      const calculator = calculatorFor(toolId)
      const { plan } = get()
      const figures = toolFigures(calculator, toolPlan(plan, get(), calculator.id))
      const [missing] = missingFigures(calculator, figures, plan.assumptions)
      if (missing) toast(`${missingText(missing)} first`)
      else get().openSheet(`calcadd|${toolId}`)
    },

    /** Upload a statement (or use the sample one). Documents need a secured account first. With `read` (read by the API) straight to confirm. */
    startStatement: (cat: string, files: string[] = defaultFiles(cat), read?: DocumentRead) => {
      if (read && (read.failed || !Object.keys(read.fields).length)) {
        toast("We couldn't read that statement. Try another, or type the figures into the tools.")
        return
      }
      // documents need a verified email: sign in, then back to this page
      if (!get().plan.account.emailVerified)
        return void goTo(`/sign-in?redirect=${encodeURIComponent(router.state.location.href)}`)
      update((_, ui) => {
        ui.statement = { cat, stage: read ? 'confirm' : 'scan', files, edit: {}, read }
      })
      void openExplorePage('/explore/statement', currentPath() === '/explore/statement')
    },

    /** The sample statement's short scan has finished: the figures are ready to confirm. */
    statementRead: () =>
      update((_, ui) => {
        if (ui.statement?.stage === 'scan') ui.statement.stage = 'confirm'
      }),

    /** The customer corrects a figure we read (kept as typed until they confirm). */
    correctStatementFigure: (key: string, text: string) =>
      update((_, ui) => {
        if (ui.statement) ui.statement.edit[key] = text
      }),

    /** "Looks right, fill in my tools": on to the tool the statement fills in. */
    confirmUpload: () => {
      const upload = get().statement
      if (!upload) return
      const kind = STATEMENT_KINDS[upload.cat]
      const rules = currentRules()
      update((plan, ui) => {
        confirmStatement(plan, ui, upload, rules)
      })
      // the statement page gives way to the tool it filled, with its group under it
      void openExplorePage(`/explore/category/${upload.cat}`, true).then(() => {
        set({ statement: null })
        return openCalculator(kind.opens)
      })
      toast(
        get().plan.hasResults
          ? `Added to your plan too (${kind.where})`
          : 'Saved. Your plan will use it when you make it',
      )
    },

    removeUploadedStatement: (cat: string) => {
      const rules = currentRules()
      update((plan, ui) => removeStatement(plan, ui, cat, rules))
      toast(STATEMENT_REMOVED)
    },
  }
}

export type CalcActions = ReturnType<typeof createCalcSlice>
