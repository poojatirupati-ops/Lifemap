import { euro } from '../../lib/format.ts'
import { type Calculator } from './types.ts'
import { takeHome } from './everyday.shared.ts'

export const budget: Calculator = {
  id: 'budget',
  inputs: [takeHome],
  run({ inc }, context) {
    const [needs, wants, save] = ['budgetNeeds', 'budgetWants', 'budgetSave'].map((key) =>
      Number(context.assumption(key)),
    )
    const share = (part: number) => Math.round(part * 100) + '%'
    const total = needs + wants + save
    const check =
      Math.abs(total - 1) > 1e-6 ? `Your shares add up to ${share(total)}, not 100%. ` : ''
    return {
      label: 'Save each month',
      value: euro(inc * save),
      line: `${check}A common starting point: ${share(needs)} needs, ${share(wants)} wants, ${share(save)} savings and debt. Adjust it to fit your life in Your assumptions.`,
      rows: [
        [`Needs (${share(needs)})`, euro(inc * needs)],
        [`Wants (${share(wants)})`, euro(inc * wants)],
        [`Savings & debt (${share(save)})`, euro(inc * save)],
      ],
      goal: null,
      numbers: {
        Save: inc * save,
        Needs: inc * needs,
        Wants: inc * wants,
        Split_Check: check.trim(),
      },
    }
  },
}
