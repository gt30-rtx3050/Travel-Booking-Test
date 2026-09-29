import type { GlobalConfig } from 'payload'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Navigation Menus',
  admin: {
    group: 'Global Configuration',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'headerItems',
      label: 'Primary Header Links',
      type: 'array',
      minRows: 1,
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'label',
              label: 'Navigation Label',
              type: 'text',
              required: true,
              admin: { width: '35%' },
            },
            {
              name: 'href',
              label: 'Route Path',
              type: 'text',
              required: true,
              admin: { width: '35%' },
            },
            {
              name: 'description',
              label: 'Subtitle / Tooltip',
              type: 'text',
              admin: { width: '30%' },
            },
          ],
        },
      ],
    },
    {
      name: 'ctaButton',
      label: 'Header Primary Action Button',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'label',
              label: 'Button Label',
              type: 'text',
              required: true,
              defaultValue: 'Explore Expeditions',
              admin: { width: '50%' },
            },
            {
              name: 'href',
              label: 'Button Destination',
              type: 'text',
              required: true,
              defaultValue: '/trips',
              admin: { width: '50%' },
            },
          ],
        },
      ],
    },
    {
      name: 'footerColumns',
      label: 'Footer Link Columns',
      type: 'array',
      fields: [
        {
          name: 'title',
          label: 'Column Heading',
          type: 'text',
          required: true,
        },
        {
          name: 'links',
          label: 'Column Links',
          type: 'array',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'label',
                  label: 'Link Label',
                  type: 'text',
                  required: true,
                  admin: { width: '50%' },
                },
                {
                  name: 'href',
                  label: 'Link URL / Route',
                  type: 'text',
                  required: true,
                  admin: { width: '50%' },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
