import { readFileSync, statSync } from 'node:fs'
import { expect, test, type Page } from '@playwright/test'

// J-01: the whole journey against the real API dev server (:8787, behind the app's /api proxy) and the CMS (:3000).
const APP = process.env.APP ?? 'http://localhost:5173/'
const LOG = process.env.API_LOG ?? '/tmp/lifemap-api.log'
const email = `journey+${Date.now()}@example.com`

/** Sends a sign-in code and types the one the API dev server logged (`[otp] <masked>: 123456`). */
async function signIn(page: Page) {
  await page.goto(APP)
  await see(page, 'Sign in to LifeMap')
  const from = statSync(LOG).size
  await page.getByLabel('Email').fill(email)
  await tap(page, 'Send my email code')
  await see(page, 'Check your email')
  let code = ''
  await expect(async () => {
    code = readFileSync(LOG).subarray(from).toString().match(/\[otp\] .*: (\d{6})/)?.[1] ?? ''
    expect(code).not.toBe('')
  }).toPass()
  await page.getByLabel('Digit 1').pressSequentially(code)
  await tap(page, 'Verify')
}

/** The screen's title. */
const see = (page: Page, title: string) =>
  expect(page.getByRole('heading', { name: title, level: 2 })).toBeVisible()

const tap = (page: Page, name: string) => page.getByRole('button', { name, exact: true }).click()

/** Opens the plan report from My Plan and downloads it (the PDF takes a while to draw). */
async function downloadReport(page: Page) {
  await page.getByRole('button', { name: /Download my plan/ }).click()
  const report = page.getByRole('dialog', { name: 'Your LifeMap plan report' })
  const file = page.waitForEvent('download', { timeout: 60_000 })
  await report.getByRole('button', { name: /Download my plan/ }).click()
  const download = await file
  await report.getByRole('button', { name: 'Close' }).click()
  return download
}

const api = async (page: Page, path: string) => {
  const response = await page.request.get(`${APP}api/${path}`)
  expect(response.ok()).toBe(true)
  return response.json()
}

// The app saves the plan 1.5s after the last change, so server checks poll a while.
test.use({ actionTimeout: 10_000 })
const later = { timeout: 15_000 }

