// The report's A4 pages shrink to the dialog's width.
/** Pages shrink to the dialog's width (never below 30%). */
export function fitReport() {
  const report = document.getElementById('report')
  if (!report?.classList.contains('on')) return
  const scale = Math.min(1, Math.max(0.3, (report.clientWidth - 24) / 794))
  report.style.setProperty('--lmr-s', scale.toFixed(4))
}
