import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: 'Category',
    plural: 'Categories',
  },
  admin: {
    useAsTitle: 'name',
    group: 'Editorial & Journal',
    defaultColumns: ['name', 'slug', 'description'],
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
          label: 'Category Name',
          type: 'text',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'slug',
          label: 'Category Slug',
          type: 'text',
          required: true,
          unique: true,
          index: true,
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'description',
      label: 'Category Description',
      type: 'textarea',
    },
  ],
}
