import { defineField, defineType } from 'sanity'

export const foodProfile = defineType({
  name: 'foodProfile',
  title: 'Food Profile',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Common Name',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'scientificName',
      title: 'Scientific Name',
      type: 'string',
      description: 'Botanical or scientific name where appropriate',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'aliases',
      title: 'Alternative Names',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Local names, dialect names or common abbreviations',
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
      validation: (r) => r.required().max(300),
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'nhecofImage',
    }),
    defineField({
      name: 'description',
      title: 'Description & Common Uses',
      type: 'portableText',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'nutrients',
      title: 'Key Nutrients',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'name', title: 'Nutrient', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'amount', title: 'Amount / Value', type: 'string' }),
            defineField({ name: 'note', title: 'Note', type: 'string' }),
          ],
          preview: {
            prepare({ name, amount }) {
              return { title: name, subtitle: amount }
            },
          },
        },
      ],
    }),
    defineField({
      name: 'benefits',
      title: 'Evidence-Supported Benefits',
      type: 'portableText',
      description: 'Health benefits supported by cited evidence',
    }),
    defineField({
      name: 'preparation',
      title: 'Healthy Preparation Options',
      type: 'portableText',
    }),
    defineField({
      name: 'portionContext',
      title: 'Practical Portion Context',
      type: 'text',
      rows: 3,
      description: 'Serving sizes and practical guidance',
    }),
    defineField({
      name: 'cautions',
      title: 'Cautions & Allergies',
      type: 'text',
      rows: 3,
      validation: (r) =>
        r.required().error('Cautions field is required. Enter "None known" if there are no cautions.'),
      description: 'Allergies, interactions or condition-specific concerns',
    }),
    defineField({
      name: 'myths',
      title: 'Common Myths or Misconceptions',
      type: 'portableText',
    }),
    defineField({
      name: 'mealIdeas',
      title: 'Affordable Meal Ideas',
      type: 'portableText',
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'category' }] }],
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
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'person' }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'reviewer',
      title: 'Reviewer',
      type: 'reference',
      to: [{ type: 'person' }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'featured',
      title: 'Editor’s Pick',
      type: 'boolean',
      description: 'Featured food profile on the Nutrition Hub landing page',
      initialValue: false,
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published Date',
      type: 'datetime',
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
    prepare({ title, subtitle, media }) {
      const statusLabel = subtitle
        ? subtitle.charAt(0).toUpperCase() + subtitle.slice(1).replace('-', ' ')
        : 'Draft'
      return { title, subtitle: statusLabel, media }
    },
  },
})
