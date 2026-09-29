import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  admin: {
    group: 'Global Configuration',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'siteName',
          label: 'Brand Name',
          type: 'text',
          required: true,
          defaultValue: 'Celeste Expeditions',
          admin: { width: '50%' },
        },
        {
          name: 'tagline',
          label: 'Brand Tagline',
          type: 'text',
          required: true,
          defaultValue: 'Architectural Alpine & Polar Voyages',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'logo',
      label: 'Brand Logo Image (Optional Upload)',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'contactInfo',
      label: 'Concierge & Office Contact Details',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'email',
              label: 'General Concierge Email',
              type: 'email',
              required: true,
              defaultValue: 'concierge@celeste-expeditions.com',
              admin: { width: '33%' },
            },
            {
              name: 'bookingsEmail',
              label: 'Private Bookings Email',
              type: 'email',
              required: true,
              defaultValue: 'bookings@celeste-expeditions.com',
              admin: { width: '33%' },
            },
            {
              name: 'phone',
              label: 'Primary Telephone',
              type: 'text',
              required: true,
              defaultValue: '+41 44 580 29 40',
              admin: { width: '34%' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'emergencyPhone',
              label: '24/7 Satellite Operations Desk',
              type: 'text',
              defaultValue: '+41 44 580 29 99',
              admin: { width: '33%' },
            },
            {
              name: 'address',
              label: 'Headquarters Address',
              type: 'text',
              required: true,
              defaultValue: 'Bahnhofstrasse 42, 8001 Zürich, Switzerland',
              admin: { width: '34%' },
            },
            {
              name: 'officeHours',
              label: 'Consultation Hours',
              type: 'text',
              defaultValue: 'Mon – Sat · 08:00 – 20:00 CET',
              admin: { width: '33%' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'latitude',
              label: 'HQ Map Latitude',
              type: 'number',
              defaultValue: 47.3717,
              admin: { width: '50%' },
            },
            {
              name: 'longitude',
              label: 'HQ Map Longitude',
              type: 'number',
              defaultValue: 8.5386,
              admin: { width: '50%' },
            },
          ],
        },
      ],
    },
    {
      name: 'socials',
      label: 'Social Channels',
      type: 'array',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'platform',
              label: 'Platform Name',
              type: 'text',
              required: true,
              admin: { width: '30%' },
            },
            {
              name: 'handle',
              label: 'Display Handle',
              type: 'text',
              admin: { width: '30%' },
            },
            {
              name: 'url',
              label: 'URL',
              type: 'text',
              required: true,
              admin: { width: '40%' },
            },
          ],
        },
      ],
    },
    {
      name: 'footer',
      label: 'Footer Configuration',
      type: 'group',
      fields: [
        {
          name: 'description',
          label: 'Footer Brand Summary',
          type: 'textarea',
          required: true,
        },
        {
          name: 'copyrightText',
          label: 'Copyright Notice',
          type: 'text',
          required: true,
        },
        {
          name: 'certifications',
          label: 'Accreditations & Memberships',
          type: 'array',
          fields: [
            {
              name: 'label',
              label: 'Certification Name',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'aboutPage',
      label: 'About Page Content',
      type: 'group',
      fields: [
        {
          name: 'heroSubtitle',
          label: 'Hero Eyebrow',
          type: 'text',
          defaultValue: 'OUR HERITAGE & ETHOS',
        },
        {
          name: 'heroTitle',
          label: 'Hero Title',
          type: 'text',
          defaultValue: 'Crafted by Alpinists, Polar Navigators, and Cultural Stewards',
        },
        {
          name: 'storyHeadline',
          label: 'Story Section Headline',
          type: 'text',
          defaultValue: 'Precision Logistics Meet Unhurried Wilderness Immersion',
        },
        {
          name: 'storyLead',
          label: 'Story Lead Paragraph',
          type: 'textarea',
        },
        {
          name: 'storyParagraphs',
          label: 'Story Body Paragraphs',
          type: 'array',
          fields: [
            {
              name: 'paragraph',
              label: 'Paragraph Text',
              type: 'textarea',
              required: true,
            },
          ],
        },
        {
          name: 'stats',
          label: 'Key Milestones & Figures',
          type: 'array',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'value',
                  label: 'Metric Value',
                  type: 'text',
                  required: true,
                  admin: { width: '30%' },
                },
                {
                  name: 'label',
                  label: 'Metric Label',
                  type: 'text',
                  required: true,
                  admin: { width: '35%' },
                },
                {
                  name: 'detail',
                  label: 'Supporting Context',
                  type: 'text',
                  admin: { width: '35%' },
                },
              ],
            },
          ],
        },
        {
          name: 'values',
          label: 'Core Guiding Values',
          type: 'array',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'icon',
                  label: 'Lucide Icon Name',
                  type: 'text',
                  required: true,
                  defaultValue: 'Shield',
                  admin: { width: '30%' },
                },
                {
                  name: 'title',
                  label: 'Value Title',
                  type: 'text',
                  required: true,
                  admin: { width: '70%' },
                },
              ],
            },
            {
              name: 'description',
              label: 'Value Description',
              type: 'textarea',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'legalPages',
      label: 'Privacy Policy & Terms of Service Content',
      type: 'group',
      fields: [
        {
          name: 'privacyLastUpdated',
          label: 'Privacy Policy Last Updated',
          type: 'text',
          defaultValue: 'September 1, 2026',
        },
        {
          name: 'privacySections',
          label: 'Privacy Policy Sections',
          type: 'array',
          fields: [
            {
              name: 'heading',
              label: 'Section Heading',
              type: 'text',
              required: true,
            },
            {
              name: 'body',
              label: 'Section Body',
              type: 'textarea',
              required: true,
            },
          ],
        },
        {
          name: 'termsLastUpdated',
          label: 'Terms of Service Last Updated',
          type: 'text',
          defaultValue: 'September 1, 2026',
        },
        {
          name: 'termsSections',
          label: 'Terms of Service Sections',
          type: 'array',
          fields: [
            {
              name: 'heading',
              label: 'Section Heading',
              type: 'text',
              required: true,
            },
            {
              name: 'body',
              label: 'Section Body',
              type: 'textarea',
              required: true,
            },
          ],
        },
      ],
    },
  ],
}
