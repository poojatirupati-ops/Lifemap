import { createAuthClient } from 'better-auth/react'
import { emailOTPClient } from 'better-auth/client/plugins'
import { passkeyClient } from '@better-auth/passkey/client'

/** Better Auth on the same origin (/api/auth, proxied to the API in dev). */
export const authClient = createAuthClient({ plugins: [emailOTPClient(), passkeyClient()] })

export const WRONG_CODE = "That code doesn't match. Try again."
/** After 3 wrong codes even the right one is rejected until a new code is sent. */
export const LOCKED_OUT = 'Too many tries. Tap Send a new code.'

/** Emails a sign-in code; false when it could not be sent. */
export async function sendCode(email: string) {
  const { error } = await authClient.emailOtp.sendVerificationOtp({ email, type: 'sign-in' })
  return !error
}

/** Signs in with the emailed code (creating the user on first sign-in); returns the error to show, or null. */
export async function signInWithCode(email: string, otp: string, name: string) {
  const { data, error } = await authClient.signIn.emailOtp({ email, otp })
  if (error)
    return error.status === 403 || error.code === 'TOO_MANY_ATTEMPTS' ? LOCKED_OUT : WRONG_CODE
  if (name && name !== data.user.name) await authClient.updateUser({ name })
  return null
}
