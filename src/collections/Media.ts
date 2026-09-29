import type { CollectionConfig } from 'payload'
import path from 'node:path'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Media Asset',
    plural: 'Media Library',
  },
  admin: {
    useAsTitle: 'alt',
    group: 'Content',
    defaultColumns: ['filename', 'alt', 'caption', 'updatedAt'],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: ({ req: { user } }) => Boolean(user),
  },
  upload: {
    staticDir: path.resolve(process.cwd(), 'public/media'),
    mimeTypes: ['image/*', 'video/*'],
  },
  fields: [
    {
      name: 'alt',
      label: 'Alt Text (Accessibility & SEO)',
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      label: 'Editorial Caption',
      type: 'text',
    },
  ],
}
