import type { CollectionConfig } from 'payload'

export const TeamMembers: CollectionConfig = {
  slug: 'team-members',
  labels: {
    singular: 'Team Member',
    plural: 'Team Members',
  },
  admin: {
    useAsTitle: 'name',
    group: 'Content',
    defaultColumns: ['name', 'role', 'specialty', 'yearsExperience', 'order'],
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
          label: 'Full Name',
          type: 'text',
          required: true,
          admin: { width: '35%' },
        },
        {
          name: 'role',
          label: 'Title / Role',
          type: 'text',
          required: true,
          admin: { width: '35%' },
        },
        {
          name: 'yearsExperience',
          label: 'Years in the Field',
          type: 'number',
          defaultValue: 12,
          admin: { width: '15%' },
        },
        {
          name: 'order',
          label: 'Display Order',
          type: 'number',
          defaultValue: 1,
          admin: { width: '15%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'specialty',
          label: 'Region / Expedition Specialty',
          type: 'text',
          admin: { width: '50%' },
        },
        {
          name: 'certifications',
          label: 'Certifications & Accreditations',
          type: 'text',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'bio',
      label: 'Biography',
      type: 'textarea',
      required: true,
    },
    {
      name: 'photo',
      label: 'Portrait Photograph',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}
