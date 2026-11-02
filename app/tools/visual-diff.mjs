// Pixel diff (animations frozen on both sides): prototype (:8080) vs app (:5173) at 375x812 @2x.
// Usage: node tools/visual-diff.mjs [screenName]   (screens in tools/visual-screens.json)
// Exit 1 if any screen differs by more than MAX_PCT of pixels. Diff images go to tools/out/.
import { chromium } from 'playwright-core'
import { PNG } from 'pngjs'
import { pixelDiff } from './normalise.mjs'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'

const MAX_PCT = 0.5
const PROTO = process.env.PROTO ?? 'http://localhost:8080/'
const APP = process.env.APP ?? 'http://localhost:5173/'
const readJson = (url) => JSON.parse(readFileSync(url, 'utf8'))

// Intentional differences, a list of {name, reason, maxPct}.
const allowFile = new URL('./visual-allow.json', import.meta.url)
const allow = existsSync(allowFile)
  ? Object.fromEntries(readJson(allowFile).map((entry) => [entry.name, entry.maxPct]))
  : {}

const all = readJson(new URL('./visual-screens.json', import.meta.url))
const only = process.argv[2]
const screens = only ? all.filter((screen) => screen.name === only) : all
mkdirSync(new URL('./out/', import.meta.url), { recursive: true })

// Freeze before the first frame so the orbit is at the same angle on both sides.
const freezeAnimations = () =>
  addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style')
    style.textContent = '*,*::before,*::after{animation:none!important;transition:none!important}'
    document.head.append(style)
  })

const browser = await chromium.launch({ channel: 'chrome' })
async function shot(url, steps = []) {
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'reduce', // the prototype's JS orbit stops under reduced motion
  })
  // Test-only auth-wall bypass on localhost, as in view-equal; the original ignores it.
  await context.addInitScript(() => localStorage.setItem('lm-test-auth', '1'))
  await context.addInitScript(freezeAnimations)
  const page = await context.newPage()
  await page.goto(url)
  await page.waitForTimeout(1500)
  for (const step of steps) {
    // The jump panel is hidden on phones but still in the DOM.
    if (step.jump) {
      await page.evaluate(
        (id) => document.querySelector(`#jumps button[data-id="${id}"]`).click(),
        step.jump,
      )
    }
    if (step.click) await page.getByText(step.click, { exact: true }).first().click()
    if (step.hash) await page.evaluate((hash) => (location.hash = hash), step.hash)
    await page.waitForTimeout(step.wait ?? 700)
  }
  await page.waitForTimeout(2500) // let entrance animations settle
  const png = await page.screenshot()
  await context.close()
  return PNG.sync.read(png)
}

const writePng = (name, png) =>
  writeFileSync(new URL(`./out/${name}.png`, import.meta.url), PNG.sync.write(png))

let failing = 0
for (const screen of screens) {
  // one retry, then report and move on: a single slow page must not abort the whole run
  const both = () =>
    Promise.all([shot(PROTO, screen.proto), shot(APP + (screen.app ?? ''), screen.appSteps)])
  const shots = await both().catch(() => both()).catch((error) => error)
  if (shots instanceof Error) {
    console.log(`ERROR ${screen.name} ${shots.message.split('\n')[0]}`)
    failing++
    continue
  }
  const [protoPng, appPng] = shots
  const { percent, diff } = pixelDiff(protoPng, appPng)
  const pct = +percent.toFixed(2)
  writePng(`${screen.name}.diff`, diff)
  writePng(`${screen.name}.proto`, protoPng)
  writePng(`${screen.name}.app`, appPng)
  const ok = pct <= (allow[screen.name] ?? MAX_PCT)
  console.log(`${ok ? 'PASS' : 'FAIL'} ${screen.name} ${pct}% differ`)
  if (!ok) failing++
}
console.log(`${screens.length} screens, ${failing} failing`)
await browser.close()
process.exit(failing ? 1 : 0)
