import { defineField, defineType } from 'sanity'

export const redirect = defineType({
  name: 'redirect',
  title: 'Redirect',
  type: 'document',
  fields: [
    defineField({
      name: 'from',
      title: 'From Path',
      type: 'string',
      validation: (r) => r.required(),
      description: 'The old path (e.g. /old-page)',
    }),
    defineField({
      name: 'to',
      title: 'To',
      type: 'string',
      validation: (r) => r.required(),
      description: 'The destination path or URL',
    }),
    defineField({
      name: 'statusCode',
      title: 'Status Code',
      type: 'number',
      options: {
        list: [
          { title: '301 (Permanent)', value: 301 },
          { title: '302 (Temporary)', value: 302 },
        ],
        layout: 'radio',
      },
      initialValue: 301,
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'note',
      title: 'Note',
      type: 'string',
      description: 'Internal note about why this redirect exists',
    }),
  ],
  preview: {
    select: { from: 'from', to: 'to', statusCode: 'statusCode' },
    prepare({ from, to, statusCode }) {
      return { title: from || '/', subtitle: `→ ${to || '?'} (${statusCode || 301})` }
    },
  },
})
