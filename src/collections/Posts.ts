import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: {
    singular: 'Journal Article',
    plural: 'Journal Articles',
  },
  admin: {
    useAsTitle: 'title',
    group: 'Editorial & Journal',
    defaultColumns: ['title', 'author', 'publishedDate', 'status'],
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
          name: 'title',
          label: 'Article Title',
          type: 'text',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'slug',
          label: 'URL Slug',
          type: 'text',
          required: true,
          unique: true,
          index: true,
          admin: { width: '30%' },
        },
        {
          name: 'status',
          label: 'Publication Status',
          type: 'select',
          required: true,
          defaultValue: 'published',
          options: [
            { label: 'Draft', value: 'draft' },
            { label: 'Published', value: 'published' },
          ],
          admin: { width: '20%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'author',
          label: 'Author',
          type: 'relationship',
          relationTo: 'authors',
          required: true,
          admin: { width: '35%' },
        },
        {
          name: 'categories',
          label: 'Categories',
          type: 'relationship',
          relationTo: 'categories',
          hasMany: true,
          required: true,
          admin: { width: '35%' },
        },
        {
          name: 'publishedDate',
          label: 'Published Date',
          type: 'date',
          required: true,
          admin: { width: '15%' },
        },
        {
          name: 'readTime',
          label: 'Reading Time',
          type: 'text',
          defaultValue: '6 min read',
          admin: { width: '15%' },
        },
      ],
    },
    {
      name: 'featuredImage',
      label: 'Featured Photograph',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'excerpt',
      label: 'Editorial Excerpt',
      type: 'textarea',
      required: true,
    },
    {
      name: 'content',
      label: 'Article Content',
      type: 'richText',
      required: true,
    },
    {
      name: 'seo',
      label: 'SEO & Open Graph Metadata',
      type: 'group',
      fields: [
        {
          name: 'metaTitle',
          label: 'Meta Title',
          type: 'text',
        },
        {
          name: 'metaDescription',
          label: 'Meta Description',
          type: 'textarea',
        },
        {
          name: 'ogImage',
          label: 'Open Graph Image',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
  ],
}
