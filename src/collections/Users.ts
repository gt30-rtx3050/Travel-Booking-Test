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
      async ({ req, data, operation }) => {
        if (!data || operation !== 'create') return data

        // Allow the first account to bootstrap the site as an administrator.
        if (!req.user) {
          const { totalDocs } = await req.payload.count({ collection: 'users' })
          if (totalDocs === 0) return { ...data, role: 'admin' }
        }

        // Authenticated editors may add teammates, but must never be able to
        // grant administrator privileges. Admins can still choose either role.
        if (req.user && req.user.role !== 'admin') {
          return { ...data, role: 'editor' }
        }

        return data
      },
    ],
  },
  access: {
    read: () => true,
    create: async ({ req: { user, payload } }) => {
      // First-user bootstrap: allow creation without a session only while the
      // database is empty. After that, any authenticated user may add a teammate;
      // the hook above limits non-admin-created accounts to the editor role.
      if (!user) {
        const { totalDocs } = await payload.count({ collection: 'users' })
        return totalDocs === 0
      }
      return true
    },
    update: ({ req: { user } }) => Boolean(user && user.role === 'admin'),
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
      // Keep role assignment an administrator-only capability in both the UI
      // and API. The collection hook also enforces this on every create.
      access: {
        create: ({ req: { user } }) => Boolean(user && user.role === 'admin'),
        update: ({ req: { user } }) => Boolean(user && user.role === 'admin'),
      },
      options: [
        { label: 'Administrator', value: 'admin' },
        { label: 'Editorial Manager', value: 'editor' },
      ],
    },
  ],
}
