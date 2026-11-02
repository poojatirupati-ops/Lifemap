// Saving files: a plain browser download, or inside a shared Claude page (where plain downloads are
// blocked) its "downloads" capability (journey-spec §24.3).
type Downloads = {
  save: (file: { filename: string; data: Blob | ArrayBuffer }) => Promise<unknown>
}
type ClaudeWindow = { claude?: { use?: (name: string) => Promise<Downloads> } }

/** The page's downloads capability, or null outside a shared Claude page. */
export async function downloads() {
  try {
    const found = await (window as ClaudeWindow).claude?.use?.('downloads')
    return typeof found?.save === 'function' ? found : null
  } catch {
    return null
  }
}

/** A plain browser download. */
function download(filename: string, blob: Blob) {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  setTimeout(() => URL.revokeObjectURL(link.href), 20000)
}

/** Save a file (the downloads capability inside a shared Claude page); false when that refused. */
export async function save(filename: string, blob: Blob) {
  const target = await downloads()
  if (!target) {
    download(filename, blob)
    return true
  }
  try {
    await target.save({ filename, data: blob })
    return true
  } catch {
    try {
      await target.save({ filename, data: await blob.arrayBuffer() })
      return true
    } catch {
      return false
    }
  }
}
