import { defineField, defineType } from 'sanity'

export const quote = defineType({
  name: 'quote',
  title: 'Quote',
  type: 'document',
  fields: [
    defineField({
      name: 'text',
      title: 'Quote Text',
      type: 'text',
      rows: 3,
      validation: (r) =>
        r
          .required()
          .max(220)
          .error('Quote must be 220 characters or fewer'),
    }),
    defineField({
      name: 'attribution',
      title: 'Attribution',
      type: 'string',
      description: 'Author, source or "NHECOF"',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'sourceUrl',
      title: 'Source URL',
      type: 'url',
      description: 'Optional link to the original source',
    }),
    defineField({
      name: 'topic',
      title: 'Topic',
      type: 'string',
      options: {
        list: [
          { title: 'Nutrition', value: 'nutrition' },
          { title: 'Healthy Living', value: 'healthy-living' },
          { title: 'Maternal Health', value: 'maternal-health' },
          { title: 'Child Nutrition', value: 'child-nutrition' },
          { title: 'Food Safety', value: 'food-safety' },
          { title: 'General Wellness', value: 'general-wellness' },
        ],
      },
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
      description: 'Only active quotes appear on the website',
    }),
    defineField({
      name: 'reviewStatus',
      title: 'Review Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Submitted for Review', value: 'submitted' },
          { title: 'Approved', value: 'approved' },
          { title: 'Needs Revision', value: 'needs-revision' },
          { title: 'Archived', value: 'archived' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: (r) => r.required(),
      description: 'Only approved, active quotes are eligible to appear on the website',
    }),
    defineField({
      name: 'sharingPermitted',
      title: 'Social Sharing Permitted',
      type: 'boolean',
      initialValue: false,
      description: 'Can this quote be shown on social sharing cards?',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'startDate',
      title: 'Display Start Date',
      type: 'date',
      description: 'Quote is only shown from this date onwards',
    }),
    defineField({
      name: 'endDate',
      title: 'Display End Date',
      type: 'date',
      description: 'Quote stops being shown after this date. Leave empty for evergreen.',
    }),
  ],
  preview: {
    select: { text: 'text', attribution: 'attribution', active: 'active', reviewStatus: 'reviewStatus' },
    prepare({ text, attribution, active, reviewStatus }) {
      const status = reviewStatus ? reviewStatus.charAt(0).toUpperCase() + reviewStatus.slice(1).replace('-', ' ') : 'Draft'
      return {
        title: `"${(text || '').slice(0, 80)}${text && text.length > 80 ? '…' : ''}"`,
        subtitle: `${attribution || 'Unknown'} · ${status}${active ? '' : ' (inactive)'}`,
      }
    },
  },
})