test('whole journey', async ({ page }) => {
  test.setTimeout(240_000)

  await test.step('new account: sign in, details and consents', async () => {
    await signIn(page)
    await see(page, 'Create your account')
    await page.getByLabel('First name').fill('Jo')
    await page.getByText('Use my details to build my plan').click()
    await page.getByText('Send me reminders and updates').click()
    await tap(page, 'Continue')
    await tap(page, 'Not now')
    const { consents } = await api(page, 'consents')
    expect(consents.marketing?.granted).toBe(true)
  })

  await test.step('onboarding', async () => {
    await page.getByText("Let's start", { exact: true }).click()
    await tap(page, 'Retirement plan')
    await tap(page, 'Continue')
    for (let question = 1; question <= 6; question++) {
      await expect(page.getByText(`${question} of 6`, { exact: true })).toBeVisible()
      await page.getByRole('group', { name: 'Answers' }).getByRole('button').first().click()
    }
    await expect(page.getByText('Your money personality')).toBeVisible()
    await tap(page, 'Continue')
  })

  await test.step('Home', async () => {
    await expect.poll(async () => (await api(page, 'plan')).plan?.onboarded, later).toBe(true)
    await tap(page, 'Start')
  })

  await test.step('plan builder', async () => {
    await see(page, 'About you & your family')
    await page.getByLabel('Day of birth').fill('14')
    await page.getByLabel('Month of birth').fill('03')
    await page.getByLabel('Year of birth').fill('1988')
    await tap(page, 'Just me On my own')
    await tap(page, 'one')
    await tap(page, 'Next: your goals')
    await see(page, "What's next in your life story?")
    await tap(page, 'Retire comfortably')
    await tap(page, 'Buy a home')
    await page.getByRole('button', { name: /on my timeline/ }).click()

    const home = page.getByRole('slider', { name: 'Buy a home' })
    await expect(home).toHaveText(/in 4 yrs/)
    const box = (await home.boundingBox())!
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width / 2 + 60, box.y + box.height / 2, { steps: 10 })
    await page.mouse.up()
    await expect(home).not.toHaveText(/in 4 yrs/)
    await tap(page, 'Next')
    await see(page, 'Your LifeMap')
    await tap(page, 'This looks right')

    await see(page, 'Your money profile')
    for (const answer of [
      '€300 to €750',
      "It would hurt, but I'd be fine",
      'Fairly steady',
      '3 to 6 months',
      'Get the gist, then check with an expert',
      'I know the basics: savings and pension',
    ])
      await tap(page, answer)
    await tap(page, 'Save and continue')

    await see(page, 'Your finances')
    await page.getByRole('button', { name: /^Income and expenses/ }).click()
    await tap(page, 'Upload')
    await page.locator('input[type=file]').setInputFiles({
      name: 'payslip.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4\n%%EOF\n'),
    })
    await see(page, 'We read these values')
    await tap(page, 'Looks right, add them')
    const { documents } = await api(page, 'documents')
    expect(documents.map(({ name }: { name: string }) => name)).toEqual(['payslip.pdf'])

    await page.getByRole('button', { name: /^About you/ }).click()
    await page.getByRole('textbox', { name: /^Retirement age/ }).fill('66')
    await tap(page, 'Save this section')
    await page.getByRole('button', { name: /^Assets/ }).click()
    await tap(page, 'Rent')
    await page.getByRole('textbox', { name: /^Cash savings/ }).fill('12000')
    await page.getByRole('textbox', { name: /^Investments/ }).fill('5000')
    await tap(page, 'Save this section')
    await page.getByRole('button', { name: /^Liabilities/ }).click()
    await page.getByRole('group', { name: 'Do you have a mortgage?' }).getByRole('button', { name: 'No', exact: true }).click()
    await page.getByRole('textbox', { name: 'Owed on this card' }).fill('800')
    await page.getByRole('textbox', { name: 'Monthly repayment on this card' }).fill('100')
    await tap(page, 'Save this section')
    await page.getByRole('button', { name: /^Protection/ }).click()
    for (const cover of ['Life cover', 'Income protection', 'Serious illness cover', 'Cover through work', 'Health insurance'])
      await page.getByRole('group', { name: cover }).getByRole('button', { name: 'No', exact: true }).click()
    await tap(page, 'Save this section')
    await page.getByRole('button', { name: /^Pension/ }).click()
    await page.getByRole('textbox', { name: 'Value today' }).fill('30000')
    await page.getByRole('textbox', { name: 'Paid in each month, including your employer' }).fill('400')
    await page.getByRole('group', { name: 'State Pension' }).getByRole('button', { name: 'Expect full' }).click()
    await tap(page, 'Save this section')
    await tap(page, 'Check my details')

    await see(page, 'Check your details')
    await page.getByRole('textbox', { name: 'Plan until age (life expectancy)' }).fill('90')
    await tap(page, 'Use the standard (2%)')
    await tap(page, 'See my results')
    await expect(page.getByRole('heading', { name: 'Building your plan' })).toBeHidden({ timeout: 15_000 })
  })

  await test.step('results with a what-if change', async () => {
    await see(page, 'My Plan')
    await expect(page.getByText('1 of 2 goals on track')).toBeVisible()
    const { versions } = await api(page, 'plan/versions')
    await tap(page, 'Retire comfortably')
    await page.getByRole('textbox', { name: 'Extra each month' }).fill('500')
    await page.getByRole('textbox', { name: 'Extra each month' }).blur()
    await expect(page.getByText(/Retire comfortably goes from 70% to \d+%/)).toBeVisible()
    await tap(page, 'Save this plan')
    await expect
      .poll(async () => (await api(page, 'plan/versions')).versions.length, later)
      .toBeGreaterThan(versions.length)
  })

  await test.step('report download', async () => {
    const pdf = await downloadReport(page)
    expect(pdf.suggestedFilename()).toBe('LifeMap-plan.pdf')
    // Without html2canvas there is no PDF, so the report is saved as HTML. A second tab: a failed import stays failed.
    const second = await page.context().newPage()
    await second.route('**/html2canvas.js*', (route) => route.abort())
    await second.goto(APP)
    await second.getByRole('navigation', { name: 'Main' }).getByRole('button', { name: 'My Plan' }).click()
    expect((await downloadReport(second)).suggestedFilename()).toBe('LifeMap-plan.html')
    await second.close()
  })

  await test.step('plan history', async () => {
    await page.getByRole('button', { name: /^Plan history/ }).click()
    const history = page.getByRole('dialog', { name: 'Plan history' })
    await expect(history.getByText(/Preferred plan: \+€500\/month → Retire comfortably/)).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(history).toBeHidden()
  })

  await test.step('Explore', async () => {
    await page.getByRole('navigation', { name: 'Main' }).getByRole('button', { name: 'Explore' }).click()
    await page.getByRole('button', { name: /^Savings & Goals Plan any goal/ }).click()
    console.log(await page.getByRole("main").ariaSnapshot())
    await page.getByRole('navigation', { name: 'Main' }).getByRole('button', { name: 'Explore' }).click()
    await page.getByRole('button', { name: /^1:22 Pensions Your retirement plan/ }).click()
    console.log(await page.getByRole("main").ariaSnapshot())
  })
})
