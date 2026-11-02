import type { HTMLAttributes, ReactNode } from 'react'
import { Content, Root } from '@radix-ui/react-dialog'
import { clsx } from 'clsx'
import { useDialogFocus } from '../../hooks/useDialogFocus.ts'

interface Props {
  chat?: boolean
  aria?: Pick<HTMLAttributes<HTMLDivElement>, 'aria-label' | 'aria-labelledby'>
  onClose: () => void
  children?: ReactNode
}

const FIRST_FIELD = 'input:not([type=checkbox]),.btn'

/**
 * The original's sheet shell: backdrop, dialog named by its heading (#sheet-t unless `aria` says
 * otherwise), grab handle, close button. A Radix dialog: Tab stays inside, Escape or a click
 * outside closes it, focus returns to the opener.
 */
export default function SheetFrame({
  chat,
  aria = { 'aria-labelledby': 'sheet-t' },
  onClose,
  children,
}: Props) {
  // A sheet opens on its first field or button; the Ask chat (and a sheet without either) on its title.
  const focus = useDialogFocus(
    (sheet) =>
      (chat ? null : sheet.querySelector<HTMLElement>(FIRST_FIELD)) ?? sheet.querySelector('h2'),
  )

  return (
    <Root open onOpenChange={onClose}>
      <div className="sheet-bg">
        {/* ponytail: undefined drops Radix's data-state, tabindex, id and aria-* to keep the original's markup; h2#sheet-t is not a Dialog.Title, so dev logs Radix's missing-title error. Wrap SheetTitle in <Title asChild> to silence it. */}
        <Content asChild {...focus}>
          <div
            className={clsx('sheet', chat && 'chatsheet')}
            role="dialog"
            aria-modal="true"
            aria-labelledby={undefined}
            aria-describedby={undefined}
            data-state={undefined}
            tabIndex={undefined}
            id={undefined}
            {...aria}
          >
            <div className="grab"></div>
            <button className="sx" aria-label="Close" onClick={onClose}>
              ✕
            </button>
            {children}
          </div>
        </Content>
      </div>
    </Root>
  )
}
