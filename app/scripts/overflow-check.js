// Paste into the console of the running app (npm run dev). Loads each public route in border-less iframes
// at 4 widths and fails a row if anything pokes past the viewport or a scroller scrolls sideways.
// Rows with ok:false are bugs. Returns true only when every row passes.
const routes = ['/#/welcome', '/#/discover', '/#/reveal', '/#/sign-in']
const widths = [320, 375, 768, 1280]
const rows = []
for (const w of widths) for (const r of routes) {
  const f = Object.assign(document.createElement('iframe'), { src: r })
  Object.assign(f.style, { position: 'fixed', left: '-9999px', width: w + 'px', height: '800px', border: '0' })
  document.body.append(f)
  await new Promise(res => (f.onload = res)); await new Promise(res => setTimeout(res, 600))
  const d = f.contentDocument, win = f.contentWindow
  const wide = [...d.body.querySelectorAll('*')].filter(e => e.getBoundingClientRect().right > win.innerWidth + 0.5 && !e.closest('[aria-hidden=true]'))
  const scrollers = [d.documentElement, ...d.querySelectorAll('.app-scroll')].filter(e => e.scrollWidth > e.clientWidth)
  rows.push({ w, route: r, inner: win.innerWidth, wide: wide.length, first: wide[0]?.className || wide[0]?.tagName || '', sideScroll: scrollers.length, ok: !wide.length && !scrollers.length })
  f.remove()
}
console.table(rows); rows.every(x => x.ok)
