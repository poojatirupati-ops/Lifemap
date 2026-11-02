// The results narrative must equal the ORIGINAL's output for the same plan, run in node:vm:
// journey geometry and markup, chapters, findings and the goal lines.
import type { ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { runOriginal } from '../golden/origSlice'
import { fixtures } from '../golden/origProfile'
import { project } from '../../src/domain/planning/project'
import { whatIfFrom } from '../../src/domain/planning/wi'
import { useStore } from '../../src/state/store'
import { fromOriginal } from '../../src/state/migrate'
import Chapters from '../../src/components/results/Chapters'
import Glance from '../../src/components/results/Glance'
import { Findings } from '../../src/components/plan/Results'
import { GoalLine, WhyNote } from '../../src/components/plan/GoalsCard'
import JourneySvg, { MilestoneList } from '../../src/components/results/JourneySvg'
import { isShortYear } from '../../src/domain/planning/bands'
import { planSettings } from '../../src/domain/planning/planSettings'
import { random, withoutActions } from '../golden/helpers'

// a portrait phone; the hook needs a browser
vi.mock('../../src/hooks/useViewport', () => ({ useViewport: () => ({ landscape: false }) }))
// each case runs the projection on both sides many times
vi.setConfig({ testTimeout: 60_000 })

const original = runOriginal(
  `applyAssume, syncLists, autoSafety, project, journeySVG, chaptersHTML, glanceHTML, findings, goalLine, goalWhy,
  setTextW: (f) => { textW = f }`,
)
// node has no canvas: both sides measure labels with the original's own fallback
original.setTextW((text: string, px: number) => text.length * px * 0.62 + 4)

/** React closes empty SVG shapes with an end tag; the original self-closes them. */
const markup = (element: ReactElement) =>
  renderToStaticMarkup(element)
    .replaceAll('&amp;', '&')
    .replaceAll('&#x27;', '&#39;')
    .replace(/<(line|circle|path)([^>]*)><\/\1>/g, '<$1$2/>')
/** Our emoji spans are the original's post-render hideEmoji step. */
const withoutEmojiSpans = (html: string) =>
  html.replace(/<span aria-hidden="true">([^<a-zA-Z0-9]+)<\/span>/g, '$1')
/** The first place two strings differ, with some context; null when equal. */
function firstDifference(ours: string, theirs: string) {
  ours = ours.replaceAll('&#39;', "'")
  theirs = theirs.replaceAll('&#39;', "'")
  if (ours === theirs) return null
  let i = 0
  while (ours[i] === theirs[i]) i++
  return { ours: ours.slice(i - 80, i + 120), theirs: theirs.slice(i - 80, i + 120) }
}
const text = (html: string) => html.replace(/<[^>]+>/g, '').replaceAll('&#39;', "'")

/** A plan with many goals close together, to make the milestone layout work hard. */
function crowded(seed: number) {
  const next = random(seed)
  const state = structuredClone(fixtures.find(([name]) => name === 'finances-complete.json')![1])
  const names = ['Car', 'A very long goal name for the road', 'Wedding', 'Trip', 'Boat', 'Studio']
  for (let i = 0; i < 4 + Math.floor(next() * 6); i++)
    state.goals.push({
      ...state.goals[0],
      id: 50 + i,
      name: names[i % names.length],
      age: 40 + Math.floor(next() * 50),
      amount: Math.round(next() * 90000),
    })
  return state
}

const cases = [
  ...fixtures,
  ...Array.from({ length: 12 }, (_, seed) => [`crowded ${seed + 1}`, crowded(seed + 1)] as const),
]

function both(state: any) {
  original.setState(structuredClone(state))
  original.applyAssume()
  original.syncLists()
  original.autoSafety()
  const theirPlan = structuredClone(original.getState())
  const plan: any = fromOriginal(theirPlan)
  const whatIf = whatIfFrom(plan.whatIf)
  return {
    plan,
    theirPlan,
    whatIf,
    theirs: original.project(theirPlan.wi),
    theirsBase: original.project(),
    ours: project(plan, whatIf),
    oursBase: project(plan),
    hasRetireGoal: plan.goals.some((goal: any) => goal.kind === 'retire'),
  }
}

describe.each(cases)('%s', (_, state) => {
  it.each([
    [322, false],
    [560, false],
    [780, true],
  ])('journey at width %i (landscape %s)', (width, landscape) => {
    const { plan, theirs, ours, hasRetireGoal } = both(state)
    const milestones = plan.goals
      .filter((goal: any) => goal.kind !== 'retire')
      .toSorted((a: any, b: any) => a.age - b.age || a.id - b.id)
    const hasShortYear = ours.rows.some(isShortYear)
    const props = {
      rows: ours.rows,
      milestones,
      percent: ours.percent,
      hasRetireGoal,
      hasShortYear,
    }
    const ourSvg = markup(
      <>
        <JourneySvg {...props} width={width} landscape={landscape} />
        {width > 500 ? null : <MilestoneList goals={milestones} percent={ours.percent} />}
      </>,
    )
    expect(firstDifference(ourSvg, original.journeySVG(theirs, width, landscape))).toBeNull()
  })

  it('chapters, closed and with one open', () => {
    const { plan, theirs, ours, hasRetireGoal } = both(state)
    for (const open of [null, 1]) {
      useStore.getState().load({ ...plan, openChapter: open, screen: 'PLAN' })
      // server rendering reads the store's first state
      Object.assign(useStore.getInitialState(), useStore.getState())
      original.getState().chapOpen = open
      const props = { rows: ours.rows, goals: plan.goals, percent: ours.percent, hasRetireGoal }
      const ourChapters = withoutEmojiSpans(markup(<Chapters {...props} />))
      expect(firstDifference(ourChapters, withoutActions(original.chaptersHTML(theirs)))).toBeNull()
    }
  })

  it('glance, journey and chapters views', () => {
    const { plan, theirs, ours } = both(state)
    for (const view of ['journey', 'chapters']) {
      useStore.getState().load({ ...plan, resultsView: view, screen: 'PLAN' })
      Object.assign(useStore.getInitialState(), useStore.getState())
      original.getState().view = view
      const ourGlance = withoutEmojiSpans(markup(<Glance projection={ours} />))
      expect(firstDifference(ourGlance, withoutActions(original.glanceHTML(theirs)))).toBeNull()
    }
  })

  it('findings and goal lines', () => {
    const { plan, theirPlan, whatIf, theirs, theirsBase, ours, oursBase } = both(state)
    if (!plan.goals.length) return
    const found = original.findings(theirsBase)
    const cards = markup(<Findings plan={plan} projection={oursBase} />).match(/<b>.*?<\/b>/g)!
    expect(cards.map(text)).toEqual([found.sT, found.gT, found.dT])
    for (const [index, goal] of plan.goals.entries()) {
      const props = { plan, projection: ours, goal }
      const theirGoal = theirPlan.goals[index]
      expect(text(markup(<GoalLine {...props} whatIf={whatIf} />))).toBe(
        original.goalLine(theirs, theirGoal),
      )
      // the original starts with a space when nothing is saved yet; a div collapses it
      const { figures } = planSettings(plan)
      expect(text(markup(<WhyNote {...props} figures={figures} />))).toBe(
        original.goalWhy(theirs, theirGoal).trim(),
      )
    }
  })
})
