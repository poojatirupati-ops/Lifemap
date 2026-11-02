// Life cover the customer already has, from Your finances.
import { isNumber } from '../../lib/format.ts'
import type { Plan } from '../../state/types.ts'

/** Life cover the customer has (their own and through work). */
export function coverHeld({ figures, lists }: Pick<Plan, 'figures' | 'lists'>, income: number) {
  const total = (list: 'life' | 'workCover') =>
    figures[list] !== 'Yes'
      ? 0
      : (lists[list] ?? []).reduce((sum, { fields }) => {
          if (isNumber(fields.amount)) return sum + Number(fields.amount)
          if (list === 'workCover' && isNumber(fields.mult) && income > 0)
            return sum + Number(fields.mult) * income
          return sum
        }, 0)
  return total('life') + total('workCover')
}
