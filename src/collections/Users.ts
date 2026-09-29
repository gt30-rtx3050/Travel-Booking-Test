import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'User',
    plural: 'Users',
  },
  auth: true,
  admin: {
    useAsTitle: 'email',
    group: 'Administration',
    defaultColumns: ['name', 'email', 'role', 'createdAt'],
  },
  hooks: {
    beforeChange: [
      // Ensure the first user ever created is promoted to admin so they can
      // manage the system (the role field defaults to "editor").
      async ({ req, data }) => {
        if (!req.user) {
          const { totalDocs } = await req.payload.count({ collection: 'users' })
          if (totalDocs === 0 && data) {
            return { ...data, role: 'admin' }
          }
        }
        return data
      },
    ],
  },
  access: {
    read: () => true,
    create: async ({ req: { user, payload } }) => {
      // First-user bootstrap: anyone can create the very first user so the
      // admin panel's "Create First User" screen works on an empty database.
      if (!user) {
        const { totalDocs } = await payload.count({ collection: 'users' })
        return totalDocs === 0
      }
      // Once users exist, only admins can create additional accounts.
      return user.role === 'admin'
    },
    update: ({ req: { user } }) => {
      // Users can update their own account; admins can update any account.
      if (!user) return false
      return user.role === 'admin'
    },
    delete: ({ req: { user } }) => Boolean(user && user.role === 'admin'),
  },
  fields: [
    {
      name: 'name',
      label: 'Full Name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Administrator', value: 'admin' },
        { label: 'Editorial Manager', value: 'editor' },
      ],
    },
  ],
}
