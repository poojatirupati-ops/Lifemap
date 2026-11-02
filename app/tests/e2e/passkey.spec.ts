import { readFileSync, statSync } from 'node:fs'
import { expect, test } from '@playwright/test'

// Passkeys end to end against the API dev server (:8787 behind the app's /api proxy), with Chrome's virtual
// platform authenticator standing in for Face ID / Touch ID / Windows Hello.
const APP = process.env.APP ?? 'http://localhost:5173/'
const LOG = process.env.API_LOG ?? '/tmp/lifemap-api.log'
// Its own domain: the dev server logs the code as `[otp] x***@<domain>: 123456`, so tests running
// alongside cannot pick up each other's codes.
const domain = `passkey-${Date.now()}.example.com`
const email = `passkey@${domain}`

test('register a passkey, sign out, sign back in with it', async ({ page }) => {
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('WebAuthn.enable')
  const { authenticatorId } = await cdp.send('WebAuthn.addVirtualAuthenticator', {
    options: {
      protocol: 'ctap2',
      transport: 'internal',
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
      automaticPresenceSimulation: true,
    },
  })
  const tap = (name: string) => page.getByRole('button', { name, exact: true }).click()
  const heading = (name: string) => page.getByRole('heading', { name, level: 2 })

  // New account by email code (the dev server logs it).
  await page.goto(APP)
  await expect(heading('Sign in to LifeMap')).toBeVisible()
  const from = statSync(LOG).size
  await page.getByLabel('Email').fill(email)
  await tap('Send my email code')
  let code = ''
  await expect(async () => {
    code =
      readFileSync(LOG)
        .subarray(from)
        .toString()
        .match(new RegExp(`\\[otp\\] \\S*@${domain.replaceAll('.', '\\.')}: (\\d{6})`))?.[1] ?? ''
    expect(code).not.toBe('')
  }).toPass()
  await page.getByLabel('Digit 1').pressSequentially(code)
  await tap('Verify')
  await page.getByLabel('First name').fill('Pat')
  await page.getByText('Use my details to build my plan').click()
  await tap('Continue')

  await tap('Add Face ID / passkey')
  await expect(page.getByText("Let's start", { exact: true })).toBeVisible()
  const { credentials } = await cdp.send('WebAuthn.getCredentials', { authenticatorId })
  expect(credentials).toHaveLength(1)

  // Sign out (the Me tab's row is only reachable after onboarding): Better Auth's endpoint, as the client calls it.
  const out = await page.evaluate(() =>
    fetch('/api/auth/sign-out', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}',
    }).then((response) => response.status),
  )
  expect(out).toBe(200)
  await page.reload()
  await expect(heading('Sign in to LifeMap')).toBeVisible()

  await page.getByRole('button', { name: 'Sign in with Face ID or a passkey' }).click()
  await expect(page.getByText("Let's start", { exact: true })).toBeVisible()
  const session = await (await page.request.get(`${APP}api/auth/get-session`)).json()
  expect(session.user.email).toBe(email)
})
