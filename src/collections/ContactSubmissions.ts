import type { CollectionConfig } from 'payload'

export const ContactSubmissions: CollectionConfig = {
  slug: 'contact-submissions',
  labels: {
    singular: 'Contact Submission',
    plural: 'Contact Submissions',
  },
  admin: {
    useAsTitle: 'name',
    group: 'Expeditions & Bookings',
    defaultColumns: ['name', 'email', 'subject', 'inquiryType', 'status', 'createdAt'],
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: () => true,
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          label: 'Sender Name',
          type: 'text',
          required: true,
          admin: { width: '35%' },
        },
        {
          name: 'email',
          label: 'Email Address',
          type: 'email',
          required: true,
          admin: { width: '35%' },
        },
        {
          name: 'phone',
          label: 'Phone Number',
          type: 'text',
          admin: { width: '30%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'subject',
          label: 'Subject',
          type: 'text',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'inquiryType',
          label: 'Inquiry Category',
          type: 'select',
          required: true,
          defaultValue: 'general',
          options: [
            { label: 'General Expedition Inquiry', value: 'general' },
            { label: 'Private / Bespoke Charter', value: 'bespoke' },
            { label: 'Dispatch Newsletter', value: 'newsletter' },
            { label: 'Press & Partnerships', value: 'press' },
          ],
          admin: { width: '25%' },
        },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          required: true,
          defaultValue: 'new',
          options: [
            { label: 'New', value: 'new' },
            { label: 'In Progress', value: 'in-progress' },
            { label: 'Resolved', value: 'resolved' },
          ],
          admin: { width: '25%' },
        },
      ],
    },
    {
      name: 'destinationInterest',
      label: 'Destination of Interest',
      type: 'text',
    },
    {
      name: 'message',
      label: 'Message',
      type: 'textarea',
      required: true,
    },
  ],
}
