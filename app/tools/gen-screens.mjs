// Generates tools/visual-screens.json: the welcome flow screens plus one entry per prototype jump button (same steps both sides).
// Usage: node tools/gen-screens.mjs
import { chromium } from 'playwright-core'
import { writeFileSync } from 'node:fs'

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 375, height: 812 } })
await page.goto(process.env.PROTO ?? 'http://localhost:8080/')
await page.waitForSelector('#jumps button', { state: 'attached' })
const ids = [...new Set(await page.$$eval('#jumps button', (bs) => bs.map((b) => b.dataset.id)))] // ids are unique per screen; a repeat would be the same screen
await browser.close()
const flow = [
  { name: 'welcome', proto: [], app: '', appSteps: [] },
  {
    name: 'why-here',
    proto: [{ click: "Let's start" }],
    app: '',
    appSteps: [{ click: "Let's start" }],
  },
  {
    name: 'discover-q1',
    proto: [{ click: "Let's start" }, { click: 'Skip for now' }],
    app: '',
    appSteps: [{ click: "Let's start" }, { click: 'Skip for now' }],
  },
]
const jumps = ids.map((id) => ({
  name: 'jump-' + id,
  proto: [{ jump: id }],
  app: '',
  appSteps: [{ jump: id }],
}))
writeFileSync(
  new URL('./visual-screens.json', import.meta.url),
  JSON.stringify([...flow, ...jumps], null, 1),
)
console.log(`${flow.length + jumps.length} screens (${flow.length} flow + ${jumps.length} jumps)`)
