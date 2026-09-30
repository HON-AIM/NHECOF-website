import { defineField, defineType } from 'sanity'

export const article = defineType({
  name: 'article',
  title: 'Article',
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
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
      validation: (r) => r.required().max(300),
      description: 'Brief summary shown in listings and meta description',
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'nhecofImage',
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'person' }],
      validation: (r) => r.required(),
      description: 'The person who wrote this article',
    }),
    defineField({
      name: 'reviewer',
      title: 'Reviewer',
      type: 'reference',
      to: [{ type: 'person' }],
      validation: (r) => r.required(),
      description: 'The qualified person who reviewed this content for accuracy',
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'category' }] }],
      validation: (r) => r.min(1).error('At least one category is required'),
    }),
    defineField({
      name: 'audiences',
      title: 'Target Audiences',
      type: 'array',
      of: [
        {
          type: 'string',
          options: {
            list: [
              { title: 'General Public', value: 'general' },
              { title: 'Parents & Caregivers', value: 'parents' },
              { title: 'Pregnant Women', value: 'pregnant' },
              { title: 'Young Adults', value: 'young-adults' },
              { title: 'Health Workers', value: 'health-workers' },
              { title: 'Schools', value: 'schools' },
              { title: 'Professionals', value: 'professionals' },
            ],
          },
        },
      ],
    }),
    defineField({
      name: 'keyTakeaways',
      title: 'Key Takeaways',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (r) =>
        r.min(2).error('At least 2 key takeaways are required for editorial quality'),
      description: 'Bullet-point summaries readers should remember',
    }),
    defineField({
      name: 'body',
      title: 'Article Body',
      type: 'portableText',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'references',
      title: 'References / Sources',
      type: 'array',
      of: [{ type: 'citation' }],
      validation: (r) =>
        r.min(1).error('At least one reference is required for evidence-based content'),
    }),
    defineField({
      name: 'relatedContent',
      title: 'Related Content',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [
            { type: 'article' },
            { type: 'foodProfile' },
          ],
        },
      ],
      validation: (r) => r.max(6),
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
      description: 'Show this article on the homepage',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published Date',
      type: 'datetime',
      validation: (r) => r.required(),
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
      name: 'seo',
      title: 'SEO',
      type: 'seo',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'reviewStatus',
      media: 'featuredImage',
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prepare(props: Record<string, any>) {
      const statusLabel = props.subtitle
        ? props.subtitle.charAt(0).toUpperCase() + props.subtitle.slice(1).replace('-', ' ')
        : 'Draft'
      return { title: props.title, subtitle: statusLabel, media: props.media }
    },
  },
})
