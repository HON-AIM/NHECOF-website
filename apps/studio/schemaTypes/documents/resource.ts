import { defineField, defineType } from 'sanity'

export const resource = defineType({
  name: 'resource',
  title: 'Resource',
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
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'type',
      title: 'Resource Type',
      type: 'string',
      options: {
        list: [
          { title: 'Guide', value: 'guide' },
          { title: 'Infographic', value: 'infographic' },
          { title: 'Report', value: 'report' },
          { title: 'Fact Sheet', value: 'fact-sheet' },
          { title: 'Poster', value: 'poster' },
          { title: 'Other', value: 'other' },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'file',
      title: 'File',
      type: 'file',
      description: 'Upload the resource file (PDF, image, etc.)',
    }),
    defineField({
      name: 'externalUrl',
      title: 'External URL',
      type: 'url',
      description: 'Alternatively, link to an external resource',
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail',
      type: 'nhecofImage',
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'category' }] }],
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
      name: 'language',
      title: 'Language',
      type: 'string',
      options: {
        list: [
          { title: 'English', value: 'en' },
          { title: 'Hausa', value: 'ha' },
          { title: 'Yoruba', value: 'yo' },
          { title: 'Igbo', value: 'ig' },
          { title: 'Pidgin', value: 'pcm' },
        ],
      },
      initialValue: 'en',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published Date',
      type: 'datetime',
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
    }),
  ],
  preview: {
    select: { title: 'title', type: 'type', media: 'thumbnail' },
    prepare({ title, type, media }) {
      const typeLabel = type ? type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ') : ''
      return { title, subtitle: typeLabel, media }
    },
  },
})
