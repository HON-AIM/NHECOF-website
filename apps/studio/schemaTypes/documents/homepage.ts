import { defineField, defineType } from 'sanity'

export const homepage = defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  fields: [
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'subheadline',
      title: 'Subheadline',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'nhecofImage',
    }),
    defineField({
      name: 'primaryCta',
      title: 'Primary Call to Action',
      type: 'cta',
    }),
    defineField({
      name: 'secondaryCta',
      title: 'Secondary Call to Action',
      type: 'cta',
    }),
    defineField({
      name: 'featuredArticle',
      title: 'Featured Article',
      type: 'reference',
      to: [{ type: 'article' }],
      description: 'Manually selected featured article (leave empty for automatic)',
    }),
    defineField({
      name: 'featuredFoodProfile',
      title: 'Featured Food Profile',
      type: 'reference',
      to: [{ type: 'foodProfile' }],
      description: 'Manually selected featured food profile',
    }),
    defineField({
      name: 'impactSection',
      title: 'Impact Section',
      type: 'object',
      fields: [
        defineField({
          name: 'heading',
          title: 'Section Heading',
          type: 'string',
          initialValue: 'Our Impact',
        }),
        defineField({
          name: 'description',
          title: 'Section Description',
          type: 'text',
          rows: 2,
        }),
      ],
      options: { collapsible: true, collapsed: true },
    }),
    defineField({
      name: 'ctaSection',
      title: 'Participation Section',
      type: 'object',
      fields: [
        defineField({
          name: 'heading',
          title: 'Section Heading',
          type: 'string',
          initialValue: 'Get Involved',
        }),
        defineField({
          name: 'description',
          title: 'Section Description',
          type: 'text',
          rows: 2,
        }),
        defineField({
          name: 'actions',
          title: 'Calls to Action',
          type: 'array',
          of: [{ type: 'cta' }],
          validation: (r) => r.max(3),
        }),
      ],
      options: { collapsible: true, collapsed: true },
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Homepage' }
    },
  },
})
