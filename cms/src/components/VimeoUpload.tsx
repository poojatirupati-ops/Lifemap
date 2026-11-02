'use client'
// The browser sends the file straight to Vimeo (tus); the CMS only hands out the upload link.
import { FieldLabel, useConfig, useField } from '@payloadcms/ui'
import { useState } from 'react'
import { Upload } from 'tus-js-client'

export function VimeoUpload() {
  const {
    config: { serverURL, routes },
  } = useConfig()
  const vimeoId = useField<string | null>({ path: 'vimeoId' })
  const vimeoStatus = useField<string | null>({ path: 'vimeoStatus' })
  const vimeoUrl = useField<string | null>({ path: 'vimeoUrl' })
  const thumbnailUrl = useField<string | null>({ path: 'thumbnailUrl' })
  const duration = useField<string | null>({ path: 'duration' })
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const send = async (file: File) => {
    setBusy(true)
    setMessage('Starting…')
    const res = await fetch(`${serverURL}${routes.api}/videos/vimeo-upload`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: file.name, size: file.size }),
    }).catch(() => null)
    const body = await res?.json().catch(() => null)
    if (!res?.ok || !body?.uploadLink) {
      setBusy(false)
      return setMessage(body?.errors?.[0]?.message ?? 'Could not start the upload.')
    }
    new Upload(file, {
      uploadUrl: body.uploadLink,
      onProgress: (sent, total) => setMessage(`Uploading to Vimeo… ${Math.round((sent / total) * 100)}%`),
      onError: (err) => {
        setBusy(false)
        setMessage(`Upload failed: ${err.message}. Choose the file again to retry.`)
      },
      onSuccess: () => {
        setBusy(false)
        vimeoId.setValue(body.vimeoId)
        vimeoStatus.setValue('transcoding')
        vimeoUrl.setValue(null)
        thumbnailUrl.setValue(null)
        duration.setValue(null)
        setMessage('Uploaded. Save to keep it; Vimeo is transcoding.')
      },
    }).start()
  }

  return (
    <div className="field-type">
      <FieldLabel label="Video file" htmlFor="vimeo-upload" />
      <input
        id="vimeo-upload"
        type="file"
        accept="video/*"
        disabled={busy}
        onChange={(e) => e.target.files?.[0] && send(e.target.files[0])}
      />
      <p className="field-description" aria-live="polite">
        {message || "Uploads straight to Vimeo (embed only on the app's domains). Choosing a new file replaces the video."}
      </p>
    </div>
  )
}
