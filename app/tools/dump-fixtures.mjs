// Captures JSON snapshots of the ORIGINAL prototype's state S from :8080 into tests/fixtures/*.json.
// Usage: node tools/dump-fixtures.mjs   (fixed __TODAY, reduced motion; re-runnable)
import { chromium } from 'playwright-core'
import { mkdirSync, writeFileSync } from 'node:fs'
import { TODAY } from './today.mjs'

const PROTO = process.env.PROTO ?? 'http://localhost:8080/'
const out = new URL('../tests/fixtures/', import.meta.url)
mkdirSync(out, { recursive: true })

const sample = (tab, extra = '') => `loadSample(); S.tab = '${tab}'; ${extra}`
const SCENARIOS = {
  fresh: `S = fresh()`,
  discovered: `discOnly()`,
  'goals-set': `discOnly(); S.about = {age:38, partner:true, deps:2}; ['edu','travel','mfree','safety','retire'].forEach(k => S.goals.push(mkGoal(k))); S.retireAge = 63; S.retireSet = true`,
  verified: `discOnly(); S.about = {age:38, partner:true, deps:2}; ['edu','retire'].forEach(k => S.goals.push(mkGoal(k))); S.acct = {name:'Aoife', email:'aoife@example.ie', mobile:'087 123 4567', c1:true, c2:false, ev:true, sv:true, pk:true}`,
  'finances-partial': `loadSample(); S.app = false; S.shell = true; S.pb = true; S.checked = false; S.scr = 'P2'; ['pension','invest','cardBal','loanBal','mortBal','life','ip'].forEach(k => { delete S.fin[k]; delete S.src[k]; delete S.conf[k] })`,
  'finances-complete': `loadSample(); S.app = false; S.shell = true; S.pb = true; S.checked = false; S.scr = 'P4'`,
  'sample-home': sample('home'),
  'sample-plan': sample('plan'),
  'sample-explore': sample('explore'),
  'sample-me': sample('me'),
  'sample-exp': sample('exp'),
  admin: `loadSample(); S.admin = true`,
}

const browser = await chromium.launch({ channel: 'chrome' })
const ctx = await browser.newContext({
  viewport: { width: 375, height: 812 },
  reducedMotion: 'reduce',
})
await ctx.addInitScript((d) => {
  window.__TODAY = d
}, TODAY)
const page = await ctx.newPage()
await page.goto(PROTO)
await page.waitForTimeout(1000)
for (const [name, code] of Object.entries(SCENARIOS)) {
  const json = await page.evaluate((c) => {
    ;(0, eval)(c)
    return JSON.stringify(S)
  }, code) // indirect eval: runs in global scope where the script's let S lives
  writeFileSync(new URL(`${name}.json`, out), JSON.stringify(JSON.parse(json), null, 1) + '\n')
  console.log('wrote', name)
}
await browser.close()
