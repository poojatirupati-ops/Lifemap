// Plans saved before the rename, and the original's snapshots, use the prototype's short field names.
// A plan from the API is migrated, completed from a fresh plan and checked with zod before it is used.
import { z } from 'zod'
import { fresh, freshUi } from './fresh.ts'
import type { Plan } from './types.ts'

// old path (in the old names; * is every entry) > readable name
const RENAMES = `
  scr>screen dv>listsFedTotals about.dob.d>day about.dob.m>month about.dob.y>year
  about.pdob.d>day about.pdob.m>month about.pdob.y>year about.deps>dependants
  about.pdob>partnerDob about._dobAge>dobAge about.cred>taxCredits goals.*.k>key
  goals.*.e>emoji goals.*.prio>priority man.*.v>value man.*.src>source lists.*.*.man.*.v>value
  lists.*.*.man.*.src>source lists.*.*.f>fields lists.*.*.src>sources
  lists.*.*.conf>confidence lists.*.*.man>manual lists.*.*.fix>fixed pdocs.*.v>figures
  acct.c1>termsAccepted acct.c2>marketingConsent acct.ev>emailVerified acct.sv>mobileVerified
  acct.pk>passkey acct>account di>discoverStep ans>answers admin>adminView wi.g>goalId
  wi.m>monthlyExtra wi.l>lumpSum pref.g>goalId pref.m>monthlyExtra pref.l>lumpSum wi>whatIf
  pref>preferredWhatIf gid>nextGoalId pRet>partnerRetireAge pRetSet>partnerRetireSet
  asm>assumptions saved>savedSections infl>inflation inflEdit>editingInflation
  assume>assumptionSet saveM>monthlySaving saveUp>savingAtRule penExtra>pensionExtra
  um.a>answers um.sec>section um.ret>returnTo um>moneyProfile fin>figures src>sources
  conf>confidence look>warnings ack>acknowledged man>manual fix>fixed docOf>documentOf
  iid>nextItemId lt>listsChanged fsec>financeSection fmode>entryMode upl>upload pst>statement
  pdocs>statements advRate>ratesForAdviser xs.*.v>page xs.*.p>param xs>explorePages
  app>hasResults shell>inShell pb>planBuilder planSeg>planSegment planGo>planScrollTo
  planEdit>editingGoals me>mePage exp>expertsPage view>resultsView from>cameFrom rt>returnTo
  tlOpen>timelineOpen tlHl>highlightedGoal chapOpen>openChapter xf>focusArea vf>videoFilter
  play>playing after>afterGate adjInfl>todaysMoney calcT>calcTouched
  calcDoc>calcStatementFigures calcSrc>calcStatementKeys calcV>calcValues
  meEdit>editingAnswers asmOpen>openAssumption asmBack>assumptionsBack book.adv>adviser
  needs.ip>incomeProtection book>booking advQs>adviserQuestions
`
  .trim()
  .split(/\s+/)
  .map((entry) => entry.split('>'))
  .map(([path, to]) => ({ path: path.split('.'), to }))
  .toSorted((a, b) => b.path.length - a.path.length) // inner fields first, while their parents keep the old names

type Node = Record<string, unknown>
const isNode = (value: unknown): value is Node => typeof value === 'object' && value !== null

/** Renames one field at a path ('*' = every entry), keeping the key order; a field already under the new name wins. */
function renameAt(node: unknown, [head, ...rest]: string[], to: string): unknown {
  if (!isNode(node)) return node
  if (head === '*') {
    if (Array.isArray(node)) return node.map((child) => renameAt(child, rest, to))
    return Object.fromEntries(
      Object.entries(node).map(([key, child]) => [key, renameAt(child, rest, to)]),
    )
  }
  if (!(head in node)) return node
  if (rest.length) return { ...node, [head]: renameAt(node[head], rest, to) }
  return Object.fromEntries(
    Object.entries(node).flatMap(([key, value]) => {
      if (key !== head) return [[key, value]]
      return to in node ? [] : [[to, value]]
    }),
  )
}

/** A plan or snapshot in the readable names; one already in them comes back unchanged. */
export const fromOriginal = <T>(saved: object): T =>
  RENAMES.reduce<unknown>((node, { path, to }) => renameAt(node, path, to), saved) as T

/** Back to the original's names, to compare with the original prototype. */
export const toOriginal = (state: object): Record<string, any> =>
  RENAMES.toReversed().reduce<unknown>(
    (node, { path, to }) => renameAt(node, [...path.slice(0, -1), to], path.at(-1)!),
    state,
  ) as Record<string, any>

const record = z.record(z.string(), z.unknown())

// ponytail: checks the fields every screen reads; the rest come from fresh() when missing
const planSchema = z.looseObject({
  answers: z.record(z.string(), z.number()),
  about: z.looseObject({ age: z.number().nullable(), partner: z.boolean().nullable() }),
  account: z.looseObject({ name: z.string(), email: z.string(), termsAccepted: z.boolean() }),
  goals: z.array(
    z.looseObject({ id: z.number(), key: z.string(), amount: z.number(), age: z.number() }),
  ),
  assumptions: z.record(z.string(), z.union([z.number(), z.string(), z.null()])),
  whatIf: z.object({
    goalId: z.number().nullable(),
    monthlyExtra: z.number(),
    lumpSum: z.number(),
  }),
  figures: record,
  sources: z.record(z.string(), z.enum(['typed', 'doc', 'pre'])),
  lists: z.record(z.string(), z.array(z.looseObject({ id: z.number(), fields: record }))),
  moneyProfile: z.looseObject({ answers: record, chips: z.array(z.string()), done: record }),
  booking: z.looseObject({ stage: z.string().nullable(), done: z.boolean() }),
  versions: z.array(z.object({ note: z.string(), date: z.string() })),
})

/** A plan loaded from the API: migrated, screen state saved by older versions and the save sheet and mobile fields dropped, missing fields filled from a fresh plan, then checked. */
export const savedPlan = z.preprocess((saved) => {
  const ui = freshUi()
  const plan = Object.entries(fromOriginal<object>(saved as object)).filter(
    ([key]) => !(key in ui) && key !== 'save', // the save sheet went with login-first (O-01)
  )
  const merged = { ...fresh(), ...Object.fromEntries(plan) }
  const { mobile: _m, mobileVerified: _mv, ...account } = merged.account as Node
  return { ...merged, account }
}, planSchema) as unknown as z.ZodType<Plan>
