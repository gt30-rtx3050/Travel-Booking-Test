import type { GlobalConfig } from 'payload'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: 'Homepage Layout & Content',
  admin: {
    group: 'Global Configuration',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'hero',
      label: 'Hero Section',
      type: 'group',
      fields: [
        {
          name: 'badge',
          label: 'Eyebrow Badge',
          type: 'text',
          required: true,
          defaultValue: '2026 / 2027 PRIVATE & SMALL-GROUP EXPEDITIONS',
        },
        {
          name: 'title',
          label: 'Hero Headline',
          type: 'text',
          required: true,
          defaultValue: 'Architectural Journeys Across High Alpine & Polar Horizons',
        },
        {
          name: 'subtitle',
          label: 'Hero Subheadline',
          type: 'textarea',
          required: true,
        },
        {
          type: 'row',
          fields: [
            {
              name: 'primaryCtaLabel',
              label: 'Primary CTA Label',
              type: 'text',
              required: true,
              defaultValue: 'Explore All Expeditions',
              admin: { width: '25%' },
            },
            {
              name: 'primaryCtaHref',
              label: 'Primary CTA Link',
              type: 'text',
              required: true,
              defaultValue: '/trips',
              admin: { width: '25%' },
            },
            {
              name: 'secondaryCtaLabel',
              label: 'Secondary CTA Label',
              type: 'text',
              required: true,
              defaultValue: 'Speak With a Specialist',
              admin: { width: '25%' },
            },
            {
              name: 'secondaryCtaHref',
              label: 'Secondary CTA Link',
              type: 'text',
              required: true,
              defaultValue: '/contact',
              admin: { width: '25%' },
            },
          ],
        },
        {
          name: 'heroImage',
          label: 'Hero Feature Image',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'highlights',
          label: 'Hero Trust Metrics',
          type: 'array',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'value',
                  label: 'Figure / Stat',
                  type: 'text',
                  required: true,
                  admin: { width: '40%' },
                },
                {
                  name: 'label',
                  label: 'Stat Caption',
                  type: 'text',
                  required: true,
                  admin: { width: '60%' },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'featuredTripsSection',
      label: 'Featured Expeditions Section',
      type: 'group',
      fields: [
        {
          name: 'eyebrow',
          label: 'Section Eyebrow',
          type: 'text',
          defaultValue: 'CURATED DEPARTURES',
        },
        {
          name: 'heading',
          label: 'Section Heading',
          type: 'text',
          defaultValue: 'Signature Expeditions for the Coming Season',
        },
        {
          name: 'subheading',
          label: 'Section Subheading',
          type: 'textarea',
        },
      ],
    },
    {
      name: 'whyUsSection',
      label: 'Why Celeste Section',
      type: 'group',
      fields: [
        {
          name: 'eyebrow',
          label: 'Section Eyebrow',
          type: 'text',
          defaultValue: 'THE CELESTE STANDARD',
        },
        {
          name: 'heading',
          label: 'Section Heading',
          type: 'text',
          defaultValue: 'Engineered for Depth, Calm, and Uncompromising Field Craft',
        },
        {
          name: 'subheading',
          label: 'Section Subheading',
          type: 'textarea',
        },
        {
          name: 'pillars',
          label: 'Distinction Pillars',
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
                  defaultValue: 'Compass',
                  admin: { width: '30%' },
                },
                {
                  name: 'metric',
                  label: 'Key Metric Tag',
                  type: 'text',
                  admin: { width: '30%' },
                },
                {
                  name: 'title',
                  label: 'Pillar Title',
                  type: 'text',
                  required: true,
                  admin: { width: '40%' },
                },
              ],
            },
            {
              name: 'description',
              label: 'Pillar Description',
              type: 'textarea',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'testimonialsSection',
      label: 'Testimonials Section',
      type: 'group',
      fields: [
        {
          name: 'eyebrow',
          label: 'Section Eyebrow',
          type: 'text',
          defaultValue: 'FIELD PERSPECTIVES',
        },
        {
          name: 'heading',
          label: 'Section Heading',
          type: 'text',
          defaultValue: 'Reflections from Our Guests',
        },
        {
          name: 'subheading',
          label: 'Section Subheading',
          type: 'textarea',
        },
      ],
    },
    {
      name: 'latestBlogsSection',
      label: 'Latest Journal Articles Section',
      type: 'group',
      fields: [
        {
          name: 'eyebrow',
          label: 'Section Eyebrow',
          type: 'text',
          defaultValue: 'THE EXPEDITION JOURNAL',
        },
        {
          name: 'heading',
          label: 'Section Heading',
          type: 'text',
          defaultValue: 'Field Dispatches, Route Notes & Equipment Essays',
        },
        {
          name: 'subheading',
          label: 'Section Subheading',
          type: 'textarea',
        },
      ],
    },
    {
      name: 'newsletterSection',
      label: 'Newsletter Dispatch Section',
      type: 'group',
      fields: [
        {
          name: 'eyebrow',
          label: 'Section Eyebrow',
          type: 'text',
          defaultValue: 'PRIVATE DISPATCHES',
        },
        {
          name: 'heading',
          label: 'Section Heading',
          type: 'text',
          defaultValue: 'Receive Seasonal Route Releases & Polar Ice Briefings',
        },
        {
          name: 'subheading',
          label: 'Section Subheading',
          type: 'textarea',
        },
        {
          name: 'buttonLabel',
          label: 'Submit Button Label',
          type: 'text',
          defaultValue: 'Subscribe to Dispatches',
        },
        {
          name: 'disclaimer',
          label: 'Privacy Note',
          type: 'text',
          defaultValue: 'Issued quarterly from Zürich. Zero promotional clutter; unsubscribe in one click.',
        },
      ],
    },
  ],
}
