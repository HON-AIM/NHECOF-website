import { defineField, defineType } from 'sanity'

export const program = defineType({
  name: 'program',
  title: 'Programme',
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
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'targetAudience',
      title: 'Target Audience',
      type: 'string',
      description: 'Who this programme serves (e.g. "Pregnant women and caregivers of children under five")',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'portableText',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'nhecofImage',
    }),
    defineField({
      name: 'icon',
      title: 'Icon Name',
      type: 'string',
      description: 'Name of the icon component to use',
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'summary', media: 'image' },
    prepare({ title, subtitle, media }) {
      return { title, subtitle: (subtitle || '').slice(0, 80), media }
    },
  },
})
