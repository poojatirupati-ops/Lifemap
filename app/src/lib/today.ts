/** Today at local midnight. iso ('YYYY-MM-DD') pins the date; tools/view-equal.mjs pins it with window.__TODAY. */
export function localToday(iso = (globalThis as { __TODAY?: string }).__TODAY) {
  const now = iso ? new Date(`${iso}T12:00:00`) : new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}
