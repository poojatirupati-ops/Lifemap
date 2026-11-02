import type { ComponentType } from 'react'
import { useStore } from '../state/store.ts'
import SheetFrame from '../components/ui/SheetFrame.tsx'

/**
 * What a src/sheets/*.sheet.tsx exports. The plan's `sheet` is 'key' or 'key|param'; the param is
 * passed to Body as `param`. Body's first h2 carries id="sheet-t" and tabIndex={-1}.
 */
export interface Sheet {
  key: string
  chat?: boolean
  aria?: Record<string, string>
  Body: ComponentType<{ param?: string }>
}

const modules = import.meta.glob<Sheet>('../sheets/*.sheet.tsx', { eager: true })

/** Sheet key -> sheet module. */
const sheets = new Map(Object.values(modules).map((sheet) => [sheet.key, sheet]))

export default function SheetHost() {
  const sheet = useStore((store) => store.sheet)
  const { closeSheet } = useStore.getState()
  if (!sheet) return null

  // 'ask' and 'elig' are whole keys; the rest are 'key|param'.
  const [key, param] = sheet.split('|')
  const found = sheets.get(sheet) ?? sheets.get(key)

  // Not converted yet: the original's empty dialog.
  if (!found) return <SheetFrame aria={{ 'aria-label': 'Dialog' }} onClose={closeSheet} />

  return (
    <SheetFrame chat={found.chat} aria={found.aria} onClose={closeSheet}>
      <found.Body param={param} />
    </SheetFrame>
  )
}
