// Saving files from a shared Claude page, where printing and plain downloads are blocked: its
// "downloads" capability saves them instead (journey-spec §24.3).
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

/** Save a file through the downloads capability; false when there is none or it refused. */
export async function save(filename: string, blob: Blob) {
  const target = await downloads()
  if (!target) return false
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
