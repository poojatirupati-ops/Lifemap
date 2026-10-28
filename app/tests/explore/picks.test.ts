// Explore's picks and catalogue must equal the ORIGINAL script's, run in node:vm.
import { describe, expect, it } from 'vitest'
import { runOriginal } from '../golden/origSlice'
import { fixtures } from '../golden/origProfile'
import { project } from '../../src/domain/planning/project'
import { planMissing } from '../../src/report/model/readiness'
import { toolsForYou, videosForYou, weakestGoal } from '../../src/components/explore/picks'
import { CATEGORIES, TOOLS, TOPICS } from '../../src/components/explore/explore.data'
import { VIDEOS } from '../../src/components/explore/videos.data'

const original = runOriginal(
  'applyAssume, syncLists, toolsForYou, videosForYou, xWorst, CALCS, CATS, TOPICS, TOPIC_TOOLS, VIDEOS',
)

describe('Explore picks', () => {
  it.each(fixtures)('%s', (_, state) => {
    original.setState(structuredClone(state))
    original.applyAssume()
    original.syncLists()
    const plan = structuredClone(original.getState())
    const specs = plan.goals.map((goal: { spec: string }) => goal.spec)
    const percent = plan.app ? project(plan).percent : {}
    const ready = plan.app && !planMissing(plan).length
    const weakest = ready ? weakestGoal(plan.goals, percent) : null

    expect(toolsForYou(specs)).toEqual(original.toolsForYou())
    expect(weakest?.id ?? null).toEqual(original.xWorst()?.id ?? null)
    expect(videosForYou(specs, weakest?.spec).map((v) => v.id)).toEqual(
      original.videosForYou().map((v: { id: string }) => v.id),
    )
  })

  it('lists the same calculators, groups, topics and videos', () => {
    const calcs = original.CALCS.map((c: any) => [c.id, c.cat, c.name, c.q, c.em])
    expect(TOOLS.map((t) => [t.id, t.category, t.name, t.question, t.emoji])).toEqual(calcs)
    expect(CATEGORIES.map((c) => [c.id, c.name, c.emoji, c.color, c.blurb])).toEqual(
      original.CATS.map((c: any) => [c.id, c.name, c.em, c.color, c.blurb]),
    )
    expect(TOPICS.map((t) => [t.emoji, t.name, t.blurb, t.expert, t.category, t.tools])).toEqual(
      original.TOPICS.map((t: string[]) => [...t, original.TOPIC_TOOLS[t[1]]]),
    )
    expect(VIDEOS.map((v) => [v.id, v.title, v.kind, v.tool, v.art, v.transcript])).toEqual(
      original.VIDEOS.map((v: any) => [v.id, v.t, v.kind, v.tool, v.art, v.transcript]),
    )
  })
})
