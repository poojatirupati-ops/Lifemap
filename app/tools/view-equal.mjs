// Same state into the original (:8080) and the React app (:5173), then compare what they show.
// Usage: node tools/view-equal.mjs <screen ids...> [tests/scenarios/<card>.json...] [--fixtures=a,b]
//   Each fixture x screen id: load the fixture, go(id), compare S, the normalised #screen DOM and a pixel diff.
//   Each scenario {name, fixture, go, steps}: replay click/type steps on both sides, compare S and DOM
//   after every step. Exits 1 on any difference. PROTO / APP override the two URLs.
import { chromium } from 'playwright-core'
import { readdirSync, readFileSync } from 'node:fs'
import { PNG } from 'pngjs'
import { diffLines, diffObj, pixelDiff, viewLines } from './normalise.mjs'
import { TODAY } from './today.mjs'

const PROTO = process.env.PROTO ?? 'http://localhost:8080/'
const APP = process.env.APP ?? 'http://localhost:5173/'
const MAX_PIXEL_PERCENT = 0.5
const VIEW = '#screen, #curid'

const args = process.argv.slice(2)
const fixturesFlag = args.find((arg) => arg.startsWith('--fixtures='))
const positional = args.filter((arg) => !arg.startsWith('--'))
const screenIds = positional.filter((arg) => !arg.endsWith('.json'))
const scenarios = positional
  .filter((arg) => arg.endsWith('.json'))
  .flatMap((file) => JSON.parse(readFileSync(file, 'utf8')))
const fixturesDir = new URL('../tests/fixtures/', import.meta.url)
const fixtureNames = fixturesFlag
  ? fixturesFlag.split('=')[1].split(',')
  : readdirSync(fixturesDir).map((file) => file.replace(/\.json$/, ''))
const fixture = (name) => JSON.parse(readFileSync(new URL(`${name}.json`, fixturesDir), 'utf8'))

/** The original keeps its state in a script-level `let S`, reachable only through global eval. */
const proto = {
  load: (page, state) =>
    page.evaluate((s) => {
      window.__state = s
      ;(0, eval)('S = window.__state; lastId = null; render()')
    }, state),
  go: (page, id) => page.evaluate((screen) => window.go(screen), id),
  get: (page) => page.evaluate(() => JSON.parse((0, eval)('JSON.stringify(S)'))), // JSON, like __lm.get
}
const app = {
  load: (page, state) => page.evaluate((s) => window.__lm.load(s), state),
  go: (page, id) => page.evaluate((screen) => window.__lm.go(screen), id),
  get: (page) => page.evaluate(() => window.__lm.get()),
}

const browser = await chromium.launch({ channel: 'chrome' })
async function open(url) {
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    reducedMotion: 'reduce',
  })
  await context.addInitScript((today) => {
    window.__TODAY = today
    localStorage.setItem('lm-test-auth', '1')
  }, TODAY)
  const page = await context.newPage()
  await page.goto(url)
  await page.waitForLoadState('networkidle')
  return page
}
const [protoPage, appPage] = await Promise.all([open(PROTO), open(APP)])
if (!(await appPage.evaluate(() => !!window.__lm))) {
  console.error(`No window.__lm at ${APP}: is it the dev app on localhost?`)
  process.exit(2)
}

/** Lets rAF-deferred effects (goal icons, count-ups) land before reading. */
const settle = (page) =>
  page.evaluate(
    () => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))),
  )

async function pixelPercent() {
  const [a, b] = await Promise.all(
    [protoPage, appPage].map(async (page) =>
      PNG.sync.read(await page.locator('#screen').screenshot()),
    ),
  )
  if (a.width !== b.width || a.height !== b.height) return 100
  return pixelDiff(a, b).percent
}

/** Differences between the two sides right now, as printable lines. */
async function compare(withPixels) {
  await Promise.all([settle(protoPage), settle(appPage)])
  const [protoView, appView] = await Promise.all(
    [protoPage, appPage].map((page) => page.evaluate(viewLines, VIEW)),
  )
  const problems = diffLines(protoView, appView)
  problems.push(...diffObj(await proto.get(protoPage), await app.get(appPage)))
  if (withPixels) {
    const percent = await pixelPercent()
    if (percent > MAX_PIXEL_PERCENT) problems.push(`pixels: ${percent.toFixed(2)}% differ`)
  }
  return problems
}

async function step(page, { text, click, type, value }) {
  const screen = page.locator('#screen')
  if (text) await screen.getByText(text, { exact: true }).first().click()
  if (click) await screen.locator(click).first().click()
  if (type) await screen.locator(type).first().fill(value)
}

/** The same state into both sides, then the same screen when one is given. */
async function loadBoth(state, screenId) {
  await Promise.all([proto.load(protoPage, state), app.load(appPage, state)])
  if (screenId) await Promise.all([proto.go(protoPage, screenId), app.go(appPage, screenId)])
}

const runs = []
for (const name of fixtureNames) {
  for (const id of screenIds) {
    await loadBoth(fixture(name), id)
    runs.push({ label: `${name} ${id}`, problems: await compare(true) })
  }
}
for (const scenario of scenarios) {
  await loadBoth(fixture(scenario.fixture), scenario.go)
  const problems = []
  for (const [index, action] of scenario.steps.entries()) {
    await Promise.all([step(protoPage, action), step(appPage, action)])
    const last = index === scenario.steps.length - 1
    const found = await compare(last)
    if (found.length) problems.push(`after step ${index + 1} ${JSON.stringify(action)}`, ...found)
  }
  runs.push({ label: `scenario ${scenario.name}`, problems })
}
await browser.close()

const failing = runs.filter((run) => run.problems.length)
for (const run of failing) console.log(`\nFAIL ${run.label}\n${run.problems.join('\n')}`)
console.log(`\n${runs.length} runs, ${failing.length} failing`)
process.exit(failing.length ? 1 : 0)
