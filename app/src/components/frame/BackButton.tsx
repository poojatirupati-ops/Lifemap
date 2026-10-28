export default function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="backb" onClick={onClick}>
      ‹ Back
    </button>
  )
}
