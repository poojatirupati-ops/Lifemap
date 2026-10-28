import { useEffect, useState } from 'react'
import { useStore } from '../../state/store.ts'

const typing = () => {
  const el = document.activeElement
  return (
    el instanceof HTMLElement &&
    /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) &&
    (el as HTMLInputElement).type !== 'file'
  )
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
    const checkSoon = () => setTimeout(check, 50)
    document.addEventListener('focusin', check)
    document.addEventListener('focusout', checkSoon)
    document.addEventListener('fullscreenchange', check)
    viewport?.addEventListener('resize', check)
    return () => {
      document.removeEventListener('focusin', check)
      document.removeEventListener('focusout', checkSoon)
      document.removeEventListener('fullscreenchange', check)
      viewport?.removeEventListener('resize', check)
    }
  }, [])
  return hidden
}

/** The floating "Talk to a mortgage expert" button. */
export default function ExpertFab() {
  const hidden = useOutOfTheWay()
  return (
    <button
      className={hidden ? 'btn xfab hid' : 'btn xfab'}
      id="xfab"
      data-a="xfab"
      data-p="mortgage"
      aria-haspopup="dialog"
      onClick={() => useStore.getState().openSheet('xpert|mortgage')}
    >
      <span aria-hidden="true">💬</span>
      <span className="tx">Talk to a mortgage expert</span>
    </button>
  )
}
