import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'

const read = (p: string) => readFileSync(new URL(p, import.meta.url), 'utf8')
const names = (s: string) => new Set([...s.matchAll(/@keyframes\s+([\w-]+)/g)].map(m => m[1]))

test('every prototype @keyframes exists in prototype.css', () => {
  const proto = read('../../../../LifeGoals-Customer-Journey-Prototype.html').split('<style>')[1].split('</style>')[0]
  const want = names(proto), have = names(read('../styles/prototype.css'))
  expect(want.size).toBeGreaterThan(20)
  expect([...want].filter(n => !have.has(n))).toEqual([])
})
