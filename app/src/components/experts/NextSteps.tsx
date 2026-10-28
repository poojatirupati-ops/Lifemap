const STEPS = [
  { icon: '🔎', title: 'Your adviser reviews your plan' },
  {
    icon: '📞',
    title: 'A short verification call',
    detail: 'Confirm details and add any missing documents securely',
  },
  { icon: '🤝', title: 'You agree your personal plan together' },
  { icon: '🚀', title: 'You take action' },
  { icon: '🔔', title: 'LifeMap keeps tracking and reminds you about reviews' },
]

/** What happens after booking, as numbered steps. */
export default function NextSteps() {
  return (
    <div className="card bk-next">
      <h3 className="h">What happens next</h3>
      <ol className="bk-steps">
        {STEPS.map(({ icon, title, detail }, index) => (
          <li key={title}>
            <span className="bk-n" aria-hidden="true">
              {icon}
            </span>
            <div>
              <b>
                {index + 1}. {title}
              </b>
              {detail ? <small>{detail}</small> : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
