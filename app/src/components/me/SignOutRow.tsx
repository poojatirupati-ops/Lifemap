import { authClient } from '../../auth/client.ts'
import { signOut } from '../../auth/useWall.ts'
import MeRow from './MeRow.tsx'

/** Sign out, shown only with a real session (not the reviewer's or the test tools' pass). */
export default function SignOutRow() {
  const email = authClient.useSession().data?.user.email
  if (!email) return null
  return (
    <MeRow
      emoji="🚪"
      title="Sign out"
      detail={email}
      action="signout"
      onClick={() => void signOut()}
    />
  )
}
