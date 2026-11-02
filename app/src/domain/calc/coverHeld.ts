// Life cover the customer already has, from Your finances.
import { isNumber } from '../../lib/format.ts'
import type { Plan } from '../../state/types.ts'

/** Life cover the customer has (their own and through work). */
export function coverHeld({ figures: fin, lists }: Pick<Plan, 'figures' | 'lists'>, income: number) {
  const total = (list: 'life' | 'workCover') =>
    fin[list] !== 'Yes'
      ? 0
      : (lists[list] ?? []).reduce((sum, { fields: f }) => {
          if (isNumber(f.amount)) return sum + Number(f.amount)
          if (list === 'workCover' && isNumber(f.mult) && income > 0)
            return sum + Number(f.mult) * income
          return sum
        }, 0)
  return total('life') + total('workCover')
}
