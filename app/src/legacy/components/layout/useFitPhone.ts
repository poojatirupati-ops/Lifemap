import { useEffect } from 'react'

/** Port of the prototype's fit(): full-bleed under 800px or landscape phones, otherwise scale the 390x844 phone to the window. */
export function useFitPhone() {
  useEffect(() => {
    const fit = () => {
      const w = document.getElementById('wrap'), p = document.getElementById('phone')
      if (!w || !p) return
      const small = innerWidth <= 800 || (innerHeight <= 500 && innerWidth > innerHeight)
      const [W, H] = small ? ['100%', '100%'] : ['', '']
      w.style.width = p.style.width = W
      w.style.height = p.style.height = H
      w.style.transform = small ? 'none' : `scale(${Math.max(0.4, Math.min(1, (innerHeight - 30) / 844, (innerWidth - 330) / 420))})`
    }
    fit()
    addEventListener('resize', fit)
    return () => removeEventListener('resize', fit)
  }, [])
}
