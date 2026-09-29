import type { CollectionConfig } from 'payload'

export const Trips: CollectionConfig = {
  slug: 'trips',
  labels: {
    singular: 'Expedition Trip',
    plural: 'Expedition Trips',
  },
  admin: {
    useAsTitle: 'title',
    group: 'Expeditions & Bookings',
    defaultColumns: ['title', 'destination', 'difficulty', 'duration', 'status', 'featured'],
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
          label: 'Trip Title',
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
          defaultValue: 'draft',
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
          name: 'destination',
          label: 'Destination / Region',
          type: 'text',
          required: true,
          index: true,
          admin: { width: '30%' },
        },
        {
          name: 'difficulty',
          label: 'Difficulty Level',
          type: 'select',
          required: true,
          defaultValue: 'Moderate',
          options: [
            { label: 'Easy', value: 'Easy' },
            { label: 'Moderate', value: 'Moderate' },
            { label: 'Challenging', value: 'Challenging' },
            { label: 'Strenuous', value: 'Strenuous' },
          ],
          admin: { width: '25%' },
        },
        {
          name: 'duration',
          label: 'Duration (Days)',
          type: 'number',
          required: true,
          min: 1,
          max: 60,
          admin: { width: '20%' },
        },
        {
          name: 'maxGroupSize',
          label: 'Max Group Size',
          type: 'number',
          required: true,
          min: 1,
          max: 30,
          defaultValue: 10,
          admin: { width: '15%' },
        },
        {
          name: 'featured',
          label: 'Featured Trip',
          type: 'checkbox',
          defaultValue: false,
          admin: { width: '10%' },
        },
      ],
    },
    {
      name: 'pricing',
      label: 'Pricing Configuration',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'fromPrice',
              label: 'Starting Price (Per Person)',
              type: 'number',
              required: true,
              min: 0,
              admin: { width: '50%' },
            },
            {
              name: 'currency',
              label: 'Currency',
              type: 'select',
              required: true,
              defaultValue: 'USD',
              options: [
                { label: 'USD ($)', value: 'USD' },
                { label: 'EUR (€)', value: 'EUR' },
                { label: 'GBP (£)', value: 'GBP' },
              ],
              admin: { width: '50%' },
            },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'heroImage',
          label: 'Hero Image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          admin: { width: '60%' },
        },
        {
          name: 'heroVideo',
          label: 'Hero Video URL (Optional MP4)',
          type: 'text',
          admin: { width: '40%' },
        },
      ],
    },
    {
      name: 'shortDescription',
      label: 'Short Summary (Listing Cards & Hero Lead)',
      type: 'textarea',
      required: true,
    },
    {
      name: 'overview',
      label: 'Detailed Expedition Overview',
      type: 'richText',
      required: true,
    },
    {
      name: 'highlights',
      label: 'Trip Highlights',
      labels: {
        singular: 'Highlight',
        plural: 'Highlights',
      },
      type: 'array',
      minRows: 1,
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'icon',
              label: 'Lucide Icon Name (e.g. Compass, Mountain, Sparkles, Shield, Sun, Award)',
              type: 'text',
              required: true,
              defaultValue: 'Compass',
              admin: { width: '35%' },
            },
            {
              name: 'title',
              label: 'Highlight Title',
              type: 'text',
              required: true,
              admin: { width: '65%' },
            },
          ],
        },
        {
          name: 'description',
          label: 'Short Description',
          type: 'textarea',
          required: true,
        },
      ],
    },
    {
      name: 'availability',
      label: 'Departure Dates & Availability',
      labels: {
        singular: 'Departure Window',
        plural: 'Departure Windows',
      },
      type: 'array',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'date',
              label: 'Departure Date (YYYY-MM-DD)',
              type: 'text',
              required: true,
              admin: { width: '35%' },
            },
            {
              name: 'spotsLeft',
              label: 'Spots Remaining',
              type: 'number',
              required: true,
              min: 0,
              max: 30,
              admin: { width: '30%' },
            },
            {
              name: 'priceOverride',
              label: 'Price Override (Optional)',
              type: 'number',
              min: 0,
              admin: { width: '35%' },
            },
          ],
        },
      ],
    },
    {
      name: 'itinerary',
      label: 'Day-by-Day Itinerary',
      labels: {
        singular: 'Itinerary Day',
        plural: 'Itinerary Days',
      },
      type: 'array',
      minRows: 1,
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'dayNumber',
              label: 'Day Number',
              type: 'number',
              required: true,
              min: 1,
              admin: { width: '20%' },
            },
            {
              name: 'title',
              label: 'Day Title',
              type: 'text',
              required: true,
              admin: { width: '80%' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'trekDuration',
              label: 'Trek / Activity Duration',
              type: 'text',
              required: true,
              admin: { width: '25%' },
            },
            {
              name: 'accommodation',
              label: 'Accommodation',
              type: 'text',
              required: true,
              admin: { width: '25%' },
            },
            {
              name: 'altitude',
              label: 'Max Altitude / Elevation',
              type: 'text',
              required: true,
              admin: { width: '25%' },
            },
            {
              name: 'activity',
              label: 'Primary Activity',
              type: 'text',
              required: true,
              admin: { width: '25%' },
            },
          ],
        },
        {
          name: 'image',
          label: 'Day Photograph',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'description',
          label: 'Day Narrative & Logistics',
          type: 'richText',
          required: true,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'includes',
          label: 'What Is Included',
          labels: {
            singular: 'Included Item',
            plural: 'Included Items',
          },
          type: 'array',
          admin: { width: '50%' },
          fields: [
            {
              name: 'item',
              label: 'Inclusion Detail',
              type: 'text',
              required: true,
            },
          ],
        },
        {
          name: 'excludes',
          label: 'What Is Excluded',
          labels: {
            singular: 'Excluded Item',
            plural: 'Excluded Items',
          },
          type: 'array',
          admin: { width: '50%' },
          fields: [
            {
              name: 'item',
              label: 'Exclusion Detail',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'essentialInfo',
      label: 'Essential Information (Collapsible Sections)',
      labels: {
        singular: 'Essential Info Section',
        plural: 'Essential Info Sections',
      },
      type: 'array',
      fields: [
        {
          name: 'title',
          label: 'Section Heading',
          type: 'text',
          required: true,
        },
        {
          name: 'content',
          label: 'Detailed Guidance',
          type: 'richText',
          required: true,
        },
      ],
    },
    {
      name: 'faqs',
      label: 'Frequently Asked Questions',
      labels: {
        singular: 'FAQ Item',
        plural: 'FAQ Items',
      },
      type: 'array',
      fields: [
        {
          name: 'question',
          label: 'Question',
          type: 'text',
          required: true,
        },
        {
          name: 'answer',
          label: 'Answer',
          type: 'richText',
          required: true,
        },
      ],
    },
    {
      name: 'map',
      label: 'Expedition Map & Route Coordinates',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'latitude',
              label: 'Center Latitude',
              type: 'number',
              required: true,
              admin: { width: '33%' },
            },
            {
              name: 'longitude',
              label: 'Center Longitude',
              type: 'number',
              required: true,
              admin: { width: '33%' },
            },
            {
              name: 'zoom',
              label: 'Default Zoom Level',
              type: 'number',
              required: true,
              defaultValue: 9,
              admin: { width: '34%' },
            },
          ],
        },
        {
          name: 'routeDescription',
          label: 'Route Geography & Terrain Description',
          type: 'textarea',
          required: true,
        },
        {
          name: 'markers',
          label: 'Waypoints & Camp Markers',
          labels: {
            singular: 'Route Marker',
            plural: 'Route Markers',
          },
          type: 'array',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'dayNumber',
                  label: 'Day #',
                  type: 'number',
                  admin: { width: '20%' },
                },
                {
                  name: 'title',
                  label: 'Location Name',
                  type: 'text',
                  required: true,
                  admin: { width: '40%' },
                },
                {
                  name: 'latitude',
                  label: 'Latitude',
                  type: 'number',
                  required: true,
                  admin: { width: '20%' },
                },
                {
                  name: 'longitude',
                  label: 'Longitude',
                  type: 'number',
                  required: true,
                  admin: { width: '20%' },
                },
              ],
            },
            {
              name: 'description',
              label: 'Waypoint Note',
              type: 'text',
            },
          ],
        },
      ],
    },
    {
      name: 'relatedTrips',
      label: 'Related Expeditions',
      type: 'relationship',
      relationTo: 'trips',
      hasMany: true,
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
          label: 'Open Graph Share Image',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
  ],
}
