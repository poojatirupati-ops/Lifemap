import { APIError, type CollectionConfig } from 'payload'

// Images and caption files (.vtt); videos go straight to Vimeo (Videos). Public read: the app shows them.
// In production the browser PUTs files to the private bucket with a presigned URL (s3Storage clientUploads).
export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  // No `upload.mimeTypes`: with an allow-list Payload downloads every client upload back from S3 to sniff its type.
  // The declared type is checked here instead (S3 stores it with the signed Content-Type).
  upload: true,
  hooks: {
    beforeValidate: [
      ({ data }) => {
        const type = data?.mimeType
        if (type && !(type.startsWith('image/') || type === 'text/vtt')) {
          throw new APIError('Media takes images and .vtt captions only. Upload videos in a Video.', 400, null, true)
        }
        return data
      },
    ],
  },
}
