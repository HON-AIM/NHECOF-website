import { defineField, defineType } from 'sanity'

export const impactMilestone = defineType({
  name: 'impactMilestone',
  title: 'Impact Milestone',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (r) => r.required(),
      description: 'e.g. "First community outreach completed" or "500 people reached"',
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'relatedOutreach',
      title: 'Related Outreach',
      type: 'reference',
      to: [{ type: 'outreach' }],
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'nhecofImage',
    }),
    defineField({
      name: 'testimonial',
      title: 'Associated Testimonial',
      type: 'object',
      fields: [
        defineField({
          name: 'quote',
          title: 'Quote',
          type: 'text',
          rows: 2,
        }),
        defineField({
          name: 'attribution',
          title: 'Attribution',
          type: 'string',
        }),
        defineField({
          name: 'consentObtained',
          title: 'Publication Consent Obtained',
          type: 'boolean',
          initialValue: false,
        }),
      ],
      options: { collapsible: true, collapsed: true },
      description:
        'v1 deviation: Testimonials are embedded as consent-controlled objects rather than separate documents',
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      initialValue: 0,
    }),
  ],
  preview: {
    select: { title: 'title', date: 'date', media: 'image' },
    prepare({ title, date, media }) {
      const dateStr = date
        ? new Date(date).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' })
        : ''
      return { title: title || 'Untitled Milestone', subtitle: dateStr, media }
    },
  },
})
