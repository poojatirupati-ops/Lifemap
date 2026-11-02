// The plan report as a PDF: one A4 page picture per report page, with searchable text over it.

/** An A4 report page in CSS pixels. */
export const PAGE_WIDTH = 794
export const PAGE_HEIGHT = 1123

// Invisible text over each page picture, so the PDF can be searched, copied and read aloud.
function addTextLayer(pdf: import('jspdf').jsPDF, page: HTMLElement) {
  const box = page.getBoundingClientRect()
  const mmPerPx = 210 / box.width
  const walker = document.createTreeWalker(page, NodeFilter.SHOW_TEXT)
  const range = document.createRange()
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    for (const word of node.nodeValue!.matchAll(/\S+/g)) {
      range.setStart(node, word.index)
      range.setEnd(node, word.index + word[0].length)
      const rect = range.getBoundingClientRect()
      const text = word[0]
        .replace(/[‘’]/g, "'")
        .replace(/[“”]/g, '"')
        .replace(/[–—]/g, '-')
        .replace(/[^\x20-\x7E£€]/g, '')
      if (!rect.width || !rect.height || !text) continue
      const height = rect.height * mmPerPx
      pdf.setFontSize(Math.max(height * 2.83 * 0.7, 3))
      const x = (rect.left - box.left) * mmPerPx
      const y = (rect.bottom - box.top) * mmPerPx - height * 0.2
      pdf.text(text, x, y, { renderingMode: 'invisible' })
    }
  }
}

/** One A4 PDF page per report page (copies of the shown pages, unscaled), drawn off screen at 2x. */
export async function planPdf(shown: HTMLElement[]) {
  const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ])
  const host = document.createElement('div')
  host.setAttribute('aria-hidden', 'true')
  Object.assign(host.style, {
    position: 'fixed',
    left: '-12000px',
    top: '0',
    width: `${PAGE_WIDTH}px`,
    background: '#fff',
    zIndex: '-1',
  })
  host.append(...shown.map((page) => page.cloneNode(true)))
  document.body.appendChild(host)
  try {
    await document.fonts?.ready
    const images = [...host.querySelectorAll('img')].filter((image) => !image.complete)
    await Promise.all(
      images.map((image) => new Promise((done) => (image.onload = image.onerror = done))),
    )
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true })
    const pages = [...host.querySelectorAll<HTMLElement>('.lmr-pg')]
    for (const [index, page] of pages.entries()) {
      const canvas = await html2canvas(page, {
        scale: 2,
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        windowWidth: PAGE_WIDTH,
      })
      if (index) pdf.addPage()
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, 210, 297, undefined, 'FAST')
      try {
        addTextLayer(pdf, page)
      } catch {
        // the picture alone is still a good PDF
      }
    }
    return { blob: pdf.output('blob'), pages: pages.length }
  } finally {
    host.remove()
  }
}
