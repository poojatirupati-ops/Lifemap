// Decorative emoji: hidden from assistive tech (spec sec 17). Put the meaning in nearby text.
export default function Emoji({ children }: { children: string }) {
  return <span aria-hidden="true">{children}</span>
}
