import type { CollectionConfig } from 'payload'

export const Bookings: CollectionConfig = {
  slug: 'bookings',
  labels: {
    singular: 'Booking Inquiry',
    plural: 'Bookings',
  },
  admin: {
    useAsTitle: 'name',
    group: 'Expeditions & Bookings',
    defaultColumns: ['name', 'email', 'trip', 'preferredDate', 'numberOfTravelers', 'status', 'createdAt'],
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: () => true,
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'trip',
      label: 'Selected Expedition Trip',
      type: 'relationship',
      relationTo: 'trips',
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'preferredDate',
          label: 'Preferred Departure Date',
          type: 'text',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'numberOfTravelers',
          label: 'Number of Travelers',
          type: 'number',
          required: true,
          min: 1,
          max: 24,
          defaultValue: 2,
          admin: { width: '25%' },
        },
        {
          name: 'status',
          label: 'Booking Status',
          type: 'select',
          required: true,
          defaultValue: 'new',
          options: [
            { label: 'New Inquiry', value: 'new' },
            { label: 'Contacted', value: 'contacted' },
            { label: 'Confirmed', value: 'confirmed' },
            { label: 'Cancelled', value: 'cancelled' },
          ],
          admin: { width: '25%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          label: 'Guest Full Name',
          type: 'text',
          required: true,
          admin: { width: '34%' },
        },
        {
          name: 'email',
          label: 'Email Address',
          type: 'email',
          required: true,
          admin: { width: '33%' },
        },
        {
          name: 'phone',
          label: 'Phone Number',
          type: 'text',
          required: true,
          admin: { width: '33%' },
        },
      ],
    },
    {
      name: 'message',
      label: 'Special Requests / Experience Notes',
      type: 'textarea',
    },
  ],
}
