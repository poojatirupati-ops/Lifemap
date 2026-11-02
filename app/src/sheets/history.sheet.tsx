import { useMutation, useQuery } from '@tanstack/react-query'
import { format } from 'date-fns/format'
import { loadPlan, queryClient, send, type SavedPlan } from '../auth/planSync.ts'
import { savedPlan } from '../state/migrate.ts'
import { toast, useShell } from '../state/shell.ts'
import { useStore } from '../state/store.ts'
import CloseButton from './CloseButton.tsx'
import SheetTitle from './SheetTitle.tsx'

export const key = 'history'

interface SavedVersion {
  id: number
  note: string
  at: string
}

const PLAN_KEY = ['plan'] // planSync's key: a restore moves the saved version on
const VERSIONS_KEY = ['plan', 'versions']

async function json<T>(response: Response): Promise<T> {
  if (!response.ok) throw new Error(`${response.url} ${response.status}`)
  return response.json()
}

const fetchVersions = async () =>
  (
    await json<{ versions: SavedVersion[] }>(await send('GET', '/api/plan/versions'))
  ).versions.toReversed()

/** Restores a saved version against the plan version last read; 409 when the plan changed elsewhere. */
async function restore(id: number) {
  const version = queryClient.getQueryData<SavedPlan>(PLAN_KEY)?.version ?? 0
  const saved = await json<{ version: number; plan: unknown }>(
    await send('POST', `/api/plan/versions/${id}/restore`, { version }),
  )
  return { version: saved.version, plan: savedPlan.parse(saved.plan) }
}

function onRestored(saved: SavedPlan) {
  queryClient.setQueryData(PLAN_KEY, saved) // planSync's next save compares against this version
  useStore.getState().update((plan) => {
    const { emailVerified } = plan.account // from the session, not the saved plan
    Object.assign(plan, saved.plan, {
      account: { ...saved.plan!.account, emailVerified },
    })
  })
  toast('Plan restored')
}

/** Saved versions from the server when signed in; this browser's own list otherwise. */
export function Body() {
  const authed = useShell((shell) => shell.authed)
  const local = useStore((store) => store.plan.versions)
  const { data: saved } = useQuery(
    { queryKey: VERSIONS_KEY, queryFn: fetchVersions, enabled: authed },
    queryClient,
  )
  const restoring = useMutation(
    {
      mutationFn: restore,
      onSuccess: onRestored,
      onError: (error) => {
        if (!error.message.endsWith('409'))
          return toast("We couldn't restore that version. Please try again.")
        loadPlan() // the next try compares against the version saved elsewhere
        toast('Your plan changed on another device. Try again.')
      },
      onSettled: () => queryClient.invalidateQueries({ queryKey: VERSIONS_KEY }),
    },
    queryClient,
  )
  const versions = saved ?? local.map((version) => ({ ...version, id: undefined }))
  return (
    <>
      <SheetTitle>Plan history</SheetTitle>
      {versions.map((version, index) => (
        <div className="mini" key={version.id ?? index}>
          <span>
            <b>Version {index + 1}</b> · {version.note}
          </span>
          <span className="small">
            {'at' in version ? format(version.at, 'd MMM yyyy') : version.date}
            {version.id === undefined ? null : (
              <>
                {' '}
                <button
                  className="link"
                  disabled={restoring.isPending}
                  onClick={() => restoring.mutate(version.id)}
                >
                  Restore
                </button>
              </>
            )}
          </span>
        </div>
      ))}
      <CloseButton style={{ marginTop: 12 }}>Close</CloseButton>
    </>
  )
}
