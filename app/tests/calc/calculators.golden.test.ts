// Each calculator's result (headline, sentence, rows, plan hand-off, workbook numbers) equals the original's.
import { describe, expect, it } from 'vitest'
import { TOOLS } from '../../src/components/explore/explore.data'
import { exampleFigures, figureSets, original, PLANS, runBoth } from './golden'

describe.each(TOOLS.map((t) => t.id))('%s', (id) => {
  it.each(PLANS)('equals the original on %s', (_, plan) => {
    for (const figures of figureSets(id)) {
      const { theirs, ours } = runBoth(plan, id, figures)
      expect(ours, JSON.stringify(figures)).toEqual(theirs)
    }
  })
})

describe('retirement with a pension statement', () => {
  const withStatement = (projToday?: string) => {
    original.setState({
      ...structuredClone(PLANS[1][1]),
      pst: { cat: 'retire', stage: 'confirm', files: [], edit: {} },
      xs: [],
    })
    original.applyAssume()
    original.pstConfirm()
    const plan = structuredClone(original.getState())
    if (projToday) plan.pdocs.retire.v.projToday = projToday
    return plan
  }
  it.each([undefined, 'Yes'])('uses its projection at its retirement age (today: %s)', (today) => {
    const plan = withStatement(today)
    for (const ra of [66, 65]) {
      const figures = { ...exampleFigures('retirement'), ra, more: 0 }
      const { theirs, ours } = runBoth(plan, 'retirement', figures)
      expect(ours).toEqual(theirs)
    }
  })
})
