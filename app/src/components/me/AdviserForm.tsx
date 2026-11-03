import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { authClient } from '../../auth/client.ts'
import { queryClient } from '../../auth/planSync.ts'
import { ADVISERS, CAL_ORIGIN, type Adviser } from '../../bookings/bookings.ts'
import { toast } from '../../state/shell.ts'

/** A member role is the tenant role adviser (Better Auth keeps several roles comma-separated). */
export const isAdviser = (role = '') => role.split(',').includes('adviser')

/** The session's member has the tenant role adviser. */
export const useIsAdviser = () => isAdviser(authClient.useActiveMember().data?.role)

const line = (max: number) => z.string().trim().max(max)
/** A pasted Cal.com link or URL as its bare path: no origin, query, hash or slashes at either end. */
const calPath = (link: string) =>
  (URL.parse(link, CAL_ORIGIN)?.pathname ?? link).replace(/^\/+|\/+$/g, '')

// the same limits as the API (api/src/auth.ts)
const schema = z.object({
  calLink: z
    .string()
    .trim()
    .transform(calPath)
    .pipe(
      z
        .string()
        .max(200)
        .regex(/^[\w-]+(\/[\w-]+)*$/, 'Your Cal.com link, e.g. niamh/45min'),
    ),
  qualifications: line(120),
  languages: line(120),
  location: line(120),
  meetingMode: line(60),
})
type Input = z.input<typeof schema>
type Fields = z.output<typeof schema>

const FIELDS: { name: keyof Input; label: string; hint: string }[] = [
  { name: 'calLink', label: 'Cal.com link', hint: 'niamh/45min' },
  { name: 'qualifications', label: 'Qualifications', hint: 'QFA, CFP®' },
  { name: 'languages', label: 'Languages', hint: 'English, Irish' },
  { name: 'location', label: 'Location', hint: 'Dublin 2' },
  { name: 'meetingMode', label: 'Meeting mode', hint: 'Video or in person' },
]

const EMPTY = { qualifications: '', languages: '', location: '', meetingMode: '' }

export const ADVISER_FORM_ID = 'adviser-profile'

/** An adviser's own booking link and card, saved on their account with Better Auth's updateUser. */
export default function AdviserForm() {
  const user = authClient.useSession().data?.user
  const profile = user?.adviserProfile as Adviser['profile'] | undefined
  const { register, handleSubmit, formState } = useForm<Input, unknown, Fields>({
    resolver: zodResolver(schema),
    values: user && { calLink: user.calLink ?? '', ...EMPTY, ...profile },
  })

  const save = async ({ calLink, ...adviserProfile }: Fields) => {
    const { error } = await authClient.updateUser({ calLink, adviserProfile })
    if (error) return toast("We couldn't save that. Please try again.")
    void queryClient.invalidateQueries({ queryKey: ADVISERS })
    toast('Saved. Customers see this on the Experts tab.')
  }

  return (
    <form id={ADVISER_FORM_ID} onSubmit={handleSubmit(save)}>
      <div className="card">
        {FIELDS.map(({ name, label, hint }) => (
          <div className="field" key={name}>
            <label htmlFor={`adv-${name}`}>{label}</label>
            <input className="in" id={`adv-${name}`} placeholder={hint} {...register(name)} />
            {formState.errors[name] ? (
              <p
                className="small"
                style={{ color: 'var(--gap-t)', margin: '4px 0 0' }}
                role="alert"
              >
                {formState.errors[name].message}
              </p>
            ) : null}
          </div>
        ))}
        <p className="small" style={{ margin: '6px 0 0' }}>
          Customers in your organisation see this card and book you through your Cal.com calendar.
        </p>
      </div>
    </form>
  )
}
