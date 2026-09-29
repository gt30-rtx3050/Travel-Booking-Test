import type { CollectionConfig } from 'payload'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  labels: {
    singular: 'Guest Testimonial',
    plural: 'Testimonials',
  },
  admin: {
    useAsTitle: 'guestName',
    group: 'Content',
    defaultColumns: ['guestName', 'guestLocation', 'rating', 'trip', 'featured'],
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
          name: 'guestName',
          label: 'Guest Name',
          type: 'text',
          required: true,
          admin: { width: '40%' },
        },
        {
          name: 'guestLocation',
          label: 'Guest City / Country',
          type: 'text',
          required: true,
          admin: { width: '35%' },
        },
        {
          name: 'rating',
          label: 'Star Rating (1–5)',
          type: 'number',
          required: true,
          min: 1,
          max: 5,
          defaultValue: 5,
          admin: { width: '15%' },
        },
        {
          name: 'featured',
          label: 'Featured',
          type: 'checkbox',
          defaultValue: true,
          admin: { width: '10%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'trip',
          label: 'Associated Expedition',
          type: 'relationship',
          relationTo: 'trips',
          admin: { width: '60%' },
        },
        {
          name: 'travelDate',
          label: 'Expedition Season / Date',
          type: 'text',
          admin: { width: '40%' },
        },
      ],
    },
    {
      name: 'quote',
      label: 'Guest Testimonial Quote',
      type: 'textarea',
      required: true,
    },
    {
      name: 'avatar',
      label: 'Guest Portrait (Optional)',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}
