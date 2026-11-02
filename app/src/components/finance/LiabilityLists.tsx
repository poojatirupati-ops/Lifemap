import ListBlock from './ListBlock.tsx'

/** Below the mortgage: other mortgages, credit cards and loans. */
export default function LiabilityLists() {
  return (
    <>
      <div style={{ height: 12 }} />
      <ListBlock list="mort2" />
      <ListBlock list="cards" />
      <ListBlock list="loans" />
    </>
  )
}
