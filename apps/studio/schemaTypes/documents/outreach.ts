import { defineField, defineType } from 'sanity'

export const outreach = defineType({
  name: 'outreach',
  title: 'Outreach',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'theme',
      title: 'Theme',
      type: 'string',
      description: 'Main health or nutrition theme of this outreach',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'location',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'venue',
      title: 'Venue',
      type: 'string',
      description: 'Specific hall, market, school or site (optional for upcoming talks)',
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'objectives',
      title: 'Objectives',
      type: 'portableText',
    }),
    defineField({
      name: 'targetPopulation',
      title: 'Target Population',
      type: 'string',
      description: 'e.g. "Pregnant women and caregivers of children under 5"',
    }),
    defineField({
      name: 'activities',
      title: 'Activities Conducted',
      type: 'portableText',
    }),
    defineField({
      name: 'attendance',
      title: 'Total Attendance',
      type: 'number',
      validation: (r) => r.integer().min(0),
    }),
    defineField({
      name: 'screened',
      title: 'Number Screened',
      type: 'number',
      description: 'Number of people who received health screening',
      validation: (r) => r.integer().min(0),
    }),
    defineField({
      name: 'results',
      title: 'Key Results',
      type: 'array',
      of: [{ type: 'impactResult' }],
      description: 'Quantifiable outcomes from this outreach',
    }),
    defineField({
      name: 'volunteers',
      title: 'Volunteers & Professionals',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'person' }] }],
    }),
    defineField({
      name: 'partners',
      title: 'Partners & Sponsors',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'partner' }] }],
    }),
    defineField({
      name: 'outcomes',
      title: 'Key Findings / Outcomes',
      type: 'portableText',
      description: 'Notable observations or data from this outreach',
    }),
    defineField({
      name: 'followUp',
      title: 'Follow-up Activity',
      type: 'text',
      rows: 3,
      description: 'Planned or completed follow-up actions',
    }),
    defineField({
      name: 'images',
      title: 'Photographs',
      type: 'array',
      of: [{ type: 'nhecofImage' }],
    }),
    defineField({
      name: 'testimonials',
      title: 'Testimonials',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'testimonialEntry',
          title: 'Testimonial',
          fields: [
            defineField({
              name: 'quote',
              title: 'Quote',
              type: 'text',
              rows: 2,
              validation: (r) => r.required(),
            }),
            defineField({
              name: 'attribution',
              title: 'Attribution',
              type: 'string',
              validation: (r) => r.required(),
            }),
            defineField({
              name: 'consentObtained',
              title: 'Publication Consent Obtained',
              type: 'boolean',
              initialValue: false,
              validation: (r) => r.required(),
            }),
          ],
          preview: {
            prepare({ attribution, consentObtained }) {
              return {
                title: attribution || 'Anonymous',
                subtitle: consentObtained ? 'Consented' : 'Consent NOT obtained',
              }
            },
          },
        },
      ],
      description:
        'v1 deviation: Testimonials are embedded as consent-controlled objects rather than separate documents',
    }),
    defineField({
      name: 'relatedResource',
      title: 'Related Report / Resource',
      type: 'reference',
      to: [{ type: 'resource' }],
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Upcoming', value: 'upcoming' },
          { title: 'Completed', value: 'completed' },
        ],
        layout: 'radio',
      },
      initialValue: 'completed',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'verifiedByOutreachManager',
      title: 'Verified by Outreach Manager',
      type: 'boolean',
      initialValue: false,
      description: 'An outreach manager has verified all data in this record',
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      date: 'date',
      status: 'status',
      media: 'images.0',
    },
    prepare({ title, date, status, media }) {
      const statusLabel = status ? ` (${status})` : ''
      const dateLabel = date ? new Date(date).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' }) : ''
      return {
        title: title || 'Untitled Outreach',
        subtitle: `${dateLabel}${statusLabel}`,
        media,
      }
    },
  },
})
