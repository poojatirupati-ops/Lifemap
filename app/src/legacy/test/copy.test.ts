import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test } from 'vitest'

function* sources(dir: string): Generator<string> {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) yield* sources(p)
    else if (/\.(tsx?|css)$/.test(e.name) && !/\.test\.tsx?$/.test(e.name)) yield p
  }
}

// Customer-facing text only: drop comments, which may name the prototype file.
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"])\/\/.*$/gm, '$1')

// 'navigate' (sec 20) is left out on purpose: it is the router API name and would flag legitimate code.
const banned = /\b(delve|testament|revolutioni[sz]e|foster|comprehensive|tapestry|furthermore|moreover|in conclusion|leverage|seamless|empower|unlock|it'?s important to note)\b/i
const brand = /LifeGoals/ // brand is LifeMap
// Emergency fund is never called a safety net anywhere (sec 23), except the verbatim Lifecast/D1 strings below.
const safetyNet = /safety net/i
const protectedStrings = /No safety net|Strong safety net|your safety net|Building a safety net for emergencies/g

test('copy follows the sec 20 ban list, the LifeMap brand and sec 23 naming', () => {
  const bad: string[] = []
  for (const f of sources(new URL('..', import.meta.url).pathname)) {
    const raw = strip(readFileSync(f, 'utf8'))
    const text = raw.replace(protectedStrings, '')
    for (const [name, re] of [['banned word', banned], ['LifeGoals', brand], ['safety net', safetyNet]] as const)
      if (re.test(text)) bad.push(`${f}: ${name}`)
  }
  expect(bad).toEqual([])
})
