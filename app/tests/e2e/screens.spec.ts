import { expect, test } from '@playwright/test'

const PROTO = process.env.PROTO ?? 'http://localhost:8080/'
const APP = process.env.APP ?? 'http://localhost:5173/'
// Set with --update-snapshots to capture baselines from the original prototype.
const baseline = !!process.env.LM_BASELINE

type Step = { click: string } | { jump: string } | { scroll: string } | { area: string }
// Login comes first (O-01): the test bypass passes the wall and the D0 jump is a fresh, not yet onboarded plan.
const welcome: Step = { jump: 'D0' }
const start: Step = { click: "Let's start" }
const jumps =
  'D0 D1 D2 D5 D6 DR HOME-0 XPL-01 CALC-retirement VID-01 PLAN-0 ADMIN-SET B1 F1 F2 F4 B4 P1 P1E P2 P3-2 P3-6 P4 HOME ASK PLAN ME-01 ME-UM ME-CHK ME-TERMS ME-UM2 ME-R ME-MONEY C0 C1 C2 C4'
const screens: { name: string; steps: Step[]; maxDiffPixelRatio?: number; fromApp?: boolean }[] = [
  { name: 'welcome', steps: [welcome] },
  { name: 'why-here', steps: [welcome, start] },
  { name: 'discover-q1', steps: [welcome, start, { click: 'Skip for now' }] },
  ...jumps.split(' ').map((id) => ({ name: `jump-${id}`, steps: [{ jump: id }] })),
  // Step 7 with "What we've set for you" open, and Me > Your assumptions (no jump of its own in the original).
  { name: 'p4-rest', steps: [{ jump: 'P4' }, { click: "What we've set for you (change any)" }] },
  { name: 'me-assumptions', steps: [{ jump: 'ME-01' }, { click: 'Your assumptions' }] },
  // The foundations pyramid on Results (full, with the next best step) and Home (compact).
  { name: 'results-foundations', steps: [{ jump: 'PLAN' }, { scroll: '#r-fnd' }] },
  { name: 'home-foundations', steps: [{ jump: 'HOME' }, { scroll: '#h-fnd' }] },
  // The Loans topic page has no jump of its own in the original: Explore, the Loans focus area, then See more.
  { name: 'loans', steps: [{ jump: 'XPL-01' }, { area: 'Loans' }, { click: 'See more' }] },
]
const tweak = (name: string, options: object) =>
  Object.assign(
    screens.find((screen) => screen.name === name)!,
    options,
  )
// Sign-in copy intentionally differs from the prototype now (real emailed code, no demo line),
// so these two baselines are captured from the app, not the original.
tweak('jump-P1', { fromApp: true })
tweak('jump-P1E', { fromApp: true })
// The original's "Save and come back later" banner on the finances screens was removed on purpose (O-01: there is
// an account already), so these two are captured from the app too.
tweak('jump-F1', { fromApp: true })
tweak('jump-F2', { fromApp: true })
// Me has no subtitle under its title on purpose (product owner, Nov 2026), so its baseline is captured from the app.
tweak('jump-ME-01', { fromApp: true })
// The original double-escapes the apostrophe in the asked question ("kids&#39; education"), so its
// bubble wraps to two lines and everything below sits ~21px lower; the app shows one line (6.09%).
tweak('jump-ASK', { maxDiffPixelRatio: 0.065 })

// The tenant's advisers (GET /api/advisers) need a real session; the sign-in bypass has none, so the original's three stand in.
const advisers = [
  ['NB', 'Niamh Byrne', 'QFA, CFP®', 'English, Irish', 'Dublin 2', 'Video or in person'],
  ['CW', 'Ciarán Walsh', 'QFA, APA', 'English', 'Cork', 'Video'],
  ['AM', 'Aisling Murphy', 'CFP®, QFA', 'English, Polish', 'Galway', 'Video or in person'],
].map(([id, name, qualifications, languages, location, meetingMode]) => ({
  id,
  name,
  calLink: `${id}/45min`,
  profile: { qualifications, languages, location, meetingMode },
}))

test.beforeEach(async ({ context, page }) => {
  await page.route('**/api/advisers', (route) => route.fulfill({ json: { advisers } }))
  // Home shows today's date and a time-of-day greeting: pin them to when the baselines were captured.
  await page.clock.setFixedTime(new Date('2026-11-02T09:00:00'))
  // Localhost-only sign-in bypass (src/lib/lmTestHook.ts); the original ignores it.
  await context.addInitScript(() => localStorage.setItem('lm-test-auth', '1'))
})

for (const { name, steps, maxDiffPixelRatio, fromApp } of screens) {
  test(name, async ({ page }) => {
    const original = baseline && !fromApp
    if (original) await page.goto(PROTO)
    for (const step of steps) {
      // The app opens a jump by URL (routes/jump.$id.tsx); the original by its panel button, hidden on phones but in the DOM.
      if ('jump' in step && !original) await page.goto(new URL(`jump/${step.jump}`, APP).href)
      else if ('jump' in step)
        await page.locator(`#jumps button[data-id="${step.jump}"]`).dispatchEvent('click')
      else if ('scroll' in step) {
        await page.locator(step.scroll).scrollIntoViewIfNeeded()
        // the pyramid builds itself once in view (fndWatch); wait for the rows to settle
        await expect(page.locator(`${step.scroll} .fnd2.seen`)).toBeVisible()
        await page.waitForTimeout(1500)
      } else if ('area' in step)
        await page.getByRole('group', { name: 'Choose an area' }).getByRole('button', { name: step.area }).click()
      else await page.getByText(step.click, { exact: true }).first().click()
    }
    await expect(page).toHaveScreenshot(
      `${name}.png`,
      maxDiffPixelRatio ? { maxDiffPixelRatio } : {},
    )
  })
}

test('browser back and forward move between screens', async ({ page }) => {
  await page.goto(new URL('jump/HOME', APP).href)
  await page
    .getByRole('navigation', { name: 'Main' })
    .getByRole('button', { name: 'Explore' })
    .click()
  await expect(page).toHaveURL(/\/explore$/)
  await page.goBack()
  await expect(page).toHaveURL(/\/home$/)
  await expect(page.locator('#h-fnd')).toBeVisible()
  await page.goForward()
  await expect(page.getByRole('heading', { name: 'Explore', level: 2 })).toBeVisible()
})
