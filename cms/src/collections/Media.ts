import type { CollectionConfig } from 'payload'

// Images and caption files (.vtt). Public read: the app shows them. Private bucket in production; Payload serves the files.
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
  upload: { mimeTypes: ['image/*', 'text/vtt'] },
}
