import { useForm } from 'react-hook-form'
import { useStore } from '../state/store.ts'
import { saveDetails, type Details } from '../state/account.ts'
import FlowHead from '../components/frame/FlowHead.tsx'

export const key = 'P1D'
export const id = key
export const note =
  'New account only (O-01): first name and consents, all unticked; only the privacy notice is required. No mobile until SMS verification exists.'

export function Head() {
  return FlowHead({
    title: 'Create your account',
    sub: 'Your email is verified. Just your first name and your privacy choices.',
  })
}

const FORM_ID = 'acct-details'

export function Body() {
  const openSheet = useStore((store) => store.openSheet)
  const { register, handleSubmit, formState } = useForm<Details>({
    defaultValues: { name: useStore.getState().plan.account.name },
  })

  return (
    <form id={FORM_ID} onSubmit={handleSubmit(saveDetails)}>
      <div className="card">
        <div className="field" style={{ margin: 0 }}>
          <label htmlFor="a-name">First name</label>
          <input
            className="in"
            id="a-name"
            autoComplete="given-name"
            {...register('name', { required: true, setValueAs: (name: string) => name.trim() })}
          />
        </div>
      </div>
      <div className="card">
        <label className="check">
          <input type="checkbox" {...register('terms', { required: true })} />
          <span>
            <b>Required:</b> Use my details to build my plan
          </span>
        </label>
        <label className="check">
          <input type="checkbox" {...register('marketing')} />
          <span>Optional: Send me reminders and updates</span>
        </label>
        <label className="check">
          <input type="checkbox" {...register('analytics')} />
          <span>
            Optional: Help improve LifeMap: anonymous usage analytics and session recordings
          </span>
        </label>
        <p className="small" style={{ margin: '6px 0 0' }}>
          Stored in the EU · never sold · nothing shared with an adviser unless you choose · delete
          everything any time.
        </p>
        <button type="button" className="link" onClick={() => openSheet('money')}>
          How LifeMap makes money
        </button>
      </div>
      <p className="small" style={{ color: 'var(--gap-t)' }} role="alert">
        {Object.keys(formState.errors).length
          ? 'Add your first name and tick the required box.'
          : null}
      </p>
    </form>
  )
}

export function Foot() {
  return (
    <button className="btn" type="submit" form={FORM_ID}>
      Continue
    </button>
  )
}
