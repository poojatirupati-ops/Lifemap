import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { useStore } from '../../state/store.ts'

const typing = () => {
  const el = document.activeElement
  return el instanceof HTMLInputElement ? el.type !== 'file' : !!el?.matches('textarea,select')
}

/** Out of the way while the keyboard is up or a video plays full screen. */
function useOutOfTheWay() {
  const [hidden, setHidden] = useState(false)
  useEffect(() => {
    const viewport = window.visualViewport
    const check = () =>
      setHidden(
        typing() ||
          !!document.fullscreenElement ||
          (!!viewport && viewport.height < innerHeight * 0.75),
      )
    let timer: ReturnType<typeof setTimeout> | undefined
    const checkSoon = () => {
      clearTimeout(timer)
      timer = setTimeout(check, 50)
    }
    // window.: the test DOM (jsdom) rejects a signal from Node's own AbortController
    const controller = new window.AbortController()
    const { signal } = controller
    document.addEventListener('focusin', check, { signal })
    document.addEventListener('focusout', checkSoon, { signal })
    document.addEventListener('fullscreenchange', check, { signal })
    viewport?.addEventListener('resize', check, { signal })
    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [])
  return hidden
}

/** The floating "Talk to a mortgage expert" button. */
export default function ExpertFab() {
  const hidden = useOutOfTheWay()
  const openSheet = useStore((s) => s.openSheet)
  return (
    <button
      className={clsx('btn xfab', { hid: hidden })}
      id="xfab"
      data-a="xfab"
      data-p="mortgage"
      aria-haspopup="dialog"
      onClick={() => openSheet('xpert|mortgage')}
    >
      <span aria-hidden="true">💬</span>
      <span className="tx">Talk to a mortgage expert</span>
    </button>
  )
}
