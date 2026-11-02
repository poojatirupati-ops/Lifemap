/** Protection asks Yes or No for each kind of cover. */
export default function ProtectionLead() {
  return (
    <>
      <p style={{ margin: '0 0 10px' }}>
        <b>Do you have any of the following?</b>
      </p>
      <p className="small" style={{ margin: '-4px 0 12px' }}>
        Say Yes to add the details, and a policy if you like. Add more than one of each if you have
        them.
      </p>
    </>
  )
}
