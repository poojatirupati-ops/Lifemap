// Used by tests/report/reportPages and tests/results/cashflowChart: a rendered view as comparable lines.
/**
 * Runs in the page (passed to page.evaluate, so it must stay self-contained).
 * One line per element or text run, indented by depth. Normalised: attributes and class names
 * sorted, inline style read back through the CSSOM, inputs show their live value, adjacent text
 * merged, inline on* handlers dropped.
 */
export function viewLines(selector) {
  const lines = []
  const attributesOf = (element) => {
    const attributes = {}
    for (const { name, value } of element.attributes) {
      // data-a / data-p drove the original's click dispatcher; React handlers replace them
      if (name.startsWith('on') || name === 'data-a' || name === 'data-p') continue
      attributes[name] = value
    }
    if (attributes.class !== undefined) {
      attributes.class = attributes.class.split(/\s+/).filter(Boolean).sort().join(' ')
    }
    if (attributes.style !== undefined) {
      const style = element.style
      attributes.style = [...style]
        .sort()
        .map((property) => `${property}: ${style.getPropertyValue(property)}`)
        .join('; ')
    }
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName)) attributes.value = element.value
    if (['checkbox', 'radio'].includes(element.type)) attributes.checked = element.checked
    return Object.keys(attributes)
      .sort()
      .map((name) => ` ${name}=${JSON.stringify(attributes[name])}`)
      .join('')
  }
  const walk = (node, depth) => {
    const indent = '  '.repeat(depth)
    let text = ''
    const flushText = () => {
      if (text) lines.push(indent + JSON.stringify(text))
      text = ''
    }
    for (const child of node.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        text += child.data
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        flushText()
        lines.push(`${indent}<${child.tagName.toLowerCase()}${attributesOf(child)}>`)
        if (child.tagName !== 'TEXTAREA') walk(child, depth + 1) // its live value is the attribute
      }
    }
    flushText()
  }
  for (const root of document.querySelectorAll(selector)) {
    lines.push(`#${root.id}`)
    walk(root, 1)
  }
  return lines
}
