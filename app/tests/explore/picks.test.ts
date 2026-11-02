// Explore's picks and catalogue must equal the ORIGINAL script's, run in node:vm.
import { describe, expect, it } from 'vitest'
import { runOriginal } from '../golden/origSlice'
import { fixtures } from '../golden/origProfile'
import { project } from '../../src/domain/planning/project'
import { planMissing } from '../../src/domain/plan/readiness'
import {
  toolsForYou,
  videosForYou,
  weakestGoal,
  whyThisVideo,
} from '../../src/domain/explore/picks'
import { CATEGORIES, TOOLS } from '../../src/components/explore/tools.data'
import { fromOriginal } from '../../src/state/migrate'
import snapshot from '../content/cms.json'

// the seeded CMS videos, as the app keys them
const VIDEOS = snapshot['videos?limit=100&depth=1&sort=createdAt'].map((v) => ({
  ...v,
  id: v.appId,
}))

const original = runOriginal(
  'applyAssume, syncLists, toolsForYou, videosForYou, xWorst, CALCS, CATS',
)

describe('Explore picks', () => {
  it.each(fixtures)('%s', (_, state) => {
    original.setState(structuredClone(state))
    original.applyAssume()
    original.syncLists()
    const plan: any = fromOriginal(structuredClone(original.getState()))
    const specs = plan.goals.map((goal: { spec: string }) => goal.spec)
    const percent = plan.hasResults ? project(plan).percent : {}
    const ready = plan.hasResults && !planMissing(plan).length
    const weakest = ready ? weakestGoal(plan.goals, percent) : null

    expect(toolsForYou(specs)).toEqual(original.toolsForYou())
    expect(weakest?.id ?? null).toEqual(original.xWorst()?.id ?? null)
    expect(videosForYou(VIDEOS, specs, weakest?.spec).map((v) => v.id)).toEqual(
      original.videosForYou().map((v: { id: string }) => v.id),
    )
  })

  it('says why a video was picked only once the plan is ready', () => {
    const goals = [{ id: 1, name: 'Retirement', kind: 'retire', spec: 'pension' }] as never
    expect(whyThisVideo(goals, { 1: 62 }, true, 'pension')).toBe(
      'Your retirement goal is 62% covered.',
    )
    expect(whyThisVideo(goals, { 1: 62 }, false, 'pension')).toBeNull()
    expect(whyThisVideo(goals, { 1: 62 }, true, 'mortgage')).toBeNull()
  })

  it('lists the same calculators and groups', () => {
    const calcs = original.CALCS.map((c: any) => [c.id, c.cat, c.name, c.q, c.em])
    expect(TOOLS.map((t) => [t.id, t.category, t.name, t.question, t.emoji])).toEqual(calcs)
    expect(CATEGORIES.map((c) => [c.id, c.name, c.emoji, c.color, c.blurb])).toEqual(
      original.CATS.map((c: any) => [c.id, c.name, c.em, c.color, c.blurb]),
    )
  })
})
