import { chromium } from 'playwright-core'
import { readFileSync } from 'node:fs'
const state = JSON.parse(readFileSync('tests/fixtures/sample-explore.json', 'utf8'))
const browser = await chromium.launch({ channel: 'chrome' })
for (const [url, proto] of [['http://localhost:8080/', true], ['http://localhost:5173/', false]]) {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, reducedMotion: 'reduce' })
  await ctx.addInitScript(() => { window.__TODAY = '2026-10-26'; localStorage.setItem('lm-test-auth', '1') })
  const page = await ctx.newPage()
  await page.goto(url); await page.waitForLoadState('networkidle')
  if (proto) await page.evaluate((s) => { window.__state = s; (0, eval)('S = window.__state; lastId = null; render()') }, state)
  else await page.evaluate((s) => window.__lm.load(s), state)
  await page.locator('#screen [data-a=cat][data-p=home]').click()
  await page.locator('#screen [data-a=calc][data-p=borrow]').click()
  await page.locator('#screen #co-inc').fill('3000000')
  console.log(url, await page.evaluate(() => {
    const f = document.querySelector('#cl-inc2').closest('.flabel')
    const cs = getComputedStyle(f)
    return JSON.stringify({ fl: f.getBoundingClientRect().height, wrap: cs.flexWrap, w: f.clientWidth, lab: document.querySelector('#cl-inc2').getBoundingClientRect().width, box: document.querySelector('#co-inc2').closest('.nbox').getBoundingClientRect().width, t: JSON.stringify(document.querySelector('#cl-inc2').textContent), cs: ['fontFamily','fontSize','fontWeight','letterSpacing'].map(k=>getComputedStyle(document.querySelector('#cl-inc2'))[k]).join('|'), fonts: [...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family+f.weight).join(','), lab2: document.querySelector('#cl-inc').getBoundingClientRect().width })
  }))
}
await browser.close()
