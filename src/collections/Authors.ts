import type { CollectionConfig } from 'payload'

export const Authors: CollectionConfig = {
  slug: 'authors',
  labels: {
    singular: 'Author',
    plural: 'Authors',
  },
  admin: {
    useAsTitle: 'name',
    group: 'Editorial & Journal',
    defaultColumns: ['name', 'role', 'credentials'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          label: 'Author Name',
          type: 'text',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'role',
          label: 'Editorial Role / Title',
          type: 'text',
          required: true,
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'credentials',
      label: 'Field Credentials (e.g. IFMGA Mountain Guide, Polar Naturalist)',
      type: 'text',
    },
    {
      name: 'bio',
      label: 'Author Biography',
      type: 'textarea',
      required: true,
    },
    {
      name: 'avatar',
      label: 'Portrait Image',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}
