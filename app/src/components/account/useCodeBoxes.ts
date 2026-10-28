import { useRef, type ClipboardEvent, type FormEvent, type KeyboardEvent } from 'react'

/**
 * One-digit boxes that behave like one code field: typing moves on, Backspace on an empty box moves
 * back, Enter submits, and pasting the whole code fills every box. Spread the returned props on each box.
 */
export function useCodeBoxes(
  length: number,
  onChange: (code: string) => void,
  onEnter: () => void,
) {
  const boxes = useRef<(HTMLInputElement | null)[]>([])
  const report = () => onChange(boxes.current.map((box) => box?.value ?? '').join(''))

  return Array.from({ length }, (_, index) => ({
    ref: (box: HTMLInputElement | null) => {
      boxes.current[index] = box
    },
    onInput: (event: FormEvent<HTMLInputElement>) => {
      const box = event.currentTarget
      box.value = box.value.replace(/\D/g, '').slice(-1)
      if (box.value) boxes.current[index + 1]?.focus()
      report()
    },
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Backspace' && !event.currentTarget.value) boxes.current[index - 1]?.focus()
      if (event.key === 'Enter') onEnter()
    },
    onPaste: (event: ClipboardEvent<HTMLInputElement>) => {
      const digits = event.clipboardData.getData('text').replace(/\D/g, '')
      if (digits.length !== length) return
      event.preventDefault()
      boxes.current.forEach((box, at) => box && (box.value = digits[at]))
      boxes.current[length - 1]?.focus()
      report()
    },
  }))
}
