// Pixel diff (animations frozen on both sides): prototype (:8080) vs app (:5173) at 375x812 @2x, animations settled.
// Usage: node tools/visual-diff.mjs [screenName]   (screens in tools/visual-screens.json)
// Exit 1 if any screen differs by more than MAX_PCT of pixels. Diff images go to tools/out/.
import { chromium } from 'playwright-core'
import { PNG } from 'pngjs'
import { pixelDiff } from './normalise.mjs'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

const MAX_PCT = 0.5
const allow = (() => {
  try {
    return Object.fromEntries(
      JSON.parse(readFileSync(new URL('./visual-allow.json', import.meta.url), 'utf8')).map((a) => [
        a.name,
        a.maxPct,
      ]),
    )
  } catch {
    return {}
  }
})() // intentional differences: {name, reason, maxPct}
const PROTO = process.env.PROTO ?? 'http://localhost:8080/',
  APP = process.env.APP ?? 'http://localhost:5173/'
const all = JSON.parse(readFileSync(new URL('./visual-screens.json', import.meta.url), 'utf8'))
const only = process.argv[2],
  screens = only ? all.filter((s) => s.name === only) : all
mkdirSync(new URL('./out/', import.meta.url), { recursive: true })

const browser = await chromium.launch({ channel: 'chrome' })
const shot = async (url, steps = [], isApp = false) => {
  const ctx = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'reduce',
  }) // the prototype's JS orbit stops under reduced motion
  if (isApp)
    await ctx.addInitScript(() => {
      try {
        localStorage['lm-test-auth'] = '1'
      } catch {}
    }) // test-only auth-wall bypass (localhost); the prototype ignores it
  await ctx.addInitScript(() =>
    addEventListener('DOMContentLoaded', () => {
      const st = document.createElement('style')
      st.textContent = '*,*::before,*::after{animation:none!important;transition:none!important}'
      document.head.append(st)
    }),
  ) // freeze before the first frame so the orbit is at the same angle on both sides
  const page = await ctx.newPage()
  await page.goto(url)
  await page.waitForTimeout(1500) // frozen: continuous motion (orbit) would never line up
  for (const s of steps) {
    if (s.jump)
      await page.evaluate(
        (id) => document.querySelector(`#jumps button[data-id="${id}"]`).click(),
        s.jump,
      ) // panel is hidden on phones but in the DOM
    if (s.click) await page.getByText(s.click, { exact: true }).first().click()
    if (s.hash) await page.evaluate((h) => (location.hash = h), s.hash)
    await page.waitForTimeout(s.wait ?? 700)
  }
  await page.waitForTimeout(2500) // let entrance animations settle
  const buf = await page.screenshot()
  await ctx.close()
  return PNG.sync.read(buf)
}
let bad = 0
for (const s of screens) {
  const a = await shot(PROTO, s.proto),
    b = await shot(APP + (s.app ?? ''), s.appSteps, true)
  const { percent, diff } = pixelDiff(a, b)
  const pct = +percent.toFixed(2)
  writeFileSync(new URL(`./out/${s.name}.diff.png`, import.meta.url), PNG.sync.write(diff))
  writeFileSync(new URL(`./out/${s.name}.proto.png`, import.meta.url), PNG.sync.write(a))
  writeFileSync(new URL(`./out/${s.name}.app.png`, import.meta.url), PNG.sync.write(b))
  const max = allow[s.name] ?? MAX_PCT,
    ok = pct <= max
  console.log(`${ok ? 'PASS' : 'FAIL'} ${s.name} ${pct}% differ`)
  if (!ok) bad++
}
console.log(`${screens.length} screens, ${bad} failing`)
await browser.close()
process.exit(bad ? 1 : 0)
