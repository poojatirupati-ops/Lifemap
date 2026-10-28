import { auth } from '../../identity/authClient.ts'
import Button from '../ui/Button.tsx'
import { SIGNUP_KEY } from './signIn.data.ts'

type Props = { client?: Pick<typeof auth, 'signOut'> }

/** Signs out; the route guard then moves the person to the start. */
export default function SignOutButton({ client = auth }: Props) {
  return <Button variant="secondary" onClick={() => { try { localStorage.removeItem(SIGNUP_KEY) } catch { /* private mode */ } void client.signOut() }}>Sign out</Button>
}
