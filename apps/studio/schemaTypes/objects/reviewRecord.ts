import { defineField, defineType } from 'sanity'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PreviewProps = Record<string, any>

export const reviewRecord = defineType({
  name: 'reviewRecord',
  title: 'Review Record',
  type: 'object',
  options: { collapsible: true, collapsed: true },
  fields: [
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
    }),
    defineField({
      name: 'reviewer',
      title: 'Reviewer',
      type: 'reference',
      to: [{ type: 'person' }],
      description: 'The qualified person who reviewed this content',
    }),
    defineField({
      name: 'lastReviewedAt',
      title: 'Last Reviewed',
      type: 'datetime',
    }),
    defineField({
      name: 'nextReviewAt',
      title: 'Next Review Due',
      type: 'date',
      description: 'Content should be re-reviewed by this date',
    }),
    defineField({
      name: 'reviewNotes',
      title: 'Review Notes',
      type: 'text',
      rows: 3,
      description: 'Internal notes about the review',
    }),
  ],
  preview: {
    prepare(props: PreviewProps) {
      const status = props.reviewStatus || 'draft'
      const due = props.nextReviewAt
        ? ` (due ${props.nextReviewAt})`
        : ''
      return { title: `Review: ${status}${due}` }
    },
  },
})
