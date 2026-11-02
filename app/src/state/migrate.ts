// Plans saved before the rename, and the original's snapshots, use the prototype's short field names.
// Each entry is a path in those old names and the field's readable name.
const RENAMES = (
  [
    ['scr', 'screen'],
    ['dv', 'listsFedTotals'],
    ['about.dob.d', 'day'],
    ['about.dob.m', 'month'],
    ['about.dob.y', 'year'],
    ['about.pdob.d', 'day'],
    ['about.pdob.m', 'month'],
    ['about.pdob.y', 'year'],
    ['about.deps', 'dependants'],
    ['about.pdob', 'partnerDob'],
    ['about._dobAge', 'dobAge'],
    ['about.cred', 'taxCredits'],
    ['goals.*.k', 'key'],
    ['goals.*.e', 'emoji'],
    ['goals.*.prio', 'priority'],
    ['man.*.v', 'value'],
    ['man.*.src', 'source'],
    ['lists.*.*.man.*.v', 'value'],
    ['lists.*.*.man.*.src', 'source'],
    ['lists.*.*.f', 'fields'],
    ['lists.*.*.src', 'sources'],
    ['lists.*.*.conf', 'confidence'],
    ['lists.*.*.man', 'manual'],
    ['lists.*.*.fix', 'fixed'],
    ['pdocs.*.v', 'figures'],
    ['acct.c1', 'termsAccepted'],
    ['acct.c2', 'marketingConsent'],
    ['acct.ev', 'emailVerified'],
    ['acct.sv', 'mobileVerified'],
    ['acct.pk', 'passkey'],
    ['acct', 'account'],
    ['di', 'discoverStep'],
    ['ans', 'answers'],
    ['admin', 'adminView'],
    ['wi.g', 'goalId'],
    ['wi.m', 'monthlyExtra'],
    ['wi.l', 'lumpSum'],
    ['pref.g', 'goalId'],
    ['pref.m', 'monthlyExtra'],
    ['pref.l', 'lumpSum'],
    ['wi', 'whatIf'],
    ['pref', 'preferredWhatIf'],
    ['gid', 'nextGoalId'],
    ['pRet', 'partnerRetireAge'],
    ['pRetSet', 'partnerRetireSet'],
    ['asm', 'assumptions'],
    ['saved', 'savedSections'],
    ['infl', 'inflation'],
    ['inflEdit', 'editingInflation'],
    ['assume', 'assumptionSet'],
    ['saveM', 'monthlySaving'],
    ['saveUp', 'savingAtRule'],
    ['penExtra', 'pensionExtra'],
    ['um.a', 'answers'],
    ['um.sec', 'section'],
    ['um.ret', 'returnTo'],
    ['um', 'moneyProfile'],
    ['fin', 'figures'],
    ['src', 'sources'],
    ['conf', 'confidence'],
    ['look', 'warnings'],
    ['ack', 'acknowledged'],
    ['man', 'manual'],
    ['fix', 'fixed'],
    ['docOf', 'documentOf'],
    ['iid', 'nextItemId'],
    ['lt', 'listsChanged'],
    ['fsec', 'financeSection'],
    ['fmode', 'entryMode'],
    ['upl', 'upload'],
    ['pst', 'statement'],
    ['pdocs', 'statements'],
    ['advRate', 'ratesForAdviser'],
    ['xs.*.v', 'page'],
    ['xs.*.p', 'param'],
    ['xs', 'explorePages'],
    ['app', 'hasResults'],
    ['shell', 'inShell'],
    ['pb', 'planBuilder'],
    ['planSeg', 'planSegment'],
    ['planGo', 'planScrollTo'],
    ['planEdit', 'editingGoals'],
    ['me', 'mePage'],
    ['exp', 'expertsPage'],
    ['view', 'resultsView'],
    ['from', 'cameFrom'],
    ['rt', 'returnTo'],
    ['tlOpen', 'timelineOpen'],
    ['tlHl', 'highlightedGoal'],
    ['chapOpen', 'openChapter'],
    ['xf', 'focusArea'],
    ['vf', 'videoFilter'],
    ['play', 'playing'],
    ['after', 'afterGate'],
    ['adjInfl', 'todaysMoney'],
    ['calcT', 'calcTouched'],
    ['calcDoc', 'calcStatementFigures'],
    ['calcSrc', 'calcStatementKeys'],
    ['calcV', 'calcValues'],
    ['meEdit', 'editingAnswers'],
    ['book.adv', 'adviser'],
    ['book.share.um', 'moneyProfile'],
    ['book.share.fin', 'finances'],
    ['needs.ip', 'incomeProtection'],
    ['book', 'booking'],
    ['advQs', 'adviserQuestions'],
  ] as const
)
  .map(([path, to]) => ({ path: path.split('.'), to }))
  .toSorted((a, b) => b.path.length - a.path.length) // inner fields first, while their parents keep the old names

type Node = Record<string, unknown>
const isNode = (value: unknown): value is Node => typeof value === 'object' && value !== null

/** Renames one field at a path ('*' = every entry), keeping the key order; a field already under the new name wins. */
function renameAt(node: unknown, [head, ...rest]: string[], to: string): unknown {
  if (!isNode(node)) return node
  if (head === '*') {
    if (Array.isArray(node)) return node.map((child) => renameAt(child, rest, to))
    return Object.fromEntries(Object.entries(node).map(([key, child]) => [key, renameAt(child, rest, to)]))
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
