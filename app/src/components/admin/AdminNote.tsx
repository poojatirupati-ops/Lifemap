/** Who controls the standards and what can't be changed here. */
export default function AdminNote() {
  return (
    <div
      className="note"
      role="note"
      style={{ background: '#FFF3CD', border: '1.5px solid #E0B84A' }}
    >
      <b>🔒 Admin view · not for customers.</b> LifeMap or a partner (credit union, adviser firm,
      company, agent) controls these standards. A figure changed here changes the suggestion
      everywhere, in the app and in the workbook's Settings sheet. Customers can still change any of
      them for their own plan. Law values (tax, USC, PRSI, pension relief, State Pension, Central
      Bank limits) are not here and can't be changed. Retirement age and life expectancy have no
      standard.
    </div>
  )
}
